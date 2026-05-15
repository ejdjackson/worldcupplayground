// Groups view — 12 group tables auto-computed from predictions
const { useMemo: useMemoG } = React;

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
                <td className="team">{r.name}</td>
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
