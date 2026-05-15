// 2026 World Cup knockout bracket data
// Format: 32 teams advance from group stage (groups A-L, plus 8 best 3rd-placed)
// Knockout: R32 → R16 → QF → SF → Final (+ 3rd place playoff)

const VENUES = {
  ATL: 'Atlanta',
  BOS: 'Boston',
  DAL: 'Dallas',
  HOU: 'Houston',
  KAN: 'Kansas City',
  LAX: 'Los Angeles',
  MIA: 'Miami',
  NYC: 'New York / NJ',
  PHI: 'Philadelphia',
  SEA: 'Seattle',
  SFO: 'San Francisco',
  TOR: 'Toronto',
  VAN: 'Vancouver',
  GDL: 'Guadalajara',
  MEX: 'Mexico City',
  MTY: 'Monterrey',
};

// Helper: format "Winner Group A" etc
const W = (g) => `Winner Group ${g}`;
const R = (g) => `Runner-up Group ${g}`;
const T3 = (...groups) => `3rd · Group ${groups.join('/')}`;
const Wm = (id) => `Winner Match ${id}`;
const Lm = (id) => `Loser Match ${id}`;

// ----- ROUND OF 32 -----
// 16 matches, June 28 – July 3
const R32 = [
  // Top half — feeds QF1, QF2
  { id: 'M73', date: 'Sat 27 Jun', time: '12:00', venue: VENUES.PHI, team1: { src: '1A', name: W('A') }, team2: { src: '3CDEF', name: T3('C','D','E','F') } },
  { id: 'M74', date: 'Sat 27 Jun', time: '15:00', venue: VENUES.DAL, team1: { src: '1C', name: W('C') }, team2: { src: '3ABFG', name: T3('A','B','F','G') } },
  { id: 'M75', date: 'Sun 28 Jun', time: '12:00', venue: VENUES.NYC, team1: { src: '1B', name: W('B') }, team2: { src: '2F', name: R('F') } },
  { id: 'M76', date: 'Sun 28 Jun', time: '16:00', venue: VENUES.LAX, team1: { src: '1D', name: W('D') }, team2: { src: '3BEHI', name: T3('B','E','H','I') } },

  { id: 'M77', date: 'Mon 29 Jun', time: '13:00', venue: VENUES.ATL, team1: { src: '1E', name: W('E') }, team2: { src: '2I', name: R('I') } },
  { id: 'M78', date: 'Mon 29 Jun', time: '17:00', venue: VENUES.BOS, team1: { src: '1G', name: W('G') }, team2: { src: '3HIJK', name: T3('H','I','J','K') } },
  { id: 'M79', date: 'Tue 30 Jun', time: '14:00', venue: VENUES.MEX, team1: { src: '1F', name: W('F') }, team2: { src: '2C', name: R('C') } },
  { id: 'M80', date: 'Tue 30 Jun', time: '20:00', venue: VENUES.GDL, team1: { src: '1H', name: W('H') }, team2: { src: '2A', name: R('A') } },

  // Bottom half — feeds QF3, QF4
  { id: 'M81', date: 'Wed 1 Jul', time: '12:00', venue: VENUES.MIA, team1: { src: '1I', name: W('I') }, team2: { src: '3DEGL', name: T3('D','E','G','L') } },
  { id: 'M82', date: 'Wed 1 Jul', time: '16:00', venue: VENUES.HOU, team1: { src: '1K', name: W('K') }, team2: { src: '3ACFL', name: T3('A','C','F','L') } },
  { id: 'M83', date: 'Thu 2 Jul', time: '13:00', venue: VENUES.SEA, team1: { src: '1J', name: W('J') }, team2: { src: '2L', name: R('L') } },
  { id: 'M84', date: 'Thu 2 Jul', time: '17:00', venue: VENUES.SFO, team1: { src: '1L', name: W('L') }, team2: { src: '2J', name: R('J') } },

  { id: 'M85', date: 'Fri 3 Jul', time: '12:00', venue: VENUES.TOR, team1: { src: '2B', name: R('B') }, team2: { src: '2H', name: R('H') } },
  { id: 'M86', date: 'Fri 3 Jul', time: '16:00', venue: VENUES.VAN, team1: { src: '2D', name: R('D') }, team2: { src: '2K', name: R('K') } },
  { id: 'M87', date: 'Fri 3 Jul', time: '19:00', venue: VENUES.KAN, team1: { src: '2E', name: R('E') }, team2: { src: '2G', name: R('G') } },
  { id: 'M88', date: 'Fri 3 Jul', time: '21:00', venue: VENUES.MTY, team1: { src: '1M-fill', name: R('I') + ' / 3rd' }, team2: { src: '3-fill', name: T3('B','C','D','J') } },
];

// ----- ROUND OF 16 -----
const R16 = [
  { id: 'M89', date: 'Sat 4 Jul', time: '12:00', venue: VENUES.PHI, team1: { src: 'Wm73', name: Wm('73') }, team2: { src: 'Wm74', name: Wm('74') } },
  { id: 'M90', date: 'Sat 4 Jul', time: '16:00', venue: VENUES.DAL, team1: { src: 'Wm75', name: Wm('75') }, team2: { src: 'Wm76', name: Wm('76') } },
  { id: 'M91', date: 'Sun 5 Jul', time: '13:00', venue: VENUES.ATL, team1: { src: 'Wm77', name: Wm('77') }, team2: { src: 'Wm78', name: Wm('78') } },
  { id: 'M92', date: 'Sun 5 Jul', time: '17:00', venue: VENUES.BOS, team1: { src: 'Wm79', name: Wm('79') }, team2: { src: 'Wm80', name: Wm('80') } },
  { id: 'M93', date: 'Mon 6 Jul', time: '13:00', venue: VENUES.MIA, team1: { src: 'Wm81', name: Wm('81') }, team2: { src: 'Wm82', name: Wm('82') } },
  { id: 'M94', date: 'Mon 6 Jul', time: '17:00', venue: VENUES.SEA, team1: { src: 'Wm83', name: Wm('83') }, team2: { src: 'Wm84', name: Wm('84') } },
  { id: 'M95', date: 'Tue 7 Jul', time: '13:00', venue: VENUES.TOR, team1: { src: 'Wm85', name: Wm('85') }, team2: { src: 'Wm86', name: Wm('86') } },
  { id: 'M96', date: 'Tue 7 Jul', time: '17:00', venue: VENUES.NYC, team1: { src: 'Wm87', name: Wm('87') }, team2: { src: 'Wm88', name: Wm('88') } },
];

// ----- QUARTER FINALS -----
const QF = [
  { id: 'M97', date: 'Thu 9 Jul', time: '15:00', venue: VENUES.LAX, team1: { src: 'Wm89', name: Wm('89') }, team2: { src: 'Wm90', name: Wm('90') } },
  { id: 'M98', date: 'Thu 9 Jul', time: '20:00', venue: VENUES.DAL, team1: { src: 'Wm91', name: Wm('91') }, team2: { src: 'Wm92', name: Wm('92') } },
  { id: 'M99', date: 'Fri 10 Jul', time: '15:00', venue: VENUES.KAN, team1: { src: 'Wm93', name: Wm('93') }, team2: { src: 'Wm94', name: Wm('94') } },
  { id: 'M100', date: 'Fri 10 Jul', time: '20:00', venue: VENUES.MIA, team1: { src: 'Wm95', name: Wm('95') }, team2: { src: 'Wm96', name: Wm('96') } },
];

// ----- SEMI FINALS -----
const SF = [
  { id: 'M101', date: 'Tue 14 Jul', time: '15:00', venue: VENUES.DAL, team1: { src: 'Wm97', name: Wm('97') }, team2: { src: 'Wm98', name: Wm('98') } },
  { id: 'M102', date: 'Wed 15 Jul', time: '15:00', venue: VENUES.ATL, team1: { src: 'Wm99', name: Wm('99') }, team2: { src: 'Wm100', name: Wm('100') } },
];

// ----- THIRD PLACE -----
const TP = {
  id: 'M103', date: 'Sat 18 Jul', time: '15:00', venue: VENUES.MIA,
  team1: { src: 'Lm101', name: Lm('101') }, team2: { src: 'Lm102', name: Lm('102') }
};

// ----- FINAL -----
const FINAL = {
  id: 'M104', date: 'Sun 19 Jul', time: '15:00', venue: VENUES.NYC,
  team1: { src: 'Wm101', name: Wm('101') }, team2: { src: 'Wm102', name: Wm('102') }
};

window.BRACKET = { R32, R16, QF, SF, TP, FINAL, VENUES };
