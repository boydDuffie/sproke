/* Sproke — sentence and exercise generator.
 * Nothing here is a fixed list of questions: sentences are assembled from the word data,
 * so the endings and verb forms come round in endless fresh combinations.
 */
(function (S) {
  'use strict';

  // ---------- random helpers (S.rand can be swapped for a seeded one in tests) ----------
  S.rand = Math.random;
  function rnd(n) { return Math.floor(S.rand() * n); }
  function pick(a) { return a[rnd(a.length)]; }
  function chance(p) { return S.rand() < (p || 0); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function sample(a, k) { return shuffle(a).slice(0, k); }
  function has(n, tags) {
    if (typeof tags === 'string') tags = tags.split(' ');
    return tags.some(function (t) { return n.tags.indexOf(t) >= 0; });
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function slot(alts, extra) {
    var o = { a: Array.isArray(alts) ? alts : [alts] };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  /** Pick with weights from ctx.weight (weak items come up more often). */
  function pickW(list, ctx, keyOf) {
    if (!list.length) return null;
    if (!ctx || !ctx.weight) return pick(list);
    var ws = list.map(function (x) { return Math.max(0.05, ctx.weight(keyOf(x))); });
    var total = ws.reduce(function (a, b) { return a + b; }, 0), r = S.rand() * total;
    for (var i = 0; i < list.length; i++) { r -= ws[i]; if (r <= 0) return list[i]; }
    return list[list.length - 1];
  }
  S.util = { rnd: rnd, pick: pick, chance: chance, shuffle: shuffle, sample: sample, cap: cap };

  /** A context that knows every word — used by free practice and tests. */
  S.fullContext = function (extra) {
    var c = { nouns: S.nounList.slice(), verbs: S.verbList.slice(), adjs: S.adjList.slice(), focusN: [], focusV: [], hard: 0.5 };
    if (extra) for (var k in extra) c[k] = extra[k];
    return c;
  };
  function focusOr(ctx, kind) {
    var f = kind === 'n' ? ctx.focusN : ctx.focusV;
    return f && f.length ? f : (kind === 'n' ? ctx.nouns : ctx.verbs);
  }

  // ---------- noun phrases ----------
  var PERSONISH = ['person', 'creature'];
  /**
   * @param form is | ds | ip | dp
   * @param o {adj, poss, num:[no,en,alts], quant:[no,en]}
   * @returns {no: slot[], en: string[], plural, key}
   */
  S.np = function (id, form, o) {
    o = o || {};
    var n = S.nouns[id], f = S.nounForms(n), ens = S.enNoun(n), key = 'n:' + id + ':' + form;
    var plural = form === 'ip' || form === 'dp';
    var lemma = n.mass ? n.no : S.withArticle(n);
    var nounSlot = slot(f[form], { key: key, lemma: lemma, g: S.enNounForm(n, form)[0], role: 'noun' });
    var adj = o.adj ? S.adjs[o.adj] : null;
    var adjEn = adj ? adj.en : [''];
    var no = [], en = [];
    function eachEn(fn) {
      adjEn.forEach(function (a) { ens.forEach(function (e) { en.push(fn((a ? a + ' ' : '') + (plural ? e.pl : e.sg))); }); });
    }
    if (o.poss && (form === 'ds' || form === 'dp')) {
      var row = o.poss, alts = [];
      if (form === 'dp') {
        f.dp.forEach(function (w) { alts.push(w + ' ' + row[3]); });
        f.ip.forEach(function (w) { alts.push(row[3] + ' ' + w); });
      } else if (n.g === 'f') {
        f.ds.forEach(function (w) { alts.push(w + ' ' + (/a$/.test(w) ? row[1] : row[0])); });
        alts.push(row[0] + ' ' + n.no, row[1] + ' ' + n.no);
      } else {
        var p = n.g === 'n' ? row[2] : row[0];
        f.ds.forEach(function (w) { alts.push(w + ' ' + p); });
        alts.push(p + ' ' + n.no);
      }
      no = [slot(S.uniq(alts), { key: key, lemma: lemma, g: row[4] + ' ' + (plural ? ens[0].pl : ens[0].sg), role: 'np' })];
      eachEn(function (x) { return row[4] + ' ' + x; });
      return { no: no, en: en, plural: plural, key: key, id: id, form: form };
    }
    if (form === 'is') {
      if (!n.mass) no.push(slot(S.articles(n), { g: 'a / an' }));
      if (adj) no.push(slot(S.adjFor(adj, n, false), { key: 'a:' + adj.id, g: adj.en[0], lemma: adj.m }));
      no.push(nounSlot);
      eachEn(function (x) { return n.mass ? x : S.enA(x); });
    } else if (form === 'ds') {
      if (adj) {
        no.push(slot(n.g === 'n' ? 'det' : 'den', { g: 'the' }));
        no.push(slot(adj.def, { key: 'a:' + adj.id, g: adj.en[0], lemma: adj.m }));
      }
      no.push(nounSlot);
      eachEn(function (x) { return 'the ' + x; });
    } else if (form === 'ip') {
      var q = o.num || o.quant;
      if (o.num) no.push(slot([o.num[0]].concat(o.num[2] || []), { g: o.num[1] }));
      if (o.quant) no.push(slot(o.quant[0], { g: o.quant[1].split('|')[0] }));
      if (adj) no.push(slot(S.adjFor(adj, n, true), { key: 'a:' + adj.id, g: adj.en[0], lemma: adj.m }));
      no.push(nounSlot);
      var pre = q ? q[1].split('|') : [''];
      adjEn.forEach(function (a) { ens.forEach(function (e) { pre.forEach(function (p) {
        en.push((p ? p + ' ' : '') + (a ? a + ' ' : '') + e.pl);
      }); }); });
    } else {
      if (adj) {
        no.push(slot('de', { g: 'the' }));
        no.push(slot(S.adjFor(adj, n, true), { key: 'a:' + adj.id, g: adj.en[0], lemma: adj.m }));
      }
      no.push(nounSlot);
      eachEn(function (x) { return 'the ' + x; });
    }
    return { no: no, en: en, plural: plural, key: key, id: id, form: form };
  };

  // ---------- subjects ----------
  function pronounSubject() {
    var p = pick(S.PRONOUNS);
    return { no: [slot(p.no, { g: p.en[0] })], en: p.en, p: p.p, pl: p.pl, keys: [] };
  }
  function nounSubject(id, form) {
    var x = S.np(id, form);
    return { no: x.no, en: x.en, p: 3, pl: x.plural, keys: [x.key], id: id };
  }
  function pickSubject(ctx, v, o, avoid) {
    var kind = v.x.subj || 'p', kinds = o.subj || ['pron', 'noun', 'noun', 'name'];
    var pool = ctx.nouns.filter(function (id) {
      var n = S.nouns[id];
      if (id === avoid) return false;
      if (kind === 'fly') return has(n, 'flyer');
      return has(n, PERSONISH) || (kind === 'pa' && has(n, 'animal'));
    });
    if (kind === 'fly') kinds = ['noun'];
    if (!pool.length) pool = kind === 'fly' ? ['fugl'] : ['gutt', 'jente', 'troll', 'nisse'];
    var k = pick(kinds);
    if (k === 'pron') return pronounSubject();
    if (k === 'name') { var nm = pick(S.NAMES); return { no: [slot(nm.no)], en: nm.en, p: 3, pl: false, keys: [] }; }
    var forms = o.subjForms || ['ds', 'ds', 'dp'];
    return nounSubject(pick(pool), pick(forms));
  }

  // ---------- English verb groups ----------
  function enBe(s, past) {
    if (past) return s.pl || s.p === 2 ? 'were' : 'was';
    if (s.p === 1 && !s.pl) return 'am';
    return s.pl || s.p === 2 ? 'are' : 'is';
  }
  /** @returns [{pre, mid:[...]}] — pre is the fronted auxiliary of a question. */
  function enVerbGroups(v, s, o) {
    var t3 = s.p === 3 && !s.pl, be = enBe(s, false), was = enBe(s, true);
    var doo = t3 ? 'does' : 'do', have = t3 ? 'has' : 'have', not = o.neg ? ' not' : '';
    var order = [], groups = {};
    function add(pre, mid) { if (!groups[pre]) { groups[pre] = []; order.push(pre); } if (groups[pre].indexOf(mid) < 0) groups[pre].push(mid); }
    var st = v.x.st, forms = v.x.be ? [{ base: 'be', ing: 'being' }] : S.enVerb(v);
    if (v.x.be && !o.modal) {
      if (o.tense === 'pres') { if (o.q) add(be, ''); else add('', be + not); }
      else if (o.tense === 'past') { if (o.q) add(was, ''); else add('', was + not); }
      else if (o.q) add(have, 'been'); else add('', have + not + ' been');
    } else forms.forEach(function (e) {
      var M = o.modal;
      if (M && !o.q) {
        if (M === 'kan') { add('', 'can' + not + ' ' + e.base); add('', be + not + ' able to ' + e.base); }
        if (M === 'vil') {
          add('', o.neg ? doo + ' not want to ' + e.base : (t3 ? 'wants' : 'want') + ' to ' + e.base);
          add('', 'will' + not + ' ' + e.base);
          if (!o.neg) add('', 'would like to ' + e.base);
        }
        if (M === 'må') {
          add('', 'must' + not + ' ' + e.base);
          if (!o.neg) { add('', have + ' to ' + e.base); add('', (t3 ? 'needs' : 'need') + ' to ' + e.base); }
        }
        if (M === 'skal') { add('', be + not + ' going to ' + e.base); add('', 'will' + not + ' ' + e.base); add('', 'shall' + not + ' ' + e.base); }
      } else if (M) {
        if (M === 'kan') add('can', e.base);
        if (M === 'vil') { add(doo, 'want to ' + e.base); add('will', e.base); }
        if (M === 'må') { add('must', e.base); add(doo, 'have to ' + e.base); add(doo, 'need to ' + e.base); }
        if (M === 'skal') { add(be, 'going to ' + e.base); add('will', e.base); add('shall', e.base); }
      } else if (o.tense === 'pres') {
        if (o.q) { add(doo, e.base); if (!st) add(be, e.ing); }
        else {
          var simple = o.neg ? doo + ' not ' + e.base : (t3 ? e.s : e.base), prog = be + not + ' ' + e.ing;
          if (o.prog && !st) { add('', prog); add('', simple); } else { add('', simple); if (!st) add('', prog); }
        }
      } else if (o.tense === 'past') {
        if (o.q) { add('did', e.base); if (!st) add(was, e.ing); }
        else { add('', o.neg ? 'did not ' + e.base : e.past); if (!st) add('', was + not + ' ' + e.ing); }
      } else if (o.q) add(have, e.pp); else add('', have + not + ' ' + e.pp);
    });
    return order.map(function (pre) { return { pre: pre, mid: groups[pre] }; });
  }

  var MODAL_GLOSS = { kan: 'can', vil: 'wants to', 'må': 'must', skal: 'is going to' };

  /**
   * Assemble one clause in both languages.
   * spec: {subj, verb, tense, modal, neg, q, front:[no,en,..], tailNo: slot[], tailEn: slot[]}
   */
  function clause(spec) {
    var v = spec.verb, f = S.verbForms(v), s = spec.subj;
    var keys = s.keys.slice(), fin, rest = null, vkey;
    function vslot(form) {
      vkey = 'v:' + v.id + ':' + form;
      return slot(f[form], { key: vkey, lemma: 'å ' + v.inf, g: S.enVerbForm(v, form), role: 'verb' });
    }
    if (spec.modal) { fin = slot(spec.modal, { g: MODAL_GLOSS[spec.modal] }); rest = vslot('inf'); }
    else if (spec.tense === 'perf') { fin = slot('har', { g: 'has / have' }); rest = vslot('pp'); }
    else fin = vslot(spec.tense === 'past' ? 'past' : 'pres');
    keys.push(vkey);
    var ikke = spec.neg ? [slot('ikke', { g: 'not' })] : [];
    var tail = (rest ? [rest] : []).concat(spec.tailNo || []);
    var adv = spec.front ? slot(spec.front[0], { g: spec.front[1].split('|')[0] }) : null;
    var no = [];
    if (spec.q) no.push([fin].concat(s.no, ikke, tail));
    else if (adv) {
      no.push([adv, fin].concat(s.no, ikke, tail));
      no.push(s.no.concat([fin], ikke, tail, [adv]));
    } else no.push(s.no.concat([fin], ikke, tail));

    var en = [], subjEn = slot(s.en), tailEn = spec.tailEn || [];
    var advEn = adv ? slot(spec.front[1].split('|')) : null;
    enVerbGroups(v, s, { tense: spec.tense, modal: spec.modal, neg: spec.neg, q: spec.q, prog: spec.front && spec.front[3] })
      .forEach(function (g) {
        var core = (g.pre ? [slot(g.pre)] : []).concat([subjEn], [slot(g.mid)], tailEn);
        if (advEn) { en.push([advEn].concat(core)); en.push(core.concat([advEn])); }
        else en.push(core);
      });
    return { no: no, en: en, keys: keys, end: spec.q ? '?' : '.', verbKey: vkey };
  }

  // ---------- sentence patterns ----------
  function objectForms(n, wanted) {
    var ok = n.mass ? ['is', 'ds'] : ['is', 'ds', 'ip', 'dp'];
    var r = (wanted || ok).filter(function (x) { return ok.indexOf(x) >= 0; });
    return r.length ? r : ok;
  }
  function npOptions(ctx, n, form, o) {
    var opt = {};
    if (form === 'ip' && chance(o.num == null ? 0.6 : o.num)) {
      if (chance(0.25)) opt.quant = pick(S.QUANTS); else opt.num = pick(o.numbers || S.NUMBERS);
    }
    if ((form === 'ds' || form === 'dp') && chance(o.poss)) opt.poss = pick(S.POSS);
    else if (chance(o.adj)) {
      var fits = (ctx.adjs || S.adjList).filter(function (a) { return S.adjFits(a, n); });
      if (fits.length) opt.adj = pick(fits);
    }
    return opt;
  }
  function verbsWith(ctx, prop, o) {
    var list = (o.verbs || ctx.verbs).filter(function (id) { var v = S.verbs[id]; return v && v.x[prop] && !v.x.modal; });
    return list;
  }
  function pickVerb(ctx, list) {
    var focus = list.filter(function (id) { return (ctx.focusV || []).indexOf(id) >= 0; });
    return S.verbs[focus.length && chance(0.55) ? pick(focus) : pick(list)];
  }
  function pickTense(v, o) {
    var t = pick(o.tense || ['pres']), modal = null;
    if (o.modal && chance(o.modalP == null ? 0 : o.modalP)) { modal = pick(o.modal); t = 'pres'; }
    var mood = { q: false, neg: false, front: null };
    if (chance(o.q)) mood.q = true;
    else if (chance(o.neg)) mood.neg = true;
    else if (t !== 'perf' && chance(o.front)) {
      var want = modal === 'skal' ? 'skal' : t;
      var ts = S.TIMES.filter(function (x) { return x[2].split(' ').indexOf(want) >= 0; });
      if (modal && modal !== 'skal') ts = ts.filter(function (x) { return x[0] !== 'nå'; });
      if (ts.length) mood.front = pick(ts);
    }
    return { tense: t, modal: modal, q: mood.q, neg: mood.neg, front: mood.front };
  }

  var PATTERNS = {
    svo: function (ctx, o) {
      var list = o.verb ? [o.verb] : verbsWith(ctx, 'o', o);
      if (o.noun) list = list.filter(function (id) { return has(S.nouns[o.noun], S.verbs[id].x.o); });
      if (!list.length) return null;
      var v = o.verb ? S.verbs[o.verb] : pickVerb(ctx, list);
      if (!v.x.o) return null;
      var objs = ctx.nouns.filter(function (id) { return has(S.nouns[id], v.x.o); });
      if (!objs.length) return null;
      var focus = objs.filter(function (id) { return (ctx.focusN || []).indexOf(id) >= 0; });
      var id = o.noun || (focus.length && chance(0.8) ? pickW(focus, ctx, function (x) { return 'n:' + x; }) : pick(objs));
      var n = S.nouns[id], form = o.nform || pick(objectForms(n, o.nf));
      if (n.mass && (form === 'ip' || form === 'dp')) return null;
      var obj = S.np(id, form, npOptions(ctx, n, form, o));
      var mood = pickTense(v, o), subj = pickSubject(ctx, v, o, id);
      var c = clause({ subj: subj, verb: v, tense: mood.tense, modal: mood.modal, neg: mood.neg, q: mood.q, front: mood.front, tailNo: obj.no, tailEn: [slot(obj.en)] });
      c.keys.push(obj.key);
      return c;
    },
    place: function (ctx, o) {
      var list = o.verb ? [o.verb] : verbsWith(ctx, 'pl', o);
      if (!list.length) return null;
      var v = o.verb ? S.verbs[o.verb] : pickVerb(ctx, list);
      if (!v.x.pl) return null;
      var places = S.PLACES[v.x.pl], known = places.filter(function (p) { return ctx.nouns.indexOf(p[0]) >= 0; });
      var p = pick(known.length ? known : places), x = S.np(p[0], 'ds');
      var mood = pickTense(v, o), subj = pickSubject(ctx, v, o, p[0]);
      var c = clause({
        subj: subj, verb: v, tense: mood.tense, modal: mood.modal, neg: mood.neg, q: mood.q, front: mood.front,
        tailNo: [slot([p[1]].concat(p[3] || []), { g: p[2].split('|')[0] })].concat(x.no),
        tailEn: [slot(p[2].split('|')), slot(x.en)]
      });
      c.keys.push(x.key);
      return c;
    },
    to: function (ctx, o) {
      var list = o.verb ? [o.verb] : verbsWith(ctx, 'to', o);
      if (!list.length) return null;
      var v = o.verb ? S.verbs[o.verb] : pickVerb(ctx, list);
      if (!v.x.to) return null;
      var known = S.PLACES.TO.filter(function (id) { return ctx.nouns.indexOf(id) >= 0; });
      var id = pick(known.length ? known : S.PLACES.TO), x = S.np(id, 'ds');
      var mood = pickTense(v, o), subj = pickSubject(ctx, v, o, id);
      var c = clause({
        subj: subj, verb: v, tense: mood.tense, modal: mood.modal, neg: mood.neg, q: mood.q, front: mood.front,
        tailNo: [slot('til', { g: 'to' })].concat(x.no), tailEn: [slot('to'), slot(x.en)]
      });
      c.keys.push(x.key);
      return c;
    },
    comp: function (ctx, o) {
      var list = o.verb ? [o.verb] : verbsWith(ctx, 'comp', o);
      if (!list.length) return null;
      var v = o.verb ? S.verbs[o.verb] : pickVerb(ctx, list);
      if (!v.x.comp) return null;
      var cmp = pick(v.x.comp), mood = pickTense(v, o), subj = pickSubject(ctx, v, o);
      return clause({
        subj: subj, verb: v, tense: mood.tense, modal: mood.modal, neg: mood.neg, q: mood.q, front: mood.front,
        tailNo: [slot(cmp.no, { g: cmp.en.split('|')[0] })], tailEn: [slot(cmp.en.split('|'))]
      });
    },
    bare: function (ctx, o) {
      var list = o.verb ? [o.verb] : verbsWith(ctx, 'bare', o);
      if (!list.length) return null;
      var v = o.verb ? S.verbs[o.verb] : pickVerb(ctx, list);
      if (!v.x.bare) return null;
      var mood = pickTense(v, o), subj = pickSubject(ctx, v, o);
      return clause({ subj: subj, verb: v, tense: mood.tense, modal: mood.modal, neg: mood.neg, q: mood.q, front: mood.front });
    },
    thatis: function (ctx, o) {
      var pool = focusOr(ctx, 'n').filter(function (id) { return !S.nouns[id].mass && !has(S.nouns[id], 'time body'); });
      if (o.noun) pool = [o.noun];
      if (!pool.length) return null;
      var x = S.np(pick(pool), 'is');
      return {
        no: [[slot('det', { g: 'that / it' }), slot('er', { g: 'is' })].concat(x.no)],
        en: [[slot(['that is', 'it is', 'this is']), slot(x.en)]], keys: [x.key, 'g:' + x.id], end: '.'
      };
    },
    once: function (ctx, o) {
      var pool = (o.noun ? [o.noun] : focusOr(ctx, 'n')).filter(function (id) { return has(S.nouns[id], 'person creature animal') && !S.nouns[id].mass; });
      if (!pool.length) return null;
      var id = pick(pool), n = S.nouns[id];
      var x = S.np(id, 'is', npOptions(ctx, n, 'is', { adj: o.adj }));
      return {
        no: [[slot('det var en gang', { g: 'once upon a time there was' })].concat(x.no)],
        en: [[slot(['once upon a time there was', 'there once was', 'there was once', 'once there was']), slot(x.en)]],
        keys: [x.key, 'g:' + id], end: '.'
      };
    },
    where: function (ctx, o) {
      var pool = (o.noun ? [o.noun] : focusOr(ctx, 'n')).filter(function (id) { return !has(S.nouns[id], 'time'); });
      if (!pool.length) return null;
      var id = pick(pool), n = S.nouns[id];
      var form = o.nform || pick(objectForms(n, (o.nf || ['ds', 'dp']).filter(function (f) { return f === 'ds' || f === 'dp'; })));
      if (form !== 'ds' && form !== 'dp') form = 'ds';
      if (n.mass) form = 'ds';
      var x = S.np(id, form, npOptions(ctx, n, form, { poss: o.poss }));
      return {
        no: [[slot('hvor', { g: 'where' }), slot('er', { g: x.plural ? 'are' : 'is' })].concat(x.no)],
        en: [[slot(x.plural ? 'where are' : 'where is'), slot(x.en)]], keys: [x.key], end: '?'
      };
    },
    isadj: function (ctx, o) {
      var adjs = ctx.adjs || S.adjList;
      var pool = (o.noun ? [o.noun] : focusOr(ctx, 'n')).filter(function (id) {
        return adjs.some(function (a) { return S.adjFits(a, id); }) && !has(S.nouns[id], 'time');
      });
      if (!pool.length) return null;
      var id = pick(pool), n = S.nouns[id];
      var a = S.adjs[pick(adjs.filter(function (x) { return S.adjFits(x, n); }))];
      var form = n.mass ? 'ds' : pick((o.nf || ['ds', 'dp']).filter(function (f) { return f === 'ds' || f === 'dp'; }).concat('ds'));
      var x = S.np(id, form, chance(o.poss) ? { poss: pick(S.POSS) } : {});
      var agree = x.plural ? 'pl' : (n.g === 'n' ? 'n' : n.g);
      return {
        no: [x.no.concat([slot('er', { g: x.plural ? 'are' : 'is' }), slot(S.adjFor(a, n, x.plural), { key: 'a:' + a.id, akey: 'a:' + a.id + ':' + agree, lemma: a.m, g: a.en[0], role: 'adj' })])],
        en: [[slot(x.en), slot(x.plural ? 'are' : 'is'), slot(a.en)]], keys: [x.key, 'a:' + a.id], end: '.'
      };
    },
    imp: function (ctx, o) {
      var list = (o.verbs || ctx.verbs).filter(function (id) {
        var v = S.verbs[id]; return v && !v.x.st && !v.x.modal && !v.x.noImp && (v.x.o || v.x.bare || v.x.to) && v.x.subj !== 'fly';
      });
      if (!list.length) return null;
      var v = o.verb ? S.verbs[o.verb] : pickVerb(ctx, list), f = S.verbForms(v), e = S.enVerb(v);
      if (v.x.st || v.x.modal || v.x.noImp) return null;
      var key = 'v:' + v.id + ':imp';
      var vs = slot(f.imp, { key: key, lemma: 'å ' + v.inf, g: e[0].base + '!', role: 'verb' });
      var base = slot(e.map(function (x) { return x.base; })), r;
      if (v.x.o) {
        var objs = ctx.nouns.filter(function (id) { return has(S.nouns[id], v.x.o); });
        if (!objs.length) return null;
        var id = pick(objs), n = S.nouns[id], x = S.np(id, pick(objectForms(n, ['ds', 'dp', 'is'])));
        r = { no: [[vs].concat(x.no)], en: [[base, slot(x.en)]], keys: [key, x.key] };
      } else if (v.x.to) {
        var pid = pick(S.PLACES.TO), px = S.np(pid, 'ds');
        r = { no: [[vs, slot('til', { g: 'to' })].concat(px.no)], en: [[base, slot('to'), slot(px.en)]], keys: [key, px.key] };
      } else r = { no: [[vs]], en: [[base]], keys: [key] };
      r.end = '!'; r.verbKey = key;
      return r;
    }
  };
  S.PATTERN_NAMES = Object.keys(PATTERNS);

  /** Try the allowed patterns until one produces a sentence. */
  S.genSentence = function (ctx, o) {
    o = o || {};
    var pats = o.pat || ['svo', 'svo', 'place', 'to'];
    for (var i = 0; i < 40; i++) {
      var s = PATTERNS[pick(pats)](ctx, o);
      if (s && (!o.maxWords || S.words(s.no[0]) <= o.maxWords)) return s;
    }
    return null;
  };

  // ---------- prompt helpers ----------
  function tokensOf(seq, hintMode) {
    return seq.filter(function (sl) { return sl.a[0]; }).map(function (sl) {
      return { t: sl.a[0], g: hintMode === 'lemma' ? (sl.lemma || sl.g) : sl.g, key: sl.key };
    });
  }
  /** Hints for an English prompt: point back at the dictionary form, never the inflected answer. */
  function englishHints(sentence) {
    var out = [];
    sentence.no[0].forEach(function (sl) { if (sl.lemma) out.push(sl.lemma); });
    return S.uniq(out);
  }

  function otherForms(key) {
    var p = key.split(':'), out = [];
    if (p[0] === 'n') {
      var n = S.nouns[p[1]], f = S.nounForms(n);
      (n.mass ? ['is', 'ds'] : ['is', 'ds', 'ip', 'dp']).forEach(function (k) { if (k !== p[2]) out.push(f[k][0]); });
    } else if (p[0] === 'v') {
      var vf = S.verbForms(p[1]);
      ['inf', 'pres', 'past', 'pp'].forEach(function (k) { if (k !== p[2]) out.push(vf[k][0]); });
    } else if (p[0] === 'a') {
      var a = S.adjs[p[1]];
      out = [a.m, a.n, a.pl, a.def];
    }
    return out;
  }
  var NO_FILLER = ['ikke', 'en', 'et', 'ei', 'har', 'er', 'og', 'jeg', 'vi', 'de', 'til', 'i', 'på'];
  var EN_FILLER = ['the', 'a', 'an', 'is', 'are', 'not', 'does', 'did', 'has', 'have', 'was', 'to', 'in'];

  function tilesFor(sentence, lang) {
    var seq = sentence[lang][0], words = S.show(seq).split(' ');
    words[0] = /^(I|Askeladden|Brumle)$/.test(words[0]) ? words[0] : words[0].toLowerCase();
    var extra = [];
    if (lang === 'no') {
      seq.forEach(function (sl) { if (sl.key && sl.role !== 'np') extra = extra.concat(sample(otherForms(sl.key), 2)); });
      extra = extra.concat(sample(NO_FILLER, 2));
    } else {
      sentence.keys.forEach(function (k) {
        var p = k.split(':');
        if (p[0] === 'v' && !S.verbs[p[1]].x.be) { var e = S.enVerb(p[1])[0]; extra = extra.concat(sample([e.base, e.s, e.past, e.pp, e.ing], 2)); }
        if (p[0] === 'n') { var en = S.enNoun(p[1])[0]; extra.push(en.sg, en.pl); }
      });
      extra = sample(extra, 3).concat(sample(EN_FILLER, 2));
    }
    var lower = words.map(function (w) { return w.toLowerCase(); });
    extra = S.uniq(extra).filter(function (w) { return w && w.indexOf(' ') < 0 && lower.indexOf(w.toLowerCase()) < 0; }).slice(0, 5);
    return shuffle(words.concat(extra));
  }

  // ---------- exercise makers ----------
  var M = {};
  function sameInEnglish(id) { var e = S.enNoun(id)[0]; return e.sg === e.pl; }
  /** English wording of a noun form; marks number when English hides it (the sheep). */
  function enLabel(n, form) {
    var en = S.enNounForm(n, form)[0];
    if (sameInEnglish(n.id) && form !== 'is') en += form === 'ds' ? ' (one)' : ' (several)';
    return en;
  }
  function ambiguousInEnglish(keys) {
    return keys.some(function (k) { var p = k.split(':'); return p[0] === 'n' && (p[2] === 'ds' || p[2] === 'dp') && sameInEnglish(p[1]); });
  }
  function formName(f) { return S.FORM_NAMES[f].no + ' · ' + S.FORM_NAMES[f].en; }
  function nounPool(ctx, o, filter) {
    var pool = (o.nouns || focusOr(ctx, 'n')).filter(function (id) { return S.nouns[id] && (!filter || filter(S.nouns[id])); });
    if (!pool.length) pool = ctx.nouns.filter(function (id) { return !filter || filter(S.nouns[id]); });
    return pool;
  }
  function verbPool(ctx, o, filter) {
    var pool = (o.verbs || focusOr(ctx, 'v')).filter(function (id) { return S.verbs[id] && (!filter || filter(S.verbs[id])); });
    if (!pool.length) pool = ctx.verbs.filter(function (id) { return !filter || filter(S.verbs[id]); });
    return pool;
  }
  function modeOf(o, ctx, choices) {
    if (o.mode && o.mode !== 'auto') return o.mode;
    return chance(ctx.hard == null ? 0.5 : ctx.hard) ? 'type' : pick(choices || ['choice']);
  }
  function fakeNounForms(n, real) {
    var b = n.no, stem = b.slice(-1) === 'e' ? b.slice(0, -1) : b;
    return shuffle([stem + 'er', stem + 'en', stem + 'et', stem + 'ene', stem + 'a', b + 'ne', stem + 'ne'])
      .filter(function (w) { return real.indexOf(w) < 0; });
  }
  function fakeVerbForms(v, real) {
    var inf = v.inf, stem = inf.slice(-1) === 'e' && inf.length > 2 ? inf.slice(0, -1) : inf;
    return shuffle([stem + 'et', stem + 'te', stem + 'de', stem + 'dde', stem + 't', stem + 'er', stem + 'ede'])
      .filter(function (w) { return real.indexOf(w) < 0; });
  }
  function optionsWith(correct, others, fakes, size) {
    var opts = S.uniq([correct].concat(shuffle(others)));
    while (opts.length < size && fakes.length) { var f = fakes.shift(); if (opts.indexOf(f) < 0) opts.push(f); }
    opts = shuffle(opts.slice(0, size));
    return { options: opts, answer: opts.indexOf(correct) };
  }

  /** What does this word mean? */
  M.vocab = function (ctx, o) {
    var useVerb = (o.what === 'v') || (o.what !== 'n' && (ctx.focusV || []).length && (!(ctx.focusN || []).length || chance(0.5)));
    var toNo = chance(0.5), mode = modeOf(o, ctx);
    if (useVerb) {
      var vp = verbPool(ctx, o), vid = pickW(vp, ctx, function (x) { return 'w:' + x; });
      if (!vid) return null;
      var v = S.verbs[vid], en = 'to ' + (v.x.gloss || S.enVerbForm(v, 'inf').replace(/^to /, ''));
      var vOthers = sample(ctx.verbs.filter(function (x) { return x !== vid && S.verbs[x].enRaw.split(',')[0] !== v.enRaw.split(',')[0]; }), 3);
      if (mode === 'type') return {
        kind: 'type', title: 'Write this in Norwegian', prompt: { big: en, lang: 'en' }, lang: 'no', pre: 'å',
        answer: [[slot(['', 'å']), slot(S.verbForms(v).inf, { key: 'v:' + vid + ':inf' })]], strict: true, keys: ['w:' + vid], table: { type: 'v', id: vid }
      };
      var vo = toNo
        ? optionsWith('å ' + v.inf, vOthers.map(function (x) { return 'å ' + x; }), [], 4)
        : optionsWith(en, vOthers.map(function (x) { return S.enVerbForm(x, 'inf'); }), [], 4);
      return {
        kind: 'choice', title: toNo ? 'How do you say this in Norwegian?' : 'What does this mean?',
        prompt: toNo ? { big: en, lang: 'en' } : { big: 'å ' + v.inf, lang: 'no', say: 'å ' + v.inf },
        options: vo.options, answer: vo.answer, keys: ['w:' + vid], table: { type: 'v', id: vid }
      };
    }
    var np = nounPool(ctx, o), id = pickW(np, ctx, function (x) { return 'w:' + x; });
    if (!id) return null;
    var n = S.nouns[id], e = S.enNoun(n)[0].sg;
    var others = sample(ctx.nouns.filter(function (x) { return x !== id && S.enNoun(x)[0].sg !== e; }), 3);
    if (mode === 'type') return {
      kind: 'type', title: 'Write this in Norwegian', prompt: { big: n.mass ? e : S.enA(e), lang: 'en', sub: n.mass ? '' : 'Include en, ei or et' }, lang: 'no',
      answer: [(n.mass ? [] : [slot(S.articles(n))]).concat([slot(n.no, { key: 'n:' + id + ':is' })])], strict: true,
      keys: ['w:' + id, 'g:' + id], table: { type: 'n', id: id, hi: 'is' }
    };
    var r = toNo
      ? optionsWith(S.withArticle(n), others.map(function (x) { return S.withArticle(x); }), [], 4)
      : optionsWith(e, others.map(function (x) { return S.enNoun(x)[0].sg; }), [], 4);
    return {
      kind: 'choice', title: toNo ? 'How do you say this in Norwegian?' : 'What does this mean?',
      prompt: toNo ? { big: n.mass ? e : S.enA(e), lang: 'en' } : { big: S.withArticle(n), lang: 'no', say: S.withArticle(n) },
      options: r.options, answer: r.answer, keys: ['w:' + id], table: { type: 'n', id: id, hi: 'is' }
    };
  };

  /** en, ei or et? */
  M.gender = function (ctx, o) {
    var id = pickW(nounPool(ctx, o), ctx, function (x) { return 'g:' + x; });
    if (!id) return null;
    var n = S.nouns[id], arts = S.articles(n), opts = ['en', 'ei', 'et'];
    return {
      kind: 'choice', title: 'En, ei or et?', row: true,
      prompt: { big: '___ ' + n.no, lang: 'no', sub: S.enNoun(n)[0].sg, say: n.no },
      options: opts, answer: opts.indexOf(arts[0]), answers: arts.map(function (a) { return opts.indexOf(a); }),
      keys: ['g:' + id], table: { type: 'n', id: id, hi: 'is' },
      explain: n.g === 'f' ? 'Feminine noun: ei ' + n.no + '. Bokmål also allows en ' + n.no + '.' : cap(arts[0]) + ' ' + n.no + ' — ' + (n.g === 'n' ? 'a neuter (et) word.' : 'a masculine (en) word.')
    };
  };

  var SEEABLE = 'person creature animal obj thing building place nature food';
  var GAPS = {
    ds: [['Jeg ser ___.', 'I see {x}.'], ['Hvor er ___?', 'Where is {x}?'], ['___ er her.', '{X} is here.'], ['Vi liker ___.', 'We like {x}.']],
    dp: [['Jeg ser ___.', 'I see {x}.'], ['Hvor er ___?', 'Where are {x}?'], ['___ er her.', '{X} are here.'], ['Vi liker ___.', 'We like {x}.']],
    ip: [['Jeg ser to ___.', 'I see two {x}.'], ['Vi har mange ___.', 'We have many {x}.'], ['Det er tre ___ her.', 'There are three {x} here.']]
  };
  var PLAIN_GAPS = { ds: [['___', '{x}']], dp: [['___', '{x}']], ip: [['fem ___', 'five {x}'], ['mange ___', 'many {x}']] };

  /** Noun endings: -en / -a / -et, -er, -ene. */
  M.nform = function (ctx, o) {
    var forms = o.forms || ['ds', 'ip', 'dp'];
    var pool = nounPool(ctx, o, function (n) { return !n.mass || forms.indexOf('ds') >= 0; });
    var form = pick(forms);
    var id = pickW(pool, ctx, function (x) { return 'n:' + x + ':' + form; });
    if (!id) return null;
    var n = S.nouns[id];
    if (n.mass) form = 'ds';
    var f = S.nounForms(n), key = 'n:' + id + ':' + form, target = f[form][0];
    var en = enLabel(n, form), lemma = n.mass ? n.no : form === 'is' ? n.no : S.withArticle(n);
    var all = n.mass ? [f.is[0], f.ds[0]] : [f.is[0], f.ds[0], f.ip[0], f.dp[0]];
    var accepted = [].concat(f.is, f.ds, f.ip, f.dp);
    var base = { keys: [key], table: { type: 'n', id: id, hi: form }, explain: S.nounRule(n, form), say: target };
    var mode = modeOf(o, ctx, ['choice', 'choice', 'gap', 'read']);
    if (mode === 'read') {
      var enAll = (n.mass ? ['is', 'ds'] : ['is', 'ds', 'ip', 'dp']).map(function (k) { return enLabel(n, k); });
      // a one-syllable et-word looks the same in singular and plural, so ask about a clear form
      if (f.is[0] === f.ip[0] && (form === 'is' || form === 'ip')) { form = 'dp'; target = f.dp[0]; en = enLabel(n, 'dp'); base.keys = ['n:' + id + ':dp']; base.table.hi = 'dp'; base.explain = S.nounRule(n, 'dp'); }
      var ro = optionsWith(en, enAll, [], 4);
      base.kind = 'choice'; base.title = 'What does this form mean?';
      base.prompt = { big: target, lang: 'no', say: target };
      base.options = ro.options; base.answer = ro.answer;
      return base;
    }
    if (mode === 'gap' && form !== 'is') {
      var frames = has(n, SEEABLE) && !n.mass ? GAPS[form] : PLAIN_GAPS[form];
      var fr = pick(frames), asChoice = chance(1 - (ctx.hard == null ? 0.5 : ctx.hard));
      base.prompt = { text: fr[0], lang: 'no', sub: fr[1].replace('{x}', en).replace('{X}', cap(en)), chip: lemma, say: fr[0].replace('___', target) };
      if (asChoice) {
        var go = optionsWith(target, all, fakeNounForms(n, accepted), 4);
        base.kind = 'choice'; base.title = 'Fill in the missing word'; base.options = go.options; base.answer = go.answer;
      } else {
        base.kind = 'type'; base.title = 'Fill in the missing word'; base.lang = 'no'; base.strict = true; base.inline = true;
        base.answer = [[slot(f[form], { key: key })]];
      }
      return base;
    }
    if (mode === 'type' || mode === 'gap') {
      base.kind = 'type'; base.title = 'Write the right form'; base.lang = 'no'; base.strict = true;
      base.prompt = { big: '“' + en + '”', lang: 'en', chip: lemma, sub: formName(form) };
      base.answer = [[slot(f[form], { key: key })]];
      if (form === 'is' && !n.mass) { base.answer = [[slot(S.articles(n)), slot(f.is, { key: key })]]; base.keys.push('g:' + id); }
      return base;
    }
    var co = optionsWith(target, all, fakeNounForms(n, accepted), 4);
    base.kind = 'choice'; base.title = 'Choose the right form';
    base.prompt = { big: '“' + en + '”', lang: 'en', chip: lemma };
    base.options = co.options; base.answer = co.answer;
    return base;
  };

  /** The whole declension of one noun. */
  M.ntable = function (ctx, o) {
    var id = pickW(nounPool(ctx, o, function (n) { return !n.mass; }), ctx, function (x) { return 'n:' + x; });
    if (!id) return null;
    var n = S.nouns[id], f = S.nounForms(n);
    return {
      kind: 'table', title: 'Fill in every form', prompt: { big: S.withArticle(n), lang: 'no', sub: S.enNoun(n)[0].sg, say: S.withArticle(n) },
      rows: ['ds', 'ip', 'dp'].map(function (k) {
        return { label: S.FORM_NAMES[k].no, hint: enLabel(n, k), answer: f[k], key: 'n:' + id + ':' + k };
      }),
      keys: ['n:' + id + ':ds', 'n:' + id + ':ip', 'n:' + id + ':dp'], table: { type: 'n', id: id }
    };
  };

  var TENSE_OF = { pres: 'pres', past: 'past', pp: 'perf', inf: 'pres' };
  /** Verb forms: present, past, perfect, imperative. */
  M.vform = function (ctx, o) {
    var forms = o.forms || ['pres', 'past', 'pp'], form = pick(forms);
    var pool = verbPool(ctx, o, function (v) {
      if (v.x.modal) return form === 'pres' || form === 'past';
      return form !== 'imp' || (!v.x.st && !v.x.noImp && v.x.subj !== 'fly');
    });
    var id = pickW(pool, ctx, function (x) { return 'v:' + x + ':' + form; });
    if (!id) return null;
    var v = S.verbs[id], f = S.verbForms(v), key = 'v:' + id + ':' + form, target = f[form][0];
    var en = S.enVerbForm(v, form), lemma = 'å ' + v.inf;
    var all = [f.inf[0], f.pres[0], f.past[0], f.pp[0]], accepted = [].concat(f.inf, f.pres, f.past, f.pp, f.imp);
    var base = { keys: [key], table: { type: 'v', id: id, hi: form }, explain: S.verbRule(v, form), say: target };
    var mode = modeOf(o, ctx, ['choice', 'gap', 'gap', 'read']);
    if (mode === 'read' && !v.x.modal && !v.x.be && form !== 'imp') {
      var e = S.enVerb(v)[0];
      var noMap = { pres: 'hun ' + f.pres[0], past: 'hun ' + f.past[0], pp: 'hun har ' + f.pp[0], inf: 'å ' + f.inf[0] };
      var enMap = { pres: 'she ' + e.s, past: 'she ' + e.past, pp: 'she has ' + e.pp, inf: 'to ' + e.base };
      var ro = optionsWith(enMap[form], [enMap.pres, enMap.past, enMap.pp, enMap.inf], [], 4);
      base.kind = 'choice'; base.title = 'What does this form mean?';
      base.prompt = { big: noMap[form], lang: 'no', say: noMap[form] };
      base.options = ro.options; base.answer = ro.answer;
      return base;
    }
    if (mode === 'gap' || mode === 'read') {
      var so = { verb: id, tense: [TENSE_OF[form] || 'pres'], pat: ['svo', 'place', 'to', 'comp', 'bare'], subj: ['noun', 'noun', 'pron'], num: 0.4, maxWords: 7 };
      if (form === 'inf') { so.modal = ['kan', 'vil', 'må', 'skal']; so.modalP = 1; }
      if (form === 'past') so.front = 0.5;
      var s = v.x.modal ? null : (form === 'imp' ? PATTERNS.imp(ctx, { verb: id }) : S.genSentence(ctx, so));
      if (s && s.verbKey === key) {
        var seq = s.no[0], text = seq.filter(function (sl) { return sl.a[0]; }).map(function (sl) { return sl.key === key ? '___' : sl.a[0]; }).join(' ');
        var asChoice = chance(1 - (ctx.hard == null ? 0.5 : ctx.hard));
        base.prompt = { text: cap(text) + s.end, lang: 'no', sub: S.show(s.en[0], s.end), chip: lemma, say: S.show(seq, s.end) };
        base.title = 'Fill in the verb';
        if (asChoice) {
          var go = optionsWith(target, all, fakeVerbForms(v, accepted), 4);
          base.kind = 'choice'; base.options = go.options; base.answer = go.answer;
        } else {
          base.kind = 'type'; base.lang = 'no'; base.strict = true; base.inline = true; base.answer = [[slot(f[form], { key: key })]];
        }
        return base;
      }
      mode = chance(ctx.hard == null ? 0.5 : ctx.hard) ? 'type' : 'choice';
    }
    var label = form === 'imp' ? en : '“' + en + '”';
    if (mode === 'type') {
      base.kind = 'type'; base.title = 'Write the verb form'; base.lang = 'no'; base.strict = true;
      base.pre = form === 'pp' ? 'har' : form === 'inf' ? 'å' : '';
      base.prompt = { big: lemma, lang: 'no', chip: formName(form), sub: label };
      base.answer = [(base.pre ? [slot(['', base.pre])] : []).concat([slot(f[form], { key: key })])];
      return base;
    }
    var others = form === 'imp' ? [f.inf[0], f.pres[0], f.past[0]] : all;
    var co = optionsWith(target, others, fakeVerbForms(v, accepted), 4);
    base.kind = 'choice'; base.title = 'Choose the ' + S.FORM_NAMES[form].en + ' form';
    base.prompt = { big: lemma, lang: 'no', chip: formName(form), sub: label };
    base.options = co.options; base.answer = co.answer;
    return base;
  };

  /** Present, past and perfect of one verb. */
  M.vtable = function (ctx, o) {
    var id = pickW(verbPool(ctx, o, function (v) { return !v.x.modal; }), ctx, function (x) { return 'v:' + x; });
    if (!id) return null;
    var v = S.verbs[id], f = S.verbForms(v);
    return {
      kind: 'table', title: 'Fill in every form', prompt: { big: 'å ' + v.inf, lang: 'no', sub: S.enVerbForm(v, 'inf'), say: 'å ' + v.inf },
      rows: ['pres', 'past', 'pp'].map(function (k) {
        return { label: S.FORM_NAMES[k].no, hint: S.enVerbForm(v, k), pre: k === 'pp' ? 'har' : '', answer: f[k], key: 'v:' + id + ':' + k };
      }),
      keys: ['v:' + id + ':pres', 'v:' + id + ':past', 'v:' + id + ':pp'], table: { type: 'v', id: id }
    };
  };

  function translation(sentence, dir, input, ctx) {
    if (ambiguousInEnglish(sentence.keys)) dir = 'no-en';
    var toNo = dir === 'en-no', src = toNo ? 'en' : 'no', dst = toNo ? 'no' : 'en';
    var ex = {
      title: toNo ? 'Write this in Norwegian' : 'Write this in English', lang: dst,
      prompt: { text: S.show(sentence[src][0], sentence.end), lang: src },
      answer: sentence[dst], keys: sentence.keys, solution: S.show(sentence[dst][0], sentence.end)
    };
    if (toNo) ex.prompt.hints = englishHints(sentence);
    else { ex.prompt.tokens = tokensOf(sentence.no[0]); ex.prompt.end = sentence.end; ex.prompt.say = ex.prompt.text; }
    if (toNo) ex.say = ex.solution;
    if (input === 'bank') { ex.kind = 'bank'; ex.tiles = tilesFor(sentence, dst); }
    else ex.kind = 'type';
    return ex;
  }
  function pickDir(o) { return !o.dir || o.dir === 'mix' ? (chance(0.6) ? 'en-no' : 'no-en') : o.dir; }
  function pickInput(o, ctx) {
    if (o.input && o.input !== 'auto') return o.input;
    return chance((ctx.hard == null ? 0.5 : ctx.hard) * 0.9) ? 'type' : 'bank';
  }

  /** Translate a whole generated sentence. */
  M.sent = function (ctx, o) {
    var s = S.genSentence(ctx, o);
    if (!s) return null;
    return translation(s, pickDir(o), pickInput(o, ctx), ctx);
  };

  /** Everyday phrases. */
  M.phrase = function (ctx, o) {
    var pool = S.PHRASES.filter(function (p) { return !o.ids || o.ids.indexOf(p.id) >= 0; });
    var p = pickW(pool, ctx, function (x) { return 'p:' + x.id; });
    if (!p) return null;
    var s = { no: [[slot(p.no)]], en: [[slot(p.en)]], keys: ['p:' + p.id], end: /^(hva|hvor|hvem|hvordan|snakker)/.test(p.no[0]) ? '?' : '' };
    var dir = pickDir(o), mode = o.mode || (chance(0.35) ? 'choice' : 'write');
    if (mode === 'choice') {
      var toNo = dir === 'en-no', other = sample(S.PHRASES.filter(function (x) { return x.id !== p.id; }), 3);
      var r = optionsWith(cap(toNo ? p.no[0] : p.en[0]), other.map(function (x) { return cap(toNo ? x.no[0] : x.en[0]); }), [], 4);
      return {
        kind: 'choice', title: toNo ? 'How do you say this in Norwegian?' : 'What does this mean?',
        prompt: { big: cap(toNo ? p.en[0] : p.no[0]) + s.end, lang: toNo ? 'en' : 'no', say: toNo ? null : p.no[0] },
        options: r.options, answer: r.answer, keys: s.keys, say: p.no[0]
      };
    }
    var ex = translation(s, dir, pickInput(o, ctx), ctx);
    if (ex.kind === 'bank') {
      var words = (dir === 'en-no' ? p.no[0] : p.en[0]).split(' ');
      var noise = sample(S.PHRASES.filter(function (x) { return x.id !== p.id; }), 3).map(function (x) { return pick((dir === 'en-no' ? x.no[0] : x.en[0]).split(' ')); });
      ex.tiles = shuffle(words.concat(S.uniq(noise).filter(function (w) { return words.indexOf(w) < 0; })));
    }
    delete ex.prompt.tokens; delete ex.prompt.hints;
    return ex;
  };

  /** Tap the pairs. */
  M.match = function (ctx, o) {
    var what = o.what || pick(['vocab', 'nform', 'vform']), pairs = [];
    function push(a, b, key) { if (!pairs.some(function (p) { return p.a === a || p.b === b; })) pairs.push({ a: a, b: b, key: key }); }
    if (what === 'nform') {
      var ids = sample(nounPool(ctx, o, function (n) { return !n.mass; }), 3);
      if (ids.length < 2) return null;
      var forms = o.forms || ['ds', 'ip', 'dp'];
      ids.forEach(function (id) {
        sample(forms, 2).forEach(function (k) {
          var f = S.nounForms(id);
          var label = k === 'ip' ? 'to ' + f.ip[0] : f[k][0], en = k === 'ip' ? 'two ' + S.enNounForm(id, k)[0] : S.enNounForm(id, k)[0];
          push(label, en, 'n:' + id + ':' + k);
        });
      });
    } else if (what === 'vform') {
      var vids = sample(verbPool(ctx, o, function (v) { return !v.x.modal && !v.x.be; }), 3);
      if (vids.length < 2) return null;
      var vforms = o.forms || ['pres', 'past', 'pp'];
      vids.forEach(function (id) {
        var f = S.verbForms(id), e = S.enVerb(id)[0];
        sample(vforms.filter(function (k) { return k !== 'imp' && k !== 'inf'; }), 2).forEach(function (k) {
          if (k === 'pres') push('han ' + f.pres[0], 'he ' + e.s, 'v:' + id + ':pres');
          if (k === 'past') push('han ' + f.past[0], 'he ' + e.past, 'v:' + id + ':past');
          if (k === 'pp') push('han har ' + f.pp[0], 'he has ' + e.pp, 'v:' + id + ':pp');
        });
      });
    } else {
      var useV = (ctx.focusV || []).length && (!(ctx.focusN || []).length || chance(0.5));
      if (useV) sample(verbPool(ctx, o), 5).forEach(function (id) { push('å ' + id, S.enVerbForm(id, 'inf'), 'w:' + id); });
      else sample(nounPool(ctx, o), 5).forEach(function (id) { push(S.withArticle(id), S.enNoun(id)[0].sg, 'w:' + id); });
    }
    pairs = pairs.slice(0, 5);
    if (pairs.length < 3) return null;
    return {
      kind: 'match', title: 'Match the pairs', pairs: pairs,
      left: shuffle(pairs.map(function (p) { return p.a; })), right: shuffle(pairs.map(function (p) { return p.b; })),
      keys: pairs.map(function (p) { return p.key; })
    };
  };

  /** Adjective agreement: stor / stort / store. */
  M.adj = function (ctx, o) {
    var adjs = ctx.adjs && ctx.adjs.length ? ctx.adjs : S.adjList;
    var frame = pick(o.frames || ['attr', 'pred', 'def']);
    var pool = nounPool(ctx, o, function (n) { return adjs.some(function (a) { return S.adjFits(a, n); }) && !n.mass && !has(n, 'time body'); });
    if (!pool.length) return null;
    var id = pick(pool), n = S.nouns[id], f = S.nounForms(n);
    var a = S.adjs[pickW(adjs.filter(function (x) { return S.adjFits(x, n); }), ctx, function (x) { return 'a:' + x; })];
    var plural = chance(0.35), target, text, en, e = S.enNoun(n)[0];
    if (frame === 'attr') {
      target = S.adjFor(a, n, plural);
      text = plural ? 'to ___ ' + f.ip[0] : S.articles(n)[0] + ' ___ ' + n.no;
      en = plural ? 'two ' + a.en[0] + ' ' + e.pl : S.enA(a.en[0] + ' ' + e.sg);
    } else if (frame === 'pred') {
      target = S.adjFor(a, n, plural);
      text = cap(plural ? f.dp[0] : f.ds[0]) + ' er ___.';
      en = 'The ' + (plural ? e.pl + ' are ' : e.sg + ' is ') + a.en[0] + '.';
    } else {
      target = plural ? S.adjFor(a, n, true) : [a.def];
      text = (plural ? 'de' : n.g === 'n' ? 'det' : 'den') + ' ___ ' + (plural ? f.dp[0] : f.ds[0]);
      en = 'the ' + a.en[0] + ' ' + (plural ? e.pl : e.sg);
    }
    var why = frame === 'def' ? 'After den, det and de the adjective takes the -e form: ' + text.replace('___', target[0]) + '.'
      : plural ? 'Plural nouns take the -e form: ' + target[0] + '.'
      : n.g === 'n' ? 'Et-words take the -t form: et ' + a.n + ' ' + n.no + '.' : 'En- and ei-words take the base form: ' + a.m + '.';
    var base = {
      prompt: { text: text, lang: 'no', sub: en, chip: a.m, say: text.replace('___', target[0]) },
      keys: ['a:' + a.id], explain: why, table: { type: 'a', id: a.id }
    };
    if (modeOf(o, ctx) === 'type') {
      base.kind = 'type'; base.title = 'Fill in the adjective'; base.lang = 'no'; base.strict = true; base.inline = true;
      base.answer = [[slot(target, { key: 'a:' + a.id })]];
    } else {
      var r = optionsWith(target[0], S.uniq([a.m, a.f, a.n, a.pl, a.def]), [a.m + 'e', a.m + 't', a.m + 'er'], 3);
      base.kind = 'choice'; base.title = 'Fill in the adjective'; base.options = r.options; base.answer = r.answer; base.row = true;
    }
    return base;
  };

  /** min / mi / mitt / mine after the definite noun. */
  M.poss = function (ctx, o) {
    var pool = nounPool(ctx, o, function (n) { return !n.mass && has(n, 'person animal obj thing building body'); });
    if (!pool.length) return null;
    var id = pick(pool), n = S.nouns[id], f = S.nounForms(n);
    var mode = modeOf(o, ctx, ['choice']);
    var row = mode === 'type' ? pick(S.POSS) : pick([S.POSS[0], S.POSS[1], S.POSS[4]]);
    var plural = chance(0.35), form = plural ? 'dp' : 'ds', x = S.np(id, form, { poss: row });
    var def = f[form][0];
    var target = plural ? row[3] : n.g === 'n' ? row[2] : /a$/.test(def) && n.g === 'f' ? row[1] : row[0];
    var base = {
      keys: [x.key, 'p:' + row[0]], table: { type: 'n', id: id, hi: form },
      explain: 'The owner word comes after the noun, the noun takes its definite form, and the two agree: ' + def + ' ' + target + '.'
    };
    if (mode === 'type') {
      base.kind = 'type'; base.title = 'Write this in Norwegian'; base.lang = 'no';
      base.prompt = { big: '“' + x.en[0] + '”', lang: 'en', chip: S.withArticle(n) };
      base.answer = [x.no]; base.solution = def + ' ' + target;
      return base;
    }
    var opts = S.uniq(row.slice(0, 4));
    base.kind = 'choice'; base.title = 'Choose the owner word'; base.row = true;
    base.prompt = { text: def + ' ___', lang: 'no', sub: x.en[0], say: def + ' ' + target };
    base.options = opts; base.answer = opts.indexOf(target);
    return base;
  };

  /** Listen and write (only offered when the browser has a Norwegian voice). */
  M.listen = function (ctx, o) {
    var s = S.genSentence(ctx, o);
    if (!s) return null;
    var text = S.show(s.no[0], s.end);
    return {
      kind: 'type', title: 'Write what you hear', lang: 'no', listen: true,
      prompt: { audio: text, lang: 'no', say: text }, answer: s.no, keys: s.keys, solution: text,
      translation: S.show(s.en[0], s.end)
    };
  };

  S.makers = M;
  S.makeExercise = function (spec, ctx) {
    var fn = M[spec.t];
    if (!fn) throw new Error('Unknown exercise type: ' + spec.t);
    for (var i = 0; i < 12; i++) {
      var ex = fn(ctx, spec);
      if (ex) { ex.type = spec.t; return ex; }
    }
    return null;
  };

  function signature(ex) {
    var p = ex.prompt || {};
    return [ex.kind, ex.title, p.big, p.text, p.audio, p.chip, p.sub, (ex.left || []).join('|')].join('~');
  }
  /** Build a list of exercises from a recipe: [{t, n, ...options}] */
  S.buildSession = function (recipe, ctx, opts) {
    opts = opts || {};
    var out = [], seen = {};
    recipe.forEach(function (spec) {
      for (var i = 0; i < (spec.n || 1); i++) {
        for (var tries = 0; tries < 8; tries++) {
          var ex = S.makeExercise(spec, ctx);
          if (!ex) break;
          var sig = signature(ex);
          if (seen[sig]) continue;
          seen[sig] = 1; out.push(ex); break;
        }
      }
    });
    if (opts.shuffle) out = shuffle(out);
    if (opts.limit) out = out.slice(0, opts.limit);
    return out;
  };
})(globalThis.Sproke = globalThis.Sproke || {});
