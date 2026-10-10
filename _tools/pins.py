#!/usr/bin/env python3
"""
Pinterest pins for SizeMyProject.

    python _tools/pins.py          # writes _tools/pins.json and _tools/pinterest-pins.csv
    python _tools/pins.py --only deck-mud-calculator --start 2026-10-22
                                   # also writes _tools/pinterest-pins-new.csv with just those pins
    node _tools/pins.mjs           # renders the missing pin images into assets/img/pins/

One vertical pin (1000x1500) per calculator and guide. pins.json drives the
renderer; the CSV follows Pinterest's "Bulk upload Pins" help article (Title, Media URL,
Pinterest board, Thumbnail — empty for images —, Description, Link, Publish date, Keywords).
Upload it in Pinterest: Settings > Import content > Upload .csv or .txt file.
"""
import csv
import datetime
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build as B  # noqa: E402

# One board per site category.
BOARDS = {
    'concrete': 'Concrete Projects: DIY Calculators & Tips',
    'hardscape': 'Patios, Pavers & Retaining Walls',
    'landscaping': 'Landscaping & Garden DIY',
    'structures': 'Decks, Fences, Stairs & Roofing',
    'interior': 'Painting, Flooring & Interior DIY',
    'energy': 'Home Heating, Cooling & Insulation',
    'measure': 'DIY Measuring & Material Estimates',
}
# Guides without a related calculator borrow an icon from their category.
CAT_ICON = {'concrete': 'slab', 'hardscape': 'paver', 'landscaping': 'leaf', 'structures': 'deck',
            'interior': 'roller', 'energy': 'snow', 'measure': 'ruler'}
# The question people type into Pinterest search, used as the headline of calculator pins.
HOOKS = {
    'concrete-calculator': 'How many bags of concrete do I need?',
    'block-calculator': 'How many concrete blocks for my wall?',
    'rebar-calculator': 'How much rebar for a concrete slab?',
    'paver-calculator': 'How many pavers do I need?',
    'retaining-wall-calculator': 'How many retaining wall blocks?',
    'asphalt-calculator': 'How many tons of asphalt for my driveway?',
    'gravel-calculator': 'How much gravel do I need?',
    'mulch-calculator': 'How much mulch do I need?',
    'topsoil-calculator': 'How much topsoil do I need?',
    'sand-calculator': 'How much sand do I need?',
    'sod-calculator': 'How much sod do I need?',
    'raised-bed-soil-calculator': 'How much soil to fill a raised bed?',
    'deck-calculator': 'How many deck boards do I need?',
    'fence-calculator': 'How much fencing do I need?',
    'stair-calculator': 'How many stairs, and how long a stringer?',
    'roofing-calculator': 'How many bundles of shingles?',
    'paint-calculator': 'How much paint do I need?',
    'drywall-calculator': 'How many sheets of drywall?',
    'flooring-calculator': 'How much flooring do I need?',
    'tile-calculator': 'How many tiles do I need?',
    'wallpaper-calculator': 'How many rolls of wallpaper?',
    'btu-calculator': 'What size air conditioner do I need?',
    'insulation-calculator': 'How much attic insulation do I need?',
    'square-footage-calculator': 'How do I calculate square footage?',
    'board-foot-calculator': 'How many board feet of lumber?',
    'deck-mud-calculator': 'How much deck mud for a shower pan?',
}
# Strongest topics first when interleaving the schedule.
PRIORITY = ['concrete', 'landscaping', 'hardscape', 'structures', 'interior', 'measure', 'energy']
PINS_PER_DAY = 4
FIRST_DAY = datetime.date(2026, 10, 10)
# Account time (Spain): 15:00–23:00 is morning to evening across US time zones.
TIMES = ['15:00', '18:00', '21:00', '23:00']


def clip(text, n):
    text = ' '.join(text.split())
    return text if len(text) <= n else text[:n - 1].rsplit(' ', 1)[0] + '…'


def keywords(m, label):
    words = [m['card_title'].lower()] if m.get('card_title') else []
    words += [w.strip().lower() for w in label.replace('&', ',').split(',') if w.strip()]
    words += ['diy', 'home improvement']
    return ', '.join(dict.fromkeys(words))


def main():
    pages = B.load_pages()
    calcs, guides = [], []
    for key, p in pages.items():
        m = p['meta']
        if m.get('type') not in ('calculator', 'guide'):
            continue
        cat = m['category']
        name = key.replace('/', '-')
        if m['type'] == 'calculator':
            head = HOOKS.get(p['slug'], B.strip_tags(m['h1']))
            title = f"{head} Free {m['card_title']}"
            cta, ic = 'Free calculator', m['icon']
        else:
            head = B.strip_tags(m['h1']).strip()
            head = head[0].upper() + head[1:]
            title = head
            # Use the icon of the first related calculator; fall back to the category's.
            rel = [k.strip() for k in m.get('related', '').split(',') if k.strip() in pages]
            calc = next((pages[k] for k in rel if pages[k]['meta'].get('type') == 'calculator'), None)
            cta, ic = 'Read the guide', calc['meta']['icon'] if calc else CAT_ICON[cat]
        job = {
            'name': name,
            'out': f'assets/img/pins/{name}.jpg',
            'headline': head,
            'sub': m['card_desc'],
            'label': B.CATEGORIES[cat][0],
            'cta': cta,
            'icon': B.ICONS[ic],
            'link': B.SITE_URL + p['url'],
            'board': BOARDS[cat],
            'title': clip(title, 100),
            'description': clip(m['description'] + ' Free and no sign-up — SizeMyProject.', 500),
            'order': int(m.get('order', 99)),
            'keywords': keywords(m, B.CATEGORIES[cat][0]),
        }
        (calcs if m['type'] == 'calculator' else guides).append(job)

    # Publish calculators first, alternating categories so a board never gets a burst.
    def interleave(items):
        by_cat = {BOARDS[c]: [] for c in PRIORITY}
        for j in sorted(items, key=lambda j: j['order']):
            by_cat.setdefault(j['board'], []).append(j)
        out = []
        while any(by_cat.values()):
            for board in list(by_cat):
                if by_cat[board]:
                    out.append(by_cat[board].pop(0))
        return out
    jobs = interleave(calcs) + interleave(guides)
    for i, j in enumerate(jobs):
        day = FIRST_DAY + datetime.timedelta(days=i // PINS_PER_DAY)
        j['publish'] = f'{day.isoformat()}T{TIMES[i % PINS_PER_DAY]}:00'

    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, 'pins.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(jobs, f, ensure_ascii=False, indent=1)
    with open(os.path.join(here, 'pinterest-pins.csv'), 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow(['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords'])
        for j in jobs:
            w.writerow([j['title'], B.SITE_URL + '/' + j['out'], j['board'], '', j['description'], j['link'], j['publish'], j['keywords']])
    # Pins added after the first upload: a separate CSV with only them, scheduled from --start.
    if '--only' in sys.argv:
        names = sys.argv[sys.argv.index('--only') + 1].split(',')
        start = datetime.date.fromisoformat(sys.argv[sys.argv.index('--start') + 1])
        new = [j for j in jobs if j['name'] in names]
        with open(os.path.join(here, 'pinterest-pins-new.csv'), 'w', encoding='utf-8', newline='') as f:
            w = csv.writer(f)
            w.writerow(['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords'])
            for i, j in enumerate(new):
                day = start + datetime.timedelta(days=i // PINS_PER_DAY)
                w.writerow([j['title'], B.SITE_URL + '/' + j['out'], j['board'], '', j['description'], j['link'],
                            f'{day.isoformat()}T{TIMES[i % PINS_PER_DAY]}:00', j['keywords']])
        print(f'pinterest-pins-new.csv: {len(new)} pin(s) from {start}')
    print(f'{len(jobs)} pins ({len(calcs)} calculators, {len(guides)} guides); '
          f'publishing {jobs[0]["publish"][:10]} to {jobs[-1]["publish"][:10]}')


if __name__ == '__main__':
    main()
