"""Skjer ressurs-arka opp i einskilde sprites med gjennomsiktig bakgrunn.

Arka er teikningar på papir. Vi finn kvar teikning ved å utvide blekket til
samanhengande flekkar, og skriv ut ein trimma PNG per flekk.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

SCALE = 4  # nedskalering før flekk-søk


def mask_of(im, thr=243):
    a = np.asarray(im.convert('RGB')).astype(np.int16)
    # blekk = alt som ikkje er nær papirkvitt
    return a.min(axis=2) < thr


def block_max(m, k):
    h, w = m.shape
    h2, w2 = h // k * k, w // k * k
    return m[:h2, :w2].reshape(h2 // k, k, w2 // k, k).max(axis=(1, 3))


def dilate(m, n):
    for _ in range(n):
        out = m.copy()
        out[1:, :] |= m[:-1, :]
        out[:-1, :] |= m[1:, :]
        out[:, 1:] |= m[:, :-1]
        out[:, :-1] |= m[:, 1:]
        m = out
    return m


def components(m):
    """Enkel flood fill; m er lita, så dette held."""
    h, w = m.shape
    lab = np.zeros((h, w), np.int32)
    boxes = []
    cur = 0
    for y0 in range(h):
        for x0 in range(w):
            if not m[y0, x0] or lab[y0, x0]:
                continue
            cur += 1
            stack = [(y0, x0)]
            lab[y0, x0] = cur
            miny = maxy = y0
            minx = maxx = x0
            n = 0
            while stack:
                y, x = stack.pop()
                n += 1
                if y < miny: miny = y
                if y > maxy: maxy = y
                if x < minx: minx = x
                if x > maxx: maxx = x
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and not lab[ny, nx]:
                        lab[ny, nx] = cur
                        stack.append((ny, nx))
            boxes.append({'id': cur, 'box': (minx, miny, maxx, maxy), 'px': n})
    return boxes


def tight(mask, box, pad=3):
    x0, y0, x1, y1 = box
    sub = mask[y0:y1 + 1, x0:x1 + 1]
    ys = np.where(sub.any(axis=1))[0]
    xs = np.where(sub.any(axis=0))[0]
    if not len(ys) or not len(xs):
        return None
    b = (int(x0 + xs[0] - pad), int(y0 + ys[0] - pad), int(x0 + xs[-1] + 1 + pad), int(y0 + ys[-1] + 1 + pad))
    return (max(0, b[0]), max(0, b[1]), min(mask.shape[1], b[2]), min(mask.shape[0], b[3]))


def find_parts(path, grow=3, min_px=60):
    im = Image.open(path).convert('RGB')
    mask = mask_of(im)
    small = dilate(block_max(mask, SCALE), grow)
    parts = []
    for c in components(small):
        if c['px'] < min_px:
            continue
        x0, y0, x1, y1 = c['box']
        b = tight(mask, (x0 * SCALE, y0 * SCALE, min(mask.shape[1] - 1, (x1 + 1) * SCALE), min(mask.shape[0] - 1, (y1 + 1) * SCALE)))
        if b:
            parts.append({'box': b, 'w': b[2] - b[0], 'h': b[3] - b[1], 'px': int(c['px'])})
    # les i rader: sorter på y, grupper, så på x
    parts.sort(key=lambda p: p['box'][1])
    rows = []
    for p in parts:
        placed = False
        for r in rows:
            if abs(p['box'][1] - r[0]['box'][1]) < 70:
                r.append(p)
                placed = True
                break
        if not placed:
            rows.append([p])
    ordered = []
    for r in rows:
        r.sort(key=lambda p: p['box'][0])
        ordered.extend(r)
    return im, mask, ordered


def cut(im, mask, box, out, soft=True):
    x0, y0, x1, y1 = box
    rgb = im.crop((x0, y0, x1, y1)).convert('RGB')
    a = np.asarray(rgb).astype(np.float32)
    # papiret blir gjennomsiktig: alfa frå kor mykje blekk som ligg i pikselen
    lum = a.min(axis=2)
    alpha = np.clip((250.0 - lum) / 30.0, 0, 1)
    if not soft:
        alpha = (alpha > 0.15).astype(np.float32)
    # behald fargen, men dra vekk papirkvitten der det er halvgjennomsiktig
    out_rgb = np.clip(a, 0, 255).astype(np.uint8)
    res = np.dstack([out_rgb, (alpha * 255).astype(np.uint8)])
    Image.fromarray(res, 'RGBA').save(out)


def debug_sheet(im, parts, out):
    from PIL import ImageDraw
    d = im.copy()
    g = ImageDraw.Draw(d)
    for i, p in enumerate(parts):
        g.rectangle(p['box'], outline=(220, 30, 30), width=3)
        g.text((p['box'][0] + 4, p['box'][1] + 2), str(i), fill=(200, 0, 0))
    d.save(out)


if __name__ == '__main__':
    src = sys.argv[1]
    grow = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    im, mask, parts = find_parts(src, grow=grow)
    print(json.dumps([{'i': i, 'box': p['box'], 'w': p['w'], 'h': p['h']} for i, p in enumerate(parts)]))
    debug_sheet(im, parts, sys.argv[3] if len(sys.argv) > 3 else '/tmp/debug.png')
