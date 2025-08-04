document.addEventListener('DOMContentLoaded', function () {
  const overlay = document.getElementById('overlay');
  const popup = document.getElementById('popup');

  // Popup logic
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



  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    toggle.checked = true;
  }

  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  });

  // Smooth transition
  body.classList.add('theme-transition');
  setTimeout(() => body.classList.remove('theme-transition'), 300);

  // Load header
  fetch("../header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header-include").innerHTML = data;

    // Now the header is loaded — get the toggle element:
    const toggle = document.getElementById('theme-toggle');
    const body = document.body;

    if (toggle) { // safety check
      if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        toggle.checked = true;
      }

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
  })
  .catch(err => console.error('Error loading header:', err));

});
