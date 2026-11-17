// camp.js: the ground and everything inside the fence.
(function (ZL) {
  'use strict';
  const R = 15; // fence radius
  ZL.CAMP_R = R;

  ZL.buildCamp = function (scene) {
    const T = ZL.THREE, { box, cyl, cone, sph, group, rock, rand, sign } = ZL;
    const flat = (geo, color, x, y, z) => {
      const m = new T.Mesh(geo, ZL.mat(color)); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; m.userData.keep = true; scene.add(m); return m;
    };

    // ---------------------------------------------------------------- ground
    flat(new T.PlaneGeometry(600, 600), '#33503a', 0, 0, 0);
    for (let i = 0; i < 46; i++) {
      const a = rand(0, 6.28), d = rand(18, 70);
      flat(new T.CircleGeometry(rand(2, 6), 10), i % 2 ? '#2c4633' : '#3a5a3f', Math.sin(a) * d, 0.01 + i * 0.0004, Math.cos(a) * d);
    }
    flat(new T.CircleGeometry(R + 0.5, 56), '#7a5e3e', 0, 0.04, 0);
    flat(new T.CircleGeometry(R - 4, 40), '#866848', 0, 0.045, 0);
    const mud = flat(new T.CircleGeometry(12, 32), '#4b4032', 3, 0.035, 25); mud.scale.set(2.1, 1, 1);
    flat(new T.PlaneGeometry(5, 5), '#6b5238', 0, 0.05, 16.5);

    // ---------------------------------------------------------------- fence & gate
    const N = 66, posts = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2, gap = Math.abs(a) < 0.18 || Math.abs(a - Math.PI * 2) < 0.18;
      const p = { x: Math.sin(a) * R, z: Math.cos(a) * R, gap };
      posts.push(p);
      if (gap) continue;
      const h = rand(1.7, 2.15);
      const post = box(0.26, h, 0.26, i % 3 ? '#5a4128' : '#4a3520', p.x, h / 2, p.z); post.rotation.y = -a + rand(-0.2, 0.2);
      scene.add(post, cone(0.2, 0.36, '#4a3520', p.x, h + 0.16, p.z, 4));
    }
    posts.forEach((p, i) => {
      const q = posts[(i + 1) % N];
      if (p.gap || q.gap) return;
      const dx = q.x - p.x, dz = q.z - p.z, L = Math.hypot(dx, dz), ry = Math.atan2(-dz, dx);
      [[0.55, '#5a4128', 0.14], [1.2, '#5a4128', 0.14], [1.75, '#9aa0aa', 0.035]].forEach(([y, c, th]) => {
        const r = box(L, th, 0.07, c, (p.x + q.x) / 2, y, (p.z + q.z) / 2); r.rotation.y = ry; scene.add(r);
      });
      if (i % 2) { const b = sph(0.09, '#b8bec8', (p.x + q.x) / 2, 1.78, (p.z + q.z) / 2); b.scale.set(0.16, 0.16, 0.05); scene.add(b); }
    });
    const gateHalf = (side) => {
      const g = group(side * 2.75, 0, R + 0.1);
      const w = 2.6;
      g.add(box(0.14, 2.3, 0.14, '#5b616c', 0, 1.15, 0), box(w, 0.1, 0.08, '#5b616c', -side * w / 2, 2.1, 0), box(w, 0.1, 0.08, '#5b616c', -side * w / 2, 0.25, 0),
        box(w, 0.08, 0.06, '#5b616c', -side * w / 2, 1.15, 0));
      for (let k = 1; k <= 7; k++) g.add(box(0.05, 1.9, 0.05, '#8a909b', -side * (k * w / 7.4), 1.17, 0));
      scene.add(g); return g;
    };
    const gL = gateHalf(-1), gR = gateHalf(1);
    ZL.gate = { shake: 0 };
    ZL.tickers.push((t, dt) => {
      const s = ZL.gate.shake; ZL.gate.shake = Math.max(0, s - dt * 0.5);
      gL.rotation.y = -Math.abs(Math.sin(t * 31)) * 0.16 * s; gR.rotation.y = Math.abs(Math.sin(t * 27 + 1)) * 0.16 * s;
    });
    const gateHit = group(0, 0, R + 0.1); scene.add(gateHit);
    ZL.addItem({ id: 'gate', title: 'The Gate', obj: gateHit, hit: { w: 5.2, h: 2.3, d: 0.6, y: 1.15 },
      lines: ['*rattle rattle* The gate holds. For now.', 'Installed by ISTP. Guaranteed for "a while".', 'Sign reads: NO SOLICITORS. NO ZOMBIES. NO SMALL TALK.'],
      onClick: () => { ZL.gate.shake = 1; ZL.sfx.rattle(); } });
    [-3.1, 3.1].forEach((x) => {
      scene.add(box(0.3, 2.9, 0.3, '#4a3520', x, 1.45, R + 0.1));
      const f = ZL.fire(0.55, 0); f.position.set(x, 2.9, R + 0.1); scene.add(f);
    });
    const gl = new T.PointLight('#ff9a3c', 26, 20, 1.6); gl.position.set(0, 3.2, R + 2); scene.add(gl);

    // ---------------------------------------------------------------- command deck (ENTJ x2)
    const deck = group(0, 0, -9.5,
      box(5.4, 0.4, 2.6, '#6b4a2a', 0, 0.2, 0), box(5.4, 0.06, 2.6, '#7d5936', 0, 0.42, 0),
      box(0.12, 2.6, 0.12, '#3b2a1a', -1.2, 1.7, -1.15), box(0.12, 2.6, 0.12, '#3b2a1a', 1.2, 1.7, -1.15),
      box(2.9, 1.7, 0.1, '#f6f2e2', 0, 2.1, -1.15));
    const chart = sign([], 2.7, 1.5, { w: 512, h: 288, draw: (g, W, H) => {
      g.fillStyle = '#14121c'; g.font = '44px Bangers, Impact, sans-serif'; g.textAlign = 'center';
      g.fillText('THE PLAN', W / 2, 46);
      g.lineWidth = 5; g.strokeStyle = '#14121c';
      const bx = (x, y, t, c) => { g.fillStyle = c; g.fillRect(x - 58, y - 20, 116, 40); g.strokeRect(x - 58, y - 20, 116, 40); g.fillStyle = '#fff'; g.font = '26px Bangers, Impact, sans-serif'; g.fillText(t, x, y + 9); };
      g.beginPath(); g.moveTo(W / 2, 110); g.lineTo(W / 2, 150); g.moveTo(96, 150); g.lineTo(W - 96, 150);
      [96, W / 2, W - 96].forEach((x) => { g.moveTo(x, 150); g.lineTo(x, 190); }); g.stroke();
      bx(W / 2, 92, 'ME (ENTJ)', '#9a6fd0'); bx(96, 208, 'BAIT: ESTP', '#e8ac2c'); bx(W / 2, 208, 'GUNS: ISTP', '#e8ac2c'); bx(W - 96, 208, 'SOUP: ESFJ', '#3e97d8');
      g.fillStyle = '#d6293a'; g.font = '24px "Comic Neue", "Comic Sans MS", sans-serif'; g.fillText('feelings: see appendix Z (does not exist)', W / 2, 268);
    } });
    chart.position.set(0, 2.1, -1.09); deck.add(chart); scene.add(deck);
    ZL.addItem({ id: 'chart', title: 'The Plan', obj: deck, hit: { w: 2.9, h: 1.7, d: 0.3, y: 2.1, z: -1.1 },
      lines: ['THE PLAN, v37. Changes from v36: more arrows.', 'Org chart. Everyone reports to ENTJ. ENTJ reports to ENTJ.', 'Step 1: perimeter. Step 2: feelings (deferred indefinitely).'] });

    // ---------------------------------------------------------------- tents
    [[-5.8, -11.2, 0.3, '#6f7446'], [5, -11.8, -0.25, '#7a7a4a'], [10.6, -4.8, -1.1, '#6f7446'], [5.4, 9.8, 0.5, '#80784a'], [-11.5, -1.2, 1.2, '#7a7a4a']].forEach((p, i) => {
      const t = ZL.tent(1.5, 1.9, 3, p[3]); t.position.set(p[0], 0, p[1]); t.rotation.y = p[2]; scene.add(t);
      ZL.addItem({ id: 'tent' + i, title: 'Tent', obj: t, hit: { w: 3, h: 1.9, d: 3, y: 0.95 },
        lines: [['Occupied! By my feelings!', '"Zzz." (An ISTP is napping in here. Do not disturb. Seriously.)', 'Smells like soup and unresolved conflict.',
          'Tent rules, per ESTJ: no shoes, no zombies, no jazz.', 'Empty. Everyone is at the mandatory fun.'][i]] });
    });

    // ---------------------------------------------------------------- kitchen (ESFJ)
    const kit = group(-7.4, 0, -4.4);
    const kfire = ZL.fire(0.6, 16); kfire.position.y = 0.05;
    const steam = [0, 1, 2].map((i) => sph(0.2, '#ffffff', 0, 1.4, 0, { opacity: 0.35 }));
    kit.add(kfire, cyl(0.75, 0.62, 0.75, '#70757f', 0, 0.85, 0, 14), cyl(0.68, 0.68, 0.04, '#d9822b', 0, 1.22, 0, 14),
      box(0.08, 0.5, 0.08, '#333', 0.6, 0.25, 0.6), box(0.08, 0.5, 0.08, '#333', -0.6, 0.25, 0.6), box(0.08, 0.5, 0.08, '#333', 0.6, 0.25, -0.6), box(0.08, 0.5, 0.08, '#333', -0.6, 0.25, -0.6), ...steam);
    kit.add(box(2.2, 0.1, 1, '#8a6a44', -2.3, 0.85, 0.6), box(0.1, 0.85, 0.1, '#5a4128', -3.3, 0.42, 0.2), box(0.1, 0.85, 0.1, '#5a4128', -1.3, 0.42, 1));
    for (let i = 0; i < 4; i++) kit.add(cyl(0.16, 0.1, 0.12, ['#e8e2d0', '#c8d8e8', '#e8c8c8', '#d8e8c8'][i], -3 + i * 0.45, 0.96, 0.6 + (i % 2) * 0.2, 8));
    scene.add(kit);
    kit.userData.puff = 0;
    ZL.tickers.push((t, dt) => {
      kit.userData.puff = Math.max(0, kit.userData.puff - dt * 0.5);
      steam.forEach((s, i) => {
        const k = ((t * 0.4 + i / 3) % 1);
        s.position.set(Math.sin(t + i * 2) * 0.25, 1.3 + k * (1.6 + kit.userData.puff * 3), Math.cos(t * 0.7 + i) * 0.2);
        s.scale.setScalar((0.16 + k * 0.3) * (1 + kit.userData.puff * 1.5));
        s.material.opacity = 0.4 * (1 - k);
      });
    });
    ZL.addItem({ id: 'soup', title: 'The Soup', obj: kit, hit: { w: 1.7, h: 1.4, d: 1.7, y: 0.7 },
      lines: ['*blub blub* Today\'s soup: "Tuesday". Ingredients: classified.', 'Second helpings are mandatory. ESFJ is watching.', 'There is a label on the pot. It says "POT". Thanks, ISTJ.'],
      onClick: () => { kit.userData.puff = 1; kfire.userData.boost = 1; ZL.sfx.blub(); } });

    // ---------------------------------------------------------------- campfire & the family log
    const camp = group(0, 0, 4.4);
    const cf = ZL.fire(1.15, 46); camp.add(cf);
    for (let i = 0; i < 9; i++) camp.add(rock(0.24, '#7a7a82', Math.sin(i * 0.7) * 0.85, 0.12, Math.cos(i * 0.7) * 0.85));
    const lg1 = box(1.3, 0.16, 0.16, '#3b2a1a', 0, 0.14, 0); lg1.rotation.y = 0.6; const lg2 = box(1.3, 0.16, 0.16, '#3b2a1a', 0, 0.2, 0); lg2.rotation.y = -0.7;
    camp.add(lg1, lg2); scene.add(camp);
    ZL.addItem({ id: 'campfire', title: 'Campfire', obj: camp, hit: { w: 1.8, h: 1.6, d: 1.8, y: 0.8 },
      lines: ['*crackle* Fuelled by pine logs and ENTP\'s rejected ideas.', 'Tonight\'s fireside topic, chosen by ENFJ: "our feelings".', 'S\'mores inventory: 0. ISTJ has filed a report.'],
      onClick: () => { cf.userData.boost = 1.6; ZL.sfx.whoosh(); } });
    const log = cyl(0.36, 0.36, 4.6, '#5a3d24', 0, 0.36, 1.2, 10); log.rotation.z = Math.PI / 2; scene.add(log);

    // ---------------------------------------------------------------- med bay (INFP + ISFJ)
    const med = group(-9.6, 0, 5.2);
    med.add(box(2.4, 0.16, 1.15, '#b8bec8', 0, 0.5, 0), box(2.3, 0.2, 1.1, '#f4f4f8', 0, 0.66, 0), box(0.5, 0.14, 0.8, '#fff', 0.85, 0.82, 0),
      box(1.25, 0.34, 1.12, '#7fc8c0', -0.5, 0.9, 0), box(1.25, 0.06, 1.14, '#f4f4f8', -0.5, 1.08, 0), box(0.08, 0.9, 1.15, '#b8bec8', 1.2, 0.75, 0), box(0.08, 0.7, 1.15, '#b8bec8', -1.2, 0.6, 0));
    [[-1.1, -0.5], [1.1, -0.5], [-1.1, 0.5], [1.1, 0.5]].forEach((p) => med.add(box(0.08, 0.45, 0.08, '#888', p[0], 0.22, p[1])));
    med.add(box(0.06, 2.2, 0.06, '#aaa', 1.55, 1.1, -0.5), box(0.24, 0.34, 0.1, '#bfe6ff', 1.55, 2.0, -0.4, { opacity: 0.8 }), box(0.5, 0.05, 0.5, '#888', 1.55, 0.03, -0.5));
    med.add(box(1.1, 1.3, 0.7, '#e8eaf0', -2.6, 0.65, 0.4), box(0.5, 0.14, 0.02, '#d6293a', -2.6, 0.9, 0.76), box(0.14, 0.5, 0.02, '#d6293a', -2.6, 0.9, 0.76));
    scene.add(med);
    const mt = ZL.tent(1.9, 2.3, 3.6, '#e9e6da'); mt.position.set(-11.2, 0, 2.3); mt.rotation.y = 0.9; scene.add(mt);
    const ml = new T.PointLight('#cfe6ff', 10, 12, 1.6); ml.position.set(-9.6, 2.6, 5.4); scene.add(ml);
    ZL.addItem({ id: 'medkit', title: 'First Aid', obj: med, hit: { w: 1.1, h: 1.3, d: 0.8, x: -2.6, y: 0.65, z: 0.4 },
      lines: ['Contents: 400 bandaids, 1 thermometer, 37 handwritten get-well cards.', 'Prescription for INFP: "one (1) hug, as needed".'] });

    // ---------------------------------------------------------------- supply depot (ISTJ x2)
    const dep = group(-6, 0, 8.3);
    dep.add(box(3.4, 0.08, 0.7, '#6b4a2a', 0, 0.1, 0), box(3.4, 0.08, 0.7, '#6b4a2a', 0, 0.85, 0), box(3.4, 0.08, 0.7, '#6b4a2a', 0, 1.6, 0), box(3.4, 0.08, 0.7, '#6b4a2a', 0, 2.3, 0),
      box(0.1, 2.3, 0.7, '#4a3520', -1.7, 1.15, 0), box(0.1, 2.3, 0.7, '#4a3520', 1.7, 1.15, 0), box(3.4, 2.3, 0.06, '#4a3520', 0, 1.15, -0.35));
    const cans = ['#c8323a', '#e8ac2c', '#3e97d8', '#3fb27f', '#f4f1e6', '#9a6fd0'];
    for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) dep.add(cyl(0.13, 0.13, 0.3, cans[(i + r * 2) % 6], -1.4 + i * 0.35, 0.3 + r * 0.75, 0.05, 8));
    [['BEANS', 2.4, 0.35, 0.9, '#8a6a44'], ['LABELS', 2.5, 1.2, 0.8, '#7a5a38'], ['MISC ?!', 3.5, 0.3, 0.7, '#8a6a44'], ['MORE BEANS', -2.5, 0.35, 0.8, '#7a5a38']].forEach(([t, x, y, s, c]) => {
      dep.add(box(s, s * 0.8, s, c, x, y, 0.2));
      const lb = sign(t, s * 0.85, s * 0.34, { bg: '#f6f2e2', fg: '#14121c', lit: true, size: 60, w: 256, h: 100 }); lb.position.set(x, y, 0.2 + s / 2 + 0.01); dep.add(lb);
    });
    scene.add(dep);
    ZL.addItem({ id: 'supplies', title: 'Supply Depot', obj: dep, hit: { w: 3.4, h: 2.3, d: 0.8, y: 1.15 },
      lines: ['This shelf is labelled "SHELF".', 'Inventory: 412 cans of beans. 0 can openers. ISTJ is "aware".', 'The label maker has its own label. It says "LABEL MAKER (DO NOT RELABEL)".',
        'Sorted alphabetically, then by expiry date, then by how much ISTJ trusts you.'] });

    // ---------------------------------------------------------------- watchtower (INTJ + drone remote)
    const tw = group(8.5, 0, -8.5);
    [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]].forEach((p) => tw.add(box(0.2, 4.1, 0.2, '#4a3520', p[0], 2.05, p[1]), box(0.1, 1, 0.1, '#4a3520', p[0] * 1.15, 4.7, p[1] * 1.15)));
    tw.add(box(2.8, 0.2, 2.8, '#6b4a2a', 0, 4.1, 0));
    [[0, 1.3, 2.7, 0.1], [0, -1.3, 2.7, 0.1], [1.3, 0, 0.1, 2.7], [-1.3, 0, 0.1, 2.7]].forEach((r) => tw.add(box(r[2], 0.1, r[3], '#5a4128', r[0], 5.15, r[1])));
    const br1 = box(0.1, 3.4, 0.1, '#4a3520', 0, 2, 1.1); br1.rotation.z = 0.6; const br2 = box(0.1, 3.4, 0.1, '#4a3520', 0, 2, 1.1); br2.rotation.z = -0.6;
    tw.add(br1, br2, box(0.08, 4.1, 0.08, '#3b2a1a', -1.5, 2.05, 0.3), box(0.08, 4.1, 0.08, '#3b2a1a', -1.5, 2.05, -0.3));
    for (let i = 0; i < 8; i++) tw.add(box(0.06, 0.06, 0.6, '#3b2a1a', -1.5, 0.4 + i * 0.5, 0));
    tw.add(box(0.3, 0.3, 0.4, '#333', 1.1, 5.4, 1.1), box(0.22, 0.22, 0.05, '#fff7c2', 1.1, 5.4, 1.33, { basic: true }));
    scene.add(tw);
    ZL.addItem({ id: 'tower', title: 'Watchtower', obj: tw, hit: { w: 2.6, h: 3.9, d: 2.6, y: 1.95 },
      lines: ['Watchtower. Built tall so INTJ can look down on everyone. Literally, for once.', 'The ladder has 8 rungs. INTJ removed the 9th "for security".'] });

    [[-4, -4.5], [4.5, -4], [-4.6, 5.6], [4.4, 5.2], [-12, -6], [11.5, 5.5], [0, -13.2], [-2.6, 12.6], [2.6, 12.6]].forEach((p) => scene.add(ZL.lantern(p[0], p[1])));
  };
})(window.ZL);
