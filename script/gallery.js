
let currentType = "photos";

async function loadMedia() {
  const year = document.getElementById("yearSelect").value;
  const res = await fetch(`../gallery/${year}/manifest.json`);
  const data = await res.json();

  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  data[currentType].forEach(file => {
    if (currentType === "photos") {
      gallery.innerHTML += `
        <img src="../gallery/${year}/${file}" loading="lazy">
      `;
    } else {
      gallery.innerHTML += `
        <div class="video-wrapper">
        <iframe
          src="https://www.youtube.com/embed/${item.youtubeId}"
          title="${item.title}"
          loading="lazy"
          allowfullscreen>
        </iframe>
      </div>
      `;
    }
  });
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

