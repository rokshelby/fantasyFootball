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


fetch('data/standings.json')
  .then(res => res.json())
  .then(data => {
    const ctx = document.getElementById('managersLineChart').getContext('2d');

    const datasets = data.managers.map(manager => ({
  label: manager.name,
  data: manager.scores, // weekly standings
  borderColor: managerColors[manager.name] || "gray",
  backgroundColor: managerColors[manager.name] || "gray",
  tension: 0.3,
  fill: false
}));

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.weeks,
        datasets: datasets
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'League Standing' }
        },
        scales: {
          y: {
            reverse: true,           // #1 on top
            suggestedMin: 0.5,       // padding
            suggestedMax: 12.5,      // padding
            ticks: {
              stepSize: 1,
              callback: value => `#${value}`
            },
            title: { display: true, text: 'League Standing' }
          },
          x: { title: { display: true, text: 'Week' } }
        }
      }
    });
  })
  .catch(err => console.error('Error loading scores:', err));


  fetch('data/standingsW7-13.json')
  .then(res => res.json())
  .then(data => {
    const ctx = document.getElementById('managersLineChart2').getContext('2d');

    const datasets = data.managers.map(manager => ({
  label: manager.name,
  data: manager.scores, // weekly standings
  borderColor: managerColors[manager.name] || "gray",
  backgroundColor: managerColors[manager.name] || "gray",
  tension: 0.3,
  fill: false
}));

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.weeks,
        datasets: datasets
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'League Standing' }
        },
        scales: {
          y: {
            reverse: true,           // #1 on top
            suggestedMin: 0.5,       // padding
            suggestedMax: 12.5,      // padding
            ticks: {
              stepSize: 1,
              callback: value => `#${value}`
            },
            title: { display: true, text: 'League Standing' }
          },
          x: { title: { display: true, text: 'Week' } }
        }
      }
    });
  })
  .catch(err => console.error('Error loading scores:', err));



  document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [matchesRes, managersRes] = await Promise.all([
      fetch("data/matches.json"),
      fetch("data/managers.json")
    ]);

    if (!matchesRes.ok || !managersRes.ok) throw new Error("Failed to load data");

const allMatches = await matchesRes.json();

// Get all weeks for season 2025
let getWeeks = new Set(allMatches.filter(g => g.season === 2025).map(g => g.week));
getWeeks = Array.from(getWeeks).sort((a, b) => a - b);

const section = document.getElementById("weeklyHighScores");

for (let w of getWeeks) {
  // Filter just this week's games
  const weekGames = allMatches.filter(g => g.season === 2025 && g.week === w);

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

  if (section) {
    section.innerHTML += `
      <div class="week-header"></div>
      <ul>
        <li>Week ${w} - High Score: ${highManager} (${highScore} pts)</li>
      </ul>
    `;
  }
}

  } catch (error) {
    console.error("Error loading data:", error);
  }
});