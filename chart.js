document.addEventListener("DOMContentLoaded", async () => {
    // Fetch your matches and managers data here...
try {
    const [matchesRes, managersRes] = await Promise.all([
      fetch("data/matches.json"),
      fetch("data/managers.json"),
    ]);

    if (!matchesRes.ok || !managersRes.ok) throw new Error("Failed to load data");

    const allMatches = await matchesRes.json();
    const managers = await managersRes.json();

    const managerMap = {};
    managers.forEach(m => (managerMap[m.name] = m.name));
    // Calculate averages per manager
    const avgScoresPerManager = calculateAvgScoresPerSeasonPerManager(allMatches);
    const seasons = [...new Set(allMatches.map(m => m.season))].sort((a,b) => a-b);

    // Prepare managerMap as you already do
    // ...

    const canvas = document.getElementById('lineChart2');
    const ctx = canvas.getContext('2d');

    drawMultiLineChart(ctx, seasons, avgScoresPerManager, managerMap);
} catch (error) {
    console.error("Error loading data:", error);
    alert("Failed to load league history data. Please try again later.");
    }
  });


function drawMultiLineChart(ctx, labels, dataByManager, managerMap, options = {}) {
  const {
    width = ctx.canvas.width,
    height = ctx.canvas.height,
    padding = 50,
    colors = ['blue', 'red', 'green', 'orange', 'purple', 'brown'],
  } = options;

  ctx.clearRect(0, 0, width, height);

  // Flatten all average values to find max/min for scaling
  const allValues = [];
  for (const managerId in dataByManager) {
    labels.forEach(season => {
      const val = dataByManager[managerId][season];
      if (val !== undefined) allValues.push(val);
    });
  }

  const maxY = Math.max(...allValues);
  const minY = Math.min(...allValues);

  // Draw axes
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // Y axis labels & grid
  ctx.fillStyle = 'black';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const yVal = minY + ((maxY - minY) / steps) * i;
    const y = height - padding - ((height - 2 * padding) / steps) * i;
    ctx.fillText(yVal.toFixed(1), padding - 10, y);

    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  // X axis labels
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const stepX = (width - 2 * padding) / (labels.length - 1);
  labels.forEach((label, i) => {
    const x = padding + i * stepX;
    ctx.fillText(label, x, height - padding + 10);
  });

  // Draw lines for each manager
  let colorIndex = 0;
  const legendItems = [];
  for (const [managerId, averages] of Object.entries(dataByManager)) {
    const color = colors[colorIndex % colors.length];
    colorIndex++;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    labels.forEach((season, i) => {
      const avg = averages[season];
      if (avg === undefined) return; // skip if no data for that season

      const x = padding + i * stepX;
      const y = height - padding - ((avg - minY) / (maxY - minY)) * (height - 2 * padding);
      if (i === 0 || averages[labels[i-1]] === undefined) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    labels.forEach((season, i) => {
      const avg = averages[season];
      if (avg === undefined) return;

      const x = padding + i * stepX;
      const y = height - padding - ((avg - minY) / (maxY - minY)) * (height - 2 * padding);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    legendItems.push({ name: managerMap[managerId] || managerId, color });
  }

  // Draw legend
  const rightPadding = 150;
  

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  let legendX = width - rightPadding + 10;
  let legendY = padding;
  ctx.font = '14px sans-serif';

  legendItems.forEach(({ name, color }) => {
    ctx.fillStyle = color;
    ctx.fillRect(legendX, legendY - 8, 12, 12);
    ctx.fillStyle = 'black';
    ctx.fillText(name, legendX + 18, legendY);
    legendY += 20;
  });
}


function calculateAvgScoresPerSeasonPerManager(matches) {
  // { managerId: { season: { totalScore, games } } }
  const stats = {};

  matches.forEach(match => {

    if (match.manager_a_id === "bye" || match.manager_b_id === "bye") return;
    // Manager A
    if (!stats[match.manager_a_id]) stats[match.manager_a_id] = {};
    if (!stats[match.manager_a_id][match.season]) stats[match.manager_a_id][match.season] = { totalScore: 0, games: 0 };
    stats[match.manager_a_id][match.season].totalScore += Number(match.score_a) || 0;
    stats[match.manager_a_id][match.season].games++;

    // Manager B
    if (!stats[match.manager_b_id]) stats[match.manager_b_id] = {};
    if (!stats[match.manager_b_id][match.season]) stats[match.manager_b_id][match.season] = { totalScore: 0, games: 0 };
    stats[match.manager_b_id][match.season].totalScore += Number(match.score_b) || 0;
    stats[match.manager_b_id][match.season].games++;
  });

  // Convert to { managerId: { season: average } }
  const averages = {};
  for (const managerId in stats) {
    averages[managerId] = {};
    for (const season in stats[managerId]) {
      averages[managerId][season] = stats[managerId][season].totalScore / stats[managerId][season].games;
    }
  }
  return averages;
}
