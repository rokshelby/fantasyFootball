document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    // Load header
    const headerRes = await fetch('manager-header.html');
    if (!headerRes.ok) throw new Error('Failed to load header');
    const headerHtml = await headerRes.text();
    document.getElementById("header-include").innerHTML = headerHtml;

    setupThemeToggle();

    // Load managers.json
    const managersRes = await fetch('../data/matches.json');
    if (!managersRes.ok) throw new Error('Failed to load managers data');
    const matches = await managersRes.json();

    // Extract unique manager names from all matches, excluding "bye"
    const uniqueManagers = new Set();
    matches.forEach(match => {
      if (match.manager_a_id && match.manager_a_id.toLowerCase() !== 'bye') uniqueManagers.add(match.manager_a_id);
      if (match.manager_b_id && match.manager_b_id.toLowerCase() !== 'bye') uniqueManagers.add(match.manager_b_id);
    });

    // Convert to array & sort alphabetically
    const sortedManagers = Array.from(uniqueManagers).sort((a, b) => a.localeCompare(b));

    // Populate dropdowns
    populateDropdown('manager1', sortedManagers);
    populateDropdown('manager2', sortedManagers);

    // Setup compare button logic
    setupCompareButton(matches);

  } catch (err) {
    console.error(err);
    alert(err.message || 'An error occurred');
  }
}

function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const body = document.body;

  if (!toggle) return;

  // Initialize theme based on localStorage
  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    toggle.checked = true;
  }

  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  });

  // Smooth transition effect on theme change
  body.classList.add('theme-transition');
  setTimeout(() => body.classList.remove('theme-transition'), 300);
}

function populateDropdown(selectId, managersArray) {
  const select = document.getElementById(selectId);
  select.innerHTML = `<option value="" disabled selected>-- Select Manager --</option>`;

  managersArray.forEach(managerName => {
    const option = document.createElement('option');
    option.value = managerName;
    option.textContent = managerName;
    select.appendChild(option);
  });
}

function setupCompareButton(managersData) {
  const compareBtn = document.getElementById('compareBtn');
  const manager1Select = document.getElementById('manager1');
  const manager2Select = document.getElementById('manager2');
  const resultDiv = document.getElementById('result');

  compareBtn.disabled = true; // Initially disabled

  function updateButtonState() {
    compareBtn.disabled = !(manager1Select.value && manager2Select.value && manager1Select.value !== manager2Select.value);
  }

  function findHeadToHead(data, manager1, manager2) {
    return data.filter(match =>
      (match.manager_a_id === manager1 && match.manager_b_id === manager2) ||
      (match.manager_a_id === manager2 && match.manager_b_id === manager1)
    );
  }

  manager1Select.addEventListener('change', updateButtonState);
  manager2Select.addEventListener('change', updateButtonState);

  compareBtn.addEventListener('click', () => {
    const m1 = manager1Select.value;
    const m2 = manager2Select.value;

    const matchesBetween = findHeadToHead(managersData, m1, m2);

    const resultDiv = document.getElementById('result');
    if (matchesBetween.length === 0) {
      resultDiv.innerHTML = `<p>No matches found between ${m1} and ${m2}.</p>`;
      return;
    }

    let html = `<h2>Head-to-Head Matches:<br> ${m1} vs ${m2}</h2><ul>`;
    let numM1Wins = 0;
    let numM2Wins = 0;
    let numTies = 0;
    let avgScoreM1 = 0;
    let avgScoreM2 = 0;

    matchesBetween.sort((a, b) => {
      // Sort by season first (descending)
      if (b.season !== a.season) {
        return b.season - a.season;
      }
      // If same season, sort by week (descending)
      return (b.week || 0) - (a.week || 0);
    });

    matchesBetween.forEach(match => {
      let scoreM1, scoreM2;

      if (match.manager_a_id === m1) {
        scoreM1 = match.score_a;
        scoreM2 = match.score_b;
      } else {
        scoreM1 = match.score_b;
        scoreM2 = match.score_a;
      }

      if (match.winner_id === m1) {
        numM1Wins++;
        avgScoreM1 += scoreM1 || 0;
      } else if (match.winner_id === m2) {
        numM2Wins++;
        avgScoreM2 += scoreM2 || 0;
      } else {
        numTies++;
      }

      const winnerClass = match.winner_id ? (match.winner_id === m1 ? 'manager1' : 'manager2') : 'tie';

      html += `
    <div class= "winner-results">
    <div class="match-details">
      <strong>W${match.week || 'N/A'} S${match.season || 'N/A'}</strong><br>
      ${m1} (${scoreM1})<br>
      ${m2} (${scoreM2})
    </div>
    <div>
      <strong>Winner:</strong><br><span class="${winnerClass}">${match.winner_id || 'Tie'}
      </span>
    </div>
  </div>`
;


    });
    
    const lastMatch = matchesBetween[0];

  const winnerClass = lastMatch.winner_id ? (lastMatch.winner_id === m1 ? 'manager1' : lastMatch.winner_id === m2 ? 'manager2' : 'tie') : 'tie';  

html += `
</ul>

<div class="match-summary">
  <h3 class="match-summary-header">Match Summary</h3>

  <div class="summary-row-divider">
    <span>Matches Count:</span>
    <strong>${matchesBetween.length}</strong>
  </div>

  <div class="summary-row">
    <span>${m1} Wins:</span>
    <strong class="win-manager1">${numM1Wins}</strong>
  </div>

  <div class="summary-row">
    <span>${m2} Wins:</span>
    <strong class = "win-manager2">${numM2Wins}</strong>
  </div>

  <div class="summary-row-divider">
    <span>Ties:</span>
    <strong>${numTies}</strong>
  </div>

  

<div class="last-match-summary">
  <strong>Last Match:</strong><br>
  Week ${lastMatch.week || 'N/A'}, Season ${lastMatch.season || 'N/A'}<br>
  Scores: ${m1} (${lastMatch.manager_a_id === m1 ? lastMatch.score_a : lastMatch.score_b}) 
  vs ${m2} (${lastMatch.manager_a_id === m1 ? lastMatch.score_b : lastMatch.score_a})<br>
  Winner: <span class="${winnerClass}" ${lastMatch.winner_id === m1 ? 'manager1' : lastMatch.winner_id === m2 ? 'manager2' : 'tie'}">
    ${lastMatch.winner_id || 'Tie'}
  </span>
</div>
</div>
`;






    resultDiv.innerHTML = html;





  });
}
