// events.js: the things that happen: explosions, traps, breaches, day/night, ambient chatter, camera moves, keys.
(function (ZL) {
  'use strict';
  ZL.breachK = 0;

  ZL.initEvents = function () {
    const T = ZL.THREE, { scene, camera, controls } = ZL, { rand, pick } = ZL;
    const stage = document.getElementById('stage');
    const tmp = new T.Vector3(), tmp2 = new T.Vector3();

    // ---------------------------------------------------------------- explosion particles
    const sparks = [];
    for (let i = 0; i < 48; i++) {
      const m = ZL.box(0.25, 0.25, 0.25, ['#ffe36e', '#ff8a2e', '#ff4a1f', '#6a6a72'][i % 4], 0, -50, 0, { basic: true });
      m.visible = false; scene.add(m); sparks.push({ m, v: new T.Vector3(), life: 0 });
    }
    const blast = ZL.sph(1, '#fff2a8', 0, -50, 0, { basic: true, opacity: 0.7 }); blast.visible = false; scene.add(blast);
    const blastLight = new T.PointLight('#ffb04a', 0, 30, 1.5); scene.add(blastLight);
    let blastT = 9, shake = 0;

    ZL.boom = function (x, z, radius) {
      radius = radius || 3.5;
      ZL.sfx.boom();
      let n = 0;
      sparks.forEach((s) => {
        if (s.life > 0 || n >= 26) return;
        n++; s.life = rand(0.6, 1.2); s.m.visible = true; s.m.position.set(x, 0.5, z);
        const a = rand(0, 6.283), sp = rand(2, 9);
        s.v.set(Math.cos(a) * sp, rand(5, 13), Math.sin(a) * sp);
      });
      blast.position.set(x, 0.6, z); blast.visible = true; blastT = 0;
      blastLight.position.set(x, 2.5, z);
      shake = 1;
      const victims = ZL.entities.filter((e) => e.kind === 'zombie' && e.parts && !e.fly && !e.spec.lie && !e.spec.at
        && Math.hypot(e.obj.position.x - x, e.obj.position.z - z) < radius);
      victims.forEach((e) => { e.fly = { t: 0, vy: rand(7, 12), spin: rand(4, 10) * pick([-1, 1]) }; });
      if (victims.length) setTimeout(() => ZL.say(pick(victims), pick(ZL.FLYING), { dur: 1800 }), 150);
      return victims.length;
    };

    let trapCool = 0, trapN = 14;
    ZL.fireTrap = function () {
      if (trapCool > 0) return;
      trapCool = 0.9;
      const crowd = ZL.entities.filter((e) => e.surge && !e.fly && !e.spec.type);
      const v = pick(crowd);
      if (!v) return;
      ZL.toast('TRAP #' + trapN++ + ' ACTIVATED', 1600);
      ZL.say(ZL.byId.intj_tower, pick(['Remote trap activated.', 'Remote trap activated. Again.', 'Predictable. Effective.', 'I labelled that one "Tuesday".']));
      setTimeout(() => ZL.boom(v.obj.position.x, v.obj.position.z, 3.4), 350);
    };

    // ---------------------------------------------------------------- breach!
    let breachT = 0;
    ZL.breach = function () {
      if (breachT > 0) return;
      breachT = 4.2;
      ZL.toast('BREACH! EVERYBODY PANIC (IN CHARACTER)', 3000);
      ZL.flash(); ZL.sfx.alarm();
      const B = ZL.byId, later = (ms, id, text, o) => setTimeout(() => ZL.say(B[id], text, o), ms);
      later(200, 'entj_f', 'PERIMETER! I SAID PERIMETER FIRST!');
      later(700, 'istp_f', 'On it.');
      later(1100, 'estj', 'This violates rules #1 through #72!');
      later(1500, 'infp', '(faints again, sincerely)', { thought: true });
      later(1900, 'esfj', 'Nobody panic! There is enough soup for the zombies too!');
      later(2300, 'entp', 'Technically this is the ENTJ\'s fault. Discuss.');
      later(2700, 'z_enfj', 'See? Teamwork, everyone! I\'m so proud of us!');
      later(3100, 'enfj', 'Hold hands! Fear cannot get in if love is in the way!');
      if (ZL.bunker.open) later(3400, 'intj_bunker', 'Not my problem.');
      setTimeout(() => ZL.toast('The gate holds. ISTP shrugs.', 2400), 4300);
    };

    // ---------------------------------------------------------------- day / night
    const NIGHT = { bg: new T.Color('#10142a'), sky: new T.Color('#7686d6'), gnd: new T.Color('#3a2f2a'), sun: new T.Color('#a9bcff'), hemi: 2.1, dir: 2.0 };
    const DAY = { bg: new T.Color('#9ccbe8'), sky: new T.Color('#ffffff'), gnd: new T.Color('#b09a72'), sun: new T.Color('#fff0d2'), hemi: 2.5, dir: 3.1 };
    let dayK = 0;
    ZL.setDay = function (v) {
      ZL.isDay = v; ZL.paintDay();
      ZL.toast(v ? 'Good morning! The zombies are still here.' : 'Night falls. So does morale.', 2600);
      if (v) setTimeout(() => ZL.say(ZL.byId.intp_couch, 'zzz... who turned on the sun... zzz'), 1200);
    };
    function paintSky() {
      const { hemi, moon } = ZL.lights, k = dayK;
      scene.background.copy(NIGHT.bg).lerp(DAY.bg, k);
      hemi.color.copy(NIGHT.sky).lerp(DAY.sky, k); hemi.groundColor.copy(NIGHT.gnd).lerp(DAY.gnd, k);
      hemi.intensity = NIGHT.hemi + (DAY.hemi - NIGHT.hemi) * k;
      moon.color.copy(NIGHT.sun).lerp(DAY.sun, k); moon.intensity = NIGHT.dir + (DAY.dir - NIGHT.dir) * k;
      document.getElementById('vignette').style.opacity = 1 - k * 0.7;
    }

    // ---------------------------------------------------------------- camera helpers
    let fly = null;
    function shiftTarget(to) { tmp2.copy(to).sub(controls.target); controls.target.add(tmp2); camera.position.add(tmp2); }
    ZL.flyTo = function (e) {
      e.obj.getWorldPosition(tmp);
      fly = { from: controls.target.clone(), to: new T.Vector3(tmp.x, 0, tmp.z), z0: camera.zoom, z1: Math.max(camera.zoom, 2.6), k: 0 };
    };
    function orbit(angle) {
      tmp.copy(camera.position).sub(controls.target).applyAxisAngle(T.Object3D.DEFAULT_UP, angle);
      camera.position.copy(controls.target).add(tmp); camera.lookAt(controls.target);
    }
    controls.addEventListener('change', () => { // keep the camp in sight
      const tg = controls.target, cx = Math.max(-46, Math.min(46, tg.x)), cz = Math.max(-46, Math.min(46, tg.z));
      if (cx !== tg.x || cz !== tg.z) shiftTarget(tmp.set(cx, 0, cz));
    });

    const held = new Set();
    window.addEventListener('keydown', (ev) => {
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const k = ev.key.toLowerCase();
      if (!ZL.started) { if (k === 'enter' || k === ' ') document.getElementById('intro').click(); return; }
      held.add(k);
      if (ev.repeat) return;
      if (ZL.hotkeys[k]) ZL.hotkeys[k]();
      else if (k === ' ') { ev.preventDefault(); chatterNow(true); }
      else if (k === '=' || k === '+') zoomBy(1.25); else if (k === '-') zoomBy(0.8);
    });
    window.addEventListener('keyup', (ev) => held.delete(ev.key.toLowerCase()));
    window.addEventListener('blur', () => held.clear());
    function zoomBy(f) { camera.zoom = Math.max(controls.minZoom, Math.min(controls.maxZoom, camera.zoom * f)); camera.updateProjectionMatrix(); }

    // ---------------------------------------------------------------- ambient chatter
    let chatT = 3;
    function chatterNow(loud) {
      const W = window.innerWidth, H = window.innerHeight;
      const pool = ZL.entities.filter((e) => {
        if (!e.parts || e.hidden || e.fly || ZL.speaking(e)) return false;
        if (!e.spec.type && Math.random() > 0.06) return false;
        const p = ZL.project(e);
        return p.x > 90 && p.x < W - 90 && p.y > 110 && p.y < H - 40;
      });
      const e = pick(pool);
      if (!e) return;
      if (e.lines) ZL.say(e, e.lines[e.idx++ % e.lines.length], { ambient: !loud });
      else ZL.say(e, pick(ZL.GROANS), { ambient: !loud });
    }

    // ---------------------------------------------------------------- per-frame
    ZL.tickEvents = function (t, dt) {
      sparks.forEach((s) => {
        if (s.life <= 0) return;
        s.life -= dt; s.v.y -= 22 * dt; s.m.position.addScaledVector(s.v, dt);
        s.m.rotation.x += dt * 9; s.m.rotation.z += dt * 7; s.m.scale.setScalar(Math.max(0.02, s.life * 0.3));
        if (s.life <= 0 || s.m.position.y < 0) { s.life = 0; s.m.visible = false; }
      });
      if (blastT < 1) {
        blastT += dt * 3.2;
        blast.scale.setScalar(0.5 + blastT * 3.6); blast.material.opacity = Math.max(0, 0.75 * (1 - blastT)); blast.visible = blastT < 1;
        blastLight.intensity = 90 * Math.max(0, 1 - blastT);
      }
      shake = Math.max(0, shake - dt * 3.2);
      const br = breachT > 0 ? 0.35 : 0;
      stage.style.transform = shake + br > 0.01 ? `translate(${(Math.random() - 0.5) * 14 * (shake + br * 0.4)}px, ${(Math.random() - 0.5) * 14 * (shake + br * 0.4)}px)` : '';
      trapCool = Math.max(0, trapCool - dt);

      if (breachT > 0) { breachT -= dt; ZL.gate.shake = Math.max(ZL.gate.shake, 0.9); if (Math.random() < dt * 5) ZL.sfx.rattle(); }
      ZL.breachK += ((breachT > 0.6 ? 1 : 0) - ZL.breachK) * Math.min(1, dt * 3);

      const dk = (ZL.isDay ? 1 : 0) - dayK;
      if (Math.abs(dk) > 0.001) { dayK += dk * Math.min(1, dt * 2.2); paintSky(); }

      if (fly) {
        fly.k = Math.min(1, fly.k + dt * 1.5);
        const e = fly.k * fly.k * (3 - 2 * fly.k);
        shiftTarget(tmp.copy(fly.from).lerp(fly.to, e));
        camera.zoom = fly.z0 + (fly.z1 - fly.z0) * e; camera.updateProjectionMatrix();
        if (fly.k >= 1) fly = null;
      }
      if (held.size && ZL.started) {
        const sp = (34 / camera.zoom) * dt, f = tmp.set(0, 0, 0);
        camera.getWorldDirection(tmp2); tmp2.y = 0; tmp2.normalize();
        const fw = (held.has('w') || held.has('arrowup') ? 1 : 0) - (held.has('s') || held.has('arrowdown') ? 1 : 0);
        const rt = (held.has('d') || held.has('arrowright') ? 1 : 0) - (held.has('a') || held.has('arrowleft') ? 1 : 0);
        if (fw || rt) { f.set(tmp2.x * fw - tmp2.z * rt, 0, tmp2.z * fw + tmp2.x * rt).multiplyScalar(sp).add(controls.target); shiftTarget(f); fly = null; }
        if (held.has('q')) orbit(dt * 1.4);
        if (held.has('e')) orbit(-dt * 1.4);
      }

      if (ZL.chatter && ZL.started) {
        chatT -= dt;
        if (chatT <= 0) { chatT = rand(2.2, 4.2); chatterNow(false); }
      }
    };
  };
})(window.ZL);
