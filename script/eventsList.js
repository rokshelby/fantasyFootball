const eventsContainer = document.getElementById('events-container');
function scrollToHash() {
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1); // remove "#"
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      return true;
    }
  }
  return false;
}
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
    //const latestEvents = eventsWithDate.slice(0, 3);

    eventsWithDate.forEach(event => {
      const card = document.createElement('div');
      card.className = 'card';
      card.id = `event-${event.date}`;
      card.innerHTML = `
        <h6>${event.title}</h6>
        <p class="centered-text" >${event.date}</p>
        <p>${event.description}</p>
      `;
      eventsContainer.appendChild(card);
    });
    // ✅ Try scrolling once events are in the DOM
    if (!scrollToHash()) {
      // if not found, retry a few times in case of lag
      let tries = 0;
      const interval = setInterval(() => {
        if (scrollToHash() || tries > 20) {
          clearInterval(interval);
        }
        tries++;
      }, 100);
    }

  })
  .catch(err => console.error('Error loading events:', err));

window.addEventListener("hashchange", scrollToHash);


  