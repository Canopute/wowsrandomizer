# Scrape Tier X/XI ships from the WoWS Global Wiki (no API)
# Output: ships.json with all ships that have Tier 10 or 11 listed on the List of Ships page.
#
# Requirements:
#   pip install requests beautifulsoup4 lxml
# Usage:
#   python scrape_ships.py
# Notes:
# - This depends on the structure of https://wiki.wargaming.net/en/Ship:List_of_Ships
#   If the wiki layout changes, selectors may need updates.
# - The script tries to infer Nation and Class/type from the table columns.

import json
import re
import sys
from typing import Dict, List

import requests
from bs4 import BeautifulSoup

URL = "https://wiki.wargaming.net/en/Ship:List_of_Ships"

TIER_MAP = {
    "X": 10,
    "10": 10,
    "XI": 11,
    "11": 11,
}

# Normalize nation spelling to match app style
NATION_NORMALIZE = {
    "U.S.A.": "USA",
    "USA": "USA",
    "U.S.S.R.": "USSR",
    "U.S.S.R": "USSR",
    "Soviet Union": "USSR",
    "Japan": "Japan",
    "Germany": "Germany",
    "U.K.": "UK",
    "UK": "UK",
    "France": "France",
    "Poland": "Poland",
    "Pan-Asia": "Pan-Asia",
    "Pan Asia": "Pan-Asia",
    "Italy": "Italy",
    "Europe": "Europe",
    "Commonwealth": "Commonwealth",
    "Pan-America": "Pan-America",
    "Pan America": "Pan-America",
    "Spain": "Spain",
    "Netherlands": "Netherlands",
    "Alaska": "USA",  # safety
}

CLASS_NORMALIZE = {
    "Aircraft Carrier": "Carrier",
    "Aircraft carrier": "Carrier",
    "AirCarrier": "Carrier",
    "Battleship": "Battleship",
    "Cruiser": "Cruiser",
    "Destroyer": "Destroyer",
    "Submarine": "Submarine",
}


def text(el) -> str:
    return re.sub(r"\s+", " ", (el.get_text(" ", strip=True) if el else "")).strip()


def parse_table(table) -> List[Dict]:
    ships = []
    headers = [text(th) for th in table.select("thead th")] or [text(th) for th in table.select("tr th")]
    header_idx = {h.lower(): i for i, h in enumerate(headers)}
    # Expected headers somewhere: Name, Nation, Type or Class, Tier

    def idx(*names):
        for n in names:
            i = header_idx.get(n.lower())
            if i is not None:
                return i
        return None

    i_name = idx("Name", "Ship")
    i_nation = idx("Nation")
    i_type = idx("Type", "Class")
    i_tier = idx("Tier")

    if i_name is None or i_tier is None:
        return ships

    for row in table.select("tbody tr"):
        cells = row.find_all(["td", "th"])
        if not cells or len(cells) < max(i for i in [i_name, i_tier, i_nation or 0, i_type or 0] if i is not None) + 1:
            continue
        name_cell = cells[i_name]
        tier_cell = cells[i_tier]
        nation_cell = cells[i_nation] if i_nation is not None else None
        type_cell = cells[i_type] if i_type is not None else None

        # Extract tier
        tier_text = text(tier_cell)
        tier_text = tier_text.replace("Tier ", "").strip()
        tier = TIER_MAP.get(tier_text)
        if tier not in (10, 11):
            continue

        # Name (prefer link text)
        a = name_cell.find("a")
        name = text(a) if a else text(name_cell)

        nation = text(nation_cell) if nation_cell else "Unknown"
        nation = NATION_NORMALIZE.get(nation, nation or "Unknown")

        sclass = text(type_cell) if type_cell else "Unknown"
        sclass = CLASS_NORMALIZE.get(sclass, sclass or "Unknown")

        ships.append({
            "name": name,
            "tier": tier,
            "nation": nation,
            "class": sclass,
        })
    return ships


def scrape() -> List[Dict]:
    r = requests.get(URL, timeout=60)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "lxml")
    ships: List[Dict] = []
    # The page has multiple data tables under the "Table of Ships" section
    for table in soup.select("table.wikitable"):
        ships.extend(parse_table(table))

    # Deduplicate by name (keeping first occurrence)
    seen = set()
    unique: List[Dict] = []
    for s in ships:
        if s["name"] in seen:
            continue
        seen.add(s["name"])
        unique.append(s)

    # Sort for readability
    unique.sort(key=lambda s: (s["tier"], s["class"], s["nation"], s["name"]))
    return unique


def main() -> int:
    ships = scrape()
    with open("ships.json", "w", encoding="utf-8") as f:
        json.dump(ships, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(ships)} ships to ships.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
