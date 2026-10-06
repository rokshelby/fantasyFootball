// Add a year here once it has archive/<year>/draft<year>.json and/or draft-analysis<year>.json
const DRAFT_YEARS = [2026, 2025,2024,2023,2022,2021,2020];

document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('draftYearSelect');
  if (!select) return;

  DRAFT_YEARS.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    select.appendChild(option);
  });

  const loadYear = (year) => {
    loadDraftAnalysis(year);
    loadDraftBoard(year);
  };

  select.addEventListener('change', () => loadYear(select.value));

  // Allow linking to a specific year, e.g. draft.html?year=2025
  const requestedYear = Number(new URLSearchParams(window.location.search).get('year'));
  select.value = DRAFT_YEARS.includes(requestedYear) ? requestedYear : DRAFT_YEARS[0];
  loadYear(select.value);
});
