# Finn Harald!

Eit raskt observasjonsspel om å finne kong Harald i folkemengda.

Du startar i 1937, året Harald blir fødd. Finn han, og tida går vidare. Harald
blir eldre medan menneska, kleda og verda rundt han endrar seg.

Alle spelar det same spelet og konkurrerer om å kome lengst på verdslista.

Etter kvart blir folkemengda større og søkeområdet enormt. Du må leite,
panorere og zoome gjennom historia for å finne kongen.

Trykk feil, og Harald blir eitt år eldre.

**Kor gammal klarer du å gjere Harald?**

Spelet ligg på <https://kongespillet.iverfinne.no>.

## Korleis det heng saman

Sjølve spelet — folkemengda, treffdeteksjonen og aldersteljinga — blir
publisert frå ei ChatGPT-side. Dette repoet er ein Next.js-app som ligg framfor
henne på Vercel, og som gjer tre ting:

| Fil | Rolle |
| --- | --- |
| `next.config.mjs` | skriv om alt som ikkje ligg her, til kjeldesida |
| `middleware.js` | hentar HTML-en, lappar spel-bundelen og injiserer skripta under |
| `pages/api/leaderboard.js` | verdslista, i Postgres — alder først, score ved lik alder |

Alt vi eig ligg i `public/` og blir lagt inn på sida av middlewaren, i denne
rekkjefølgja:

```
crowd-assets.js      folkemengda og Harald-portretta, låst per runde
crowd-fix.js         slår av arva filter og animasjonar
enhance.js           alders-klokka, bom-straffa, verdslista, mobil-layout
world.js             folketalet, utlegget, panorering og knip
menu.js              framsida og pausemenyen
ios.js               safe-area og iOS-særheiter
usernames.js         namn på spelarar
music.js             lydsporet
```

Rekkjefølgja er ikkje tilfeldig: `crowd-assets.js` set runde-nummeret som
`world.js` les, og `enhance.js` set `data-fh-effective-age` som
`crowd-assets.js` les.

`middleware.js` har ein `BUILD`-streng. Han bustar cachen på både bundelen og
skripta, så **han må hevast for kvar utrulling** — elles ser spelarane dei gamle
filene.

Middlewaren strengerstattar òg to stader i den minifiserte bundelen frå
kjeldesida (teiknefrekvens og folketal). Dei to lappane er sjekka mot markørane
sine før dei blir brukte, så ei ny bundel utan markørane gir uendra kode i
staden for øydelagd kode — men då er lappen borte, og `x-fh-render-patch` /
`x-fh-crowd-base-cap` i svarhovudet blir `0`. Sjekk dei to etter ei utrulling.

## Reglane

* Éin konkurransemodus. Same reglar for alle.
* Du startar i 1937. Kvart funn flyttar deg framover.
* Alderen tel først på verdslista, score skil ved lik alder.
* **Eit bomtrykk kostar eitt år.** Panorering og knip kostar ingenting — det er
  slik du leitar. `enhance.js` skil dei ved å vente på at fingeren slepper: eit
  drag over 8 px, eller ein finger nummer to, avlyser straffa.
* Frå Harald er 8 år veks verda forbi skjermen, og du må dra og knipe for å sjå
  heile torget.
* **Runden er låst.** Folk, folketal og plassering står stille til du finn
  Harald — berre søkeområdet held fram med å vekse med alderen. `crowd-assets.js`
  set `data-fh-real-round` på brettet, og `world.js` heng utlegget sitt på det
  same nummeret. Når du finn kongen, kallar `crowd-assets.js`
  `__FH_WORLD__.advanceRound()`, som sentrerer utsynet og legg mengda på nytt.

## Utvikling

```
npm install
npm test                  # begge testane under
npm run test:penalty      # bom-straffa: drag og knip er gratis, bom kostar eit år
npm run test:crowd        # runde-låsen, og at Harald aldri blir usynleg
npm run test:first-click  # røyktest av første klikk
npm run playtest          # klikkar gjennom fleire nivå
```

`npm test` treng ikkje nett. `tools/stub-page.mjs` byggjer den vesle DOM-en
skripta våre faktisk les, og testane køyrer dei ekte `public/*.js`-filene mot
han. `test:crowd` avskjer bilet-verten, så både ein levande og ein død vert blir
dekt. `test:first-click` og `playtest` går mot den publiserte sida og treng
utgåande nett.

`node tools/shot.mjs . ut.png "js før biletet"` tek skjermbilete.

## Ressursar og verktøy

Folkemengda og Harald-portretta ligg no som webp hos ein ekstern bilet-vert, og
lista over dei står øvst i `public/crowd-assets.js`. Går verten ned, prøver
skripta på nytt og teiknar til slutt ein synleg markør for Harald, slik at
runden framleis kan vinnast.

`assets/` og `tools/extract_assets.py`, `extract_master.py`, `build_pack.py`
høyrer til den eldre, teikna grafikken: dei skjer ark opp i enkeltsprites, gjer
papiret gjennomsiktig og pakkar dei i kategoriar. `public/era-sheets/` er
tidsepoke-arka. Ingen av dei er i bruk i spelet no.

`index.html`, `styles.css`, `assets.html` og `src/` er ein tidlegare, frittståande
prototype (*«Kong Harald — vink eller gå under»*). Han blir ikkje servert —
Next.js skriv om alle desse stiane til kjeldesida — men ligg att som referanse
for teikne- og folkemengd-koden.
