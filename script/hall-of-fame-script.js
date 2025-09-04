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

    const seasons = [...new Set(allMatches.map(m => m.season))]
      .sort((a, b) => b - a);

    const highestAvgPerSeason = calculateHighestAveragePerSeason(allMatches);


    seasons.forEach(season => {
      const matchesInSeason = allMatches.filter(m => m.season === season);
      const { championId, highestScorerId, highestPoints } = calculateAccoladesForSeason(matchesInSeason);
      const { topManager, maxWins, topManagersLosses } = calculateMostWinsInRegularSeason(matchesInSeason);

      const seasonAvg = highestAvgPerSeason[season];
      const highestAvgName = seasonAvg ? managerMap[seasonAvg.bestManager] : "Unknown";
      const highestAvg = seasonAvg ? seasonAvg.highestAvg.toFixed(2) : "N/A";


      const championName = managerMap[championId] || "Unknown";
      const scorerName = managerMap[highestScorerId] || "Unknown";
      const mostWinsName = managerMap[topManager] || "Unknown";
      const mostWins = maxWins || 0;

      const section = document.getElementById(`season-${season}`);
      if (section) {
        section.innerHTML = `
        <h3>Season ${season}</h3>
        <ul>
          <li><strong>Champion:</strong> ${championName}</li>
          <li><strong>Highest Scorer:</strong> ${scorerName} (${highestPoints} pts)</li>
          <li><strong>Best Regular Season Record:</strong> ${mostWinsName} (${mostWins}-${topManagersLosses})</li>
          <li><strong>Highest Season Average:</strong> ${highestAvgName} (${highestAvg} pts)</li>
        </ul>
        `;
      }
    });

    const allTimeStats = calculateAllTimeStats(allMatches);
    const highestSeasonAvg = calculateHighestSeasonAverage(allMatches);
const longestWinningStreak = calculateLongestWinningStreakAcrossSeasons(allMatches);


    const allTimeSection = document.getElementById("all-time");
    if (allTimeSection) {
      allTimeSection.innerHTML = `
      <h3>All Time Stats</h3>
      <ul>
        <li><strong>Most Wins:</strong> ${managerMap[allTimeStats.topWinsId]} (${allTimeStats.topWins})</li>
        <li><strong>Highest Single Game:</strong> ${managerMap[allTimeStats.gameHigh.managerId]} (${allTimeStats.gameHigh.points} pts, Season ${allTimeStats.gameHigh.season}, Week ${allTimeStats.gameHigh.week})</li>
        <li><strong>Highest Season Average:</strong> ${managerMap[highestSeasonAvg.bestManager]} (${highestSeasonAvg.highestAvg.toFixed(2)} pts, Season ${highestSeasonAvg.bestSeason})</li>
<li><strong>Longest Winning Streak:</strong> ${managerMap[longestWinningStreak.managerId]} (${longestWinningStreak.streakLength} wins, from Season ${longestWinningStreak.startSeason} Week ${longestWinningStreak.startWeek} to Season ${longestWinningStreak.endSeason} Week ${longestWinningStreak.endWeek})</li>

      </ul>
      `;
    }

  } catch (err) {
    console.error("Error loading hall of fame data:", err);
  }
});

function calculateMostWinsInRegularSeason(matches) {
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
    if ((match.manager_a_id === topManager || match.manager_b_id === topManager) && match.winner_id !== topManager) {
      if (match.week_type === "regular_season") {
        topManagersLosses++;
      }
    }
  });

  return { topManager, maxWins, topManagersLosses };
}

function calculateAccoladesForSeason(matches) {
  let championshipMatch = null; // still used to find championId for each season
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

function calculateAllTimeStats(matches) {
  const winCounts = {};
  const gameHigh = { points: 0, managerId: null, season: null, week: null };

  matches.forEach(match => {
    if (match.week_type === "regular_season" && match.winner_id) {
      winCounts[match.winner_id] = (winCounts[match.winner_id] || 0) + 1;
    }

    const scoreA = Number(match.score_a) || 0;
    const scoreB = Number(match.score_b) || 0;

    if (scoreA > gameHigh.points) {
      gameHigh.points = scoreA;
      gameHigh.managerId = match.manager_a_id;
      gameHigh.season = match.season;
      gameHigh.week = match.week;
    }
    if (scoreB > gameHigh.points) {
      gameHigh.points = scoreB;
      gameHigh.managerId = match.manager_b_id;
      gameHigh.season = match.season;
      gameHigh.week = match.week;
    }
  });

  const topWinsId = Object.entries(winCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return {
    topWinsId,
    topWins: winCounts[topWinsId] || 0,
    gameHigh,
  };
}

function calculateHighestSeasonAverage(matches) {
  // Structure: { season: { managerId: { totalScore, games } } }
  const seasonManagerStats = {};

  matches.forEach(match => {
    const season = match.season;
    if (!seasonManagerStats[season]) {
      seasonManagerStats[season] = {};
    }

    // Manager A stats
    if (!seasonManagerStats[season][match.manager_a_id]) {
      seasonManagerStats[season][match.manager_a_id] = { totalScore: 0, games: 0 };
    }
    seasonManagerStats[season][match.manager_a_id].totalScore += Number(match.score_a) || 0;
    seasonManagerStats[season][match.manager_a_id].games++;

    // Manager B stats
    if (!seasonManagerStats[season][match.manager_b_id]) {
      seasonManagerStats[season][match.manager_b_id] = { totalScore: 0, games: 0 };
    }
    seasonManagerStats[season][match.manager_b_id].totalScore += Number(match.score_b) || 0;
    seasonManagerStats[season][match.manager_b_id].games++;
  });

  let highestAvg = 0;
  let bestManager = null;
  let bestSeason = null;

  for (const [season, managers] of Object.entries(seasonManagerStats)) {
    for (const [managerId, stats] of Object.entries(managers)) {
      const avg = stats.totalScore / stats.games;
      if (avg > highestAvg) {
        highestAvg = avg;
        bestManager = managerId;
        bestSeason = season;
      }
    }
  }

  return {
    bestManager,
    bestSeason,
    highestAvg
  };
}

function calculateHighestAveragePerSeason(matches) {
  const seasonManagerStats = {};

  matches.forEach(match => {
    const season = match.season;
    if (!seasonManagerStats[season]) {
      seasonManagerStats[season] = {};
    }

    if (!seasonManagerStats[season][match.manager_a_id]) {
      seasonManagerStats[season][match.manager_a_id] = { totalScore: 0, games: 0 };
    }
    seasonManagerStats[season][match.manager_a_id].totalScore += Number(match.score_a) || 0;
    seasonManagerStats[season][match.manager_a_id].games++;

    if (!seasonManagerStats[season][match.manager_b_id]) {
      seasonManagerStats[season][match.manager_b_id] = { totalScore: 0, games: 0 };
    }
    seasonManagerStats[season][match.manager_b_id].totalScore += Number(match.score_b) || 0;
    seasonManagerStats[season][match.manager_b_id].games++;
  });

  const highestAvgPerSeason = {};

  for (const [season, managers] of Object.entries(seasonManagerStats)) {
    let highestAvg = 0;
    let bestManager = null;

    for (const [managerId, stats] of Object.entries(managers)) {
      const avg = stats.totalScore / stats.games;
      if (avg > highestAvg) {
        highestAvg = avg;
        bestManager = managerId;
      }
    }

    highestAvgPerSeason[season] = {
      bestManager,
      highestAvg
    };
  }

  return highestAvgPerSeason;
}

function calculateLongestWinningStreakAcrossSeasons(allMatches) {
  // Clone & sort matches chronologically: season asc, week asc
  const matches = [...allMatches].sort((a, b) => {
    if (a.season !== b.season) return a.season - b.season;
    return a.week - b.week;
  });

  let streaks = {}; // managerId -> { currentStreak, currentStartMatch, maxStreak, maxStartMatch, maxEndMatch }

  for (const match of matches) {
    if (match.week_type !== "regular_season") continue;

    // For both managers in this match, we need to check/update their streaks
    // Only the winner continues or starts streak, loser resets.

    const winner = match.winner_id;
    const loserA = match.manager_a_id;
    const loserB = match.manager_b_id;

    // Initialize streaks if needed
    [winner, loserA, loserB].forEach(id => {
      if (!streaks[id]) {
        streaks[id] = {
          currentStreak: 0,
          currentStartMatch: null,
          maxStreak: 0,
          maxStartMatch: null,
          maxEndMatch: null
        };
      }
    });

    // Winner: if continuing streak or new streak start
    if (streaks[winner].currentStreak === 0) {
      streaks[winner].currentStartMatch = match;
    }
    streaks[winner].currentStreak++;

    // Check if winner's current streak is max
    if (streaks[winner].currentStreak > streaks[winner].maxStreak) {
      streaks[winner].maxStreak = streaks[winner].currentStreak;
      streaks[winner].maxStartMatch = streaks[winner].currentStartMatch;
      streaks[winner].maxEndMatch = match;
    }

    // Losers: reset current streak
    if (loserA !== winner) {
      streaks[loserA].currentStreak = 0;
      streaks[loserA].currentStartMatch = null;
    }
    if (loserB !== winner) {
      streaks[loserB].currentStreak = 0;
      streaks[loserB].currentStartMatch = null;
    }
  }

  // Find overall longest streak among all managers
  let longestManager = null;
  let longestStreak = 0;
  let longestStart = null;
  let longestEnd = null;

  for (const [managerId, data] of Object.entries(streaks)) {
    if (data.maxStreak > longestStreak) {
      longestStreak = data.maxStreak;
      longestManager = managerId;
      longestStart = data.maxStartMatch;
      longestEnd = data.maxEndMatch;
    }
  }

  // Defensive fallback if no streak
  if (!longestManager) {
    return null;
  }

  return {
    managerId: longestManager,
    streakLength: longestStreak,
    startSeason: longestStart.season,
    startWeek: longestStart.week,
    endSeason: longestEnd.season,
    endWeek: longestEnd.week,
  };
}
