// Replace this JSON with your actual JSON file or data
fetch('data/draft-analysis2025.json')
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  })
  .then(managersData => {

const draftBoard = document.getElementById('draft-analysis-container');

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
  

  draftBoard.appendChild(managerDiv);
});
  })