// World Cup 2026 Bracket — interactive zoomable view
const { useState, useRef, useEffect, useMemo, useCallback } = React;

// ===== Timezone data =====
const VENUE_TZ = {
  'Atlanta': 'America/New_York',
  'Boston': 'America/New_York',
  'Dallas': 'America/Chicago',
  'Houston': 'America/Chicago',
  'Kansas City': 'America/Chicago',
  'Los Angeles': 'America/Los_Angeles',
  'Miami': 'America/New_York',
  'New York / NJ': 'America/New_York',
  'Philadelphia': 'America/New_York',
  'Seattle': 'America/Los_Angeles',
  'San Francisco': 'America/Los_Angeles',
  'Toronto': 'America/Toronto',
  'Vancouver': 'America/Vancouver',
  'Guadalajara': 'America/Mexico_City',
  'Mexico City': 'America/Mexico_City',
  'Monterrey': 'America/Monterrey',
};

// Tournament window is late June – mid July 2026; all US/Canada cities are on DST,
// Mexico has not observed DST since 2022. These offsets are stable for the window.
const TZ_OFFSET_H = {
  'America/New_York': -4,
  'America/Chicago': -5,
  'America/Los_Angeles': -7,
  'America/Toronto': -4,
  'America/Vancouver': -7,
  'America/Mexico_City': -6,
  'America/Monterrey': -6,
};

const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

function matchToUtc(m) {
  const tz = VENUE_TZ[m.venue] || 'America/New_York';
  const off = TZ_OFFSET_H[tz] ?? -4;
  const dm = m.date.match(/(\d+)\s+([A-Za-z]+)/);
  if (!dm) return Date.UTC(2026, 5, 27, 12, 0);
  const day = parseInt(dm[1], 10);
  const mon = MONTHS[dm[2]] ?? 5;
  const [hh, mm] = m.time.split(':').map(Number);
  return Date.UTC(2026, mon, day, hh - off, mm);
}

function fmtDate(utcMs, tz) {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: tz }).format(new Date(utcMs));
}
function fmtTime(utcMs, tz) {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(new Date(utcMs));
}

// Format a match's kickoff according to selected tz mode
function fmtKickoff(m, tzMode, myTz) {
  if (tzMode === 'venue') return { date: m.date, time: m.time };
  const target = tzMode === 'mine' ? myTz : tzMode;
  const utc = matchToUtc(m);
  return { date: fmtDate(utc, target), time: fmtTime(utc, target) };
}

window.WC_TIME = { matchToUtc, fmtKickoff };

const TZ_OPTIONS = [
  { v: 'venue', label: 'Venue local time' },
  { v: 'mine', label: 'My local time' },
  { v: '__sep__', label: '──────────' },
  { v: 'UTC', label: 'UTC · Coordinated Universal' },
  { v: 'America/Los_Angeles', label: 'Pacific · Los Angeles' },
  { v: 'America/Denver', label: 'Mountain · Denver' },
  { v: 'America/Chicago', label: 'Central · Chicago' },
  { v: 'America/New_York', label: 'Eastern · New York' },
  { v: 'America/Mexico_City', label: 'CST · Mexico City' },
  { v: 'America/Sao_Paulo', label: 'BRT · São Paulo' },
  { v: 'America/Buenos_Aires', label: 'ART · Buenos Aires' },
  { v: 'Europe/London', label: 'BST · London' },
  { v: 'Europe/Paris', label: 'CEST · Paris / Berlin / Madrid' },
  { v: 'Europe/Moscow', label: 'MSK · Moscow' },
  { v: 'Africa/Lagos', label: 'WAT · Lagos' },
  { v: 'Africa/Johannesburg', label: 'SAST · Johannesburg' },
  { v: 'Asia/Dubai', label: 'GST · Dubai' },
  { v: 'Asia/Kolkata', label: 'IST · Mumbai / Delhi' },
  { v: 'Asia/Bangkok', label: 'ICT · Bangkok' },
  { v: 'Asia/Singapore', label: 'SGT · Singapore' },
  { v: 'Asia/Tokyo', label: 'JST · Tokyo / Seoul' },
  { v: 'Australia/Sydney', label: 'AEST · Sydney' },
];

function offsetLabelFor(tz) {
  // Compute current offset for a given IANA tz on July 1, 2026
  try {
    const ref = new Date(Date.UTC(2026, 6, 1, 12, 0, 0));
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(ref);
    const off = parts.find(p => p.type === 'timeZoneName')?.value || '';
    return off.replace('GMT', 'UTC');
  } catch (e) { return ''; }
}

// ===== Layout constants =====
const MATCH_H = 84;
const GAP = 14;
const UNIT = MATCH_H + GAP; // 78
const COL_W = 240;
const FINAL_COL_W = 280;
const COL_GAP = 32;
const PAD_X = 64;
const PAD_Y = 60;
const HEADER_H = 56; // column header
const CENTER_GAP = 56;

// Column x positions (left edge inside padding)
const LEFT_SF_X = (COL_W + COL_GAP) * 3;
const COL_X = {
  L_R32: 0,
  L_R16: COL_W + COL_GAP,
  L_QF: (COL_W + COL_GAP) * 2,
  L_SF: LEFT_SF_X,
  FINAL: LEFT_SF_X + COL_W + CENTER_GAP,
  R_SF: LEFT_SF_X + COL_W + CENTER_GAP + FINAL_COL_W + CENTER_GAP,
  R_QF: LEFT_SF_X + COL_W + CENTER_GAP + FINAL_COL_W + CENTER_GAP + COL_W + COL_GAP,
  R_R16: LEFT_SF_X + COL_W + CENTER_GAP + FINAL_COL_W + CENTER_GAP + (COL_W + COL_GAP) * 2,
  R_R32: LEFT_SF_X + COL_W + CENTER_GAP + FINAL_COL_W + CENTER_GAP + (COL_W + COL_GAP) * 3,
};

const COL_RIGHT = {
  L_R32: COL_X.L_R32 + COL_W,
  L_R16: COL_X.L_R16 + COL_W,
  L_QF: COL_X.L_QF + COL_W,
  L_SF: COL_X.L_SF + COL_W,
  FINAL: COL_X.FINAL + FINAL_COL_W,
  R_SF: COL_X.R_SF + COL_W,
  R_QF: COL_X.R_QF + COL_W,
  R_R16: COL_X.R_R16 + COL_W,
  R_R32: COL_X.R_R32 + COL_W,
};

// Match top y by side-local index. Left side is the original upper half; right side is the original lower half.
const yR32 = (i) => (i % 8) * UNIT;
const yR16 = (i) => (2 * (i % 4) + 0.5) * UNIT;
const yQF  = (i) => (4 * (i % 2) + 1.5) * UNIT;
const ySF  = () => 3.5 * UNIT;
const yFinal = () => ySF();
const yThird = () => yFinal() + MATCH_H + 90;

const TOTAL_W = COL_RIGHT.R_R32;
const TOTAL_H = 8 * UNIT - GAP;
const CONTENT_H = Math.max(TOTAL_H, yThird() + MATCH_H + 16);

function colFor(round, i) {
  if (round === 'R32') return i < 8 ? COL_X.L_R32 : COL_X.R_R32;
  if (round === 'R16') return i < 4 ? COL_X.L_R16 : COL_X.R_R16;
  if (round === 'QF') return i < 2 ? COL_X.L_QF : COL_X.R_QF;
  if (round === 'SF') return i === 0 ? COL_X.L_SF : COL_X.R_SF;
  return COL_X.FINAL;
}

function yFor(round, i) {
  if (round === 'R32') return yR32(i);
  if (round === 'R16') return yR16(i);
  if (round === 'QF') return yQF(i);
  if (round === 'SF') return ySF();
  return yFinal();
}

// ===== Zoom presets =====
// Each preset defines a target rect in bracket coords (inside the .bracket padding)
const PRESETS = {
  overview: { x: -20, y: -HEADER_H - 20, w: TOTAL_W + 40, h: CONTENT_H + HEADER_H + 40, label: 'Overview' },
  'l-r32': { x: COL_X.L_R32 - 70, y: yR32(0) - HEADER_H - 70, w: COL_W + 140, h: MATCH_H + HEADER_H + 140, label: 'Left Round of 32' },
  'l-r16': { x: COL_X.L_R16 - 70, y: yR16(0) - HEADER_H - 70, w: COL_W + 140, h: MATCH_H + HEADER_H + 140, label: 'Left Round of 16' },
  'l-qf': { x: COL_X.L_QF - 70, y: yQF(0) - HEADER_H - 70, w: COL_W + 140, h: MATCH_H + HEADER_H + 140, label: 'Left Quarter-finals' },
  'l-sf': { x: COL_X.L_SF - 70, y: ySF() - HEADER_H - 70, w: COL_W + 140, h: MATCH_H + HEADER_H + 140, label: 'Left Semi-final' },
  final: { x: COL_X.FINAL - 80, y: yFinal() - HEADER_H - 30, w: FINAL_COL_W + 160, h: (yThird() + MATCH_H) - yFinal() + HEADER_H + 50, label: 'Final & 3rd Place' },
  'r-sf': { x: COL_X.R_SF - 70, y: ySF() - HEADER_H - 70, w: COL_W + 140, h: MATCH_H + HEADER_H + 140, label: 'Right Semi-final' },
  'r-qf': { x: COL_X.R_QF - 70, y: yQF(0) - HEADER_H - 70, w: COL_W + 140, h: MATCH_H + HEADER_H + 140, label: 'Right Quarter-finals' },
  'r-r16': { x: COL_X.R_R16 - 70, y: yR16(0) - HEADER_H - 70, w: COL_W + 140, h: MATCH_H + HEADER_H + 140, label: 'Right Round of 16' },
  'r-r32': { x: COL_X.R_R32 - 70, y: yR32(0) - HEADER_H - 70, w: COL_W + 140, h: MATCH_H + HEADER_H + 140, label: 'Right Round of 32' },
};

const ZOOM_BUTTONS = [
  { id: 'l-r32', label: 'R32' },
  { id: 'l-r16', label: 'R16' },
  { id: 'l-qf', label: 'QF' },
  { id: 'l-sf', label: 'SF' },
  { id: 'r-sf', label: 'SF' },
  { id: 'r-qf', label: 'QF' },
  { id: 'r-r16', label: 'R16' },
  { id: 'r-r32', label: 'R32' },
];

const ZOOM_KEYS = [{ id: 'overview' }, { id: 'final' }, ...ZOOM_BUTTONS];

// ===== Match card =====
function isKOId(id) {
  return parseInt(String(id).replace(/\D/g, ''), 10) >= 73;
}

function knockoutResultFor(match, pred) {
  if (!isKOId(match.id) || !pred || pred.s1 == null || pred.s2 == null) return null;
  const hasPens = pred.p1 != null && pred.p2 != null;
  const method = hasPens ? `AET · Pens ${pred.p1}-${pred.p2}` : pred.aet ? 'AET' : '';
  return { s1: pred.s1, s2: pred.s2, method };
}

function MatchCard({ m, compact, focused, onClick, style, dataId, tzMode, myTz, pred }) {
  const isPlaceholder = (n) => /^(Winner|Runner|Loser|3rd|Best)/.test(n);
  const kk = fmtKickoff(m, tzMode, myTz);
  const shortDate = kk.date.replace(/^[A-Za-z]+,?\s*/, '');
  const winner = m.winnerName;
  const t1Won = winner && winner === m.team1.name;
  const t2Won = winner && winner === m.team2.name;
  const result = knockoutResultFor(m, pred);
  return (
    <div
      className={`match ${compact ? 'compact' : ''} ${focused ? 'focused' : ''} ${result ? 'result-known' : ''}`}
      data-id={dataId || m.id}
      style={style}
      onClick={(e) => { e.stopPropagation(); onClick && onClick(m); }}
    >
      <div className="meta-row">
        <span className="venue"><span className="dot" />{m.venue}</span>
        <span className="date-time">{shortDate} · {kk.time}</span>
      </div>
      <div className="teams">
        <div className={`team ${t1Won ? 'won' : (winner && !t1Won) ? 'eliminated' : ''}`}>
          <span className="seed">{m.team1.src.replace(/^Wm/, 'W').replace(/^Lm/, 'L').slice(0, 4)}</span>
          <span className={`name ${isPlaceholder(m.team1.name) ? 'placeholder' : ''}`}>
            {m.team1.name}
          </span>
          {result && <span className="ko-score">{result.s1}</span>}
        </div>
        <div className={`team ${t2Won ? 'won' : (winner && !t2Won) ? 'eliminated' : ''}`}>
          <span className="seed">{m.team2.src.replace(/^Wm/, 'W').replace(/^Lm/, 'L').slice(0, 4)}</span>
          <span className={`name ${isPlaceholder(m.team2.name) ? 'placeholder' : ''}`}>
            {m.team2.name}
          </span>
          {result && <span className="ko-score">{result.s2}</span>}
        </div>
      </div>
      {result?.method && <div className="ko-method">{result.method}</div>}
    </div>
  );
}

// ===== Column header =====
function ColHeader({ label, dates, count }) {
  return (
    <div className="col-header" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: HEADER_H - 14, margin: 0 }}>
      <div className="label">{label}</div>
      <span className="dates">{dates} · {count} {count === 1 ? 'match' : 'matches'}</span>
    </div>
  );
}

// ===== Connectors =====
function Connectors({ highlightSet }) {
  // Draw paths between rounds
  const segs = [];

  // helper to push a 3-segment path A -> mid -> B (where mid x is between cols)
  function connect(ax, ay, bx, by, midX, key, hi) {
    const cls = hi ? 'highlight' : '';
    segs.push(
      <path key={key} className={cls} d={`M ${ax} ${ay} L ${midX} ${ay} L ${midX} ${by} L ${bx} ${by}`} />
    );
  }

  // Left half: original upper bracket flows right toward the final.
  for (let i = 0; i < 4; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const targetY = yR16(i) + MATCH_H / 2;
    const targetX = COL_X.L_R16;
    const sourceX = COL_RIGHT.L_R32;
    const midX = (sourceX + targetX) / 2;
    const hi = highlightSet === 'l-r16' || highlightSet === 'l-r32';
    connect(sourceX, yR32(a) + MATCH_H / 2, targetX, targetY, midX, `r32-${a}`, hi);
    connect(sourceX, yR32(b) + MATCH_H / 2, targetX, targetY, midX, `r32-${b}`, hi);
  }
  for (let i = 0; i < 2; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const targetY = yQF(i) + MATCH_H / 2;
    const targetX = COL_X.L_QF;
    const sourceX = COL_RIGHT.L_R16;
    const midX = (sourceX + targetX) / 2;
    const hi = highlightSet === 'l-qf';
    connect(sourceX, yR16(a) + MATCH_H / 2, targetX, targetY, midX, `r16-${a}`, hi);
    connect(sourceX, yR16(b) + MATCH_H / 2, targetX, targetY, midX, `r16-${b}`, hi);
  }
  {
    const targetY = ySF() + MATCH_H / 2;
    const targetX = COL_X.L_SF;
    const sourceX = COL_RIGHT.L_QF;
    const midX = (sourceX + targetX) / 2;
    const hi = highlightSet === 'l-sf';
    connect(sourceX, yQF(0) + MATCH_H / 2, targetX, targetY, midX, 'qf-0', hi);
    connect(sourceX, yQF(1) + MATCH_H / 2, targetX, targetY, midX, 'qf-1', hi);
  }
  {
    const targetY = yFinal() + MATCH_H / 2;
    const targetX = COL_X.FINAL;
    const sourceX = COL_RIGHT.L_SF;
    const midX = (sourceX + targetX) / 2;
    const hi = highlightSet === 'final';
    connect(sourceX, ySF(0) + MATCH_H / 2, targetX, targetY, midX, `sf-0`, hi);
  }

  // Right half: original lower bracket flows left toward the final.
  for (let i = 4; i < 8; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const targetY = yR16(i) + MATCH_H / 2;
    const targetX = COL_RIGHT.R_R16;
    const sourceX = COL_X.R_R32;
    const midX = (sourceX + targetX) / 2;
    const hi = highlightSet === 'r-r16' || highlightSet === 'r-r32';
    connect(sourceX, yR32(a) + MATCH_H / 2, targetX, targetY, midX, `r32-${a}`, hi);
    connect(sourceX, yR32(b) + MATCH_H / 2, targetX, targetY, midX, `r32-${b}`, hi);
  }
  for (let i = 2; i < 4; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const targetY = yQF(i) + MATCH_H / 2;
    const targetX = COL_RIGHT.R_QF;
    const sourceX = COL_X.R_R16;
    const midX = (sourceX + targetX) / 2;
    const hi = highlightSet === 'r-qf';
    connect(sourceX, yR16(a) + MATCH_H / 2, targetX, targetY, midX, `r16-${a}`, hi);
    connect(sourceX, yR16(b) + MATCH_H / 2, targetX, targetY, midX, `r16-${b}`, hi);
  }
  {
    const targetY = ySF() + MATCH_H / 2;
    const targetX = COL_RIGHT.R_SF;
    const sourceX = COL_X.R_QF;
    const midX = (sourceX + targetX) / 2;
    const hi = highlightSet === 'r-sf';
    connect(sourceX, yQF(2) + MATCH_H / 2, targetX, targetY, midX, 'qf-2', hi);
    connect(sourceX, yQF(3) + MATCH_H / 2, targetX, targetY, midX, 'qf-3', hi);
  }
  {
    const targetY = yFinal() + MATCH_H / 2;
    const targetX = COL_RIGHT.FINAL;
    const sourceX = COL_X.R_SF;
    const midX = (sourceX + targetX) / 2;
    const hi = highlightSet === 'final';
    connect(sourceX, ySF(1) + MATCH_H / 2, targetX, targetY, midX, `sf-1`, hi);
  }

  // SF losers -> 3rd place (dashed, drawn separately)
  {
    const targetY = yThird() + MATCH_H / 2;
    const leftTargetX = COL_X.FINAL;
    const leftSourceX = COL_RIGHT.L_SF;
    const leftMidX = (leftSourceX + leftTargetX) / 2 + 10;
    const rightTargetX = COL_RIGHT.FINAL;
    const rightSourceX = COL_X.R_SF;
    const rightMidX = (rightSourceX + rightTargetX) / 2 - 10;
    segs.push(
      <path
        key="3p-0"
        d={`M ${leftSourceX} ${ySF(0) + MATCH_H / 2 + 4} L ${leftMidX} ${ySF(0) + MATCH_H / 2 + 4} L ${leftMidX} ${targetY - 6} L ${leftTargetX} ${targetY - 6}`}
        strokeDasharray="3 4"
        style={{ stroke: 'var(--ink-mute)', strokeWidth: 1 }}
      />
    );
    segs.push(
      <path
        key="3p-1"
        d={`M ${rightSourceX} ${ySF(1) + MATCH_H / 2 + 4} L ${rightMidX} ${ySF(1) + MATCH_H / 2 + 4} L ${rightMidX} ${targetY + 6} L ${rightTargetX} ${targetY + 6}`}
        strokeDasharray="3 4"
        style={{ stroke: 'var(--ink-mute)', strokeWidth: 1 }}
      />
    );
  }

  return (
    <svg className="connectors" width={TOTAL_W} height={CONTENT_H} style={{ left: 0, top: 0 }}>
      {segs}
    </svg>
  );
}

// ===== Bracket layout =====
function Bracket({ data, preds = {}, onMatch, focusedId, compactMode, tzMode, myTz }) {
  const colHeaderStyle = (xLeft, w) => ({
    position: 'absolute',
    left: xLeft,
    top: -HEADER_H,
    width: w,
  });

  return (
    <div className="bracket" style={{ width: TOTAL_W, height: CONTENT_H, position: 'relative' }}>
      {/* Column headers */}
      <div className="col-header" style={colHeaderStyle(COL_X.L_R32, COL_W)}>
        <div className="label">Round of 32</div>
        <span className="dates">Left half · 8 matches</span>
      </div>
      <div className="col-header" style={colHeaderStyle(COL_X.L_R16, COL_W)}>
        <div className="label">Round of 16</div>
        <span className="dates">Left half · 4 matches</span>
      </div>
      <div className="col-header" style={colHeaderStyle(COL_X.L_QF, COL_W)}>
        <div className="label">Quarter-finals</div>
        <span className="dates">Left half · 2 matches</span>
      </div>
      <div className="col-header" style={colHeaderStyle(COL_X.L_SF, COL_W)}>
        <div className="label">Semi-finals</div>
        <span className="dates">Match 101</span>
      </div>
      <div className="col-header" style={colHeaderStyle(COL_X.FINAL, FINAL_COL_W)}>
        <div className="label">Final · 3rd Place</div>
        <span className="dates">Jul 18 & Jul 19</span>
      </div>
      <div className="col-header" style={colHeaderStyle(COL_X.R_SF, COL_W)}>
        <div className="label">Semi-finals</div>
        <span className="dates">Match 102</span>
      </div>
      <div className="col-header" style={colHeaderStyle(COL_X.R_QF, COL_W)}>
        <div className="label">Quarter-finals</div>
        <span className="dates">Right half · 2 matches</span>
      </div>
      <div className="col-header" style={colHeaderStyle(COL_X.R_R16, COL_W)}>
        <div className="label">Round of 16</div>
        <span className="dates">Right half · 4 matches</span>
      </div>
      <div className="col-header" style={colHeaderStyle(COL_X.R_R32, COL_W)}>
        <div className="label">Round of 32</div>
        <span className="dates">Right half · 8 matches</span>
      </div>

      <Connectors highlightSet={compactMode} />

      {/* R32 matches */}
      {data.R32.map((m, i) => (
        <MatchCard
          key={m.id}
          m={m}
          tzMode={tzMode}
          myTz={myTz}
          compact={false}
          focused={focusedId === m.id}
          onClick={onMatch}
          pred={preds[m.id]}
          style={{ position: 'absolute', left: colFor('R32', i), top: yFor('R32', i), width: COL_W, height: MATCH_H }}
        />
      ))}
      {/* R16 */}
      {data.R16.map((m, i) => (
        <MatchCard
          key={m.id}
          m={m}
          tzMode={tzMode}
          myTz={myTz}
          focused={focusedId === m.id}
          onClick={onMatch}
          pred={preds[m.id]}
          style={{ position: 'absolute', left: colFor('R16', i), top: yFor('R16', i), width: COL_W, height: MATCH_H }}
        />
      ))}
      {/* QF */}
      {data.QF.map((m, i) => (
        <MatchCard
          key={m.id}
          m={m}
          tzMode={tzMode}
          myTz={myTz}
          focused={focusedId === m.id}
          onClick={onMatch}
          pred={preds[m.id]}
          style={{ position: 'absolute', left: colFor('QF', i), top: yFor('QF', i), width: COL_W, height: MATCH_H }}
        />
      ))}
      {/* SF */}
      {data.SF.map((m, i) => (
        <MatchCard
          key={m.id}
          m={m}
          tzMode={tzMode}
          myTz={myTz}
          focused={focusedId === m.id}
          onClick={onMatch}
          pred={preds[m.id]}
          style={{ position: 'absolute', left: colFor('SF', i), top: yFor('SF', i), width: COL_W, height: MATCH_H }}
        />
      ))}
      {/* Final */}
      {(() => {
        const kkF = fmtKickoff(data.FINAL, tzMode, myTz);
        const dF = kkF.date.replace(/^[A-Za-z]+,?\s*/, '');
        const isPlaceholder = (n) => /^(Winner|Runner|Loser|3rd|Best)/.test(n);
        const w = data.FINAL.winnerName;
        const t1W = w && w === data.FINAL.team1.name;
        const t2W = w && w === data.FINAL.team2.name;
        const result = knockoutResultFor(data.FINAL, preds[data.FINAL.id]);
        return (
      <div
        className={`match final ${focusedId === data.FINAL.id ? 'focused' : ''} ${result ? 'result-known' : ''}`}
        data-id={data.FINAL.id}
        style={{ position: 'absolute', left: COL_X.FINAL, top: yFinal(), width: FINAL_COL_W, height: MATCH_H + 16 }}
        onClick={() => onMatch(data.FINAL)}
      >
        <div className="meta-row">
          <span className="venue"><span className="dot" style={{ background: 'var(--amber)' }} />{data.FINAL.venue} · MetLife Stadium</span>
          <span className="date-time" style={{ color: 'var(--amber)' }}>{dF} · {kkF.time}</span>
        </div>
        <div className="teams">
          <div className={`team ${t1W ? 'won' : (w && !t1W) ? 'eliminated' : ''}`}>
            <span className="seed" style={{ background: 'rgba(245,165,36,0.18)', color: 'var(--amber)' }}>W101</span>
            <span className={`name ${isPlaceholder(data.FINAL.team1.name) ? 'placeholder' : ''}`}>{data.FINAL.team1.name}</span>
            {result && <span className="ko-score">{result.s1}</span>}
          </div>
          <div className={`team ${t2W ? 'won' : (w && !t2W) ? 'eliminated' : ''}`}>
            <span className="seed" style={{ background: 'rgba(245,165,36,0.18)', color: 'var(--amber)' }}>W102</span>
            <span className={`name ${isPlaceholder(data.FINAL.team2.name) ? 'placeholder' : ''}`}>{data.FINAL.team2.name}</span>
            {result && <span className="ko-score">{result.s2}</span>}
          </div>
        </div>
        {result?.method && <div className="ko-method">{result.method}</div>}
      </div>
        );
      })()}

      {/* Third place */}
      {(() => {
        const kkT = fmtKickoff(data.TP, tzMode, myTz);
        const dT = kkT.date.replace(/^[A-Za-z]+,?\s*/, '');
        const isPlaceholder = (n) => /^(Winner|Runner|Loser|3rd|Best)/.test(n);
        const w = data.TP.winnerName;
        const t1W = w && w === data.TP.team1.name;
        const t2W = w && w === data.TP.team2.name;
        const result = knockoutResultFor(data.TP, preds[data.TP.id]);
        return (
      <div
        className={`match third ${focusedId === data.TP.id ? 'focused' : ''} ${result ? 'result-known' : ''}`}
        data-id={data.TP.id}
        style={{
          position: 'absolute', left: COL_X.FINAL, top: yThird(), width: FINAL_COL_W, height: MATCH_H + 16,
          border: '1px dashed var(--line-2)', background: 'transparent'
        }}
        onClick={() => onMatch(data.TP)}
      >
        <div className="meta-row">
          <span className="venue"><span className="dot" />3rd Place · {data.TP.venue}</span>
          <span className="date-time">{dT} · {kkT.time}</span>
        </div>
        <div className="teams">
          <div className={`team ${t1W ? 'won' : (w && !t1W) ? 'eliminated' : ''}`}>
            <span className="seed">L101</span>
            <span className={`name ${isPlaceholder(data.TP.team1.name) ? 'placeholder' : ''}`}>{data.TP.team1.name}</span>
            {result && <span className="ko-score">{result.s1}</span>}
          </div>
          <div className={`team ${t2W ? 'won' : (w && !t2W) ? 'eliminated' : ''}`}>
            <span className="seed">L102</span>
            <span className={`name ${isPlaceholder(data.TP.team2.name) ? 'placeholder' : ''}`}>{data.TP.team2.name}</span>
            {result && <span className="ko-score">{result.s2}</span>}
          </div>
        </div>
        {result?.method && <div className="ko-method">{result.method}</div>}
      </div>
        );
      })()}
    </div>
  );
}

// ===== Bracket View (the actual bracket pane) =====
function BracketView({ preds, setPred, tzMode, myTz, zoom, setZoom, resolutions }) {
  const data = window.BRACKET;

  // Override team names for KO matches using the resolutions map
  const resolvedData = useMemo(() => {
    const apply = (m) => {
      const r = resolutions[m.id];
      if (!r) return m;
      return {
        ...m,
        team1: r.team1 ? { ...m.team1, name: r.team1 } : m.team1,
        team2: r.team2 ? { ...m.team2, name: r.team2 } : m.team2,
        winnerName: r.winner,
      };
    };
    return {
      ...data,
      R32: data.R32.map(apply),
      R16: data.R16.map(apply),
      QF: data.QF.map(apply),
      SF: data.SF.map(apply),
      TP: apply(data.TP),
      FINAL: apply(data.FINAL),
    };
  }, [data, resolutions]);

  const [focusedMatch, setFocusedMatch] = useState(null);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const viewportRef = useRef(null);
  const isDragging = useRef(false);
  const activePointerId = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const pointerStart = useRef({ x: 0, y: 0 });
  const suppressClick = useRef(false);

  const computeTransform = useCallback((presetId) => {
    const vp = viewportRef.current;
    if (!vp) return { scale: 1, x: 0, y: 0 };
    const preset = PRESETS[presetId];
    const vw = vp.clientWidth;
    const vh = vp.clientHeight;
    const rectX = preset.x + PAD_X;
    const rectY = preset.y + PAD_Y + HEADER_H;
    const rectW = preset.w;
    const rectH = preset.h;
    const scale = Math.min(vw / rectW, vh / rectH) * 0.95;
    const cx = rectX + rectW / 2;
    const cy = rectY + rectH / 2;
    const x = vw / 2 - cx * scale;
    const y = vh / 2 - cy * scale;
    return { scale, x, y };
  }, []);

  useEffect(() => {
    const update = () => {
      const t = computeTransform(zoom);
      setTransform(t);
      setPanOffset({ x: 0, y: 0 });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [zoom, computeTransform]);

  const isInteractiveTarget = (target) => (
    target.closest('.side-panel') ||
    target.closest('.zoom-btn') ||
    target.closest('.tab') ||
    target.closest('.run-sim-btn') ||
    target.closest('.tz-picker') ||
    target.closest('.theme-picker') ||
    target.closest('button') ||
    target.closest('input') ||
    target.closest('select')
  );

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (isInteractiveTarget(e.target)) return;
    isDragging.current = true;
    activePointerId.current = e.pointerId;
    setIsPanning(true);
    dragStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    pointerStart.current = { x: e.clientX, y: e.clientY };
    suppressClick.current = false;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.currentTarget.style.cursor = 'grabbing';
  };

  const onPointerMove = (e) => {
    if (!isDragging.current || e.pointerId !== activePointerId.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    if (Math.hypot(dx, dy) > 4) suppressClick.current = true;
    setPanOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const endPointerDrag = (e) => {
    if (e && activePointerId.current != null && e.pointerId !== activePointerId.current) return;
    isDragging.current = false;
    activePointerId.current = null;
    setIsPanning(false);
    e?.currentTarget?.releasePointerCapture?.(e.pointerId);
    if (viewportRef.current) viewportRef.current.style.cursor = 'grab';
  };

  const onViewportClickCapture = (e) => {
    if (!suppressClick.current) return;
    e.preventDefault();
    e.stopPropagation();
    suppressClick.current = false;
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
      if (e.key === 'Escape') { setFocusedMatch(null); return; }
      const idx = e.key === '0' ? 10 : parseInt(e.key, 10);
      if (idx >= 1 && idx <= ZOOM_KEYS.length) setZoom(ZOOM_KEYS[idx - 1].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const stageStyle = {
    transform: `translate(${transform.x + panOffset.x}px, ${transform.y + panOffset.y}px) scale(${transform.scale})`,
  };

  return (
    <div
      className="viewport"
      ref={viewportRef}
      style={{ cursor: 'grab' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointerDrag}
      onPointerCancel={endPointerDrag}
      onClickCapture={onViewportClickCapture}
      onClick={(e) => { if (!e.target.closest('.match')) setFocusedMatch(null); }}
    >
      <div className={`stage ${isPanning ? 'panning' : ''}`} style={stageStyle}>
        <div style={{ padding: `${PAD_Y + HEADER_H}px ${PAD_X}px ${PAD_Y}px ${PAD_X}px`, position: 'relative' }}>
          <Bracket data={resolvedData} preds={preds} onMatch={setFocusedMatch} focusedId={focusedMatch?.id} compactMode={zoom} tzMode={tzMode} myTz={myTz} />
        </div>
      </div>

      {focusedMatch && <SidePanel match={focusedMatch} onClose={() => setFocusedMatch(null)} tzMode={tzMode} myTz={myTz} pred={preds[focusedMatch.id]} setPred={setPred} teamsKnown={!!(focusedMatch.team1?.name && focusedMatch.team2?.name && !/^(Winner|Runner|Loser|3rd|Best)/.test(focusedMatch.team1.name) && !/^(Winner|Runner|Loser|3rd|Best)/.test(focusedMatch.team2.name))} />}

    </div>
  );
}

// ===== App shell with tabs =====
const TABS = [
  { id: 'teams', label: 'Teams' },
  { id: 'matches', label: 'Matches' },
  { id: 'groups', label: 'Groups' },
  { id: 'bracket', label: 'Bracket' },
];

function SimulationBuilder({ config, setConfig, resetConfig, onRun, onBack }) {
  const updatePoisson = (key, value) => {
    setConfig(prev => ({
      ...prev,
      poisson: {
        ...prev.poisson,
        [key]: value,
      },
    }));
  };
  const setNumber = (key, value) => {
    updatePoisson(key, value === '' ? '' : Number(value));
  };
  const poisson = config.poisson;
  const shotModel = config.shotModel;
  const updateShotModel = (key, value) => {
    setConfig(prev => ({
      ...prev,
      shotModel: {
        ...prev.shotModel,
        [key]: value === '' ? '' : Number(value),
      },
    }));
  };
  const [shotSort, setShotSort] = useState({ key: 'group', dir: 'asc' });
  const shotColumns = [
    { key: 'group', label: 'Group', type: 'text' },
    { key: 'name', label: 'Team', type: 'text' },
    { key: 'team_shots_per_game', label: 'Shots', type: 'number' },
    { key: 'team_accuracy', label: 'On Target', type: 'number' },
    { key: 'team_conversion', label: 'Scored', type: 'number' },
    { key: 'opponent_shots_allowed', label: 'Opp shots', type: 'number' },
    { key: 'opponent_accuracy_allowed', label: 'Opp on target', type: 'number' },
    { key: 'opponent_conversion_allowed', label: 'Opp scored', type: 'number' },
    { key: 'source', label: 'Source', type: 'text' },
  ];
  const onShotSort = (key) => {
    setShotSort(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  };
  const shotRows = useMemo(() => {
    if (!window.SHOT_MODEL_DATA) return [];
    const { GROUPS, GROUP_LETTERS } = window.TEAMS_DATA;
    const rows = GROUP_LETTERS.flatMap(group =>
      GROUPS[group].teams.map(name => {
        const alias = window.SHOT_MODEL_DATA.aliases[name];
        const sourceName = alias || name;
        const isFallback = !window.SHOT_MODEL_DATA.rows[sourceName];
        const params = window.SHOT_MODEL_DATA.paramsFor(name);
        return { name, group, sourceName, source: 'Last 10 vs FIFA top 50', isFallback, ...params };
      })
    );
    const col = shotColumns.find(column => column.key === shotSort.key) || shotColumns[0];
    rows.sort((a, b) => {
      let result;
      if (col.type === 'number') {
        result = (a[col.key] ?? 0) - (b[col.key] ?? 0);
      } else {
        result = String(a[col.key] ?? '').localeCompare(String(b[col.key] ?? ''));
      }
      if (result === 0) result = a.name.localeCompare(b.name);
      return shotSort.dir === 'asc' ? result : -result;
    });
    return rows;
  }, [shotSort]);

  return (
    <div className="tab-pane scroll sim-builder">
      <div className="sim-shell">
        <div className="sim-head">
          <div>
            <div className="sim-kicker">Simulation Builder</div>
            <h1>Choose a match model</h1>
          </div>
          <div className="sim-actions">
            <button className="sim-secondary-btn" onClick={onBack}>Back to Bracket</button>
            <button className="run-sim-btn" onClick={onRun}>Run Simulation</button>
          </div>
        </div>

        <div className="model-grid">
          <button
            className={`model-option ${config.model === 'coinFlip' ? 'active' : ''}`}
            onClick={() => setConfig(prev => ({ ...prev, model: 'coinFlip' }))}
          >
            <span>Coin flip</span>
            <b>Every fixture is 50/50. The winner gets a plausible football scoreline.</b>
          </button>
          <button
            className={`model-option ${config.model === 'poisson' ? 'active' : ''}`}
            onClick={() => setConfig(prev => ({ ...prev, model: 'poisson' }))}
          >
            <span>Poisson model of goals scored by team rating</span>
            <b>Goals are sampled from each team rating, with stronger teams given a higher expected goal rate.</b>
          </button>
          <button
            className={`model-option ${config.model === 'shotModel' ? 'active' : ''}`}
            onClick={() => setConfig(prev => ({ ...prev, model: 'shotModel' }))}
          >
            <span>Three-stage shot model</span>
            <b>Shots, shots on target, and goals are sampled from each team's attacking rates and the opponent's defensive rates.</b>
          </button>
        </div>

        {config.model === 'shotModel' && (
          <section className="sim-panel">
            <div className="sim-panel-head">
              <div>
                <h2>Shot model inputs</h2>
                <p>This model uses shots per game, shot accuracy, conversion, and the matching opponent-allowed rates. Missing teams use global averages from the imported CSV.</p>
              </div>
            </div>
            <div className="param-grid shot-weight-grid">
              <label className="param-field">
                <span>Defense weighting</span>
                <input
                  type="number"
                  min="0.3"
                  max="0.7"
                  step="0.05"
                  value={shotModel.defenseWeighting}
                  onChange={(e) => updateShotModel('defenseWeighting', e.target.value)}
                />
                <small>0 uses team shot volume; 1 uses opponent shots allowed. Default 0.5.</small>
              </label>
              <label className="param-field">
                <span>Shot skill weighting</span>
                <input
                  type="number"
                  min="0.3"
                  max="0.7"
                  step="0.05"
                  value={shotModel.shotSkillWeighting}
                  onChange={(e) => updateShotModel('shotSkillWeighting', e.target.value)}
                />
                <small>0 uses opponent on-target allowed; 1 uses team on-target rate. Default 0.5.</small>
              </label>
              <label className="param-field">
                <span>Goalkeeper weighting</span>
                <input
                  type="number"
                  min="0.3"
                  max="0.7"
                  step="0.05"
                  value={shotModel.goalkeeperWeighting}
                  onChange={(e) => updateShotModel('goalkeeperWeighting', e.target.value)}
                />
                <small>0 uses team scoring rate; 1 uses opponent scored-allowed rate. Default 0.5.</small>
              </label>
            </div>
            <div className="shot-table-wrap">
              <table className="shot-table">
                <thead>
                  <tr>
                    {shotColumns.map(column => (
                      <th key={column.key} className={column.key === 'name' ? 'team' : ''}>
                        <button type="button" onClick={() => onShotSort(column.key)}>
                          {column.label}
                          <span>{shotSort.key === column.key ? (shotSort.dir === 'asc' ? '^' : 'v') : ''}</span>
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shotRows.map(row => (
                    <tr key={row.name}>
                      <td>{row.group}</td>
                      <td className="team">{row.name}</td>
                      <td>{row.team_shots_per_game.toFixed(1)}</td>
                      <td>{(row.team_accuracy * 100).toFixed(1)}%</td>
                      <td>{(row.team_conversion * 100).toFixed(1)}%</td>
                      <td>{row.opponent_shots_allowed.toFixed(1)}</td>
                      <td>{(row.opponent_accuracy_allowed * 100).toFixed(1)}%</td>
                      <td>{(row.opponent_conversion_allowed * 100).toFixed(1)}%</td>
                      <td>{row.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className={`sim-panel ${config.model !== 'poisson' ? 'muted' : ''}`}>
          <div className="sim-panel-head">
            <div>
              <h2>Poisson settings</h2>
              <p>The current model turns FIFA team strength into expected goals, then samples a score for each team.</p>
            </div>
            <button className="sim-secondary-btn" onClick={resetConfig}>Reset defaults</button>
          </div>

          <div className="param-grid">
            <label className="param-field wide">
              <span>Rating input</span>
              <select
                value={poisson.ratingSource}
                onChange={(e) => updatePoisson('ratingSource', e.target.value)}
              >
                <option value="fifaPoints">FIFA points</option>
                <option value="fifaRankings">FIFA ranking position</option>
              </select>
              <small>FIFA points are the richer input. Ranking position is converted to a rough strength score.</small>
            </label>

            <label className="param-field">
              <span>Base goals</span>
              <input
                type="number"
                min="0.2"
                max="6"
                step="0.1"
                value={poisson.baseRate}
                onChange={(e) => setNumber('baseRate', e.target.value)}
              />
              <small>Expected goals for an evenly matched team over 90 minutes.</small>
            </label>

            <label className="param-field">
              <span>Rating sensitivity</span>
              <input
                type="number"
                min="0"
                max="6"
                step="0.1"
                value={poisson.sensitivity}
                onChange={(e) => setNumber('sensitivity', e.target.value)}
              />
              <small>Higher values make favourites more dominant.</small>
            </label>

          </div>
        </section>
      </div>
    </div>
  );
}

function MonteCarloView({ simulationConfig, onBack }) {
  const { GROUPS, GROUP_LETTERS, FIFA_RANKINGS, FIFA_POINTS = {} } = window.TEAMS_DATA;
  const teams = useMemo(() => (
    GROUP_LETTERS.flatMap(group =>
      GROUPS[group].teams.map(name => ({
        name,
        group,
        rank: FIFA_RANKINGS[name] ?? 999,
        points: FIFA_POINTS[name] ?? null,
      }))
    ).sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.name.localeCompare(b.name);
    })
  ), []);
  const initialWins = useMemo(() => Object.fromEntries(teams.map(team => [team.name, 0])), [teams]);
  const [simulationCount, setSimulationCount] = useState(1000);
  const [runsCompleted, setRunsCompleted] = useState(0);
  const [wins, setWins] = useState(initialWins);
  const [groupStageDraws, setGroupStageDraws] = useState(0);
  const [running, setRunning] = useState(false);
  const runTokenRef = useRef(0);

  useEffect(() => {
    setWins(initialWins);
    setRunsCompleted(0);
    setGroupStageDraws(0);
    setRunning(false);
  }, [initialWins]);

  useEffect(() => () => { runTokenRef.current += 1; }, []);

  const runMonteCarlo = () => {
    const total = Math.max(1, Math.min(100000, parseInt(simulationCount, 10) || 1));
    const nextWins = { ...initialWins };
    let completed = 0;
    let completedGroupStageDraws = 0;
    const runToken = runTokenRef.current + 1;
    runTokenRef.current = runToken;
    setWins(nextWins);
    setRunsCompleted(0);
    setGroupStageDraws(0);
    setRunning(true);

    const runBatch = () => {
      if (runTokenRef.current !== runToken) return;
      const batchSize = Math.min(100, total - completed);
      for (let i = 0; i < batchSize; i++) {
        const preds = window.PREDICTIONS.simulateTournamentPredictions(simulationConfig);
        const winner = window.PREDICTIONS.tournamentWinnerFromPredictions(preds);
        if (winner && nextWins[winner] != null) nextWins[winner] += 1;
        window.TEAMS_DATA.GROUP_MATCHES.forEach(match => {
          const pred = preds[match.id];
          if (pred && pred.s1 === pred.s2) completedGroupStageDraws += 1;
        });
        completed++;
      }
      setWins({ ...nextWins });
      setRunsCompleted(completed);
      setGroupStageDraws(completedGroupStageDraws);
      if (completed < total) {
        window.setTimeout(runBatch, 0);
      } else {
        setRunning(false);
      }
    };

    window.setTimeout(runBatch, 0);
  };

  const formatFractionalOdds = (impliedDecimalOdds) => {
    if (!impliedDecimalOdds || !Number.isFinite(impliedDecimalOdds)) return '-';
    const profitOdds = Math.max(0, impliedDecimalOdds - 1);
    return `${Math.max(1, Math.round(profitOdds))}/1`;
  };

  const rows = useMemo(() => teams.map(team => {
    const teamWins = wins[team.name] || 0;
    const probability = runsCompleted > 0 ? teamWins / runsCompleted : 0;
    return {
      ...team,
      wins: teamWins,
      probability,
      odds: probability > 0 ? 1 / probability : null,
    };
  }).sort((a, b) => {
    if (runsCompleted > 0 && b.probability !== a.probability) return b.probability - a.probability;
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.name.localeCompare(b.name);
  }), [teams, wins, runsCompleted]);

  return (
    <div className="tab-pane scroll mc-view">
      <div className="mc-shell">
        <div className="sim-head">
          <div>
            <div className="sim-kicker">Monte Carlo</div>
            <h1>Tournament win simulation</h1>
          </div>
          <div className="sim-actions">
            <button className="sim-secondary-btn" onClick={onBack}>Back to Bracket</button>
          </div>
        </div>

        <div className="mc-controls">
          <label className="param-field">
            <span>Number of simulations</span>
            <input
              type="number"
              min="1"
              max="100000"
              step="100"
              value={simulationCount}
              onChange={(e) => setSimulationCount(e.target.value)}
              disabled={running}
            />
          </label>
          <button className="run-sim-btn" onClick={runMonteCarlo} disabled={running}>
            {running ? 'Running...' : 'Run Monte Carlo Simulation'}
          </button>
          <div className="mc-metric">
            <span>Average Group Stage Draws</span>
            <b>{runsCompleted > 0 ? `${((groupStageDraws / (runsCompleted * window.TEAMS_DATA.GROUP_MATCHES.length)) * 100).toFixed(1)}%` : '-'}</b>
          </div>
          <div className="mc-progress">
            <span>{runsCompleted.toLocaleString()}</span>
            <b>/ {(parseInt(simulationCount, 10) || 0).toLocaleString()}</b>
          </div>
        </div>

        <div className="mc-table-wrap">
          <table className="mc-table">
            <thead>
              <tr>
                <th className="rank">Rank</th>
                <th className="team">Team</th>
                <th>Group</th>
                <th>Wins</th>
                <th>Win probability</th>
                <th>Implied odds</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(team => (
                <tr key={team.name}>
                  <td className="rank">#{team.rank}</td>
                  <td className="team">{team.name}</td>
                  <td>{team.group}</td>
                  <td>{team.wins.toLocaleString()}</td>
                  <td>{runsCompleted > 0 ? `${(team.probability * 100).toFixed(2)}%` : '-'}</td>
                  <td>{formatFractionalOdds(team.odds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function App() {
  const myTz = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return 'UTC'; }
  }, []);
  const [tab, setTab] = useState(() => {
    try { return localStorage.getItem('wc26-tab') || 'bracket'; } catch (e) { return 'bracket'; }
  });
  const [zoom, setZoom] = useState('overview');
  const [tzMode, setTzMode] = useState(() => {
    try { return localStorage.getItem('wc26-tz') || 'venue'; } catch (e) { return 'venue'; }
  });
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('wc26-theme');
      return saved === 'ivory' ? 'ivory' : 'midnight';
    } catch (e) { return 'midnight'; }
  });

  useEffect(() => { try { localStorage.setItem('wc26-tab', tab); } catch (e) {} }, [tab]);
  useEffect(() => { try { localStorage.setItem('wc26-tz', tzMode); } catch (e) {} }, [tzMode]);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('wc26-theme', theme); } catch (e) {}
  }, [theme]);

  const { preds, set: setPred, clear: clearPreds, simulateTournament } = window.PREDICTIONS.usePredictions();
  const { config: simulationConfig, setConfig: setSimulationConfig, resetConfig: resetSimulationConfig } = window.PREDICTIONS.useSimulationConfig();

  // Compute group standings + KO resolutions once; share across all views
  const standings = useMemo(() => window.PREDICTIONS.computeAllStandings(preds), [preds]);
  const thirdRanks = useMemo(() => window.PREDICTIONS.rankThirdPlaced(standings), [standings]);
  const resolutions = useMemo(() => window.PREDICTIONS.resolveAllKOTeams(preds, standings, thirdRanks), [preds, standings, thirdRanks]);

  return (
    <div className="app">
      <header className="bar">
        <div className="brand">
          <div className="mark" />
          <div>
            <div className="title">World Cup 2026</div>
            <div className="sub">USA · Canada · Mexico</div>
          </div>
        </div>

        <nav className="tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <button
          className="build-sim-btn"
          onClick={() => setTab('simulation')}
        >
          Build Simulation
        </button>
        <button
          className="run-sim-btn"
          onClick={() => simulateTournament(simulationConfig)}
        >
          Run Simulation
        </button>
        <button
          className="build-sim-btn"
          onClick={() => setTab('monteCarlo')}
        >
          Monte Carlo
        </button>

        <TZPicker value={tzMode} onChange={setTzMode} myTz={myTz} />
        <ThemePicker value={theme} onChange={setTheme} />

        {tab === 'bracket' && (
          <>
            <div className="zoom-quick">
              <button
                className={`zoom-btn overview-btn ${zoom === 'overview' ? 'active' : ''}`}
                onClick={() => setZoom('overview')}
                title="Press 1"
              >
                Overview
              </button>
              <button
                className={`zoom-btn overview-btn ${zoom === 'final' ? 'active' : ''}`}
                onClick={() => setZoom('final')}
                title="Press 2"
              >
                Final
              </button>
            </div>
            <div className="zoom-controls">
              {ZOOM_BUTTONS.map((b, i) => (
                <button
                  key={b.id}
                  className={`zoom-btn ${zoom === b.id ? 'active' : ''}`}
                  onClick={() => setZoom(b.id)}
                  title={`Press ${i + 3 === 10 ? 0 : i + 3}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </>
        )}
      </header>

      {tab === 'bracket' && (
        <BracketView preds={preds} setPred={setPred} tzMode={tzMode} myTz={myTz} zoom={zoom} setZoom={setZoom} resolutions={resolutions} />
      )}
      {tab === 'simulation' && (
        <SimulationBuilder
          config={simulationConfig}
          setConfig={setSimulationConfig}
          resetConfig={resetSimulationConfig}
          onRun={() => {
            simulateTournament(simulationConfig);
            setTab('bracket');
          }}
          onBack={() => setTab('bracket')}
        />
      )}
      {tab === 'monteCarlo' && (
        <MonteCarloView
          simulationConfig={simulationConfig}
          onBack={() => setTab('bracket')}
        />
      )}
      {tab === 'groups' && (
        <div className="tab-pane scroll">
          {React.createElement(window.GroupsView, { preds })}
        </div>
      )}
      {tab === 'teams' && (
        <div className="tab-pane scroll">
          {React.createElement(window.TeamsView)}
        </div>
      )}
      {tab === 'matches' && (
        <div className="tab-pane scroll">
          {React.createElement(window.MatchesView, { preds, setPred, clearPreds, resolutions, tzMode, myTz })}
        </div>
      )}
    </div>
  );
}

function SidePanel({ match, onClose, tzMode, myTz, pred, setPred, teamsKnown }) {
  const venueK = { date: match.date, time: match.time };
  const selK = fmtKickoff(match, tzMode, myTz);
  const showBoth = tzMode !== 'venue';
  const tzLabel = tzMode === 'mine' ? `${myTz}` : tzMode;

  const s1 = pred?.s1 ?? '';
  const s2 = pred?.s2 ?? '';
  const p1 = pred?.p1 ?? '';
  const p2 = pred?.p2 ?? '';
  const isDraw = pred && pred.s1 != null && pred.s2 != null && pred.s1 === pred.s2;

  // Group matches: M1–M72. Knockout: M73+
  const isKO = isKOId(match.id);
  const result = knockoutResultFor(match, pred);

  const onScore = (which, val) => {
    const n = val === '' ? null : Math.max(0, Math.min(20, parseInt(val, 10) || 0));
    const next = {
      s1: which === 's1' ? n : (pred?.s1 ?? null),
      s2: which === 's2' ? n : (pred?.s2 ?? null),
      p1: pred?.p1 ?? null,
      p2: pred?.p2 ?? null,
    };
    if (next.s1 != null && next.s2 != null && next.s1 !== next.s2) {
      next.p1 = null; next.p2 = null;
    }
    if (next.s1 == null && next.s2 == null && next.p1 == null && next.p2 == null) setPred(match.id, null);
    else setPred(match.id, next);
  };
  const onPens = (which, val) => {
    const n = val === '' ? null : Math.max(0, Math.min(20, parseInt(val, 10) || 0));
    setPred(match.id, {
      s1: pred?.s1 ?? null,
      s2: pred?.s2 ?? null,
      p1: which === 'p1' ? n : (pred?.p1 ?? null),
      p2: which === 'p2' ? n : (pred?.p2 ?? null),
    });
  };

  return (
    <div className="side-panel">
      <button className="sp-close" onClick={onClose}>×</button>
      <div className="sp-id">{match.id}</div>
      <div className="sp-round">{roundOf(match.id)}</div>

      <div className="sp-divider" />

      <div className="sp-row"><span className="lbl">Venue</span><span className="val">{match.venue}</span></div>
      <div className="sp-row"><span className="lbl">Local kick-off</span><span className="val">{venueK.date} · {venueK.time}</span></div>
      {showBoth && (
        <div className="sp-row">
          <span className="lbl">In {tzLabel}</span>
          <span className="val" style={{ color: 'var(--amber)' }}>{selK.date} · {selK.time}</span>
        </div>
      )}

      <div className="sp-divider" />

      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
        {teamsKnown ? (isKO ? 'Simulated result' : 'Predict the score') : 'Awaiting prior result'}
      </div>

      {result && (
        <div className="sp-result">
          <span>{result.s1}-{result.s2}</span>
          {result.method && <b>{result.method}</b>}
        </div>
      )}

      <div className="sp-score">
        <div className="sp-side">
          <div className="sp-side-name">{match.team1.name}</div>
          <input
            type="number" min="0" max="20"
            value={s1}
            onChange={(e) => onScore('s1', e.target.value)}
            placeholder="–"
            disabled={!teamsKnown}
          />
        </div>
        <span className="sp-dash">:</span>
        <div className="sp-side">
          <div className="sp-side-name">{match.team2.name}</div>
          <input
            type="number" min="0" max="20"
            value={s2}
            onChange={(e) => onScore('s2', e.target.value)}
            placeholder="–"
            disabled={!teamsKnown}
          />
        </div>
      </div>

      {isKO && isDraw && (
        <div className="sp-pens">
          <div className="sp-pens-label">After extra time → Penalties</div>
          <div className="sp-pens-row">
            <input type="number" min="0" max="20" value={p1} onChange={(e) => onPens('p1', e.target.value)} placeholder="–" />
            <span className="sp-dash">:</span>
            <input type="number" min="0" max="20" value={p2} onChange={(e) => onPens('p2', e.target.value)} placeholder="–" />
          </div>
        </div>
      )}

      <div className="sp-divider" />

      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Qualification
      </div>
      <div className="sp-teams">
        <div className="sp-team">
          <div className="nm">{match.team1.name}</div>
          <div className="src">slot · {match.team1.src}</div>
        </div>
        <div className="sp-team" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: -8, left: 12, background: 'var(--bg)', padding: '0 6px', fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--ink-mute)', letterSpacing: '0.1em' }}>VS</div>
          <div className="nm">{match.team2.name}</div>
          <div className="src">slot · {match.team2.src}</div>
        </div>
      </div>
    </div>
  );
}

function TZPicker({ value, onChange, myTz }) {
  let offStr = '';
  if (value === 'venue') offStr = 'each venue';
  else if (value === 'mine') offStr = `${myTz} (${offsetLabelFor(myTz)})`;
  else offStr = offsetLabelFor(value);
  return (
    <div className="tz-picker">
      <span className="label">Times in</span>
      <div className="tz-select-wrap">
        <select value={value} onChange={(e) => { if (e.target.value !== '__sep__') onChange(e.target.value); }}>
          {TZ_OPTIONS.map(o => (
            <option key={o.v} value={o.v} disabled={o.v === '__sep__'}>
              {o.v === 'mine' ? `My local time · ${myTz}` : o.label}
            </option>
          ))}
        </select>
        <span className="caret">▾</span>
      </div>
      <span className="offset">{offStr}</span>
    </div>
  );
}

const THEMES = [
  { id: 'midnight', name: 'Dark', bg: '#0b1020', accent: '#f5a524' },
  { id: 'ivory', name: 'Light', bg: '#f4efe6', accent: '#b5371a' },
];

function ThemePicker({ value, onChange }) {
  return (
    <div className="theme-picker">
      <span className="label">Theme</span>
      {THEMES.map(t => (
        <button
          key={t.id}
          className={`swatch ${value === t.id ? 'active' : ''}`}
          title={t.name}
          aria-label={`Theme: ${t.name}`}
          onClick={() => onChange(t.id)}
          style={{
            background: `linear-gradient(135deg, ${t.bg} 0%, ${t.bg} 50%, ${t.accent} 50%, ${t.accent} 100%)`,
          }}
        />
      ))}
    </div>
  );
}

function roundOf(id) {
  const n = parseInt(id.replace(/\D/g, ''), 10);
  if (n >= 73 && n <= 88) return 'Round of 32';
  if (n >= 89 && n <= 96) return 'Round of 16';
  if (n >= 97 && n <= 100) return 'Quarter-final';
  if (n >= 101 && n <= 102) return 'Semi-final';
  if (n === 103) return 'Third place play-off';
  if (n === 104) return 'Final';
  return '';
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
