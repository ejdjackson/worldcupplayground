// Teams view — qualified tournament field sorted by FIFA ranking
const { useEffect: useEffectT, useMemo: useMemoT, useRef: useRefT, useState: useStateT } = React;

const SQUAD_SOURCE_URL = 'https://en.wikipedia.org/w/api.php?action=parse&page=2026_FIFA_World_Cup_squads&prop=text&format=json&origin=*';

const SQUAD_NAME_ALIASES = {
  'Czechia': 'Czech Republic',
  "Côte d'Ivoire": 'Ivory Coast',
  'Türkiye': 'Turkey',
  'USA': 'United States',
  'Congo DR': 'DR Congo',
};

function plainTextFromHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('sup, .flagicon, span[style*="display:none"]').forEach(el => el.remove());
  return div.textContent.replace(/\s+/g, ' ').trim();
}

function parseSquads(html) {
  const root = document.createElement('div');
  root.innerHTML = html;
  const squads = {};
  const headings = Array.from(root.querySelectorAll('h3[id]'));

  headings.forEach((heading) => {
    const sourceName = plainTextFromHtml(heading.innerHTML);
    if (!sourceName || sourceName === 'Age' || sourceName === 'Coaches representation by country') return;

    let node = heading.parentElement ? heading.parentElement.nextElementSibling : heading.nextElementSibling;
    let table = null;
    while (node) {
      if (node.querySelector && node.querySelector('h3[id]')) break;
      if (node.matches && node.matches('table')) { table = node; break; }
      if (node.querySelector) {
        table = node.querySelector('table');
        if (table) break;
      }
      node = node.nextElementSibling;
    }
    if (!table) return;

    const players = Array.from(table.querySelectorAll('tr.nat-fs-player')).map(row => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      return {
        pos: plainTextFromHtml(cells[1]?.innerHTML || '').replace(/^\d+\s*/, ''),
        name: plainTextFromHtml(cells[2]?.innerHTML || ''),
        club: plainTextFromHtml(cells[6]?.innerHTML || ''),
      };
    }).filter(player => player.name);

    if (players.length) squads[sourceName] = players;
  });

  return squads;
}

function eloForPlayer(teamName, playerName) {
  const ratings = window.PLAYER_ELO_RATINGS || {};
  const sourceName = SQUAD_NAME_ALIASES[teamName] || teamName;
  const value = ratings[teamName]?.[playerName] ?? ratings[sourceName]?.[playerName] ?? ratings[playerName];
  if (value == null) return null;
  if (typeof value === 'object') return value.elo ?? value.rating ?? null;
  return value;
}

function TeamsView() {
  const { GROUPS, GROUP_LETTERS, FIFA_RANKINGS, FIFA_POINTS = {}, FIFA_RANKING_DATE } = window.TEAMS_DATA;
  const [hoveredTeam, setHoveredTeam] = useStateT(null);
  const [squadState, setSquadState] = useStateT({ status: 'idle', squads: {}, error: null });
  const hasRequestedSquads = useRefT(false);
  const closeTimer = useRefT(null);

  const teams = useMemoT(() => {
    return GROUP_LETTERS.flatMap(group =>
      GROUPS[group].teams.map(name => ({
        name,
        group,
        rank: FIFA_RANKINGS[name] ?? 999,
        points: FIFA_POINTS[name] ?? null,
      }))
    ).sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const topTen = teams.filter(t => t.rank <= 10).length;
  const topThirty = teams.filter(t => t.rank <= 30).length;

  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setHoveredTeam(null), 220);
  };

  useEffectT(() => () => cancelClose(), []);

  useEffectT(() => {
    if (!hoveredTeam || hasRequestedSquads.current) return;
    hasRequestedSquads.current = true;
    setSquadState(prev => ({ ...prev, status: 'loading' }));

    fetch(SQUAD_SOURCE_URL)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        const html = data?.parse?.text?.['*'] || '';
        setSquadState({ status: 'ready', squads: parseSquads(html), error: null });
      })
      .catch(err => {
        hasRequestedSquads.current = false;
        setSquadState({ status: 'error', squads: {}, error: err.message || 'Unable to load squads' });
      });
  }, [hoveredTeam]);

  const activeSquad = useMemoT(() => {
    if (!hoveredTeam) return [];
    const sourceName = SQUAD_NAME_ALIASES[hoveredTeam.name] || hoveredTeam.name;
    return squadState.squads[sourceName] || [];
  }, [hoveredTeam, squadState.squads]);

  return (
    <div className="teams-view">
      <div className="tv-meta">
        <div className="tv-summary">
          <span className="tv-num">{teams.length}</span>
          <span className="tv-num-lbl">teams ranked by FIFA world ranking</span>
        </div>
        <div className="tv-stats">
          <span><b>{topTen}</b> top 10</span>
          <span><b>{topThirty}</b> top 30</span>
          <span>Updated <b>{FIFA_RANKING_DATE}</b></span>
        </div>
      </div>

      <div className="tv-table-wrap">
        <table className="tv-table">
          <thead>
            <tr>
              <th className="rank">World rank</th>
              <th className="team">Team</th>
              <th className="points">FIFA points</th>
              <th className="group">Group</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(team => (
              <tr
                key={team.name}
                onMouseEnter={(e) => {
                  cancelClose();
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredTeam({
                    ...team,
                    x: rect.right + 14,
                    y: Math.min(rect.top, window.innerHeight - 520),
                  });
                }}
                onMouseMove={(e) => {
                  cancelClose();
                  setHoveredTeam(prev => prev && prev.name === team.name ? {
                    ...prev,
                    x: Math.min(e.clientX + 18, window.innerWidth - 380),
                    y: Math.min(e.clientY - 18, window.innerHeight - 520),
                  } : prev);
                }}
                onMouseLeave={scheduleClose}
              >
                <td className="rank">#{team.rank}</td>
                <td className="team">
                  <span className="team-name">{team.name}</span>
                </td>
                <td className="points">{team.points != null ? team.points.toFixed(2) : '-'}</td>
                <td className="group">Group {team.group}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hoveredTeam && (
        <div
          className="tv-squad-modal"
          style={{ left: hoveredTeam.x, top: Math.max(12, hoveredTeam.y) }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="tv-squad-head">
            <div>
              <div className="tv-squad-team">{hoveredTeam.name}</div>
              <div className="tv-squad-sub">Group {hoveredTeam.group} · Rank #{hoveredTeam.rank}</div>
            </div>
            <div className="tv-squad-count">{activeSquad.length || '-'}</div>
          </div>

          {squadState.status === 'loading' && (
            <div className="tv-squad-empty">Loading squad list...</div>
          )}
          {squadState.status === 'error' && (
            <div className="tv-squad-empty">Unable to load squad data.</div>
          )}
          {squadState.status === 'ready' && activeSquad.length === 0 && (
            <div className="tv-squad-empty">Squad list has not been published yet.</div>
          )}
          {activeSquad.length > 0 && (
            <div className="tv-squad-list">
              {activeSquad.map((player, index) => (
                <div className="tv-squad-player" key={`${player.name}-${index}`}>
                  <span className="tv-squad-pos">{player.pos || '-'}</span>
                  <span className="tv-squad-name">{player.name}</span>
                  <span className="tv-squad-elo">{eloForPlayer(hoveredTeam.name, player.name) ?? '-'}</span>
                  <span className="tv-squad-club">{player.club}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

window.TeamsView = TeamsView;
