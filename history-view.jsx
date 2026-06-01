// History view — World Cup winners leaderboard + tournament history
// All data sourced from Wikipedia: List of FIFA World Cup Finals

const WC_FINALS = [
  { year: 2022, host: 'Qatar',           winner: 'Argentina',   score: '3–3',  pens: '4–2', aet: false, runner_up: 'France'       },
  { year: 2018, host: 'Russia',          winner: 'France',      score: '4–2',  pens: null,   aet: false, runner_up: 'Croatia'      },
  { year: 2014, host: 'Brazil',          winner: 'Germany',     score: '1–0',  pens: null,   aet: true,  runner_up: 'Argentina'    },
  { year: 2010, host: 'South Africa',    winner: 'Spain',       score: '1–0',  pens: null,   aet: true,  runner_up: 'Netherlands'  },
  { year: 2006, host: 'Germany',         winner: 'Italy',       score: '1–1',  pens: '5–3',  aet: false, runner_up: 'France'       },
  { year: 2002, host: 'South Korea / Japan', winner: 'Brazil',  score: '2–0',  pens: null,   aet: false, runner_up: 'Germany'      },
  { year: 1998, host: 'France',          winner: 'France',      score: '3–0',  pens: null,   aet: false, runner_up: 'Brazil'       },
  { year: 1994, host: 'United States',   winner: 'Brazil',      score: '0–0',  pens: '3–2',  aet: false, runner_up: 'Italy'        },
  { year: 1990, host: 'Italy',           winner: 'West Germany',score: '1–0',  pens: null,   aet: false, runner_up: 'Argentina'    },
  { year: 1986, host: 'Mexico',          winner: 'Argentina',   score: '3–2',  pens: null,   aet: false, runner_up: 'West Germany' },
  { year: 1982, host: 'Spain',           winner: 'Italy',       score: '3–1',  pens: null,   aet: false, runner_up: 'West Germany' },
  { year: 1978, host: 'Argentina',       winner: 'Argentina',   score: '3–1',  pens: null,   aet: true,  runner_up: 'Netherlands'  },
  { year: 1974, host: 'West Germany',    winner: 'West Germany',score: '2–1',  pens: null,   aet: false, runner_up: 'Netherlands'  },
  { year: 1970, host: 'Mexico',          winner: 'Brazil',      score: '4–1',  pens: null,   aet: false, runner_up: 'Italy'        },
  { year: 1966, host: 'England',         winner: 'England',     score: '4–2',  pens: null,   aet: true,  runner_up: 'West Germany' },
  { year: 1962, host: 'Chile',           winner: 'Brazil',      score: '3–1',  pens: null,   aet: false, runner_up: 'Czechoslovakia'},
  { year: 1958, host: 'Sweden',          winner: 'Brazil',      score: '5–2',  pens: null,   aet: false, runner_up: 'Sweden'       },
  { year: 1954, host: 'Switzerland',     winner: 'West Germany',score: '3–2',  pens: null,   aet: false, runner_up: 'Hungary'      },
  { year: 1950, host: 'Brazil',          winner: 'Uruguay',     score: '2–1',  pens: null,   aet: false, runner_up: 'Brazil',       note: 'Final-round robin; deciding match' },
  { year: 1938, host: 'France',          winner: 'Italy',       score: '4–2',  pens: null,   aet: false, runner_up: 'Hungary'      },
  { year: 1934, host: 'Italy',           winner: 'Italy',       score: '2–1',  pens: null,   aet: true,  runner_up: 'Czechoslovakia'},
  { year: 1930, host: 'Uruguay',         winner: 'Uruguay',     score: '4–2',  pens: null,   aet: false, runner_up: 'Argentina'    },
];

// Leaderboard: combine Germany and West Germany under "Germany"
function buildLeaderboard(finals) {
  const counts = {};
  const years = {};
  finals.forEach(f => {
    const w = f.winner === 'West Germany' ? 'Germany' : f.winner;
    counts[w] = (counts[w] || 0) + 1;
    if (!years[w]) years[w] = [];
    years[w].push(f.year);
  });
  return Object.entries(counts)
    .map(([country, wins]) => ({ country, wins, years: years[country].sort((a, b) => a - b) }))
    .sort((a, b) => b.wins - a.wins || a.country.localeCompare(b.country));
}

function FlagImg({ name, width }) {
  const url = window.TEAMS_DATA?.flagUrl(name, width || 20);
  if (!url) return null;
  return <img src={url} alt={name} className="team-flag" onError={e => { e.target.style.display = 'none'; }} />;
}

function ScoreCell({ final }) {
  const parts = [];
  if (final.pens) {
    parts.push(`${final.score} (a.e.t.)`);
    parts.push(`${final.pens} pens`);
  } else if (final.aet) {
    parts.push(`${final.score} (a.e.t.)`);
  } else {
    parts.push(final.score);
  }
  return (
    <td className="hv-score">
      <span className="hv-score-main">{parts[0]}</span>
      {parts[1] && <span className="hv-score-pens">{parts[1]}</span>}
    </td>
  );
}

function HistoryView() {
  const leaderboard = buildLeaderboard(WC_FINALS);

  return (
    <div className="hv-wrap">
      <section className="hv-section">
        <h2 className="hv-section-title">World Cup Winners</h2>
        <div className="hv-leaderboard">
          {leaderboard.map((row, i) => (
            <div key={row.country} className="hv-lb-row">
              <span className="hv-lb-rank">{i + 1}</span>
              <FlagImg name={row.country} /><span className="hv-lb-country">{row.country}</span>
              <span className="hv-lb-wins">{row.wins}</span>
              <span className="hv-lb-years">{row.years.join(', ')}</span>
            </div>
          ))}
        </div>
        <p className="hv-footnote">Germany and West Germany counted together.</p>
      </section>

      <section className="hv-section">
        <h2 className="hv-section-title">Tournament Finals</h2>
        <div className="hv-table-wrap">
          <table className="hv-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Host</th>
                <th className="hv-winner-col">Winner</th>
                <th>Score</th>
                <th>Runner-up</th>
              </tr>
            </thead>
            <tbody>
              {WC_FINALS.map(f => (
                <tr key={f.year} className={f.note ? 'hv-notable' : ''}>
                  <td className="hv-year">{f.year}</td>
                  <td className="hv-host">{f.host}</td>
                  <td className="hv-winner"><FlagImg name={f.winner} /> {f.winner}</td>
                  <ScoreCell final={f} />
                  <td className="hv-runner"><FlagImg name={f.runner_up} /> {f.runner_up}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hv-footnote">1950 used a final round-robin; the deciding match between Uruguay and Brazil is listed.</p>
      </section>
    </div>
  );
}

window.HistoryView = HistoryView;
