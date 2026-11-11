/* Sproke — the interface. Plain DOM, no framework, no build step. */
(function (S) {
  'use strict';
  if (typeof document === 'undefined') return;

  var store = S.store, doc = document;
  var app, view, overlay, ui = { tab: 'learn', wordsTab: 'nouns', query: '', open: null };
  var TABS = [['learn', 'Learn', 'path'], ['practice', 'Practice', 'practice'], ['words', 'Words', 'book'], ['me', 'Me', 'user']];

  // ---------- tiny DOM helpers ----------
  function h(tag, props) {
    var el = doc.createElement(tag), i, k;
    if (props) for (k in props) {
      var v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) kid.forEach(function (x) { add(el, x); });
    else el.appendChild(typeof kid === 'object' ? kid : doc.createTextNode(String(kid)));
  }
  function icon(name) { return h('i', { html: S.icons[name] }); }
  function pic(name, mood, cls) { return h('div', { class: cls || 'who', html: S.art.host(name, mood) }); }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function pct(a, b) { return b ? Math.round(100 * a / b) : 0; }

  // ---------- voice and sound ----------
  var speech = {
    voice: null, cloud: null,
    init: function () {
      if (!('speechSynthesis' in window)) return;
      function choose() {
        var vs = window.speechSynthesis.getVoices() || [];
        function by(re) { for (var i = 0; i < vs.length; i++) if (re.test(vs[i].lang)) return vs[i]; return null; }
        speech.voice = by(/^nb/i) || by(/^no/i) || by(/^nn/i);
      }
      try { choose(); window.speechSynthesis.addEventListener('voiceschanged', choose); } catch (e) { /* no voices */ }
    },
    can: function () { return !!(speech.voice || speech.cloud); },
    on: function () { return speech.can() && store.data.settings.speak !== false; },
    say: function (text, asked) {
      if (!text) return;
      text = text.replace(/_+/g, ' ');
      try {
        if (speech.voice) {
          window.speechSynthesis.cancel();
          var u = new SpeechSynthesisUtterance(text);
          u.voice = speech.voice; u.lang = speech.voice.lang; u.rate = 0.9;
          window.speechSynthesis.speak(u);
        } else if (speech.cloud && asked) speech.cloud(text);
      } catch (e) { /* speaking is a bonus, never an error */ }
    }
  };
  S.speech = speech;

  var audio = null;
  function tone(notes) {
    if (store.data.settings.sound === false) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      var t = audio.currentTime;
      notes.forEach(function (n) {
        var o = audio.createOscillator(), g = audio.createGain();
        o.type = n[3] || 'sine'; o.frequency.value = n[0];
        g.gain.setValueAtTime(0.0001, t + n[1]);
        g.gain.exponentialRampToValueAtTime(0.16, t + n[1] + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + n[1] + n[2]);
        o.connect(g); g.connect(audio.destination); o.start(t + n[1]); o.stop(t + n[1] + n[2] + 0.02);
      });
    } catch (e) { /* silent */ }
  }
  var sfx = {
    ok: function () { tone([[660, 0, 0.12], [880, 0.1, 0.2]]); },
    no: function () { tone([[240, 0, 0.16, 'triangle'], [180, 0.14, 0.24, 'triangle']]); },
    done: function () { tone([[523, 0, 0.14], [659, 0.12, 0.14], [784, 0.24, 0.14], [1047, 0.36, 0.32]]); }
  };

  // ---------- shell ----------
  function mount() {
    app = doc.getElementById('app'); overlay = doc.getElementById('overlay');
    clear(app);
    add(app, [h('header', { class: 'top' }, h('div', { class: 'wrap', id: 'topbar' })), h('main', { id: 'view' }), h('nav', { class: 'tabs', 'aria-label': 'Sections' }, h('div', { class: 'wrap', id: 'tabbar' }))]);
    view = doc.getElementById('view');
    var fromHash = (location.hash || '').slice(1);
    if (TABS.some(function (t) { return t[0] === fromHash; })) ui.tab = fromHash;
    window.addEventListener('hashchange', function () {
      var t = (location.hash || '').slice(1);
      if (TABS.some(function (x) { return x[0] === t; }) && t !== ui.tab) { ui.tab = t; render(); }
    });
    doc.addEventListener('keydown', onKey);
    doc.addEventListener('click', hideTip, true);
    render();
  }
  function go(tab) {
    ui.tab = tab;
    try { history.replaceState(null, '', '#' + tab); } catch (e) { /* sandboxed */ }
    render(); view.scrollTop = 0;
  }
  function render() {
    var top = doc.getElementById('topbar'), tabs = doc.getElementById('tabbar'), streak = store.streak();
    clear(top);
    add(top, [
      h('div', { class: 'brand' }, h('i', { html: S.art.troll() }), 'Sproke'),
      h('div', { class: 'stat fire' + (store.litToday() ? '' : ' cold'), title: 'Days in a row' }, icon('flame'), streak),
      h('div', { class: 'stat xp', title: 'Runes earned' }, icon('stone'), store.data.xp)
    ]);
    clear(tabs);
    TABS.forEach(function (t) {
      add(tabs, h('button', { class: 'tab', 'aria-current': ui.tab === t[0] ? 'page' : null, onclick: function () { go(t[0]); } }, icon(t[2]), t[1]));
    });
    clear(view);
    var wrap = h('div', { class: 'wrap' });
    VIEWS[ui.tab](wrap);
    add(view, wrap);
  }

  // ---------- sheets ----------
  function sheet(build, color) {
    clearSheet();
    var box = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'data-color': color || null });
    build(box);
    var scrim = h('div', { class: 'scrim', id: 'scrim', onclick: function (e) { if (e.target === scrim) clearSheet(); } }, box);
    add(overlay, scrim);
    var first = box.querySelector('button, input');
    if (first) first.focus({ preventScroll: true });
  }
  function clearSheet() { var s = doc.getElementById('scrim'); if (s) s.parentNode.removeChild(s); }

  function formsGrid(kind, id, hi) {
    var rows = [];
    function cell(label, text, on) { return h('span', { class: on ? 'hi' : null }, h('small', null, label), text); }
    if (kind === 'n') {
      var n = S.nouns[id], f = S.nounForms(n);
      rows.push([cell('ubestemt entall', S.withArticle(n), hi === 'is'), cell('bestemt entall', f.ds[0], hi === 'ds')]);
      if (!n.mass) rows.push([cell('ubestemt flertall', f.ip[0], hi === 'ip'), cell('bestemt flertall', f.dp[0], hi === 'dp')]);
    } else if (kind === 'v') {
      var v = S.verbForms(id);
      rows.push([cell('infinitiv', 'å ' + v.inf[0], hi === 'inf'), cell('presens', v.pres[0], hi === 'pres')]);
      rows.push([cell('preteritum', v.past[0], hi === 'past'), cell('perfektum', 'har ' + v.pp[0], hi === 'pp')]);
    } else {
      var a = S.adjs[id];
      rows.push([cell('en / ei', a.m === a.f ? a.m : a.m + ' / ' + a.f), cell('et', a.n)]);
      rows.push([cell('flertall', a.pl), cell('den / det / de', a.def)]);
    }
    return h('div', { class: 'grid' }, rows.map(function (r) { return h('div', null, r); }));
  }
  function tipBody(tip) {
    return [
      tip.body.map(function (p) { return h('p', { html: p }); }),
      tip.table ? h('div', { class: 'grid' }, tip.table.map(function (r) { return h('div', null, r.map(function (c) { return h('span', null, c); })); })) : null
    ];
  }
  function tipSheet(key, color, after) {
    var tip = S.TIPS[key];
    sheet(function (box) {
      add(box, [h('div', { class: 'kicker' }, 'Grammar notes'), h('h2', null, tip.title), h('div', { class: 'tip field' }, tipBody(tip)),
        h('button', { class: 'btn wide ' + (after ? 'unit' : 'plain'), onclick: after || clearSheet }, after ? 'Start lesson' : 'Got it')]);
    }, color);
  }

  // ---------- learn ----------
  var DX = [0, 46, 66, 46, 0, -46, -66, -46];
  function greeting() { var hr = new Date().getHours(); return hr < 5 ? 'God natt!' : hr < 11 ? 'God morgen!' : hr < 18 ? 'God dag!' : 'God kveld!'; }
  function pips(level) { return h('div', { class: 'pips', title: 'Level ' + level + ' of 3' }, [1, 2, 3].map(function (i) { return h('b', { class: i <= level ? 'on' : null }); })); }

  var VIEWS = {};
  VIEWS.learn = function (wrap) {
    var next = store.nextLesson(), today = store.todayXp(), goal = store.data.goal;
    var started = store.data.stats.sessions > 0;
    add(wrap, h('section', { class: 'hello' },
      pic('troll', today >= goal ? 'cheer' : 'happy'),
      h('h1', null, greeting()),
      h('div', null,
        h('p', null, !started ? 'I am Brumle. Follow the trail and I will get you to Soria Moria.' : today >= goal ? 'Daily goal reached. The bonfire is burning bright.' : 'Earn ' + (goal - today) + ' more runes to reach today’s goal.'),
        h('div', { class: 'goal' }, h('div', { class: 'bar' }, h('span', { style: 'width:' + Math.min(100, pct(today, goal)) + '%' })), today + ' / ' + goal)),
      next ? h('button', { class: 'btn wide', onclick: function () { lessonSheet(next); } }, (started ? 'Continue: ' : 'Start: ') + next.title)
        : h('button', { class: 'btn wide', onclick: function () { go('practice'); } }, 'Trail complete. Keep practising')));

    S.UNITS.forEach(function (u) {
      var sec = h('section', { class: 'unit', 'data-color': u.color });
      add(sec, h('div', { class: 'banner' },
        h('div', { class: 'kicker' }, 'Part ' + (u.index + 1) + ' · ' + u.en), h('h2', null, u.title), h('p', null, u.blurb), pic(u.host, null, 'host')));
      var trail = h('div', { class: 'trail' });
      u.lessons.forEach(function (l) {
        var lv = store.level(l.key), isNext = next && next.key === l.key;
        add(trail, h('div', { class: 'stop' + (lv ? ' done' : '') + (lv >= 3 ? ' gold' : '') + (isNext ? ' next' : ''), style: '--dx:' + DX[l.index % 8] + 'px' },
          h('button', { class: 'node', 'aria-label': l.title + ', ' + l.en + ', level ' + lv + ' of 3', onclick: function () { lessonSheet(l); } },
            isNext ? h('span', { class: 'flag' }, started ? 'Next' : 'Start') : null, h('i', { html: lv >= 3 ? S.icons.star : S.rune(l.index) })),
          h('div', { class: 'name' }, l.title), h('div', { class: 'sub' }, l.en), pips(lv)));
      });
      add(sec, trail);
      add(wrap, sec);
    });
  };

  function lessonSheet(l) {
    var lv = store.level(l.key), u = l.unit;
    function start() { clearSheet(); startLesson(l); }
    sheet(function (box) {
      add(box, [
        h('div', { class: 'sheet-head' }, pic(u.host, null, 'host'),
          h('div', null, h('div', { class: 'kicker' }, u.title + ' · lesson ' + (l.pos + 1) + ' of ' + u.lessons.length), h('h2', null, l.title), h('p', { class: 'lead' }, l.en))),
        h('div', { class: 'goal' }, pips(lv), lv >= 3 ? 'Mastered. Run it again any time.' : lv ? 'Level ' + lv + ' of 3. Each level asks for more typing.' : 'New lesson. About 14 questions.'),
        h('div', { class: 'row' },
          h('button', { class: 'btn unit', onclick: start }, lv ? 'Practise again' : 'Start lesson'),
          h('button', { class: 'btn plain', onclick: function () { tipSheet(l.tip, u.color, start); } }, icon('bulb'), 'Notes'))
      ]);
    }, u.color);
  }
  function startLesson(l) {
    var lv = store.level(l.key);
    var list = S.buildLesson(l, lv, { weight: store.weight });
    if (speech.on() && lv > 0 && l.index > 1) addListening(list, S.lessonContext(l, lv), 1);
    runSession({ list: list, lesson: l.key, host: l.unit.host, color: l.unit.color, title: l.title });
  }
  /** Swap in a few listen-and-write questions when a Norwegian voice exists. */
  function addListening(list, ctx, n) {
    for (var i = 0; i < n; i++) {
      var ex = S.makeExercise({ t: 'listen', pat: ['svo', 'place', 'to'], tense: ['pres'], subj: ['pron', 'noun'], maxWords: 6 }, ctx);
      if (ex) list.splice(Math.max(1, list.length - 2 - i), 0, ex);
    }
  }

  // ---------- practice ----------
  var COMMON = {
    answer: { id: 'answer', label: 'Answer with', values: [['auto', 'Mixed'], ['choice', 'Choices'], ['type', 'Keyboard']], def: 'auto' },
    len: { id: 'len', label: 'Length', values: [[10, 'Short · 10'], [15, 'Normal · 15'], [25, 'Long · 25']], def: 15 },
    scope: { id: 'scope', label: 'Words', values: [['all', 'Whole course'], ['mine', 'Only my lessons']], def: 'all' }
  };
  function practiceOptions(id) {
    var p = S.PRACTICE[id], opts = p.options.slice();
    if (id === 'nouns' || id === 'verbs' || id === 'mixed') opts.push(COMMON.answer);
    opts.push(COMMON.len);
    if (id !== 'phrases') opts.push(COMMON.scope);
    return opts;
  }
  function savedOptions(id) {
    var saved = (store.data.settings.practice || {})[id] || {}, o = {};
    practiceOptions(id).forEach(function (opt) {
      var v = saved[opt.id], valid = opt.values.map(function (x) { return x[0]; });
      if (opt.multi) { v = Array.isArray(v) ? v.filter(function (x) { return valid.indexOf(x) >= 0; }) : null; o[opt.id] = v && v.length ? v : opt.def.slice(); }
      else o[opt.id] = valid.indexOf(v) >= 0 ? v : opt.def;
    });
    return o;
  }
  function learnedContext() {
    var n = [], v = [], a = [];
    S.lessons.forEach(function (l) { if (store.level(l.key)) { n = n.concat(l.n || []); v = v.concat(l.v || []); a = a.concat(l.a || []); } });
    n = S.uniq(n); v = S.uniq(v);
    if (n.length < 8 || v.length < 4) return null;
    return { nouns: S.uniq(n.concat(['gutt', 'jente', 'troll', 'nisse'])), verbs: v, adjs: a.length > 2 ? S.uniq(a) : null, focusN: [], focusV: [] };
  }
  function practiceContext(o) {
    var ctx = (o.scope === 'mine' && learnedContext()) || S.fullContext();
    ctx.hard = o.answer === 'choice' ? 0 : o.answer === 'type' ? 1 : 0.55;
    ctx.weight = store.weight;
    return ctx;
  }
  function scaled(recipe, len) {
    var total = recipe.reduce(function (s, r) { return s + (r.n || 1); }, 0), f = (len + 2) / total;
    return recipe.map(function (r) {
      var c = {}, k; for (k in r) c[k] = r[k];
      c.n = r.t === 'match' || r.t === 'ntable' || r.t === 'vtable' ? Math.max(1, Math.round((r.n || 1) * Math.min(f, 1.5))) : Math.max(1, Math.round((r.n || 1) * f));
      return c;
    });
  }
  function startPractice(id, o) {
    var p = S.PRACTICE[id], ctx = practiceContext(o);
    if (p.filter) p.filter(o, ctx);
    var list = S.buildSession(scaled(p.recipe(o), o.len), ctx, { shuffle: true, limit: o.len });
    if (id === 'sentences' && speech.on() && o.dir !== 'no-en') {
      list = list.slice(0, Math.max(1, list.length - 2));
      addListening(list, ctx, 2);
    }
    runSession({ list: list, host: p.host, color: p.color, title: p.en });
  }
  function practiceSheet(id) {
    var p = S.PRACTICE[id], o = savedOptions(id), mine = learnedContext();
    sheet(function (box) {
      add(box, h('div', { class: 'sheet-head' }, pic(p.host, null, 'host'), h('div', null, h('div', { class: 'kicker' }, p.en), h('h2', null, p.title), h('p', { class: 'lead' }, p.blurb))));
      practiceOptions(id).forEach(function (opt) {
        var chips = h('div', { class: 'chips' });
        function paint() {
          clear(chips);
          opt.values.forEach(function (val) {
            var on = opt.multi ? o[opt.id].indexOf(val[0]) >= 0 : o[opt.id] === val[0];
            var off = opt.id === 'scope' && val[0] === 'mine' && !mine;
            add(chips, h('button', { class: 'chip', 'aria-pressed': on ? 'true' : 'false', disabled: off, onclick: function () {
              if (opt.multi) {
                var i = o[opt.id].indexOf(val[0]);
                if (i < 0) o[opt.id].push(val[0]); else if (o[opt.id].length > 1) o[opt.id].splice(i, 1);
              } else o[opt.id] = val[0];
              paint();
            } }, val[1]));
          });
        }
        paint();
        add(box, h('div', { class: 'field' }, h('div', { class: 'label' }, opt.label), chips,
          opt.id === 'scope' && !mine ? h('p', { class: 'note' }, 'Finish a few lessons to practise only the words you have met.') : null));
      });
      add(box, h('button', { class: 'btn wide unit', onclick: function () {
        if (o.scope === 'mine' && !mine) o.scope = 'all';
        store.data.settings.practice = store.data.settings.practice || {};
        store.data.settings.practice[id] = o; store.save();
        clearSheet(); startPractice(id, o);
      } }, 'Start practice'));
    }, p.color);
  }
  /** Turn the weakest remembered items back into questions. */
  function hauntRecipe(keys) {
    var seen = {}, recipe = [];
    keys.forEach(function (k) {
      var p = k.split(':'), id = p[1], word = p[0] + ':' + id;
      if (recipe.length >= 14 || (seen[word] || 0) >= 2) return;
      var spec = null;
      if (p[0] === 'n' && S.nouns[id]) spec = { t: 'nform', nouns: [id], forms: [p[2]] };
      else if (p[0] === 'v' && S.verbs[id]) spec = { t: 'vform', verbs: [id], forms: [p[2]] };
      else if (p[0] === 'g' && S.nouns[id]) spec = { t: 'gender', nouns: [id] };
      else if (p[0] === 'w' && S.nouns[id]) spec = { t: 'vocab', what: 'n', nouns: [id] };
      else if (p[0] === 'w' && S.verbs[id]) spec = { t: 'vocab', what: 'v', verbs: [id] };
      else if (p[0] === 'a' && S.adjs[id]) spec = { t: 'adj', adjs: [id] };
      else if (p[0] === 'p' && S.PHRASES.some(function (x) { return x.id === id; })) spec = { t: 'phrase', ids: [id], mode: 'write' };
      else if (p[0] === 'p') spec = { t: 'poss' };
      if (spec) { spec.n = 1; seen[word] = (seen[word] || 0) + 1; recipe.push(spec); }
    });
    return recipe;
  }
  function startHaunt() {
    var ctx = S.fullContext({ hard: 0.7, weight: store.weight });
    var list = S.buildSession(hauntRecipe(store.weak(40)), ctx, { shuffle: true });
    if (list.length) runSession({ list: list, host: 'draug', color: 'sea', title: 'Gjengangere' });
  }

  VIEWS.practice = function (wrap) {
    var weak = store.weak(200).length;
    add(wrap, [h('h1', { class: 'page-title' }, 'Practice'),
      h('p', { class: 'page-lead' }, 'No trail, no order. Choose what you want to get better at and how hard it should be.')]);
    var cards = h('div', { class: 'cards' });
    add(cards, h('button', { class: 'pcard haunt', disabled: !weak, onclick: startHaunt },
      pic('draug', null, 'host'), h('h3', null, 'Gjengangere', h('small', null, 'Weak spots')),
      h('p', null, weak ? weak + (weak === 1 ? ' form keeps' : ' forms keep') + ' coming back to haunt you. Lay them to rest.' : 'Nothing haunts you yet. Forms you get wrong will come back here.'),
      h('i', { class: 'go', html: S.icons.chevron })));
    Object.keys(S.PRACTICE).forEach(function (id) {
      var p = S.PRACTICE[id];
      add(cards, h('button', { class: 'pcard', 'data-color': p.color, onclick: function () { practiceSheet(id); } },
        pic(p.host, null, 'host'), h('h3', null, p.title, h('small', null, p.en)), h('p', null, p.blurb), h('i', { class: 'go', html: S.icons.chevron })));
    });
    add(wrap, cards);
  };

  // ---------- words ----------
  var WORD_TABS = [['nouns', 'Nouns'], ['verbs', 'Verbs'], ['adjs', 'Adjectives'], ['notes', 'Grammar']];
  function drillWord(kind, id) {
    var ctx = S.fullContext({ hard: 0.7 }), recipe;
    if (kind === 'n') recipe = S.nouns[id].mass ? [{ t: 'nform', nouns: [id], forms: ['ds'], n: 2 }, { t: 'gender', nouns: [id] }]
      : [{ t: 'gender', nouns: [id] }, { t: 'nform', nouns: [id], forms: ['ds', 'ip', 'dp'], mode: 'choice', n: 2 }, { t: 'nform', nouns: [id], forms: ['ds', 'ip', 'dp'], mode: 'gap', n: 2 }, { t: 'nform', nouns: [id], forms: ['ds', 'ip', 'dp'], mode: 'type', n: 2 }, { t: 'ntable', nouns: [id] }];
    else if (kind === 'v') recipe = [{ t: 'vform', verbs: [id], forms: ['pres', 'past', 'pp'], mode: 'choice', n: 2 }, { t: 'vform', verbs: [id], forms: ['past', 'pp'], mode: 'gap', n: 2 }, { t: 'vform', verbs: [id], forms: ['pres', 'past', 'pp'], mode: 'type', n: 2 }].concat(S.verbs[id].x.modal ? [] : [{ t: 'vtable', verbs: [id] }]);
    else recipe = [{ t: 'adj', adjs: [id], mode: 'choice', n: 3 }, { t: 'adj', adjs: [id], mode: 'type', n: 3 }];
    var list = S.buildSession(recipe, ctx);
    if (list.length) runSession({ list: list, host: 'troll', color: 'green', title: id });
  }
  function wordRow(kind, id, head, gloss, badge, extra) {
    var key = kind + ':' + id, open = ui.open === key;
    return h('div', { class: 'word' },
      h('button', { 'aria-expanded': open ? 'true' : 'false', onclick: function () { ui.open = open ? null : key; var y = view.scrollTop; render(); view.scrollTop = y; } },
        h('b', null, head), h('span', null, gloss), badge ? h('em', null, badge) : null),
      open ? h('div', { class: 'more' }, formsGrid(kind, id), extra,
        h('div', { class: 'row' },
          speech.can() ? h('button', { class: 'btn small plain', onclick: function () { speech.say(spoken(kind, id), true); } }, icon('speaker'), 'Listen') : null,
          h('button', { class: 'btn small', onclick: function () { drillWord(kind, id); } }, 'Drill this word'))) : null);
  }
  function spoken(kind, id) {
    if (kind === 'n') { var f = S.nounForms(id); return S.nouns[id].mass ? id + ', ' + f.ds[0] : [S.withArticle(id), f.ds[0], f.ip[0], f.dp[0]].join(', '); }
    if (kind === 'v') { var v = S.verbForms(id); return ['å ' + id, v.pres[0], v.past[0], 'har ' + v.pp[0]].join(', '); }
    var a = S.adjs[id]; return [a.m, a.n, a.pl].join(', ');
  }
  function also(list) { return list.length ? h('p', null, 'Also accepted: ' + list.join(', ')) : null; }
  VIEWS.words = function (wrap) {
    add(wrap, [h('h1', { class: 'page-title' }, 'Words'),
      h('div', { class: 'seg' }, WORD_TABS.map(function (t) {
        return h('button', { 'aria-pressed': ui.wordsTab === t[0] ? 'true' : 'false', onclick: function () { ui.wordsTab = t[0]; ui.open = null; render(); } }, t[1]);
      }))]);
    if (ui.wordsTab === 'notes') {
      var seen = {}, list = h('div', { class: 'words' });
      S.lessons.forEach(function (l) {
        if (seen[l.tip]) return; seen[l.tip] = 1;
        var tip = S.TIPS[l.tip], key = 'tip:' + l.tip, open = ui.open === key;
        add(list, h('div', { class: 'word', 'data-color': l.unit.color },
          h('button', { 'aria-expanded': open ? 'true' : 'false', onclick: function () { ui.open = open ? null : key; var y = view.scrollTop; render(); view.scrollTop = y; } }, h('b', null, tip.title), h('span', null, ''), h('em', null, l.unit.title)),
          open ? h('div', { class: 'more tip' }, tipBody(tip)) : null));
      });
      add(wrap, list);
      return;
    }
    var q = ui.query.toLowerCase().trim();
    var input = h('input', { class: 'search', id: 'word-search', type: 'search', placeholder: 'Search Norwegian or English', value: ui.query, 'aria-label': 'Search words',
      oninput: function () { ui.query = input.value; paint(); } });
    var box = h('div');
    function match(a, b) { return !q || a.toLowerCase().indexOf(q) >= 0 || b.toLowerCase().indexOf(q) >= 0; }
    function paint() {
      q = ui.query.toLowerCase().trim();
      clear(box);
      var rows = [];
      if (ui.wordsTab === 'nouns') S.nounList.slice().sort(function (a, b) { return a.localeCompare(b, 'nb'); }).forEach(function (id) {
        var n = S.nouns[id], f = S.nounForms(n), en = n.enRaw.split('|').join(', ');
        if (!match([id, f.ds.join(' '), f.ip.join(' '), f.dp.join(' ')].join(' '), en)) return;
        var alt = [].concat(f.ds.slice(1), n.mass ? [] : f.ip.slice(1), n.mass ? [] : f.dp.slice(1));
        if (n.g === 'f') alt.unshift(S.articles(n)[1] + ' ' + id);
        rows.push(wordRow('n', id, S.withArticle(n), en, null, also(alt)));
      });
      else if (ui.wordsTab === 'verbs') S.verbList.slice().sort(function (a, b) { return a.localeCompare(b, 'nb'); }).forEach(function (id) {
        var v = S.verbs[id], f = S.verbForms(v), en = S.enVerbForm(v, 'inf');
        if (!match([id, f.pres[0], f.past.join(' '), f.pp.join(' ')].join(' '), en)) return;
        rows.push(wordRow('v', id, 'å ' + id, en, S.VERB_GROUPS[v.cls].hint, [also(f.past.slice(1).concat(f.pp.slice(1).filter(function (w) { return f.past.indexOf(w) < 0; }))),
          v.x.modal || v.x.st ? null : h('p', null, 'Imperativ: ' + f.imp[0] + '!')]));
      });
      else S.adjList.forEach(function (id) {
        var a = S.adjs[id];
        if (!match([a.m, a.n, a.pl].join(' '), a.en.join(' '))) return;
        rows.push(wordRow('a', id, a.m, a.en.join(', '), null, null));
      });
      add(box, rows.length ? h('div', { class: 'words' }, rows) : h('p', { class: 'empty' }, 'No word matches “' + ui.query + '”.'));
    }
    paint();
    add(wrap, [input, box]);
  };

  // ---------- me ----------
  function toggle(label, hint, on, fn, disabled) {
    var b = h('button', { class: 'toggle', role: 'switch', 'aria-checked': on ? 'true' : 'false', 'aria-label': label, disabled: disabled, onclick: function () { fn(b.getAttribute('aria-checked') !== 'true'); } });
    return h('div', { class: 'switch' }, h('div', null, label, h('small', null, hint)), b);
  }
  VIEWS.me = function (wrap) {
    var d = store.data, done = S.lessons.filter(function (l) { return store.level(l.key); }).length;
    add(wrap, [h('h1', { class: 'page-title' }, 'Your progress'),
      h('div', { class: 'tiles' },
        h('div', { class: 'tile' }, h('b', null, d.xp), h('span', null, 'runes earned')),
        h('div', { class: 'tile' }, h('b', null, store.streak()), h('span', null, 'day streak')),
        h('div', { class: 'tile' }, h('b', null, done + ' / ' + S.lessons.length), h('span', null, 'lessons finished')),
        h('div', { class: 'tile' }, h('b', null, d.stats.answered ? pct(d.stats.correct, d.stats.answered) + '%' : '–'), h('span', null, 'answers right')))]);
    var days = [], max = Math.max(d.goal, 1), i;
    for (i = 6; i >= 0; i--) { var t = Date.now() - i * 86400000, xp = d.days[store.dayKey(t)] || 0; max = Math.max(max, xp); days.push([new Date(t), xp]); }
    add(wrap, [h('h2', { class: 'section-title' }, 'Last seven days'),
      h('div', { class: 'week', role: 'img', 'aria-label': 'Runes earned per day: ' + days.map(function (x) { return x[1]; }).join(', ') }, days.map(function (x) {
        return h('div', null, h('i', { class: x[1] ? null : 'none', style: 'height:' + Math.max(4, Math.round(70 * x[1] / max)) + 'px' }), ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][x[0].getDay()]);
      }))]);
    add(wrap, [h('h2', { class: 'section-title' }, 'Settings'), h('div', { class: 'panel' },
      toggle('Feminine nouns as ei / -a', d.settings.fem !== false ? 'Shown as ei jente, jenta. En jente, jenten is still accepted.' : 'Shown as en jente, jenten. Ei jente, jenta is still accepted.', d.settings.fem !== false, function (v) { store.set('fem', v); render(); }),
      toggle('Read Norwegian aloud', speech.can() ? 'Uses the Norwegian voice on this device.' : 'This device has no Norwegian voice installed.', speech.on(), function (v) { store.set('speak', v); render(); }, !speech.can()),
      toggle('Sound effects', 'A chime for right and wrong answers.', d.settings.sound !== false, function (v) { store.set('sound', v); render(); }))]);
    var goals = h('div', { class: 'chips' }, [10, 20, 30, 50].map(function (g) {
      return h('button', { class: 'chip', 'aria-pressed': d.goal === g ? 'true' : 'false', onclick: function () { d.goal = g; store.save(); render(); } }, g + ' runes');
    }));
    add(wrap, [h('div', { class: 'field' }, h('div', { class: 'label' }, 'Daily goal'), goals),
      h('p', { class: 'note' }, 'A lesson earns 10 to 15 runes. Progress is saved in this browser only.'),
      h('button', { class: 'btn plain', onclick: function () {
        sheet(function (box) {
          add(box, [h('h2', null, 'Erase all progress?'), h('p', { class: 'lead' }, 'Runes, streak, lesson levels and weak spots will be gone for good.'),
            h('div', { class: 'row' }, h('button', { class: 'btn plain', onclick: clearSheet }, 'Keep it'), h('button', { class: 'btn bad', onclick: function () { store.reset(); clearSheet(); render(); } }, 'Erase'))]);
        });
      } }, 'Reset progress')]);
  };

  // ---------- tooltips ----------
  var tipEl = null;
  function hideTip() { if (tipEl) { tipEl.parentNode.removeChild(tipEl); tipEl = null; } }
  function showTip(target, text) {
    hideTip();
    tipEl = h('div', { class: 'tooltip', role: 'status' }, text);
    add(doc.body, tipEl);
    var r = target.getBoundingClientRect(), w = tipEl.offsetWidth;
    tipEl.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
    tipEl.style.top = (r.bottom + 6) + 'px';
  }

  // ---------- running a session ----------
  var session = null;
  var PRAISE = ['Riktig!', 'Bra!', 'Flott!', 'Helt riktig!', 'Kjempebra!', 'Nydelig!'];

  function runSession(cfg) {
    if (!cfg.list.length) return;
    session = { cfg: cfg, queue: cfg.list.slice(), total: cfg.list.length, done: 0, first: 0, missed: [], view: null, phase: 'ask' };
    cfg.list.forEach(function (ex) { ex.tries = 0; });
    var root = h('div', { class: 'session', 'data-color': cfg.color },
      h('div', { class: 's-top' }, h('div', { class: 'wrap' },
        h('button', { class: 'icon-btn', 'aria-label': 'Quit', onclick: askQuit }, icon('close')),
        h('div', { class: 'bar', role: 'progressbar', 'aria-label': 'Progress', 'aria-valuemin': '0', 'aria-valuemax': '100' }, h('span', { id: 's-bar', style: 'width:0%' })))),
      h('div', { class: 's-body' }, h('div', { class: 'wrap', id: 's-main' })),
      h('div', { class: 's-foot', id: 's-foot' }, h('div', { class: 'wrap', id: 's-foot-in' })));
    clear(overlay);
    add(overlay, root);
    showExercise();
  }
  function endSession() { session = null; clear(overlay); hideTip(); render(); }
  function askQuit() {
    if (!session || session.phase === 'end') return endSession();
    sheet(function (box) {
      add(box, [h('h2', null, 'Stop here?'), h('p', { class: 'lead' }, 'This round will not count, but every answer so far is remembered for your weak spots.'),
        h('div', { class: 'row' }, h('button', { class: 'btn', onclick: clearSheet }, 'Keep going'), h('button', { class: 'btn plain', onclick: function () { store.save(); clearSheet(); endSession(); } }, 'Quit'))]);
    });
  }
  function setBar() {
    var b = doc.getElementById('s-bar');
    if (b) { b.style.width = pct(session.done, session.total) + '%'; b.parentNode.setAttribute('aria-valuenow', pct(session.done, session.total)); }
  }
  function footer(kids, cls) {
    var f = doc.getElementById('s-foot'), inner = doc.getElementById('s-foot-in');
    f.className = 's-foot' + (cls ? ' ' + cls : '');
    clear(inner); add(inner, kids);
  }

  function sayButton(text, big) {
    if (!speech.can()) return null;
    return h('button', { class: 'say' + (big ? ' big' : ''), type: 'button', 'aria-label': 'Listen', onclick: function (e) { e.stopPropagation(); speech.say(text, true); } }, icon('speaker'));
  }
  function promptView(ex) {
    var p = ex.prompt || {}, host = session.cfg.host;
    if (p.audio) return h('div', { class: 'bigprompt' }, sayButton(p.audio, true), h('div', { class: 'sub' }, 'Tap to hear it again'));
    if (p.big) {
      return h('div', { class: 'bigprompt' },
        p.chip ? h('div', { class: 'lemma' }, p.chip) : null,
        h('div', { class: 'word-line' }, p.lang === 'no' && p.say ? sayButton(p.say) : null, h('div', { class: 'big', lang: p.lang === 'no' ? 'nb' : 'en' }, p.big)),
        p.sub ? h('div', { class: 'sub' }, p.sub) : null);
    }
    var line = h('div', { class: 'line', lang: p.lang === 'no' ? 'nb' : 'en' });
    if (p.lang === 'no' && p.say) add(line, sayButton(p.say));
    if (p.tokens) {
      p.tokens.forEach(function (t, i) {
        var text = i === 0 ? S.util.cap(t.t) : t.t;
        if (i === p.tokens.length - 1) text += p.end || '';
        add(line, t.g ? h('button', { class: 'tok', type: 'button', onclick: function (e) { e.stopPropagation(); showTip(e.currentTarget, t.g); } }, text) : h('span', null, text));
      });
    } else {
      p.text.split('___').forEach(function (part, i) {
        var t = part.trim();
        if (i) {
          var m = /^[.,!?]+/.exec(t), tail = m ? m[0] : '';
          add(line, h('span', { class: 'nowrap' }, h('span', { class: 'gap' }), tail));
          t = t.slice(tail.length).trim();
        }
        if (t) add(line, h('span', null, t));
      });
    }
    var hints = null;
    if (p.hints && p.hints.length) {
      var shown = h('div', { class: 'hintline' });
      var btn = h('button', { class: 'linkish', type: 'button', onclick: function () {
        clear(shown); add(shown, p.hints.map(function (x) { return h('span', { class: 'lemma' }, x); }));
      } }, icon('bulb'), 'Show the words');
      add(shown, btn); hints = shown;
    }
    return h('div', { class: 'prompt' }, pic(host, 'think'),
      h('div', { class: 'bubble' }, line, p.sub ? h('div', { class: 'sub' }, p.sub) : null, p.chip ? h('div', { class: 'lemma' }, p.chip) : null, hints));
  }

  function specialKeys(getInput) {
    return h('div', { class: 'keys', 'aria-label': 'Norwegian letters' }, ['å', 'ø', 'æ'].map(function (c) {
      return h('button', { type: 'button', 'aria-label': 'Insert ' + c, onmousedown: function (e) { e.preventDefault(); }, onclick: function () {
        var el = getInput(); if (!el) return;
        var a = el.selectionStart == null ? el.value.length : el.selectionStart, b = el.selectionEnd == null ? a : el.selectionEnd;
        el.value = el.value.slice(0, a) + c + el.value.slice(b);
        el.focus(); try { el.setSelectionRange(a + 1, a + 1); } catch (e) { /* older browsers */ }
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } }, c);
    }));
  }
  function wordSolution(ex) {
    if (ex.solution) return ex.solution;
    var s = S.show(ex.answer[0]);
    return ex.strict ? (ex.pre ? ex.pre + ' ' : '') + s.toLowerCase() : s;
  }

  /** Each kind returns {el, ready(), grade(), lock(result), focus()} */
  var KINDS = {};
  KINDS.choice = function (ex, changed) {
    var picked = -1, buttons = [];
    var box = h('div', { class: 'opts' + (ex.row ? ' across' : '') }, ex.options.map(function (o, i) {
      var b = h('button', { class: 'opt', type: 'button', 'aria-pressed': 'false', onclick: function () { select(i); } }, h('kbd', null, i + 1), o);
      buttons.push(b); return b;
    }));
    function select(i) {
      if (i < 0 || i >= buttons.length || buttons[0].disabled) return;
      picked = i;
      buttons.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      changed();
    }
    return {
      el: box, select: select, ready: function () { return picked >= 0; },
      grade: function () {
        var good = ex.answers || [ex.answer], ok = good.indexOf(picked) >= 0;
        return { ok: ok, solution: ex.options[ex.answer], parts: [{ keys: ex.keys, ok: ok }] };
      },
      lock: function (r) {
        buttons.forEach(function (b, j) { b.disabled = true; if (j === ex.answer) b.classList.add('right'); else if (j === picked && !r.ok) b.classList.add('wrong'); });
      }
    };
  };
  KINDS.type = function (ex, changed) {
    var single = ex.strict || ex.inline;
    var input = single
      ? h('input', { id: 'answer', type: 'text', autocomplete: 'off', autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false', lang: ex.lang === 'no' ? 'nb' : 'en', placeholder: ex.lang === 'no' ? 'Skriv på norsk' : 'Type in English', 'aria-label': 'Your answer', oninput: changed })
      : h('textarea', { id: 'answer', rows: '3', autocomplete: 'off', autocapitalize: 'sentences', autocorrect: 'off', spellcheck: 'false', lang: ex.lang === 'no' ? 'nb' : 'en', placeholder: ex.lang === 'no' ? 'Skriv på norsk' : 'Type in English', 'aria-label': 'Your answer', oninput: changed });
    var el = h('div', { class: 'entry' }, h('div', { class: 'line' }, ex.pre ? h('span', { class: 'pre' }, ex.pre) : null, input), ex.lang === 'no' ? specialKeys(function () { return input; }) : null);
    return {
      el: el, focus: function () { input.focus({ preventScroll: true }); }, ready: function () { return input.value.trim().length > 0; },
      grade: function () {
        var r = S.check(input.value, ex.answer, ex.lang, { strict: ex.strict });
        return { ok: r.ok, note: r.note, why: r.why, solution: wordSolution(ex), given: input.value, parts: [{ keys: ex.keys, ok: r.ok }] };
      },
      lock: function (r) { input.readOnly = true; input.classList.add(r.ok ? 'right' : 'wrong'); }
    };
  };
  KINDS.bank = function (ex, changed) {
    var chosen = [], built = h('div', { class: 'built', 'aria-label': 'Your sentence', lang: ex.lang === 'no' ? 'nb' : 'en' }), locked = false;
    var tiles = ex.tiles.map(function (w, i) {
      return h('button', { class: 'wtile', type: 'button', onclick: function () { if (locked || chosen.indexOf(i) >= 0) return; chosen.push(i); paint(); } }, w);
    });
    function paint() {
      clear(built);
      chosen.forEach(function (i, pos) {
        add(built, h('button', { class: 'wtile', type: 'button', onclick: function () { if (locked) return; chosen.splice(pos, 1); paint(); } }, ex.tiles[i]));
      });
      tiles.forEach(function (t, i) { t.classList.toggle('used', chosen.indexOf(i) >= 0); t.tabIndex = chosen.indexOf(i) >= 0 ? -1 : 0; });
      changed();
    }
    return {
      el: h('div', { class: 'entry' }, built, h('div', { class: 'pool', lang: ex.lang === 'no' ? 'nb' : 'en' }, tiles)),
      ready: function () { return chosen.length > 0; },
      grade: function () {
        var text = chosen.map(function (i) { return ex.tiles[i]; }).join(' '), r = S.check(text, ex.answer, ex.lang, { strict: true });
        return { ok: r.ok, why: r.why, solution: wordSolution(ex), given: text, parts: [{ keys: ex.keys, ok: r.ok }] };
      },
      lock: function () { locked = true; }
    };
  };
  KINDS.table = function (ex, changed) {
    var inputs = [];
    var rows = ex.rows.map(function (r, i) {
      var input = h('input', { id: 'row-' + i, type: 'text', autocomplete: 'off', autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false', lang: 'nb', 'aria-label': r.label, oninput: changed, onfocus: function () { last = input; } });
      inputs.push(input);
      return h('div', { class: 'frow' }, h('div', { class: 'what' }, h('b', null, r.label), h('span', null, r.hint)),
        h('div', { class: 'entry' }, h('div', { class: 'line' }, r.pre ? h('span', { class: 'pre' }, r.pre) : null, input)));
    });
    var last = inputs[0];
    return {
      el: h('div', { class: 'ftable' }, rows, specialKeys(function () { return last; })),
      focus: function () { inputs[0].focus({ preventScroll: true }); },
      ready: function () { return inputs.every(function (x) { return x.value.trim(); }); },
      grade: function () {
        var parts = ex.rows.map(function (r, i) {
          var c = S.check(inputs[i].value, [[{ a: r.answer, key: r.key }]], 'no', { strict: true });
          return { keys: [r.key], ok: c.ok, note: c.note };
        });
        var ok = parts.every(function (p) { return p.ok; });
        return { ok: ok, parts: parts, note: (parts.filter(function (p) { return p.note; })[0] || {}).note, quiet: true };
      },
      lock: function (res) {
        inputs.forEach(function (x, i) {
          x.readOnly = true; x.classList.add(res.parts[i].ok ? 'right' : 'wrong');
          if (!res.parts[i].ok) add(rows[i], h('div', { class: 'fix' }, (ex.rows[i].pre ? ex.rows[i].pre + ' ' : '') + ex.rows[i].answer[0]));
        });
      }
    };
  };
  KINDS.match = function (ex, changed, finish) {
    var pickL = null, pickR = null, left = {}, right = {}, gone = 0, slips = {};
    function btn(text, side) {
      var b = h('button', { class: 'opt', type: 'button', 'aria-pressed': 'false', lang: side === 'l' ? 'nb' : 'en', onclick: function () { choose(text, side); } }, text);
      (side === 'l' ? left : right)[text] = b; return b;
    }
    function choose(text, side) {
      if (side === 'l') pickL = pickL === text ? null : text; else pickR = pickR === text ? null : text;
      Object.keys(left).forEach(function (k) { left[k].setAttribute('aria-pressed', k === pickL ? 'true' : 'false'); });
      Object.keys(right).forEach(function (k) { right[k].setAttribute('aria-pressed', k === pickR ? 'true' : 'false'); });
      if (pickL == null || pickR == null) return;
      var pair = ex.pairs.filter(function (p) { return p.a === pickL; })[0], a = left[pickL], b = right[pickR];
      if (pair.b === pickR) {
        [a, b].forEach(function (x) { x.disabled = true; x.classList.add('gone'); x.setAttribute('aria-pressed', 'false'); });
        gone++; sfxSoft();
        if (gone === ex.pairs.length) finish({ ok: true, clean: !Object.keys(slips).length, quiet: true, parts: ex.pairs.map(function (p) { return { keys: [p.key], ok: !slips[p.key] }; }) });
      } else {
        slips[pair.key] = 1;
        var other = ex.pairs.filter(function (p) { return p.b === pickR; })[0]; if (other) slips[other.key] = 1;
        [a, b].forEach(function (x) { x.classList.remove('shake'); void x.offsetWidth; x.classList.add('shake'); x.setAttribute('aria-pressed', 'false'); });
      }
      pickL = pickR = null;
    }
    var rowsEl = [];
    for (var i = 0; i < ex.left.length; i++) rowsEl.push(btn(ex.left[i], 'l'), btn(ex.right[i], 'r'));
    return { el: h('div', { class: 'match' }, rowsEl), ready: function () { return false; }, auto: true };
  };
  function sfxSoft() { tone([[740, 0, 0.1]]); }

  function showExercise() {
    var ex = session.queue[0], main = doc.getElementById('s-main');
    session.phase = 'ask'; hideTip(); setBar();
    clear(main);
    var check = h('button', { class: 'btn wide', id: 'check', disabled: true, onclick: submit }, 'Check');
    function changed() { check.disabled = !session.view.ready(); }
    session.view = KINDS[ex.kind](ex, changed, resolve);
    add(main, [h('h2', null, ex.title), ex.kind === 'match' ? null : promptView(ex), session.view.el]);
    footer(session.view.auto ? h('p', { class: 'note' }, 'Tap a word on the left, then its partner on the right.') : check);
    doc.querySelector('.s-body').scrollTop = 0;
    if (session.view.focus && window.matchMedia('(hover: hover)').matches) session.view.focus();
    var p = ex.prompt || {};
    if (speech.on() && (p.audio || (p.lang === 'no' && p.say && !/___/.test(p.text || p.big || '')))) speech.say(p.audio || p.say);
  }
  function submit() {
    if (!session || session.phase !== 'ask' || !session.view.ready()) return;
    resolve(session.view.grade());
  }
  function resolve(res) {
    var ex = session.queue.shift();
    session.phase = 'told';
    if (session.view.lock) session.view.lock(res);
    res.parts.forEach(function (p) { store.record(p.keys, p.ok); });
    store.stash();
    var firstTry = ex.tries === 0;
    ex.tries++;
    if (res.ok) { session.done++; if (firstTry && res.clean !== false) session.first++; sfx.ok(); }
    else {
      sfx.no();
      if (firstTry) session.missed.push(ex);
      if (ex.tries < 2) session.queue.push(ex); else session.done++;
    }
    setBar();
    var lines = [];
    if (res.ok) {
      lines.push(h('h3', null, icon('check'), S.util.pick(PRAISE)));
      if (res.note) lines.push(h('p', null, res.note));
      if (ex.translation) lines.push(h('p', { class: 'soft' }, 'Meaning: ' + ex.translation));
      else if (res.given && res.solution && S.normalize(res.given, ex.lang).join(' ') !== S.normalize(res.solution, ex.lang).join(' ')) lines.push(h('p', { class: 'soft' }, 'Also right: ' + res.solution));
      if (res.clean === false) lines.push(h('p', { class: 'soft' }, 'All matched. The pairs you mixed up will come back.'));
    } else {
      lines.push(h('h3', null, ex.tries < 2 ? 'Ikke helt. You will see this one again.' : 'Ikke helt.'));
      if (res.solution && !res.quiet) lines.push(h('p', { class: 'answer', lang: ex.lang === 'en' ? 'en' : 'nb' }, res.solution));
      if (res.why) lines.push(h('p', null, res.why));
      if (ex.explain) lines.push(h('p', { class: 'soft' }, ex.explain));
      if (ex.translation) lines.push(h('p', { class: 'soft' }, 'Meaning: ' + ex.translation));
      if (ex.table && ex.kind !== 'table') lines.push(formsGrid(ex.table.type, ex.table.id, ex.table.hi));
    }
    var cont = h('button', { class: 'btn wide' + (res.ok ? '' : ' bad'), id: 'continue', onclick: advance }, 'Continue');
    footer([h('div', { class: 'verdict', role: 'status' }, lines), cont], res.ok ? 'ok' : 'no');
    if (speech.on() && ex.say && ex.kind !== 'match' && !(ex.prompt && ex.prompt.audio)) speech.say(ex.say);
    cont.focus({ preventScroll: true });
  }
  function advance() {
    if (!session || session.phase !== 'told') return;
    if (session.queue.length) showExercise(); else finishSession();
  }
  function lemmaOf(key) {
    var p = key.split(':');
    if (p[0] === 'n' && S.nouns[p[1]]) return S.nounForms(p[1])[p[2]] ? S.nounForms(p[1])[p[2]][0] : p[1];
    if (p[0] === 'v' && S.verbs[p[1]]) return S.verbForms(p[1])[p[2]] ? S.verbForms(p[1])[p[2]][0] : p[1];
    if (p[0] === 'a' && S.adjs[p[1]]) return p[1];
    if (p[0] === 'g' && S.nouns[p[1]]) return S.withArticle(p[1]);
    return null;
  }
  function finishSession() {
    var cfg = session.cfg, acc = session.first / session.total;
    var xp = cfg.lesson ? 10 + (acc >= 0.9 ? 5 : acc >= 0.75 ? 2 : 0) : Math.min(20, 4 + session.first);
    var out = store.finish({ xp: xp, lesson: cfg.lesson, accuracy: acc });
    session.phase = 'end'; sfx.done();
    var main = doc.getElementById('s-main');
    clear(main); main.classList.add('done-screen');
    doc.getElementById('s-bar').style.width = '100%';
    var revisit = S.uniq([].concat.apply([], session.missed.map(function (ex) { return ex.keys.map(lemmaOf); }))).slice(0, 6);
    add(main, [
      h('div', { class: 'pop' }, pic('troll', 'cheer')),
      h('h2', null, cfg.lesson ? (out.level >= 3 && out.levelUp ? 'Mestret!' : 'Leksjon fullført!') : 'Bra jobba!'),
      h('p', { class: 'rhyme' }, cfg.lesson ? 'Snipp, snapp, snute, så er eventyret ute. That is how every Norwegian fairy tale ends, and this lesson too.'
        : acc === 1 ? 'Not a single slip. Øvelse gjør mester: practice makes the master.' : 'Øvelse gjør mester: practice makes the master.'),
      h('div', { class: 'tiles' },
        h('div', { class: 'tile' }, h('b', null, '+' + xp), h('span', null, 'runes')),
        h('div', { class: 'tile' }, h('b', null, pct(session.first, session.total) + '%'), h('span', null, 'first try')),
        h('div', { class: 'tile' }, h('b', null, out.streak), h('span', null, out.streakGrew ? 'day streak, up one' : 'day streak'))),
      revisit.length ? h('div', { class: 'field' }, h('div', { class: 'label' }, 'Worth another look'), h('div', { class: 'hintline', style: 'justify-content:center' }, revisit.map(function (w) { return h('span', { class: 'lemma' }, w); }))) : null
    ]);
    var done = h('button', { class: 'btn wide', id: 'continue', onclick: endSession }, 'Continue');
    footer(done); done.focus({ preventScroll: true });
  }

  function onKey(e) {
    if (e.key === 'Escape') { if (doc.getElementById('scrim')) { clearSheet(); return; } if (session) askQuit(); return; }
    if (!session || doc.getElementById('scrim')) return;
    var typing = /^(INPUT|TEXTAREA)$/.test((e.target && e.target.tagName) || '');
    if (e.key === 'Enter' && !e.shiftKey) {
      if (session.phase === 'ask') {
        var t = e.target;
        // Enter on a button presses that button; on a choice or tile already used, it checks the answer
        var spent = t && (t.classList.contains('used') || (t.classList.contains('opt') && t.getAttribute('aria-pressed') === 'true'));
        if (t && t.tagName === 'BUTTON' && t.id !== 'check' && !spent) return;
        if (session.view.ready()) { e.preventDefault(); submit(); }
        else if (typing && e.target.tagName === 'INPUT') {
          var all = [].slice.call(doc.querySelectorAll('.ftable input')), i = all.indexOf(e.target);
          if (i >= 0 && all[i + 1]) { e.preventDefault(); all[i + 1].focus(); }
        }
      } else if (e.target && e.target.id !== 'continue') { e.preventDefault(); if (session.phase === 'told') advance(); else endSession(); }
    } else if (!typing && session.phase === 'ask' && session.view.select && /^[1-9]$/.test(e.key)) session.view.select(+e.key - 1);
  }

  // ---------- start ----------
  S.app = {
    render: function () { if (app && !session) render(); }, go: go, current: function () { return session; },
    start: function () {
      store.load(); speech.init(); mount();
      // offline support when served from a real web address
      if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.claude) {
        navigator.serviceWorker.register('sw.js').catch(function () { /* fine without it */ });
      }
    }
  };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', S.app.start); else S.app.start();
})(globalThis.Sproke = globalThis.Sproke || {});
