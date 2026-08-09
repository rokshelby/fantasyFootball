// Replace this JSON with your actual JSON file or data
fetch('archive/2025/draft2025.json')
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  })
  .then(draftData => {

const draftBoard = document.getElementById('draftBoard');

draftData.teams.forEach(team => {
  const managerDiv = document.createElement('div');
  managerDiv.className = 'manager';

  const nameHeader = document.createElement('h3');
  nameHeader.textContent = team.name;
  managerDiv.appendChild(nameHeader);

  team.picks.forEach(pick => {
    const pickDiv = document.createElement('div');
    pickDiv.className = 'pick';
    pickDiv.innerHTML = `<span>R${pick.round} P${pick.pick}</span>: ${pick.player}`;
    managerDiv.appendChild(pickDiv);
  });

  draftBoard.appendChild(managerDiv);
});
  })