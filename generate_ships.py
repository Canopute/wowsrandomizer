# WoWS Tier X/XI ship list generator
# Uses the Wargaming Public API to export a complete ships.json with all Tier 10 and 11 ships.
#
# Requirements:
#   - Python 3.8+
#   - Requests: pip install requests
# Usage:
#   set WG_APP_ID=<your_application_id>
#   python generate_ships.py
# or:
#   python generate_ships.py --app-id <your_application_id>
#
# Get an API key (application_id) free at:
#   https://developers.wargaming.net/

import json
import os
import sys
import time
import argparse
from typing import Dict, List

import requests

API_BASE = "https://api.worldofwarships.eu/wows/encyclopedia/ships/"
DEFAULT_FIELDS = "name,tier,nation,type"
PAGE_LIMIT = 100

NATION_NAME = {
    "usa": "USA",
    "ussr": "USSR",
    "japan": "Japan",
    "germany": "Germany",
    "uk": "UK",
    "france": "France",
    "poland": "Poland",
    "pan_asia": "Pan-Asia",
    "italy": "Italy",
    "europe": "Europe",
    "commonwealth": "Commonwealth",
    "pan_america": "Pan-America",
    "spain": "Spain",
    "netherlands": "Netherlands",
}

TYPE_NAME = {
    "AirCarrier": "Carrier",
    "Battleship": "Battleship",
    "Cruiser": "Cruiser",
    "Destroyer": "Destroyer",
    "Submarine": "Submarine",
}

def fetch_all_ships(app_id: str) -> List[Dict]:
    ships: List[Dict] = []
    page = 1
    while True:
        params = {
            "application_id": app_id,
            "fields": DEFAULT_FIELDS,
            "page_no": page,
            "limit": PAGE_LIMIT,
            "language": "en",
        }
        r = requests.get(API_BASE, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
        if data.get("status") != "ok":
            raise RuntimeError(f"WG API error: {data}")
        entries = data.get("data") or {}
        # API returns a dict keyed by ship_id
        batch = [v for v in entries.values() if isinstance(v, dict)]
        ships.extend(batch)
        meta = data.get("meta") or {}
        total = meta.get("total", 0)
        page_total = len(batch)
        if page * PAGE_LIMIT >= total or page_total == 0:
            break
        page += 1
        time.sleep(0.2)  # be nice to the API
    return ships


def normalize(ship: Dict) -> Dict:
    # Ensure fields exist and map names
    name = ship.get("name") or ""
    tier = ship.get("tier")
    nation = NATION_NAME.get(ship.get("nation"), ship.get("nation") or "Unknown")
    sclass = TYPE_NAME.get(ship.get("type"), ship.get("type") or "Unknown")
    return {
        "name": name,
        "tier": tier,
        "nation": nation,
        "class": sclass,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate ships.json for Tier X and XI ships (all)")
    parser.add_argument("--app-id", dest="app_id", default=os.getenv("WG_APP_ID"), help="Wargaming application_id (env WG_APP_ID)")
    parser.add_argument("--out", dest="out", default="ships.json", help="Output file path (default ships.json)")
    args = parser.parse_args()

    if not args.app_id:
        print("ERROR: Missing WG application_id. Set WG_APP_ID env var or pass --app-id.")
        return 2

    print("Fetching all ships from WG API...")
    all_ships = fetch_all_ships(args.app_id)
    print(f"Fetched {len(all_ships)} ships (all tiers). Filtering Tier 10 and 11...")

    t10_t11 = [normalize(s) for s in all_ships if s.get("tier") in (10, 11)]
    # Sort for readability: tier -> class -> nation -> name
    t10_t11.sort(key=lambda s: (s.get("tier"), s.get("class"), s.get("nation"), s.get("name")))

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(t10_t11, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(t10_t11)} ships to {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
