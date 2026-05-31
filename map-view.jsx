// Map view — 2026 World Cup venue locations + historical World Cup final venues
const { useEffect: useEffectMap, useRef: useRefMap } = React;

// ── 2026 venues ───────────────────────────────────────────────────────────────
const VENUE_COORDS = {
  'Atlanta':       { lat: 33.7553,  lng: -84.4006,  stadium: 'Mercedes-Benz Stadium'   },
  'Boston':        { lat: 42.0909,  lng: -71.2643,  stadium: 'Gillette Stadium'         },
  'Dallas':        { lat: 32.7480,  lng: -97.0929,  stadium: 'AT&T Stadium'             },
  'Houston':       { lat: 29.6847,  lng: -95.4107,  stadium: 'NRG Stadium'              },
  'Kansas City':   { lat: 39.0489,  lng: -94.4839,  stadium: 'Arrowhead Stadium'        },
  'Los Angeles':   { lat: 33.9534,  lng: -118.3390, stadium: 'SoFi Stadium'             },
  'Miami':         { lat: 25.9580,  lng: -80.2389,  stadium: 'Hard Rock Stadium'        },
  'New York / NJ': { lat: 40.8135,  lng: -74.0745,  stadium: 'MetLife Stadium'          },
  'Philadelphia':  { lat: 39.9008,  lng: -75.1675,  stadium: 'Lincoln Financial Field'  },
  'Seattle':       { lat: 47.5952,  lng: -122.3316, stadium: 'Lumen Field'              },
  'San Francisco': { lat: 37.4033,  lng: -121.9694, stadium: "Levi's Stadium"           },
  'Toronto':       { lat: 43.6333,  lng: -79.4189,  stadium: 'BMO Field'                },
  'Vancouver':     { lat: 49.2769,  lng: -123.1119, stadium: 'BC Place'                 },
  'Guadalajara':   { lat: 20.6892,  lng: -103.3214, stadium: 'Estadio Akron'            },
  'Mexico City':   { lat: 19.3029,  lng: -99.1505,  stadium: 'Estadio Azteca'           },
  'Monterrey':     { lat: 25.6693,  lng: -100.3107, stadium: 'Estadio BBVA'             },
};

// ── Historical World Cup finals ───────────────────────────────────────────────
// Grouped by stadium: Azteca (1970 + 1986) and Maracanã (1950 + 2014) share a marker.
// Coordinates sourced from Wikipedia / OpenStreetMap for each stadium.
const HISTORICAL_FINALS = [
  { year: 1930, city: 'Montevideo',   country: 'Uruguay',       stadium: 'Estadio Centenario',          lat: -34.8941, lng: -56.1542,  date: '30 Jul 1930', winner: 'Uruguay',      score: '4–2', pens: null,  aet: false, runner_up: 'Argentina'      },
  { year: 1934, city: 'Rome',         country: 'Italy',         stadium: 'Stadio Nazionale PNF',        lat:  41.9063, lng:  12.4725,  date: '10 Jun 1934', winner: 'Italy',        score: '2–1', pens: null,  aet: true,  runner_up: 'Czechoslovakia' },
  { year: 1938, city: 'Colombes',     country: 'France',        stadium: 'Stade Olympique de Colombes', lat:  48.9134, lng:   2.2494,  date: '19 Jun 1938', winner: 'Italy',        score: '4–2', pens: null,  aet: false, runner_up: 'Hungary'        },
  { year: 1950, city: 'Rio de Janeiro',country: 'Brazil',       stadium: 'Maracanã',                    lat: -22.9122, lng: -43.2303,  date: '16 Jul 1950', winner: 'Uruguay',      score: '2–1', pens: null,  aet: false, runner_up: 'Brazil'         },
  { year: 1954, city: 'Bern',         country: 'Switzerland',   stadium: 'Wankdorf Stadium',            lat:  46.9734, lng:   7.4670,  date: '4 Jul 1954',  winner: 'West Germany', score: '3–2', pens: null,  aet: false, runner_up: 'Hungary'        },
  { year: 1958, city: 'Solna',        country: 'Sweden',        stadium: 'Råsunda Stadium',             lat:  59.3728, lng:  17.9975,  date: '29 Jun 1958', winner: 'Brazil',       score: '5–2', pens: null,  aet: false, runner_up: 'Sweden'         },
  { year: 1962, city: 'Santiago',     country: 'Chile',         stadium: 'Estadio Nacional',            lat: -33.4651, lng: -70.6097,  date: '17 Jun 1962', winner: 'Brazil',       score: '3–1', pens: null,  aet: false, runner_up: 'Czechoslovakia' },
  { year: 1966, city: 'London',       country: 'England',       stadium: 'Wembley Stadium',             lat:  51.5560, lng:  -0.2796,  date: '30 Jul 1966', winner: 'England',      score: '4–2', pens: null,  aet: true,  runner_up: 'West Germany'   },
  { year: 1970, city: 'Mexico City',  country: 'Mexico',        stadium: 'Estadio Azteca',              lat:  19.3029, lng: -99.1505,  date: '21 Jun 1970', winner: 'Brazil',       score: '4–1', pens: null,  aet: false, runner_up: 'Italy'          },
  { year: 1974, city: 'Munich',       country: 'West Germany',  stadium: 'Olympiastadion München',      lat:  48.1736, lng:  11.5466,  date: '7 Jul 1974',  winner: 'West Germany', score: '2–1', pens: null,  aet: false, runner_up: 'Netherlands'    },
  { year: 1978, city: 'Buenos Aires', country: 'Argentina',     stadium: 'Estadio Monumental',          lat: -34.5454, lng: -58.4498,  date: '25 Jun 1978', winner: 'Argentina',    score: '3–1', pens: null,  aet: true,  runner_up: 'Netherlands'    },
  { year: 1982, city: 'Madrid',       country: 'Spain',         stadium: 'Santiago Bernabéu',           lat:  40.4531, lng:  -3.6883,  date: '11 Jul 1982', winner: 'Italy',        score: '3–1', pens: null,  aet: false, runner_up: 'West Germany'   },
  { year: 1986, city: 'Mexico City',  country: 'Mexico',        stadium: 'Estadio Azteca',              lat:  19.3029, lng: -99.1505,  date: '29 Jun 1986', winner: 'Argentina',    score: '3–2', pens: null,  aet: false, runner_up: 'West Germany'   },
  { year: 1990, city: 'Rome',         country: 'Italy',         stadium: 'Stadio Olimpico',             lat:  41.9335, lng:  12.4543,  date: '8 Jul 1990',  winner: 'West Germany', score: '1–0', pens: null,  aet: false, runner_up: 'Argentina'      },
  { year: 1994, city: 'Pasadena',     country: 'United States', stadium: 'Rose Bowl',                   lat:  34.1617, lng: -118.1677, date: '17 Jul 1994', winner: 'Brazil',       score: '0–0', pens: '3–2', aet: false, runner_up: 'Italy'          },
  { year: 1998, city: 'Saint-Denis',  country: 'France',        stadium: 'Stade de France',             lat:  48.9244, lng:   2.3601,  date: '12 Jul 1998', winner: 'France',       score: '3–0', pens: null,  aet: false, runner_up: 'Brazil'         },
  { year: 2002, city: 'Yokohama',     country: 'Japan',         stadium: 'Int. Stadium Yokohama',       lat:  35.5060, lng: 139.6062,  date: '30 Jun 2002', winner: 'Brazil',       score: '2–0', pens: null,  aet: false, runner_up: 'Germany'        },
  { year: 2006, city: 'Berlin',       country: 'Germany',       stadium: 'Olympiastadion Berlin',       lat:  52.5145, lng:  13.2396,  date: '9 Jul 2006',  winner: 'Italy',        score: '1–1', pens: '5–3', aet: false, runner_up: 'France'         },
  { year: 2010, city: 'Johannesburg', country: 'South Africa',  stadium: 'FNB Stadium',                 lat: -26.2348, lng:  27.9800,  date: '11 Jul 2010', winner: 'Spain',        score: '1–0', pens: null,  aet: true,  runner_up: 'Netherlands'    },
  { year: 2014, city: 'Rio de Janeiro',country: 'Brazil',       stadium: 'Maracanã',                    lat: -22.9122, lng: -43.2303,  date: '13 Jul 2014', winner: 'Germany',      score: '1–0', pens: null,  aet: true,  runner_up: 'Argentina'      },
  { year: 2018, city: 'Moscow',       country: 'Russia',        stadium: 'Luzhniki Stadium',            lat:  55.7349, lng:  37.5634,  date: '15 Jul 2018', winner: 'France',       score: '4–2', pens: null,  aet: false, runner_up: 'Croatia'        },
  { year: 2022, city: 'Lusail',       country: 'Qatar',         stadium: 'Lusail Stadium',              lat:  25.4338, lng:  51.4547,  date: '18 Dec 2022', winner: 'Argentina',    score: '3–3', pens: '4–2', aet: false, runner_up: 'France'         },
];

function fmtResult(f) {
  let s = `${f.winner} ${f.score} ${f.runner_up}`;
  if (f.pens) return s + ` (${f.pens} pens.)`;
  if (f.aet)  return s + ` (a.e.t.)`;
  return s;
}

// Group finals by stadium so Azteca (×2) and Maracanã (×2) share one marker
function groupHistoricalFinals() {
  const groups = {};
  HISTORICAL_FINALS.forEach(f => {
    const key = f.stadium;
    if (!groups[key]) groups[key] = { lat: f.lat, lng: f.lng, city: f.city, country: f.country, stadium: f.stadium, finals: [] };
    groups[key].finals.push(f);
  });
  return Object.values(groups);
}

function buildHistoricalPopup(g) {
  const rows = g.finals.map(f =>
    `<div class="mp-hist-final">
      <div class="mp-hist-year">${f.year}</div>
      <div class="mp-hist-detail">
        <span class="mp-hist-date">${f.date}</span>
        <span class="mp-hist-result">${fmtResult(f)}</span>
      </div>
    </div>`
  ).join('');
  return `<div class="mp-popup">
    <div class="mp-header">
      <strong>${g.city}, ${g.country}</strong>
      <span>${g.stadium}</span>
    </div>
    <div class="mp-matches">${rows}</div>
  </div>`;
}

// ── 2026 venue match helpers ──────────────────────────────────────────────────
const STAGE_LABELS = {
  R32: 'Round of 32', R16: 'Round of 16', QF: 'Quarter-final',
  SF: 'Semi-final', '3rd': 'Third place', Final: 'Final',
};

function buildVenueMatches() {
  const byVenue = {};
  Object.keys(VENUE_COORDS).forEach(v => { byVenue[v] = []; });

  if (window.TEAMS_DATA?.GROUP_MATCHES) {
    window.TEAMS_DATA.GROUP_MATCHES.forEach(m => {
      if (!byVenue[m.venue]) return;
      byVenue[m.venue].push({ date: m.date, time: m.time, label: `Group ${m.group} · MD${m.matchday}`, t1: m.team1, t2: m.team2, rawDay: m.rawDay });
    });
  }

  if (window.BRACKET) {
    const KO_DAY_MAP = {
      'Sat 27 Jun':27,'Sun 28 Jun':28,'Mon 29 Jun':29,'Tue 30 Jun':30,
      'Wed 1 Jul':31,'Thu 2 Jul':32,'Fri 3 Jul':33,'Sat 4 Jul':34,
      'Sun 5 Jul':35,'Mon 6 Jul':36,'Tue 7 Jul':37,'Thu 9 Jul':39,
      'Fri 10 Jul':40,'Tue 14 Jul':44,'Wed 15 Jul':45,'Sat 18 Jul':48,'Sun 19 Jul':49,
    };
    const ko = [
      ...window.BRACKET.R32.map(m => ({ ...m, stage: 'R32' })),
      ...window.BRACKET.R16.map(m => ({ ...m, stage: 'R16' })),
      ...window.BRACKET.QF.map(m  => ({ ...m, stage: 'QF'  })),
      ...window.BRACKET.SF.map(m  => ({ ...m, stage: 'SF'  })),
      { ...window.BRACKET.TP,    stage: '3rd'   },
      { ...window.BRACKET.FINAL, stage: 'Final' },
    ];
    ko.forEach(m => {
      if (!m?.venue || !byVenue[m.venue]) return;
      byVenue[m.venue].push({ date: m.date, time: m.time, label: STAGE_LABELS[m.stage] || m.stage, t1: m.team1.name, t2: m.team2.name, rawDay: KO_DAY_MAP[m.date] ?? 99 });
    });
  }

  Object.values(byVenue).forEach(arr => arr.sort((a, b) => a.rawDay !== b.rawDay ? a.rawDay - b.rawDay : a.time.localeCompare(b.time)));
  return byVenue;
}

function buildVenuePopup(city, v, matches) {
  const rows = matches.map(m =>
    `<div class="mp-match">
      <div class="mp-match-meta">
        <span class="mp-match-date">${m.date} · ${m.time}</span>
        <span class="mp-match-stage">${m.label}</span>
      </div>
      <div class="mp-match-teams">${m.t1} <span class="mp-vs">vs</span> ${m.t2}</div>
    </div>`
  ).join('');
  return `<div class="mp-popup">
    <div class="mp-header"><strong>${city}</strong><span>${v.stadium}</span></div>
    <div class="mp-matches">${rows}</div>
  </div>`;
}

// ── Component ─────────────────────────────────────────────────────────────────
function MapView() {
  const containerRef = useRefMap(null);
  const mapRef = useRefMap(null);

  useEffectMap(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { center: [37, -96], zoom: 4 });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(map);

    // Historical finals — blue markers, added first (sit below 2026 markers)
    groupHistoricalFinals().forEach(g => {
      L.circleMarker([g.lat, g.lng], {
        radius: 7, fillColor: '#60a5fa', color: '#0b1020',
        weight: 2, opacity: 1, fillOpacity: 0.85,
      })
      .bindPopup(buildHistoricalPopup(g), { maxWidth: 320 })
      .addTo(map);
    });

    // 2026 venues — amber markers on top
    const venueMatches = buildVenueMatches();
    Object.entries(VENUE_COORDS).forEach(([city, v]) => {
      L.circleMarker([v.lat, v.lng], {
        radius: 9, fillColor: '#f5a524', color: '#0b1020',
        weight: 2, opacity: 1, fillOpacity: 0.9,
      })
      .bindPopup(buildVenuePopup(city, v, venueMatches[city] || []), { maxWidth: 320 })
      .addTo(map);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} className="map-container" />
      <div className="map-legend">
        <span className="map-legend-dot" style={{ background: '#f5a524' }} /> 2026 venue
        <span className="map-legend-dot" style={{ background: '#60a5fa', marginLeft: 12 }} /> Historical final
      </div>
    </div>
  );
}

window.MapView = MapView;
