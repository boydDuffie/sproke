/* Run with: node --test tests/ */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

['data', 'grammar', 'check', 'engine', 'course'].forEach((f) => require(path.join('..', 'js', f + '.js')));
const S = globalThis.Sproke;

// deterministic randomness so a failure can be reproduced
let seed = 12345;
S.rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

function count(words) {
  const m = {};
  words.forEach((w) => { m[w.toLowerCase()] = (m[w.toLowerCase()] || 0) + 1; });
  return m;
}

/** Every exercise must be answerable with its own model answer. */
function verify(ex, where) {
  const tag = where + ' / ' + ex.type + ' / ' + JSON.stringify(ex.prompt || ex.left);
  assert.ok(ex.title, 'title missing: ' + tag);
  assert.ok(Array.isArray(ex.keys) && ex.keys.length, 'keys missing: ' + tag);
  if (ex.kind === 'choice') {
    assert.ok(ex.options.length >= 2, 'too few options: ' + tag);
    assert.strictEqual(new Set(ex.options).size, ex.options.length, 'duplicate options: ' + tag + ' ' + ex.options);
    assert.ok(ex.answer >= 0 && ex.answer < ex.options.length, 'answer not among options: ' + tag + ' ' + ex.options);
    assert.ok(ex.options.every(Boolean), 'empty option: ' + tag);
  } else if (ex.kind === 'type' || ex.kind === 'bank') {
    const model = ex.solution || S.show(ex.answer[0]);
    const r = S.check(model, ex.answer, ex.lang, { strict: ex.strict });
    assert.ok(r.ok && !r.note, 'model answer rejected: ' + tag + ' -> ' + model);
    assert.ok(!S.check('xyzzy plugh', ex.answer, ex.lang, { strict: ex.strict }).ok, 'nonsense accepted: ' + tag);
    if (ex.kind === 'bank') {
      const have = count(ex.tiles), need = count(S.show(ex.answer[0]).split(' '));
      Object.keys(need).forEach((w) => assert.ok((have[w] || 0) >= need[w], 'tile missing "' + w + '": ' + tag + ' ' + ex.tiles));
    }
  } else if (ex.kind === 'match') {
    assert.ok(ex.pairs.length >= 3, 'too few pairs: ' + tag);
    assert.strictEqual(new Set(ex.left).size, ex.left.length, 'duplicate left: ' + tag);
    assert.strictEqual(new Set(ex.right).size, ex.right.length, 'duplicate right: ' + tag);
  } else if (ex.kind === 'table') {
    ex.rows.forEach((r) => assert.ok(r.answer.length && r.answer[0], 'empty table row: ' + tag));
  } else assert.fail('unknown kind ' + ex.kind);
  const text = JSON.stringify(ex);
  assert.ok(!/undefined|\bnull\b.*"big"|NaN/.test(text.replace(/"(answers|hints|end|say|pre|sub)":null/g, '')), 'bad value in: ' + text);
}

test('noun paradigms', () => {
  const f = (id) => { const x = S.nounForms(id); return [x.is[0], x.ds[0], x.ip[0], x.dp[0]].join(' '); };
  assert.strictEqual(f('hest'), 'hest hesten hester hestene');
  assert.strictEqual(f('jente'), 'jente jenta jenter jentene');
  assert.strictEqual(f('hus'), 'hus huset hus husene');
  assert.strictEqual(f('eple'), 'eple eplet epler eplene');
  assert.strictEqual(f('bok'), 'bok boka bøker bøkene');
  assert.strictEqual(f('barn'), 'barn barnet barn barna');
  assert.strictEqual(f('lærer'), 'lærer læreren lærere lærerne');
  assert.strictEqual(f('tre'), 'tre treet trær trærne');
  assert.strictEqual(f('nøkkel'), 'nøkkel nøkkelen nøkler nøklene');
  assert.deepStrictEqual(S.nounForms('jente').ds, ['jenta', 'jenten']);
  S.settings.fem = false;
  assert.deepStrictEqual(S.nounForms('jente').ds, ['jenten', 'jenta']);
  assert.deepStrictEqual(S.articles('jente'), ['en', 'ei']);
  S.settings.fem = true;
});

test('verb paradigms', () => {
  const f = (id) => { const x = S.verbForms(id); return [x.pres[0], x.past[0], x.pp[0], x.imp[0]].join(' '); };
  assert.strictEqual(f('snakke'), 'snakker snakket snakket snakk');
  assert.strictEqual(f('spise'), 'spiser spiste spist spis');
  assert.strictEqual(f('glemme'), 'glemmer glemte glemt glem');
  assert.strictEqual(f('bygge'), 'bygger bygde bygd bygg');
  assert.strictEqual(f('bo'), 'bor bodde bodd bo');
  assert.strictEqual(f('være'), 'er var vært vær');
  assert.strictEqual(f('komme'), 'kommer kom kommet kom');
  assert.strictEqual(f('drikke'), 'drikker drakk drukket drikk');
});

test('every form of every word is a plain word', () => {
  S.nounList.forEach((id) => {
    const f = S.nounForms(id);
    ['is', 'ds', 'ip', 'dp'].forEach((k) => f[k].forEach((w) => assert.match(w, /^[a-zæøå]+$/, id + ' ' + k)));
  });
  S.verbList.forEach((id) => {
    const f = S.verbForms(id);
    ['inf', 'pres', 'past', 'pp', 'imp'].forEach((k) => f[k].forEach((w) => assert.match(w, /^[a-zæøå]+$/, id + ' ' + k)));
  });
});

test('course only uses words that exist', () => {
  S.lessons.forEach((l) => {
    (l.n || []).forEach((id) => assert.ok(S.nouns[id], l.key + ' noun ' + id));
    (l.v || []).forEach((id) => assert.ok(S.verbs[id], l.key + ' verb ' + id));
    (l.a || []).forEach((id) => assert.ok(S.adjs[id], l.key + ' adjective ' + id));
    (l.focusExtra || []).forEach((id) => assert.ok(S.nouns[id] || S.verbs[id], l.key + ' extra ' + id));
    assert.ok(S.TIPS[l.tip], l.key + ' tip ' + l.tip);
    // review words must have been introduced by this point
    const k = S.knownAt(l), known = k.nouns.concat(k.verbs, ['gutt', 'jente', 'troll', 'nisse']);
    (l.focusExtra || []).forEach((id) => assert.ok(known.indexOf(id) >= 0, l.key + ' reviews ' + id + ' before teaching it'));
  });
  const taughtN = S.knownAt(S.lessons[S.lessons.length - 1]);
  const missing = S.verbList.filter((id) => taughtN.verbs.indexOf(id) < 0);
  assert.deepStrictEqual(missing, [], 'verbs never taught');
});

test('every lesson builds and can be answered, at every level', () => {
  S.lessons.forEach((l) => {
    for (let level = 0; level < 4; level++) {
      for (let round = 0; round < 6; round++) {
        const list = S.buildLesson(l, level);
        assert.ok(list.length >= 10, l.key + ' level ' + level + ' only built ' + list.length);
        list.forEach((ex) => verify(ex, l.key + '@' + level));
      }
    }
  });
});

test('free practice builds and can be answered', () => {
  Object.keys(S.PRACTICE).forEach((id) => {
    const p = S.PRACTICE[id];
    for (let round = 0; round < 40; round++) {
      const o = {};
      p.options.forEach((opt) => {
        if (!opt.multi) { o[opt.id] = S.util.pick(opt.values)[0]; return; }
        const some = opt.values.filter(() => S.rand() < 0.6).map((v) => v[0]);
        o[opt.id] = some.length ? some : [opt.values[0][0]];
      });
      const ctx = S.fullContext({ hard: S.rand() });
      if (p.filter) p.filter(o, ctx);
      const list = S.buildSession(p.recipe(o), ctx, { shuffle: true });
      assert.ok(list.length >= 8, id + ' ' + JSON.stringify(o) + ' only built ' + list.length);
      list.forEach((ex) => verify(ex, 'practice:' + id));
    }
  });
});

test('generated sentences translate both ways', () => {
  const ctx = S.fullContext();
  const o = { pat: S.PATTERN_NAMES, tense: ['pres', 'past', 'perf'], q: 0.2, neg: 0.2, front: 0.3, modal: ['kan', 'vil', 'må', 'skal'], modalP: 0.25, adj: 0.3, poss: 0.2 };
  for (let i = 0; i < 4000; i++) {
    const s = S.genSentence(ctx, o);
    assert.ok(s, 'no sentence');
    s.no.forEach((seq) => assert.ok(S.check(S.show(seq), s.no, 'no').ok, S.show(seq)));
    s.en.forEach((seq) => assert.ok(S.check(S.show(seq), s.en, 'en').ok, S.show(seq)));
    assert.ok(!/\s\s|^\s|undefined/.test(S.show(s.no[0]) + S.show(s.en[0])), S.show(s.no[0]) + ' | ' + S.show(s.en[0]));
  }
});

test('checker is strict about endings and relaxed about everything else', () => {
  const sl = (a, key) => ({ a: Array.isArray(a) ? a : [a], key });
  const no = [[sl('jeg'), sl('ser'), sl(['hestene'], 'n:hest:dp')]];
  assert.ok(S.check('Jeg ser hestene.', no, 'no').ok);
  assert.ok(!S.check('Jeg ser hester', no, 'no').ok);
  assert.ok(!S.check('Jeg ser hestne', no, 'no').ok, 'a typo in a drilled ending is not forgiven');
  assert.match(S.check('Jeg ser hester', no, 'no').why, /indefinite plural.*definite plural/);
  const v2 = [[sl('i dag'), sl('spiser'), sl('trollet'), sl('fisk')]];
  assert.match(S.check('i dag trollet spiser fisk', v2, 'no').why, /second/);
  const a = [[sl('gutten'), sl('svømmer')]];
  assert.ok(S.check('gutten svommer', a, 'no').note, 'ø typed as o is accepted with a note');
  assert.ok(S.check('gutten svoemmer', a, 'no').ok);
  const en = [[sl('the troll'), sl(['does not eat', 'is not eating']), sl(['the porridge'])]];
  assert.ok(S.check("The troll doesn't eat the porridge", en, 'en').ok);
  assert.ok(S.check("the troll isn't eating the porridge!", en, 'en').ok);
  assert.ok(S.check('the troll does not eat the porrige', en, 'en').note, 'spelling slip in English is forgiven');
  assert.ok(!S.check('the trolls does not eat the porridge', en, 'en').ok, 'singular/plural is not a typo');
  assert.ok(!S.check('', en, 'en').ok);
});

test('ei/en and -a/-en are both accepted', () => {
  const x = S.np('jente', 'is');
  assert.ok(S.check('en jente', [x.no], 'no').ok);
  assert.ok(S.check('ei jente', [x.no], 'no').ok);
  const y = S.np('bok', 'ds', { poss: S.POSS[0] });
  ['boka mi', 'boken min', 'min bok', 'mi bok'].forEach((t) => assert.ok(S.check(t, [y.no], 'no').ok, t));
  assert.ok(!S.check('boka mitt', [y.no], 'no').ok);
  const z = S.np('hus', 'ds', { adj: 'liten' });
  assert.strictEqual(S.show(z.no), 'Det lille huset');
  assert.strictEqual(S.show(S.np('troll', 'is', { adj: 'stor' }).no), 'Et stort troll');
  assert.strictEqual(S.show(S.np('barn', 'dp', { adj: 'liten' }).no), 'De små barna');
});
