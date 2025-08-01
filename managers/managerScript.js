document.addEventListener('DOMContentLoaded', function () {
  const overlay = document.getElementById('overlay');
  const popup = document.getElementById('popup');

  // Attach click handler to ALL popup buttons
  document.querySelectorAll('.popup-button').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const targetFile = this.getAttribute('data-target');

      fetch(targetFile)
        .then(res => res.text())
        .then(html => {
          popup.innerHTML = html; // Load manager content
          popup.style.display = 'block';
          overlay.style.display = 'block';

          // Handle close button inside the loaded content
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
});
