
let currentType = "photos";

async function loadMedia() {
  const year = document.getElementById("yearSelect").value;
  const gallery = document.getElementById("gallery");

  try {
    const res = await fetch(`gallery/${year}/manifest.json`);
    if (!res.ok) throw new Error(`Failed to load gallery for ${year}`);
    const data = await res.json();

    gallery.innerHTML = "";

    if (data[currentType].length === 0) {
      gallery.innerHTML = `<p class="gallery-empty">No ${currentType} available for ${year}.</p>`;
      return;
    }

    data[currentType].forEach(file => {
      if (currentType === "photos") {
        gallery.innerHTML += `
          <img src="gallery/${year}/${file}" loading="lazy">
        `;
      } else {
        gallery.innerHTML += `
          <div class="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/${file.youtubeId}"
              title="${file.title}"
              loading="lazy"
              allowfullscreen>
            </iframe>
          </div>
        `;
      }
    });
  } catch (err) {
    console.error("Error loading gallery:", err);
    gallery.innerHTML = `<p class="gallery-error">Could not load gallery for ${year}. Please try again.</p>`;
  }
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentType = tab.dataset.type;
    loadMedia();
  });
});

document.getElementById("yearSelect").addEventListener("change", loadMedia);

loadMedia();
