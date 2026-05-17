// Predictions store + standings computation + R32 team resolution.
// All client-side; lives in window.PREDICTIONS as React hooks + helpers.

const PREDICTIONS_KEY = 'wc26-predictions-v1';
const SIM_CONFIG_KEY = 'wc26-simulation-config-v1';
const DEFAULT_SIM_CONFIG = {
  model: 'poisson',
  poisson: {
    ratingSource: 'fifaPoints',
    baseRate: 2,
    sensitivity: 2,
    extraTimeScale: 30 / 90,
  },
  shotModel: {
    defenseWeighting: 0.5,
    shotSkillWeighting: 0.5,
    goalkeeperWeighting: 0.5,
  },
};

function loadPredictions() {
  try {
    const raw = localStorage.getItem(PREDICTIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

function savePredictions(p) {
  try { localStorage.setItem(PREDICTIONS_KEY, JSON.stringify(p)); } catch (e) {}
}

function normalizeSimulationConfig(raw) {
  const cfg = raw && typeof raw === 'object' ? raw : {};
  const p = cfg.poisson && typeof cfg.poisson === 'object' ? cfg.poisson : {};
  const s = cfg.shotModel && typeof cfg.shotModel === 'object' ? cfg.shotModel : {};
  const num = (value, fallback, min, max) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  };
  return {
    model: ['coinFlip', 'shotModel'].includes(cfg.model) ? cfg.model : 'poisson',
    poisson: {
      ratingSource: p.ratingSource === 'fifaRankings' ? 'fifaRankings' : 'fifaPoints',
      baseRate: num(p.baseRate, DEFAULT_SIM_CONFIG.poisson.baseRate, 0.2, 6),
      sensitivity: num(p.sensitivity, DEFAULT_SIM_CONFIG.poisson.sensitivity, 0, 6),
      extraTimeScale: num(p.extraTimeScale, DEFAULT_SIM_CONFIG.poisson.extraTimeScale, 0, 1),
    },
    shotModel: {
      defenseWeighting: num(s.defenseWeighting, DEFAULT_SIM_CONFIG.shotModel.defenseWeighting, 0, 1),
      shotSkillWeighting: num(s.shotSkillWeighting, DEFAULT_SIM_CONFIG.shotModel.shotSkillWeighting, 0, 1),
      goalkeeperWeighting: num(s.goalkeeperWeighting, DEFAULT_SIM_CONFIG.shotModel.goalkeeperWeighting, 0, 1),
    },
  };
}

function loadSimulationConfig() {
  try {
    const raw = localStorage.getItem(SIM_CONFIG_KEY);
    return normalizeSimulationConfig(raw ? JSON.parse(raw) : DEFAULT_SIM_CONFIG);
  } catch (e) {
    return normalizeSimulationConfig(DEFAULT_SIM_CONFIG);
  }
}

function saveSimulationConfig(config) {
  try { localStorage.setItem(SIM_CONFIG_KEY, JSON.stringify(normalizeSimulationConfig(config))); } catch (e) {}
}

function poissonSample(lambda) {
  if (!(lambda > 0)) return 0;
  const limit = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > limit);
  return k - 1;
}

function binomialSample(trials, probability) {
  if (!(trials > 0)) return 0;
  const p = Math.max(0, Math.min(1, Number(probability) || 0));
  let successes = 0;
  for (let i = 0; i < trials; i++) {
    if (Math.random() < p) successes++;
  }
  return successes;
}

function pointsForTeam(name, ratingSource = 'fifaPoints') {
  if (ratingSource !== 'fifaRankings') {
    const points = window.TEAMS_DATA?.FIFA_POINTS?.[name];
    if (points != null) return points;
  }
  const rank = window.TEAMS_DATA?.FIFA_RANKINGS?.[name];
  if (rank != null) return 1600 - rank * 5;
  const points = window.TEAMS_DATA?.FIFA_POINTS?.[name];
  if (points != null) return points;
  return 1500;
}

function penaltyShootout() {
  const team1Wins = Math.random() < 0.5;
  const patterns = [
    [4, 3],
    [5, 4],
    [3, 2],
    [6, 5],
  ];
  const [winPens, losePens] = patterns[Math.floor(Math.random() * patterns.length)];
  return team1Wins
    ? { p1: winPens, p2: losePens }
    : { p1: losePens, p2: winPens };
}

function scorelineForWinner(team1Wins) {
  const patterns = [
    [1, 0],
    [2, 1],
    [2, 0],
    [3, 1],
  ];
  const [winGoals, loseGoals] = patterns[Math.floor(Math.random() * patterns.length)];
  return team1Wins ? { s1: winGoals, s2: loseGoals } : { s1: loseGoals, s2: winGoals };
}

function simulateCoinFlipMatch(team1, team2, isKnockout) {
  return scorelineForWinner(Math.random() < 0.5);
}

function simulatePoissonMatch(team1, team2, isKnockout, config = DEFAULT_SIM_CONFIG.poisson) {
  const pointsA = pointsForTeam(team1, config.ratingSource);
  const pointsB = pointsForTeam(team2, config.ratingSource);
  const diff = (pointsA - pointsB) / 1000;
  const lambdaA = config.baseRate * Math.exp(config.sensitivity * diff);
  const lambdaB = config.baseRate * Math.exp(-config.sensitivity * diff);

  let s1 = poissonSample(lambdaA);
  let s2 = poissonSample(lambdaB);

  if (isKnockout && s1 === s2) {
    const wentToExtraTime = true;
    s1 += poissonSample(lambdaA * config.extraTimeScale);
    s2 += poissonSample(lambdaB * config.extraTimeScale);
    if (s1 === s2) return { s1, s2, aet: wentToExtraTime, ...penaltyShootout() };
    return { s1, s2, aet: wentToExtraTime };
  }

  return { s1, s2 };
}

function shotModelRates(team, opponent, config = DEFAULT_SIM_CONFIG.shotModel, shotScale = 1) {
  const attack = window.SHOT_MODEL_DATA.paramsFor(team);
  const defense = window.SHOT_MODEL_DATA.paramsFor(opponent);
  const defenseWeighting = config.defenseWeighting;
  const shotSkillWeighting = config.shotSkillWeighting;
  const goalkeeperWeighting = config.goalkeeperWeighting;
  return {
    lambdaShots: ((1 - defenseWeighting) * attack.team_shots_per_game + defenseWeighting * defense.opponent_shots_allowed) * shotScale,
    accuracy: shotSkillWeighting * attack.team_accuracy + (1 - shotSkillWeighting) * defense.opponent_accuracy_allowed,
    conversion: (1 - goalkeeperWeighting) * attack.team_conversion + goalkeeperWeighting * defense.opponent_conversion_allowed,
  };
}

function simulateShotModelTeam(rates) {
  const shots = poissonSample(rates.lambdaShots);
  const shotsOnTarget = binomialSample(shots, rates.accuracy);
  return binomialSample(shotsOnTarget, rates.conversion);
}

function simulateShotModelMatch(team1, team2, isKnockout, config = DEFAULT_SIM_CONFIG.shotModel) {
  const rates1 = shotModelRates(team1, team2, config);
  const rates2 = shotModelRates(team2, team1, config);
  let s1 = simulateShotModelTeam(rates1);
  let s2 = simulateShotModelTeam(rates2);

  if (isKnockout && s1 === s2) {
    const wentToExtraTime = true;
    s1 += simulateShotModelTeam({ ...rates1, lambdaShots: rates1.lambdaShots * (30 / 90) });
    s2 += simulateShotModelTeam({ ...rates2, lambdaShots: rates2.lambdaShots * (30 / 90) });
    if (s1 === s2) return { s1, s2, aet: wentToExtraTime, ...penaltyShootout() };
    return { s1, s2, aet: wentToExtraTime };
  }

  return { s1, s2 };
}

function simulateMatch(team1, team2, isKnockout, simulationConfig) {
  const config = normalizeSimulationConfig(simulationConfig || loadSimulationConfig());
  if (config.model === 'coinFlip') return simulateCoinFlipMatch(team1, team2, isKnockout);
  if (config.model === 'shotModel') return simulateShotModelMatch(team1, team2, isKnockout, config.shotModel);
  return simulatePoissonMatch(team1, team2, isKnockout, config.poisson);
}

function simulateTournamentPredictions(simulationConfig) {
  const config = normalizeSimulationConfig(simulationConfig || loadSimulationConfig());
  const next = {};
  const { GROUP_MATCHES, GROUP_LETTERS } = window.TEAMS_DATA;
  const data = window.BRACKET;

  GROUP_MATCHES.forEach(m => {
    next[m.id] = simulateMatch(m.team1, m.team2, false, config);
  });

  const standings = computeAllStandings(next);
  const thirds = rankThirdPlaced(standings);

  function fillKORound(matches) {
    const resolved = resolveAllKOTeams(next, standings, thirds);
    matches.forEach(m => {
      const fixture = resolved[m.id];
      if (!fixture?.team1 || !fixture?.team2) return;
      next[m.id] = simulateMatch(fixture.team1, fixture.team2, true, config);
    });
  }

  fillKORound(data.R32);
  fillKORound(data.R16);
  fillKORound(data.QF);
  fillKORound(data.SF);
  fillKORound([data.TP, data.FINAL]);

  // Sanity check: all groups must be completed for the R32 mapping to be stable.
  if (!GROUP_LETTERS.every(g => standings[g].allPlayed)) return next;
  return next;
}

function tournamentWinnerFromPredictions(preds) {
  const standings = computeAllStandings(preds);
  const thirds = rankThirdPlaced(standings);
  const resolved = resolveAllKOTeams(preds, standings, thirds);
  return resolved[window.BRACKET.FINAL.id]?.winner || null;
}

function simulateTournamentWinner(simulationConfig) {
  const preds = simulateTournamentPredictions(simulationConfig);
  return tournamentWinnerFromPredictions(preds);
}

// Hook: predictions state + setter. Each prediction is { s1, s2, p1?, p2? }.
function usePredictions() {
  const [preds, setPreds] = React.useState(loadPredictions);
  const set = React.useCallback((matchId, score) => {
    setPreds(prev => {
      const next = { ...prev };
      if (score == null || (score.s1 == null && score.s2 == null)) delete next[matchId];
      else next[matchId] = score;
      savePredictions(next);
      return next;
    });
  }, []);
  const clear = React.useCallback(() => {
    savePredictions({});
    setPreds({});
  }, []);
  const fillRandom = React.useCallback(() => {
    const matches = window.TEAMS_DATA.GROUP_MATCHES;
    const next = {};
    matches.forEach(m => {
      next[m.id] = { s1: Math.floor(Math.random() * 4), s2: Math.floor(Math.random() * 4) };
    });
    // Now resolve and fill KO rounds in order
    const standings = computeAllStandings(next);
    const thirds = rankThirdPlaced(standings);
    function rand() { return Math.floor(Math.random() * 4); }
    function fillKO(list, resolved) {
      list.forEach(m => {
        const r = resolved[m.id];
        if (!r || !r.team1 || !r.team2) return;
        let s1 = rand(), s2 = rand();
        const pred = { s1, s2 };
        if (s1 === s2) {
          // Force a winner via pens
          pred.aet = true;
          pred.p1 = Math.floor(Math.random() * 6) + 3;
          pred.p2 = Math.floor(Math.random() * 6) + 3;
          while (pred.p1 === pred.p2) pred.p2 = Math.floor(Math.random() * 6) + 3;
        }
        next[m.id] = pred;
      });
    }
    // Chain through rounds — each round needs prior round resolved
    const data = window.BRACKET;
    let resolved = resolveAllKOTeams(next, standings, thirds);
    fillKO(data.R32, resolved);
    resolved = resolveAllKOTeams(next, standings, thirds);
    fillKO(data.R16, resolved);
    resolved = resolveAllKOTeams(next, standings, thirds);
    fillKO(data.QF, resolved);
    resolved = resolveAllKOTeams(next, standings, thirds);
    fillKO(data.SF, resolved);
    resolved = resolveAllKOTeams(next, standings, thirds);
    fillKO([data.TP, data.FINAL], resolved);
    savePredictions(next);
    setPreds(next);
  }, []);
  const simulateTournament = React.useCallback((simulationConfig) => {
    const next = simulateTournamentPredictions(simulationConfig);
    savePredictions(next);
    setPreds(next);
  }, []);
  return { preds, set, clear, fillRandom, simulateTournament };
}

function useSimulationConfig() {
  const [config, setConfigState] = React.useState(loadSimulationConfig);
  const setConfig = React.useCallback((updater) => {
    setConfigState(prev => {
      const next = normalizeSimulationConfig(typeof updater === 'function' ? updater(prev) : updater);
      saveSimulationConfig(next);
      return next;
    });
  }, []);
  const resetConfig = React.useCallback(() => setConfig(DEFAULT_SIM_CONFIG), [setConfig]);
  return { config, setConfig, resetConfig };
}

// Compute standings for one group, given { matchId: { s1, s2 } } predictions.
function computeGroupStandings(groupLetter, preds) {
  const { GROUPS, GROUP_MATCHES } = window.TEAMS_DATA;
  const teams = GROUPS[groupLetter].teams;
  const rows = teams.map((name, idx) => ({
    name, idx, group: groupLetter,
    P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0,
    decided: false,
  }));
  const groupMatches = GROUP_MATCHES.filter(m => m.group === groupLetter);
  let playedCount = 0;
  groupMatches.forEach(m => {
    const p = preds[m.id];
    if (!p || p.s1 == null || p.s2 == null) return;
    playedCount++;
    const a = rows[m.team1Idx], b = rows[m.team2Idx];
    a.P++; b.P++;
    a.GF += p.s1; a.GA += p.s2;
    b.GF += p.s2; b.GA += p.s1;
    if (p.s1 > p.s2) { a.W++; b.L++; a.Pts += 3; }
    else if (p.s1 < p.s2) { b.W++; a.L++; b.Pts += 3; }
    else { a.D++; b.D++; a.Pts++; b.Pts++; }
  });
  rows.forEach(r => { r.GD = r.GF - r.GA; });
  rows.sort((x, y) => {
    if (y.Pts !== x.Pts) return y.Pts - x.Pts;
    if (y.GD !== x.GD) return y.GD - x.GD;
    if (y.GF !== x.GF) return y.GF - x.GF;
    return x.name.localeCompare(y.name);
  });
  rows.forEach((r, i) => { r.position = i + 1; });
  const allPlayed = playedCount === 6;
  return { rows, allPlayed, matches: groupMatches };
}

function computeAllStandings(preds) {
  const out = {};
  window.TEAMS_DATA.GROUP_LETTERS.forEach(g => {
    out[g] = computeGroupStandings(g, preds);
  });
  return out;
}

// Rank the 12 3rd-placed teams to pick the best 8 (FIFA tiebreakers: Pts, GD, GF).
function rankThirdPlaced(standings) {
  const thirds = [];
  window.TEAMS_DATA.GROUP_LETTERS.forEach(g => {
    const r = standings[g].rows[2];
    if (r) thirds.push(r);
  });
  thirds.sort((x, y) => {
    if (y.Pts !== x.Pts) return y.Pts - x.Pts;
    if (y.GD !== x.GD) return y.GD - x.GD;
    if (y.GF !== x.GF) return y.GF - x.GF;
    return x.name.localeCompare(y.name);
  });
  return thirds;
}

// R32 slot configuration — each slot says where its team comes from:
//   { type: 'winner', group: 'A' }
//   { type: 'runner', group: 'B' }
//   { type: 'third', groups: ['C','D','E','F'] }   // best 3rd from these
//
// Layout matches bracket-data.js M73..M88 ordering.
const R32_SLOTS = {
  M73: [{ type: 'winner', group: 'A' }, { type: 'third', groups: ['C', 'D', 'E', 'F'] }],
  M74: [{ type: 'winner', group: 'C' }, { type: 'third', groups: ['A', 'B', 'F', 'G'] }],
  M75: [{ type: 'winner', group: 'B' }, { type: 'runner', group: 'F' }],
  M76: [{ type: 'winner', group: 'D' }, { type: 'third', groups: ['B', 'E', 'H', 'I'] }],
  M77: [{ type: 'winner', group: 'E' }, { type: 'runner', group: 'I' }],
  M78: [{ type: 'winner', group: 'G' }, { type: 'third', groups: ['H', 'I', 'J', 'K'] }],
  M79: [{ type: 'winner', group: 'F' }, { type: 'runner', group: 'C' }],
  M80: [{ type: 'winner', group: 'H' }, { type: 'runner', group: 'A' }],
  M81: [{ type: 'winner', group: 'I' }, { type: 'third', groups: ['D', 'E', 'G', 'L'] }],
  M82: [{ type: 'winner', group: 'K' }, { type: 'third', groups: ['A', 'C', 'F', 'L'] }],
  M83: [{ type: 'winner', group: 'J' }, { type: 'runner', group: 'L' }],
  M84: [{ type: 'winner', group: 'L' }, { type: 'runner', group: 'J' }],
  M85: [{ type: 'runner', group: 'B' }, { type: 'runner', group: 'H' }],
  M86: [{ type: 'runner', group: 'D' }, { type: 'runner', group: 'K' }],
  M87: [{ type: 'runner', group: 'E' }, { type: 'runner', group: 'G' }],
  M88: [{ type: 'third', groups: ['B', 'C', 'D', 'J'] }, { type: 'third', groups: ['A', 'F', 'H', 'K'] }],
};

// Resolve the team for one slot, returning either a real team name or null.
function resolveSlot(slot, standings, thirdRanks) {
  if (slot.type === 'winner') {
    const s = standings[slot.group];
    if (!s.allPlayed) return null;
    return s.rows[0]?.name || null;
  }
  if (slot.type === 'runner') {
    const s = standings[slot.group];
    if (!s.allPlayed) return null;
    return s.rows[1]?.name || null;
  }
  if (slot.type === 'third') {
    // Need every group decided to know the third-place ranking definitively.
    const allDone = window.TEAMS_DATA.GROUP_LETTERS.every(g => standings[g].allPlayed);
    if (!allDone) return null;
    // Find the highest-ranked among 3rd-placed teams whose group is one of slot.groups.
    const top8 = thirdRanks.slice(0, 8);
    const candidate = top8.find(t => slot.groups.includes(t.group));
    return candidate ? candidate.name : null;
  }
  return null;
}

// Produce a label for an unresolved slot (fallback display)
function slotPlaceholder(slot) {
  if (slot.type === 'winner') return `Winner Group ${slot.group}`;
  if (slot.type === 'runner') return `Runner-up Group ${slot.group}`;
  if (slot.type === 'third') return `3rd · Group ${slot.groups.join('/')}`;
  return '—';
}

// Map a winner-of-match reference (e.g. "Wm73") to a resolved team name if available.
// Requires us to know R32 results; for now KO predictions aren't supported, so always null.
function resolveWinnerRef(ref, ctx) {
  // Future hook for KO predictions. For now, return null so the placeholder shows.
  return null;
}

// Resolve teams for every KO match (R32 → Final + 3rd-place) given current predictions.
// Returns { matchId: { team1: nameOrNull, team2: nameOrNull, winner: nameOrNull, loser: nameOrNull } }
function resolveAllKOTeams(preds, standings, thirdRanks) {
  const data = window.BRACKET;
  const resolved = {};

  function pickWinnerLoser(m, pred) {
    const r = resolved[m.id];
    if (!r || !r.team1 || !r.team2) return { winner: null, loser: null };
    if (!pred || pred.s1 == null || pred.s2 == null) return { winner: null, loser: null };
    if (pred.s1 > pred.s2) return { winner: r.team1, loser: r.team2 };
    if (pred.s2 > pred.s1) return { winner: r.team2, loser: r.team1 };
    // Draw → look at pens
    if (pred.p1 != null && pred.p2 != null) {
      if (pred.p1 > pred.p2) return { winner: r.team1, loser: r.team2 };
      if (pred.p2 > pred.p1) return { winner: r.team2, loser: r.team1 };
    }
    return { winner: null, loser: null };
  }

  // ----- R32 from group standings
  data.R32.forEach(m => {
    const slots = R32_SLOTS[m.id];
    resolved[m.id] = {
      team1: slots ? resolveSlot(slots[0], standings, thirdRanks) : null,
      team2: slots ? resolveSlot(slots[1], standings, thirdRanks) : null,
    };
    const wl = pickWinnerLoser(m, preds[m.id]);
    resolved[m.id].winner = wl.winner;
    resolved[m.id].loser = wl.loser;
  });

  // ----- Subsequent rounds resolve via Wm / Lm refs on each match's team src
  const resolveSrc = (src) => {
    if (typeof src !== 'string') return null;
    if (src.startsWith('Wm')) return resolved['M' + src.slice(2)]?.winner || null;
    if (src.startsWith('Lm')) return resolved['M' + src.slice(2)]?.loser || null;
    return null;
  };

  const laterRounds = [...data.R16, ...data.QF, ...data.SF, data.TP, data.FINAL];
  laterRounds.forEach(m => {
    resolved[m.id] = {
      team1: resolveSrc(m.team1.src),
      team2: resolveSrc(m.team2.src),
    };
    const wl = pickWinnerLoser(m, preds[m.id]);
    resolved[m.id].winner = wl.winner;
    resolved[m.id].loser = wl.loser;
  });

  return resolved;
}

window.PREDICTIONS = {
  usePredictions,
  useSimulationConfig,
  DEFAULT_SIM_CONFIG,
  normalizeSimulationConfig,
  simulateMatch,
  simulateTournamentPredictions,
  simulateTournamentWinner,
  tournamentWinnerFromPredictions,
  computeGroupStandings,
  computeAllStandings,
  rankThirdPlaced,
  resolveSlot,
  slotPlaceholder,
  resolveAllKOTeams,
  R32_SLOTS,
};
