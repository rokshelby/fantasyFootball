// Loads archive/<year>/week<week>analysis<year>.json and groups managers by tier.
// Link to a specific file with week-analysis.html?year=2026&week=4
const DEFAULT_YEAR = 2026;
const DEFAULT_WEEK = 4;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const year = params.get('year') || DEFAULT_YEAR;
  const week = params.get('week') || DEFAULT_WEEK;
  loadWeekAnalysis(year, week);
});

async function loadWeekAnalysis(year, week) {
  const title = document.getElementById('week-analysis-title');
  const container = document.getElementById('week-analysis-container');
  title.textContent = `${year} Week ${week} Analysis`;

  try {
    const response = await fetch(`archive/${year}/week${week}analysis${year}.json`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    // Tiers render in the order listed in the JSON; managers with a missing or
    // unknown tier land in "Unranked" at the bottom.
    const tiers = [...(data.tiers || [])];
    const groups = new Map(tiers.map(tier => [tier, []]));
    data.managers.forEach(manager => {
      const tier = groups.has(manager.tier) ? manager.tier : 'Unranked';
      if (!groups.has(tier)) {
        groups.set(tier, []);
        tiers.push(tier);
      }
      groups.get(tier).push(manager);
    });

    tiers.forEach((tier, index) => {
      const managers = groups.get(tier);
      if (managers.length === 0) return;

      const tierSection = document.createElement('section');
      tierSection.className = 'tier-section';
      tierSection.innerHTML = `<h3 class="tier-title">Tier ${index + 1}: ${tier}</h3>`;

      const tierGrid = document.createElement('div');
      tierGrid.className = 'tier-grid';

      managers.forEach(manager => {
        const managerDiv = document.createElement('div');
        managerDiv.className = 'manager-analysis';

        const pickDiv = document.createElement('div');
        pickDiv.className = 'managerBlock';
        pickDiv.innerHTML = `
        <img src= ${manager.image}>
        <p><strong> ${manager.name}</strong> <br> Record: <strong>${manager.record}</strong> <br>
        Grade: <span class="draft-grade">${manager.draftgrade}</span> <br>
        ${manager.description}</p>`;
        managerDiv.appendChild(pickDiv);

        tierGrid.appendChild(managerDiv);
      });

      tierSection.appendChild(tierGrid);
      container.appendChild(tierSection);
    });
  } catch (err) {
    console.error('Error loading week analysis:', err);
    container.innerHTML = '<p>Analysis not available.</p>';
  }
}
