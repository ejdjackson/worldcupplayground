// Groups view — 12 group tables auto-computed from predictions
const { useMemo: useMemoG, useState: useStateG } = React;

function getTeamHistoryG(teamName) {
  if (!window.SHOT_MODEL_MATCHES || !teamName) return null;
  const KEY_MAP = {
    "Côte d'Ivoire": 'Ivory Coast',
    "Cote d'Ivoire": 'Ivory Coast',
    'Türkiye': 'Turkey',
    'United States': 'USA',
  };
  const key = KEY_MAP[teamName] || teamName;
  return window.SHOT_MODEL_MATCHES[key] || null;
}

function TeamHistoryTooltipG({ teamName, pos }) {
  const history = getTeamHistoryG(teamName);
  if (!history || history.length === 0) return null;
  return ReactDOM.createPortal(
    <div className="tht" style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}>
      <div className="tht-title">{teamName}</div>
      <table className="tht-table">
        <tbody>
          {history.slice(0, 8).map((m, i) => (
            <tr key={i}>
              <td className="tht-rank">{m.opp_rank != null ? `#${m.opp_rank}` : '—'}</td>
              <td className="tht-opp">{m.opponent}</td>
              <td className={`tht-result tht-${m.result.toLowerCase()}`}>{m.result}</td>
              <td className="tht-score">{m.goals}–{m.opp_goals}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>,
    document.body
  );
}

function TeamNameG({ name }) {
  const [pos, setPos] = useStateG(null);
  const hasHistory = !!getTeamHistoryG(name);
  return (
    <span
      className={hasHistory ? 'has-history' : ''}
      onMouseEnter={e => {
        if (!hasHistory) return;
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ top: r.bottom + 6, left: r.left });
      }}
      onMouseLeave={() => setPos(null)}
    >
      {name}
      {pos && <TeamHistoryTooltipG teamName={name} pos={pos} />}
    </span>
  );
}

function GroupsView({ preds }) {
  const { GROUPS, GROUP_LETTERS } = window.TEAMS_DATA;
  const { computeGroupStandings } = window.PREDICTIONS;

  const standings = useMemoG(() => {
    const out = {};
    GROUP_LETTERS.forEach(g => { out[g] = computeGroupStandings(g, preds); });
    return out;
  }, [preds]);

  return (
    <div className="groups-view">
      <div className="gv-grid">
        {GROUP_LETTERS.map(g => (
          <GroupTable key={g} letter={g} standings={standings[g]} />
        ))}
      </div>
    </div>
  );
}

function GroupTable({ letter, standings }) {
  const { rows, allPlayed } = standings;
  return (
    <div className={`gt ${allPlayed ? 'decided' : ''}`}>
      <div className="gt-header">
        <span className="gt-letter">Group {letter}</span>
        <span className="gt-status">{allPlayed ? 'Decided' : `${rows.reduce((a, r) => a + r.P, 0) / 2} / 6`}</span>
      </div>
      <table className="gt-table">
        <thead>
          <tr>
            <th className="num">#</th>
            <th className="team">Team</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th className="pts">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const tier = i < 2 ? 'qualify' : i === 2 ? 'third' : 'out';
            return (
              <tr key={r.name} className={`tier-${tier}`}>
                <td className="num">{i + 1}</td>
                <td className="team"><TeamNameG name={r.name} /></td>
                <td>{r.P}</td>
                <td>{r.W}</td>
                <td>{r.D}</td>
                <td>{r.L}</td>
                <td>{r.GF}</td>
                <td>{r.GA}</td>
                <td className={r.GD > 0 ? 'pos' : r.GD < 0 ? 'neg' : ''}>{r.GD > 0 ? '+' : ''}{r.GD}</td>
                <td className="pts">{r.Pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

window.GroupsView = GroupsView;
