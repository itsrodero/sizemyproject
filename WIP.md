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
  - Search Console: Domain property `sc-domain:sizemyproject.com` verified (Google account of
    Chrome authuser 2, the same one as TubeTools).

## Pending launch steps
- HTTPS: wait for GitHub's certificate, then tick "Enforce HTTPS" (Settings → Pages).
- Then submit `https://sizemyproject.com/sitemap.xml` and request indexing (≤10 URLs/day):
  home, /calculators.html, concrete, gravel, mulch, paver, deck, paint, square footage, fence,
  then roofing, BTU, the other calculators and the guides.

## Next (after launch)
1. More calculators: rebar, board foot/lumber, siding, epoxy, pool volume/chlorine, garden soil for raised beds,
   carpet, grout, mortar for pavers, electrical wire size (careful: safety).
2. More guides: concrete curing, choosing pavers, retaining wall blocks, how to insulate an attic,
   paint sheen guide, how to install vinyl plank, etc.
3. After ~1–2 months indexed and TubeTools approved: AdSense (see LAUNCH.md §6).
