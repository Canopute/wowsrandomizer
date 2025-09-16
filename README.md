# WoWS Tier X/XI Randomizer

A tiny, no-install web app to randomly pick a World of Warships Tier X or Supership (Tier XI).

## How to use

- Open `wows-randomizer\index.html` in your browser.
- Click **Randomize**. It will pick from Tier X and XI by default. Uncheck any tier you want to exclude.
- The app works offline and directly from the file system (no server needed) using an embedded sample dataset.

## Editing or expanding the ship list

- The app also supports an external `ships.json` file, but most browsers block `fetch()` from `file://` URLs. To use `ships.json`, serve the folder over HTTP.
- Easiest options to serve locally:
  - If you have Python installed:
    - `python -m http.server 5500` (then open http://localhost:5500/ and navigate to the folder)
  - Or use any simple static server you prefer.
- When served via HTTP, the app will automatically load `ships.json` and use that instead of the embedded sample.

### `ships.json` format

An array of objects:
```json
[
  { "name": "Yamato", "tier": 10, "nation": "Japan", "class": "Battleship" },
  { "name": "Satsuma", "tier": 11, "nation": "Japan", "class": "Battleship" }
]
```

Fields:
- `name`: string (ship name)
- `tier`: number (10 or 11)
- `nation`: string
- `class`: string (e.g., Battleship, Cruiser, Destroyer, Carrier)

