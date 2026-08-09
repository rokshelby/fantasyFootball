const week4container = document.getElementById('2025DraftContainer');
loadWeek2025().catch(err => console.error('Error in loadWeek:', err));


async function loadWeek2025(){

    fetch('2025FFDraftOrder.json')
    .then(response => response.json())
    .then(data => {
         const sorted = [...data.managers].sort((a, b) => Number(a.order) - Number(b.order));
        sorted.forEach(manager => {
           
            const card = document.createElement('div');
            card.className = 'card-report';
            card.innerHTML = `
            <h3>${manager.name}</h3>
            <div class="manager-row">
            Draft Order: ${manager.order}<br>
            </div>
            <div class="manager-row">
            `;
            
            week4container.appendChild(card);
        });
    })
    .catch(err => console.error('Error loading draft highlights:', err));
}
