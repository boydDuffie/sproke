/* Sproke — word data. Everything the course teaches lives in this file.
 *
 * Nouns:  [bokmål, gender, english, tags, overrides]
 *   gender: m (en), f (ei/en), n (et)
 *   english: synonyms separated by |, the first one is shown in prompts
 *   overrides: ds/ip/dp = definite singular, indefinite plural, definite plural
 *              agent = "-er" person noun (lærer → lærere → lærerne), mass = no plural
 * Verbs:  [infinitive, class, english, frame]
 *   class: 1 (-et) 2 (-te) 3 (-de) 4 (-dde) s (strong / irregular, forms given in frame)
 *   english: "base,past,participle,ing" — leave parts out when regular
 */
(function (S) {
  'use strict';

  S.NOUNS = [
    // people
    ['gutt', 'm', 'boy', 'person'],
    ['jente', 'f', 'girl', 'person'],
    ['mann', 'm', 'man', 'person', { ip: 'menn', dp: 'mennene' }],
    ['kvinne', 'f', 'woman', 'person'],
    ['barn', 'n', 'child|kid', 'person', { dp: 'barna', dpAlt: ['barnene'] }],
    ['venn', 'm', 'friend', 'person'],
    ['bror', 'm', 'brother', 'person', { ip: 'brødre', dp: 'brødrene' }],
    ['søster', 'f', 'sister', 'person', { ip: 'søstre', dp: 'søstrene' }],
    ['far', 'm', 'father|dad', 'person', { ip: 'fedre', dp: 'fedrene' }],
    ['mor', 'f', 'mother|mom|mum', 'person', { ip: 'mødre', dp: 'mødrene' }],
    ['konge', 'm', 'king', 'person'],
    ['dronning', 'f', 'queen', 'person'],
    ['prins', 'm', 'prince', 'person'],
    ['prinsesse', 'f', 'princess', 'person'],
    ['bonde', 'm', 'farmer', 'person', { ip: 'bønder', dp: 'bøndene' }],
    ['fisker', 'm', 'fisherman|fisher', 'person', { agent: 1 }],
    ['lærer', 'm', 'teacher', 'person', { agent: 1 }],
    ['jeger', 'm', 'hunter', 'person', { agent: 1 }],
    ['viking', 'm', 'viking', 'person'],
    // folklore
    ['troll', 'n', 'troll', 'creature danger draw'],
    ['nisse', 'm', 'nisse|gnome|elf', 'creature draw'],
    ['heks', 'f', 'witch', 'creature danger'],
    ['kjempe', 'm', 'giant', 'creature danger'],
    ['drage', 'm', 'dragon', 'creature danger flyer draw'],
    ['dverg', 'm', 'dwarf', 'creature'],
    // animals
    ['hest', 'm', 'horse', 'animal farm sound wash strong draw color'],
    ['hund', 'm', 'dog', 'animal farm sound wash draw'],
    ['katt', 'm', 'cat', 'animal farm sound draw color'],
    ['ku', 'f', 'cow', 'animal farm sound', { ipAlt: ['kyr'], dpAlt: ['kyrne'] }],
    ['geit', 'f', 'goat', 'animal farm'],
    ['bukk', 'm', 'billy goat|goat|buck', 'animal strong'],
    ['sau', 'm', 'sheep', 'animal farm'],
    ['gris', 'm', 'pig', 'animal farm'],
    ['bjørn', 'm', 'bear', 'animal danger sound strong draw'],
    ['ulv', 'm', 'wolf', 'animal danger sound'],
    ['rev', 'm', 'fox', 'animal catch draw'],
    ['elg', 'm', 'moose|elk', 'animal draw'],
    ['fugl', 'm', 'bird', 'animal sound catch flyer draw color'],
    ['ørn', 'm', 'eagle', 'animal flyer'],
    ['ravn', 'm', 'raven', 'animal flyer'],
    ['fisk', 'm', 'fish', 'animal food catch'],
    ['mus', 'f', 'mouse', 'animal catch', { ip: 'mus' }],
    ['reinsdyr', 'n', 'reindeer', 'animal', { ip: 'reinsdyr' }],
    // food and drink
    ['eple', 'n', 'apple', 'food pick small color', { ipAlt: ['eple'] }],
    ['brød', 'n', 'bread', 'food made baked', { mass: 1 }],
    ['ost', 'm', 'cheese', 'food', { mass: 1 }],
    ['grøt', 'm', 'porridge', 'food made cook temp', { mass: 1 }],
    ['suppe', 'f', 'soup', 'food made cook temp', { mass: 1 }],
    ['kake', 'f', 'cake', 'food made baked'],
    ['egg', 'n', 'egg', 'food cook small'],
    ['bær', 'n', 'berry', 'food pick'],
    ['multe', 'f', 'cloudberry', 'food pick'],
    ['potet', 'm', 'potato', 'food cook'],
    ['mat', 'm', 'food', 'food made temp', { mass: 1 }],
    ['melk', 'f', 'milk', 'drink temp', { mass: 1 }],
    ['vann', 'n', 'water', 'drink temp', { mass: 1 }],
    ['kaffe', 'm', 'coffee', 'drink cook temp', { mass: 1 }],
    // things
    ['bok', 'f', 'book', 'obj thing readable written openable old color', { ip: 'bøker', dp: 'bøkene' }],
    ['brev', 'n', 'letter', 'obj thing readable written openable'],
    ['nøkkel', 'm', 'key', 'obj thing small tool', { ip: 'nøkler', dp: 'nøklene' }],
    ['sverd', 'n', 'sword', 'obj thing tool'],
    ['båt', 'm', 'boat', 'thing build sight wash paint old draw color'],
    ['stol', 'm', 'chair', 'obj thing wash paint color'],
    ['bord', 'n', 'table', 'thing wash paint'],
    ['seng', 'f', 'bed', 'thing'],
    ['dør', 'f', 'door', 'thing openable lock wash paint color'],
    ['vindu', 'n', 'window', 'thing openable wash'],
    ['kniv', 'm', 'knife', 'obj thing tool small wash'],
    ['øks', 'f', 'axe|ax', 'obj thing tool'],
    ['skatt', 'm', 'treasure', 'obj thing'],
    ['ring', 'm', 'ring', 'obj thing small pretty'],
    ['lue', 'f', 'hat|cap|beanie', 'obj thing small wash color pretty'],
    ['fele', 'f', 'fiddle|violin', 'obj thing instrument sound old'],
    ['sang', 'm', 'song', 'song written sound pretty long'],
    ['eventyr', 'n', 'fairy tale|fairytale|tale', 'readable written tale long', { ip: 'eventyr' }],
    ['kart', 'n', 'map', 'obj thing readable tool old'],
    ['stein', 'm', 'stone|rock', 'obj thing small'],
    ['sekk', 'm', 'sack|bag', 'obj thing openable'],
    ['lys', 'n', 'light|candle', 'obj thing sight'],
    ['blomst', 'm', 'flower', 'obj thing pick color pretty draw'],
    ['gull', 'n', 'gold', 'thing', { mass: 1 }],
    // places and nature
    ['hus', 'n', 'house', 'building build sight paint old color draw'],
    ['hytte', 'f', 'cabin|cottage', 'building build sight paint old color'],
    ['slott', 'n', 'castle|palace', 'building build sight old draw'],
    ['fjøs', 'n', 'barn', 'building'],
    ['gård', 'm', 'farm', 'place'],
    ['bru', 'f', 'bridge', 'place build sight old long'],
    ['skog', 'm', 'forest', 'place dark'],
    ['fjell', 'n', 'mountain', 'place sight draw'],
    ['fjord', 'm', 'fjord', 'place sight long pretty'],
    ['elv', 'f', 'river', 'place sight sound long'],
    ['foss', 'm', 'waterfall', 'place sight sound'],
    ['tjern', 'n', 'tarn|pond|small lake', 'place sight dark'],
    ['innsjø', 'm', 'lake', 'place'],
    ['hav', 'n', 'sea|ocean', 'place'],
    ['øy', 'f', 'island', 'place sight'],
    ['dal', 'm', 'valley', 'place pretty long'],
    ['hule', 'f', 'cave', 'place dark'],
    ['vei', 'm', 'road|way', 'place long'],
    ['by', 'm', 'town|city', 'place old'],
    ['tre', 'n', 'tree', 'nature sight old draw', { ds: 'treet', ip: 'trær', dp: 'trærne' }],
    ['bål', 'n', 'bonfire|campfire|fire', 'nature sight'],
    ['stjerne', 'f', 'star', 'nature sight'],
    ['måne', 'm', 'moon', 'nature sight'],
    ['sol', 'f', 'sun', 'nature sight'],
    ['natt', 'f', 'night', 'time dark long', { ip: 'netter', dp: 'nettene' }],
    ['dag', 'm', 'day', 'time long'],
    ['år', 'n', 'year', 'time'],
    // body
    ['hode', 'n', 'head', 'body'],
    ['øye', 'n', 'eye', 'body', { ip: 'øyne', dp: 'øynene' }],
    ['øre', 'n', 'ear', 'body'],
    ['nese', 'm', 'nose', 'body long'],
    ['tann', 'f', 'tooth', 'body', { ip: 'tenner', dp: 'tennene' }],
    ['hånd', 'f', 'hand', 'body', { ip: 'hender', dp: 'hendene' }],
    ['fot', 'm', 'foot', 'body', { ip: 'føtter', dp: 'føttene' }],
    ['hale', 'm', 'tail', 'body long'],
    ['hjerte', 'n', 'heart', 'body']
  ];

  S.EN_PLURALS = {
    man: 'men', woman: 'women', child: 'children', fisherman: 'fishermen', foot: 'feet',
    tooth: 'teeth', mouse: 'mice', wolf: 'wolves', knife: 'knives', elf: 'elves', fish: 'fish',
    sheep: 'sheep', reindeer: 'reindeer', moose: 'moose', elk: 'elk', potato: 'potatoes',
    dwarf: 'dwarves', nisse: 'nisser'
  };

  // Complements reused by a few verbs.
  var NORSK = [{ no: 'norsk', en: 'Norwegian' }, { no: 'engelsk', en: 'English' }];
  var ALT = [{ no: 'alt', en: 'everything' }, { no: 'ingenting', en: 'nothing' }];

  S.VERBS = [
    // --- group 1: -et / -et
    ['snakke', '1', 'speak,spoke,spoken|talk', { comp: NORSK, bare: 1 }],
    ['danse', '1', 'dance', { pl: 'PLAY', bare: 1 }],
    ['hoppe', '1', 'jump|hop,hopped,hopped,hopping', { bare: 1, subj: 'pa' }],
    ['kaste', '1', 'throw,threw,thrown', { o: 'small' }],
    ['vaske', '1', 'wash', { o: 'wash' }],
    ['vente', '1', 'wait', { pl: 'WAIT', bare: 1 }],
    ['hente', '1', 'fetch|get,got,got,getting', { o: 'obj food drink' }],
    ['lage', '1', 'make,made,made', { o: 'made', pastAlt: ['lagde'], ppAlt: ['lagd'] }],
    ['åpne', '1', 'open', { o: 'openable', imp: 'åpne' }],
    ['lukke', '1', 'close|shut,shut,shut,shutting', { o: 'openable' }],
    ['jobbe', '1', 'work', { pl: 'WORK', bare: 1 }],
    ['miste', '1', 'lose,lost,lost', { o: 'obj', noImp: 1 }],
    ['jage', '1', 'chase', { o: 'animal person', subj: 'pa' }],
    ['fange', '1', 'catch,caught,caught', { o: 'catch' }],
    ['fiske', '1', 'fish', { pl: 'WATER', bare: 1 }],
    ['plukke', '1', 'pick', { o: 'pick' }],
    ['tegne', '1', 'draw,drew,drawn', { o: 'draw' }],
    ['hviske', '1', 'whisper', { bare: 1 }],
    ['elske', '1', 'love', { o: 'animal food person obj', st: 1 }],
    ['huske', '1', 'remember', { o: 'person obj', st: 1 }],
    // --- group 2: -te / -t
    ['spise', '2', 'eat,ate,eaten', { o: 'food', subj: 'pa' }],
    ['kjøpe', '2', 'buy,bought,bought', { o: 'food obj farm' }],
    ['lese', '2', 'read,read,read', { o: 'readable' }],
    ['høre', '2', 'hear,heard,heard', { o: 'sound person creature', st: 1, subj: 'pa' }],
    ['kjøre', '2', 'drive,drove,driven', { to: 1 }],
    ['lære', '2', 'learn|learn,learnt,learnt', { comp: NORSK }],
    ['like', '2', 'like', { o: 'animal food drink person obj', st: 1 }],
    ['reise', '2', 'travel,traveled,traveled,traveling|travel,travelled,travelled,travelling', { to: 1 }],
    ['tenke', '2', 'think,thought,thought', { comp: [{ no: 'på mat', en: 'about food|of food' }] }],
    ['bruke', '2', 'use', { o: 'tool' }],
    ['leke', '2', 'play', { pl: 'PLAY', bare: 1 }],
    ['smake', '2', 'taste', { o: 'food' }],
    ['vise', '2', 'show,showed,shown', {}],
    ['møte', '2', 'meet,met,met', { o: 'person creature' }],
    ['glemme', '2', 'forget,forgot,forgotten,forgetting', { o: 'obj' }],
    ['begynne', '2', 'begin,began,begun,beginning|start', { bare: 1, noImp: 1 }],
    ['kjenne', '2', 'know,knew,known', { o: 'person creature', st: 1 }],
    ['rope', '2', 'shout|yell', { bare: 1 }],
    ['svømme', '2', 'swim,swam,swum,swimming', { pl: 'WATER', bare: 1, subj: 'pa' }],
    ['drømme', '2', 'dream|dream,dreamt,dreamt', { bare: 1 }],
    ['spille', '2', 'play', { o: 'instrument' }],
    ['gjemme', '2', 'hide,hid,hidden,hiding', { o: 'obj' }],
    ['lete', '2', 'search', {}],
    ['bake', '2', 'bake', { o: 'baked' }],
    ['male', '2', 'paint', { o: 'paint' }],
    ['koke', '2', 'boil|cook', { o: 'cook' }],
    ['låse', '2', 'lock', { o: 'lock' }],
    ['trenge', '2', 'need', { o: 'obj food drink', st: 1 }],
    // --- group 3: -de / -d
    ['leve', '3', 'live', { pl: 'LIVE' }],
    ['prøve', '3', 'try', { comp: [{ no: 'igjen', en: 'again' }], bare: 1 }],
    ['bygge', '3', 'build,built,built', { o: 'build', pastAlt: ['bygget'], ppAlt: ['bygget'] }],
    ['eie', '3', 'own', { o: 'building farm obj', st: 1 }],
    // --- group 4: -dde / -dd
    ['bo', '4', 'live', { pl: 'LIVE' }],
    ['tro', '4', 'believe', { comp: [{ no: 'på troll', en: 'in trolls' }, { no: 'på eventyr', en: 'in fairy tales|in fairytales' }], st: 1 }],
    ['nå', '4', 'reach', { comp: [{ no: 'toppen', en: 'the top|the summit' }] }],
    ['ro', '4', 'row', { to: 1 }],
    ['snu', '4', 'turn', {}],
    // --- strong and irregular
    ['være', 's', 'be', { pres: 'er', past: 'var', pp: 'vært', imp: 'vær', pl: 'LIVE', be: 1, st: 1 }],
    ['ha', 's', 'have,had,had', { pres: 'har', past: 'hadde', pp: 'hatt', o: 'obj farm', st: 1 }],
    ['gå', 's', 'walk|go,went,gone', { pres: 'går', past: 'gikk', pp: 'gått', to: 1 }],
    ['komme', 's', 'come,came,come', { pres: 'kommer', past: 'kom', pp: 'kommet', to: 1, bare: 1 }],
    ['se', 's', 'see,saw,seen', { pres: 'ser', past: 'så', pp: 'sett', o: 'animal person creature sight', st: 1, subj: 'pa' }],
    ['si', 's', 'say,said,said', { pres: 'sier', past: 'sa', pp: 'sagt', comp: [{ no: 'ja', en: 'yes' }, { no: 'nei', en: 'no' }, { no: 'takk', en: 'thank you|thanks' }, { no: 'ingenting', en: 'nothing' }] }],
    ['gjøre', 's', 'do,did,done', { pres: 'gjør', past: 'gjorde', pp: 'gjort', comp: ALT }],
    ['få', 's', 'get,got,got,getting|get,got,gotten,getting|receive', { pres: 'får', past: 'fikk', pp: 'fått', o: 'obj food', noImp: 1 }],
    ['ta', 's', 'take,took,taken', { pres: 'tar', past: 'tok', pp: 'tatt', o: 'obj food' }],
    ['gi', 's', 'give,gave,given', { pres: 'gir', past: 'ga', pastAlt: ['gav'], pp: 'gitt', comp: ALT }],
    ['drikke', 's', 'drink,drank,drunk', { pres: 'drikker', past: 'drakk', pp: 'drukket', o: 'drink', subj: 'pa' }],
    ['finne', 's', 'find,found,found', { pres: 'finner', past: 'fant', pp: 'funnet', o: 'obj animal' }],
    ['skrive', 's', 'write,wrote,written,writing', { pres: 'skriver', past: 'skrev', pastAlt: ['skreiv'], pp: 'skrevet', o: 'written' }],
    ['synge', 's', 'sing,sang,sung', { pres: 'synger', past: 'sang', pp: 'sunget', o: 'song', pl: 'PLAY', bare: 1 }],
    ['sove', 's', 'sleep,slept,slept', { pres: 'sover', past: 'sov', pp: 'sovet', pl: 'SLEEP', bare: 1, subj: 'pa' }],
    ['sitte', 's', 'sit,sat,sat,sitting', { pres: 'sitter', past: 'satt', pp: 'sittet', pl: 'SIT' }],
    ['stå', 's', 'stand,stood,stood', { pres: 'står', past: 'sto', pastAlt: ['stod'], pp: 'stått', pl: 'STAND' }],
    ['ligge', 's', 'lie,lay,lain,lying', { pres: 'ligger', past: 'lå', pp: 'ligget', pl: 'LIE' }],
    ['løpe', 's', 'run,ran,run,running', { pres: 'løper', past: 'løp', pp: 'løpt', to: 1, bare: 1, subj: 'pa' }],
    ['vite', 's', 'know,knew,known', { pres: 'vet', past: 'visste', pp: 'visst', comp: ALT, st: 1 }],
    ['bli', 's', 'stay', { pres: 'blir', past: 'ble', pastAlt: ['blei'], pp: 'blitt', comp: [{ no: 'hjemme', en: 'at home|home' }], gloss: 'become / stay' }],
    ['dra', 's', 'go,went,gone|leave,left,left|travel,traveled,traveled,traveling', { pres: 'drar', past: 'dro', pastAlt: ['drog'], pp: 'dratt', to: 1 }],
    ['hjelpe', 's', 'help', { pres: 'hjelper', past: 'hjalp', pp: 'hjulpet', o: 'person creature animal' }],
    ['bære', 's', 'carry', { pres: 'bærer', past: 'bar', pp: 'båret', o: 'obj' }],
    ['stjele', 's', 'steal,stole,stolen', { pres: 'stjeler', past: 'stjal', pp: 'stjålet', o: 'obj food farm' }],
    ['fly', 's', 'fly,flew,flown', { pres: 'flyr', past: 'fløy', pp: 'fløyet', ppAlt: ['flydd'], to: 1, bare: 1, subj: 'fly' }],
    ['le', 's', 'laugh', { pres: 'ler', past: 'lo', pp: 'ledd', bare: 1 }],
    ['spørre', 's', 'ask', { pres: 'spør', past: 'spurte', pp: 'spurt', imp: 'spør', bare: 1 }],
    ['selge', 's', 'sell,sold,sold', { pres: 'selger', past: 'solgte', pp: 'solgt', o: 'obj food farm' }],
    ['velge', 's', 'choose,chose,chosen,choosing|pick', { pres: 'velger', past: 'valgte', pp: 'valgt', o: 'obj' }],
    ['legge', 's', 'lay,laid,laid|put,put,put,putting', { pres: 'legger', past: 'la', pp: 'lagt' }],
    ['sette', 's', 'set,set,set,setting|put,put,put,putting', { pres: 'setter', past: 'satte', pp: 'satt' }],
    ['forstå', 's', 'understand,understood,understood', { pres: 'forstår', past: 'forsto', pastAlt: ['forstod'], pp: 'forstått', comp: ALT.concat([{ no: 'norsk', en: 'Norwegian' }]), st: 1 }],
    ['treffe', 's', 'meet,met,met', { pres: 'treffer', past: 'traff', pp: 'truffet', o: 'person creature' }],
    ['ri', 's', 'ride,rode,ridden,riding', { pres: 'rir', past: 'red', pastAlt: ['rei'], pp: 'ridd', to: 1 }],
    ['falle', 's', 'fall,fell,fallen', { pres: 'faller', past: 'falt', pp: 'falt', bare: 1, noImp: 1 }],
    ['holde', 's', 'hold,held,held', { pres: 'holder', past: 'holdt', pp: 'holdt', o: 'small' }],
    ['vinne', 's', 'win,won,won,winning', { pres: 'vinner', past: 'vant', pp: 'vunnet', comp: [{ no: 'prinsessen og halve kongeriket', en: 'the princess and half the kingdom' }, { no: 'alt', en: 'everything' }] }],
    ['gråte', 's', 'cry|weep,wept,wept', { pres: 'gråter', past: 'gråt', pp: 'grått', bare: 1, noImp: 1 }],
    ['fortelle', 's', 'tell,told,told', { pres: 'forteller', past: 'fortalte', pp: 'fortalt', o: 'tale' }],
    ['forsvinne', 's', 'disappear|vanish', { pres: 'forsvinner', past: 'forsvant', pp: 'forsvunnet', bare: 1, noImp: 1 }],
    // --- modal helpers (drilled as forms; in sentences they carry another verb)
    ['kunne', 's', 'can', { pres: 'kan', past: 'kunne', pp: 'kunnet', modal: 1, gloss: 'can / be able to', glossPast: 'could' }],
    ['ville', 's', 'want', { pres: 'vil', past: 'ville', pp: 'villet', modal: 1, gloss: 'want to / will', glossPast: 'wanted to / would' }],
    ['måtte', 's', 'must', { pres: 'må', past: 'måtte', pp: 'måttet', modal: 1, gloss: 'must / have to', glossPast: 'had to' }],
    ['skulle', 's', 'shall', { pres: 'skal', past: 'skulle', pp: 'skullet', modal: 1, gloss: 'shall / be going to', glossPast: 'should / was going to' }]
  ];

  // Adjectives: [masc/fem, neuter, plural/definite, english, fits (noun tags), overrides]
  S.ADJS = [
    ['stor', 'stort', 'store', 'big|large', 'size'],
    ['liten', 'lite', 'små', 'small|little', 'size', { f: 'lita', def: 'lille' }],
    ['gammel', 'gammelt', 'gamle', 'old', 'person creature animal old'],
    ['ung', 'ungt', 'unge', 'young', 'person animal'],
    ['snill', 'snilt', 'snille', 'kind|nice', 'person creature animal'],
    ['sterk', 'sterkt', 'sterke', 'strong', 'person creature strong'],
    ['glad', 'glad', 'glade', 'happy|glad', 'person creature'],
    ['sulten', 'sultent', 'sultne', 'hungry', 'person creature animal'],
    ['trøtt', 'trøtt', 'trøtte', 'tired|sleepy', 'person creature animal'],
    ['redd', 'redd', 'redde', 'scared|afraid|frightened', 'person animal'],
    ['klok', 'klokt', 'kloke', 'wise|clever', 'person creature'],
    ['farlig', 'farlig', 'farlige', 'dangerous', 'danger'],
    ['rød', 'rødt', 'røde', 'red', 'color'],
    ['grønn', 'grønt', 'grønne', 'green', 'color'],
    ['blå', 'blått', 'blå', 'blue', 'color', { plAlt: ['blåe'] }],
    ['hvit', 'hvitt', 'hvite', 'white', 'color'],
    ['svart', 'svart', 'svarte', 'black', 'color'],
    ['vakker', 'vakkert', 'vakre', 'beautiful', 'pretty'],
    ['fin', 'fint', 'fine', 'nice|fine', 'pretty obj'],
    ['ny', 'nytt', 'nye', 'new', 'obj old'],
    ['lang', 'langt', 'lange', 'long', 'long'],
    ['kald', 'kaldt', 'kalde', 'cold', 'temp'],
    ['varm', 'varmt', 'varme', 'warm|hot', 'temp'],
    ['mørk', 'mørkt', 'mørke', 'dark', 'dark']
  ];

  // Places a verb can happen: [noun, preposition, english preposition(s), norwegian alt prepositions]
  var P = {
    skog: ['skog', 'i', 'in'], fjell: ['fjell', 'på', 'on|in'], hule: ['hule', 'i', 'in'],
    bruU: ['bru', 'under', 'under|beneath'], bruP: ['bru', 'på', 'on'],
    foss: ['foss', 'ved', 'by|at|near|beside|next to'], tjernV: ['tjern', 'ved', 'by|at|near|beside|next to'],
    fjos: ['fjøs', 'i', 'in'], gard: ['gård', 'på', 'on|at'], hus: ['hus', 'i', 'in'],
    hytte: ['hytte', 'i', 'in|at', ['på']], slott: ['slott', 'på', 'at|in', ['i']],
    by: ['by', 'i', 'in'], dal: ['dal', 'i', 'in'], oy: ['øy', 'på', 'on'],
    elvV: ['elv', 'ved', 'by|at|near|beside|next to'], fjordV: ['fjord', 'ved', 'by|at|near|beside|next to'],
    seng: ['seng', 'i', 'in'], treU: ['tre', 'under', 'under|beneath'], bat: ['båt', 'i', 'in'],
    stol: ['stol', 'på', 'on|in'], bord: ['bord', 'ved', 'at|by'], bal: ['bål', 'ved', 'by|at|near|beside|next to'],
    stein: ['stein', 'på', 'on'], dor: ['dør', 'ved', 'by|at|near|beside|next to'],
    vindu: ['vindu', 'ved', 'by|at|near|beside|next to'],
    elvI: ['elv', 'i', 'in'], tjernI: ['tjern', 'i', 'in'], havI: ['hav', 'i', 'in'],
    fjordI: ['fjord', 'i', 'in'], innsjoI: ['innsjø', 'i', 'in']
  };
  S.PLACES = {
    LIVE: [P.skog, P.fjell, P.hule, P.bruU, P.foss, P.tjernV, P.fjos, P.gard, P.hus, P.hytte, P.slott, P.by, P.dal, P.oy, P.elvV, P.fjordV],
    SLEEP: [P.seng, P.hule, P.fjos, P.hus, P.hytte, P.treU, P.bruU, P.skog, P.bat],
    SIT: [P.stol, P.bord, P.treU, P.bal, P.stein, P.bat, P.bruP],
    STAND: [P.bruP, P.foss, P.elvV, P.treU, P.dor, P.vindu],
    LIE: [P.seng, P.treU, P.bat],
    PLAY: [P.skog, P.gard, P.bal, P.foss, P.hus, P.dal],
    WAIT: [P.bruU, P.bruP, P.foss, P.treU, P.hus, P.dor, P.slott],
    WORK: [P.gard, P.fjos, P.by, P.skog, P.slott],
    WATER: [P.elvI, P.tjernI, P.havI, P.fjordI, P.innsjoI],
    TO: ['skog', 'fjell', 'hule', 'bru', 'foss', 'tjern', 'fjøs', 'gård', 'hytte', 'slott', 'båt', 'elv', 'by', 'dal', 'øy', 'hav', 'fjord', 'innsjø']
  };

  S.PRONOUNS = [
    { no: ['jeg'], en: ['I'], p: 1, pl: false },
    { no: ['du', 'dere'], en: ['you'], p: 2, pl: false },
    { no: ['han'], en: ['he'], p: 3, pl: false },
    { no: ['hun'], en: ['she'], p: 3, pl: false },
    { no: ['vi'], en: ['we'], p: 1, pl: true },
    { no: ['dere', 'du'], en: ['you', 'you all'], p: 2, pl: true },
    { no: ['de'], en: ['they'], p: 3, pl: true }
  ];
  S.NAMES = [
    { no: ['Askeladden'], en: ['Askeladden', 'the Ash Lad'] },
    { no: ['Brumle'], en: ['Brumle'] }
  ];

  S.NUMBERS = [
    ['to', 'two'], ['tre', 'three'], ['fire', 'four'], ['fem', 'five'], ['seks', 'six'],
    ['sju', 'seven', ['syv']], ['åtte', 'eight'], ['ni', 'nine'], ['ti', 'ten']
  ];
  S.QUANTS = [['mange', 'many|a lot of|lots of'], ['noen', 'some|a few']];

  // Possessives: [masc, fem, neuter, plural, english]
  S.POSS = [
    ['min', 'mi', 'mitt', 'mine', 'my'],
    ['din', 'di', 'ditt', 'dine', 'your'],
    ['hans', 'hans', 'hans', 'hans', 'his'],
    ['hennes', 'hennes', 'hennes', 'hennes', 'her'],
    ['vår', 'vår', 'vårt', 'våre', 'our']
  ];

  // Time adverbials: [norwegian, english, tenses, prefer progressive]
  S.TIMES = [
    ['i dag', 'today', 'pres past skal'], ['nå', 'now|right now', 'pres', 1],
    ['hver dag', 'every day|each day', 'pres'], ['i går', 'yesterday', 'past'],
    ['i fjor', 'last year', 'past'], ['i morgen', 'tomorrow', 'skal']
  ];

  // Fixed phrases. First entry in each list is the one shown.
  S.PHRASES = [
    { id: 'hei', no: ['hei'], en: ['hi', 'hello', 'hey'] },
    { id: 'godmorgen', no: ['god morgen'], en: ['good morning'] },
    { id: 'godkveld', no: ['god kveld'], en: ['good evening'] },
    { id: 'godnatt', no: ['god natt'], en: ['good night'] },
    { id: 'takk', no: ['takk'], en: ['thanks', 'thank you'] },
    { id: 'tusentakk', no: ['tusen takk'], en: ['thank you very much', 'thanks a lot', 'many thanks', 'thank you so much', 'a thousand thanks'] },
    { id: 'hadet', no: ['ha det bra', 'ha det'], en: ['goodbye', 'bye', 'good bye', 'bye bye'] },
    { id: 'ja', no: ['ja'], en: ['yes'] },
    { id: 'nei', no: ['nei'], en: ['no'] },
    { id: 'kanskje', no: ['kanskje'], en: ['maybe', 'perhaps'] },
    { id: 'unnskyld', no: ['unnskyld'], en: ['excuse me', 'sorry', 'pardon'] },
    { id: 'vaersasnill', no: ['vær så snill'], en: ['please'] },
    { id: 'velkommen', no: ['velkommen'], en: ['welcome'] },
    { id: 'hvordan', no: ['hvordan har du det', 'hvordan går det'], en: ['how are you', 'how are you doing', 'how is it going'] },
    { id: 'bra', no: ['jeg har det bra'], en: ['I am fine', 'I am well', 'I am doing well', 'I am good', 'I am doing fine'] },
    { id: 'hvaheter', no: ['hva heter du'], en: ['what is your name', 'what are you called'] },
    { id: 'jegheter', no: ['jeg heter Brumle'], en: ['my name is Brumle', 'I am called Brumle', 'I am Brumle'] },
    { id: 'hvorfra', no: ['hvor kommer du fra'], en: ['where do you come from', 'where are you from'] },
    { id: 'franorge', no: ['jeg kommer fra Norge'], en: ['I come from Norway', 'I am from Norway'] },
    { id: 'snakkerdu', no: ['snakker du norsk'], en: ['do you speak Norwegian', 'are you speaking Norwegian'] },
    { id: 'littnorsk', no: ['jeg snakker litt norsk'], en: ['I speak a little Norwegian', 'I speak a bit of Norwegian', 'I speak some Norwegian', 'I speak a little bit of Norwegian'] },
    { id: 'forstarikke', no: ['jeg forstår ikke'], en: ['I do not understand'] },
    { id: 'hvaerdet', no: ['hva er det'], en: ['what is that', 'what is it', 'what is this'] },
    { id: 'sulten', no: ['jeg er sulten'], en: ['I am hungry'] },
    { id: 'visees', no: ['vi ses'], en: ['see you', 'see you later'] },
    { id: 'godtur', no: ['god tur'], en: ['have a nice trip', 'have a good trip', 'enjoy the trip', 'enjoy your trip', 'have a nice hike', 'have a good hike'] },
    { id: 'hvemerdu', no: ['hvem er du'], en: ['who are you'] },
    { id: 'jegertroll', no: ['jeg er et troll'], en: ['I am a troll'] },
    { id: 'hvorbor', no: ['hvor bor du'], en: ['where do you live'] },
    { id: 'boriskogen', no: ['jeg bor i skogen'], en: ['I live in the forest'] }
  ];
})(globalThis.Sproke = globalThis.Sproke || {});
