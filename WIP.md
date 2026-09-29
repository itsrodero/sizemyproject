# SizeMyProject — work in progress (NOT published, no domain yet)

Second site of the AdSense business (see niche research, 2026-09-29): free material calculators
for home & yard projects, English only, US audience. Working name/domain: sizemyproject.com
(not bought yet — the user will buy a domain; change SITE_URL, SITE_NAME and CONTACT_EMAIL in
`_tools/build.py` if the name changes).

## How it works
- Edit pages in `_src/*.html` (front matter + body); guides go in `_src/guides/`.
- `python _tools/build.py` writes the HTML at the repo root, sitemap.xml and robots.txt.
- Calculator pages: tool markup, then `<!-- content -->`, then the article.
- Bulk materials (gravel, mulch, topsoil, sand) use `[[bulk_form]]` + a `bulk-config` JSON block
  and `assets/js/calc/bulk.js`. Concrete has its own `assets/js/calc/concrete.js`.
- Shared helpers (units, URL state, copy/print) live in `assets/js/site.js` as `window.SMP`.
- Local preview: `python -m http.server 8766` from the repo root.

## Done (v0.1, 2026-09-29)
- Build system, design, header/footer, home, all-calculators hub, guides hub, about, methodology,
  contact, privacy (no cookies yet), terms, sitemap page, 404.
- Calculators: concrete (slab/footing, post hole, round slab, steps; bags 40–80 lb, ready-mix,
  cost), gravel, mulch, topsoil, sand. All tested (formulas checked against worked examples).

## Next
1. More calculators (priority by demand): paver, retaining wall block, fence, deck boards,
   square footage, sod, asphalt, rebar, concrete block, stair stringer, roof pitch; then interior
   (paint, drywall, flooring, tile, grout, insulation, wallpaper, siding, shingles); then HVAC (BTU).
2. Guides (project how-tos linked to calculators): measuring irregular areas, bags vs ready-mix,
   gravel driveway layers, mulching mistakes, paver patio base.
3. OG image, logo PNG, Search Console + Analytics after the domain is live.
4. AdSense only after TubeTools is approved and this site has ~20 guides + calculators.
