"""Byggjer den samla ressurspakka: sorterer alt som er skore ut, legg ved
kjeldearka og dei ferdigrendra nivåbretta, og pakkar det til ein zip.

    python3 tools/build_pack.py --kjelder <mappe-med-ark> --nivaa <mappe-med-utpakka-nivaapakkar>
"""
import argparse
import json
import shutil
import zipfile
from pathlib import Path

from PIL import Image

PACK = Path('dist/FINN-HARALD-ressurspakke')

# Kva kategori kvar ressurs hamnar i.
SHEET_DIR = {
    'harald': '01-harald-brikker',
    'objekt': '07-finn-objekt',
    'folk': '05-folkemengd',
    'fiende': '09-farar-og-hendingar',
    'ui': '12-ui',
    'hero': '14-banner',
}
MASTER_DIR = {
    'harald-sprite': '02-harald-sprites',
    'harald-alder': '03-harald-aldrar',
    'fjes': '04-uttrykk',
    'humor': '04-uttrykk',
    'npc': '06-npc',
    'ting': '08-ting',
    'kort': '09-farar-og-hendingar',
    'baat': '10-baatar',
    'stad': '11-stader',
    'ui': '12-ui',
    'hud': '12-ui',
    'ikon': '12-ui',
    'boble': '12-ui',
    'panel': '12-ui',
    'merke': '12-ui',
    'vaer': '13-vaer-og-effektar',
}

# Kva vi tek med frå kvart ferdigrendra nivå (resten er dublettar).
LEVEL_KEEP = ['board.webp', 'level.json', 'checklist.png', 'target_preview.png', 'header.png', 'footer.png']

KJELDER = {
    '9016376d-image.png': 'plakat-01-luftig.png',
    '8dad508c-image.png': 'plakat-02-tett.png',
    '77248282-image.png': 'plakat-03-medels.png',
    '0bf9ad44-image.png': 'ark-banner.png',
    '2bbeef06-image.png': 'ark-ui-og-knappar.png',
    '2dfe518b-image.png': 'ark-objekt-og-bonus.png',
    'b5c59fd1-image.png': 'ark-folket-og-vink.png',
    'eb048156-image.png': 'ark-fiendar-og-hendingar.png',
    '28525ffe-image.png': 'ark-harald-brikker.png',
}


def copy(src, dst):
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def copy_source(src, dst_stem):
    """Kjeldearka blir lagra tapsfritt som webp — same piksler, ein tredel mindre."""
    dst = dst_stem.with_suffix('.webp')
    dst.parent.mkdir(parents=True, exist_ok=True)
    Image.open(src).convert('RGB').save(dst, 'WEBP', lossless=True, quality=100, method=5)
    return dst.name


def build(kjelder, nivaa, master_sheet):
    if PACK.exists():
        shutil.rmtree(PACK)
    PACK.mkdir(parents=True)
    manifest = {'pakke': 'FINN HARALD — ressurspakke', 'kategoriar': {}}

    # 1. ark-ressursane
    man = json.loads(Path('assets/manifest.json').read_text())
    for name, meta in man.items():
        src = Path('assets') / f'{name}.png'
        if not src.exists():
            continue
        d = SHEET_DIR.get(meta['sheet'], '12-ui')
        copy(src, PACK / d / f'{name}.png')
        manifest['kategoriar'].setdefault(d, []).append(f'{name}.png')

    # 2. master-arket
    for f in sorted(Path('assets/master').rglob('*.png')):
        d = MASTER_DIR.get(f.parent.name, '12-ui')
        copy(f, PACK / d / f'{f.parent.name}-{f.name}')
        manifest['kategoriar'].setdefault(d, []).append(f'{f.parent.name}-{f.name}')

    # 3. kjeldearka
    if kjelder:
        for src_name, dst_name in KJELDER.items():
            p = Path(kjelder) / src_name
            if p.exists():
                nm = copy_source(p, PACK / '15-kjelder' / Path(dst_name).stem)
                manifest['kategoriar'].setdefault('15-kjelder', []).append(nm)
    if master_sheet and Path(master_sheet).exists():
        nm = copy_source(Path(master_sheet), PACK / '15-kjelder' / 'ark-game-assets-master')
        manifest['kategoriar'].setdefault('15-kjelder', []).append(nm)

    # 4. ferdigrendra nivåbrett
    if nivaa:
        seen = set()
        for lvl in sorted(Path(nivaa).rglob('level_*/level.json')):
            name = lvl.parent.name
            if name in seen:
                continue
            seen.add(name)
            for f in LEVEL_KEEP:
                p = lvl.parent / f
                if p.exists():
                    copy(p, PACK / '16-nivaa' / name / f)
            manifest['kategoriar'].setdefault('16-nivaa', []).append(name)

    counts = {k: len(v) for k, v in sorted(manifest['kategoriar'].items())}
    manifest['tal'] = counts
    manifest['sum'] = sum(counts.values())
    (PACK / 'manifest.json').write_text(json.dumps(manifest, indent=1, ensure_ascii=False))
    (PACK / 'LES-MEG.md').write_text(readme(counts))

    zip_path = PACK.with_suffix('.zip')
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for f in sorted(PACK.rglob('*')):
            if f.is_file():
                z.write(f, f.relative_to(PACK.parent))
    mb = zip_path.stat().st_size / 1e6
    print(f'{manifest["sum"]} filer i {len(counts)} kategoriar -> {zip_path} ({mb:.1f} MB)')
    for k, v in counts.items():
        print(f'  {k:26} {v}')


def readme(counts):
    lines = [
        '# FINN HARALD — ressurspakke',
        '',
        'Alt det grafiske til spelet, skore ut av dei handteikna arka og sortert.',
        'Kvar PNG har gjennomsiktig papir og er trimma til teikninga si.',
        '',
        '## Innhald',
        '',
        '| Mappe | Filer |',
        '| --- | --- |',
    ]
    for k, v in counts.items():
        lines.append(f'| `{k}/` | {v} |')
    lines += [
        '',
        '## Korleis det er laga',
        '',
        'Arka i `15-kjelder/` (tapsfri webp) er skorne opp automatisk:',
        '',
        '```',
        'python3 tools/extract_assets.py <mappe-med-ark>      # dei seks arka',
        'python3 tools/extract_master.py <game-assets-master> # det store master-arket',
        'python3 tools/build_pack.py --kjelder … --nivaa …    # sorterer og pakkar',
        '```',
        '',
        'Utskjeringa finn kvar teikning ved å utvide blekket til samanhengande',
        'flekkar, skil teikning frå bilettekst på farge og form, og trimmar til',
        'sjølve teikninga. Filene er krympa til visingsstorleik og kvantiserte.',
        '',
        '## Nivåbretta',
        '',
        '`16-nivaa/` er dei ferdigrendra bretta med `level.json`: hitboks for',
        'Harald (normalisert, så same data verkar på mobil og desktop),',
        'tidsgrense og vanskegrad. Flislagde utgåver (`tiles_4x4/`) ligg i dei',
        'opphavlege pakkane og er ikkje tekne med her.',
        '',
        '## Bruk i spelet',
        '',
        'Spelet lastar frå `assets/` i repoet — same filer, same namn.',
        'Sjå `src/assets.js` for storleikane kvar ting blir teikna i.',
    ]
    return '\n'.join(lines) + '\n'


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--kjelder')
    ap.add_argument('--nivaa')
    ap.add_argument('--master')
    a = ap.parse_args()
    build(a.kjelder, a.nivaa, a.master)
