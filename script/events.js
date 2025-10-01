const eventsContainer = document.getElementById('events-container');

fetch('data/events.json')
  .then(res => res.json())
  .then(data => {
    // Attempt to parse dates for sorting
    const eventsWithDate = data.events.map(event => {
      let parsedDate = new Date(event.date);
      // Fallback: if date is invalid, set a very old date so it appears last
      if (isNaN(parsedDate)) parsedDate = new Date('1900-01-01');
      return { ...event, parsedDate };
    });

    // Sort descending (most recent first)
    eventsWithDate.sort((a, b) => b.parsedDate - a.parsedDate);

    // Show latest 3 events
    const latestEvents = eventsWithDate.slice(0, 3);

    latestEvents.forEach(event => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h6>${event.title}</h6>
        <a href="eventslist.html#event-${event.date}"> <p class="centered-text">${event.date}</p></a>
        <p>${event.description}</p>
      `;
      eventsContainer.appendChild(card);
    });
  })
  .catch(err => console.error('Error loading events:', err));
