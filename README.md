# Atlas-Terra-Contributing-
# 🌐 Terra

**EN** An open portal to the planet: an interactive map (street, terrain and live NASA satellite layers, live ISS position), 39 little-known places across all continents and oceans, continent statistics, and curated links to open-source maps, 3D globes, free APIs, ISS/astronaut imagery and kids' resources. Available in FR · EN · DE · ZH · RU.

**FR** Portail ouvert sur la planète : carte interactive (plan, relief, satellite NASA récent, position de l'ISS en direct), 39 lieux méconnus sur tous les continents et océans, statistiques des continents et liens vers des cartes open source, globes 3D, API gratuites, images de l'ISS et ressources pour enfants.

## Tabs / Onglets
Map · Rare regions · Continents · Maps & satellites · 3D · Data & APIs · ISS & space · Kids (with a "mystery place" game).

## Run
Static site, no build. Serve it over HTTP because it loads JSON files:
```bash
python3 -m http.server 8000   # open http://localhost:8000
```
Publish with GitHub → Settings → Pages (branch root). Force a language with `?lang=zh`.

## Structure
| Path | Role |
|---|---|
| `data/places.json` | Rare places: id, group, coordinates, FR/EN name and fact |
| `data/continents.json` | Continent figures (area in M km², population in billions, extremes in metres) |
| `data/resources.json` | Links by tab (maps, 3d, api, space, kids, family) with license and FR/EN description |
| `i18n/<lang>.json` | Interface strings per language |
| `scripts/validate.js` | Validates data; `--links` checks that every URL still answers |

## Data analysis
```python
import pandas as pd
places = pd.read_json("data/places.json")
places[["lat","lon"]] = places[["lat","lon"]].round(1)
print(places.groupby("g").size())
```
The Places tab also exports a CSV.

## External services (no API key)
OpenStreetMap and OpenTopoMap tiles, NASA GIBS satellite tiles (MODIS, 2 days old), Open-Meteo (live weather, non-commercial use, CC BY 4.0), wheretheiss.at (ISS position). Please respect each service's usage policy and keep attributions.

## ⚠️ Quality
Coordinates are rounded and facts are short summaries: verify before relying on them. Continent figures are approximate. Status of some territories evolves: sources welcome. Link availability changes: run `node scripts/validate.js --links` regularly.

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md). Wanted: more rare places, translations of place names/facts/descriptions into DE, ZH, RU, new open resources, link checks.

## License
Code MIT. Data and texts CC BY 4.0. See [LICENSE](LICENSE).
