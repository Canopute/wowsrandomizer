// Simple WoWS T10/T11 Randomizer
// Works from file:// (embedded data) and http(s):// (optional ships.json fetch)

// Known classes and nations for filters (used even before enrichment)
const KNOWN_CLASSES = ["Battleship", "Cruiser", "Destroyer", "Carrier", "Submarine"];
const KNOWN_NATIONS = [
  "USA", "USSR", "Japan", "Germany", "UK", "France", "Italy", "Europe",
  "Pan-Asia", "Pan-America", "Netherlands", "Spain", "Commonwealth", "Poland"
];

const embeddedShips = [
  { name: "Admiral Nakhimov", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Alexander Nevsky", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "AL Shimakaze", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Archerfish", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "ARP Yamato", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Astoria", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Attilio Regolo", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Audacious", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Austin", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Balao", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "BA Montana", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "BA Takahashi", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Bourgogne", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Brennus", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Brisbane", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Bungo", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Cassard", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Castilla", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Cerberus", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Colbert", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Conqueror", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Cristoforo Colombo", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Daring", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Defence", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Delny", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Des Moines", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Druid", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Elbing", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Essex", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Forrest Sherman", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Franklin D. Roosevelt", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Gato", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Gdańsk", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Gearing", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Georg Hoffmann", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Gibraltar", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Goliath", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Gouden Leeuw", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Grozovoi", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Großer Kurfürst", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Hakuryu", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Halland", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Harugumo", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Hayate", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Henri IV", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Hildebrand", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Hindenburg", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Incomparable", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Jinan", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Khabarovsk", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Kitakami", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Kléber", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Kléber CLR", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Komissar", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Kreml", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "La Pampa", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Libertad", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Louisiana", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Lüshun", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Malta", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Manfred von Richthofen", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Marceau", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Marseille", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Max Immelmann", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Mecklenburg", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Midway", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Minotaur", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Montana", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Moskva", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Napoli", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Napoli B", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Ohio", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "PBSC020 Monmouth", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Petropavlovsk", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Plymouth", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Preussen", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Prins van Oranje", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Puerto Rico", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Ragnar", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Rhode Island", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Ruggiero di Lauria", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "République", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Salem", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "San Martín", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Schlieffen", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Sevastopol", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Shikishima", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Shimakaze", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Shinano", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Sicilia", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Slava", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Smolensk", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Smolensk B", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Småland", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Somers", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "St. Vincent", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Stalingrad", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Svea", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Thrasher", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Thunderer", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Tromp", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "U-2501", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "U-4501", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Vampire II", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Venezia", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Vermont", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Vladimir Monomakh", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Wisconsin", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Worcester", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Yamato", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Yari", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Yodo", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Yoshino", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Yoshino B", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Yueyang", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Z-42", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Z-52", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Zao", tier: 10, nation: "Unknown", class: "Unknown" },
  { name: "Álvaro de Bazán", tier: 10, nation: "Unknown", class: "Unknown" },
  // Tier XI (Superships) - currently sample entries; say the word and I will embed full Tier XI as well
  { name: "Satsuma", tier: 11, nation: "Japan", class: "Battleship" },
  { name: "Hannover", tier: 11, nation: "Germany", class: "Battleship" },
  { name: "Conde", tier: 11, nation: "France", class: "Cruiser" },
  { name: "Yamagiri", tier: 11, nation: "Japan", class: "Destroyer" },
  { name: "United States", tier: 11, nation: "USA", class: "Carrier" },
];

async function loadShips() {
  // Use embedded by default to support file:// usage
  let data = embeddedShips;

  // If served via http(s), try to load ships.json to allow easy editing/expansion
  if (location.protocol.startsWith("http")) {
    try {
      const res = await fetch("ships.json", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) data = json;
      }
    } catch (e) {
      // Keep embedded data as fallback
      console.warn("Falling back to embedded ship list:", e);
    }
  }

  return data;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function displayShip(ship) {
  const result = document.getElementById("result");
  const shipName = document.getElementById("shipName");
  const shipMeta = document.getElementById("shipMeta");

  if (!ship) {
    shipName.textContent = "No ships match your filters";
    shipMeta.textContent = "";
    result.classList.remove("hidden");
    return;
  }

  shipName.textContent = ship.name;
  const badges = [];
  badges.push(`<span class="badge badge-tier">Tier ${ship.tier}</span>`);
  if (ship.class && ship.class !== "Unknown") {
    badges.push(`<span class="badge badge-class">${ship.class}</span>`);
  }
  if (ship.nation && ship.nation !== "Unknown") {
    badges.push(`<span class="badge badge-nation">${ship.nation}</span>`);
  }
  shipMeta.innerHTML = badges.join("");
  result.classList.remove("hidden");
}

(async function init() {
  const randomizeBtn = document.getElementById("randomizeBtn");
  const tier10 = document.getElementById("tier10");
  const tier11 = document.getElementById("tier11");
  const noRepeat = document.getElementById("noRepeat");
  const classFiltersRoot = document.getElementById("classFilters");
  const nationFiltersRoot = document.getElementById("nationFilters");
  const enrichBtn = document.getElementById("enrichBtn");

  const ships = await loadShips();

  // Cache for enriched metadata
  const cacheKey = "wowsMetaCache";
  const metaCache = loadCache(cacheKey);
  applyCacheToShips(ships, metaCache);

  // Render filter checkboxes
  renderFilterCheckboxes(classFiltersRoot, KNOWN_CLASSES, "class-");
  renderFilterCheckboxes(nationFiltersRoot, KNOWN_NATIONS, "nation-");

  function filterShips() {
    const allowedTiers = new Set([
      ...(tier10.checked ? [10] : []),
      ...(tier11.checked ? [11] : []),
    ]);
    const selectedClasses = getSelectedValues(classFiltersRoot, "class-");
    const selectedNations = getSelectedValues(nationFiltersRoot, "nation-");

    return ships.filter(s => {
      if (!allowedTiers.has(s.tier)) return false;
      // If no class filters selected, accept all classes (including Unknown)
      if (selectedClasses.size > 0) {
        if (!s.class || s.class === "Unknown" || !selectedClasses.has(s.class)) return false;
      }
      // If no nation filters selected, accept all nations (including Unknown)
      if (selectedNations.size > 0) {
        if (!s.nation || s.nation === "Unknown" || !selectedNations.has(s.nation)) return false;
      }
      return true;
    });
  }

  let lastPickedName = null;
  randomizeBtn.addEventListener("click", () => {
    const filtered = filterShips();
    if (filtered.length === 0) {
      displayShip(null);
      return;
    }
    let choice = pickRandom(filtered);
    if (noRepeat && noRepeat.checked && filtered.length > 1) {
      let guard = 0;
      while (choice.name === lastPickedName && guard++ < 20) {
        choice = pickRandom(filtered);
      }
    }
    lastPickedName = choice.name;
    displayShip(choice);
  });

  if (enrichBtn) {
    enrichBtn.addEventListener("click", async () => {
      enrichBtn.disabled = true;
      const originalText = enrichBtn.textContent;
      try {
        const updated = await enrichMetadata(ships, metaCache, (done, total, currentName) => {
          enrichBtn.textContent = `Enriching ${done}/${total}… ${currentName || ""}`;
        });
        saveCache(cacheKey, updated);
        // Re-render by just picking again (filters will now show enriched badges)
        enrichBtn.textContent = "Enriched ✓";
      } catch (e) {
        console.warn(e);
        alert("Enrichment failed or was blocked by the browser (CORS). Try serving over HTTP.");
        enrichBtn.textContent = originalText;
      } finally {
        setTimeout(() => {
          enrichBtn.disabled = false;
          enrichBtn.textContent = originalText;
        }, 1500);
      }
    });
  }
})();

// ---------- UI helpers ----------
function renderFilterCheckboxes(root, values, idPrefix) {
  if (!root) return;
  root.innerHTML = values.map(v => {
    const id = `${idPrefix}${v.replace(/\s+/g, '-')}`;
    return `
      <label class="checkbox">
        <input type="checkbox" id="${id}" data-value="${v}">
        <span>${v}</span>
      </label>
    `;
  }).join("");
}

function getSelectedValues(root, idPrefix) {
  const set = new Set();
  if (!root) return set;
  const inputs = root.querySelectorAll(`input[id^="${idPrefix}"]`);
  inputs.forEach(inp => { if (inp.checked) set.add(inp.getAttribute("data-value")); });
  return set;
}

// ---------- Cache helpers ----------
function loadCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

function saveCache(key, obj) {
  try { localStorage.setItem(key, JSON.stringify(obj)); } catch {}
}

function applyCacheToShips(ships, cache) {
  ships.forEach(s => {
    const c = cache[s.name];
    if (!c) return;
    if (c.nation) s.nation = c.nation;
    if (c.class) s.class = c.class;
    if (c.tier) s.tier = c.tier;
  });
}

// ---------- Enrichment (online) ----------
async function enrichMetadata(ships, cache, onProgress) {
  const updated = { ...cache };
  const targets = ships.filter(s => s.nation === "Unknown" || s.class === "Unknown");
  const total = targets.length;
  for (let i = 0; i < targets.length; i++) {
    const s = targets[i];
    onProgress && onProgress(i + 1, total, s.name);
    try {
      const meta = await fetchShipMeta(s.name);
      if (meta) {
        if (meta.nation) s.nation = meta.nation;
        if (meta.class) s.class = meta.class;
        if (meta.tier) s.tier = meta.tier;
        updated[s.name] = { nation: s.nation, class: s.class, tier: s.tier };
      }
      await delay(120);
    } catch (e) {
      console.warn("Enrich failed for", s.name, e);
    }
  }
  return updated;
}

async function fetchShipMeta(name) {
  const url = `https://wiki.wargaming.net/en/Ship:${encodeURIComponent(name.replace(/\s+/g, '_'))}`;
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) return null;
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const info = doc.querySelector('table.infobox, table.infobox.vcard');
  if (!info) return null;
  const getField = (label) => {
    const rows = info.querySelectorAll('tr');
    for (const row of rows) {
      const th = row.querySelector('th');
      const td = row.querySelector('td');
      if (!th || !td) continue;
      const key = th.textContent.trim().toLowerCase();
      if (key === label) return td.textContent.trim();
    }
    return null;
  };
  const tierRaw = getField('tier') || getField('ship tier');
  const nationRaw = getField('nation') || getField('country');
  const classRaw = getField('type') || getField('ship type') || getField('class');

  const tier = parseTier(tierRaw);
  const nation = normalizeNation(nationRaw);
  const sclass = normalizeClass(classRaw);
  return { tier, nation, class: sclass };
}

function parseTier(val) {
  if (!val) return null;
  const m = val.match(/\b(XI|X|11|10)\b/i);
  if (!m) return null;
  return /XI|11/i.test(m[1]) ? 11 : 10;
}

function normalizeNation(n) {
  if (!n) return null;
  const map = {
    'U.S.A.': 'USA', 'USA': 'USA', 'United States': 'USA',
    'U.S.S.R.': 'USSR', 'U.S.S.R': 'USSR', 'Soviet Union': 'USSR',
    'Japan': 'Japan', 'Germany': 'Germany', 'U.K.': 'UK', 'UK': 'UK', 'Great Britain': 'UK',
    'France': 'France', 'Poland': 'Poland', 'Pan-Asia': 'Pan-Asia', 'Pan Asia': 'Pan-Asia',
    'Italy': 'Italy', 'Europe': 'Europe', 'Commonwealth': 'Commonwealth',
    'Pan-America': 'Pan-America', 'Pan America': 'Pan-America', 'Spain': 'Spain', 'Netherlands': 'Netherlands'
  };
  return map[n.trim()] || n.trim();
}

function normalizeClass(c) {
  if (!c) return null;
  const map = {
    'Aircraft Carrier': 'Carrier', 'Aircraft carrier': 'Carrier', 'Carrier': 'Carrier',
    'Battleship': 'Battleship', 'Cruiser': 'Cruiser', 'Destroyer': 'Destroyer', 'Submarine': 'Submarine'
  };
  return map[c.trim()] || c.trim();
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
