# Board tools

- `gen.js` builds a board with exactly one solution from a seed.
- `rate.js` solves a board the way a person would and grades it by the hardest deduction needed:
  I last spot · II boxed in · III blast check · IV pairs and trios · V what-if · VI beyond.
- `curve.js` grades a pool of boards per size and picks the seeds for missions 1–50 so difficulty climbs smoothly.
  Run `node tools/curve.js`; it writes `seeds.json`, which is pasted into `MISSION_SEEDS` in `index.html`.
