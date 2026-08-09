const week4container = document.getElementById('week4-container');
loadWeek4();
async function loadMatches(){

    try{
        const res = await fetch("data/matches.json");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const allMatches = await res.json();
        return allMatches;   
    } catch (err){
        console.error("error loading matches", err);
        return [];
    }
}


async function loadWeek4(){

    const allMatches = await loadMatches();
    fetch('data/2025week4.json')
    .then(response => response.json())
    .then(data => {
        data.managers.forEach(manager => {
            const card = document.createElement('div');
            card.className = 'card-report';
            const matchesInSeason = allMatches.filter(m => m.season === 2025 && m.week <= 4)

            const managerMatches = matchesInSeason.filter(match => 
                match.manager_a_id === manager.name || match.manager_b_id === manager.name
            );  
            let totalScore = 0;
            for(let i = 0; i < managerMatches.length; i++){
                 totalScore += manager.name === managerMatches[i].manager_a_id ? managerMatches[i].score_a : managerMatches[i].score_b;
            }

            totalScore = totalScore /managerMatches.length;
            
            
            //${topTwo.map(pick => `<li>R${pick.round} P${pick.pick}: ${pick.player}</li>`).join('')}
            card.innerHTML = `
            <h3>${manager.name}</h3>
            <div class="manager-row">
            <h4 id="draftGrade">Draft Grade: ${manager.draftGrade}<br>
            Current Record: ${manager.record}<br>
            Avg Score: ${totalScore.toFixed(2)} </h4>
            </div>
            <div class="manager-row">
            <h5>${manager.trashTracker}</h5>
            <img src= ${manager.image}>
            </div>
            `;
            
            week4container.appendChild(card);
        });
    })
    .catch(err => console.error('Error loading draft highlights:', err));
}
