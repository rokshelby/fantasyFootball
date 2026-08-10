const managerColors = {
  "Commishin aint easy": "blue",
  "Same Season Diff Team": "red",
  "Dicker Downs": "green",
  "Tig Ol Griddys": "orange",
  "We Get Big Ol TDs": "purple",
  "SF 49ers Played Me": "teal",
  "Bobz Cartel": "pink",
  "Caleb and The Revolution": "brown",
  "Stafford Infection": "cyan",
  "Stew's Super Quokkas": "magenta",
  "Alabama Assault": "lime",
  "Odunze Day": "yellow"
};

// Fallback palette for names that don't match managerColors (older/renamed teams)
const fallbackPalette = ["gray", "indigo", "coral", "olive", "navy", "maroon", "steelblue"];
function colorFor(name, index) {
  return managerColors[name] || fallbackPalette[index % fallbackPalette.length];
}

// Years with a full regular season archived at archive/<year>/matches<year>.json
const STANDINGS_YEARS = [2025, 2024, 2023, 2022, 2021, 2020];

let rankChart, pointsChart;

// Reconstructs weekly rank + cumulative points from raw regular-season matches.
// This is calculated on the fly (wins, then points-for as tiebreaker) — it is
// not necessarily identical to any historically recorded platform standings.
function computeWeeklyStandings(matches) {
  const regSeason = matches.filter(m => m.week_type === 'regular_season');
  const weeks = Array.from(new Set(regSeason.map(m => m.week))).sort((a, b) => a - b);

  const names = Array.from(new Set(regSeason.flatMap(m => [m.manager_a_id, m.manager_b_id])));

  const stats = {};
  names.forEach(name => { stats[name] = { wins: 0, pointsFor: 0 }; });

  const rankByWeek = {};
  const pointsByWeek = {};
  names.forEach(name => { rankByWeek[name] = []; pointsByWeek[name] = []; });

  weeks.forEach(week => {
    regSeason.filter(m => m.week === week).forEach(m => {
      stats[m.manager_a_id].pointsFor += m.score_a;
      stats[m.manager_b_id].pointsFor += m.score_b;

      if (m.winner_id === m.manager_a_id) {
        stats[m.manager_a_id].wins++;
      } else if (m.winner_id === m.manager_b_id) {
        stats[m.manager_b_id].wins++;
      }
    });

    const ranked = [...names].sort((a, b) => {
      if (stats[b].wins !== stats[a].wins) return stats[b].wins - stats[a].wins;
      return stats[b].pointsFor - stats[a].pointsFor;
    });

    ranked.forEach((name, i) => {
      rankByWeek[name].push(i + 1);
      pointsByWeek[name].push(Math.round(stats[name].pointsFor * 100) / 100);
    });
  });

  return { weeks, names, rankByWeek, pointsByWeek };
}

async function loadStandingsYear(year) {
  const highScoresSection = document.getElementById("weeklyHighScores");
  highScoresSection.innerHTML = '';

  try {
    const res = await fetch(`archive/${year}/matches${year}.json`);
    if (!res.ok) throw new Error(`Failed to load matches for ${year}`);
    const matches = await res.json();

    const { weeks, names, rankByWeek, pointsByWeek } = computeWeeklyStandings(matches);

    if (rankChart) rankChart.destroy();
    if (pointsChart) pointsChart.destroy();

    const ctx1 = document.getElementById("managersLineChart").getContext("2d");
    rankChart = new Chart(ctx1, {
      type: "line",
      data: {
        labels: weeks.map(w => `W${w}`),
        datasets: names.map((name, i) => ({
          label: name,
          data: rankByWeek[name],
          borderColor: colorFor(name, i),
          backgroundColor: colorFor(name, i),
          tension: 0.3,
          fill: false
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          title: { display: true, text: `${year} League Standing (Calculated)` }
        },
        scales: {
          y: {
            reverse: true,
            suggestedMin: 0.5,
            suggestedMax: names.length + 0.5,
            ticks: { stepSize: 1, callback: value => `#${value}` },
            title: { display: true, text: "League Standing" }
          },
          x: { title: { display: true, text: "Week" } }
        }
      }
    });

    const ctx2 = document.getElementById("managersLineChart2").getContext("2d");
    pointsChart = new Chart(ctx2, {
      type: "line",
      data: {
        labels: weeks.map(w => `W${w}`),
        datasets: names.map((name, i) => ({
          label: name,
          data: pointsByWeek[name],
          borderColor: colorFor(name, i),
          backgroundColor: colorFor(name, i),
          tension: 0.3,
          fill: false
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          title: { display: true, text: `${year} Cumulative Points For (Calculated)` }
        },
        scales: {
          y: { title: { display: true, text: "Total Points" } },
          x: { title: { display: true, text: "Week" } }
        }
      }
    });

    // Weekly high scores (across all weeks, including playoffs)
    let allWeeks = Array.from(new Set(matches.map(g => g.week))).sort((a, b) => b - a);

    for (let w of allWeeks) {
      const weekGames = matches.filter(g => g.week === w);

      let highScore = -Infinity;
      let highManager = null;

      for (const g of weekGames) {
        if (g.score_a > highScore) {
          highScore = g.score_a;
          highManager = g.manager_a_id;
        }
        if (g.score_b > highScore) {
          highScore = g.score_b;
          highManager = g.manager_b_id;
        }
      }

      highScoresSection.innerHTML += `
        <div class="week-header"></div>
        <ul>
          <li>Week ${w} - High Score: ${highManager} (${highScore} pts)</li>
        </ul>
      `;
    }

  } catch (err) {
    console.error("Error loading standings data:", err);
    highScoresSection.innerHTML = '<p>No standings data available for this year.</p>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("standingsYearSelect");
  if (!select) return;

  STANDINGS_YEARS.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    select.appendChild(option);
  });

  select.addEventListener("change", () => loadStandingsYear(select.value));

  select.value = STANDINGS_YEARS[0];
  loadStandingsYear(select.value);
});
