document.addEventListener('DOMContentLoaded', function () {
  const overlay = document.getElementById('overlay');
  const popup = document.getElementById('popup');

  // Popup logic (unchanged)
  document.querySelectorAll('.popup-button').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const targetFile = this.getAttribute('data-target');

      fetch(targetFile)
        .then(res => res.text())
        .then(html => {
          popup.innerHTML = html;
          popup.style.display = 'block';
          overlay.style.display = 'block';

          const closeBtn = popup.querySelector('.close-button');
          if (closeBtn) {
            closeBtn.addEventListener('click', function () {
              popup.style.display = 'none';
              overlay.style.display = 'none';
            });
          }
        })
        .catch(err => {
          popup.innerHTML = '<p>Error loading manager info.</p>';
          popup.style.display = 'block';
          overlay.style.display = 'block';
        });
    });
  });

  overlay.addEventListener('click', function () {
    popup.style.display = 'none';
    overlay.style.display = 'none';
  });

  // Load header
  fetch('manager-header.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById("header-include").innerHTML = data;

      // Now header is loaded, set up theme toggle & body references
      const toggle = document.getElementById('theme-toggle');
      const body = document.body;

      if (toggle) {
        // Initialize theme based on localStorage
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
      }

      // Smooth transition effect on theme change
      body.classList.add('theme-transition');
      setTimeout(() => body.classList.remove('theme-transition'), 300);
    })
    .catch(err => console.error('Error loading header:', err));
});
