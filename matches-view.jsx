// Matches view — score inputs for group + knockout matches
const { useMemo: useMemoM, useState: useStateM } = React;

function getTeamHistory(teamName) {
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

function TeamHistoryTooltip({ teamName, side }) {
  const history = getTeamHistory(teamName);
  if (!history || history.length === 0) return null;
  return (
    <div className={`tht tht-${side}`}>
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
    </div>
  );
}

function TeamName({ name, className, side }) {
  const [hovered, setHovered] = useStateM(false);
  const hasHistory = !!getTeamHistory(name);
  return (
    <span
      className={`${className}${hasHistory ? ' has-history' : ''}`}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {name}
      {hovered && hasHistory && <TeamHistoryTooltip teamName={name} side={side} />}
    </span>
  );
}

function MatchesView({ preds, setPred, clearPreds, resolutions, tzMode = 'venue', myTz = 'UTC' }) {
  const { GROUP_MATCHES } = window.TEAMS_DATA;
  const data = window.BRACKET;
  const [filter, setFilter] = useStateM('all');

  // Build a unified match list: group matches + KO matches
  const allMatches = useMemoM(() => {
    const koMatches = [
      ...data.R32.map(m => ({ ...m, stage: 'R32', isKO: true })),
      ...data.R16.map(m => ({ ...m, stage: 'R16', isKO: true })),
      ...data.QF.map(m => ({ ...m, stage: 'QF', isKO: true })),
      ...data.SF.map(m => ({ ...m, stage: 'SF', isKO: true })),
      { ...data.TP, stage: '3rd', isKO: true },
      { ...data.FINAL, stage: 'Final', isKO: true },
    ];
    return [
      ...GROUP_MATCHES.map(m => ({ ...m, stage: `G${m.group}`, isKO: false })),
      ...koMatches,
    ];
  }, [data]);

  // Filter matches
  const visible = useMemoM(() => {
    return allMatches.filter(m => {
      if (filter === 'all') return true;
      if (filter === 'predicted') return !!preds[m.id];
      if (filter === 'empty') return !preds[m.id];
      if (filter === 'group') return !m.isKO;
      if (filter === 'ko') return m.isKO;
      if (filter === 'md1') return !m.isKO && m.matchday === 1;
      if (filter === 'md2') return !m.isKO && m.matchday === 2;
      if (filter === 'md3') return !m.isKO && m.matchday === 3;
      return true;
    });
  }, [allMatches, filter, preds]);

  // Group by date for display
  const byDate = useMemoM(() => {
    const out = {};
    const KO_DAY_MAP = {
      'Sat 27 Jun': 27, 'Sun 28 Jun': 28, 'Mon 29 Jun': 29, 'Tue 30 Jun': 30,
      'Wed 1 Jul': 31, 'Thu 2 Jul': 32, 'Fri 3 Jul': 33, 'Sat 4 Jul': 34,
      'Sun 5 Jul': 35, 'Mon 6 Jul': 36, 'Tue 7 Jul': 37, 'Thu 9 Jul': 39,
      'Fri 10 Jul': 40, 'Tue 14 Jul': 44, 'Wed 15 Jul': 45, 'Sat 18 Jul': 48,
      'Sun 19 Jul': 49,
    };
    visible.forEach(m => {
      const rawDay = m.rawDay ?? KO_DAY_MAP[m.date] ?? 99;
      const kickoff = window.WC_TIME?.fmtKickoff ? window.WC_TIME.fmtKickoff(m, tzMode, myTz) : { date: m.date, time: m.time };
      const key = `${rawDay}|${kickoff.date}`;
      if (!out[key]) out[key] = { date: kickoff.date, rawDay, matches: [] };
      out[key].matches.push(m);
    });
    return Object.values(out).sort((a, b) => a.rawDay - b.rawDay);
  }, [visible, tzMode, myTz]);

  const predictedCount = useMemoM(() => Object.keys(preds).length, [preds]);
  const totalMatches = allMatches.length;

  return (
    <div className="matches-view">
      <div className="mv-toolbar">
        <div className="mv-progress">
          <div className="mv-progress-bar">
            <div className="mv-progress-fill" style={{ width: `${(predictedCount / totalMatches) * 100}%` }} />
          </div>
          <span className="mv-progress-text">
            <b>{predictedCount}</b> / {totalMatches} predicted
          </span>
        </div>

        <div className="mv-filter">
          {[
            { id: 'all', label: 'All' },
            { id: 'md1', label: 'MD1' },
            { id: 'md2', label: 'MD2' },
            { id: 'md3', label: 'MD3' },
            { id: 'empty', label: 'Empty' },
          ].map(f => (
            <button
              key={f.id}
              className={`mv-filter-btn ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >{f.label}</button>
          ))}
        </div>

        <div className="mv-actions">
          <button className="mv-action danger" onClick={() => { if (confirm('Clear all predictions?')) clearPreds(); }}>
            Clear all
          </button>
        </div>
      </div>

      <div className="mv-list">
        {byDate.map(day => (
          <div key={day.date + day.rawDay} className="mv-day">
            <div className="mv-day-header">
              <span className="mv-day-date">{day.date}</span>
              <span className="mv-day-count">{day.matches.length} {day.matches.length === 1 ? 'match' : 'matches'}</span>
            </div>
            <div className="mv-day-rows">
              {day.matches.map(m => (
                <MatchRow key={m.id} m={m} pred={preds[m.id]} setPred={setPred} resolution={resolutions[m.id]} tzMode={tzMode} myTz={myTz} />
              ))}
            </div>
          </div>
        ))}
        {byDate.length === 0 && (
          <div className="mv-empty">No matches match this filter.</div>
        )}
      </div>
    </div>
  );
}

function MatchRow({ m, pred, setPred, resolution, tzMode, myTz }) {
  // For group matches, team names come from m.team1/m.team2 (raw strings).
  // For KO matches, team names come from resolution.team1/team2 (or null if unresolved).
  const team1Name = m.isKO ? (resolution?.team1 || null) : m.team1;
  const team2Name = m.isKO ? (resolution?.team2 || null) : m.team2;
  const teamsKnown = !!team1Name && !!team2Name;

  const s1 = pred?.s1 ?? '';
  const s2 = pred?.s2 ?? '';
  const p1 = pred?.p1 ?? '';
  const p2 = pred?.p2 ?? '';

  const onScore = (which, val) => {
    const n = val === '' ? null : Math.max(0, Math.min(20, parseInt(val, 10) || 0));
    const next = {
      s1: which === 's1' ? n : (pred?.s1 ?? null),
      s2: which === 's2' ? n : (pred?.s2 ?? null),
      p1: pred?.p1 ?? null,
      p2: pred?.p2 ?? null,
    };
    // If new score is no longer a draw, drop pens
    if (next.s1 != null && next.s2 != null && next.s1 !== next.s2) {
      next.p1 = null; next.p2 = null;
    }
    if (next.s1 == null && next.s2 == null && next.p1 == null && next.p2 == null) setPred(m.id, null);
    else setPred(m.id, next);
  };
  const onPens = (which, val) => {
    const n = val === '' ? null : Math.max(0, Math.min(20, parseInt(val, 10) || 0));
    const next = {
      s1: pred?.s1 ?? null,
      s2: pred?.s2 ?? null,
      p1: which === 'p1' ? n : (pred?.p1 ?? null),
      p2: which === 'p2' ? n : (pred?.p2 ?? null),
    };
    setPred(m.id, next);
  };

  const filled = pred && pred.s1 != null && pred.s2 != null;
  let winner = null; // 1 or 2
  if (filled) {
    if (pred.s1 > pred.s2) winner = 1;
    else if (pred.s2 > pred.s1) winner = 2;
    else if (pred.p1 != null && pred.p2 != null) {
      if (pred.p1 > pred.p2) winner = 1;
      else if (pred.p2 > pred.p1) winner = 2;
    } else winner = 0; // draw (only valid for group stage)
  }

  const isDraw = filled && pred.s1 === pred.s2;
  const isKO = m.isKO;
  const stageLabel = m.stage;
  const kickoff = window.WC_TIME?.fmtKickoff ? window.WC_TIME.fmtKickoff(m, tzMode, myTz) : { date: m.date, time: m.time };
  const month = typeof m.date === 'string' && m.date.includes('Jul') ? 7 : 6;
  const temp = window.VENUE_TEMPS?.venueExpectedTemp(m.venue, month, m.time);

  const koPlaceholderName = (side) => {
    // Show parent slot description for an unresolved KO match
    if (!m.isKO) return '';
    const src = side === 1 ? m.team1.src : m.team2.src;
    if (!src) return '—';
    // R32 srcs: '1A', '2B', '3CDEF', etc.
    if (/^1[A-L]$/.test(src)) return `Winner Group ${src[1]}`;
    if (/^2[A-L]$/.test(src)) return `Runner-up Group ${src[1]}`;
    if (/^3/.test(src)) return `Best 3rd · ${src.slice(1).split('').join('/')}`;
    if (src.startsWith('Wm')) return `Winner of M${src.slice(2)}`;
    if (src.startsWith('Lm')) return `Loser of M${src.slice(2)}`;
    return src;
  };

  return (
    <div className={`mr ${filled ? 'mr-filled' : ''} ${!teamsKnown ? 'mr-pending' : ''}`}>
      <div className="mr-meta">
        <span className="mr-id">{m.id}</span>
        <span className={`mr-group ${isKO ? 'ko' : ''}`}>{stageLabel}</span>
        {!isKO && <span className="mr-md">MD{m.matchday}</span>}
        <span className="mr-time">{kickoff.time}</span>
        <span className="mr-venue">{m.venue}</span>
        {temp && <span className="mr-temp">{temp.c}°C / {temp.f}°F</span>}
      </div>
      <div className="mr-fixture">
        {team1Name
          ? <TeamName name={team1Name} side="t1" className={`mr-team mr-t1 ${winner === 1 ? 'won' : winner === 0 ? 'drew' : winner === 2 ? 'lost' : ''}`} />
          : <span className="mr-team mr-t1 placeholder">{koPlaceholderName(1)}</span>
        }
        <div className="mr-score">
          <input
            type="number"
            min="0"
            max="20"
            value={s1}
            onChange={(e) => onScore('s1', e.target.value)}
            placeholder="–"
            inputMode="numeric"
            disabled={!teamsKnown}
          />
          <span className="mr-dash">:</span>
          <input
            type="number"
            min="0"
            max="20"
            value={s2}
            onChange={(e) => onScore('s2', e.target.value)}
            placeholder="–"
            inputMode="numeric"
            disabled={!teamsKnown}
          />
        </div>
        {team2Name
          ? <TeamName name={team2Name} side="t2" className={`mr-team mr-t2 ${winner === 2 ? 'won' : winner === 0 ? 'drew' : winner === 1 ? 'lost' : ''}`} />
          : <span className="mr-team mr-t2 placeholder">{koPlaceholderName(2)}</span>
        }
      </div>

      {isKO && filled && pred.aet && !isDraw && (
        <div className="mr-result-note">After extra time</div>
      )}

      {/* Pens shoot-out for drawn KO matches */}
      {isKO && isDraw && (
        <div className="mr-pens">
          <span className="mr-pens-label">After extra time → Penalties</span>
          <div className="mr-pens-row">
            <input
              type="number" min="0" max="20"
              value={p1}
              onChange={(e) => onPens('p1', e.target.value)}
              placeholder="–"
              inputMode="numeric"
            />
            <span className="mr-dash">:</span>
            <input
              type="number" min="0" max="20"
              value={p2}
              onChange={(e) => onPens('p2', e.target.value)}
              placeholder="–"
              inputMode="numeric"
            />
          </div>
        </div>
      )}
    </div>
  );
}

window.MatchesView = MatchesView;
