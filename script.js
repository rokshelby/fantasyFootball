document.addEventListener('DOMContentLoaded', function () {

  // Load header first
  fetch("header.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("header-include").innerHTML = data;

      // ✅ Fix Home link after header is loaded
      const homeLink = document.querySelector('a[href="/"]');
      if (homeLink) {
        homeLink.setAttribute('href', 'index.html'); // adjust if header is in subfolder
      }

      // Theme toggle setup
      const toggle = document.getElementById('theme-toggle');
      const body = document.body;

      if (toggle) {
        // Load saved theme
        if (localStorage.getItem('theme') === 'dark') {
          body.classList.add('dark-mode');
          toggle.checked = true;
        }

        // Listen for toggle changes
        toggle.addEventListener('change', () => {
          if (toggle.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
          } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
          }
        });

        // Add smooth transition effect on theme change
        body.classList.add('theme-transition');
        setTimeout(() => body.classList.remove('theme-transition'), 300);
      } else {
        console.warn('Theme toggle element not found.');
      }

      // --- DROPDOWN MOBILE TOGGLE SETUP ---

      const dropdowns = document.querySelectorAll('.dropdown');

      dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('a, button');
        if (!trigger) return;

        trigger.addEventListener('click', e => {
          if (window.innerWidth <= 600) {
            e.preventDefault();
            dropdown.classList.toggle('open');
          }
        });
      });

      document.addEventListener('click', e => {
        if (window.innerWidth > 600) return;

        dropdowns.forEach(dropdown => {
          if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
          }
        });
      });

    })
    .catch(err => console.error('Error loading header:', err));

    fetch('https://api.github.com/repos/rokshelby/fantasyFootballl/commits/main')
  .then(response => response.json())
  .then(data => {
    const commitDate = new Date(data.commit.committer.date);
    document.getElementById('date').textContent =
      "Last updated: " + commitDate.toLocaleDateString(
        undefined, { year: 'numeric', month: 'long', day: 'numeric' }
      );
  })
  .catch(err => console.error('Error fetching commit date:', err));
});
