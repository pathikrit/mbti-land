// scenery.js: jeep, drone, couch, grill, spike pit, trees and other clutter outside the fence.
(function (ZL) {
  'use strict';
  ZL.JEEP = { cx: -24, cz: -17, r: 7.5, a: 0, speed: 0.55, boost: 0 };
  ZL.RUN = { cx: -22.6, cz: -3, rx: 5.6, rz: 3.9 };

  ZL.buildScenery = function (scene) {
    const T = ZL.THREE, { box, cyl, cone, sph, group, rock, rand, pick, sign } = ZL;

    // ---------------------------------------------------------------- ESTP's jeep (forward = +z)
    const J = group(); scene.add(J); ZL.anchors.jeep = J;
    const red = '#c8323a';
    J.add(box(1.9, 0.6, 3.7, red, 0, 0.9, 0), box(1.8, 0.28, 1.25, '#b02a32', 0, 1.3, 1.15), box(1.9, 0.5, 0.1, red, 0, 1.4, -1.8),
      box(0.1, 0.5, 1.6, red, -0.9, 1.4, -1), box(0.1, 0.5, 1.6, red, 0.9, 1.4, -1), box(1.8, 0.7, 0.08, '#9ad8ff', 0, 1.75, 0.5, { opacity: 0.35 }),
      box(0.08, 0.8, 0.08, '#222', -0.88, 1.75, 0.5), box(0.08, 0.8, 0.08, '#222', 0.88, 1.75, 0.5), box(1.84, 0.08, 0.08, '#222', 0, 2.15, 0.5),
      box(2.1, 0.2, 0.2, '#333', 0, 0.7, 1.9), box(2.1, 0.2, 0.2, '#333', 0, 0.7, -1.9),
      box(0.3, 0.2, 0.06, '#fff7c2', -0.6, 1.0, 1.87, { basic: true }), box(0.3, 0.2, 0.06, '#fff7c2', 0.6, 1.0, 1.87, { basic: true }),
      box(0.1, 1.2, 0.1, '#333', 0, 1.75, 0.05), box(0.14, 0.14, 1.5, '#2a2a2a', 0, 2.38, 0.55), box(0.3, 0.3, 0.5, '#444', 0, 2.36, 0.0));
    const wheels = [[-1, 1.2], [1, 1.2], [-1, -1.2], [1, -1.2]].map((p) => { const w = cyl(0.5, 0.5, 0.36, '#17171a', p[0], 0.5, p[1], 12); w.rotation.z = Math.PI / 2; J.add(w); return w; });
    const spare = cyl(0.45, 0.45, 0.3, '#17171a', 0, 1.3, -2.0, 12); spare.rotation.x = Math.PI / 2; J.add(spare);
    const flash = cone(0.28, 0.8, '#ffe36e', 0, 2.38, 1.65, 6, { basic: true }); flash.rotation.x = Math.PI / 2; J.add(flash);
    const hl = new T.PointLight('#fff1c8', 18, 16, 1.6); hl.position.set(0, 1.6, 4); J.add(hl);
    const jp = ZL.JEEP;
    ZL.tickers.push((t, dt) => {
      jp.boost = Math.max(0, jp.boost - dt * 0.35);
      jp.a += dt * jp.speed * (1 + jp.boost * 2.2) / 1;
      J.position.set(jp.cx + Math.cos(jp.a) * jp.r, Math.abs(Math.sin(t * 9)) * 0.06, jp.cz + Math.sin(jp.a) * jp.r);
      J.rotation.y = Math.atan2(-Math.sin(jp.a), Math.cos(jp.a));
      J.rotation.z = Math.sin(t * 7) * 0.02 - jp.boost * 0.08;
      flash.visible = Math.sin(t * 38) > 0.2 && (Math.sin(t * 1.7) > -0.3 || jp.boost > 0.1);
      flash.scale.setScalar(0.7 + Math.random() * 0.7);
    });
    ZL.addItem({ id: 'jeep', title: 'Zombie Safari Jeep', obj: J, hit: { w: 2.1, h: 1.3, d: 3.9, y: 0.75 }, lines: [],
      onClick: () => {
        jp.boost = 1; ZL.sfx.honk();
        ZL.say(ZL.byId.estp, pick(['HOLD ON TO YOUR BRAINS!', 'Turbo mode! I didn\'t know we had turbo mode!', 'YEEEHAAAW!', 'Speed limit? In THIS economy?']));
        setTimeout(() => ZL.boom(jp.cx + Math.cos(jp.a - 0.9) * jp.r, jp.cz + Math.sin(jp.a - 0.9) * jp.r, 4.5), 500);
        return false;
      } });
    const bigFire = ZL.fire(1.5, 44); bigFire.position.set(jp.cx, 0, jp.cz); scene.add(bigFire);
    [[-33, -25, 1.1], [-15, -27, 0.9], [-35, -12, 1.2], [-13, -11.5, 0.8], [-28, -29, 1]].forEach((f) => { const g = ZL.fire(f[2], 0); g.position.set(f[0], 0, f[1]); scene.add(g); });

    // ---------------------------------------------------------------- INTJ's drone
    const D = group(); scene.add(D);
    D.add(box(0.55, 0.18, 0.55, '#2a2c36', 0, 0, 0), box(1.5, 0.05, 0.08, '#444', 0, 0.04, 0), box(0.08, 0.05, 1.5, '#444', 0, 0.04, 0), box(0.16, 0.14, 0.2, '#111', 0, -0.14, 0.2));
    const rotors = [[-0.75, 0], [0.75, 0], [0, -0.75], [0, 0.75]].map((p) => { const r = box(0.7, 0.02, 0.08, '#cfd3de', p[0], 0.12, p[1], { opacity: 0.6 }); D.add(r); return r; });
    const led = sph(0.07, '#ff2a2a', 0, -0.12, -0.2, { basic: true }); D.add(led);
    ZL.tickers.push((t) => {
      D.position.set(3 + Math.cos(t * 0.35) * 8, 7.6 + Math.sin(t * 1.7) * 0.25, -4 + Math.sin(t * 0.35) * 6.5);
      D.rotation.y = -t * 0.35; D.rotation.z = Math.sin(t * 2.3) * 0.08;
      rotors.forEach((r, i) => { r.rotation.y = t * 40 + i; });
      led.visible = Math.sin(t * 6) > 0;
    });
    ZL.addItem({ id: 'drone', title: 'INTJ\'s Drone (click = trap)', obj: D, hit: { w: 1.8, h: 1, d: 1.8, y: 0 }, lines: [],
      onClick: () => { ZL.fireTrap(); return false; } });

    // ---------------------------------------------------------------- the couch (INTP, asleep)
    const couch = group(25, 0, 3);
    couch.add(box(3.4, 0.45, 1.25, '#6a3fa0', 0, 0.23, 0), box(3.4, 0.85, 0.32, '#5a3590', 0, 0.78, -0.52), box(0.32, 0.75, 1.25, '#5a3590', -1.7, 0.5, 0), box(0.32, 0.75, 1.25, '#5a3590', 1.7, 0.5, 0),
      box(0.6, 0.2, 0.7, '#8a5fc0', -1.15, 0.52, 0.05));
    couch.add(box(0.9, 0.08, 0.9, '#d8b27a', -0.6, 0.05, 1.5), box(0.5, 0.03, 0.5, '#e8c84a', -0.6, 0.1, 1.5), cyl(0.09, 0.07, 0.16, '#f4f1e6', 1.3, 0.08, 1.3, 8));
    scene.add(couch);
    ZL.addItem({ id: 'couch', title: 'The Couch', obj: couch, hit: { w: 3.4, h: 1, d: 0.4, y: 0.9, z: -0.55 },
      lines: ['Dragged out here "for the breeze". The breeze is zombies.', 'Found between the cushions: $1.35, a pen, the will to live.', 'The safest place in the apocalypse. Nobody can be bothered to attack it.'] });
    ZL.addItem({ id: 'pizza', title: 'Pizza Box', obj: couch, hit: { w: 0.9, h: 0.3, d: 0.9, x: -0.6, y: 0.15, z: 1.5 },
      lines: ['Empty. Explains the dream.', 'One slice left. It is from before the apocalypse. INTP will still eat it.'] });

    // ---------------------------------------------------------------- the grill (ISTP)
    const grill = group(20.3, 0, 13.6); grill.rotation.y = 0.5;
    grill.add(box(1.3, 0.4, 0.8, '#2a2a2e', 0, 0.9, 0), box(1.2, 0.04, 0.7, '#ff6a2a', 0, 1.11, 0, { basic: true }), box(0.6, 0.11, 0.14, '#8fae7e', 0.1, 1.2, 0.05), box(0.14, 0.1, 0.16, '#8fae7e', 0.46, 1.2, 0.05),
      box(0.34, 0.1, 0.14, '#9a5a3a', -0.35, 1.2, -0.15));
    [[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]].forEach((p) => grill.add(box(0.07, 0.75, 0.07, '#444', p[0], 0.37, p[1])));
    const gf = ZL.fire(0.4, 14); gf.position.set(-0.3, 1.1, 0.1); grill.add(gf); scene.add(grill);
    ZL.addItem({ id: 'grill', title: 'The Grill', obj: grill, hit: { w: 1.4, h: 1.5, d: 0.9, y: 0.75 },
      lines: ['*sizzle* It\'s green. He says that\'s the marinade.', 'Tonight\'s special: "arm". No further questions.', 'Health inspection status: there are no health inspectors left.'],
      onClick: () => { gf.userData.boost = 2; ZL.sfx.whoosh(); } });

    // ---------------------------------------------------------------- spike pit
    const R = ZL.RUN, pit = group(R.cx, 0, R.cz);
    pit.add(box(5.2, 0.08, 3.2, '#120e0b', 0, 0.06, 0), box(5.6, 0.3, 0.3, '#5a4128', 0, 0.15, 1.7), box(5.6, 0.3, 0.3, '#5a4128', 0, 0.15, -1.7), box(0.3, 0.3, 3.4, '#5a4128', 2.7, 0.15, 0), box(0.3, 0.3, 3.4, '#5a4128', -2.7, 0.15, 0));
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { const s = cone(0.14, rand(0.7, 1.1), '#c9b78f', -2 + i * 0.8 + rand(-0.1, 0.1), 0.45, -0.9 + j * 0.9, 5); s.rotation.z = rand(-0.2, 0.2); pit.add(s); }
    const hand = box(0.16, 0.7, 0.16, '#8fae7e', 1.3, 0.4, 0.3); hand.rotation.z = 0.3; hand.userData.keep = true; pit.add(hand, box(0.2, 0.16, 0.2, '#8fae7e', 1.2, 0.8, 0.3));
    scene.add(pit);
    ZL.tickers.push((t) => { hand.rotation.z = 0.3 + Math.sin(t * 3) * 0.25; });
    ZL.addItem({ id: 'pit', title: 'Spike Pit', obj: pit, hit: { w: 5.2, h: 1, d: 3.2, y: 0.5 },
      lines: ['Trap #7. ESTJ uses it as a running track. INTJ is furious.', 'Occupancy: 4 zombies and one very confused raccoon.', '"Help," says the pit. Probably nothing.'],
      onClick: () => { ZL.boom(R.cx + rand(-3, 3), R.cz + pick([-4, 4]), 4); } });

    // ---------------------------------------------------------------- clutter: trees, rocks, dishes, a wreck
    const blocked = (x, z) => {
      const near = (cx, cz, r) => Math.hypot(x - cx, z - cz) < r;
      return near(0, 0, 19.5) || near(25, -19, 10.5) || near(-24, 17, 9) || near(jp.cx, jp.cz, 11.5) || near(R.cx, R.cz, 8) || near(25, 3, 6) || near(20, 13, 4)
        || (z > 14 && z < 36 && x > -22 && x < 27) || near(-14.6, 24, 3);
    };
    const treeLines = ['It\'s a tree. It has not picked a side.', 'Rustle rustle. (That\'s just an ISFP sketching in here.)', 'This tree has survived longer than most of the camp\'s plans.',
      'Carved in the bark: "ENTP was here. Debate me."', 'A perfectly good hiding spot, per INFP.'];
    let placed = 0, tries = 0;
    while (placed < 62 && tries++ < 900) {
      const a = rand(0, 6.283), d = rand(20, 66), x = Math.sin(a) * d, z = Math.cos(a) * d;
      if (blocked(x, z)) continue;
      const s = rand(0.8, 1.5), dead = Math.random() < 0.18, g = group(x, 0, z);
      g.add(cyl(0.16, 0.24, 1.4, '#3b2a1a', 0, 0.7, 0, 6));
      if (dead) { const b1 = box(0.1, 1.2, 0.1, '#3b2a1a', 0.3, 1.7, 0); b1.rotation.z = -0.6; const b2 = box(0.1, 1, 0.1, '#3b2a1a', -0.25, 1.9, 0); b2.rotation.z = 0.7; g.add(b1, b2, box(0.12, 1.4, 0.12, '#3b2a1a', 0, 2, 0)); }
      else { const c = pick(['#1f4a36', '#245a3c', '#1b3f33']); g.add(cone(1.2, 1.8, c, 0, 1.9, 0, 7), cone(0.95, 1.6, c, 0, 2.9, 0, 7), cone(0.6, 1.3, c, 0, 3.8, 0, 7)); }
      g.scale.setScalar(s); g.rotation.y = rand(0, 3); scene.add(g);
      ZL.addItem({ id: 'tree' + placed, title: dead ? 'Dead Tree' : 'Tree', obj: g, hit: { w: 1.7, h: 4.2, d: 1.7, y: 2.1 }, lines: [dead ? 'Dead tree. Honestly? Relatable.' : treeLines[placed % treeLines.length]] });
      placed++;
    }
    for (let i = 0; i < 26; i++) { const a = rand(0, 6.283), d = rand(19, 60), x = Math.sin(a) * d, z = Math.cos(a) * d; if (!blocked(x, z) || (z > 26 && z < 36)) scene.add(rock(rand(0.3, 0.9), '#6f7480', x, 0.2, z)); }
    const perch = rock(1.15, '#7a7f8a', -14.6, 0.1, 24); perch.rotation.set(0, 0.4, 0); perch.scale.set(1.3, 0.75, 1.2); scene.add(perch);

    [[-8, -31, 0.3], [5, -35, -0.2], [17, -33, 0.5]].forEach((p, i) => {
      const g = group(p[0], 0, p[1]); g.rotation.y = p[2];
      const d = cone(1.5, 0.7, '#cfd3de', 0, 3.3, 0.2, 16); d.rotation.x = Math.PI + 0.9;
      g.add(cyl(0.12, 0.2, 3, '#70757f', 0, 1.5, 0, 6), d, cyl(0.03, 0.03, 1, '#444', 0, 3.6, 0.6, 4)); scene.add(g);
      ZL.addItem({ id: 'dish' + i, title: 'Satellite Dish', obj: g, hit: { w: 3, h: 4.2, d: 3, y: 2.1 },
        lines: [['No signal since day one. Still shows 3 unread emails.', 'Picks up exactly one channel: a looping infomercial for knives.', 'INTJ uses this to download more bunker blueprints.'][i]] });
    });

    const car = group(-13, 0, 31); car.rotation.set(0, 0.7, 0.06);
    car.add(box(1.9, 0.6, 4, '#4a4d55', 0, 0.65, 0), box(1.7, 0.6, 2, '#3a3d45', 0, 1.25, -0.2), box(1.5, 0.4, 0.05, '#222', 0, 1.25, 0.82));
    [[-0.95, 1.3], [0.95, 1.3], [-0.95, -1.3], [0.95, -1.3]].forEach((p) => { const w = cyl(0.4, 0.4, 0.3, '#17171a', p[0], 0.4, p[1], 10); w.rotation.z = Math.PI / 2; car.add(w); });
    scene.add(car);
    ZL.addItem({ id: 'car', title: 'Abandoned Car', obj: car, hit: { w: 2, h: 1.6, d: 4, y: 0.8 },
      lines: ['Out of gas. And out of driver.', 'Bumper sticker: "MY OTHER CAR IS ALSO ON FIRE".', 'The radio still works. It only plays the ESFP\'s party playlist.'] });
    void wheels;
  };
})(window.ZL);
