// 48 qualified teams in 12 groups (A-L), plus generated 72-match group-stage schedule.
// Groups reflect the confirmed FIFA World Cup 2026 group-stage draw.

const GROUPS = {
  A: { teams: ['Mexico', 'South Korea', 'Czechia', 'South Africa'] },
  B: { teams: ['Switzerland', 'Canada', 'Qatar', 'Bosnia & Herz.'] },
  C: { teams: ['Brazil', 'Morocco', 'Scotland', 'Haiti'] },
  D: { teams: ['USA', 'Türkiye', 'Australia', 'Paraguay'] },
  E: { teams: ['Germany', 'Ecuador', "Côte d'Ivoire", 'Curaçao'] },
  F: { teams: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'] },
  G: { teams: ['Belgium', 'Iran', 'Egypt', 'New Zealand'] },
  H: { teams: ['Spain', 'Uruguay', 'Saudi Arabia', 'Cape Verde'] },
  I: { teams: ['France', 'Senegal', 'Norway', 'Iraq'] },
  J: { teams: ['Argentina', 'Algeria', 'Austria', 'Jordan'] },
  K: { teams: ['Portugal', 'Colombia', 'Congo DR', 'Uzbekistan'] },
  L: { teams: ['England', 'Croatia', 'Panama', 'Ghana'] },
};

const GROUP_LETTERS = Object.keys(GROUPS);

// FIFA/Coca-Cola Men's World Ranking, 1 April 2026.
// Source: https://inside.fifa.com/fifa-world-ranking/men
// Backed by FIFA's public rankings API for the same publication date.
// The team list is the confirmed 48-team field, sorted in TeamsView by this rank.
const FIFA_RANKINGS = {
  'France': 1,
  'Spain': 2,
  'Argentina': 3,
  'England': 4,
  'Portugal': 5,
  'Brazil': 6,
  'Netherlands': 7,
  'Morocco': 8,
  'Belgium': 9,
  'Germany': 10,
  'Croatia': 11,
  'Colombia': 13,
  'Senegal': 14,
  'Mexico': 15,
  'USA': 16,
  'Uruguay': 17,
  'Japan': 18,
  'Switzerland': 19,
  'Iran': 21,
  'Türkiye': 22,
  'Ecuador': 23,
  'Austria': 24,
  'South Korea': 25,
  'Australia': 27,
  'Algeria': 28,
  'Egypt': 29,
  'Canada': 30,
  'Norway': 31,
  'Panama': 33,
  "Côte d'Ivoire": 34,
  'Sweden': 38,
  'Paraguay': 40,
  'Czechia': 41,
  'Scotland': 43,
  'Tunisia': 44,
  'Congo DR': 46,
  'Uzbekistan': 50,
  'Qatar': 55,
  'Iraq': 57,
  'South Africa': 60,
  'Saudi Arabia': 61,
  'Jordan': 63,
  'Bosnia & Herz.': 65,
  'Cape Verde': 69,
  'Ghana': 74,
  'Curaçao': 82,
  'Haiti': 83,
  'New Zealand': 85,
};

const FIFA_POINTS = {
  'France': 1877.32,
  'Spain': 1876.40,
  'Argentina': 1874.81,
  'England': 1825.97,
  'Portugal': 1763.83,
  'Brazil': 1761.16,
  'Netherlands': 1757.87,
  'Morocco': 1755.87,
  'Belgium': 1734.71,
  'Germany': 1730.37,
  'Croatia': 1717.07,
  'Colombia': 1693.09,
  'Senegal': 1688.99,
  'Mexico': 1681.03,
  'USA': 1673.13,
  'Uruguay': 1673.07,
  'Japan': 1660.43,
  'Switzerland': 1649.40,
  'Iran': 1615.30,
  'Türkiye': 1599.04,
  'Ecuador': 1594.78,
  'Austria': 1593.45,
  'South Korea': 1588.66,
  'Australia': 1580.67,
  'Algeria': 1564.26,
  'Egypt': 1563.24,
  'Canada': 1556.48,
  'Norway': 1550.94,
  'Panama': 1540.64,
  "Côte d'Ivoire": 1532.98,
  'Sweden': 1514.77,
  'Paraguay': 1503.50,
  'Czechia': 1501.38,
  'Scotland': 1498.35,
  'Tunisia': 1483.05,
  'Congo DR': 1478.35,
  'Uzbekistan': 1465.34,
  'Qatar': 1454.96,
  'Iraq': 1447.14,
  'South Africa': 1429.73,
  'Saudi Arabia': 1421.43,
  'Jordan': 1391.45,
  'Bosnia & Herz.': 1385.84,
  'Cape Verde': 1366.13,
  'Ghana': 1346.31,
  'Curaçao': 1294.65,
  'Haiti': 1291.71,
  'New Zealand': 1281.57,
};

// 16 host venues, rotated through the schedule
const HOST_CITIES = [
  'Mexico City', 'Guadalajara', 'Monterrey',
  'Los Angeles', 'San Francisco', 'Seattle',
  'Dallas', 'Houston', 'Kansas City',
  'Atlanta', 'Miami', 'Philadelphia',
  'New York / NJ', 'Boston',
  'Toronto', 'Vancouver',
];

// Generate the 72-match group schedule.
// Confirmed group-stage schedule. Times are local venue time.
// Source: NBC Sports / FIFA official schedule (May 2026).
// ET→local offsets: ET cities ±0; Dallas/Houston/KC/MexCities −1; GDL/MEX/MTY −2; LA/SF/SEA/VAN −3.
const GROUP_MATCHES = [
  // ── Group A ──────────────────────────────────────────────────────
  { id: 'M1',  group: 'A', matchday: 1, team1: 'Mexico',       team2: 'South Africa',  date: 'Thu 11 Jun', rawDay: 11, time: '13:00', venue: 'Mexico City'  },
  { id: 'M2',  group: 'A', matchday: 1, team1: 'South Korea',  team2: 'Czechia',        date: 'Thu 11 Jun', rawDay: 11, time: '20:00', venue: 'Guadalajara'  },
  { id: 'M3',  group: 'A', matchday: 2, team1: 'Czechia',      team2: 'South Africa',  date: 'Thu 18 Jun', rawDay: 18, time: '12:00', venue: 'Atlanta'      },
  { id: 'M4',  group: 'A', matchday: 2, team1: 'Mexico',       team2: 'South Korea',   date: 'Thu 18 Jun', rawDay: 18, time: '19:00', venue: 'Guadalajara'  },
  { id: 'M5',  group: 'A', matchday: 3, team1: 'Czechia',      team2: 'Mexico',        date: 'Wed 24 Jun', rawDay: 24, time: '19:00', venue: 'Mexico City'  },
  { id: 'M6',  group: 'A', matchday: 3, team1: 'South Africa', team2: 'South Korea',   date: 'Wed 24 Jun', rawDay: 24, time: '19:00', venue: 'Monterrey'    },
  // ── Group B ──────────────────────────────────────────────────────
  { id: 'M7',  group: 'B', matchday: 1, team1: 'Canada',          team2: 'Bosnia & Herz.', date: 'Fri 12 Jun', rawDay: 12, time: '15:00', venue: 'Toronto'      },
  { id: 'M8',  group: 'B', matchday: 1, team1: 'Qatar',           team2: 'Switzerland',    date: 'Sat 13 Jun', rawDay: 13, time: '12:00', venue: 'San Francisco' },
  { id: 'M9',  group: 'B', matchday: 2, team1: 'Switzerland',     team2: 'Bosnia & Herz.', date: 'Thu 18 Jun', rawDay: 18, time: '12:00', venue: 'Los Angeles'  },
  { id: 'M10', group: 'B', matchday: 2, team1: 'Canada',          team2: 'Qatar',          date: 'Thu 18 Jun', rawDay: 18, time: '15:00', venue: 'Vancouver'    },
  { id: 'M11', group: 'B', matchday: 3, team1: 'Switzerland',     team2: 'Canada',         date: 'Wed 24 Jun', rawDay: 24, time: '12:00', venue: 'Vancouver'    },
  { id: 'M12', group: 'B', matchday: 3, team1: 'Bosnia & Herz.', team2: 'Qatar',           date: 'Wed 24 Jun', rawDay: 24, time: '12:00', venue: 'Seattle'      },
  // ── Group C ──────────────────────────────────────────────────────
  { id: 'M13', group: 'C', matchday: 1, team1: 'Brazil',   team2: 'Morocco',  date: 'Sat 13 Jun', rawDay: 13, time: '18:00', venue: 'New York / NJ' },
  { id: 'M14', group: 'C', matchday: 1, team1: 'Haiti',    team2: 'Scotland', date: 'Sat 13 Jun', rawDay: 13, time: '21:00', venue: 'Boston'        },
  { id: 'M15', group: 'C', matchday: 2, team1: 'Scotland', team2: 'Morocco',  date: 'Fri 19 Jun', rawDay: 19, time: '18:00', venue: 'Boston'        },
  { id: 'M16', group: 'C', matchday: 2, team1: 'Brazil',   team2: 'Haiti',    date: 'Fri 19 Jun', rawDay: 19, time: '21:00', venue: 'Philadelphia'  },
  { id: 'M17', group: 'C', matchday: 3, team1: 'Scotland', team2: 'Brazil',   date: 'Wed 24 Jun', rawDay: 24, time: '18:00', venue: 'Miami'         },
  { id: 'M18', group: 'C', matchday: 3, team1: 'Morocco',  team2: 'Haiti',    date: 'Wed 24 Jun', rawDay: 24, time: '18:00', venue: 'Atlanta'       },
  // ── Group D ──────────────────────────────────────────────────────
  { id: 'M19', group: 'D', matchday: 1, team1: 'USA',       team2: 'Paraguay', date: 'Fri 12 Jun', rawDay: 12, time: '18:00', venue: 'Los Angeles'   },
  { id: 'M20', group: 'D', matchday: 1, team1: 'Australia', team2: 'Türkiye',  date: 'Sat 13 Jun', rawDay: 13, time: '21:00', venue: 'Vancouver'     },
  { id: 'M21', group: 'D', matchday: 2, team1: 'USA',       team2: 'Australia',date: 'Fri 19 Jun', rawDay: 19, time: '12:00', venue: 'Seattle'       },
  { id: 'M22', group: 'D', matchday: 2, team1: 'Türkiye',   team2: 'Paraguay', date: 'Fri 19 Jun', rawDay: 19, time: '21:00', venue: 'San Francisco' },
  { id: 'M23', group: 'D', matchday: 3, team1: 'Türkiye',   team2: 'USA',      date: 'Thu 25 Jun', rawDay: 25, time: '19:00', venue: 'Los Angeles'   },
  { id: 'M24', group: 'D', matchday: 3, team1: 'Paraguay',  team2: 'Australia',date: 'Thu 25 Jun', rawDay: 25, time: '19:00', venue: 'San Francisco' },
  // ── Group E ──────────────────────────────────────────────────────
  { id: 'M25', group: 'E', matchday: 1, team1: 'Germany',        team2: 'Curaçao',        date: 'Sun 14 Jun', rawDay: 14, time: '12:00', venue: 'Houston'      },
  { id: 'M26', group: 'E', matchday: 1, team1: "Côte d'Ivoire",  team2: 'Ecuador',        date: 'Sun 14 Jun', rawDay: 14, time: '19:00', venue: 'Philadelphia' },
  { id: 'M27', group: 'E', matchday: 2, team1: 'Germany',        team2: "Côte d'Ivoire",  date: 'Sat 20 Jun', rawDay: 20, time: '16:00', venue: 'Toronto'      },
  { id: 'M28', group: 'E', matchday: 2, team1: 'Ecuador',        team2: 'Curaçao',        date: 'Sat 20 Jun', rawDay: 20, time: '19:00', venue: 'Kansas City'  },
  { id: 'M29', group: 'E', matchday: 3, team1: 'Ecuador',        team2: 'Germany',        date: 'Thu 25 Jun', rawDay: 25, time: '16:00', venue: 'New York / NJ'},
  { id: 'M30', group: 'E', matchday: 3, team1: 'Curaçao',        team2: "Côte d'Ivoire",  date: 'Thu 25 Jun', rawDay: 25, time: '16:00', venue: 'Philadelphia' },
  // ── Group F ──────────────────────────────────────────────────────
  { id: 'M31', group: 'F', matchday: 1, team1: 'Netherlands', team2: 'Japan',       date: 'Sun 14 Jun', rawDay: 14, time: '15:00', venue: 'Dallas'      },
  { id: 'M32', group: 'F', matchday: 1, team1: 'Sweden',      team2: 'Tunisia',     date: 'Sun 14 Jun', rawDay: 14, time: '20:00', venue: 'Monterrey'   },
  { id: 'M33', group: 'F', matchday: 2, team1: 'Netherlands', team2: 'Sweden',      date: 'Sat 20 Jun', rawDay: 20, time: '12:00', venue: 'Houston'     },
  { id: 'M34', group: 'F', matchday: 2, team1: 'Tunisia',     team2: 'Japan',       date: 'Sat 20 Jun', rawDay: 20, time: '22:00', venue: 'Monterrey'   },
  { id: 'M35', group: 'F', matchday: 3, team1: 'Japan',       team2: 'Sweden',      date: 'Thu 25 Jun', rawDay: 25, time: '18:00', venue: 'Dallas'      },
  { id: 'M36', group: 'F', matchday: 3, team1: 'Tunisia',     team2: 'Netherlands', date: 'Thu 25 Jun', rawDay: 25, time: '18:00', venue: 'Kansas City' },
  // ── Group G ──────────────────────────────────────────────────────
  { id: 'M37', group: 'G', matchday: 1, team1: 'Belgium',     team2: 'Egypt',       date: 'Mon 15 Jun', rawDay: 15, time: '12:00', venue: 'Seattle'   },
  { id: 'M38', group: 'G', matchday: 1, team1: 'Iran',        team2: 'New Zealand', date: 'Mon 15 Jun', rawDay: 15, time: '18:00', venue: 'Los Angeles'},
  { id: 'M39', group: 'G', matchday: 2, team1: 'Belgium',     team2: 'Iran',        date: 'Sun 21 Jun', rawDay: 21, time: '12:00', venue: 'Los Angeles'},
  { id: 'M40', group: 'G', matchday: 2, team1: 'New Zealand', team2: 'Egypt',       date: 'Sun 21 Jun', rawDay: 21, time: '18:00', venue: 'Vancouver'  },
  { id: 'M41', group: 'G', matchday: 3, team1: 'Egypt',       team2: 'Iran',        date: 'Fri 26 Jun', rawDay: 26, time: '20:00', venue: 'Seattle'    },
  { id: 'M42', group: 'G', matchday: 3, team1: 'New Zealand', team2: 'Belgium',     date: 'Fri 26 Jun', rawDay: 26, time: '20:00', venue: 'Vancouver'  },
  // ── Group H ──────────────────────────────────────────────────────
  { id: 'M43', group: 'H', matchday: 1, team1: 'Spain',        team2: 'Cape Verde',   date: 'Mon 15 Jun', rawDay: 15, time: '12:00', venue: 'Atlanta'    },
  { id: 'M44', group: 'H', matchday: 1, team1: 'Saudi Arabia', team2: 'Uruguay',      date: 'Mon 15 Jun', rawDay: 15, time: '18:00', venue: 'Miami'      },
  { id: 'M45', group: 'H', matchday: 2, team1: 'Spain',        team2: 'Saudi Arabia', date: 'Sun 21 Jun', rawDay: 21, time: '12:00', venue: 'Atlanta'    },
  { id: 'M46', group: 'H', matchday: 2, team1: 'Uruguay',      team2: 'Cape Verde',   date: 'Sun 21 Jun', rawDay: 21, time: '18:00', venue: 'Miami'      },
  { id: 'M47', group: 'H', matchday: 3, team1: 'Cape Verde',   team2: 'Saudi Arabia', date: 'Fri 26 Jun', rawDay: 26, time: '19:00', venue: 'Houston'    },
  { id: 'M48', group: 'H', matchday: 3, team1: 'Uruguay',      team2: 'Spain',        date: 'Fri 26 Jun', rawDay: 26, time: '18:00', venue: 'Guadalajara'},
  // ── Group I ──────────────────────────────────────────────────────
  { id: 'M49', group: 'I', matchday: 1, team1: 'France',  team2: 'Senegal', date: 'Tue 16 Jun', rawDay: 16, time: '15:00', venue: 'New York / NJ' },
  { id: 'M50', group: 'I', matchday: 1, team1: 'Iraq',    team2: 'Norway',  date: 'Tue 16 Jun', rawDay: 16, time: '18:00', venue: 'Boston'        },
  { id: 'M51', group: 'I', matchday: 2, team1: 'France',  team2: 'Iraq',    date: 'Mon 22 Jun', rawDay: 22, time: '17:00', venue: 'Philadelphia'  },
  { id: 'M52', group: 'I', matchday: 2, team1: 'Norway',  team2: 'Senegal', date: 'Mon 22 Jun', rawDay: 22, time: '20:00', venue: 'New York / NJ' },
  { id: 'M53', group: 'I', matchday: 3, team1: 'Norway',  team2: 'France',  date: 'Fri 26 Jun', rawDay: 26, time: '15:00', venue: 'Boston'        },
  { id: 'M54', group: 'I', matchday: 3, team1: 'Senegal', team2: 'Iraq',    date: 'Fri 26 Jun', rawDay: 26, time: '15:00', venue: 'Toronto'       },
  // ── Group J ──────────────────────────────────────────────────────
  { id: 'M55', group: 'J', matchday: 1, team1: 'Argentina', team2: 'Algeria', date: 'Tue 16 Jun', rawDay: 16, time: '20:00', venue: 'Kansas City'   },
  { id: 'M56', group: 'J', matchday: 1, team1: 'Austria',   team2: 'Jordan',  date: 'Tue 16 Jun', rawDay: 16, time: '21:00', venue: 'San Francisco' },
  { id: 'M57', group: 'J', matchday: 2, team1: 'Argentina', team2: 'Austria', date: 'Mon 22 Jun', rawDay: 22, time: '12:00', venue: 'Dallas'        },
  { id: 'M58', group: 'J', matchday: 2, team1: 'Jordan',    team2: 'Algeria', date: 'Mon 22 Jun', rawDay: 22, time: '20:00', venue: 'San Francisco' },
  { id: 'M59', group: 'J', matchday: 3, team1: 'Algeria',   team2: 'Austria', date: 'Sat 27 Jun', rawDay: 27, time: '21:00', venue: 'Kansas City'   },
  { id: 'M60', group: 'J', matchday: 3, team1: 'Jordan',    team2: 'Argentina',date: 'Sat 27 Jun', rawDay: 27, time: '21:00', venue: 'Dallas'        },
  // ── Group K ──────────────────────────────────────────────────────
  { id: 'M61', group: 'K', matchday: 1, team1: 'Portugal',  team2: 'Congo DR',   date: 'Wed 17 Jun', rawDay: 17, time: '12:00', venue: 'Houston'    },
  { id: 'M62', group: 'K', matchday: 1, team1: 'Uzbekistan',team2: 'Colombia',   date: 'Wed 17 Jun', rawDay: 17, time: '20:00', venue: 'Mexico City'},
  { id: 'M63', group: 'K', matchday: 2, team1: 'Portugal',  team2: 'Uzbekistan', date: 'Tue 23 Jun', rawDay: 23, time: '12:00', venue: 'Houston'    },
  { id: 'M64', group: 'K', matchday: 2, team1: 'Colombia',  team2: 'Congo DR',   date: 'Tue 23 Jun', rawDay: 23, time: '20:00', venue: 'Guadalajara'},
  { id: 'M65', group: 'K', matchday: 3, team1: 'Colombia',  team2: 'Portugal',   date: 'Sat 27 Jun', rawDay: 27, time: '19:30', venue: 'Miami'      },
  { id: 'M66', group: 'K', matchday: 3, team1: 'Congo DR',  team2: 'Uzbekistan', date: 'Sat 27 Jun', rawDay: 27, time: '19:30', venue: 'Atlanta'    },
  // ── Group L ──────────────────────────────────────────────────────
  { id: 'M67', group: 'L', matchday: 1, team1: 'England', team2: 'Croatia', date: 'Wed 17 Jun', rawDay: 17, time: '15:00', venue: 'Dallas'        },
  { id: 'M68', group: 'L', matchday: 1, team1: 'Ghana',   team2: 'Panama',  date: 'Wed 17 Jun', rawDay: 17, time: '19:00', venue: 'Toronto'       },
  { id: 'M69', group: 'L', matchday: 2, team1: 'England', team2: 'Ghana',   date: 'Tue 23 Jun', rawDay: 23, time: '16:00', venue: 'Boston'        },
  { id: 'M70', group: 'L', matchday: 2, team1: 'Panama',  team2: 'Croatia', date: 'Tue 23 Jun', rawDay: 23, time: '19:00', venue: 'Toronto'       },
  { id: 'M71', group: 'L', matchday: 3, team1: 'Panama',  team2: 'England', date: 'Sat 27 Jun', rawDay: 27, time: '17:00', venue: 'New York / NJ' },
  { id: 'M72', group: 'L', matchday: 3, team1: 'Croatia', team2: 'Ghana',   date: 'Sat 27 Jun', rawDay: 27, time: '17:00', venue: 'Philadelphia'  },
];

// Sort by raw day then time for the matches-view default ordering.
GROUP_MATCHES.sort((a, b) => {
  if (a.rawDay !== b.rawDay) return a.rawDay - b.rawDay;
  if (a.time !== b.time) return a.time.localeCompare(b.time);
  return a.group.localeCompare(b.group);
});

// ISO 3166-1 alpha-2 codes for flagcdn.com. GB subdivisions use gb-eng / gb-sct.
// Historical nations (West Germany, Czechoslovakia) map to modern successor flags.
const FLAG_CODES = {
  'Algeria': 'dz', 'Argentina': 'ar', 'Australia': 'au', 'Austria': 'at',
  'Belgium': 'be', 'Bosnia & Herz.': 'ba', 'Brazil': 'br', 'Canada': 'ca',
  'Cape Verde': 'cv', "Côte d'Ivoire": 'ci', 'Colombia': 'co', 'Congo DR': 'cd',
  'Croatia': 'hr', 'Curaçao': 'cw', 'Czechia': 'cz', 'Ecuador': 'ec',
  'Egypt': 'eg', 'England': 'gb-eng', 'France': 'fr', 'Germany': 'de',
  'Ghana': 'gh', 'Haiti': 'ht', 'Iran': 'ir', 'Iraq': 'iq',
  'Japan': 'jp', 'Jordan': 'jo', 'Mexico': 'mx', 'Morocco': 'ma',
  'Netherlands': 'nl', 'New Zealand': 'nz', 'Norway': 'no', 'Panama': 'pa',
  'Paraguay': 'py', 'Portugal': 'pt', 'Qatar': 'qa', 'Saudi Arabia': 'sa',
  'Scotland': 'gb-sct', 'Senegal': 'sn', 'South Africa': 'za', 'South Korea': 'kr',
  'Spain': 'es', 'Sweden': 'se', 'Switzerland': 'ch', 'Tunisia': 'tn',
  'Türkiye': 'tr', 'Uruguay': 'uy', 'USA': 'us', 'Uzbekistan': 'uz',
  // Historical finals nations
  'Italy': 'it', 'Hungary': 'hu', 'Czechoslovakia': 'cz', 'West Germany': 'de',
  'Russia': 'ru', 'Chile': 'cl', 'Sweden (1958)': 'se', 'Slovenia': 'si',
};

function flagUrl(name, width) {
  const code = FLAG_CODES[name];
  return code ? `https://flagcdn.com/w${width || 20}/${code}.png` : null;
}

window.TEAMS_DATA = {
  GROUPS,
  GROUP_LETTERS,
  GROUP_MATCHES,
  HOST_CITIES,
  FIFA_RANKINGS,
  FIFA_POINTS,
  FIFA_RANKING_DATE: '1 April 2026',
  FLAG_CODES,
  flagUrl,
};
