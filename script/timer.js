const targetDate = new Date("2025-12-11T07:14:59").getTime();
let timer;
let lastValues = {};

function setWithFade(id, value, label) {
  const el = document.getElementById(id);
  if (!el) return;

  const newValue = value + "<span class='label'>" + label + "</span>";

  if (lastValues[id] !== newValue) { 
    // Only update if value actually changed
    el.innerHTML = newValue;

    el.classList.remove("fade");
    void el.offsetWidth; // reflow trick
    el.classList.add("fade");

    lastValues[id] = newValue; // update stored value
  }
}


function updateCountdown() {
  const now = new Date().getTime();
  const diff = targetDate - now;

  if (diff <= 0) {
    document.getElementById("countdown").innerHTML = "🎉 Its a Celebration!";
    clearInterval(timer);
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // document.getElementById("days").innerHTML = days + "<span class='label'>Days</span>";
  // document.getElementById("hours").innerHTML = hours + "<span class='label'>Hours</span>";
  // document.getElementById("minutes").innerHTML = minutes + "<span class='label'>Minutes</span>";
  // document.getElementById("seconds").innerHTML = seconds + "<span class='label'>Seconds</span>";

  setWithFade("days", days, "Days");
  setWithFade("hours", hours, "Hours");
  setWithFade("minutes", minutes, "Minutes");
  setWithFade("seconds", seconds, "Seconds");
}
document.addEventListener("DOMContentLoaded", () => {
    fetch('timer.html')
    .then(response => response.text())
    .then(data => {
      const timerPlaceholder = document.getElementById('timer-placeholder');
      timerPlaceholder.innerHTML = data;
      
      
      
      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
    });
});
