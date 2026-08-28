"""Skjer det store master-arket (game_assets_master.jpg) opp i namngjevne sprites.

Arket er tettpakka: nokre rader heng saman i blekket, så dei blir skorne som
rutenett i staden, og kvar celle trimma til si eiga teikning.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from slice_sheets import mask_of, cut, tight  # noqa: E402
from extract_assets import parts_of, strip_caption  # noqa: E402

OUT = Path('assets/master')

# Delar som blir funne kvar for seg — indeks frå parts_of(grow=0) til namn.
AUTO = {
    0: 'merke/tittel-lockup',
    1: 'harald-sprite/still', 2: 'harald-sprite/gaa-venstre', 3: 'harald-sprite/gaa-hogre',
    4: 'harald-sprite/staa', 5: 'harald-sprite/vinke-1', 6: 'harald-sprite/vinke-2',
    7: 'harald-sprite/vinke-3', 8: 'harald-sprite/snakkar', 9: 'harald-sprite/ser-ned',
    10: 'harald-sprite/med-stokk', 11: 'harald-sprite/sitt', 12: 'harald-sprite/seglar',
    13: 'harald-sprite/i-baat',
    15: 'npc/sonja', 16: 'npc/durek', 17: 'npc/statsminister-ap', 18: 'npc/statsminister-h',
    19: 'npc/journalist', 20: 'npc/slottsvakt', 21: 'npc/folk', 22: 'npc/protestar', 23: 'npc/barn',
    26: 'stad/skaugum', 27: 'stad/fjord', 28: 'stad/stortinget', 29: 'stad/nidarosdomen',
    30: 'stad/seglbaat', 31: 'stad/kai', 32: 'stad/helikopter', 33: 'stad/utland',
    34: 'baat/sira', 35: 'baat/fram-x', 36: 'baat/kongeskipet', 37: 'baat/regatta', 38: 'baat/rib',
    49: 'hud/kalender', 50: 'hud/klokke',
    60: 'ui/dialogboble',
    61: 'kort/skandale', 62: 'kort/folkehyllest', 63: 'kort/statsrad', 64: 'kort/seiling',
    67: 'boble/veldig-bra', 68: 'boble/aa-nei',
    70: 'ui/tittelmeny', 71: 'ui/kart',
    73: 'panel/siger',
}

# Faste utsnitt der blekket heng saman eller delen ikkje blir funnen.
BOXES = {
    'stad/slottet': (5, 415, 100, 530),
    'stad/balkongen': (100, 415, 192, 530),
    'boble/folkefavoritt': (550, 725, 682, 765),
    'boble/tid-for-vink': (550, 765, 682, 805),
    'ui/effektar': (730, 812, 908, 1005),
    'panel/krona-fall-av': (915, 812, 1112, 1005),
    'ui/ikonsett': (1332, 812, 1522, 1005),
    'hud/maalar-folkekjaerleik': (20, 552, 262, 588),
    'hud/maalar-verdigheit': (20, 583, 262, 619),
    'hud/maalar-familie': (20, 614, 262, 650),
    'hud/maalar-presse': (20, 645, 262, 680),
    'hud/maalar-energi': (20, 676, 262, 712),
}

# Rader som heng saman i blekket. Kvar rad blir delt på blanke kolonnar
# (mode 'runs') eller i like breie felt (mode 'even') når teikningane rører kvarandre.
GRIDS = [
    ('harald-alder', [(190, 302)], 'runs', 4,
     ['baby', 'gut', 'kadett', 'ung-dress', 'vaksen-dress', 'galla', 'galla-orden',
      'regnfrakk', 'gamal-boblejakke', 'gamal-stokk'], (20, 675)),
    ('fjes', [(322, 368)], 'runs', 4,
     ['noytral', 'smil', 'godt-smil', 'tenkjer', 'uroleg', 'treytt', 'blid', 'alvorleg',
      'lita-vits', 'sur'], (20, 675)),
    ('ting', [(405, 470), (478, 534)], 'runs', 3,
     ['krone', 'stokk', 'gummistovel', 'regnjakke', 'seglarcaps', 'statsradsmappe',
      'mikrofon', 'blomster', 'flagg', 'brevet', 'kake', 'medalje'], (1210, 1530)),
    ('humor', [(740, 802)], 'even', 7,
     ['minus3', 'minus2', 'minus1', 'null', 'pluss1', 'pluss2', 'pluss3'], (32, 277)),
    ('vaer', [(565, 624), (626, 692)], 'runs', 3,
     ['sol', 'lettsky', 'regn', 'tore', 'sno', 'vind'], (510, 690)),
    ('ikon', [(816, 850), (852, 888), (890, 926), (928, 968)], 'runs', 3,
     ['hjarte', 'stjerne', 'familie', 'kamera', 'lyn', 'krone', 'kalender', 'klokke',
      'kartnaal', 'konvolutt', 'avis', 'sluk', 'fly', 'seglbaat', 'jolle', 'anker'], (1330, 1520)),
]


def col_runs(mask, x0, x1, y0, y1, min_gap):
    """Finn samanhengande blekk-kolonnar i eit band."""
    prof = mask[y0:y1, x0:x1].sum(axis=0)
    out = []
    start = None
    gap = 0
    for i, v in enumerate(prof):
        if v > 0:
            if start is None:
                start = i
            gap = 0
        elif start is not None:
            gap += 1
            if gap >= min_gap:
                out.append((x0 + start, x0 + i - gap + 1))
                start = None
                gap = 0
    if start is not None:
        out.append((x0 + start, x0 + len(prof)))
    return out


def tight_to_drawing(im, mask, box):
    """Snevr inn til sjølve teikninga: start i det fargelagde, og veks ut så
    lenge blekket heng saman. Bilettekstane står med eit tomt band imellom,
    og fell difor utanfor."""
    x0, y0, x1, y1 = box
    a = np.asarray(im.crop(box).convert('RGB')).astype(np.int16)
    ink = mask[y0:y1, x0:x1]
    colour = ((a.max(axis=2) - a.min(axis=2)) > 28) & ink
    if colour.sum() < 25:
        return None
    rows = ink.any(axis=1)
    cols = ink.any(axis=0)
    cr = np.where(colour.any(axis=1))[0]
    cc = np.where(colour.any(axis=0))[0]
    r0, r1 = int(cr[0]), int(cr[-1])
    c0, c1 = int(cc[0]), int(cc[-1])
    while r0 > 0 and rows[r0 - 1]:
        r0 -= 1
    while r1 < len(rows) - 1 and rows[r1 + 1]:
        r1 += 1
    while c0 > 0 and cols[c0 - 1]:
        c0 -= 1
    while c1 < len(cols) - 1 and cols[c1 + 1]:
        c1 += 1
    pad = 3
    return (max(0, x0 + c0 - pad), max(0, y0 + r0 - pad),
            min(im.size[0], x0 + c1 + 1 + pad), min(im.size[1], y0 + r1 + 1 + pad))


# Kategoriar der utsnittet er ei einskild teikning med bilettekst under.
DRAWING_PREFIXES = ('ting/', 'stad/', 'baat/', 'npc/', 'fjes/', 'harald-alder/',
                    'harald-sprite/', 'ikon/', 'vaer/')


def save(im, mask, box, name, manifest):
    b = tight(mask, box, pad=3) or box
    b = strip_caption(im, mask, b)
    b = tight(mask, b, pad=3) or b
    if name.startswith(DRAWING_PREFIXES):
        b = tight_to_drawing(im, mask, b) or b
    path = OUT / (name + '.png')
    path.parent.mkdir(parents=True, exist_ok=True)
    cut(im, mask, b, path)
    manifest[name] = {'box': list(b), 'w': b[2] - b[0], 'h': b[3] - b[1]}


def main(src):
    im, mask, boxes = parts_of(src, grow=0)
    print(f'fann {len(boxes)} delar automatisk')
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {}

    for i, name in AUTO.items():
        if i < len(boxes):
            save(im, mask, boxes[i], name, manifest)

    for name, box in BOXES.items():
        save(im, mask, box, name, manifest)

    for prefix, bands, mode, arg, names, (x0, x1) in GRIDS:
        idx = 0
        per_band = len(names) // len(bands)
        for (y0, y1) in bands:
            want = names[idx:idx + per_band]
            if mode == 'runs':
                cols = col_runs(mask, x0, x1, y0, y1, arg)
                if len(cols) > len(want):
                    # vrak smulane: overskriftsrestar og enkeltstrekar
                    cols = sorted(sorted(cols, key=lambda c: -(c[1] - c[0]))[:len(want)])
                if len(cols) != len(want):
                    print(f'  !! {prefix} {y0}-{y1}: fann {len(cols)} felt, venta {len(want)}')
            else:
                step = (x1 - x0) / arg
                cols = [(round(x0 + i * step), round(x0 + (i + 1) * step)) for i in range(arg)]
            for name, (cx0, cx1) in zip(want, cols):
                save(im, mask, (cx0, y0, cx1, y1), f'{prefix}/{name}', manifest)
            idx += per_band

    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=1, ensure_ascii=False))
    print(f'skreiv {len(manifest)} ressursar til {OUT}')
    shrink_dir(OUT)


def shrink_dir(root):
    before = after = 0
    for f in sorted(root.rglob('*.png')):
        before += f.stat().st_size
        im = Image.open(f).convert('RGBA')
        if max(im.size) > 420:
            k = 420 / max(im.size)
            im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
        im.quantize(colors=192, method=Image.FASTOCTREE, dither=Image.Dither.NONE).save(f, optimize=True)
        after += f.stat().st_size
    print(f'krympa {before / 1e6:.1f} MB -> {after / 1e6:.1f} MB')


if __name__ == '__main__':
    main(sys.argv[1])
