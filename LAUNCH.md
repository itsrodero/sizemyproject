# Launch checklist — SizeMyProject

Status 2026-09-30: steps 1–4 done and the Search Console property is verified. Still open: Enforce HTTPS
(waiting for GitHub's certificate), sitemap and indexing requests — see `WIP.md`.
Steps in order:

## 1. Buy the domain (user)
- Preferred: **sizemyproject.com** (free as of 2026-09-29 — re-check at purchase).
- Alternatives that were free: materialsizer.com, howmuchdoibuy.com, buildandyard.com, estimatemymaterials.com.
- Registrar: Namecheap (same account as tubetools.online). Turn on free WHOIS privacy.

## 2. Point the site at the domain (Claude)
- In `_tools/build.py`: set `SITE_URL`, `SITE_NAME` (if the name changes) and `CONTACT_EMAIL`.
- Add a `CNAME` file at the repo root containing the domain (e.g. `sizemyproject.com`).
- If the name changes: update the logo text in `header_html`/`footer_html`, `_tools/img/og.html` (re-render `assets/img/og.png`) and the About page.
- Rebuild (`python _tools/build.py`), run link/tag checks, commit, push.

## 3. Hosting
- **GitHub Pages** (same as TubeTools): free plan needs a **public** repo.
  Settings → Pages → Deploy from branch `main` / root → Custom domain → Enforce HTTPS.
- Alternative if the repo must stay private: Cloudflare Pages (free), build command none, output `/`.

## 4. DNS at Namecheap (Advanced DNS)
- Verify the domain for GitHub Pages first (Settings → Pages → verified domains → add TXT
  `_github-pages-challenge-itsrodero` with the value GitHub shows).
- A records for `@` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
- CNAME `www` → `itsrodero.github.io`
- Email forwarding: `hello@<domain>` → the user's inbox (Namecheap → Domain → Redirect Email).

## 5. Google Search Console (same Google account as AdSense)
- Add a **Domain** property (DNS TXT verification at Namecheap).
- Submit `https://<domain>/sitemap.xml`.
- Request indexing (≤10/day): home, calculators hub, then concrete, gravel, mulch, paver, deck,
  paint, square footage, fence, roofing, BTU, … then guides.
- Optional: Bing Webmaster Tools → import from Search Console.

## 6. Later
- Analytics: if added, it needs a consent banner for EU/UK visitors and a privacy policy update
  (the policy currently says the site sets no cookies).
- **AdSense only after TubeTools is approved** and this site has been indexed for a while:
  add the site in AdSense, add `ads.txt`, enable Google's CMP (Privacy & messaging),
  set `ADSENSE_CLIENT` in `build.py`, update the privacy policy (advertising + cookies section).
- Keep publishing: 1–2 guides or calculators per week (ideas in `WIP.md`).
