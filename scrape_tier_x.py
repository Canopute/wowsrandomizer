# Scrape all ships from Category:Tier X ships and write them to ships.json
# No WG API usage. Uses the Global Wiki category and each ship page.
#
# Requirements:
#   pip install requests beautifulsoup4 lxml
# Usage:
#   python scrape_tier_x.py
# Output:
#   ships.json containing all Tier 10 ships with fields: name, tier, nation, class

import json
import re
from typing import Dict, List, Optional

import requests
from bs4 import BeautifulSoup

CATEGORY_URL = "https://wiki.wargaming.net/en/Category:Tier_X_ships"
BASE = "https://wiki.wargaming.net"

NATION_NORMALIZE = {
    "U.S.A.": "USA",
    "USA": "USA",
    "United States": "USA",
    "U.S.S.R.": "USSR",
    "U.S.S.R": "USSR",
    "Soviet Union": "USSR",
    "Japan": "Japan",
    "Germany": "Germany",
    "U.K.": "UK",
    "UK": "UK",
    "Great Britain": "UK",
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
    "Argentina": "Pan-America",
    "Chile": "Pan-America",
    "Mexico": "Pan-America",
}

CLASS_NORMALIZE = {
    "Aircraft Carrier": "Carrier",
    "Aircraft carrier": "Carrier",
    "Carrier": "Carrier",
    "Battleship": "Battleship",
    "Cruiser": "Cruiser",
    "Destroyer": "Destroyer",
    "Submarine": "Submarine",
}

ROMAN_TO_INT = {"I":1, "II":2, "III":3, "IV":4, "V":5, "VI":6, "VII":7, "VIII":8, "IX":9, "X":10, "XI":11}


def get_soup(url: str) -> BeautifulSoup:
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    return BeautifulSoup(r.text, "lxml")


def parse_category_links() -> List[str]:
    soup = get_soup(CATEGORY_URL)
    links = []
    # The category page lists links under content; exclude User: links
    for a in soup.select("a[href^='/en/Ship:']"):
        href = a.get("href")
        if not href:
            continue
        if "/User:" in href:
            continue
        # Remove duplicates
        full = BASE + href
        if full not in links:
            links.append(full)
    return links


def roman_to_int(roman: str) -> Optional[int]:
    roman = roman.strip().upper()
    return ROMAN_TO_INT.get(roman)


def extract_infobox_data(page: BeautifulSoup) -> Dict[str, str]:
    data: Dict[str, str] = {}
    # Find an infobox table
    infobox = page.select_one("table.infobox") or page.select_one("table.infobox.vcard")
    if not infobox:
        return data
    for row in infobox.select("tr"):
        header = row.find("th")
        value = row.find("td")
        if not header or not value:
            continue
        key = re.sub(r"\s+", " ", header.get_text(" ", strip=True)).strip()
        val = re.sub(r"\s+", " ", value.get_text(" ", strip=True)).strip()
        data[key] = val
    return data


def parse_ship(url: str) -> Optional[Dict]:
    page = get_soup(url)
    # Name
    h1 = page.select_one("#firstHeading")
    name = h1.get_text(strip=True) if h1 else None

    info = extract_infobox_data(page)

    # Try to pull fields from common labels
    tier_str = info.get("Tier") or info.get("Ship tier") or ""
    # Tier might include the word "Tier X"; extract roman numerals
    m = re.search(r"\b(XI|X)\b", tier_str)
    tier = roman_to_int(m.group(1)) if m else None

    sclass = info.get("Type") or info.get("Class") or info.get("Ship type") or "Unknown"
    sclass = CLASS_NORMALIZE.get(sclass, sclass)

    nation = info.get("Nation") or info.get("Country") or "Unknown"
    nation = NATION_NORMALIZE.get(nation, nation)

    if not name:
        # Fallback: last part of URL
        name = url.split(":")[-1].replace("_", " ")

    if tier != 10:
        # Only keep Tier X from this category
        return None

    return {
        "name": name,
        "tier": tier,
        "nation": nation,
        "class": sclass,
    }


def main() -> int:
    print("Fetching Tier X ship links from category...")
    links = parse_category_links()
    print(f"Found {len(links)} candidate pages. Parsing...")

    ships: List[Dict] = []
    for i, url in enumerate(links, 1):
        try:
            ship = parse_ship(url)
            if ship:
                ships.append(ship)
                print(f"[{i}/{len(links)}] + {ship['name']}")
            else:
                print(f"[{i}/{len(links)}] - skipped (not Tier X): {url}")
        except Exception as e:
            print(f"[{i}/{len(links)}] ! error {url}: {e}")

    # Deduplicate by name (keep first)
    seen = set()
    unique: List[Dict] = []
    for s in ships:
        if s["name"] in seen:
            continue
        seen.add(s["name"])
        unique.append(s)

    unique.sort(key=lambda s: (s["class"], s["nation"], s["name"]))

    with open("ships.json", "w", encoding="utf-8") as f:
        json.dump(unique, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(unique)} Tier X ships to ships.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
