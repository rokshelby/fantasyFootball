const highlightsContainer = document.getElementById('draft-highlights');

fetch('data/draft2025.json')
  .then(response => response.json())
  .then(data => {
    data.teams.forEach(team => {
      const card = document.createElement('div');
      card.className = 'card';

      // Grab only the first two picks
      const topTwo = team.picks.slice(0, 2);

      card.innerHTML = `
        <h6>${team.name}</h6>
        <ul>
          ${topTwo.map(pick => `<li>R${pick.round} P${pick.pick}: ${pick.player}</li>`).join('')}
        </ul>
      `;

      highlightsContainer.appendChild(card);
    });
  })
  .catch(err => console.error('Error loading draft highlights:', err));
