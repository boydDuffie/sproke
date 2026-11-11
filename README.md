# Sproke

Norwegian Bokmål for English speakers, taught by trolls.

Sproke is a small language-learning web app built around the things lesson-and-streak apps tend to
under-practise:

- **Noun endings** – `-en / -a / -et`, `-er`, `-ene`, plus the irregular ones (`bøker`, `menn`, `barna`).
- **Verb forms** – present, past, perfect and imperative, for all four regular groups and the strong verbs.
- **Whole-sentence translation in the practice area**, in both directions, with word tiles or the keyboard.

It is an original project with its own characters and artwork, inspired by gamified language apps.
It is not affiliated with Duolingo.

## Run it

There is no build step and nothing to install.

- Open `index.html` in a browser, or
- serve the folder with any static server (`python3 -m http.server`), or
- host it on GitHub Pages: **Settings → Pages → Deploy from a branch → `/ (root)`**.

Served over http(s) it works offline and can be installed to a phone's home screen.
Progress is saved in the browser (`localStorage`); nothing is sent anywhere.

`node tools/build.js` writes `dist/sproke.html`, the whole app as one file.

## What is in it

**The trail** – 35 lessons in eight places, each hosted by a figure from Norwegian folklore:

| | Place | Host | Teaches |
|---|---|---|---|
| 1 | Fjøset | Nils the nisse | greetings, en / ei / et, first sentences |
| 2 | Skogen | Hulda the huldra | definite singular: `-en`, `-a`, `-et` |
| 3 | Brua | the Billy Goats Bruse | plurals: `-er`, unchanged et-words, `-ere`, vowel change |
| 4 | Fjellet | the mountain trolls | definite plural `-ene`, all four forms together |
| 5 | Tjernet | Nøkken | present tense, `ikke`, questions, verb-second word order |
| 6 | Fossen | Fossegrimen | regular past tense: `-et`, `-te`, `-de`, `-dde` |
| 7 | Havet | Draugen | strong verbs, the perfect |
| 8 | Soria Moria | Kvitebjørn | helper verbs, commands, possessives, adjective agreement |

Every lesson can be repeated up to level 3; each level swaps more multiple choice for typing.
Nothing is locked, so you can start wherever your Norwegian already is.

**Practice** – no trail, you choose:

- *Endelser* – pick which noun forms to drill.
- *Verb* – pick tenses, and regular or strong verbs.
- *Setninger* – translate generated sentences, to Norwegian, to English or both.
- *Fraser* – everyday phrases.
- *Blanding* – everything shuffled.
- *Gjengangere* – the forms you keep getting wrong come back until they stick.

**Words** – every noun, verb and adjective with its full table, a "drill this word" button, and the grammar notes.

### How the exercises work

Questions are generated, not written by hand. `js/data.js` holds about 120 nouns, 100 verbs and 24
adjectives with their genders, verb groups and irregular forms; `js/grammar.js` inflects them; and
`js/engine.js` assembles sentences from patterns (subject – verb – object, places, negation,
questions, fronted time expressions, helper verbs, possessives, adjectives). The same sentence is
produced in both languages together with every accepted variant, so `ei jente` / `en jente`,
`boka mi` / `boken min` / `min bok`, and "eats" / "is eating" are all marked right.

The checker is deliberately strict where it matters: a slip of the finger is forgiven in ordinary
words, but never in the ending being practised. When a wrong answer is another form of the right
word, the feedback says which form you wrote and which one was needed.

## Layout

```
index.html            page shell
css/app.css           all styling, light and dark
js/data.js            words, phrases, places
js/grammar.js         noun, verb and adjective inflection (Norwegian and English)
js/check.js           answer matching and mistake diagnosis
js/engine.js          sentence patterns and exercise makers
js/course.js          units, lessons, grammar notes, practice modes
js/store.js           progress, streak, spaced repetition
js/art.js             characters, runes and icons as inline SVG
js/app.js             the interface
sw.js                 offline cache
tests/run.js          tests for the grammar, generator and checker
tools/build.js        single-file bundle
tools/artifact-sync.js  optional progress sync for a copy published as a claude.ai artifact
```

## Adding words

Add a line to `NOUNS` or `VERBS` in `js/data.js`, then list the word in a lesson in `js/course.js`
(`n:` for nouns, `v:` for verbs). Regular forms are derived automatically; only irregular forms
need spelling out:

```js
['bok', 'f', 'book', 'obj thing readable', { ip: 'bøker', dp: 'bøkene' }],
['skrive', 's', 'write,wrote,written,writing', { pres: 'skriver', past: 'skrev', pp: 'skrevet', o: 'written' }],
```

The tags (`food`, `obj`, `readable`, …) decide which verbs a noun can follow, which keeps generated
sentences sensible.

## Tests

```
node --test tests/run.js
```

The tests build every lesson at every level and every practice mode many times over and check that
each generated question can be answered with its own model answer.
