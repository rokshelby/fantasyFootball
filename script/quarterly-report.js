// Loads archive/<year>/q<quarter>report<year>.json and groups managers by tier.
// Link to a specific report with quarterly-report.html?year=2026&q=1
const DEFAULT_YEAR = 2026;
const DEFAULT_QUARTER = 1;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const year = params.get('year') || DEFAULT_YEAR;
  const quarter = params.get('q') || DEFAULT_QUARTER;
  loadQuarterlyReport(year, quarter);
});

async function loadQuarterlyReport(year, quarter) {
  const title = document.getElementById('quarterly-report-title');
  const container = document.getElementById('quarterly-report-container');
  title.textContent = `${year} Q${quarter} Report`;

  try {
    const response = await fetch(`archive/${year}/q${quarter}report${year}.json`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    if (data.weeks) title.textContent += ` (Weeks ${data.weeks})`;

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
    console.error('Error loading quarterly report:', err);
    container.innerHTML = '<p>Report not available.</p>';
  }
}
