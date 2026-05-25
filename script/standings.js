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

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [standingsRes, standings2Res, matchesRes] = await Promise.all([
      fetch("data/standings.json"),
      fetch("data/standingsW7-13.json"),
      fetch("data/matches.json")
    ]);

    if (!standingsRes.ok || !standings2Res.ok || !matchesRes.ok) {
      throw new Error("Failed to load data");
    }

    const [standingsData, standings2Data, allMatches] = await Promise.all([
      standingsRes.json(),
      standings2Res.json(),
      matchesRes.json()
    ]);

    // Chart 1
    const ctx1 = document.getElementById("managersLineChart").getContext("2d");
    new Chart(ctx1, {
      type: "line",
      data: {
        labels: standingsData.weeks,
        datasets: standingsData.managers.map(manager => ({
          label: manager.name,
          data: manager.scores,
          borderColor: managerColors[manager.name] || "gray",
          backgroundColor: managerColors[manager.name] || "gray",
          tension: 0.3,
          fill: false
        }))
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          title: { display: true, text: "League Standing" }
        },
        scales: {
          y: {
            reverse: true,
            suggestedMin: 0.5,
            suggestedMax: 12.5,
            ticks: { stepSize: 1, callback: value => `#${value}` },
            title: { display: true, text: "League Standing" }
          },
          x: { title: { display: true, text: "Week" } }
        }
      }
    });

    // Chart 2
    const ctx2 = document.getElementById("managersLineChart2").getContext("2d");
    new Chart(ctx2, {
      type: "line",
      data: {
        labels: standings2Data.weeks,
        datasets: standings2Data.managers.map(manager => ({
          label: manager.name,
          data: manager.scores,
          borderColor: managerColors[manager.name] || "gray",
          backgroundColor: managerColors[manager.name] || "gray",
          tension: 0.3,
          fill: false
        }))
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          title: { display: true, text: "League Standing" }
        },
        scales: {
          y: {
            reverse: true,
            suggestedMin: 0.5,
            suggestedMax: 12.5,
            ticks: { stepSize: 1, callback: value => `#${value}` },
            title: { display: true, text: "League Standing" }
          },
          x: { title: { display: true, text: "Week" } }
        }
      }
    });

    // Weekly high scores
    let getWeeks = new Set(allMatches.filter(g => g.season === 2025).map(g => g.week));
    getWeeks = Array.from(getWeeks).sort((a, b) => b - a);

    const section = document.getElementById("weeklyHighScores");

    for (let w of getWeeks) {
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

  } catch (err) {
    console.error("Error loading standings data:", err);
  }
});
