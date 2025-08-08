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

      // Now header is loaded, get toggle and body references
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
    })
    .catch(err => console.error('Error loading header:', err));

});
