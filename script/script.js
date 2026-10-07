document.addEventListener('DOMContentLoaded', function () {

  // When a page is shown inside another page's iframe (e.g. on index.html),
  // skip its header/footer and just follow the parent page's theme.
  if (window.self !== window.top) {
    const applyTheme = () =>
      document.body.classList.toggle('dark-mode', localStorage.getItem('theme') === 'dark');
    applyTheme();
    window.addEventListener('storage', e => { if (e.key === 'theme') applyTheme(); });

    const footer = document.querySelector('.site-footer');
    if (footer) footer.style.display = 'none';
    return;
  }

  // Load header first
  fetch("header.html")
    .then(res => {
      if (!res.ok) throw new Error(`header.html not found (${res.status})`);
      return res.text();
    })
    .then(data => {
      const headerEl = document.getElementById("header-include");
      if (!headerEl) {
        console.error("No #header-include element found — header not injected.");
        return;
      }
      headerEl.innerHTML = data;

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

      const dateElement = document.getElementById('date');
      if (dateElement) {
        fetch('https://api.github.com/repos/rokshelby/fantasyFootball/commits/main')
          .then(response => response.json())
          .then(data => {
            const commitDate = new Date(data.commit.committer.date);
            dateElement.textContent =
              "Last updated: " + commitDate.toLocaleDateString(
                undefined, { year: 'numeric', month: 'long', day: 'numeric' }
              );
          })
          .catch(err => {
            console.error('Error fetching commit date:', err);
            dateElement.textContent =
              "Last updated: " + new Date(document.lastModified).toLocaleDateString(
                undefined, { year: 'numeric', month: 'long', day: 'numeric' }
              );
          });
      }

    })
    .catch(err => console.error('Error loading header:', err));

  // Resize any same-origin iframes to fit their content height
  document.querySelectorAll('iframe').forEach(frame => {
    frame.addEventListener('load', () => {
      frame.style.height = (frame.contentWindow.document.body.scrollHeight + 500) + 'px';
    });
  });

});
