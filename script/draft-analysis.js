async function loadDraftAnalysis(year) {
  const section = document.getElementById('draft-analysis-section');
  const analysisContainer = document.getElementById('draft-analysis-container');
  analysisContainer.innerHTML = '';

  try {
    const response = await fetch(`archive/${year}/draft-analysis${year}.json`);
    if (!response.ok) throw new Error('Network response was not ok');
    const managersData = await response.json();

    section.style.display = '';

    managersData.managers.forEach(manager => {
      const managerDiv = document.createElement('div');
      managerDiv.className = 'manager-analysis';

      const pickDiv = document.createElement('div');
      pickDiv.className = 'managerBlock';
      pickDiv.innerHTML = `
      <p><strong> ${manager.name}</strong> <br> Draft Grade: <strong> ${manager.draftgrade} </strong> <br>
      ${manager.description}</p>
      <img src= ${manager.image}>`;
      managerDiv.appendChild(pickDiv);

      analysisContainer.appendChild(managerDiv);
    });
  } catch (err) {
    console.error('Error loading draft analysis:', err);
    section.style.display = 'none';
  }
}
