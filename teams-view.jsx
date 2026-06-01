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

function extractAge(cellHtml) {
  if (!cellHtml) return null;
  const text = plainTextFromHtml(cellHtml);
  // Primary: ISO date e.g. "2000-05-17" → calculate exact age
  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const born = new Date(+iso[1], +iso[2] - 1, +iso[3]);
    const now = new Date();
    const age = now.getFullYear() - born.getFullYear()
      - (now < new Date(now.getFullYear(), born.getMonth(), born.getDate()) ? 1 : 0);
    if (age >= 14 && age <= 50) return age;
  }
  // Fallback: "aged N" text
  const m = text.match(/aged\s+(\d{1,2})/i);
  if (m) { const n = +m[1]; if (n >= 14 && n <= 50) return n; }
  return null;
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
        age: extractAge(cells[3]?.innerHTML || ''),
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
  const { GROUPS, GROUP_LETTERS, FIFA_RANKINGS, FIFA_POINTS = {} } = window.TEAMS_DATA;
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
      <div className="tv-table-wrap">
        <table className="tv-table">
          <thead>
            <tr>
              <th className="rank">Rank</th>
              <th className="team">Team</th>
              <th className="points">
                <span className="points-full">FIFA Points</span>
                <span className="points-short">Points</span>
              </th>
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
                  {window.TEAMS_DATA.flagUrl(team.name) && <img src={window.TEAMS_DATA.flagUrl(team.name)} alt={team.name} className="team-flag" onError={e => { e.target.style.display = 'none'; }} />}
                  <span className="team-name">{team.name}</span>
                </td>
                <td className="points">{team.points != null ? Math.round(team.points) : '-'}</td>
                <td className="group">{team.group}</td>
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
              <div className="tv-squad-team">
                {window.TEAMS_DATA.flagUrl(hoveredTeam.name) && <img src={window.TEAMS_DATA.flagUrl(hoveredTeam.name, 28)} alt={hoveredTeam.name} className="team-flag" onError={e => { e.target.style.display = 'none'; }} />}
                {hoveredTeam.name}
              </div>
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
                  <span className="tv-squad-age">{player.age ?? '-'}</span>
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
