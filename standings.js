const managerColors = {
  "Commishin aint easy": "blue",
  "Same Season Diff Team": "red",
  "Dicker Downs": "green",
  "Tig Ol Griddys": "orange",
  "We Get Big Ol TDs": "purple",
  "SF 49ers Played Me": "teal",
  "Bobz Cartel": "pink",
  "Caleb and The Revolution": "brown",
  "Stafford Infection": "cyan",
  "Stew's Super Quokkas": "magenta",
  "Alabama Assault": "lime",
  "R Odunze Day": "yellow"

};


fetch('data/standings.json')
  .then(res => res.json())
  .then(data => {
    const ctx = document.getElementById('managersLineChart').getContext('2d');

    const datasets = data.managers.map(manager => ({
  label: manager.name,
  data: manager.scores, // weekly standings
  borderColor: managerColors[manager.name] || "gray",
  backgroundColor: managerColors[manager.name] || "gray",
  tension: 0.3,
  fill: false
}));

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.weeks,
        datasets: datasets
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'League Standing' }
        },
        scales: {
          y: {
            reverse: true,           // #1 on top
            suggestedMin: 0.5,       // padding
            suggestedMax: 12.5,      // padding
            ticks: {
              stepSize: 1,
              callback: value => `#${value}`
            },
            title: { display: true, text: 'League Standing' }
          },
          x: { title: { display: true, text: 'Week' } }
        }
      }
    });
  })
  .catch(err => console.error('Error loading scores:', err));
