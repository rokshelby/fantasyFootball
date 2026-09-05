// Links historical team names to their current manager, using managers.json's
// `previous_team_names` (e.g. { "name": "Cant Gage This One", "seasons": [2022] })
// so pages that group match data by manager name don't split one manager's
// history across renames.
//
// match data itself is never changed — this only normalizes names in memory
// after fetching, right before grouping/rendering.
const ManagerResolver = (() => {
  // managers: the array from managers.json
  // returns Map<lowercased old-or-current name, current canonical name>
  function buildAliasMap(managers) {
    const map = new Map();
    managers.forEach(m => {
      map.set(m.name.trim().toLowerCase(), m.name);
      (m.previous_team_names || []).forEach(entry => {
        // entry is normally { name, seasons: [...] }; a bare string is
        // tolerated too in case older data ever slips through unmigrated.
        const name = typeof entry === 'string' ? entry : entry.name;
        map.set(name.trim().toLowerCase(), m.name);
      });
    });
    return map;
  }

  // Convenience: fetch + build in one step, for pages that don't already
  // fetch managers.json for another purpose. Path is relative to the page.
  async function loadAliasMap(managersPath = 'data/managers.json') {
    const res = await fetch(managersPath);
    if (!res.ok) throw new Error(`Failed to load ${managersPath}`);
    const managers = await res.json();
    return buildAliasMap(managers);
  }

  function normalizeName(name, aliasMap) {
    if (!name) return name;
    return aliasMap.get(name.trim().toLowerCase()) || name;
  }

  // Returns a new array of matches with manager_a_id/manager_b_id/winner_id
  // resolved to each manager's current canonical name.
  function normalizeMatches(matches, aliasMap) {
    return matches.map(m => ({
      ...m,
      manager_a_id: normalizeName(m.manager_a_id, aliasMap),
      manager_b_id: normalizeName(m.manager_b_id, aliasMap),
      winner_id: normalizeName(m.winner_id, aliasMap)
    }));
  }

  return { buildAliasMap, loadAliasMap, normalizeName, normalizeMatches };
})();
