/* Sproke — answer checking.
 * An answer is a list of sequences; a sequence is a list of slots; a slot is a list of
 * accepted alternatives (each may be several words). The learner is right when their
 * words can be read as one alternative from every slot of some sequence, in order.
 */
(function (S) {
  'use strict';

  var CONTRACTIONS = [
    [/\bcan'?t\b/g, 'can not'], [/\bcannot\b/g, 'can not'], [/\bwon't\b/g, 'will not'], [/\bshan't\b/g, 'shall not'],
    [/\b(do|does|did|is|are|was|were|has|have|had|must|would|should|could)n't\b/g, '$1 not'],
    [/\bi'm\b/g, 'i am'], [/\b(you|we|they)'re\b/g, '$1 are'],
    [/\b(he|she|it|that|what|where|who|there)'s\b/g, '$1 is'],
    [/\b(i|you|we|they)'ve\b/g, '$1 have'], [/\b(i|you|he|she|it|we|they)'ll\b/g, '$1 will']
  ];

  S.normalize = function (text, lang) {
    var t = String(text || '').toLowerCase().replace(/[‘’ʼ`´]/g, "'");
    if (lang === 'en') CONTRACTIONS.forEach(function (c) { t = t.replace(c[0], c[1]); });
    t = t.replace(/[.,!?;:"()“”«»…]/g, ' ').replace(/[-–—]/g, ' ').replace(/'/g, '');
    return t.split(/\s+/).filter(Boolean);
  };

  function fold(w, wide) {
    return w.replace(/å/g, wide ? 'aa' : 'a').replace(/ø/g, wide ? 'oe' : 'o').replace(/æ/g, 'ae');
  }
  function foldEq(user, want) {
    if (fold(want, false) === fold(user, false) || fold(want, true) === user) return true;
    return want.indexOf('æ') >= 0 && want.replace(/æ/g, 'a') === user;
  }
  /** Edit distance capped at 2, counting a swap of neighbours as one edit. */
  function near(a, b) {
    if (Math.abs(a.length - b.length) > 1) return false;
    var i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    var ra = a.slice(i), rb = b.slice(i);
    if (ra.length === rb.length) {
      if (ra.slice(1) === rb.slice(1)) return true;                                   // substitution
      return ra.length > 1 && ra[0] === rb[1] && ra[1] === rb[0] && ra.slice(2) === rb.slice(2); // swap
    }
    return ra.length > rb.length ? ra.slice(1) === rb : rb.slice(1) === ra;            // insert / delete
  }

  var enWords = null;
  function knownEnglish() {
    if (enWords) return enWords;
    enWords = {};
    function add(s) { String(s).toLowerCase().split(/[\s/]+/).forEach(function (w) { enWords[w] = 1; }); }
    S.nounList.forEach(function (id) { S.enNoun(id).forEach(function (e) { add(e.sg); add(e.pl); }); });
    S.verbList.forEach(function (id) { S.enVerb(id).forEach(function (e) { add(e.base); add(e.s); add(e.past); add(e.pp); add(e.ing); }); });
    S.adjList.forEach(function (id) { S.adjs[id].en.forEach(add); });
    'a an the is are am was were be been do does did has have had not no yes he she it we they you i his her my your our their this that these those in on at to by of'.split(' ').forEach(add);
    return enWords;
  }
  function knownWord(w, lang) {
    return lang === 'en' ? !!knownEnglish()[w] : !!S.formIndex()[w];
  }

  /** mode 0 exact, 1 forgiving about å/ø/æ, 2 forgiving about one-letter slips */
  function tokenEq(user, want, mode, slot, lang, notes) {
    if (user === want) return true;
    if (mode >= 1 && lang === 'no' && foldEq(user, want)) { notes.accent = want; return true; }
    if (mode >= 2 && !slot.key && want.length >= 5 && !knownWord(user, lang) && near(user, want)) {
      notes.typo = want; return true;
    }
    return false;
  }

  function matchSeq(tokens, seq, mode, lang, notes) {
    function go(i, j) {
      if (j === seq.length) return i === tokens.length;
      var alts = seq[j].a;
      for (var k = 0; k < alts.length; k++) {
        var want = S.normalize(alts[k], lang), ok = true;
        if (i + want.length > tokens.length) continue;
        var saved = { accent: notes.accent, typo: notes.typo };
        for (var m = 0; m < want.length && ok; m++) ok = tokenEq(tokens[i + m], want[m], mode, seq[j], lang, notes);
        if (ok && go(i + want.length, j + 1)) return true;
        notes.accent = saved.accent; notes.typo = saved.typo;
      }
      return false;
    }
    return go(0, 0);
  }

  /** Canonical display text of a sequence. */
  S.show = function (seq, end) {
    var s = seq.map(function (sl) { return sl.a[0]; }).filter(Boolean).join(' ');
    return s.charAt(0).toUpperCase() + s.slice(1) + (end || '');
  };
  S.words = function (seq) { return S.show(seq).split(' ').length; };

  var FORM_LABEL = { is: 'indefinite singular', ds: 'definite singular', ip: 'indefinite plural', dp: 'definite plural', inf: 'the infinitive', pres: 'present', past: 'past', pp: 'the perfect form (after har)', imp: 'the imperative' };

  /** Explain a wrong Norwegian sentence by comparing it with the nearest accepted one. */
  function diagnose(tokens, seqs) {
    var idx = S.formIndex(), best = null;
    seqs.forEach(function (seq) {
      var want = S.normalize(S.show(seq), 'no');
      if (want.length !== tokens.length) return;
      var diff = [];
      for (var i = 0; i < want.length; i++) if (want[i] !== tokens[i]) diff.push(i);
      if (!best || diff.length < best.diff.length) best = { want: want, diff: diff, seq: seq };
    });
    if (!best) return null;
    var sameWords = best.want.slice().sort().join(' ') === tokens.slice().sort().join(' ');
    if (sameWords) {
      return 'Right words, wrong order. In a statement the verb is always the second element, and in a yes/no question it comes first.';
    }
    if (best.diff.length > 2) return null;
    var out = [];
    best.diff.forEach(function (i) {
      var u = tokens[i], w = best.want[i], ui = idx[u], wi = idx[w];
      if (!ui || !wi) return;
      for (var a = 0; a < ui.length; a++) for (var b = 0; b < wi.length; b++) {
        if (ui[a].kind === wi[b].kind && ui[a].id === wi[b].id && ui[a].kind !== 'a') {
          out.push('“' + u + '” is ' + FORM_LABEL[ui[a].form] + '; here you need ' + FORM_LABEL[wi[b].form] + ': “' + w + '”.');
          return;
        }
        if (ui[a].kind === 'a' && wi[b].kind === 'a' && ui[a].id === wi[b].id) {
          out.push('The adjective has to agree with its noun: “' + w + '”, not “' + u + '”.');
          return;
        }
      }
    });
    return out.length ? out.join(' ') : null;
  }

  /**
   * @returns {{ok:boolean, note?:string, why?:string}}
   * opts.strict — no typo forgiveness at all (single-word ending drills)
   */
  S.check = function (input, seqs, lang, opts) {
    opts = opts || {};
    var tokens = S.normalize(input, lang);
    if (!tokens.length) return { ok: false, empty: true };
    var modes = opts.strict ? [0, 1] : [0, 1, 2];
    for (var m = 0; m < modes.length; m++) {
      for (var s = 0; s < seqs.length; s++) {
        var notes = {};
        if (matchSeq(tokens, seqs[s], modes[m], lang, notes)) {
          var note = notes.typo ? 'You have a typo: “' + notes.typo + '”.' :
            notes.accent ? 'Mind the letters æ, ø and å: “' + notes.accent + '”.' : '';
          return { ok: true, note: note };
        }
      }
    }
    return { ok: false, why: lang === 'no' ? diagnose(tokens, seqs) : null };
  };
  S.resetWords = function () { enWords = null; };
})(globalThis.Sproke = globalThis.Sproke || {});
