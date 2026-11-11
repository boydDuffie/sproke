/* Sproke — inflection. Turns the compact word lists into full paradigms. */
(function (S) {
  'use strict';

  var VOWELS = 'aeiouyæøå';
  S.FORM_NAMES = {
    is: { no: 'ubestemt entall', en: 'indefinite singular', ex: 'a …' },
    ds: { no: 'bestemt entall', en: 'definite singular', ex: 'the …' },
    ip: { no: 'ubestemt flertall', en: 'indefinite plural', ex: '…s' },
    dp: { no: 'bestemt flertall', en: 'definite plural', ex: 'the …s' },
    inf: { no: 'infinitiv', en: 'infinitive', ex: 'to …' },
    pres: { no: 'presens', en: 'present', ex: 'now' },
    past: { no: 'preteritum', en: 'past', ex: 'yesterday' },
    pp: { no: 'perfektum', en: 'perfect', ex: 'has …' },
    imp: { no: 'imperativ', en: 'imperative', ex: 'command' }
  };
  S.settings = { fem: true };   // ei/-a (true) or en/-en (false) shown first for feminine nouns

  function syllables(w) {
    var n = 0, inV = false;
    for (var i = 0; i < w.length; i++) {
      var v = VOWELS.indexOf(w[i]) >= 0;
      if (v && !inV) n++;
      inV = v;
    }
    return n;
  }
  function uniq(a) { return a.filter(function (x, i) { return x && a.indexOf(x) === i; }); }

  // ---------- nouns ----------
  S.nouns = {};
  S.NOUNS.forEach(function (r) {
    var x = r[4] || {};
    S.nouns[r[0]] = { id: r[0], no: r[0], g: r[1], enRaw: r[2], tags: r[3].split(' '), x: x, mass: !!x.mass };
  });
  S.nounList = Object.keys(S.nouns);

  /** All four forms. Each value is a list: preferred spelling first, accepted variants after. */
  S.nounForms = function (n) {
    if (typeof n === 'string') n = S.nouns[n];
    var b = n.no, x = n.x, stem = b.slice(-1) === 'e' ? b.slice(0, -1) : b;
    var f = { is: [b] };
    if (x.agent) {
      f.ds = [b + 'en']; f.ip = [b + 'e']; f.dp = [b + 'ne'];
    } else if (n.g === 'n') {
      f.ds = [stem + 'et'];
      f.ip = [syllables(b) === 1 ? b : stem + 'er'];
      f.dp = [stem + 'ene', stem + 'a'];
    } else {
      f.ds = [stem + 'en'];
      f.ip = [stem + 'er'];
      f.dp = [stem + 'ene'];
    }
    if (n.g === 'f') {
      var a = stem + 'a', en = stem + 'en';
      f.ds = S.settings.fem ? [a, en] : [en, a];
    }
    ['ds', 'ip', 'dp'].forEach(function (k) {
      if (x[k]) f[k] = [x[k]];
      if (x[k + 'Alt']) f[k] = f[k].concat(x[k + 'Alt']);
      f[k] = uniq(f[k]);
    });
    return f;
  };
  /** Indefinite articles, preferred first. */
  S.articles = function (n) {
    if (typeof n === 'string') n = S.nouns[n];
    if (n.g === 'n') return ['et'];
    if (n.g === 'f') return S.settings.fem ? ['ei', 'en'] : ['en', 'ei'];
    return ['en'];
  };
  S.withArticle = function (n) {
    if (typeof n === 'string') n = S.nouns[n];
    return S.articles(n)[0] + ' ' + n.no;
  };
  /** Which rule a form follows — used to explain mistakes. */
  S.nounRule = function (n, form) {
    if (typeof n === 'string') n = S.nouns[n];
    var f = S.nounForms(n), b = n.no, x = n.x, art = S.articles(n)[0];
    var target = f[form][0];
    if (form === 'is') return 'The base form. It is ' + art + '-word: ' + art + ' ' + b + '.';
    if (form === 'ds') {
      if (x.ds) return 'Irregular: ' + art + ' ' + b + ' → ' + target + '.';
      if (n.g === 'm') return 'En-words add -en for “the”: en ' + b + ' → ' + target + '.';
      if (n.g === 'n') return 'Et-words add -et for “the”: et ' + b + ' → ' + target + '.';
      return 'Ei-words add -a for “the” (-en is also accepted): ' + b + ' → ' + f.ds.join(' / ') + '.';
    }
    if (form === 'ip') {
      if (x.ip && x.ip === b) return 'This one does not change in the plural: ' + art + ' ' + b + ' → mange ' + target + '.';
      if (x.ip) return 'Irregular plural, learn it as a pair: ' + b + ' → ' + target + '.';
      if (x.agent) return 'Person nouns ending in -er add only -e: ' + b + ' → ' + target + '.';
      if (n.g === 'n' && target === b) return 'One-syllable et-words stay the same in the plural: et ' + b + ' → mange ' + target + '.';
      return 'Most nouns add -er for the plural: ' + b + ' → ' + target + '.';
    }
    if (x.dp === 'barna') return 'Barn is special: the plural “the children” is barna.';
    if (x.dp) return 'Built on the irregular plural ' + f.ip[0] + ' → ' + target + '.';
    if (x.agent) return 'Person nouns ending in -er: ' + f.ip[0] + ' → ' + target + ' (-ne).';
    return '“The” + plural is -ene for almost every noun: ' + b + ' → ' + target + '.';
  };

  // ---------- English nouns ----------
  S.enPlural = function (w) {
    var parts = w.split(' '), last = parts.pop(), pl;
    if (S.EN_PLURALS[last]) pl = S.EN_PLURALS[last];
    else if (/[^aeiou]y$/.test(last)) pl = last.slice(0, -1) + 'ies';
    else if (/(s|x|z|ch|sh)$/.test(last)) pl = last + 'es';
    else pl = last + 's';
    return parts.concat(pl).join(' ');
  };
  S.enA = function (w) { return (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w; };
  S.enNoun = function (n) {
    if (typeof n === 'string') n = S.nouns[n];
    return n.enRaw.split('|').map(function (sg) { return { sg: sg, pl: S.enPlural(sg) }; });
  };
  /** English wording of one noun form, all synonyms. */
  S.enNounForm = function (n, form) {
    if (typeof n === 'string') n = S.nouns[n];
    return S.enNoun(n).map(function (e) {
      if (form === 'is') return n.mass ? e.sg : S.enA(e.sg);
      if (form === 'ds') return 'the ' + e.sg;
      if (form === 'ip') return e.pl;
      return 'the ' + e.pl;
    });
  };

  // ---------- verbs ----------
  S.verbs = {};
  S.VERBS.forEach(function (r) {
    var x = r[3] || {};
    S.verbs[r[0]] = { id: r[0], inf: r[0], cls: r[1], enRaw: r[2], x: x };
  });
  S.verbList = Object.keys(S.verbs);

  function undouble(stem) {
    var n = stem.length;
    return n > 1 && stem[n - 1] === stem[n - 2] ? stem.slice(0, -1) : stem;
  }
  S.verbForms = function (v) {
    if (typeof v === 'string') v = S.verbs[v];
    var inf = v.inf, x = v.x;
    var stem = inf.slice(-1) === 'e' && inf.length > 2 ? inf.slice(0, -1) : inf;
    var f = { inf: [inf], pres: [inf + 'r'] };
    if (v.cls === '1') { f.past = [stem + 'et', stem + 'a']; f.pp = [stem + 'et', stem + 'a']; }
    else if (v.cls === '2') { var s2 = undouble(stem); f.past = [s2 + 'te']; f.pp = [s2 + 't']; }
    else if (v.cls === '3') { var s3 = undouble(stem); f.past = [s3 + 'de']; f.pp = [s3 + 'd']; }
    else if (v.cls === '4') { f.past = [inf + 'dde']; f.pp = [inf + 'dd']; }
    else { f.pres = [x.pres]; f.past = [x.past]; f.pp = [x.pp]; }
    var imp = stem;
    if (/mm$/.test(imp)) imp = imp.slice(0, -1);
    f.imp = [x.imp || imp];
    ['past', 'pp'].forEach(function (k) { if (x[k + 'Alt']) f[k] = f[k].concat(x[k + 'Alt']); });
    return f;
  };
  S.VERB_GROUPS = {
    '1': { name: 'Group 1', hint: '-et', rule: 'adds -et in the past and after har' },
    '2': { name: 'Group 2', hint: '-te', rule: 'adds -te in the past and -t after har' },
    '3': { name: 'Group 3', hint: '-de', rule: 'adds -de in the past and -d after har' },
    '4': { name: 'Group 4', hint: '-dde', rule: 'is a short verb: -dde in the past and -dd after har' },
    s: { name: 'Strong', hint: 'irregular', rule: 'is irregular, so the forms have to be memorised' }
  };
  S.verbRule = function (v, form) {
    if (typeof v === 'string') v = S.verbs[v];
    var f = S.verbForms(v), line = 'å ' + v.inf + ' → ' + f.pres[0] + ' → ' + f.past[0] + ' → har ' + f.pp[0];
    if (form === 'pres') return (v.cls === 's' && f.pres[0] !== v.inf + 'r' ? 'Irregular present. ' : 'The present adds -r to the infinitive, the same for every person. ') + line;
    if (form === 'inf') return 'After kan, vil, må and skal the verb stays in the infinitive, without å. ' + line;
    if (form === 'imp') return 'A command is the infinitive without its final -e: ' + v.inf + ' → ' + f.imp[0] + '!';
    return 'Å ' + v.inf + ' ' + S.VERB_GROUPS[v.cls].rule + '. ' + line;
  };

  // ---------- English verbs ----------
  function en3(b) {
    if (b === 'have') return 'has';
    if (/(s|x|z|ch|sh|o)$/.test(b)) return b + 'es';
    if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + 'ies';
    return b + 's';
  }
  function enPast(b) {
    if (/e$/.test(b)) return b + 'd';
    if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + 'ied';
    return b + 'ed';
  }
  function enIng(b) {
    if (/ie$/.test(b)) return b.slice(0, -2) + 'ying';
    if (/[^eoy]e$/.test(b)) return b.slice(0, -1) + 'ing';
    return b + 'ing';
  }
  S.enVerb = function (v) {
    if (typeof v === 'string') v = S.verbs[v];
    return v.enRaw.split('|').map(function (raw) {
      var p = raw.split(','), b = p[0];
      var past = p[1] || enPast(b);
      return { base: b, s: en3(b), past: past, pp: p[2] || past, ing: p[3] || enIng(b) };
    });
  };
  /** Short English gloss for one verb form, e.g. "ate". */
  S.enVerbForm = function (v, form) {
    if (typeof v === 'string') v = S.verbs[v];
    var x = v.x;
    if (x.modal) return form === 'past' ? x.glossPast : x.gloss;
    if (x.be) return { inf: 'to be', pres: 'am / is / are', past: 'was / were', pp: 'been', imp: 'be!' }[form];
    var e = S.enVerb(v)[0], g = x.gloss;
    if (form === 'inf') return 'to ' + (g || e.base);
    if (form === 'pres') return g || (e.base + ' / ' + e.s);
    if (form === 'past') return g ? e.past + ' / became' : e.past;
    if (form === 'pp') return g ? e.pp + ' / become' : e.pp;
    return e.base + '!';
  };

  // ---------- adjectives ----------
  S.adjs = {};
  S.ADJS.forEach(function (r) {
    var x = r[5] || {};
    S.adjs[r[0]] = {
      id: r[0], m: r[0], f: x.f || r[0], n: r[1], pl: r[2], def: x.def || r[2],
      plAlt: x.plAlt || [], en: r[3].split('|'), fits: r[4].split(' ')
    };
  });
  S.adjList = Object.keys(S.adjs);
  var SIZED = ['person', 'creature', 'animal', 'obj', 'thing', 'building'];
  S.adjFits = function (a, n) {
    if (typeof a === 'string') a = S.adjs[a];
    if (typeof n === 'string') n = S.nouns[n];
    if (n.mass && a.fits.indexOf('temp') < 0) return false;
    return a.fits.some(function (t) {
      if (t === 'size') return SIZED.some(function (s) { return n.tags.indexOf(s) >= 0; });
      return n.tags.indexOf(t) >= 0;
    });
  };
  /** Indefinite agreement: which adjective form goes with this noun (sg) or with plurals. */
  S.adjFor = function (a, n, plural) {
    if (typeof a === 'string') a = S.adjs[a];
    if (typeof n === 'string') n = S.nouns[n];
    if (plural) return [a.pl].concat(a.plAlt);
    if (n.g === 'n') return [a.n];
    if (n.g === 'f' && a.f !== a.m) return S.settings.fem ? [a.f, a.m] : [a.m, a.f];
    return [a.m];
  };

  // ---------- reverse index: spelled form -> what it is ----------
  var index = null;
  S.formIndex = function () {
    if (index) return index;
    index = {};
    function add(w, info) { (index[w] = index[w] || []).push(info); }
    S.nounList.forEach(function (id) {
      var f = S.nounForms(id);
      ['is', 'ds', 'ip', 'dp'].forEach(function (k) {
        if (S.nouns[id].mass && (k === 'ip' || k === 'dp')) return;
        f[k].forEach(function (w) { add(w, { kind: 'n', id: id, form: k }); });
      });
    });
    S.verbList.forEach(function (id) {
      var f = S.verbForms(id);
      ['inf', 'pres', 'past', 'pp', 'imp'].forEach(function (k) {
        f[k].forEach(function (w) { add(w, { kind: 'v', id: id, form: k }); });
      });
    });
    S.adjList.forEach(function (id) {
      var a = S.adjs[id];
      uniq([a.m, a.f, a.n, a.pl, a.def]).forEach(function (w) { add(w, { kind: 'a', id: id }); });
    });
    return index;
  };
  S.resetIndex = function () { index = null; };
  S.syllables = syllables;
  S.uniq = uniq;
})(globalThis.Sproke = globalThis.Sproke || {});
