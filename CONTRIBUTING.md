# Contributing

## Add a place (`data/places.json`)
```json
{"id":"example","g":"oc","name":{"fr":"Nom","en":"Name"},"lat":-10.5,"lon":105.7,
 "fact":{"fr":"Un fait vérifiable, court.","en":"A short verifiable fact."}}
```
Groups: `an eu na sa oc as af atl ind`. Add `"iso":"cx"` only if the ISO code's official name matches the place. FR and EN are required, `de`, `zh`, `ru` are optional (the interface falls back to English). Cite your source in the pull request. Keep facts neutral; for disputed or sensitive territories describe the situation without taking sides.

## Add a resource (`data/resources.json`)
Free or open, stable, `https`, with its license. Tabs: `maps`, `3d`, `api`, `space`, `kids`, `family`. Explain in the pull request why it is useful. Say clearly when a service is free but not open source or needs a free key.

## Translate
Add `"de"`, `"zh"` or `"ru"` keys inside `name`, `fact` and `desc`, or improve `i18n/<lang>.json`.

## Before a pull request
Run `node scripts/validate.js` (and `--links` for new URLs). Keep the project dependency-free; Leaflet is the only library, loaded from cdnjs.
