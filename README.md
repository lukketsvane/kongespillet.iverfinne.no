# Finn Harald! — kongespelet

Eit leite-spel i nettlesaren. Du er Kong Harald, og du har rota deg bort i din
eigen folkemengd. Finn deg sjølv og alt på lista før folkegunsten renn ut —
og hugs å vinke.

Ingen bilete blir lasta ned. **Kvar einaste figur og ting er teikna i kode**,
med ein skjelvande blekkpenn, og heile brettet blir trekt på nytt kvar runde.

## Spele

Opne `index.html` gjennom ein statisk server (nettlesaren nektar ES-modular
frå `file://`):

```
npx serve .          # eller: python3 -m http.server 4173
```

`assets.html` viser alle dei grafiske ressursane — hovudroller, ting på lista,
lokkedyr, positurar, hattar og hår.

## Slik spelar du

| Handling | Korleis |
| --- | --- |
| Leite | dra for å flytte deg, rull eller knip for å zoome |
| Finne | klikk på tingen når du ser han |
| Vinke | `mellomrom` eller VINK-knappen |
| Hint | `h` — kostar folkegunst, tre per spel |

**Folkegunsten** renn ut heile tida. Du fyller han med å vinke, men folk
gjennomskodar autopilot: kvar vink tel mindre enn den førre, og verknaden
kjem seg berre att om du let vere ei stund.

Tre ting gjer leitinga vanskeleg:

* **Pressa** ropar før dei knipsar. Vink i det sekundet, så får du «Kongen i
  storform». Vink ikkje, og biletet blir «Sur konge på torget».
* **Sjaman Durek** held seanse midt i mengda og tåkelegg alt rundt seg.
  Klikk han vekk.
* **KSV** sperrar av eit belte av torget. Der ser du ingenting før dei har gått.

Lista veks med nivået, og folkemengda blir tettare: frå vel 550 personar på
nivå 1 til over 1600 på nivå 9. Lokkedyra veks med: mørke dressar utan krone,
blå leikebåtar, danske flagg, sko som ikkje er gummistøvlar.

## Korleis grafikken blir til

```
src/draw.js     blekk-primitiv: skjelvande strek, lukka former, flekkar
src/people.js   ein figur = ein spesifikasjon (hud, hår, frakk, hatt, positur)
src/props.js    ting og staffasje: krone, båt, rev, fontene, bod …
src/board.js    brettgeneratoren — rader, tettleik, gøymde mål
src/icons.js    same teikningane i miniatyr til sjekklista
src/game.js     spel-loop, pan/zoom, treff, farar, vinking
src/rng.js      frø-styrt tilfeldiggjerar, så eit brett kan spelast om att
```

Brettet blir teikna éin gong til eit lerret utanfor skjermen (rundt 200 ms for
1700 figurar) og deretter berre flytta og skalert. Farane er små lerret som
blir flytta over. Difor går det jamt òg med ei stor folkemengd.

Kvart brett har eit nummer (`brett #o6h` oppe til høgre). Legg det på adressa
som `?seed=o6h` for å spele nøyaktig same folkemengd om att.

## Utviklingsverktøy

```
node tools/playtest.mjs     # byggjer brett, klikkar kvart mål, sjekkar runda
node tools/shot.mjs . ut.png "js som skal køyrast før biletet"
```

Begge krev `npm i` (berre Playwright, og berre til testing).
