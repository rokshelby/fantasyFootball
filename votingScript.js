document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('votingForm');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const keeperVote = document.getElementById('keeperVote').value;
    const weeklyVote = document.getElementById('weeklyVote').value;
    const waiverVote = document.getElementById('waiverVote').value;
    const note = document.getElementById('note').value.trim();

    if (!name || !email) {
      alert('Please fill out both your name and email.');
      return;
    }

    // Example: Show submission in an alert (replace with fetch if sending to server)
    alert(
      `Thank you for voting, ${name}!\n\n` +
      `Email: ${email}\n` +
      `Keeper League: ${keeperVote}\n` +
      `Weekly High Score: ${weeklyVote}\n` +
      `Waiver Wire: ${waiverVote}\n` +
      `Note: ${note || "No note provided."}`
    );

    form.reset(); // Clear form
  });
});