// Three-stage shot model inputs.
// Primary source: SHOT_MODEL_MATCHES (raw match data, filtered by maxOppRank at runtime).
// Fallback for teams absent from match data: hardcoded SHOT_MODEL_RAW below.
// Values are keyed by source team name; aliases below map app team names where needed.

const SHOT_MODEL_RAW = {
  'Algeria': { team_shots_per_game: 8.4, team_accuracy: 0.381, team_conversion: 0.406, opponent_shots_allowed: 13.3, opponent_accuracy_allowed: 0.451, opponent_conversion_allowed: 0.367 },
  'Argentina': { team_shots_per_game: 13.4, team_accuracy: 0.381, team_conversion: 0.333, opponent_shots_allowed: 11.3, opponent_accuracy_allowed: 0.416, opponent_conversion_allowed: 0.149 },
  'Australia': { team_shots_per_game: 10.9, team_accuracy: 0.239, team_conversion: 0.5, opponent_shots_allowed: 14.1, opponent_accuracy_allowed: 0.454, opponent_conversion_allowed: 0.297 },
  'Austria': { team_shots_per_game: 9.7, team_accuracy: 0.34, team_conversion: 0.182, opponent_shots_allowed: 13.1, opponent_accuracy_allowed: 0.405, opponent_conversion_allowed: 0.396 },
  'Belgium': { team_shots_per_game: 12.0, team_accuracy: 0.35, team_conversion: 0.262, opponent_shots_allowed: 12.0, opponent_accuracy_allowed: 0.35, opponent_conversion_allowed: 0.31 },
  'Brazil': { team_shots_per_game: 13.3, team_accuracy: 0.368, team_conversion: 0.429, opponent_shots_allowed: 11.1, opponent_accuracy_allowed: 0.396, opponent_conversion_allowed: 0.295 },
  'Cameroon': { team_shots_per_game: 10.5, team_accuracy: 0.305, team_conversion: 0.406, opponent_shots_allowed: 13.1, opponent_accuracy_allowed: 0.42, opponent_conversion_allowed: 0.382 },
  'Canada': { team_shots_per_game: 9.8, team_accuracy: 0.347, team_conversion: 0.324, opponent_shots_allowed: 12.5, opponent_accuracy_allowed: 0.48, opponent_conversion_allowed: 0.35 },
  'Chile': { team_shots_per_game: 10.8, team_accuracy: 0.306, team_conversion: 0.242, opponent_shots_allowed: 12.5, opponent_accuracy_allowed: 0.408, opponent_conversion_allowed: 0.392 },
  'Colombia': { team_shots_per_game: 11.8, team_accuracy: 0.373, team_conversion: 0.227, opponent_shots_allowed: 12.4, opponent_accuracy_allowed: 0.387, opponent_conversion_allowed: 0.125 },
  'Costa Rica': { team_shots_per_game: 8.8, team_accuracy: 0.409, team_conversion: 0.222, opponent_shots_allowed: 12.7, opponent_accuracy_allowed: 0.465, opponent_conversion_allowed: 0.305 },
  'Croatia': { team_shots_per_game: 13.3, team_accuracy: 0.368, team_conversion: 0.265, opponent_shots_allowed: 12.9, opponent_accuracy_allowed: 0.341, opponent_conversion_allowed: 0.295 },
  'Denmark': { team_shots_per_game: 8.9, team_accuracy: 0.36, team_conversion: 0.375, opponent_shots_allowed: 12.9, opponent_accuracy_allowed: 0.411, opponent_conversion_allowed: 0.415 },
  'Ecuador': { team_shots_per_game: 10.2, team_accuracy: 0.363, team_conversion: 0.324, opponent_shots_allowed: 14.3, opponent_accuracy_allowed: 0.427, opponent_conversion_allowed: 0.311 },
  'Egypt': { team_shots_per_game: 10.0, team_accuracy: 0.33, team_conversion: 0.424, opponent_shots_allowed: 13.4, opponent_accuracy_allowed: 0.44, opponent_conversion_allowed: 0.288 },
  'England': { team_shots_per_game: 13.2, team_accuracy: 0.417, team_conversion: 0.382, opponent_shots_allowed: 10.7, opponent_accuracy_allowed: 0.467, opponent_conversion_allowed: 0.14 },
  'France': { team_shots_per_game: 12.9, team_accuracy: 0.372, team_conversion: 0.438, opponent_shots_allowed: 10.4, opponent_accuracy_allowed: 0.442, opponent_conversion_allowed: 0.283 },
  'Germany': { team_shots_per_game: 12.7, team_accuracy: 0.346, team_conversion: 0.409, opponent_shots_allowed: 11.5, opponent_accuracy_allowed: 0.365, opponent_conversion_allowed: 0.214 },
  'Ghana': { team_shots_per_game: 10.2, team_accuracy: 0.304, team_conversion: 0.323, opponent_shots_allowed: 13.4, opponent_accuracy_allowed: 0.403, opponent_conversion_allowed: 0.481 },
  'Hungary': { team_shots_per_game: 9.6, team_accuracy: 0.302, team_conversion: 0.345, opponent_shots_allowed: 12.4, opponent_accuracy_allowed: 0.444, opponent_conversion_allowed: 0.345 },
  'Iran': { team_shots_per_game: 9.9, team_accuracy: 0.424, team_conversion: 0.286, opponent_shots_allowed: 12.9, opponent_accuracy_allowed: 0.372, opponent_conversion_allowed: 0.354 },
  'Iraq': { team_shots_per_game: 10.4, team_accuracy: 0.327, team_conversion: 0.471, opponent_shots_allowed: 12.7, opponent_accuracy_allowed: 0.417, opponent_conversion_allowed: 0.377 },
  'Italy': { team_shots_per_game: 12.0, team_accuracy: 0.35, team_conversion: 0.19, opponent_shots_allowed: 12.2, opponent_accuracy_allowed: 0.402, opponent_conversion_allowed: 0.163 },
  'Ivory Coast': { team_shots_per_game: 10.6, team_accuracy: 0.34, team_conversion: 0.333, opponent_shots_allowed: 12.7, opponent_accuracy_allowed: 0.488, opponent_conversion_allowed: 0.29 },
  'Japan': { team_shots_per_game: 10.2, team_accuracy: 0.353, team_conversion: 0.444, opponent_shots_allowed: 13.9, opponent_accuracy_allowed: 0.367, opponent_conversion_allowed: 0.275 },
  'Korea Republic': { team_shots_per_game: 10.4, team_accuracy: 0.317, team_conversion: 0.121, opponent_shots_allowed: 13.1, opponent_accuracy_allowed: 0.45, opponent_conversion_allowed: 0.305 },
  'Mexico': { team_shots_per_game: 12.8, team_accuracy: 0.336, team_conversion: 0.209, opponent_shots_allowed: 12.1, opponent_accuracy_allowed: 0.372, opponent_conversion_allowed: 0.267 },
  'Morocco': { team_shots_per_game: 10.7, team_accuracy: 0.383, team_conversion: 0.317, opponent_shots_allowed: 11.7, opponent_accuracy_allowed: 0.487, opponent_conversion_allowed: 0.14 },
  'Netherlands': { team_shots_per_game: 12.0, team_accuracy: 0.375, team_conversion: 0.356, opponent_shots_allowed: 12.7, opponent_accuracy_allowed: 0.37, opponent_conversion_allowed: 0.191 },
  'Nigeria': { team_shots_per_game: 9.5, team_accuracy: 0.347, team_conversion: 0.333, opponent_shots_allowed: 12.7, opponent_accuracy_allowed: 0.457, opponent_conversion_allowed: 0.431 },
  'Norway': { team_shots_per_game: 11.1, team_accuracy: 0.351, team_conversion: 0.205, opponent_shots_allowed: 12.1, opponent_accuracy_allowed: 0.421, opponent_conversion_allowed: 0.471 },
  'Panama': { team_shots_per_game: 9.9, team_accuracy: 0.384, team_conversion: 0.395, opponent_shots_allowed: 12.9, opponent_accuracy_allowed: 0.434, opponent_conversion_allowed: 0.429 },
  'Peru': { team_shots_per_game: 11.0, team_accuracy: 0.345, team_conversion: 0.263, opponent_shots_allowed: 12.9, opponent_accuracy_allowed: 0.45, opponent_conversion_allowed: 0.362 },
  'Poland': { team_shots_per_game: 9.6, team_accuracy: 0.385, team_conversion: 0.243, opponent_shots_allowed: 12.3, opponent_accuracy_allowed: 0.488, opponent_conversion_allowed: 0.267 },
  'Portugal': { team_shots_per_game: 13.7, team_accuracy: 0.358, team_conversion: 0.388, opponent_shots_allowed: 12.0, opponent_accuracy_allowed: 0.367, opponent_conversion_allowed: 0.295 },
  'Qatar': { team_shots_per_game: 10.7, team_accuracy: 0.374, team_conversion: 0.15, opponent_shots_allowed: 13.7, opponent_accuracy_allowed: 0.467, opponent_conversion_allowed: 0.375 },
  'Saudi Arabia': { team_shots_per_game: 11.0, team_accuracy: 0.273, team_conversion: 0.433, opponent_shots_allowed: 12.4, opponent_accuracy_allowed: 0.468, opponent_conversion_allowed: 0.259 },
  'Scotland': { team_shots_per_game: 9.0, team_accuracy: 0.422, team_conversion: 0.263, opponent_shots_allowed: 12.9, opponent_accuracy_allowed: 0.426, opponent_conversion_allowed: 0.345 },
  'Senegal': { team_shots_per_game: 9.8, team_accuracy: 0.357, team_conversion: 0.343, opponent_shots_allowed: 12.7, opponent_accuracy_allowed: 0.425, opponent_conversion_allowed: 0.407 },
  'Spain': { team_shots_per_game: 12.6, team_accuracy: 0.413, team_conversion: 0.442, opponent_shots_allowed: 11.2, opponent_accuracy_allowed: 0.446, opponent_conversion_allowed: 0.22 },
  'Sweden': { team_shots_per_game: 10.6, team_accuracy: 0.292, team_conversion: 0.419, opponent_shots_allowed: 13.0, opponent_accuracy_allowed: 0.415, opponent_conversion_allowed: 0.352 },
  'Switzerland': { team_shots_per_game: 11.6, team_accuracy: 0.319, team_conversion: 0.324, opponent_shots_allowed: 13.6, opponent_accuracy_allowed: 0.441, opponent_conversion_allowed: 0.283 },
  'Tunisia': { team_shots_per_game: 9.5, team_accuracy: 0.337, team_conversion: 0.312, opponent_shots_allowed: 12.6, opponent_accuracy_allowed: 0.492, opponent_conversion_allowed: 0.339 },
  'Turkey': { team_shots_per_game: 9.6, team_accuracy: 0.344, team_conversion: 0.273, opponent_shots_allowed: 13.0, opponent_accuracy_allowed: 0.485, opponent_conversion_allowed: 0.333 },
  'USA': { team_shots_per_game: 12.3, team_accuracy: 0.374, team_conversion: 0.239, opponent_shots_allowed: 11.9, opponent_accuracy_allowed: 0.42, opponent_conversion_allowed: 0.14 },
  'Ukraine': { team_shots_per_game: 9.4, team_accuracy: 0.33, team_conversion: 0.226, opponent_shots_allowed: 13.3, opponent_accuracy_allowed: 0.414, opponent_conversion_allowed: 0.436 },
  'Uruguay': { team_shots_per_game: 12.6, team_accuracy: 0.341, team_conversion: 0.186, opponent_shots_allowed: 11.7, opponent_accuracy_allowed: 0.359, opponent_conversion_allowed: 0.238 },
  'Wales': { team_shots_per_game: 10.1, team_accuracy: 0.386, team_conversion: 0.231, opponent_shots_allowed: 12.9, opponent_accuracy_allowed: 0.465, opponent_conversion_allowed: 0.267 },
};

const SHOT_MODEL_ALIASES = {
  "Côte d'Ivoire": 'Ivory Coast',
  'South Korea': 'Korea Republic',
  'Türkiye': 'Turkey',
};

const SHOT_MODEL_FIELDS = [
  'team_shots_per_game',
  'team_accuracy',
  'team_conversion',
  'opponent_shots_allowed',
  'opponent_accuracy_allowed',
  'opponent_conversion_allowed',
];

function validateShotModelRow(team, row) {
  SHOT_MODEL_FIELDS.forEach(field => {
    const value = row[field];
    if (!Number.isFinite(value)) throw new Error(`Invalid shot model value for ${team}: ${field}`);
    if (field !== 'team_shots_per_game' && field !== 'opponent_shots_allowed' && (value < 0 || value > 1)) {
      throw new Error(`Shot model proportion out of range for ${team}: ${field}`);
    }
    if ((field === 'team_shots_per_game' || field === 'opponent_shots_allowed') && value < 0) {
      throw new Error(`Shot model shots value out of range for ${team}: ${field}`);
    }
  });
  return row;
}

// Maps app display names → keys used in SHOT_MODEL_MATCHES (where they differ from both the
// display name and the SHOT_MODEL_ALIASES RAW-data key).
const MATCHES_KEY_MAP = {
  'South Korea':    'South Korea',        // alias points to 'Korea Republic'; override to direct key
  'Bosnia & Herz.': 'Bosnia & Herzegovina',
  'Curaçao':        'Curacao',
  'Congo DR':       'DR Congo',
};

function resolveMatchesData(team) {
  if (!window.SHOT_MODEL_MATCHES) return null;
  return (
    window.SHOT_MODEL_MATCHES[MATCHES_KEY_MAP[team]] ||
    window.SHOT_MODEL_MATCHES[team] ||
    window.SHOT_MODEL_MATCHES[SHOT_MODEL_ALIASES[team]]
  ) || null;
}

// Compute params from raw match data, filtered to opponents with rank <= maxOppRank.
// Pass maxOppRank=0 or null to include all opponents.
function computeParamsFromMatches(team, maxOppRank) {
  const allMatches = resolveMatchesData(team);
  if (!allMatches || allMatches.length === 0) return null;
  const filtered = (maxOppRank && maxOppRank > 0)
    ? allMatches.filter(m => m.opp_rank != null && m.opp_rank <= maxOppRank)
    : allMatches;
  if (filtered.length === 0) return null;
  let totShots = 0, totOT = 0, totGoals = 0, totOppShots = 0, totOppOT = 0, totOppGoals = 0;
  for (const m of filtered) {
    totShots += m.shots || 0;
    totOT += m.on_target || 0;
    totGoals += m.goals || 0;
    totOppShots += m.opp_shots || 0;
    totOppOT += m.opp_on_target || 0;
    totOppGoals += m.opp_goals || 0;
  }
  if (totShots === 0 || totOT === 0 || totOppShots === 0 || totOppOT === 0) return null;
  const r = (n, d, p) => Math.round(n / d * Math.pow(10, p)) / Math.pow(10, p);
  return {
    team_shots_per_game: r(totShots, filtered.length, 1),
    team_accuracy: r(totOT, totShots, 3),
    team_conversion: r(totGoals, totOT, 3),
    opponent_shots_allowed: r(totOppShots, filtered.length, 1),
    opponent_accuracy_allowed: r(totOppOT, totOppShots, 3),
    opponent_conversion_allowed: r(totOppGoals, totOppOT, 3),
  };
}

function matchCountFor(team, maxOppRank) {
  const allMatches = resolveMatchesData(team);
  if (!allMatches) return 0;
  if (!maxOppRank || maxOppRank <= 0) return allMatches.length;
  return allMatches.filter(m => m.opp_rank != null && m.opp_rank <= maxOppRank).length;
}

const SHOT_MODEL_GLOBAL_AVERAGES = SHOT_MODEL_FIELDS.reduce((acc, field) => {
  const rows = Object.values(SHOT_MODEL_RAW);
  acc[field] = rows.reduce((sum, row) => sum + row[field], 0) / rows.length;
  return acc;
}, {});

function computeGlobalAverages(maxOppRank) {
  if (!window.SHOT_MODEL_MATCHES) return SHOT_MODEL_GLOBAL_AVERAGES;
  const rows = Object.keys(window.SHOT_MODEL_MATCHES)
    .map(t => computeParamsFromMatches(t, maxOppRank))
    .filter(Boolean);
  if (rows.length === 0) return SHOT_MODEL_GLOBAL_AVERAGES;
  return SHOT_MODEL_FIELDS.reduce((acc, field) => {
    acc[field] = rows.reduce((s, r) => s + r[field], 0) / rows.length;
    return acc;
  }, {});
}

function shotModelParamsFor(team, maxOppRank) {
  const key = SHOT_MODEL_ALIASES[team] || team;
  const computed = computeParamsFromMatches(team, maxOppRank);
  if (computed) return validateShotModelRow(team, computed);
  if (SHOT_MODEL_RAW[key]) return validateShotModelRow(team, SHOT_MODEL_RAW[key]);
  const globalAvg = (maxOppRank != null && maxOppRank > 0)
    ? computeGlobalAverages(maxOppRank)
    : SHOT_MODEL_GLOBAL_AVERAGES;
  return validateShotModelRow(team, globalAvg);
}

window.SHOT_MODEL_DATA = {
  rows: SHOT_MODEL_RAW,
  aliases: SHOT_MODEL_ALIASES,
  globalAverages: SHOT_MODEL_GLOBAL_AVERAGES,
  paramsFor: shotModelParamsFor,
  matchCountFor,
  computeGlobalAverages,
};
