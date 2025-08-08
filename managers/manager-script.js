document.addEventListener('DOMContentLoaded', async () => {
    const res = await fetch('../data/managers.json');
    const managers = await res.json();


    // Sort alphabetically by name
    managers.sort((a, b) => a.name.localeCompare(b.name));

    const container = document.getElementById('manager-profiles');


    // Separate active/inactive
    const activeManagers = managers.filter(m => m.active);
    const inactiveManagers = managers.filter(m => !m.active);

    let html2 = `
    <h2>Active Managers</h2>
    <ul class="manager-list active-list">
      ${activeManagers.map(m => `<li><a href="#" class="popup-button" data-manager-id="${m.name}">${m.name}</a></li>`).join('')}
    </ul>

    <h2>Inactive Managers</h2>
    <ul class="manager-list inactive-list">
      ${inactiveManagers.map(m => `<li><a href="#" class="popup-button" data-manager-id="${m.name}">${m.name}</a></li>`).join('')}
    </ul>
  `;

    container.innerHTML = html2;

    // Popup logic (replaces file-based loading)
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('overlay');






    document.querySelectorAll('.popup-button').forEach(button => {
        button.addEventListener('click', async function (e) {

            e.preventDefault();
            const managerId = this.getAttribute('data-manager-id');
            const manager = managers.find(m => m.name === managerId);

            if (!manager) {
                popup.innerHTML = `<p>Manager not found.</p>`;
                popup.style.display = 'block';
                overlay.style.display = 'block';
                return;
            }       // Fetch matches and calculate results
            const matchesRes = await fetch('../data/matches.json');
            const allMatches = await matchesRes.json();
            const finishes = {}



            const seasons = [...new Set(allMatches.map(g => g.season))];

            seasons.forEach(season => {
                const seasonGames = allMatches.filter(g => g.season === season && g.week_type === "regular_season");

                const managerStats = {};

                seasonGames.forEach(g => {
                    // Init managers
                    [g.manager_a_id, g.manager_b_id].forEach(id => {
                        if (!managerStats[id]) {
                            managerStats[id] = { wins: 0, points: 0 };
                        }
                    });

                    // Add points
                    managerStats[g.manager_a_id].points += g.score_a;
                    managerStats[g.manager_b_id].points += g.score_b;

                    // Add win
                    if (g.winner_id) {
                        managerStats[g.winner_id].wins += 1;
                    }
                });

                // Rank managers: wins first, then points
                const ranked = Object.entries(managerStats)
                    .sort((a, b) => {
                        if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
                        return b[1].points - a[1].points;
                    })
                    .map(entry => entry[0]);

                const finish = ranked.indexOf(manager.name);
                if (finish !== -1) {
                    finishes[season] = ordinalSuffix(finish + 1);
                }
            });







            const results = {
                championships: [],
                second: [],
                third: [],
                fourth: [],
                fifth: [],
                sixth: [],
                seventh: [],
                eighth: [],
                ninth: [],
                tenth: [],
                eleventh: [],
                twelfth: []
            };

            const placements = {
                'championship': ['championships', 'second'],
                'third place': ['third', 'fourth'],
                'fifth place': ['fifth', 'sixth'],
                'seventh place': ['seventh', 'eighth'],
                'ninth place': ['ninth', 'tenth'],
                'eleventh place': ['eleventh', 'twelfth']
            };

            for (const match of allMatches) {
                if (placements[match.week_type] &&
                    (match.manager_a_id === managerId || match.manager_b_id === managerId)) {
                    const [winKey, loseKey] = placements[match.week_type];
                    if (match.winner_id === managerId) {
                        results[winKey].push(match.season);
                    } else {
                        results[loseKey].push(match.season);
                    }
                }
            }

            // Build popup HTML
            popup.innerHTML = `
        <div class="popup-content">
          <button class="close-button">X</button>
          <h2>${manager.name}</h2>
         <p>Previous Names:</p>
        <ul>
        ${manager.previous_team_names.length > 0 
        ? manager.previous_team_names.map(name => `<li>${name}</li>`).join('') 
        : '<li>N/A</li>'
        }
        </ul>
          <img src="${manager.avatar_url}" alt="Team Logo" class="popup-logo">
          <p><strong>Team:</strong> ${manager.team_name || 'N/A'}</p>
          <p><strong>Joined:</strong> ${manager.joined_season || 'N/A'}</p>
          <p><strong>Favorite Team:</strong> ${manager.nfl_team || 'N/A'}</p>
          <p><strong>Bio:</strong> ${manager.bio || ''}</p>
          ${manager.notes ? `<p><strong>Notes:</strong> ${manager.notes}</p>` : ''}

${Object.keys(finishes).length > 0 ? `
  <hr>
  <h3>Regular Season Finishes</h3>
  <ul>
    ${
      Object.entries(finishes)
        .sort((a, b) => b[0].localeCompare(a[0])) // Sort by season descending
        .map(([season, place]) => `<li>${season}: ${place}</li>`)
        .join('')
    }
  </ul>
` : ''}


          

          <hr>
          <h3>Playoff Finishes</h3>
          <ul>
          ${results.championships.length > 0 ?
                    `<li><strong>Championships:</strong> ${results.championships.length} (${results.championships.join(', ')})</li>` : ''}

              ${results.second.length > 0 ?
                    `<li><strong>2nd Place:</strong> ${results.second.length} (${results.second.join(', ')})</li>` : ''}
              ${results.third.length > 0 ?
                    `<li><strong>3rd Place:</strong> ${results.third.length} (${results.third.join(', ')})</li>` : ''}
              ${results.fourth.length > 0 ?
                    `<li><strong>4th Place:</strong> ${results.fourth.length} (${results.fourth.join(', ')})</li>` : ''}
              ${results.fifth.length > 0 ?
                    `<li><strong>5th Place:</strong> ${results.fifth.length} (${results.fifth.join(', ')})</li>` : ''}
              ${results.sixth.length > 0 ?
                    `<li><strong>6th Place:</strong> ${results.sixth.length} (${results.sixth.join(', ')})</li>` : ''}
              ${results.seventh.length > 0 ?
                    `<li><strong>7th Place:</strong> ${results.seventh.length} (${results.seventh.join(', ')})</li>` : ''}
              ${results.eighth.length > 0 ?
                    `<li><strong>8th Place:</strong> ${results.eighth.length} (${results.eighth.join(', ')})</li>` : ''}
              ${results.ninth.length > 0 ?
                    `<li><strong>9th Place:</strong> ${results.ninth.length} (${results.ninth.join(', ')})</li>` : ''}
              ${results.tenth.length > 0 ?
                    `<li><strong>10th Place:</strong> ${results.tenth.length} (${results.tenth.join(', ')})</li>` : ''}
              ${results.eleventh.length > 0 ?
                    `<li><strong>11th Place:</strong> ${results.eleventh.length} (${results.eleventh.join(', ')})</li>` : ''}
              ${results.twelfth.length > 0 ?
                    `<li><strong>12th Place:</strong> ${results.twelfth.length} (${results.twelfth.join(', ')})</li>` : ''}
          </ul>
        </div>
      `;



            popup.style.display = 'block';
            overlay.style.display = 'block';


            popup.querySelector('.close-button').addEventListener('click', () => {
                popup.style.display = 'none';
                overlay.style.display = 'none';
            });
        });
    });
});


function ordinalSuffix(i) {
    const j = i % 10, k = i % 100;
    if (j == 1 && k != 11) return i + "st";
    if (j == 2 && k != 12) return i + "nd";
    if (j == 3 && k != 13) return i + "rd";
    return i + "th";
}