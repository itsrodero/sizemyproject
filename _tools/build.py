#!/usr/bin/env python3
"""
SizeMyProject static site builder.

Usage (from the repository root):
    python _tools/build.py

Reads every page in _src/ (and _src/guides/), wraps it in the shared layout
(header, footer, SEO tags, structured data) and writes plain HTML files:
    _src/<slug>.html         ->  /<slug>.html
    _src/guides/<slug>.html  ->  /guides/<slug>.html
It also writes sitemap.xml and robots.txt.

No third-party packages are needed (Python 3.8+).
"""
import datetime
import hashlib
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, '_src')

# The domain isn't registered yet. Change these two lines once it is.
SITE_URL = 'https://sizemyproject.com'
SITE_NAME = 'SizeMyProject'
CONTACT_EMAIL = 'hello@sizemyproject.com'
AUTHOR_NAME = 'Daniel'
# Ads and analytics stay off until the site is live and approved.
ADSENSE_CLIENT = None
GA_ID = None

CATEGORIES = {
    'concrete': ('Concrete & masonry', 'Slabs, footings, posts and steps: volume, bags and ready-mix.'),
    'hardscape': ('Patios, walls & paving', 'Pavers, retaining walls and asphalt for patios, paths and driveways.'),
    'landscaping': ('Landscaping & yard', 'Gravel, mulch, topsoil, sand and sod for beds, lawns and paths.'),
    'structures': ('Decks & fences', 'Deck boards, joists, posts, rails, pickets and fasteners.'),
    'measure': ('Measuring', 'Square footage and area for rooms, lots and any project.'),
}

ICONS = {
    'slab': '<path d="M3 15l9-5 9 5-9 5z"/><path d="M3 15v2l9 5 9-5v-2"/>',
    'gravel': '<circle cx="7" cy="16" r="2.5"/><circle cx="13" cy="17" r="2"/><circle cx="18" cy="15.5" r="2.5"/><circle cx="10" cy="11.5" r="2"/><circle cx="15.5" cy="11" r="1.8"/>',
    'leaf': '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19 13 11"/>',
    'shovel': '<path d="M14 10 21 3"/><path d="M19 1l4 4"/><path d="M12 8l4 4-5 5a3 3 0 0 1-4 0l-2-2a3 3 0 0 1 0-4z"/><path d="M3 21l3-3"/>',
    'sand': '<path d="M3 18c3-6 6-9 9-9s6 3 9 9z"/><path d="M8 18h.01M12 15h.01M15 18h.01M11 18h.01"/>',
    'calc': '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8"/><path d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
    'book': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    'arrow': '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    'chevron': '<path d="m6 9 6 6 6-6"/>',
    'menu': '<path d="M4 6h16M4 12h16M4 18h16"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'paver': '<rect x="3" y="4" width="8" height="7" rx="1"/><rect x="13" y="4" width="8" height="7" rx="1"/><rect x="3" y="13" width="18" height="7" rx="1"/>',
    'wall': '<path d="M3 20h18M3 15h18M3 10h18"/><path d="M8 20v-5M16 20v-5M12 15v-5M6 10V6h12v4"/>',
    'road': '<path d="M8 3 4 21M16 3l4 18"/><path d="M12 5v2M12 11v2M12 17v2"/>',
    'grass': '<path d="M3 20h18"/><path d="M6 20c0-4 1-7 3-9M11 20c0-5 0-9 1-12M16 20c0-4-1-7-3-9M19 20c0-3 0-5-1-7"/>',
    'fence': '<path d="M5 21V6l2-3 2 3v15M15 21V6l2-3 2 3v15"/><path d="M3 10h18M3 16h18"/>',
    'deck': '<path d="M3 8h18M3 12h18M3 16h18"/><path d="M5 16v5M19 16v5"/>',
    'ruler': '<path d="M3 17 17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
}


def icon(name, cls='icon'):
    return (f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>')


LOGO = ('<svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="#c2410c"/>'
        '<path d="M7 23h18v-4h-3v2h-2v-3h-2v3h-2v-2h-2v2h-2v-3h-2v3H9v-2H7z" fill="#fff"/>'
        '<path d="M9 13l7-5 7 5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>')


# ---------------------------------------------------------------- helpers

def esc(s):
    return html.escape(str(s), quote=True)


def parse_page(path):
    raw = open(path, encoding='utf-8').read()
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n', raw, re.S)
    if not m:
        sys.exit(f'Missing front matter in {path}')
    meta = {}
    for line in m.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        k, _, v = line.partition(':')
        meta[k.strip()] = v.strip()
    return meta, raw[m.end():]


def fmt_date(d):
    dt = datetime.date.fromisoformat(d)
    return dt.strftime('%B %-d, %Y') if os.name != 'nt' else dt.strftime('%B %#d, %Y')


def strip_tags(s):
    return re.sub(r'<[^>]+>', ' ', s)


def reading_time(body):
    words = len(re.findall(r'\w+', strip_tags(re.sub(r'<(script|style)[\s\S]*?</\1>', '', body))))
    return max(1, round(words / 220)), words


def slugify(text):
    text = re.sub(r'[^a-z0-9]+', '-', strip_tags(text).lower()).strip('-')
    return text[:60] or 'section'


def inline_css():
    css = open(os.path.join(ROOT, 'assets', 'css', 'site.css'), encoding='utf-8').read()
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = re.sub(r'\s*\n\s*', '', css)
    return re.sub(r'\s{2,}', ' ', css)


def asset_version():
    h = hashlib.md5()
    for dp, _, fn in os.walk(os.path.join(ROOT, 'assets')):
        for f in sorted(fn):
            if f.endswith(('.css', '.js')):
                h.update(open(os.path.join(dp, f), 'rb').read())
    return h.hexdigest()[:8]


# ---------------------------------------------------------------- load

def load_pages():
    pages = {}
    for sub in ('', 'guides'):
        d = os.path.join(SRC, sub)
        for f in sorted(os.listdir(d)):
            if not f.endswith('.html'):
                continue
            slug = f[:-5]
            meta, body = parse_page(os.path.join(d, f))
            meta.setdefault('type', 'guide' if sub else 'page')
            key = f'{sub}/{slug}' if sub else slug
            url = '/' if slug == 'index' else f'/{key}.html'
            out = os.path.join(ROOT, *( [sub] if sub else []), f'{slug}.html')
            pages[key] = {'key': key, 'slug': slug, 'meta': meta, 'body': body, 'url': url, 'out': out}
    return pages


def resolve_links(body, pages, where):
    """Turn href="@slug" / href="@guides/slug#frag" into real URLs and check they exist."""
    def repl(m):
        target, frag = m.group(1), ''
        if '#' in target:
            target, frag = target.split('#', 1)
            frag = '#' + frag
        if target not in pages:
            sys.exit(f'Broken internal link @{m.group(1)} in {where}')
        return f'href="{pages[target]["url"]}{frag}"'
    return re.sub(r'href="@([^"]+)"', repl, body)


def add_heading_ids(body):
    toc, used = [], set()

    def repl(m):
        level, attrs, inner = m.group(1), m.group(2) or '', m.group(3)
        idm = re.search(r'id="([^"]+)"', attrs)
        if idm:
            hid = idm.group(1)
        else:
            hid = base = slugify(inner)
            n = 2
            while hid in used:
                hid, n = f'{base}-{n}', n + 1
            attrs = f'{attrs} id="{hid}"'
        used.add(hid)
        if level == '2' and 'data-notoc' not in attrs:
            toc.append((hid, strip_tags(inner).strip()))
        return f'<h{level}{attrs}>{inner}</h{level}>'
    body = re.sub(r'<h([23])((?:\s[^>]*)?)>(.*?)</h\1>', repl, body, flags=re.S)
    return body, toc


# ---------------------------------------------------------------- blocks

def calc_pages(pages, category=None):
    calcs = [p for p in pages.values() if p['meta']['type'] == 'calculator'
             and (category is None or p['meta']['category'] == category)]
    return sorted(calcs, key=lambda p: (list(CATEGORIES).index(p['meta']['category']), int(p['meta'].get('order', 50))))


def guide_pages(pages):
    return sorted([p for p in pages.values() if p['meta']['type'] == 'guide'],
                  key=lambda p: (int(p['meta'].get('order', 50)), p['slug']))


def calc_card(p):
    m = p['meta']
    return (f'<a class="calc-card" href="{p["url"]}"><span class="calc-card-icon">{icon(m.get("icon", "calc"))}</span>'
            f'<span class="calc-card-title">{esc(m["card_title"])}</span>'
            f'<span class="calc-card-desc">{esc(m["card_desc"])}</span>'
            f'<span class="calc-card-cta">Open calculator {icon("arrow", "icon icon-sm")}</span></a>')


def calc_grid(pages, category=None, exclude=None):
    cards = [calc_card(p) for p in calc_pages(pages, category) if p['key'] != exclude]
    return '<div class="calc-grid">' + ''.join(cards) + '</div>'


def calcs_by_category(pages):
    out = []
    for cat, (name, intro) in CATEGORIES.items():
        if calc_pages(pages, cat):
            out.append(f'<section class="cat-group" id="cat-{cat}"><h2>{esc(name)}</h2>'
                       f'<p class="section-lead">{esc(intro)}</p>{calc_grid(pages, cat)}</section>')
    return ''.join(out)


def guide_card(p):
    m = p['meta']
    return (f'<a class="guide-card" href="{p["url"]}"><span class="guide-card-cat">Guide</span>'
            f'<span class="guide-card-title">{esc(m.get("card_title", m["h1"]))}</span>'
            f'<span class="guide-card-desc">{esc(m.get("card_desc", m["description"]))}</span>'
            f'<span class="calc-card-cta">Read guide {icon("arrow", "icon icon-sm")}</span></a>')


def guides_grid(pages):
    gs = guide_pages(pages)
    return '<div class="guide-grid">' + ''.join(guide_card(p) for p in gs) + '</div>' if gs else ''


def sitemap_block(pages):
    cols = []
    for cat, (name, _) in CATEGORIES.items():
        items = calc_pages(pages, cat)
        if items:
            cols.append(f'<h2>{esc(name)}</h2><ul>' + ''.join(
                f'<li><a href="{p["url"]}">{esc(p["meta"]["card_title"])}</a></li>' for p in items) + '</ul>')
    gs = guide_pages(pages)
    if gs:
        cols.append('<h2>Guides</h2><ul>' + ''.join(f'<li><a href="{p["url"]}">{esc(p["meta"]["h1"])}</a></li>' for p in gs) + '</ul>')
    others = sorted([p for p in pages.values() if p['meta']['type'] in ('page', 'hub') and p['meta'].get('noindex') != 'true'],
                    key=lambda p: p['meta']['h1'])
    cols.append('<h2>About this site</h2><ul>' + ''.join(f'<li><a href="{p["url"]}">{esc(p["meta"]["h1"])}</a></li>' for p in others) + '</ul>')
    return '<div class="sitemap-cols">' + ''.join(f'<div>{c}</div>' for c in cols) + '</div>'


LEN_UNITS = ['ft', 'in', 'yd', 'm', 'cm']
DEPTH_UNITS = ['in', 'ft', 'cm', 'm']


def unit_select(key, units, default, label):
    opts = ''.join(f'<option{" selected" if u == default else ""}>{u}</option>' for u in units)
    return f'<select data-u="{key}" aria-label="{esc(label)} unit">{opts}</select>'


def len_field(key, label, value, units=LEN_UNITS, default='ft', hint=''):
    small = f'<small>{hint}</small>' if hint else ''
    return (f'<div class="field"><label for="b-{key}">{esc(label)}</label><div class="inp">'
            f'<input id="b-{key}" data-k="{key}" type="text" inputmode="decimal" value="{value}">'
            f'{unit_select(key, units, default, label)}</div>{small}</div>')


BULK_DIAGRAMS = {
    'rect': '<rect x="70" y="22" width="180" height="96" rx="4" fill="#e7e5e4" stroke="#57534e" stroke-width="2"/>'
            '<text x="138" y="140">Length</text><text x="258" y="74">Width</text>',
    'circle': '<circle cx="160" cy="70" r="52" fill="#e7e5e4" stroke="#57534e" stroke-width="2"/>'
              '<path d="M108 70 H212" stroke="#57534e" stroke-dasharray="4 4"/><text x="130" y="64">Diameter</text>',
    'tri': '<path d="M70 118 H250 L150 22 Z" fill="#e7e5e4" stroke="#57534e" stroke-width="2"/>'
           '<path d="M150 22 V118" stroke="#57534e" stroke-dasharray="4 4"/><text x="140" y="140">Base</text><text x="156" y="80">Height</text>',
}


def area_block(d, heading='Size of the area'):
    """Shape switcher + fields that SMP.area() reads (rectangle, circle, triangle or a known area)."""
    seg = ''.join(f'<button type="button" data-shape="{s}" aria-pressed="{"true" if i == 0 else "false"}">{n}</button>'
                  for i, (s, n) in enumerate([('rect', 'Rectangle'), ('circle', 'Circle'), ('tri', 'Triangle'), ('area', 'I know the area')]))
    diagrams = ''.join(f'<div class="diagram" data-diagram="{s}"{" hidden" if s != "rect" else ""}><svg viewBox="0 0 320 150" role="img" '
                       f'aria-label="{s} area seen from above">{svg}</svg></div>' for s, svg in BULK_DIAGRAMS.items())
    return f'''<h2>{heading}</h2>
    <div class="seg" role="group" aria-label="Shape of the area">{seg}</div>
    {diagrams}
    <div class="fields" data-for="rect">{len_field('L', 'Length', d['L'])}{len_field('W', 'Width', d['W'])}</div>
    <div class="fields" data-for="circle" hidden>{len_field('D', 'Diameter', d.get('D', 10))}</div>
    <div class="fields" data-for="tri" hidden>{len_field('B', 'Base', d.get('B', 10))}{len_field('H', 'Height', d.get('H', 10))}</div>
    <div class="fields" data-for="area" hidden><div class="field"><label for="b-A">Area</label><div class="inp">
      <input id="b-A" data-k="A" type="text" inputmode="decimal" value="{d.get('A', 100)}">
      <select data-u="A" aria-label="Area unit"><option value="ft2">sq ft</option><option value="m2">m²</option></select></div></div></div>'''


def bulk_form(cfg):
    d = cfg['defaults']
    material = ''
    if cfg.get('materials'):
        material = ('<div class="field"><label for="b-mat">Material</label><select id="b-mat" class="select" data-k="mat"></select></div>'
                    '<div class="field"><label for="b-dens">Density</label><div class="inp"><input id="b-dens" data-k="dens" type="text" inputmode="decimal">'
                    '<span class="affix">tons/yd³</span></div><small>Ask your supplier for their figure</small></div>')
    # Price units in the order the page lists them; the first one is the default.
    names = {'yd': 'per cubic yard', 'ton': 'per ton'}
    price_opts = [f'<option value="{p}">{names[p]}</option>' for p in cfg.get('price', []) if p in names]
    for i, b in enumerate(cfg.get('bags', [])):
        price_opts.append(f'<option value="bag{i}">per {esc(b["label"])} bag</option>')
    return f'''<div class="calc">
  <form class="panel" id="bulk-form" novalidate>
    {area_block(d)}
    <div class="fields" style="margin-top:14px">
      {len_field('depth', 'Depth', d['depth'], DEPTH_UNITS, 'in', esc(cfg.get('depthHint', '')))}
      <div class="field"><label for="b-extra">Extra</label><div class="inp"><input id="b-extra" data-k="extra" type="text" inputmode="decimal" value="{d['extra']}"><span class="affix">%</span></div><small>{esc(cfg.get('extraHint', 'For settling and waste'))}</small></div>
      {material}
    </div>
    <details class="cost-box">
      <summary>Add a price (optional)</summary>
      <div class="fields"><div class="field full"><label for="b-price">Price</label><div class="inp"><span class="affix pre">$</span>
        <input id="b-price" data-k="price" type="text" inputmode="decimal" placeholder="0.00">
        <select data-u="price" aria-label="Price unit">{''.join(price_opts)}</select></div></div></div>
    </details>
    <div class="calc-actions">
      <button type="button" class="btn btn-ghost btn-sm js-reset">Reset</button>
      <button type="button" class="btn btn-ghost btn-sm js-share">Copy link</button>
      <button type="button" class="btn btn-ghost btn-sm js-list">Copy shopping list</button>
      <button type="button" class="btn btn-ghost btn-sm js-print">Print</button>
    </div>
  </form>
  <section class="panel results" aria-live="polite" aria-label="Results">
    <div id="bulk-results"><p class="results-empty">Enter the size of the area and the depth.</p></div>
  </section>
</div>'''


def expand_placeholders(body, page, pages):
    if '[[bulk_form]]' in body:
        m = re.search(r'<script type="application/json" id="bulk-config">(.*?)</script>', body, re.S)
        if not m:
            sys.exit(f'{page["key"]}: [[bulk_form]] needs a bulk-config script')
        body = body.replace('[[bulk_form]]', bulk_form(json.loads(m.group(1))))
    m = re.search(r'\[\[area_block (\{.*?\})\]\]', body)
    if m:
        body = body.replace(m.group(0), area_block(json.loads(m.group(1))))
    body = body.replace('[[calcs_by_category]]', calcs_by_category(pages))
    body = body.replace('[[calc_grid]]', calc_grid(pages))
    body = re.sub(r'\[\[calc_grid:(\w+)\]\]', lambda m: calc_grid(pages, m.group(1), exclude=page['key']), body)
    body = body.replace('[[guides]]', guides_grid(pages))
    body = body.replace('[[sitemap]]', sitemap_block(pages))
    body = body.replace('[[email]]', f'<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>')
    return body


# ---------------------------------------------------------------- layout

def head_html(page, title_full, canonical):
    m = page['meta']
    noindex = m.get('noindex') == 'true'
    lines = [
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        f'<title>{esc(title_full)}</title>',
        f'<meta name="description" content="{esc(m["description"])}">',
        '<meta name="robots" content="noindex, follow">' if noindex else f'<link rel="canonical" href="{canonical}">',
        '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
        '<meta name="theme-color" content="#ffffff">',
        f'<meta property="og:site_name" content="{SITE_NAME}">',
        '<meta property="og:locale" content="en_US">',
        f'<meta property="og:type" content="{"article" if m["type"] == "guide" else "website"}">',
        f'<meta property="og:title" content="{esc(m.get("og_title", m["h1"]))}">',
        f'<meta property="og:description" content="{esc(m["description"])}">',
        f'<meta property="og:url" content="{canonical}">',
        f'<meta property="og:image" content="{SITE_URL}/assets/img/og.png">',
        '<meta name="twitter:card" content="summary_large_image">',
    ]
    if GA_ID:
        lines.append('<script async src="https://www.googletagmanager.com/gtag/js?id=' + GA_ID + '"></script>'
                     "<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}"
                     "gtag('js',new Date());gtag('config','" + GA_ID + "');</script>")
    if ADSENSE_CLIENT and m.get('ads', 'true') != 'false':
        lines.append(f'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={ADSENSE_CLIENT}" crossorigin="anonymous"></script>')
    lines.append(f'<style>{CSS}</style>')
    return '\n'.join(lines)


def breadcrumb_items(page, pages):
    m = page['meta']
    items = [('Home', '/')]
    if m['type'] == 'calculator':
        items.append((CATEGORIES[m['category']][0], f'{pages["calculators"]["url"]}#cat-{m["category"]}'))
    elif m['type'] == 'guide':
        items.append(('Guides', pages['guides']['url']))
    items.append((m.get('crumb', m['h1']), page['url']))
    return items


def breadcrumbs_html(page, pages):
    items = breadcrumb_items(page, pages)
    parts = [f'<li aria-current="page">{esc(n)}</li>' if i == len(items) - 1 else f'<li><a href="{u}">{esc(n)}</a></li>'
             for i, (n, u) in enumerate(items)]
    return f'<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>{"".join(parts)}</ol></nav>'


def structured_data(page, pages, canonical, words):
    m = page['meta']
    blocks = []
    publisher = {'@type': 'Organization', 'name': SITE_NAME, 'url': SITE_URL + '/'}
    if m['type'] == 'home':
        blocks.append({'@context': 'https://schema.org', '@type': 'WebSite', 'name': SITE_NAME, 'url': SITE_URL + '/',
                       'inLanguage': 'en-US', 'publisher': publisher})
    if m['type'] == 'calculator':
        blocks.append({'@context': 'https://schema.org', '@type': 'WebApplication', 'name': m['card_title'],
                       'url': canonical, 'description': m['description'], 'applicationCategory': 'UtilitiesApplication',
                       'operatingSystem': 'Any', 'browserRequirements': 'Requires JavaScript',
                       'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'}, 'inLanguage': 'en-US'})
    if m['type'] == 'guide':
        blocks.append({'@context': 'https://schema.org', '@type': 'Article', 'headline': m['h1'],
                       'description': m['description'], 'inLanguage': 'en-US',
                       'datePublished': m['published'], 'dateModified': m.get('updated', m['published']),
                       'author': {'@type': 'Person', 'name': AUTHOR_NAME, 'url': SITE_URL + pages['about']['url']},
                       'publisher': publisher, 'mainEntityOfPage': canonical, 'wordCount': words})
    if m['type'] != 'home':
        blocks.append({'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': SITE_URL + u}
            for i, (n, u) in enumerate(breadcrumb_items(page, pages))]})
    return '\n'.join(f'<script type="application/ld+json">{json.dumps(b, ensure_ascii=False)}</script>' for b in blocks)


def header_html(page, pages):
    active = page['meta'].get('nav', '')
    groups = []
    for cat, (name, _) in CATEGORIES.items():
        items = calc_pages(pages, cat)
        if items:
            groups.append(f'<div class="dd-group"><p class="dd-h">{esc(name)}</p>' + ''.join(
                f'<a href="{p["url"]}" class="dd-item">{icon(p["meta"].get("icon", "calc"))}<span>{esc(p["meta"]["card_title"])}</span></a>'
                for p in items) + '</div>')

    def cls(key):
        return ' class="is-active"' if key == active else ''
    return f'''<header class="site-header">
  <div class="container header-inner">
    <a class="logo" href="/">{LOGO}<span>SizeMy<b>Project</b></span></a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">{icon('menu')}<span class="sr-only">Menu</span></button>
    <nav class="site-nav" id="site-nav" aria-label="Main">
      <div class="nav-dd">
        <button class="nav-dd-btn{' is-active' if active == 'calculators' else ''}" aria-expanded="false">Calculators {icon('chevron', 'icon icon-sm')}</button>
        <div class="nav-dd-panel">{''.join(groups)}<a class="dd-all" href="{pages['calculators']['url']}">All calculators {icon('arrow', 'icon icon-sm')}</a></div>
      </div>
      <a href="{pages['guides']['url']}"{cls('guides')}>Guides</a>
      <a href="{pages['about']['url']}"{cls('about')}>About</a>
    </nav>
  </div>
</header>'''


def footer_html(pages):
    year = datetime.date.today().year
    cols = []
    for cat, (name, _) in CATEGORIES.items():
        items = calc_pages(pages, cat)
        if items:
            cols.append(f'<div><h2 class="footer-h">{esc(name)}</h2><ul>' + ''.join(
                f'<li><a href="{p["url"]}">{esc(p["meta"]["card_title"])}</a></li>' for p in items) + '</ul></div>')
    site_links = [('about', 'About'), ('methodology', 'How we calculate'), ('contact', 'Contact'),
                  ('privacy', 'Privacy Policy'), ('terms', 'Terms of Use'), ('sitemap-page', 'Sitemap')]
    site = ''.join(f'<li><a href="{pages[k]["url"]}">{n}</a></li>' for k, n in site_links if k in pages)
    return f'''<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a class="logo logo-invert" href="/">{LOGO}<span>SizeMy<b>Project</b></span></a>
      <p>Free calculators that tell you how much material to buy for home and yard projects &mdash; with the math shown.</p>
    </div>
    {''.join(cols)}
    <div><h2 class="footer-h">{SITE_NAME}</h2><ul>{site}</ul></div>
  </div>
  <div class="container footer-bottom">
    <p>&copy; {year} {SITE_NAME}. Estimates only &mdash; always confirm quantities with your supplier and local building codes.</p>
  </div>
</footer>'''


def related_html(page, pages):
    keys = [s.strip() for s in page['meta'].get('related', '').split(',') if s.strip()]
    cards = []
    for k in keys:
        if k not in pages:
            sys.exit(f'Unknown related page {k} in {page["key"]}')
        p = pages[k]
        cards.append(calc_card(p) if p['meta']['type'] == 'calculator' else guide_card(p))
    if not cards:
        return ''
    return f'<section class="related"><div class="container"><h2 data-notoc>Related</h2><div class="calc-grid">{"".join(cards)}</div></div></section>'


def author_line(page, pages, minutes=None):
    m = page['meta']
    upd = m.get('updated') or m.get('published')
    bits = [f'By <a href="{pages["about"]["url"]}">{AUTHOR_NAME}</a>']
    if upd:
        bits.append(f'Updated <time datetime="{upd}">{fmt_date(upd)}</time>')
    if minutes:
        bits.append(f'{minutes} min read')
    bits.append(f'<a href="{pages["methodology"]["url"]}">How we calculate</a>')
    return '<p class="byline">' + ' &middot; '.join(bits) + '</p>'


def render(page, pages, ver):
    m = page['meta']
    kind = m['type']
    body = resolve_links(page['body'], pages, page['key'])
    body = expand_placeholders(body, page, pages)
    body, toc = add_heading_ids(body)
    minutes, words = reading_time(body)
    canonical = SITE_URL + page['url']
    title_full = m['title'] if m.get('title_exact') == 'true' or len(m['title']) + len(SITE_NAME) + 3 > 65 \
        else f'{m["title"]} | {SITE_NAME}'
    toc_html = ''
    if toc and kind in ('calculator', 'guide') and m.get('toc', 'true') != 'false':
        toc_html = ('<details class="toc"><summary>On this page</summary><ol>'
                    + ''.join(f'<li><a href="#{hid}">{esc(txt)}</a></li>' for hid, txt in toc) + '</ol></details>')

    if kind == 'calculator':
        # The page body holds two parts separated by <!-- content -->: the tool, then the article.
        tool, _, article = body.partition('<!-- content -->')
        main = f'''<main id="main" class="calc-main">
  <section class="calc-hero">
    <div class="container">
      {breadcrumbs_html(page, pages)}
      <h1>{m['h1']}</h1>
      <p class="lead">{m['lead']}</p>
    </div>
  </section>
  <div class="container">
{tool}
  </div>
  <div class="container narrow content-wrap">
    {author_line(page, pages)}
    {toc_html}
    <div class="prose">
{article}
    </div>
  </div>
  {related_html(page, pages)}
</main>'''
    elif kind == 'guide':
        main = f'''<main id="main" class="guide-main">
  <div class="container narrow">
    {breadcrumbs_html(page, pages)}
    <header class="page-header">
      <h1>{m['h1']}</h1>
      <p class="lead">{m['lead']}</p>
      {author_line(page, pages, minutes)}
    </header>
    {toc_html}
    <div class="prose">
{body}
    </div>
  </div>
  {related_html(page, pages)}
</main>'''
    elif kind == 'home':
        main = f'<main id="main" class="home-main">\n{body}\n</main>'
    else:
        crumbs = '' if kind == '404' else breadcrumbs_html(page, pages)
        width = '' if m.get('width') == 'wide' else 'narrow'
        main = f'''<main id="main" class="page-main">
  <div class="container {width}">
    {crumbs}
    <header class="page-header">
      <h1>{m['h1']}</h1>
      {f'<p class="lead">{m["lead"]}</p>' if m.get('lead') else ''}
    </header>
    <div class="{'prose' if m.get('prose', 'true') == 'true' else ''}">
{body}
    </div>
  </div>
</main>'''

    scripts = [f'<script src="/assets/js/site.js?v={ver}" defer></script>']
    for s in [x.strip() for x in m.get('script', '').split(',') if x.strip()]:
        scripts.append(f'<script src="/assets/js/calc/{s}.js?v={ver}" defer></script>')
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
{head_html(page, title_full, canonical)}
{structured_data(page, pages, canonical, words)}
</head>
<body class="page-{kind}">
<a class="skip-link" href="#main">Skip to content</a>
{header_html(page, pages)}
{main}
{footer_html(pages)}
{chr(10).join(scripts)}
</body>
</html>
'''


def sitemap_xml(pages):
    urls = []
    for p in sorted(pages.values(), key=lambda p: p['url']):
        m = p['meta']
        if m.get('noindex') == 'true':
            continue
        lastmod = m.get('updated') or m.get('published') or datetime.date.today().isoformat()
        urls.append(f'  <url>\n    <loc>{SITE_URL}{p["url"]}</loc>\n    <lastmod>{lastmod}</lastmod>\n  </url>')
    return ('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            + '\n'.join(urls) + '\n</urlset>\n')


def check_required(pages):
    for key, p in pages.items():
        m = p['meta']
        missing = {'h1', 'title', 'description'} - set(m)
        if m['type'] == 'calculator':
            missing |= {'category', 'card_title', 'card_desc', 'lead', 'updated'} - set(m)
            if m.get('category') not in CATEGORIES:
                sys.exit(f'{key}: unknown category {m.get("category")}')
            if '<!-- content -->' not in p['body']:
                sys.exit(f'{key}: calculator page needs a <!-- content --> separator')
        if m['type'] == 'guide':
            missing |= {'published', 'updated', 'lead'} - set(m)
        if missing:
            sys.exit(f'{key} is missing: {", ".join(sorted(missing))}')
        if len(m['title']) > 65:
            print(f'  note: long <title> ({len(m["title"])} chars) on {key}')
        if not 70 <= len(m['description']) <= 160:
            print(f'  note: description length {len(m["description"])} on {key}')


CSS = ''


def main():
    global CSS
    pages = load_pages()
    for k in ('index', 'calculators', 'guides', 'about', 'methodology'):
        if k not in pages:
            sys.exit(f'Required page _src/{k}.html is missing')
    check_required(pages)
    CSS = inline_css()
    ver = asset_version()
    written = set()
    for page in pages.values():
        os.makedirs(os.path.dirname(page['out']), exist_ok=True)
        with open(page['out'], 'w', encoding='utf-8', newline='\n') as f:
            f.write(render(page, pages, ver))
        written.add(os.path.relpath(page['out'], ROOT).replace(os.sep, '/'))
    with open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(sitemap_xml(pages))
    with open(os.path.join(ROOT, 'robots.txt'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(f'User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n')
    stale = []
    for dp, dn, fn in os.walk(ROOT):
        dn[:] = [d for d in dn if not d.startswith(('.', '_')) and d != 'assets']
        for f in fn:
            if f.endswith('.html'):
                rel = os.path.relpath(os.path.join(dp, f), ROOT).replace(os.sep, '/')
                if rel not in written:
                    stale.append(rel)
    print(f'Built {len(pages)} pages (assets v={ver}).')
    for s in sorted(stale):
        print('  not produced by the build:', s)


if __name__ == '__main__':
    main()
