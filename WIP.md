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

## Done
- v0.1 (2026-09-29): build system, design, site pages (home, hubs, about, methodology, contact,
  privacy — no cookies yet —, terms, sitemap, 404) and 5 calculators: concrete, gravel, mulch, topsoil, sand.
- v0.2 (2026-09-30): 11 more calculators — paver, retaining wall, asphalt, sod, fence, deck,
  square footage, paint, drywall, flooring, tile (16 total, 6 categories) — and 4 guides
  (measuring irregular areas, bags vs ready-mix, gravel driveway, cubic yards to tons).
  Every calculator tested in the browser against the worked examples on its page.
- Private GitHub repo: github.com/itsrodero/sizemyproject (branch main).

## Next
1. More calculators: concrete block, rebar, stair stringer, roof pitch/shingles, siding, insulation,
   wallpaper, BTU/AC size (HVAC), mortar/thinset, board foot.
2. More guides (target ~20 before AdSense): paver patio base, mulching mistakes, how thick a concrete
   slab should be, how to build a retaining wall, deck board spacing, how to measure a room for flooring…
3. OG image + logo PNG; when the domain is bought: set SITE_URL/SITE_NAME/CONTACT_EMAIL, CNAME,
   make the repo public (or another host), GitHub Pages, Search Console, Analytics.
4. AdSense only after TubeTools is approved and this site has ~20 guides + calculators.
