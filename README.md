# Finn Harald!

Eit raskt observasjonsspel om å finne kong Harald i folkemengda.

Du startar i 1937, året Harald blir fødd. Finn han, og tida går vidare. Harald
blir eldre medan menneska, kleda og verda rundt han endrar seg.

Alle spelar det same spelet og konkurrerer om å kome lengst på verdslista.

Første runde er 46 personar på éin skjerm, og kongen er den einaste i farge.
Så veks mengda til 260, figurane krympar, torget blir to og ein halv skjerm
stort, og det grå kryp innover kongen òg. I 1972 kjem farge-TV-en, og heile
torget skifter farge på éin gong — kongen med. Undervegs står det folk i
mengda som ser ut som han, men er ein Harald frå eit heilt anna år.

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
| `pages/api/leaderboard.js` | verdslista, i Postgres — alder først, tida ved lik alder |

Alt vi eig ligg i `public/` og blir lagt inn på sida av middlewaren, i denne
rekkjefølgja:

```
board.js             finn folkemengda om oppstraums byter klassenamn
crowd-assets.js      epoken, runde-låsen, lokkedukkene og farge-TV-en
crowd-fix.js         slår av arva animasjonar
enhance.js           klokka, aldringa, bom-straffa, verdslista, mobil-layout
world.js             folketalet, figurstorleiken, utlegget, panorering og knip
menu.js              framsida og pausemenyen
ios.js               safe-area og iOS-særheiter
usernames.js         namn på spelarar
music.js             lydsporet
```

**`board.js` går først, og er grunnen til at resten verkar i det heile.** Alt
som gjeld mengda — plassering, panorering, tettleik, breidd og høgd — spør etter
`.crowd-board`. Sluttar oppstraums å bruke den klassa, gjer kvart einaste av dei
skripta ingenting, heilt stille: du får oppstraums sitt rutenett, deira folketal
og deira figurar. `.masthead` finst framleis, så menyen og aldersklokka held
fram med å virke, og sida ser frisk ut medan halve spelet er kopla frå.
`board.js` leitar seg fram i staden: figurane er mange bilete av liknande
storleik, og brettet er det djupaste elementet som held nesten alle. Set
`data-fh-board` på `<html>` til `native`, `adopted` eller `adopted-nokings` — det
siste når kongen ikkje lèt seg kjenne att, og då blir bileta ståande urørte, for
å byte dei ut utan å vite kven som er kongen gjer runden uvinnbar.

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
* **Scoren er alderen.** Der tabellen før viste eit tal oppstraums rekna ut av
  fart, streak og alder, går det no ei klokke: kor lenge du har halde krona på
  hovudet. Alderen tel først på verdslista, tida skil ved lik alder.
* **Eit bomtrykk kostar eitt år.** Panorering og knip kostar ingenting — det er
  slik du leitar. `enhance.js` skil dei ved å vente på at fingeren slepper: eit
  drag over 8 px, eller ein finger nummer to, avlyser straffa.
* **Sida er låst til skjermen.** `ios.js` set høgda på `html` og `body` til den
  synlege viewporten, slår av skrolling, og gir brettet nøyaktig det som er att
  når masthead, statlinje og bunntekst har fått sitt. Høgda blir målt og
  korrigert, ikkje gissa: `scrollHeight` duger ikkje, for `body` er klipt, så
  det som stikk ut under skjermkanten blir usynleg *og* uråd å nå, medan talet
  framleis ser ut som ein perfekt passform. Rektangla fortel sanninga.
* **Vanskegraden veks tre vegar samstundes.** Folketalet går frå 46 til 260,
  figurhøgda krympar frå 8,7 % til 4,9 % av brettet, og torget veks frå éin
  skjerm til 2,6 skjermflater. Frå 6 år og oppover må du dra og knipe for å sjå
  heile torget. Rekninga bak: oppstraums fyller krona med 7,75 − 0,68 · sekund
  når du finn han, og tappar 2–4,75 i sekundet, så eit funn som tek meir enn
  tre sekund er netto tap. Difor held det å gjere han vanskeleg å sjå —
  økonomien gjer resten, og eit spel varer eit par minutt.
* **Kongen gøymer seg betre for kvart år.** Han er teikna i farge på eit grått
  torg, så dei første rundane er han til å peike ut med lukka auge — og det
  skal han vere. Frå to år og oppover kryp det grå innover han òg, og frå ti er
  han teikna som alle andre.
* **Farge-TV-en kjem i 1972.** Heile torget skifter på éin gong, kongen med, og
  då er det mengda som gøymer han. Arka kan ikkje avgjere dette sjølve: 1940,
  1943 og 1956 er blyant og grått, men 1952 og 1966 er i full farge. Lét vi
  arka bestemme, kom fargen i 1949, forsvann i 1954 og kom att i 1963. Så eit
  grått filter ligg over heile brettet til 1972, og blir så løfta.
* **Nokre i mengda ser ut som han.** Frå tolv år og oppover står det opptil fem
  lokkedukker på torget, henta frå Harald sine eigne portrett — men aldri frå
  ein aldersbolk i nærleiken av den han er i no. Ein baby eller ein olding ved
  sida av ein konge på 40 er til å skilje frå kvarandre om du ser etter; ein
  annan positur frå same bolk er det ikkje, og då er runden eit lotteri.
* **Runden er låst, og runden er oppstraums si eiga folkemengd.** Folk,
  folketal, plassering og søkeområde står heilt stille til du finn Harald. React
  kastar heile mengda og byggjer henne på nytt med nye nøklar kvar gong kongen
  blir funnen, så dei nye figurane kjem inn utan `data-fh-uid` — det er
  signalet `crowd-assets.js` tel runden på, og `world.js` heng både utlegget og
  skalaen sin på det same nummeret. Utlegget blir sådd av **runde-nummeret**,
  ikkje av alderen: kvart funn gir alle figurane ny plassering, òg når du finn
  kongen så fort at året ikkje har rokke å tikke.

  Før hang runden på ein klikk-lyttar som såg etter `img.harald-target`. Kongen
  er ein `<button class="harald-target">` med biletet inni, så lyttaren fyrte
  aldri — og runde-nummeret stod stille frå 1937 til krona fall av: same
  utlegg, same 66 personar, same 1940-tal, heile spelet. Det såg ut som eit
  spel der berre ein handfull figurar bytte plass, for det var nettopp det som
  skjedde.
* **Kongen er ein knapp, ikkje eit bilete.** Alt som må vite kven han er, må
  leite etter `.harald-target` og ikkje etter `img.harald-target`: elles blir
  han verande der React sette han, og glir frå mengda i det sekundet du dreg.
  Han ligg fremst (`z-index`) og får eit punkt frå den fjerdedelen som har mest
  luft rundt seg — kamuflasjen er farge og storleik, ikkje at nokon står i
  vegen.
* **Klokka går berre når du ser spelet.** Meny-vaktposten er sett `hidden`, men
  `.fh-modal` i vårt eige stilark gav han ein `display`, og ein forfattarregel
  slår `[hidden]` i nettlesaren sitt ark. Så vaktposten var i praksis synleg,
  blei ståande att når React vaska bort menyen — og då stod både klokka og
  aldringa stille resten av økta. «Han eldst medan du leitar» gjorde ingenting.
* **Kvar figur får si eiga plassering — det finst ingen plassar.** Før låg punkta
  i ein tabell og figurane slo opp i han med `pts[i % lengd]`: eit fast tal
  plassar, og kom det fleire figurar enn punkt, delte dei plass. No blir kvart
  punkt kasta for den figuren det høyrer til — nokre kandidatar, ta den som ligg
  lengst frå alle som alt står der — og stilarket er nøkla på figurens `fh-uid`,
  ikkje på eit slot-nummer. Ingen rader, ingen kolonnar, ingen faste posisjonar,
  og alltid like mange plasseringar som figurar. Det gamle rutenettet la 18
  personar i seks tydelege kolonnar.
* **Mengda og kongen flyttar seg som eitt.** Plasseringa ligg i eit stilark
  (`#fh-world-slots`), og pan og zoom kjem frå seks variablar på `<html>`.
  Forskyvinga ligg i `translate`-eigenskapen, ikkje i `transform`: CSS byggjer
  matrisa som `translate · rotate · scale · transform`, så alt som ligg i
  `transform` blir gonga med figurens eigen `scale` — og Harald har sin eigen
  (`physicalHarald`). Låg den der, drog kongen frå mengda under zoom.

## Utvikling

```
npm install
npm test                  # alle testane under
npm run test:penalty      # bom-straffa: drag og knip er gratis, bom kostar eit år
npm run test:clock        # at klokka går, og at ein usynleg vaktpost ikkje er pause
npm run test:crowd        # runde-låsen, og at ei ny mengd tel som ny runde
npm run test:layout       # at brettet fyller skjermen på telefon
npm run test:pinch        # at mengda og kongen flyttar seg som eitt
npm run test:placement    # at skjermen fyllest opp med åra, og ingen blir gøymde
npm run test:board        # at mengda blir funnen sjølv om klassenamna endrar seg
npm run test:first-click  # røyktest av første klikk
npm run playtest          # klikkar gjennom fleire nivå
```

`npm test` treng ikkje nett. `tools/stub-page.mjs` byggjer den vesle DOM-en
skripta våre faktisk les, og testane køyrer dei ekte `public/*.js`-filene mot
han. Stubben må ha same form som spelet: han hadde kongen som eit `<img>` med
`harald-target` på seg, og då gjekk heile pakka grøn medan spelet stod stille. `test:crowd` avskjer bilet-verten, så både ein levande og ein død vert blir
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
