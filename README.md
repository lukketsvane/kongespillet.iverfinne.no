# Kong Harald — vink eller gå under

Eit leite-spel i nettlesaren. Du er Kong Harald, og du har rota deg bort i di
eiga folkemengd. Finn deg sjølv og alt du har mist — og hald både
**folkekjærleiken** og **verdigheita** oppe medan pressa knipsar, sjamanen
tåkelegg torget og kommentarfeltet kokar.

Folkemengda blir trekt på nytt kvar runde: frå knapt 600 personar på nivå 1 til
over 1700 på nivå 9, alle generert i kode. Tinga du leitar etter, farane og
heile grensesnittet er handteikna ressursar, skorne ut av seks ressurs-ark.

Og det er ikkje ein kva-som-helst-Harald du leitar etter. Kvar runde er det
**éin bestemt brikke** som er gøymd — Harald i gummistøvlar, Harald med stokk,
baby-Harald — og lista viser kven. Dei andre brikkene står i mengda som
lokkekongar. Klikkar du feil konge, kostar det.

## Spele

Opne `index.html` gjennom ein statisk server (nettlesaren nektar ES-modular
frå `file://`):

```
npx serve .          # eller: python3 -m http.server 4173
```

`assets.html` viser alle dei grafiske ressursane — både dei teikna sprites-ane
og folkemengda som blir generert i kode.

## Slik spelar du

| Handling | Korleis |
| --- | --- |
| Leite | dra for å flytte deg, rull eller knip for å zoome |
| Finne | klikk på tingen — eller på rett Harald — når du ser han |
| Vinke | `mellomrom` eller VINK-knappen |
| Hint | `h` — kostar verdigheit, tre per spel |
| Pause | `p` eller `Esc` |

**Krona** er klokka. Ho sit laust frå første sekund, og di lenger du leitar,
di lenger vipper ho — du ser henne gli av ikonet i hud-en. Kvart funn set
henne betre på plass, Harald sjølv mest av alt. Fell ho av, kostar det eit liv.

**Folkekjærleiken** renn ut heile tida, og du fyller han med å vinke. Men folk
gjennomskodar autopilot: kvar vink tel mindre enn den førre, og vinkar du i
eitt sett, ryk **verdigheita** i staden. Går ein av dei tre målarane i botn,
mistar du eit liv. Tre liv, så er det over.

Undervegs:

* **Pressa** ropar før dei knipsar. Vink akkurat då, så blir det «Kongen i
  storform». Vink ikkje, og biletet blir «Sur konge på torget».
* **Sjamanen** held seanse midt i mengda og tåkelegg alt rundt seg. Klikk han
  vekk før verdigheita renn ut.
* **Vaktene** sperrar av eit belte av torget. Der ser du ingenting før dei har
  gått forbi.
* **Kommentarfeltet, skandaleskya og regnstormen** legg seg over skjermen og et
  verdigheit til du klikkar dei vekk.
* **Hjarte** gir folkekjærleik, **stjerner** gir verdigheit. Dei ligg gøymde i
  mengda saman med resten.

Lista veks med nivået, og lokkedyra er dei same tinga som ikkje står på lista
denne runden — er det talarstolen du leitar etter, ligg statsrådsmappa og
kaffikoppen der berre for å lure deg.

## Ressursane

```
assets/                 109 sprites frå dei seks arka
assets/master/          121 sprites frå det store master-arket, sortert i mapper
tools/extract_assets.py skjer arka opp: finn kvar teikning, kuttar bilettekstane,
                        gjer papiret gjennomsiktig og gir filene namn
tools/extract_master.py same for master-arket, som er så tett at radene må
                        delast på blanke kolonnar
tools/build_pack.py     sorterer alt i kategoriar og pakkar det til ein zip
```

Master-arket gir NPC-ar (Sonja, Durek, statsministrar, slottsvakt, protestar),
stader (Slottet, Skaugum, Nidarosdomen, Stortinget, fjorden), båtar (Sira,
Fram X, Kongeskipet), 13 Harald-sprites, 10 aldrar, 10 andletsuttrykk,
hendingskort, målarar, vêr, bobler og eit fullt ikonsett.

Den samla pakka (249 filer i 16 kategoriar, med kjeldearka som tapsfri webp og
dei ferdigrendra nivåbretta med hitboksar) blir bygd slik:

```
python3 tools/build_pack.py --kjelder <ark> --master <game-assets-master> --nivaa <nivaapakkar>
```

Arka er teikna for hand (objekt og bonus, folket og vink, fiendar og hendingar,
UI og knappar, 18 Harald-brikker, og eit banner). Utskjeringa finn kvar teikning ved å utvide
blekket til samanhengande flekkar, skil teikning frå bilettekst på farge og
form, og skriv ut ein trimma PNG per ting.

Folkemengda kan ikkje teiknast for hand — det er 1700 personar per brett — så
ho blir generert:

```
src/draw.js     blekk-primitiv: skjelvande strek, lukka former, flekkar
src/people.js   ein figur = ein spesifikasjon (hud, hår, frakk, hatt, positur)
src/props.js    smått og staffasje: hundar, ballongar, fontener, bodar
src/assets.js   lastar dei teikna ressursane, Harald-brikkene og storleikane deira
src/board.js    brettgeneratoren — rader, tettleik, gøymde mål
src/game.js     spel-loop, pan/zoom, treff, farar, målarar og liv
src/rng.js      frø-styrt tilfeldiggjerar, så eit brett kan spelast om att
```

Brettet blir teikna éin gong til eit lerret utanfor skjermen (rundt 200 ms for
1700 figurar) og deretter berre flytta og skalert, så det går jamt òg i tett
mengd.

Kvart brett har eit nummer (`brett #o6h` i hud-en). Legg det på adressa som
`?seed=o6h` for å spele nøyaktig same folkemengd om att.

## Utviklingsverktøy

```
python3 tools/extract_assets.py <mappe-med-ark>   # skjer arka på nytt
node tools/playtest.mjs                           # klikkar kvart mål på fleire nivå
node tools/shot.mjs . ut.png "js før biletet"     # skjermbilete
```

Playwright og Pillow trengst berre til verktøya (`npm i`, `pip install pillow numpy`).
Sjølve spelet har ingen avhengigheiter.
