// 48 qualified teams in 12 groups (A-L), plus generated 72-match group-stage schedule.
// Groups reflect the confirmed FIFA World Cup 2026 group-stage draw.

const GROUPS = {
  A: { teams: ['Mexico', 'South Korea', 'Czechia', 'South Africa'] },
  B: { teams: ['Switzerland', 'Canada', 'Qatar', 'Bosnia and Herzegovina'] },
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
  'Bosnia and Herzegovina': 65,
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
  'Bosnia and Herzegovina': 1385.84,
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
// Each group plays 3 matchdays.  Pairings: (1-2,3-4) (1-3,4-2) (1-4,2-3)
// MD3 of each group is "simultaneous" (both matches kick off together) per FIFA rules.

const PAIRINGS = [
  [0, 1], [2, 3], // MD1
  [0, 2], [3, 1], // MD2
  [0, 3], [1, 2], // MD3
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function dateLabel(day) {
  // day = 11..27 in June
  // June 11, 2026 is a Thursday
  const dow = (DAY_NAMES.indexOf('Thu') + (day - 11)) % 7;
  return `${DAY_NAMES[dow]} ${day} Jun`;
}

function buildGroupMatches() {
  const all = [];
  let mid = 1;
  GROUP_LETTERS.forEach((g, gi) => {
    // Group MD1 start day: stagger groups so 2 groups share each kickoff day
    const md1Day = 11 + Math.floor(gi / 2);   // 11,11,12,12,13,13,14,14,15,15,16,16
    const md2Day = md1Day + 6;
    const md3Day = md1Day + 11;
    const days = [md1Day, md1Day, md2Day, md2Day, md3Day, md3Day];
    const slots = ['15:00', '18:00', '15:00', '18:00', '20:00', '20:00'];
    PAIRINGS.forEach((p, pi) => {
      const md = Math.floor(pi / 2) + 1;
      const i1 = p[0], i2 = p[1];
      const day = days[pi];
      const venue = HOST_CITIES[(gi * 6 + pi) % HOST_CITIES.length];
      all.push({
        id: `M${mid++}`,
        group: g,
        matchday: md,
        team1Idx: i1,
        team2Idx: i2,
        team1: GROUPS[g].teams[i1],
        team2: GROUPS[g].teams[i2],
        date: dateLabel(day),
        rawDay: day,
        time: slots[pi],
        venue,
      });
    });
  });
  return all;
}

const GROUP_MATCHES = buildGroupMatches();

// Sort by raw day then time for the matches-view default ordering.
GROUP_MATCHES.sort((a, b) => {
  if (a.rawDay !== b.rawDay) return a.rawDay - b.rawDay;
  if (a.time !== b.time) return a.time.localeCompare(b.time);
  return a.group.localeCompare(b.group);
});

window.TEAMS_DATA = {
  GROUPS,
  GROUP_LETTERS,
  GROUP_MATCHES,
  HOST_CITIES,
  FIFA_RANKINGS,
  FIFA_POINTS,
  FIFA_RANKING_DATE: '1 April 2026',
};
