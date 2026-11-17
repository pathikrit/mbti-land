// outside.js: the two set pieces outside the fence: the INTJ bunker and the INTP lab.
(function (ZL) {
  'use strict';

  // A few unnamed-but-chatty zombies that belong to these set pieces.
  ZL.CAST.push(
    { id: 'z_lurker', title: 'Lab Visitor', zombie: true, pos: [-17.2, 18.6], face: -1.4, anim: 'zidle',
      shirt: '#6a5a8a', hairStyle: 'bald',
      lines: ['Hello? Is this the brain store?', 'The door was open. I assumed it was a walk-in clinic.', 'I\'m just here for the free coffee.', 'Knock knock. ...She\'s not listening, is she.'] },
    { id: 'z_pat1', title: 'Patient', zombie: true, pos: [13.15, 19.65], face: -1.8, anim: 'zidle', shirt: '#7a6a5a',
      lines: ['It\'s just a flesh wound. All of it.', 'Will I ever play the piano again? ...I couldn\'t before.', 'Do you validate parking?'] },
    { id: 'z_pat2', title: 'Tattoo Client', zombie: true, pos: [16.15, 21.05], face: -1.75, anim: 'zidle', shirt: '#4a4a5a', sleeves: 'none',
      lines: ['I asked for a dragon. It says "MOM". I\'ll take it.', 'Ow. Wait, no. I can\'t feel anything. Carry on.', 'Is the ink vegan?'] });

  ZL.buildBunker = function (scene) {
    const T = ZL.THREE, { box, cyl, cone, sph, group, sign } = ZL;
    const C = '#8b8e96', D = '#6f727a';
    const B = group(25, 0, -19); B.rotation.y = 0.3; scene.add(B);
    ZL.anchors.bunker = B;

    // grassy mound hugging the back and sides
    [[-5.5, -0.9, 2.3, 1.9, 3.6], [5.5, -0.9, 2.3, 1.9, 3.6], [0, -5.1, 5.8, 2.3, 2.3]].forEach((m) => {
      const s = sph(1, '#3a5a3f', m[0], 0, m[1]); s.scale.set(m[2], m[3], m[4]); B.add(s);
    });
    B.add(box(6, 0.1, 5, '#4a4d55', 0, 0.05, 0), box(6, 3.2, 0.3, C, 0, 1.6, -2.35), box(0.3, 3.2, 5, C, -2.85, 1.6, 0), box(0.3, 3.2, 5, C, 2.85, 1.6, 0));

    // front wall + blast door: sinks into the ground when the bunker opens
    const front = group();
    front.add(box(2, 3.2, 0.3, C, -2, 1.6, 2.35), box(2, 3.2, 0.3, C, 2, 1.6, 2.35), box(2, 0.8, 0.3, C, 0, 2.8, 2.35),
      box(2, 2.4, 0.2, '#5b616c', 0, 1.2, 2.4), box(2, 0.16, 0.22, '#f2c230', 0, 2.2, 2.41), box(2, 0.16, 0.22, '#f2c230', 0, 0.3, 2.41),
      cyl(0.28, 0.28, 0.08, '#3a3f48', 0, 1.25, 2.52, 10), box(0.2, 0.3, 0.06, '#111', 1.25, 1.4, 2.52), box(0.1, 0.06, 0.07, '#4dff7a', 1.25, 1.47, 2.53, { basic: true }),
      box(0.3, 0.2, 0.4, '#ddd', -2.6, 3.0, 2.7), box(0.3, 0.2, 0.4, '#ddd', 2.6, 3.0, 2.7), sph(0.05, '#f33', -2.6, 3.0, 2.92, { basic: true }), sph(0.05, '#f33', 2.6, 3.0, 2.92, { basic: true }));
    front.children[6].rotation.x = Math.PI / 2;
    const name = sign(['INTJ BUNKER', 'MAX CAPACITY: 1'], 3.1, 0.82, { bg: '#d8d4c4', border: '#14121c', fg: '#14121c', w: 512, h: 136, size: 54, bw: 8 });
    name.position.set(0, 2.82, 2.52); front.add(name);
    B.add(front);

    // roof: hinged at the back, flips up like a lid
    const lid = group(0, 3.2, -2.5);
    lid.add(box(6.5, 0.36, 5.5, D, 0, 0.18, 2.6), box(0.9, 0.5, 0.9, '#5b616c', -2, 0.6, 1.4), cyl(0.07, 0.07, 1.2, '#888', 1.9, 0.9, 1.2, 6));
    const dish = cone(0.75, 0.4, '#d8dce6', 1.9, 1.6, 1.2, 14); dish.rotation.x = Math.PI + 0.7; lid.add(dish);
    B.add(lid);

    // interior
    const inside = group(0, 0.1, 0); B.add(inside); ZL.anchors.bunkerIn = inside;
    inside.add(box(4.6, 0.1, 0.9, '#3a3f48', 0, 0.95, -1.75), box(0.1, 0.95, 0.8, '#2a2d34', -2.1, 0.47, -1.75), box(0.1, 0.95, 0.8, '#2a2d34', 2.1, 0.47, -1.75));
    [-1.5, 0, 1.5].forEach((x, i) => inside.add(box(1.2, 0.8, 0.08, '#15171c', x, 1.75, -2.1), box(1.08, 0.68, 0.02, ['#37e0ff', '#6bff9a', '#37e0ff'][i], x, 1.75, -2.05, { basic: true })));
    for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) inside.add(cyl(0.12, 0.12, 0.28, ['#c8323a', '#e8ac2c', '#3fb27f'][r], -2.45, 0.5 + r * 0.7, -0.6 + i * 0.36, 8));
    inside.add(box(0.5, 0.06, 2.2, '#2a2d34', -2.45, 0.32, 0.1), box(0.5, 0.06, 2.2, '#2a2d34', -2.45, 1.02, 0.1), box(0.5, 0.06, 2.2, '#2a2d34', -2.45, 1.72, 0.1),
      box(0.9, 0.5, 2, '#39405a', 2.2, 0.3, 0.6), box(0.9, 0.16, 0.5, '#e8e2d0', 2.2, 0.62, -0.1), // cot
      box(0.5, 0.7, 0.5, '#222', 1.2, 1.35, -1.8), sph(0.05, '#f33', 1.2, 1.5, -1.52, { basic: true })); // coffee machine
    const glow = new T.PointLight('#5ae0ff', 0, 14, 1.4); glow.position.set(0, 2.2, -0.5); inside.add(glow);

    // floodlights
    [-4.2, 4.2].forEach((x) => B.add(box(0.14, 4.4, 0.14, '#444', x, 2.2, 3.4), box(0.7, 0.4, 0.3, '#333', x, 4.5, 3.5), box(0.6, 0.3, 0.05, '#fff7c2', x, 4.5, 3.67, { basic: true })));
    const fl = new T.PointLight('#fff1c8', 34, 26, 1.6); fl.position.set(0, 4.6, 5.5); B.add(fl);
    B.add(box(1.6, 0.06, 1, '#8a6a44', 0, 0.06, 3.4)); // doormat
    const mat = sign('GO AWAY', 1.4, 0.8, { fg: '#14121c', size: 70, w: 256, h: 146, lit: true }); mat.rotation.x = -Math.PI / 2; mat.position.set(0, 0.1, 3.4); B.add(mat);

    const st = { open: 0, k: 0 };
    ZL.bunker = st;
    const toggle = () => {
      st.open = st.open ? 0 : 1;
      ZL.sfx.rumble();
      const intj = ZL.byId.intj_bunker, enfp = ZL.byId.enfp;
      if (st.open) {
        ZL.toast('BUNKER BREACHED (by you)');
        setTimeout(() => ZL.speak(intj, 0), 900);
        setTimeout(() => ZL.say(enfp, ZL.pick(['IT OPENED! Hi!! I brought a kitten!', 'Roomie!! I call top bunk!', 'I KNEW you were home!'])), 2300);
      } else {
        ZL.say(intj, ZL.pick(['Max capacity: 1.', 'This conversation is over.', 'Initiating solitude.']));
        setTimeout(() => ZL.say(enfp, ZL.pick(['...rude.', 'I\'ll just wait here then! Forever!', 'The kitten is VERY disappointed.'])), 1500);
      }
      return false;
    };
    const closedHit = ZL.addItem({ id: 'bunker', title: 'INTJ Bunker (click to open)', obj: B, hit: { w: 6.6, h: 3.7, d: 5.6, y: 1.85 }, lines: [], onClick: toggle });
    const openHit = ZL.addItem({ id: 'bunkerLid', title: 'Bunker lid (click to close)', obj: lid, hit: { w: 6.5, h: 0.6, d: 5.5, y: 0.2, z: 2.6 }, lines: [], onClick: toggle });
    openHit.off = true;
    ZL.addItem({ id: 'doormat', title: 'Doormat', obj: B, hit: { w: 1.6, h: 0.3, d: 1, y: 0.15, z: 3.4 }, lines: ['It says "GO AWAY". It means it.', 'ENFP thinks it says "GO AWAY... from sadness!"'] });

    ZL.tickers.push((t, dt) => {
      st.k += (st.open - st.k) * Math.min(1, dt * 3.2);
      const k = st.k, e = k * k * (3 - 2 * k);
      front.position.y = -3.45 * e;
      lid.rotation.x = -1.25 * e + (st.open && k < 0.98 ? Math.sin(t * 50) * 0.01 : 0);
      glow.intensity = 16 * e;
      closedHit.off = k > 0.5; openHit.off = k <= 0.5;
      const intj = ZL.byId.intj_bunker;
      if (intj) { intj.hidden = k < 0.5; if (intj.tag) intj.tag.visible = ZL.showTags && k > 0.5; }
    });
  };

  ZL.buildLab = function (scene) {
    const T = ZL.THREE, { box, cyl, sph, group, sign } = ZL;
    const W = '#56607a', L = group(-24, 0, 17); scene.add(L);
    const inner = group(0, 0.12, 0); L.add(inner); ZL.anchors.lab = inner;
    L.add(box(10, 0.12, 7, '#3a3f52', 0, 0.06, 0), box(10, 3, 0.25, W, 0, 1.5, -3.5), box(0.25, 3, 7, W, -5, 1.5, 0), box(10, 0.9, 0.25, W, 0, 0.45, 3.5),
      box(0.25, 0.9, 4.7, W, 5, 0.45, -1.15), box(0.25, 2.5, 0.25, W, 5, 1.25, 1.1), box(0.25, 2.5, 0.25, W, 5, 1.25, 3.4), box(0.25, 0.25, 2.55, W, 5, 2.5, 2.25));
    // neon + screens on the back wall
    L.add(box(4, 0.12, 0.06, '#ff4fd8', -2.3, 2.7, -3.35, { basic: true }), box(3, 0.12, 0.06, '#37e0ff', 2.6, 2.45, -3.35, { basic: true }), box(0.12, 1.6, 0.06, '#37e0ff', 4.3, 1.7, -3.35, { basic: true }));
    [[-3.2, '#37e0ff'], [-1.6, '#6bff9a'], [0.2, '#ff9a4f']].forEach(([x, c]) => L.add(box(1.3, 0.9, 0.1, '#15171c', x, 1.75, -3.3), box(1.15, 0.75, 0.02, c, x, 1.75, -3.24, { basic: true })));
    const cure = sign(['CURE: 99%', 'door: ???'], 1.5, 0.8, { bg: '#0d1020', fg: '#6bff9a', w: 300, h: 160, size: 56 }); cure.position.set(2.4, 1.6, -3.36); L.add(cure);
    // server rack with blinking LEDs
    L.add(box(0.8, 2.4, 1.4, '#22252e', -4.4, 1.2, -2.3));
    const leds = []; for (let i = 0; i < 8; i++) { const l = box(0.04, 0.06, 0.1, '#6bff9a', -3.99, 0.5 + i * 0.25, -2.6 + (i % 3) * 0.3, { basic: true }); leds.push(l); L.add(l); }
    // the desk of a thousand mugs
    L.add(box(5.4, 0.1, 1.4, '#b8bec8', 0, 1.05, 1.5), box(0.1, 1, 1.3, '#70757f', -2.6, 0.55, 1.5), box(0.1, 1, 1.3, '#70757f', 2.6, 0.55, 1.5));
    L.add(box(0.3, 0.5, 0.3, '#e8eaf0', 0.5, 1.35, 1.4), box(0.12, 0.3, 0.3, '#e8eaf0', 0.5, 1.7, 1.5), box(0.4, 0.06, 0.4, '#333', 0.5, 1.13, 1.45)); // microscope
    [['#6bff9a', -1.9], ['#ff4fd8', -1.5], ['#37e0ff', 1.5], ['#ffe14f', 1.95]].forEach(([c, x]) => L.add(cyl(0.07, 0.14, 0.34, c, x, 1.27, 1.25, 8, { basic: true })));
    for (let i = 0; i < 9; i++) L.add(cyl(0.085, 0.07, 0.16, i % 3 ? '#f4f1e6' : '#e8c8a0', -2.3 + i * 0.56 + (i % 2) * 0.1, 1.18, 1.75 + (i % 3) * 0.14, 8));
    L.add(box(0.7, 0.04, 0.5, '#2a2d34', -0.7, 1.12, 1.3), box(0.7, 0.45, 0.04, '#2a2d34', -0.7, 1.34, 1.02), box(0.62, 0.38, 0.02, '#9ad8ff', -0.7, 1.34, 1.05, { basic: true }));
    const pl = new T.PointLight('#b070ff', 20, 16, 1.5); pl.position.set(0, 2.7, 0.3); L.add(pl);

    // the door: perpetually ajar
    const door = group(5, 0, 1.2); door.add(box(0.12, 2.25, 2.1, '#8a909b', 0, 1.13, 1.05), box(0.14, 0.4, 0.5, '#f2c230', 0.02, 1.5, 1.05), sph(0.07, '#333', 0.1, 1.1, 1.85));
    L.add(door);
    const st = { open: 1, k: 1 };
    ZL.tickers.push((t, dt) => {
      st.k += (st.open - st.k) * Math.min(1, dt * (st.open ? 1.2 : 9));
      door.rotation.y = 1.05 * st.k + Math.sin(t * 1.3) * 0.04 * st.k;
      leds.forEach((l, i) => { l.visible = Math.sin(t * (3 + i) + i * 1.7) > -0.2; });
    });
    ZL.addItem({ id: 'labdoor', title: 'Lab Door', obj: door, hit: { w: 0.9, h: 2.3, d: 2.1, y: 1.15, z: 1.05 },
      lines: ['*SLAM* ...*creeeak*. It never stays shut.', 'There\'s a sticky note: "CLOSE ME". It is on the inside.', 'INTP will fix the latch right after curing the apocalypse.'],
      onClick: () => {
        if (!st.open) return;
        st.open = 0; ZL.sfx.slam();
        setTimeout(() => ZL.say(ZL.byId.intp_lab, ZL.pick(['...was that the door? Probably fine.', 'Huh. Draft.', 'Did someone say something? No? Good.'])), 700);
        setTimeout(() => { st.open = 1; ZL.sfx.creak(); }, 2600);
        setTimeout(() => ZL.speak(ZL.byId.z_lurker), 3600);
      } });
    ZL.addItem({ id: 'mugs', title: 'The Mugs', obj: L, hit: { w: 5.4, h: 0.5, d: 0.7, y: 1.3, z: 1.85 },
      lines: ['Nine mugs. Eight are cold. One is a beaker. She can\'t remember which.', 'Mug #4 has developed its own ecosystem. It is now a co-author.', 'Coffee: the only cure INTP has actually finished.'] });
  };
})(window.ZL);
