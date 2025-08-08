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

  html += `<li>Week ${match.week || 'N/A'}, Season ${match.season || 'N/A'}: ${m1} (${scoreM1}) vs ${m2} (${scoreM2}) — Winner: ${match.winner_id}</li>`;
});
  html += `</ul>`;
  //html += `<p><strong>Summary:<br></strong> ${m1} - Wins:<strong> ${numM1Wins} </strong> <br> ${m2} - Wins: <strong> ${numM2Wins} </strong> <br> Ties: ${numTies}</p>`;
  html += `<p>Matches Count: ${matchesBetween.length} <br>`;
  html += `${m1} - Wins:<strong> ${numM1Wins} </strong> <br> `;
  html += `${m2} - Wins:<strong> ${numM2Wins} </strong> <br> `
  html += `Ties: ${numTies}</p>`;
  html += `<p>Last Match: Week ${matchesBetween[matchesBetween.length - 1].week || 'N/A'}, Season ${matchesBetween[matchesBetween.length - 1].season || 'N/A'}</p>`;
const lastMatch = matchesBetween[matchesBetween.length - 1];

if (lastMatch.manager_a_id === m1) {
  html += `<p>Last Match Scores: ${m1} (${lastMatch.score_a}) vs ${m2} (${lastMatch.score_b})</p>`;
} else {
  html += `<p>Last Match Scores: ${m1} (${lastMatch.score_b}) vs ${m2} (${lastMatch.score_a})</p>`;
}
  html += `<p>Last Match Winner: ${matchesBetween[matchesBetween.length - 1].winner_id || 'N/A'}</p>`;
  
  resultDiv.innerHTML = html;
  });
}
