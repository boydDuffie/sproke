/* Optional add-on for the copy published as a claude.ai artifact:
 *   node tools/build.js --fragment --append tools/artifact-sync.js
 * Keeps each viewer's progress in their own private document so it follows them between
 * devices, and borrows the platform voice when the device has no Norwegian one.
 * Everywhere else window.claude does not exist and this file does nothing.
 */
(function (S) {
  'use strict';
  var claude = typeof window !== 'undefined' && window.claude;
  if (!claude || typeof claude.use !== 'function') return;

  var ref = null, writing = false, dirty = false, timer = null;
  function push() {
    if (!ref) return;
    if (writing) { dirty = true; return; }
    writing = true; dirty = false;
    var d = S.store.data;
    ref.set({ updated: d.updated || Date.now(), progress: JSON.stringify(d) }).then(settle, function (e) {
      if (e && e.code !== 'unavailable') ref = null;   // this viewer cannot save here; stay local
      settle();
    });
  }
  function settle() { writing = false; if (dirty && ref) schedule(); }
  function schedule() { dirty = true; clearTimeout(timer); timer = setTimeout(push, 2500); }

  Promise.all([claude.use('db'), claude.use('user')]).then(function (got) {
    var db = got[0], user = got[1];
    if (!db || !user) return null;
    return user.id().then(function (id) {
      if (!id) return null;
      ref = db.doc('data/users/' + id + '/sproke');
      return ref.get();
    }).then(function (snap) {
      if (!snap) return;
      var remote = snap.exists ? snap.data() : null, local = S.store.data;
      if (remote && typeof remote.progress === 'string' && (remote.updated || 0) > (local.updated || 0)) {
        try { S.store.adopt(JSON.parse(remote.progress)); S.app.render(); } catch (e) { /* keep local */ }
      } else if (local.updated) push();
      S.store.listeners.push(schedule);
    });
  }).catch(function () { ref = null; });

  claude.use('tts').then(function (tts) {
    if (!tts || typeof tts.languages !== 'function') return;
    return tts.languages().then(function (langs) {
      var lang = ['nb', 'no', 'nn'].filter(function (l) { return (langs || []).indexOf(l) >= 0; })[0];
      if (!lang) return;
      S.speech.cloud = function (text) { tts.speak(text, { language: lang, rate: 0.9 }).catch(function () { /* optional */ }); };
      S.app.render();
    });
  }).catch(function () { /* no voice */ });
})(globalThis.Sproke = globalThis.Sproke || {});
