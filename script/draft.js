async function loadDraftBoard(year) {
  const draftBoard = document.getElementById('draftBoard');
  draftBoard.innerHTML = '';

  try {
    const response = await fetch(`archive/${year}/draft${year}.json`);
    if (!response.ok) throw new Error('Network response was not ok');
    const draftData = await response.json();

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
  } catch (err) {
    console.error('Error loading draft board:', err);
    draftBoard.innerHTML = '<p>No draft board available for this year.</p>';
  }
}
