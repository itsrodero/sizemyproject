# SizeMyProject — work in progress (LIVE at sizemyproject.com since 2026-09-30)

Second site of the AdSense business (see niche research, 2026-09-29): free material calculators
for home & yard projects, English only, US audience. Domain sizemyproject.com (Namecheap),
hosted on GitHub Pages from this public repo.

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
  privacy — no cookies yet —, terms, sitemap, 404) and 5 calculators.
- v0.2 (2026-09-30): 22 calculators in 7 categories, 20 guides grouped by category,
  OG image, logo, touch icon, Organization logo in structured data.
- v0.3 (2026-10-03): Raised Bed Soil Calculator (beds × depth − filler, soil mixes, bags) and guide
  "How long does concrete take to cure?" — 23 calculators, 21 guides.
- v0.4 (2026-10-08): Rebar Calculator (two-way slab grid, lap splices, stock-length cutting, weight, ties)
  and Board Foot Calculator (4 rows, fractions like 5/4, price per bf) — 25 calculators, 21 guides.
- 2026-10-09: internal linking pass — every guide now gets links from its calculators (in-content links +
  4-item "related" lists with guides; 4 related cards lay out in one row). Expanded "How to calculate cubic
  yards" (quick-reference table, uneven depth, triangle example, common mistakes) — it was "crawled – not
  indexed" with 0 internal links. Search Console Pages report (lags a few days): 45 indexed, 3 redirects
  (http/www, fine), 2 discovered (contact, sitemap page), 6 crawled-not-indexed of which 4 were already
  indexed on live inspection; still out: cubic-yards guide and concrete-curing guide.
- Quality: every calculator tested in the browser against its worked examples; tables recomputed;
  Lighthouse 100/100/100/100 on sampled pages; all fields labelled; no horizontal overflow at 375 px
  on any page; 0 broken internal links.
- GitHub repo github.com/itsrodero/sizemyproject (branch main), public since 2026-09-30.
- Launch (2026-09-30), see LAUNCH.md for the checklist:
  - Domain bought; Namecheap registrant contact verified (2026-09-30).
  - GitHub Pages from main / root, custom domain via `CNAME`, domain verified for the account
    (TXT `_github-pages-challenge-itsrodero`).
  - DNS at Namecheap: 4 A records for `@`, CNAME `www` → itsrodero.github.io, TXT for Google.
  - Email: `hello@sizemyproject.com` forwards to the owner's Gmail inbox (Namecheap Redirect Email,
    Mail Settings = Email Forwarding). WHOIS privacy on; auto-renew on (expires 2027-09-30).
  - Google Analytics (2026-10-01): property "SizeMyProject" (ID 556936348) in the same GA account
    as TubeTools, web stream measurement ID G-QZ5WB2LV6Q; event retention 14 months; Google
    signals off. Tag uses consent mode (denied in EEA/UK/CH) and loads after the page; privacy
    policy describes Analytics and cookies.
  - Search Console: Domain property `sc-domain:sizemyproject.com` verified (Google account of
    Chrome authuser 2, the same one as TubeTools).

## Launch status
- HTTPS: certificate issued and "Enforce HTTPS" on (2026-09-30). http and www redirect to https://sizemyproject.com.
- Sitemap `https://sizemyproject.com/sitemap.xml` (51 URLs) submitted in Search Console on 2026-09-30.
  It first shows "No se ha podido obtener" until Google's first read — normal for a new property.
- Indexing: the home page and /concrete-calculator.html were indexed on their own from the sitemap
  (seen 2026-10-01). The daily quota is per Google account and is shared with TubeTools (5 + 5 per
  day agreed); it behaves like a rolling 24 h window.
  - Requested 2026-10-01 (~21:00): /calculators.html, gravel, mulch, paver, deck.
  - Requested 2026-10-02 (~21:00): roofing, flooring, drywall, block, asphalt.
  - Requested 2026-10-03 (~21:05): /raised-bed-soil-calculator.html, /guides/how-long-does-concrete-take-to-cure.html,
    /wallpaper-calculator.html, /guides.html, /guides/how-to-calculate-cubic-yards.html.
  - Check 2026-10-08: about 49 of 53 indexed. Not indexed: /guides/how-long-does-concrete-take-to-cure.html
    and /guides/how-to-calculate-cubic-yards.html ("crawled – not indexed", crawled 2026-10-03; give it
    time), /contact.html and /sitemap-page.html (low priority).
  - Search Console 2026-09-29..10-05: 326 impressions, 0 clicks, average position 64.9.
  - Already indexed on their own by 2026-10-02: home, concrete, paint, fence, BTU, tile,
    retaining wall, topsoil, square footage, sod, sand, stair.
  - Check 2026-10-03: at least 25 of 53 URLs indexed (the 10 requested on 10-01/10-02 not re-checked). Not indexed: /raised-bed-soil-calculator.html and
    /guides/how-long-does-concrete-take-to-cure.html (new), /wallpaper-calculator.html, /guides.html,
    guides: how-to-calculate-cubic-yards, how-to-mix-bagged-concrete, how-many-coats-of-paint,
    paver-patio-base, retaining-wall-planning, roof-pitch-explained, stair-dimensions-code,
    what-size-air-conditioner, gravel-types, how-to-lay-sod, mulching-mistakes; /about.html
    (/contact.html and /sitemap-page.html: low priority). The user requests them by hand from 2026-10-03.

## Next (after launch)
1. More calculators: rebar, board foot/lumber, siding, epoxy, pool volume/chlorine, garden soil for raised beds,
   carpet, grout, mortar for pavers, electrical wire size (careful: safety).
2. More guides: concrete curing, choosing pavers, retaining wall blocks, how to insulate an attic,
   paint sheen guide, how to install vinyl plank, etc.
3. AdSense (see LAUNCH.md §6) when this site is ready on its own — it does NOT wait for TubeTools
   (rule changed with the user on 2026-10-01). Ready = most pages indexed in Search Console and some
   organic visits in Analytics; expected 4–8 weeks after launch. Record here when it is requested and
   the result (the weekly reminder reads this file).

- Indexing 2026-10-09: /rebar-calculator.html, /board-foot-calculator.html (~17:40) and the expanded
  /guides/how-to-calculate-cubic-yards.html (~19:35).

## Pinterest (prepared 2026-10-09)
- 46 vertical pins (1000x1500 JPEG), one per calculator and guide: `assets/img/pins/<name>.jpg`, published on
  the site so Pinterest can fetch them by URL. Regenerate with `python _tools/pins.py` then
  `node _tools/pins.mjs` (`--all` to redo every image). Template: `_tools/img/pin.html`.
- `_tools/pinterest-pins.csv`: Title, Media URL, Pinterest board, Description, Link, Publish date, Keywords
  plus an empty Thumbnail column — the format in Pinterest's "Bulk upload Pins" help article.
  Scheduled 4 pins/day (15:00–23:00 Spain) from 2026-10-10; uploaded 2026-10-09 via Settings > Import content.
- 7 boards, one per category (names in pins.py BOARDS).
- Claim the domain: paste the content of Pinterest's `p:domain_verify` tag into PINTEREST_VERIFY in build.py.
- Account created 2026-10-09 (business, "SizeMyProject", pinterest.com/roderolabs); site claimed ("Conectado");
  profile photo + bio set; 7 boards created; CSV uploaded — 46 pins scheduled (checked 19:30).

