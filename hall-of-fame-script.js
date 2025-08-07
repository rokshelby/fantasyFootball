document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [matchesRes, managersRes] = await Promise.all([
      fetch("data/matches.json"),
      fetch("data/managers.json")
    ]);

    if (!matchesRes.ok || !managersRes.ok) throw new Error("Failed to load data");

    const allMatches = await matchesRes.json();
    const managers = await managersRes.json();

    const managerMap = {};
    managers.forEach(m => managerMap[m.name] = m.name);

    const seasons = [...new Set(allMatches.map(m => m.season))].sort();
    const layout = document.querySelector(".layout");

    seasons.forEach(season => {
      const matchesInSeason = allMatches.filter(m => m.season === season);
      const { championId, highestScorerId, highestPoints } = calculateAccoladesForSeason(matchesInSeason);
      const { topManager, maxWins,topManagersLosses } = calculateMostWinsInRegularSeason(matchesInSeason);

      const championName = managerMap[championId] || "Unknown";
      const scorerName = managerMap[highestScorerId] || "Unknown";
        const mostWinsName = managerMap[topManager] || "Unknown";
        const mostWins = maxWins || 0;

      const section = document.createElement("section");
      section.innerHTML = `
        <h3>Season ${season}</h3>
        <ul>
          <li><strong>Champion:</strong> ${championName}</li>
          <li><strong>Highest Scorer:</strong> ${scorerName} (${highestPoints} pts)</li>
            <li><strong>Best Regular Season Record:</strong> ${mostWinsName} (${mostWins}-${topManagersLosses})</li>
        </ul>
      `;
      layout.appendChild(section);
    });

  } catch (err) {
    console.error("Error loading hall of fame data:", err);
  }
});

function calculateMostWinsInRegularSeason(matches){
    const winCounts = {};
    let topManagersLosses = 0;
    matches.forEach(match => {
        if (match.week_type === "regular_season") {
        if (match.winner_id) {
            winCounts[match.winner_id] = (winCounts[match.winner_id] || 0) + 1;
        }
        }
    });
    
    let maxWins = 0;
    let topManager = null;
    for (const [manager, wins] of Object.entries(winCounts)) {
        if (wins > maxWins) {
        maxWins = wins;
        topManager = manager;
        }
    }
    
    matches.forEach(match => {
        if((match.manager_a_id === topManager  || match.manager_b_id === topManager) && match.winner_id !== topManager)
        {
            if(match.week_type === "regular_season"){
                topManagersLosses++;
            }
        }
    });


    return { topManager, maxWins, topManagersLosses};

}

function calculateAccoladesForSeason(matches) {
  let championshipMatch = null;
  let highestScorerId = null;
  let highestPoints = 0;
  let week = 0;
  for (const match of matches) {
    if (match.week_type === "championship") {
      championshipMatch = match;
    }

    const scoreA = Number(match.score_a) || 0;
    const scoreB = Number(match.score_b) || 0;

    if (scoreA > highestPoints) {
      highestPoints = scoreA;
      highestScorerId = match.manager_a_id;
      week = match.week;
    }

    if (scoreB > highestPoints) {
      highestPoints = scoreB;
      highestScorerId = match.manager_b_id;
        week = match.week;
    }
  }

  return {
    championId: championshipMatch?.winner_id || null,
    highestScorerId,
    highestPoints
  };
}
