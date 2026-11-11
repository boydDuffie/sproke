/* Sproke — progress. Saved in the browser; nothing leaves the device unless a sync hook is attached. */
(function (S) {
  'use strict';

  var KEY = 'sproke.v1';
  var DAY = 86400000;
  // how long an item rests after each correct answer in a row
  var REST = [0, 10 * 60000, DAY, 3 * DAY, 7 * DAY, 21 * DAY];

  function fresh() {
    return {
      v: 1, xp: 0, streak: { count: 0, last: '' }, days: {}, goal: 30,
      lessons: {}, srs: {}, stats: { answered: 0, correct: 0, sessions: 0 },
      settings: { fem: true, sound: true, speak: true }, updated: 0
    };
  }
  function dayKey(t) {
    var d = new Date(t == null ? Date.now() : t);
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function merge(base, saved) {
    if (!saved || typeof saved !== 'object') return base;
    Object.keys(base).forEach(function (k) {
      if (saved[k] == null) return;
      if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) && Object.keys(base[k]).length && k !== 'days' && k !== 'lessons' && k !== 'srs') {
        Object.keys(saved[k]).forEach(function (j) { base[k][j] = saved[k][j]; });
      } else base[k] = saved[k];
    });
    return base;
  }

  var store = {
    data: fresh(), listeners: [], dayKey: dayKey,

    load: function () {
      try {
        var raw = globalThis.localStorage && globalThis.localStorage.getItem(KEY);
        if (raw) store.data = merge(fresh(), JSON.parse(raw));
      } catch (e) { /* private window or blocked storage: carry on in memory */ }
      S.settings.fem = store.data.settings.fem !== false;
      return store.data;
    },
    save: function () {
      store.data.updated = Date.now();
      try { globalThis.localStorage && globalThis.localStorage.setItem(KEY, JSON.stringify(store.data)); } catch (e) { /* ignore */ }
      store.listeners.forEach(function (fn) { try { fn(store.data); } catch (e) { /* ignore */ } });
    },
    /** Keep a local copy without notifying sync (called after every answer). */
    stash: function () {
      try { globalThis.localStorage && globalThis.localStorage.setItem(KEY, JSON.stringify(store.data)); } catch (e) { /* ignore */ }
    },
    /** Replace everything with a newer copy (used by sync). */
    adopt: function (saved) {
      store.data = merge(fresh(), saved);
      S.settings.fem = store.data.settings.fem !== false;
      if (S.resetIndex) S.resetIndex();
      try { globalThis.localStorage && globalThis.localStorage.setItem(KEY, JSON.stringify(store.data)); } catch (e) { /* ignore */ }
    },
    reset: function () { store.data = fresh(); S.settings.fem = true; store.save(); },
    set: function (name, value) {
      store.data.settings[name] = value;
      if (name === 'fem') { S.settings.fem = value; if (S.resetIndex) S.resetIndex(); }
      store.save();
    },

    // ----- spaced repetition -----
    record: function (keys, ok, now) {
      now = now || Date.now();
      var d = store.data;
      d.stats.answered++; if (ok) d.stats.correct++;
      (keys || []).forEach(function (k) {
        var e = d.srs[k] || (d.srs[k] = { s: 0, d: 0, m: 0, n: 0 });
        e.n++;
        if (ok) { e.s = Math.min(5, e.s + 1); e.d = now + REST[e.s]; }
        else { e.s = Math.max(0, e.s - 2); e.m++; e.d = now; }
      });
    },
    /** Higher = should come up sooner. Accepts a full key or a word prefix such as "n:hest". */
    weight: function (key, now) {
      now = now || Date.now();
      var srs = store.data.srs, parts = key.split(':'), keys = [key];
      if (parts.length === 2 && parts[0] === 'n') keys = ['ds', 'ip', 'dp'].map(function (f) { return key + ':' + f; });
      if (parts.length === 2 && parts[0] === 'v') keys = ['pres', 'past', 'pp'].map(function (f) { return key + ':' + f; });
      var best = 0;
      keys.forEach(function (k) {
        var e = srs[k], w;
        if (!e) w = 2.2;
        else w = 0.3 + (5 - e.s) * 0.45 + Math.min(e.m, 4) * 0.5 + (e.d <= now ? 0.8 : 0);
        if (w > best) best = w;
      });
      return best;
    },
    /** Items that have gone wrong and are not solid yet, worst first. */
    weak: function (limit, now) {
      now = now || Date.now();
      var srs = store.data.srs;
      return Object.keys(srs).filter(function (k) { var e = srs[k]; return e.m > 0 && e.s < 4; })
        .sort(function (a, b) { return (srs[a].s - srs[b].s) || (srs[b].m - srs[a].m) || (srs[a].d - srs[b].d); })
        .slice(0, limit || 50);
    },
    strength: function (key) { var e = store.data.srs[key]; return e ? e.s : -1; },

    // ----- lessons, xp, streak -----
    level: function (lessonKey) { var l = store.data.lessons[lessonKey]; return l ? l.level : 0; },
    nextLesson: function () {
      for (var i = 0; i < S.lessons.length; i++) if (!store.level(S.lessons[i].key)) return S.lessons[i];
      return null;
    },
    todayXp: function () { return store.data.days[dayKey()] || 0; },
    streak: function () {
      var st = store.data.streak, today = dayKey(), yesterday = dayKey(Date.now() - DAY);
      return st.last === today || st.last === yesterday ? st.count : 0;
    },
    litToday: function () { return store.data.streak.last === dayKey(); },
    /** Called once when a session ends. Returns what changed, for the summary screen. */
    finish: function (info) {
      var d = store.data, today = dayKey(), yesterday = dayKey(Date.now() - DAY);
      var before = store.streak(), result = { xp: info.xp, streakBefore: before, levelUp: false };
      d.xp += info.xp;
      d.days[today] = (d.days[today] || 0) + info.xp;
      var keep = Object.keys(d.days).sort().slice(-60), days = {};
      keep.forEach(function (k) { days[k] = d.days[k]; });
      d.days = days;
      if (d.streak.last !== today) d.streak = { count: d.streak.last === yesterday ? d.streak.count + 1 : 1, last: today };
      d.stats.sessions++;
      if (info.lesson) {
        var l = d.lessons[info.lesson] || (d.lessons[info.lesson] = { level: 0, runs: 0, best: 0 });
        l.runs++; l.best = Math.max(l.best, info.accuracy);
        if (l.level < 3) { l.level++; result.levelUp = true; }
        result.level = l.level;
      }
      result.streak = d.streak.count;
      result.streakGrew = d.streak.count > before;
      store.save();
      return result;
    }
  };
  S.store = store;
})(globalThis.Sproke = globalThis.Sproke || {});
