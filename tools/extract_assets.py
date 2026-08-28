"""Skjer dei fem ressurs-arka opp i namngjevne sprites med gjennomsiktig papir.

Bilettekstane under kvar teikning blir kutta vekk, og ramma og overskrifta
blir hoppa over. Resultatet hamnar i assets/ saman med eit manifest.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from slice_sheets import mask_of, find_parts, cut  # noqa: E402

OUT = Path('assets')

SHEETS = {
    'objekt': {
        'file': '2dfe518b-image.png',
        'names': [
            'krone', 'stokk', 'gummistovel', 'hjarte', 'stjerne',
            'mikrofon', 'talarstol', 'statsradsmappe', 'flagg', 'medalje',
            'skraband', 'paraply', 'mobil', 'avis', 'seglarhanske',
            'sira', 'kongeskipet', 'pacemaker', 'kaffikopp', 'blomsterbukett',
        ],
    },
    'folk': {
        'file': 'b5c59fd1-image.png',
        'names': [
            'barn', 'eldre-dame', 'mann-med-flagg', 'turist', 'ungdom', 'bunadperson',
            'skeptikar', 'jublande', 'fotograf', 'to-barn', 'eldre-herre', 'oslobuar',
            'bolgjer', 'applaus', 'hjarte-lite', 'tommel-opp', 'tommel-ned',
            'svettedrope', 'sinne-sky', 'smilefjes',
            'vinkehand', 'balkong', 'lite-flagg', 'hurra',
        ],
    },
    'fiende': {
        'file': 'eb048156-image.png',
        'names': [
            'journalist', 'paparazzi', 'avisframside', 'tv-debatt',
            'kommentarfelt', 'demonstrant', 'republikanar', 'sladrespalte',
            'some-storm', 'kongehusbrak', 'skandalesky', 'regnstorm',
            'vakt', 'radgivar', 'sjaman', 'utropsteikn',
        ],
    },
    'ui': {
        'file': '2bbeef06-image.png',
        'names': [
            'logo', 'startknapp', 'vinkknapp',
            'pause', 'restart', 'innstillingar', 'lyd-pa', 'lyd-av',
            'panel-feil', 'panel-ok',
            'folk-lag', 'folk-middels', 'folk-hog',
            'verd-lag', 'verd-middels', 'verd-hog',
            'arstal', 'poeng', 'taleboble', 'tankeboble', 'lasting',
            # dei to siste hjarta i rada står så tett at dei blir eitt utsnitt
            'liv-full', 'liv-full2', 'liv-par', 'liv-tom', 'liv-tom2',
        ],
    },
    'harald': {
        'file': '28525ffe-image.png',
        'names': [
            'harald-baby', 'harald-barn', 'harald-prins', 'harald-galla', 'harald-vinkar', 'harald-talarstol',
            'harald-gaar-venstre', 'harald-gaar-hogre', 'harald-bekymra', 'harald-glad', 'harald-stovlar', 'harald-stokk',
            'harald-gamal', 'harald-balkong', 'harald-sira', 'harald-avis', 'harald-siger', 'harald-gameover',
        ],
    },
    'hero': {
        'file': '0bf9ad44-image.png',
        'names': None,  # heile banneret, pluss dei største bitane
    },
}


# Nokre målar-utsnitt fekk med seg overskrifta over teikninga.
BOX_OVERRIDE = {
    'folk-hog': (688, 858, 955, 949),
    'verd-lag': (86, 1024, 320, 1153),
    'verd-middels': (405, 1030, 631, 1156),
}

HERO_CROPS = {
    'harald': (628, 196, 1046, 912),
    'folkemengd': (1000, 620, 1330, 830),
    'paparazzi-flokk': (1052, 196, 1352, 420),
}


def is_caption(im, mask, box):
    """Bilettekst: brei, låg, og heilt utan farge. Teikningane er anten
    fargelagde eller høgare enn dei er breie, så dei slepp unna."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    if h > 80 or h < 8 or w < 22 or w / h < 1.7:
        return False
    a = np.asarray(im.crop(box).convert('RGB')).astype(np.int16)
    ink = a.min(axis=2) < 200
    if ink.sum() < 20:
        return False
    sat = (a.max(axis=2) - a.min(axis=2))[ink]
    # JPEG-arka har litt fargestøy i blekket, så terskelen må tole det
    return float(sat.mean()) < 14.0


def row_gaps(mask, box, min_gap=4):
    x0, y0, x1, y1 = box
    rows = mask[y0:y1, x0:x1].any(axis=1)
    gaps = []
    run = 0
    for i, r in enumerate(rows):
        if not r:
            run += 1
        else:
            if run >= min_gap:
                gaps.append((i - run, i))
            run = 0
    return gaps


def strip_caption(im, mask, box):
    """Kutt vekk tekstlinjer som heng over eller under teikninga."""
    for _ in range(3):
        x0, y0, x1, y1 = box
        gaps = row_gaps(mask, box)
        if not gaps:
            break
        changed = False
        # tekst under
        for g0, g1 in reversed(gaps):
            tail = (x0, y0 + g1, x1, y1)
            if (y1 - (y0 + g1)) <= 90 and is_caption(im, mask, tail):
                box = (x0, y0, x1, y0 + g0)
                changed = True
                break
        if changed:
            continue
        # tekst over
        x0, y0, x1, y1 = box
        for g0, g1 in gaps:
            head = (x0, y0, x1, y0 + g0)
            if g0 <= 90 and is_caption(im, mask, head):
                box = (x0, y0 + g1, x1, y1)
                changed = True
                break
        if not changed:
            break
    return box


def gap_between(a, b):
    dx = max(0, max(a[0] - b[2], b[0] - a[2]))
    dy = max(0, max(a[1] - b[3], b[1] - a[3]))
    return max(dx, dy)


def merge_fragments(boxes, near=18, small=6000):
    """Sy saman bitar som openbert høyrer til same teikning."""
    boxes = list(boxes)
    changed = True
    while changed:
        changed = False
        for i in range(len(boxes)):
            for j in range(len(boxes)):
                if i == j:
                    continue
                a, b = boxes[i], boxes[j]
                area_a = (a[2] - a[0]) * (a[3] - a[1])
                area_b = (b[2] - b[0]) * (b[3] - b[1])
                # ein liten bit høyrer til ei stor teikning, eller to smular
                # er to bitar av same vesle ikon
                pair = area_b < 0.35 * area_a or (area_a < 1600 and area_b < 1600)
                if area_b < small and pair and gap_between(a, b) <= near:
                    boxes[i] = (min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3]))
                    boxes.pop(j)
                    changed = True
                    break
            if changed:
                break
    return boxes


def reading_order(boxes):
    """Sorter som ein les: rader etter midtlinja, så venstre mot høgre."""
    if not boxes:
        return boxes
    heights = sorted((b[3] - b[1]) for b in boxes)
    tol = max(30, heights[len(heights) // 2] * 0.55)
    rows = []
    for b in sorted(boxes, key=lambda b: (b[1] + b[3]) / 2):
        cy = (b[1] + b[3]) / 2
        if rows and abs(cy - rows[-1][0]) < tol:
            rows[-1][1].append(b)
        else:
            rows.append([cy, [b]])
    out = []
    for _, r in rows:
        r.sort(key=lambda b: b[0])
        out.extend(r)
    return out


def parts_of(path, grow=3):
    im, mask, parts = find_parts(path, grow=grow)
    W, H = im.size
    keep = []
    for p in parts:
        x0, y0, x1, y1 = p['box']
        w, h = x1 - x0, y1 - y0
        if w > W * 0.9 and h > H * 0.9:
            continue  # ramma rundt arket
        if y1 < H * 0.12:
            continue  # overskrifta
        if is_caption(im, mask, p['box']):
            continue
        box = strip_caption(im, mask, p['box'])
        if box[2] - box[0] < 18 or box[3] - box[1] < 18:
            continue
        keep.append(box)
    keep = merge_fragments(keep)
    # vrak små gråtone-restar (nummer og tekstbitar)
    out = []
    for b in keep:
        w, h = b[2] - b[0], b[3] - b[1]
        a = np.asarray(im.crop(b).convert('RGB')).astype(np.int16)
        ink = a.min(axis=2) < 200
        sat = float((a.max(axis=2) - a.min(axis=2))[ink].mean()) if ink.sum() else 0
        if w * h < 3000 and sat < 6:
            continue
        if w < 24 or h < 24:
            continue
        out.append(b)
    return im, mask, reading_order(out)


def main(upload_dir):
    OUT.mkdir(exist_ok=True)
    manifest = {}
    for sheet, cfg in SHEETS.items():
        src = Path(upload_dir) / cfg['file']
        grow = 2
        im, mask, boxes = parts_of(src, grow=grow)
        names = cfg['names']
        if names is None:
            # banneret er ein komposisjon: ta vare på heile, og klipp ut
            # kongen og folkemengda med faste utsnitt
            cut(im, mask, (0, 0, im.size[0], im.size[1]), OUT / 'hero-banner.png')
            manifest['hero-banner'] = {'sheet': sheet, 'w': im.size[0], 'h': im.size[1]}
            for nm, b in HERO_CROPS.items():
                cut(im, mask, b, OUT / f'{nm}.png')
                manifest[nm] = {'sheet': sheet, 'w': b[2] - b[0], 'h': b[3] - b[1], 'box': b}
            print(f'{sheet}: banner + {len(HERO_CROPS)} utsnitt')
            continue
        if len(boxes) != len(names):
            print(f'!! {sheet}: fann {len(boxes)} teikningar, venta {len(names)}')
            for i, b in enumerate(boxes):
                print('   ', i, b, names[i] if i < len(names) else '?')
        for name, box in zip(names, boxes):
            box = BOX_OVERRIDE.get(name, box)
            cut(im, mask, box, OUT / f'{name}.png')
            manifest[name] = {'sheet': sheet, 'w': box[2] - box[0], 'h': box[3] - box[1], 'box': box}
        print(f'{sheet}: {min(len(boxes), len(names))} ressursar')
    shrink()
    make_blank_plank()
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=1, ensure_ascii=False))


# Sprites blir aldri viste større enn nokre hundre piksler, så vi krympar og
# kvantiserer. Det tek pakka frå ~7,6 MB til ~1,1 MB utan synleg tap.
MAXDIM = {'hero-banner': 1200}
DEFAULT_MAX = 420


def shrink():
    before = after = 0
    for f in sorted(OUT.glob('*.png')):
        before += f.stat().st_size
        im = Image.open(f).convert('RGBA')
        lim = MAXDIM.get(f.stem, DEFAULT_MAX)
        m = max(im.size)
        if m > lim:
            k = lim / m
            im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
        im.quantize(colors=192, method=Image.FASTOCTREE, dither=Image.Dither.NONE).save(f, optimize=True)
        after += f.stat().st_size
    print(f'krympa {before / 1e6:.1f} MB -> {after / 1e6:.1f} MB')


def make_blank_plank():
    """Poeng-planken har talet 1250 innbrent; vi fyller midten med treverk."""
    src = OUT / 'poeng.png'
    if not src.exists():
        return
    a = np.array(Image.open(src).convert('RGBA'))
    h, w = a.shape[:2]
    band = a[int(h * 0.10):int(h * 0.26)]
    y0, y1, x0, x1 = int(h * 0.20), int(h * 0.82), int(w * 0.08), int(w * 0.92)
    reps = int(np.ceil((y1 - y0) / max(1, band.shape[0])))
    fill = np.concatenate([band, band[::-1]] * reps, axis=0)[:y1 - y0]
    a[y0:y1, x0:x1] = fill[:, x0:x1]
    Image.fromarray(a).save(OUT / 'poeng-tom.png')


if __name__ == '__main__':
    main(sys.argv[1])
