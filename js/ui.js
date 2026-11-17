// ui.js: everything that is HTML rather than WebGL: bubbles, field guide, toast, tooltip, buttons.
(function (ZL) {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const TYPES = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
  const live = new Map(); // entity -> { el, until }
  const found = { human: new Set(), zombie: new Set() };
  const cells = { human: {}, zombie: {} };
  let total = 0;

  // ------------------------------------------------------------------ bubbles
  ZL.say = function (e, text, o) {
    if (!e || !text) return;
    o = o || {};
    let b = live.get(e);
    if (!b) {
      b = { el: document.createElement('div') };
      b.el.innerHTML = '<span class="who"></span><span class="txt"></span>';
      $('bubbles').appendChild(b.el);
      live.set(e, b);
    }
    const thought = o.thought != null ? o.thought : e.bubble === 'thought';
    b.el.className = 'bubble ' + e.kind + (thought ? ' thought' : '');
    void b.el.offsetWidth; // restart the pop animation
    b.el.classList.add('in');
    b.el.firstChild.textContent = e.kind === 'zombie' && e.type ? e.type + ' zombie' : e.type || e.title || '';
    b.el.lastChild.textContent = text;
    b.until = performance.now() + (o.dur || Math.min(7500, Math.max(2800, 1900 + text.length * 55)));
    b.born = performance.now();
    if (live.size > 7) { // drop the oldest so the screen never fills up
      let old = null; live.forEach((v, k) => { if (k !== e && (!old || v.born < live.get(old).born)) old = k; });
      if (old) kill(old);
    }
    if (!o.ambient) {
      e.pop = 1;
      if (e.kind === 'zombie') ZL.sfx.groan(); else if (thought) ZL.sfx.think(); else if (e.kind === 'item') ZL.sfx.item(); else ZL.sfx.pop();
    }
    if (e.type) ZL.markFound(e);
  };

  function kill(e) { const b = live.get(e); if (b) { b.el.remove(); live.delete(e); } }
  ZL.hush = kill;
  ZL.speaking = (e) => live.has(e);

  ZL.updateBubbles = function (project, W, H) {
    const now = performance.now();
    live.forEach((b, e) => {
      if (now > b.until + 350) return kill(e);
      if (now > b.until) b.el.classList.add('fade');
      const p = project(e);
      const hw = b.el.offsetWidth / 2 + 6;
      const x = Math.min(W - hw, Math.max(hw, p.x)), y = Math.max(b.el.offsetHeight + 66, p.y);
      b.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%) translateY(-14px)`;
      b.el.style.visibility = p.x < -80 || p.x > W + 80 || p.y < -40 || p.y > H + 160 ? 'hidden' : 'visible';
    });
  };

  // ------------------------------------------------------------------ field guide
  ZL.buildRoster = function () {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('mbti-zombie-found') || '{}'); } catch (e) { /* private mode */ }
    ['human', 'zombie'].forEach((kind) => {
      const grid = $(kind === 'human' ? 'gridH' : 'gridZ');
      TYPES.forEach((t) => {
        const who = ZL.entities.filter((e) => e.kind === kind && e.type === t);
        const c = document.createElement('div');
        c.className = 'cell' + (kind === 'zombie' ? ' z' : '');
        c.textContent = t;
        c.style.setProperty('--c', ZL.TEMPER[ZL.temper(t)]);
        if (!who.length) {
          c.classList.add('gone');
          c.title = 'No ' + t + ' survivors. They heard there was a party outside the fence.';
          c.onclick = () => { ZL.toast('No ' + t + ' survivors. They all went to the party.', 2600); const z = ZL.entities.find((e) => e.kind === 'zombie' && e.type === t); if (z) { ZL.flyTo(z); ZL.speak(z); } };
        } else {
          total++;
          let i = 0;
          c.title = 'Find the ' + t + (kind === 'zombie' ? ' zombie' : '');
          c.onclick = () => { const e = who[i++ % who.length]; ZL.flyTo(e); if (!e.hidden) ZL.speak(e); else ZL.toast('Hmm. Somebody is hiding in there...', 2200); };
          if ((saved[kind] || []).includes(t)) { found[kind].add(t); c.classList.add('found'); }
        }
        cells[kind][t] = c;
        grid.appendChild(c);
      });
    });
    count();
    $('rosterHead').onclick = () => $('roster').classList.toggle('shut');
    if (window.innerWidth < 760) $('roster').classList.add('shut');
  };

  function count() { $('count').textContent = (found.human.size + found.zombie.size) + ' / ' + total; }

  ZL.markFound = function (e) {
    const set = found[e.kind];
    if (!set || set.has(e.type) || !cells[e.kind][e.type]) return;
    set.add(e.type);
    cells[e.kind][e.type].classList.add('found');
    count();
    try { localStorage.setItem('mbti-zombie-found', JSON.stringify({ human: [...found.human], zombie: [...found.zombie] })); } catch (err) { /* ignore */ }
    if (found.human.size + found.zombie.size === total) setTimeout(() => { ZL.toast('FIELD GUIDE COMPLETE! You are now an honorary ISTJ.', 5000); ZL.sfx.win(); }, 900);
  };

  // ------------------------------------------------------------------ toast, tooltip, flash
  let toastT = 0;
  ZL.toast = function (text, ms) {
    const el = $('toast'); el.textContent = text; el.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), ms || 2400);
  };
  ZL.tip = function (text, x, y) {
    const el = $('tip');
    if (!text) { el.style.display = 'none'; return; }
    el.textContent = text; el.style.display = 'block';
    el.style.left = Math.min(window.innerWidth - el.offsetWidth - 8, x + 16) + 'px'; el.style.top = (y + 18) + 'px';
  };
  ZL.flash = function () { const f = $('flash'); f.classList.add('on'); setTimeout(() => f.classList.remove('on'), 90); };

  // ------------------------------------------------------------------ buttons
  ZL.wireButtons = function () {
    const tog = (id, get, set, labels) => {
      const b = $(id);
      const paint = () => { b.classList.toggle('off', !get()); if (labels) b.innerHTML = labels[get() ? 1 : 0]; };
      b.onclick = () => { set(!get()); paint(); b.blur(); };
      paint();
      return () => b.onclick();
    };
    $('bBreach').onclick = () => { ZL.breach(); $('bBreach').blur(); };
    $('bTrap').onclick = () => { ZL.fireTrap(); $('bTrap').blur(); };
    const keys = {
      c: tog('bChat', () => ZL.chatter, (v) => { ZL.chatter = v; }),
      l: tog('bTags', () => ZL.showTags, (v) => ZL.setTags(v)),
      n: tog('bDay', () => true, () => ZL.setDay(!ZL.isDay), null),
      m: tog('bSnd', () => ZL.sfx.on, (v) => { ZL.sfx.on = v; }, ['&#128263; Muted', '&#128266; Sound']),
      b: () => ZL.breach(), t: () => ZL.fireTrap(),
    };
    ZL.paintDay = () => { $('bDay').innerHTML = ZL.isDay ? '&#9728;&#65039; Day' : '&#127769; Night'; };
    ZL.hotkeys = keys;
  };
})(window.ZL);
