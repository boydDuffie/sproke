/* Sproke — the course: eight places on the road to Soria Moria.
 * A lesson lists the words it introduces (n, v, a) and a recipe of generated exercises.
 */
(function (S) {
  'use strict';

  // Sentence settings reused across lessons. Each stage only uses grammar taught so far.
  var PRON = ['pron', 'pron', 'name'], MIX = ['pron', 'noun', 'noun', 'name'];
  var s1 = { pat: ['svo'], tense: ['pres'], subj: PRON, nf: ['is'], num: 0 };
  var s2 = { pat: ['svo', 'svo', 'where'], tense: ['pres'], subj: MIX, subjForms: ['ds'], nf: ['ds'] };
  var s2b = { pat: ['svo', 'place', 'where'], tense: ['pres'], subj: MIX, subjForms: ['ds'], nf: ['ds', 'is'] };
  var s3 = { pat: ['svo'], tense: ['pres'], subj: MIX, subjForms: ['ds'], nf: ['ip'], num: 1 };
  var s4 = { pat: ['svo', 'svo', 'where'], tense: ['pres'], subj: MIX, subjForms: ['ds', 'dp'], nf: ['dp'] };
  var s4b = { pat: ['svo', 'svo', 'place', 'where'], tense: ['pres'], subj: MIX, nf: ['is', 'ds', 'ip', 'dp'] };
  var s5 = { pat: ['svo', 'place', 'place', 'bare', 'comp'], tense: ['pres'], subj: MIX, nf: ['is', 'ds', 'ip', 'dp'] };
  var s6 = { pat: ['svo', 'svo', 'place', 'to', 'bare'], tense: ['past'], subj: MIX, nf: ['is', 'ds', 'ip', 'dp'] };
  var s7 = { pat: ['svo', 'svo', 'place', 'to', 'comp', 'bare'], tense: ['past'], subj: MIX, nf: ['ds', 'ip', 'dp'] };
  function mix(base, extra) { var o = {}, k; for (k in base) o[k] = base[k]; for (k in extra) o[k] = extra[k]; return o; }
  function sent(base, extra) { return mix(mix(base, { t: 'sent' }), extra || {}); }

  var HEI = ['hei', 'godmorgen', 'godkveld', 'godnatt', 'takk', 'tusentakk', 'hadet', 'ja', 'nei', 'velkommen', 'kanskje'];
  var HVEM = ['hvordan', 'bra', 'hvaheter', 'jegheter', 'hvorfra', 'franorge', 'snakkerdu', 'littnorsk', 'forstarikke', 'unnskyld', 'vaersasnill', 'hvemerdu', 'jegertroll', 'visees', 'hvaerdet', 'sulten'];
  var ADJ1 = ['stor', 'liten', 'gammel', 'ung', 'snill', 'sterk', 'glad', 'sulten', 'rød', 'grønn', 'blå', 'hvit', 'svart'];
  var ADJ2 = ADJ1.concat(['trøtt', 'redd', 'klok', 'farlig', 'vakker', 'fin', 'ny', 'lang', 'kald', 'varm', 'mørk']);

  S.UNITS = [
    {
      id: 'fjos', title: 'Fjøset', en: 'The Barn', host: 'nisse', color: 'red',
      blurb: 'Nils the nisse guards the barn. Leave him porridge and he will teach you your first words.',
      lessons: [
        { id: 'hei', title: 'Hei!', en: 'Greetings', tip: 'hei', recipe: [
          { t: 'phrase', ids: HEI, mode: 'choice', n: 5 }, { t: 'phrase', ids: HEI, mode: 'write', input: 'bank', n: 4 }, { t: 'phrase', ids: HEI, mode: 'write', n: 4 }] },
        { id: 'hvem', title: 'Hvem er du?', en: 'Who are you?', tip: 'hei', recipe: [
          { t: 'phrase', ids: HVEM, mode: 'choice', n: 4 }, { t: 'phrase', ids: HVEM, mode: 'write', input: 'bank', n: 5 }, { t: 'phrase', ids: HVEM, mode: 'write', n: 4 }] },
        { id: 'enetet', title: 'En, ei, et', en: 'Three genders', tip: 'gender', n: ['gutt', 'jente', 'mann', 'kvinne', 'barn', 'troll', 'nisse', 'hus'], recipe: [
          { t: 'vocab', what: 'n', mode: 'choice', n: 4 }, { t: 'gender', n: 4 }, { t: 'match', what: 'vocab', n: 1 },
          { t: 'sent', pat: ['thatis'], dir: 'en-no', n: 2 }, { t: 'sent', pat: ['thatis', 'once'], n: 2 }, { t: 'vocab', what: 'n', mode: 'type', n: 2 }] },
        { id: 'gard', title: 'På gården', en: 'On the farm', tip: 'gender', n: ['hest', 'ku', 'katt', 'hund', 'geit', 'gris', 'sau', 'fjøs', 'gård'], v: ['ha', 'se'], recipe: [
          { t: 'vocab', what: 'n', mode: 'choice', n: 3 }, { t: 'gender', n: 3 }, { t: 'match', what: 'vocab', n: 1 }, { t: 'vocab', what: 'v', mode: 'choice', n: 1 },
          sent(s1, { n: 4 }), { t: 'sent', pat: ['thatis', 'once'], n: 2 }, { t: 'vocab', what: 'n', mode: 'type', n: 2 }] },
        { id: 'mat', title: 'Grøt til nissen', en: 'Food and drink', tip: 'gender', n: ['eple', 'brød', 'ost', 'fisk', 'grøt', 'melk', 'vann', 'egg', 'kake'], v: ['spise', 'drikke', 'like'], recipe: [
          { t: 'vocab', what: 'n', mode: 'choice', n: 3 }, { t: 'vocab', what: 'v', mode: 'choice', n: 2 }, { t: 'gender', n: 3 }, { t: 'match', what: 'vocab', n: 1 },
          sent(s1, { n: 5 }), { t: 'vocab', what: 'n', mode: 'type', n: 2 }] }
      ]
    },
    {
      id: 'skog', title: 'Skogen', en: 'The Forest', host: 'huldra', color: 'green',
      blurb: 'Hulda the huldra knows every tree. In her forest “the” is not a word, it is an ending.',
      lessons: [
        { id: 'en', title: 'Skogen', en: 'The -en ending', tip: 'definite', n: ['skog', 'bjørn', 'ulv', 'rev', 'fugl', 'elg', 'stein', 'vei'], v: ['finne'], recipe: [
          { t: 'vocab', what: 'n', mode: 'choice', n: 3 }, { t: 'nform', forms: ['ds'], mode: 'choice', n: 3 }, { t: 'match', what: 'nform', forms: ['ds', 'is'], n: 1 },
          { t: 'nform', forms: ['ds'], n: 3 }, sent(s2, { n: 4 })] },
        { id: 'a', title: 'Hytta', en: 'The -a ending', tip: 'definite', n: ['hytte', 'bok', 'dør', 'seng', 'sol', 'øy', 'elv', 'bru'], v: ['lese'],
          focusExtra: ['jente', 'ku', 'geit', 'kake'], recipe: [
          { t: 'vocab', what: 'n', mode: 'choice', n: 3 }, { t: 'gender', n: 2 }, { t: 'nform', forms: ['ds'], mode: 'choice', n: 3 },
          { t: 'nform', forms: ['ds'], n: 3 }, sent(s2, { n: 4 })] },
        { id: 'et', title: 'Fjellet', en: 'The -et ending', tip: 'definite', n: ['tre', 'bær', 'fjell', 'tjern', 'eventyr', 'brev', 'bord', 'vindu'], v: ['bo'],
          focusExtra: ['hus', 'troll', 'barn', 'eple', 'egg', 'fjøs'], recipe: [
          { t: 'vocab', what: 'n', mode: 'choice', n: 3 }, { t: 'gender', n: 2 }, { t: 'nform', forms: ['ds'], mode: 'choice', n: 3 },
          { t: 'nform', forms: ['ds'], n: 3 }, sent(s2b, { n: 4 })] },
        { id: 'bestemt', title: 'En, a eller et?', en: 'Definite review', tip: 'definite', review: 'unit', recipe: [
          { t: 'gender', n: 2 }, { t: 'nform', forms: ['ds'], mode: 'gap', n: 3 }, { t: 'nform', forms: ['ds'], mode: 'type', n: 3 },
          { t: 'match', what: 'nform', forms: ['ds', 'is'], n: 1 }, sent(s2b, { n: 3, dir: 'en-no' }), sent(s2b, { n: 2 })] }
      ]
    },
    {
      id: 'bru', title: 'Brua', en: 'The Bridge', host: 'bukk', color: 'amber',
      blurb: 'Trip, trap, trip, trap! The three Billy Goats Bruse count everything that crosses their bridge.',
      lessons: [
        { id: 'er', title: 'Tre bukker', en: 'Plural -er', tip: 'plural', n: ['bukk', 'venn', 'dag', 'blomst', 'foss', 'nese', 'hale'],
          focusExtra: ['hest', 'hund', 'katt', 'geit', 'ku', 'fugl', 'bjørn', 'stein', 'hytte', 'dør', 'jente', 'gutt', 'elv', 'ulv'], recipe: [
          { t: 'vocab', what: 'n', mode: 'choice', n: 2 }, { t: 'nform', forms: ['ip'], mode: 'choice', n: 3 }, { t: 'nform', forms: ['ip'], mode: 'gap', n: 3 },
          { t: 'match', what: 'nform', forms: ['ip', 'ds'], n: 1 }, { t: 'nform', forms: ['ip'], mode: 'type', n: 2 }, sent(s3, { n: 4 })] },
        { id: 'tohus', title: 'To troll', en: 'Et-words that do not change', tip: 'plural', n: ['slott', 'sverd', 'kart', 'lys', 'år', 'hode', 'øre', 'hjerte', 'reinsdyr'],
          focusExtra: ['troll', 'hus', 'fjell', 'barn', 'egg', 'bær', 'brev', 'bord', 'eple', 'vindu', 'tjern', 'eventyr'], recipe: [
          { t: 'vocab', what: 'n', mode: 'choice', n: 2 }, { t: 'nform', forms: ['ip'], mode: 'choice', n: 3 }, { t: 'nform', forms: ['ip'], mode: 'gap', n: 3 },
          { t: 'match', what: 'nform', forms: ['ip', 'ds'], n: 1 }, { t: 'nform', forms: ['ip'], mode: 'type', n: 2 }, sent(s3, { n: 4 })] },
        { id: 'folk', title: 'Folk', en: 'People and -ere', tip: 'plural', n: ['konge', 'dronning', 'prins', 'prinsesse', 'lærer', 'fisker', 'jeger', 'heks', 'viking'], v: ['møte', 'kjenne'], recipe: [
          { t: 'vocab', what: 'n', mode: 'choice', n: 3 }, { t: 'gender', n: 2 }, { t: 'nform', forms: ['ip'], mode: 'choice', n: 3 },
          { t: 'nform', forms: ['ip', 'ds'], n: 3 }, sent(s3, { n: 3 }), sent(s2, { n: 2 })] },
        { id: 'boker', title: 'Bøker og menn', en: 'Irregular plurals', tip: 'irregular', n: ['bror', 'søster', 'far', 'mor', 'bonde', 'natt', 'hånd', 'fot', 'tann', 'øye', 'mus'],
          focusExtra: ['bok', 'mann', 'tre'], recipe: [
          { t: 'vocab', what: 'n', mode: 'choice', n: 3 }, { t: 'nform', forms: ['ip'], mode: 'choice', n: 4 }, { t: 'match', what: 'nform', forms: ['ip'], n: 1 },
          { t: 'nform', forms: ['ip'], mode: 'gap', n: 3 }, { t: 'nform', forms: ['ip'], mode: 'type', n: 4 }] }
      ]
    },
    {
      id: 'fjell', title: 'Fjellet', en: 'The Mountain', host: 'troll', color: 'stone',
      blurb: 'Brumle’s mountain cousins hoard all the things. All the swords, all the keys, all the goats.',
      lessons: [
        { id: 'ene', title: 'Trollene', en: 'Plural -ene', tip: 'defplural', n: ['skatt', 'ring', 'drage', 'kjempe', 'dverg', 'hule'], v: ['eie', 'stjele'], review: 'regular', recipe: [
          { t: 'vocab', what: 'n', mode: 'choice', n: 2 }, { t: 'nform', forms: ['dp'], mode: 'choice', n: 3 }, { t: 'nform', forms: ['dp'], mode: 'gap', n: 3 },
          { t: 'match', what: 'nform', forms: ['dp', 'ip'], n: 1 }, { t: 'nform', forms: ['dp'], mode: 'type', n: 2 }, sent(s4, { n: 4 })] },
        { id: 'barna', title: 'Barna og bøkene', en: 'Tricky -ene', tip: 'defplural', n: ['nøkkel'],
          focusExtra: ['barn', 'mann', 'bok', 'bror', 'søster', 'tre', 'lærer', 'fisker', 'jeger', 'bonde', 'fot', 'hånd', 'øye', 'tann', 'natt', 'far', 'mor'], recipe: [
          { t: 'nform', forms: ['dp'], mode: 'choice', n: 4 }, { t: 'match', what: 'nform', forms: ['dp', 'ip'], n: 1 }, { t: 'nform', forms: ['dp'], mode: 'gap', n: 3 },
          { t: 'nform', forms: ['dp', 'ip'], mode: 'type', n: 4 }, sent(s4, { n: 3 })] },
        { id: 'fire', title: 'Alle fire', en: 'All four forms', tip: 'fourforms', n: ['båt', 'kniv', 'øks', 'lue', 'sekk', 'stol'], v: ['kjøpe', 'bære'], review: 'all', recipe: [
          { t: 'vocab', what: 'n', mode: 'choice', n: 2 }, { t: 'ntable', n: 2 }, { t: 'nform', forms: ['ds', 'ip', 'dp'], mode: 'read', n: 2 },
          { t: 'nform', forms: ['ds', 'ip', 'dp'], n: 4 }, { t: 'ntable', n: 1 }, sent(s4b, { n: 4 })] },
        { id: 'former', title: 'Trollskatten', en: 'Endings review', tip: 'fourforms', review: 'all', recipe: [
          { t: 'nform', forms: ['ds', 'ip', 'dp'], mode: 'gap', n: 3 }, { t: 'ntable', n: 2 }, { t: 'match', what: 'nform', n: 1 },
          { t: 'nform', forms: ['ds', 'ip', 'dp'], mode: 'type', n: 3 }, sent(s4b, { n: 3, dir: 'en-no' }), sent(s4b, { n: 2 })] }
      ]
    },
    {
      id: 'tjern', title: 'Tjernet', en: 'The Tarn', host: 'nokk', color: 'teal',
      blurb: 'Nøkken watches from under the water lilies. Say his sentences in the right order or he pulls you in.',
      lessons: [
        { id: 'presens', title: 'Nå', en: 'Present tense', tip: 'present', n: ['innsjø', 'hav', 'fjord', 'dal', 'by'], v: ['snakke', 'sove', 'synge', 'danse', 'svømme', 'fiske', 'vente', 'være'], recipe: [
          { t: 'vocab', what: 'v', mode: 'choice', n: 4 }, { t: 'match', what: 'vocab', n: 1 }, { t: 'vform', forms: ['pres'], mode: 'choice', n: 2 },
          { t: 'vform', forms: ['pres'], mode: 'gap', n: 3 }, sent(s5, { n: 5 })] },
        { id: 'ikke', title: 'Ikke', en: 'Saying no', tip: 'ikke', n: ['sang', 'fele', 'suppe', 'kaffe'], v: ['høre', 'lage', 'hjelpe', 'spille', 'koke', 'jobbe', 'elske', 'huske'], recipe: [
          { t: 'vocab', mode: 'choice', n: 3 }, { t: 'vform', forms: ['pres'], mode: 'gap', n: 2 },
          sent(s5, { neg: 1, input: 'bank', n: 3 }), sent(s5, { neg: 1, dir: 'en-no', n: 3 }), sent(s5, { neg: 0.5, n: 3 })] },
        { id: 'spor', title: 'Spørsmål', en: 'Questions', tip: 'questions', n: ['måne', 'stjerne', 'bål'], v: ['komme', 'gå', 'løpe', 'leke', 'sitte', 'stå'], recipe: [
          { t: 'vocab', mode: 'choice', n: 3 }, { t: 'vform', forms: ['pres'], mode: 'gap', n: 2 },
          sent(s5, { q: 1, input: 'bank', pat: ['svo', 'place', 'to'], n: 3 }), sent(s5, { q: 1, dir: 'en-no', pat: ['svo', 'place', 'to'], n: 3 }),
          sent(s5, { pat: ['where'], nf: ['ds', 'dp'], n: 1 }), sent(s5, { q: 0.5, neg: 0.3, pat: ['svo', 'place', 'to'], n: 2 })] },
        { id: 'v2', title: 'Verbet på plass to', en: 'Verb-second word order', tip: 'v2', n: ['mat'], v: ['lære', 'reise', 'kjøre', 'tenke'], recipe: [
          { t: 'vocab', what: 'v', mode: 'choice', n: 2 }, sent(s5, { front: 1, input: 'bank', pat: ['svo', 'place', 'to', 'bare'], n: 4 }),
          sent(s5, { front: 1, dir: 'en-no', pat: ['svo', 'place', 'to', 'bare'], n: 4 }), sent(s5, { front: 0.6, q: 0.2, neg: 0.2, pat: ['svo', 'place', 'to'], n: 3 })] }
      ]
    },
    {
      id: 'foss', title: 'Fossen', en: 'The Waterfall', host: 'grim', color: 'blue',
      blurb: 'Fossegrimen plays the old tunes. Everything in his songs has already happened.',
      lessons: [
        { id: 'pastet', title: 'I går danset vi', en: 'Past in -et', tip: 'past1', n: ['multe', 'potet'], v: ['hoppe', 'kaste', 'vaske', 'hente', 'åpne', 'lukke', 'miste', 'jage', 'fange', 'plukke', 'tegne', 'hviske'],
          focusExtra: ['snakke', 'danse', 'vente', 'fiske', 'lage', 'jobbe'], recipe: [
          { t: 'vocab', what: 'v', mode: 'choice', n: 3 }, { t: 'vform', forms: ['past'], mode: 'choice', n: 3 }, { t: 'match', what: 'vform', forms: ['past', 'pres'], n: 1 },
          { t: 'vform', forms: ['past'], mode: 'gap', n: 3 }, { t: 'vform', forms: ['past'], mode: 'type', n: 2 }, sent(s6, { n: 3 })] },
        { id: 'pastte', title: 'Hun spiste', en: 'Past in -te', tip: 'past2', v: ['bruke', 'smake', 'glemme', 'begynne', 'rope', 'drømme', 'gjemme', 'bake', 'male', 'låse', 'trenge', 'vise', 'lete'],
          focusExtra: ['spise', 'kjøpe', 'lese', 'høre', 'kjøre', 'lære', 'like', 'reise', 'leke', 'møte', 'spille', 'koke', 'kjenne', 'svømme'], recipe: [
          { t: 'vocab', what: 'v', mode: 'choice', n: 3 }, { t: 'vform', forms: ['past'], mode: 'choice', n: 3 }, { t: 'match', what: 'vform', forms: ['past', 'pres'], n: 1 },
          { t: 'vform', forms: ['past'], mode: 'gap', n: 3 }, { t: 'vform', forms: ['past'], mode: 'type', n: 2 }, sent(s6, { n: 3 })] },
        { id: 'pastde', title: 'Trollet bodde', en: 'Past in -de and -dde', tip: 'past3', v: ['leve', 'prøve', 'bygge', 'tro', 'nå', 'ro', 'snu'], focusExtra: ['bo', 'eie'], recipe: [
          { t: 'vocab', what: 'v', mode: 'choice', n: 3 }, { t: 'vform', forms: ['past'], mode: 'choice', n: 3 }, { t: 'vform', forms: ['past'], mode: 'gap', n: 3 },
          { t: 'vform', forms: ['past'], mode: 'type', n: 3 }, sent(s7, { n: 3 })] },
        { id: 'igar', title: 'Det var en gang', en: 'Weak past review', tip: 'past3', review: 'weak', recipe: [
          { t: 'vform', forms: ['past'], mode: 'gap', n: 3 }, { t: 'match', what: 'vform', forms: ['past', 'pres'], n: 1 }, { t: 'vform', forms: ['past'], mode: 'type', n: 3 },
          sent(s7, { front: 0.6, dir: 'en-no', n: 4 }), sent(s7, { neg: 0.3, q: 0.3, n: 2 })] }
      ]
    },
    {
      id: 'hav', title: 'Havet', en: 'The Sea', host: 'draug', color: 'sea',
      blurb: 'Draugen rows half a boat through the storm. Strong verbs follow no rules, so he makes you remember them.',
      lessons: [
        { id: 'sterk1', title: 'Var, hadde, gikk', en: 'Strong verbs 1', tip: 'strong', v: ['si', 'gjøre', 'få', 'ta', 'gi', 'vite'], focusExtra: ['være', 'ha', 'gå', 'komme', 'se'], recipe: [
          { t: 'vocab', what: 'v', mode: 'choice', n: 3 }, { t: 'vform', forms: ['past'], mode: 'choice', n: 4 }, { t: 'match', what: 'vform', forms: ['past', 'pres'], n: 1 },
          { t: 'vform', forms: ['past'], mode: 'gap', n: 3 }, { t: 'vform', forms: ['past'], mode: 'type', n: 3 }, sent(s7, { n: 2 })] },
        { id: 'sterk2', title: 'Drakk, fant, skrev', en: 'Strong verbs 2', tip: 'strong', n: ['brev'], v: ['skrive', 'ligge', 'bli', 'selge', 'velge', 'holde', 'fortelle', 'spørre', 'legge', 'sette'],
          focusExtra: ['drikke', 'finne', 'synge', 'sove', 'sitte', 'stå', 'løpe'], recipe: [
          { t: 'vocab', what: 'v', mode: 'choice', n: 3 }, { t: 'vform', forms: ['past'], mode: 'choice', n: 4 }, { t: 'match', what: 'vform', forms: ['past', 'pres'], n: 1 },
          { t: 'vform', forms: ['past'], mode: 'gap', n: 3 }, { t: 'vform', forms: ['past'], mode: 'type', n: 3 }, sent(s7, { n: 2 })] },
        { id: 'sterk3', title: 'Fløy, stjal, forsvant', en: 'Strong verbs 3', tip: 'strong', n: ['ørn', 'ravn', 'gull'], v: ['dra', 'fly', 'le', 'falle', 'forsvinne', 'vinne', 'gråte', 'ri', 'treffe', 'forstå'],
          focusExtra: ['hjelpe', 'bære', 'stjele'], recipe: [
          { t: 'vocab', what: 'v', mode: 'choice', n: 3 }, { t: 'vform', forms: ['past'], mode: 'choice', n: 4 }, { t: 'match', what: 'vform', forms: ['past', 'pres'], n: 1 },
          { t: 'vform', forms: ['past'], mode: 'gap', n: 3 }, { t: 'vform', forms: ['past'], mode: 'type', n: 3 }, sent(s7, { n: 2 })] },
        { id: 'perfektum', title: 'Har gjort', en: 'The perfect', tip: 'perfect', review: 'verbs', recipe: [
          { t: 'vform', forms: ['pp'], mode: 'choice', n: 3 }, { t: 'vform', forms: ['pp'], mode: 'gap', n: 3 }, { t: 'match', what: 'vform', forms: ['pp', 'past'], n: 1 },
          { t: 'vtable', n: 2 }, { t: 'vform', forms: ['pp'], mode: 'type', n: 2 }, sent(s7, { tense: ['perf'], n: 4 })] },
        { id: 'treformer', title: 'Tre former', en: 'Verb review', tip: 'perfect', review: 'verbs', recipe: [
          { t: 'vtable', n: 3 }, { t: 'vform', forms: ['pres', 'past', 'pp'], mode: 'read', n: 2 }, { t: 'vform', forms: ['past', 'pp'], mode: 'gap', n: 3 },
          { t: 'vform', forms: ['past', 'pp'], mode: 'type', n: 3 }, sent(s7, { tense: ['past', 'perf', 'pres'], neg: 0.2, q: 0.2, n: 4 })] }
      ]
    },
    {
      id: 'soria', title: 'Soria Moria', en: 'The Golden Castle', host: 'bjorn', color: 'gold',
      blurb: 'East of the sun and west of the moon, Kvitebjørn keeps the castle. The last gates open with the finest grammar.',
      lessons: [
        { id: 'modal', title: 'Kan, vil, må, skal', en: 'Helper verbs', tip: 'modal', v: ['kunne', 'ville', 'måtte', 'skulle'], review: 'verbs', recipe: [
          { t: 'vform', forms: ['pres'], verbs: ['kunne', 'ville', 'måtte', 'skulle'], mode: 'choice', n: 3 }, { t: 'vform', forms: ['inf'], mode: 'gap', n: 3 },
          sent(s5, { modal: ['kan', 'vil', 'må', 'skal'], modalP: 1, input: 'bank', pat: ['svo', 'place', 'to'], n: 3 }),
          sent(s5, { modal: ['kan', 'vil', 'må', 'skal'], modalP: 1, dir: 'en-no', pat: ['svo', 'place', 'to'], n: 3 }),
          sent(s5, { modal: ['kan', 'vil', 'må', 'skal'], modalP: 1, neg: 0.3, q: 0.3, front: 0.3, pat: ['svo', 'place', 'to'], n: 3 })] },
        { id: 'imperativ', title: 'Kom!', en: 'Commands', tip: 'imperative', review: 'verbs', recipe: [
          { t: 'vform', forms: ['imp'], mode: 'choice', n: 4 }, { t: 'vform', forms: ['imp'], mode: 'gap', n: 3 }, { t: 'vform', forms: ['imp'], mode: 'type', n: 3 },
          { t: 'sent', pat: ['imp'], dir: 'en-no', n: 3 }, { t: 'sent', pat: ['imp'], n: 2 }] },
        { id: 'min', title: 'Hesten min', en: 'My, your, our', tip: 'poss', review: 'all', recipe: [
          { t: 'poss', mode: 'choice', n: 5 }, { t: 'poss', mode: 'type', n: 4 },
          sent(s4b, { poss: 1, nf: ['ds', 'dp'], pat: ['svo', 'where'], n: 4 })] },
        { id: 'stor', title: 'Et stort troll', en: 'Adjectives agree', tip: 'adj', a: ADJ1, review: 'all', recipe: [
          { t: 'adj', frames: ['attr'], mode: 'choice', n: 4 }, { t: 'adj', frames: ['pred'], mode: 'choice', n: 3 }, { t: 'adj', frames: ['attr', 'pred'], mode: 'type', n: 3 },
          sent(s4b, { pat: ['isadj'], nf: ['ds', 'dp'], n: 2 }), sent(s4b, { adj: 1, nf: ['is', 'ip'], pat: ['svo', 'once'], n: 3 })] },
        { id: 'denstore', title: 'Det store slottet', en: 'The big castle', tip: 'doubledef', a: ADJ2, review: 'all', recipe: [
          { t: 'adj', frames: ['def'], mode: 'choice', n: 4 }, { t: 'adj', frames: ['def'], mode: 'type', n: 3 }, { t: 'adj', n: 2 },
          sent(s4b, { adj: 1, nf: ['ds', 'dp'], pat: ['svo'], n: 3 }), sent(s4b, { adj: 0.7, pat: ['svo', 'isadj', 'once'], tense: ['pres', 'past'], n: 3 })] }
      ]
    }
  ];

  // ---------- grammar notes ----------
  S.TIPS = {
    hei: { title: 'First words', body: [
      'Norwegian is a close cousin of English, so plenty will look familiar: <b>god morgen</b>, <b>velkommen</b>, <b>takk</b>.',
      'Three letters are new. <b>Æ</b> sounds like the a in “cat”, <b>Ø</b> like the i in “bird”, <b>Å</b> like the o in “more”. The keys sit under every answer box.',
      'Verbs never change with the person: <b>jeg er</b>, <b>du er</b>, <b>vi er</b>. One form for everyone.'] },
    gender: { title: 'En, ei, et', body: [
      'Every noun has a gender, and you learn it together with the word, like a first name.',
      'Bokmål lets you treat every ei-word as an en-word, so <b>ei jente</b> and <b>en jente</b> are both right. Sproke shows ei by default; you can switch this in Settings.'],
      table: [['en', 'masculine', 'en gutt, en hest'], ['ei', 'feminine', 'ei jente, ei ku'], ['et', 'neuter', 'et barn, et hus']] },
    definite: { title: '“The” is an ending', body: [
      'Norwegian has no separate word for “the”. It glues the article onto the end of the noun instead.',
      'The ending is simply the article turned around: <b>en</b> hest → hest<b>en</b>, <b>et</b> hus → hus<b>et</b>. Ei-words take <b>-a</b>.',
      'If the noun already ends in -e, do not double it: jente → jent<b>a</b>, eple → eple<b>t</b>.'],
      table: [['en hest', 'hesten', 'the horse'], ['ei bok', 'boka', 'the book'], ['et hus', 'huset', 'the house']] },
    plural: { title: 'More than one', body: [
      'Most nouns add <b>-er</b>: hest → hest<b>er</b>, jente → jent<b>er</b>.',
      'One-syllable et-words do not change at all: et hus → to <b>hus</b>, et troll → tre <b>troll</b>.',
      'People who do something, ending in -er, add just <b>-e</b>: en lærer → to lærer<b>e</b>.'],
      table: [['en bukk', 'tre bukker', 'three billy goats'], ['et troll', 'tre troll', 'three trolls'], ['et eple', 'tre epler', 'three apples'], ['en fisker', 'tre fiskere', 'three fishermen']] },
    irregular: { title: 'Plurals that change the vowel', body: [
      'A handful of very old, very common words change their vowel, the way “man” becomes “men” in English.',
      'There is no rule to apply. Learn them as pairs and they stay with you.'],
      table: [['en mann', 'menn', 'men'], ['ei bok', 'bøker', 'books'], ['en fot', 'føtter', 'feet'], ['ei hånd', 'hender', 'hands'], ['en bror', 'brødre', 'brothers'], ['et tre', 'trær', 'trees']] },
    defplural: { title: 'The …s: -ene', body: [
      'For “the horses” nearly every noun takes <b>-ene</b>, whatever its gender: hest<b>ene</b>, bøk<b>ene</b>, hus<b>ene</b>.',
      'Irregular plurals keep their changed vowel: menn → menn<b>ene</b>, bøker → bøk<b>ene</b>.',
      'Two things to watch: -er people take <b>-ne</b> (lærer<b>ne</b>), and <b>barna</b> is its own special case.'],
      table: [['hester', 'hestene', 'the horses'], ['troll', 'trollene', 'the trolls'], ['lærere', 'lærerne', 'the teachers'], ['barn', 'barna', 'the children']] },
    fourforms: { title: 'The four forms', body: [
      'Every noun now has four forms. Reciting them as a chant is how Norwegian children learn them too.',
      'Say it out loud: <b>en hest, hesten, hester, hestene</b>.'],
      table: [['en hest', 'hesten', 'hester', 'hestene'], ['ei bok', 'boka', 'bøker', 'bøkene'], ['et hus', 'huset', 'hus', 'husene'], ['et eple', 'eplet', 'epler', 'eplene']] },
    present: { title: 'Present tense', body: [
      'Take the infinitive and add <b>-r</b>. That is the whole present tense: å spise → spise<b>r</b>.',
      'It never changes with the person, and it covers both “eats” and “is eating”.'],
      table: [['jeg spiser', 'I eat / I am eating'], ['trollet spiser', 'the troll eats'], ['vi spiser', 'we eat']] },
    ikke: { title: 'Ikke', body: [
      '<b>Ikke</b> means “not”, and it goes straight after the verb. There is no “do” or “does” to add.',
      'Trollet sover <b>ikke</b>: the troll does not sleep.'],
      table: [['Jeg spiser ikke fisk.', 'I do not eat fish.'], ['Hun bor ikke her.', 'She does not live here.']] },
    questions: { title: 'Questions', body: [
      'To ask a yes/no question, swap the subject and the verb. Again, no “do”.',
      'Trollet sover. → <b>Sover trollet?</b>'],
      table: [['Du snakker norsk.', 'You speak Norwegian.'], ['Snakker du norsk?', 'Do you speak Norwegian?'], ['Hvor bor du?', 'Where do you live?']] },
    v2: { title: 'The verb comes second', body: [
      'In a Norwegian statement the verb is always the second element. If the sentence opens with a time or a place, the subject has to move behind the verb.',
      'I dag <b>spiser</b> trollet fisk. Never “I dag trollet spiser”.'],
      table: [['Trollet spiser fisk i dag.', 'subject first'], ['I dag spiser trollet fisk.', 'time first, verb still second']] },
    past1: { title: 'Past tense, group 1', body: [
      'Norwegian has four groups of regular verbs. The biggest group adds <b>-et</b> for the past.',
      'Verbs whose stem ends in two consonants usually belong here: snakke, vente, hoppe.'],
      table: [['å snakke', 'snakket', 'har snakket'], ['å vente', 'ventet', 'har ventet'], ['å kaste', 'kastet', 'har kastet']] },
    past2: { title: 'Past tense, group 2', body: [
      'Group 2 adds <b>-te</b> in the past and <b>-t</b> after har.',
      'Verbs whose stem ends in a single consonant usually belong here: spise, kjøpe, lese. A doubled consonant shrinks to one: glemme → glem<b>te</b>.'],
      table: [['å spise', 'spiste', 'har spist'], ['å kjøpe', 'kjøpte', 'har kjøpt'], ['å glemme', 'glemte', 'har glemt']] },
    past3: { title: 'Past tense, groups 3 and 4', body: [
      'Group 3 adds <b>-de</b>: stems ending in v, g or a diphthong such as ei. Leve → lev<b>de</b>, bygge → byg<b>de</b>.',
      'Group 4 is the short verbs that end in a stressed vowel. They add <b>-dde</b>: bo → bo<b>dde</b>.'],
      table: [['å leve', 'levde', 'har levd'], ['å prøve', 'prøvde', 'har prøvd'], ['å bo', 'bodde', 'har bodd'], ['å tro', 'trodde', 'har trodd']] },
    strong: { title: 'Strong verbs', body: [
      'Strong verbs change their vowel and take no ending in the past, exactly like sing, sang, sung.',
      'They are the most common verbs in the language, so they come up constantly. Learn each one as a chain of three.'],
      table: [['å være', 'var', 'har vært'], ['å gå', 'gikk', 'har gått'], ['å drikke', 'drakk', 'har drukket'], ['å finne', 'fant', 'har funnet'], ['å se', 'så', 'har sett']] },
    perfect: { title: 'Har + participle', body: [
      'The perfect is built like English: <b>har</b> plus the participle. Har never changes.',
      'Regular verbs form it from their group: -et, -t, -d or -dd. Strong verbs have their own form, most often ending in -et or -tt.'],
      table: [['Jeg har spist.', 'I have eaten.'], ['Hun har bodd her.', 'She has lived here.'], ['Vi har funnet skatten.', 'We have found the treasure.']] },
    modal: { title: 'Kan, vil, må, skal', body: [
      'Helper verbs are followed by the plain infinitive, without å.',
      'Careful with <b>vil</b>: it means “wants to”. The usual way to talk about the future is <b>skal</b>.'],
      table: [['kan', 'can', 'Jeg kan svømme.'], ['vil', 'wants to', 'Hun vil sove.'], ['må', 'must', 'Vi må gå.'], ['skal', 'is going to', 'De skal reise.']] },
    imperative: { title: 'Commands', body: [
      'To tell someone what to do, drop the final -e from the infinitive: å spise → <b>Spis!</b>',
      'Short verbs stay as they are: <b>Gå! Se!</b> A double m loses one: komme → <b>Kom!</b>'],
      table: [['å vente', 'Vent!', 'Wait!'], ['å komme', 'Kom!', 'Come!'], ['å gå', 'Gå!', 'Go!']] },
    poss: { title: 'Min, mi, mitt, mine', body: [
      'The usual order is the opposite of English: the noun first, in its definite form, then the owner. <b>Hesten min</b> is literally “the horse mine”.',
      'The owner word agrees with the thing owned. <b>Hans</b> (his) and <b>hennes</b> (her) never change.'],
      table: [['en hest', 'hesten min', 'my horse'], ['ei bok', 'boka mi', 'my book'], ['et hus', 'huset mitt', 'my house'], ['hester', 'hestene mine', 'my horses']] },
    adj: { title: 'Adjectives agree', body: [
      'An adjective takes its shape from the noun: nothing for en- and ei-words, <b>-t</b> for et-words, <b>-e</b> for plurals.',
      '<b>Liten</b> goes its own way: en liten gutt, ei lita jente, et lite hus, små barn.'],
      table: [['en stor hest', 'a big horse'], ['et stort troll', 'a big troll'], ['store hester', 'big horses'], ['Trollet er stort.', 'The troll is big.']] },
    doubledef: { title: 'Den store hesten', body: [
      'To say “the big horse” Norwegian marks definiteness twice: a word in front (<b>den, det, de</b>) and the usual ending on the noun.',
      'The adjective in between always takes <b>-e</b>. Liten becomes <b>lille</b>, and in the plural <b>små</b>.'],
      table: [['den store hesten', 'the big horse'], ['det store trollet', 'the big troll'], ['de store hestene', 'the big horses'], ['det lille huset', 'the little house']] }
  };

  // ---------- lookups ----------
  S.lessons = [];
  S.lessonById = {};
  S.UNITS.forEach(function (u, ui) {
    u.index = ui;
    u.lessons.forEach(function (l, li) {
      l.unit = u; l.index = S.lessons.length; l.key = u.id + '.' + l.id; l.pos = li;
      S.lessons.push(l); S.lessonById[l.key] = l;
    });
  });

  var BASE_SUBJECTS = ['gutt', 'jente', 'troll', 'nisse'];
  function regular(id) { var x = S.nouns[id].x; return !x.ip && !x.dp && !x.ds && !x.agent && !x.mass; }

  /** Words known after finishing every lesson up to and including this one. */
  S.knownAt = function (lesson) {
    var n = [], v = [], a = [];
    for (var i = 0; i <= lesson.index; i++) {
      var l = S.lessons[i];
      n = n.concat(l.n || []); v = v.concat(l.v || []); a = a.concat(l.a || []);
    }
    return { nouns: S.uniq(n), verbs: S.uniq(v), adjs: S.uniq(a) };
  };
  var HARDNESS = [0.3, 0.55, 0.8, 1];

  /** Generator context for a lesson at the given crown level (0-3). */
  S.lessonContext = function (lesson, level) {
    var k = S.knownAt(lesson);
    var nouns = S.uniq(k.nouns.concat(BASE_SUBJECTS)), verbs = k.verbs, focusN, focusV;
    var unitN = [], unitV = [];
    lesson.unit.lessons.forEach(function (l) { if (l.index <= lesson.index) { unitN = unitN.concat(l.n || [], l.focusExtra || []); unitV = unitV.concat(l.v || []); } });
    focusN = (lesson.n || []).concat((lesson.focusExtra || []).filter(function (x) { return S.nouns[x]; }));
    focusV = (lesson.v || []).concat((lesson.focusExtra || []).filter(function (x) { return S.verbs[x]; }));
    if (lesson.review === 'unit') focusN = unitN.filter(function (x) { return S.nouns[x]; });
    if (lesson.review === 'regular') focusN = focusN.concat(nouns.filter(regular));
    if (lesson.review === 'all') focusN = focusN.concat(nouns.filter(function (x) { return !S.nouns[x].mass; }));
    if (lesson.review === 'weak') focusV = verbs.filter(function (x) { return S.verbs[x].cls !== 's'; });
    if (lesson.review === 'verbs') focusV = focusV.concat(verbs.filter(function (x) { return !S.verbs[x].x.modal; }));
    if (!focusN.length) focusN = nouns.filter(function (x) { return !S.nouns[x].mass; });
    if (!focusV.length) focusV = verbs.filter(function (x) { return !S.verbs[x].x.modal; });
    return {
      nouns: nouns, verbs: verbs, adjs: k.adjs.length ? k.adjs : null,
      focusN: S.uniq(focusN), focusV: S.uniq(focusV), hard: HARDNESS[Math.min(level || 0, 3)]
    };
  };

  S.buildLesson = function (lesson, level, ctxExtra) {
    var ctx = S.lessonContext(lesson, level);
    if (ctxExtra) for (var k in ctxExtra) ctx[k] = ctxExtra[k];
    return S.buildSession(lesson.recipe, ctx);
  };

  // ---------- free practice ----------
  S.PRACTICE = {
    nouns: {
      title: 'Endelser', en: 'Noun endings', host: 'huldra', color: 'green',
      blurb: '-en, -a, -et, -er, -ene. Pick the forms you want and drill them until they stop tripping you up.',
      options: [{ id: 'forms', label: 'Forms', multi: true, values: [['ds', '-en / -a / -et'], ['ip', '-er'], ['dp', '-ene'], ['g', 'en / ei / et']], def: ['ds', 'ip', 'dp'] }],
      recipe: function (o) {
        var forms = o.forms.filter(function (f) { return f !== 'g'; }), r = [];
        if (forms.length) {
          r.push({ t: 'nform', forms: forms, n: 9 }, { t: 'nform', forms: forms, mode: 'gap', n: 3 }, { t: 'match', what: 'nform', forms: forms.length > 1 ? forms : forms.concat('is'), n: 1 });
          if (forms.length === 3) r.push({ t: 'ntable', n: 2 });
        }
        if (o.forms.indexOf('g') >= 0) r.push({ t: 'gender', n: forms.length ? 3 : 12 }, { t: 'vocab', what: 'n', mode: 'type', n: forms.length ? 1 : 3 });
        return r;
      }
    },
    verbs: {
      title: 'Verb', en: 'Verb forms', host: 'grim', color: 'blue',
      blurb: 'Present, past and perfect, for regular and strong verbs. The table rounds make you produce all three at once.',
      options: [
        { id: 'forms', label: 'Forms', multi: true, values: [['pres', 'presens'], ['past', 'preteritum'], ['pp', 'perfektum'], ['imp', 'imperativ']], def: ['pres', 'past', 'pp'] },
        { id: 'group', label: 'Verbs', values: [['all', 'All'], ['weak', 'Regular'], ['strong', 'Strong']], def: 'all' }],
      recipe: function (o) {
        var forms = o.forms, r = [{ t: 'vform', forms: forms, n: 8 }, { t: 'vform', forms: forms, mode: 'gap', n: 4 }];
        var core = forms.filter(function (f) { return f !== 'imp'; });
        if (core.length > 1) r.push({ t: 'match', what: 'vform', forms: core, n: 1 });
        if (core.length === 3) r.push({ t: 'vtable', n: 2 });
        return r;
      },
      filter: function (o, ctx) {
        if (o.group === 'all') return;
        var keep = function (id) { return (S.verbs[id].cls === 's') === (o.group === 'strong'); };
        ctx.focusV = ctx.verbs.filter(keep);
      }
    },
    sentences: {
      title: 'Setninger', en: 'Translate sentences', host: 'nokk', color: 'teal',
      blurb: 'Whole sentences in both directions, assembled fresh every time so you cannot memorise them.',
      options: [
        { id: 'dir', label: 'Direction', values: [['mix', 'Both'], ['en-no', 'To Norwegian'], ['no-en', 'To English']], def: 'mix' },
        { id: 'input', label: 'Answer with', values: [['auto', 'Mixed'], ['bank', 'Word tiles'], ['type', 'Keyboard']], def: 'auto' },
        { id: 'tense', label: 'Tenses', multi: true, values: [['pres', 'Present'], ['past', 'Past'], ['perf', 'Perfect'], ['modal', 'Helper verbs']], def: ['pres', 'past', 'perf'] }],
      recipe: function (o) {
        var tenses = o.tense.filter(function (t) { return t !== 'modal'; }), modal = o.tense.indexOf('modal') >= 0;
        var base = {
          t: 'sent', dir: o.dir, input: o.input, tense: tenses.length ? tenses : ['pres'], subj: MIX,
          modal: modal ? ['kan', 'vil', 'må', 'skal'] : null, modalP: modal ? (tenses.length ? 0.3 : 1) : 0,
          nf: ['is', 'ds', 'ip', 'dp'], neg: 0.15, q: 0.15, front: 0.2, adj: 0.15, poss: 0.1
        };
        return [mix(base, { pat: ['svo'], n: 7 }), mix(base, { pat: ['place', 'to'], n: 4 }), mix(base, { pat: ['comp', 'bare', 'isadj', 'where', 'imp'], n: 3 })];
      }
    },
    phrases: {
      title: 'Fraser', en: 'Everyday phrases', host: 'nisse', color: 'red',
      blurb: 'Greetings, thanks and small talk. Short, useful, and the first thing anyone will say to you.',
      options: [{ id: 'input', label: 'Answer with', values: [['auto', 'Mixed'], ['bank', 'Word tiles'], ['type', 'Keyboard']], def: 'auto' }],
      recipe: function (o) { return [{ t: 'phrase', mode: 'write', input: o.input, n: 10 }, { t: 'phrase', mode: 'choice', n: 3 }]; }
    },
    mixed: {
      title: 'Blanding', en: 'A bit of everything', host: 'troll', color: 'stone',
      blurb: 'Endings, verb forms, adjectives and sentences shuffled together. A good daily warm-up.',
      options: [],
      recipe: function () {
        return [{ t: 'nform', n: 4 }, { t: 'vform', n: 4 }, { t: 'adj', n: 2 }, { t: 'poss', n: 1 }, { t: 'ntable', n: 1 }, { t: 'vtable', n: 1 },
          { t: 'sent', pat: ['svo', 'place', 'to', 'comp'], tense: ['pres', 'past', 'perf'], subj: MIX, nf: ['is', 'ds', 'ip', 'dp'], neg: 0.15, q: 0.15, front: 0.2, adj: 0.15, n: 5 }];
      }
    }
  };
})(globalThis.Sproke = globalThis.Sproke || {});
