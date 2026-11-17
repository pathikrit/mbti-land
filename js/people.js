// people.js: builds a chunky toy person (or zombie) from a spec in cast.js.
// Local space: feet at y = 0, facing +z. "R" limbs are on +x, "L" on -x.
(function (ZL) {
  'use strict';
  const ZSKIN = ['#8fae7e', '#7f9c8a', '#9aa58a', '#86a39b', '#a3b07a'];
  const ZSHIRT = ['#5a5148', '#4a5a5a', '#6a4a4a', '#4a4a6a', '#6a6a4a', '#3f4f3f', '#70584a', '#555566'];
  const ZHAIR = ['#2a2a2a', '#4a3a2a', '#777', '#3a1f1a', '#8a8a6a'];

  function hair(head, style, c) {
    const { box, sph, cone } = ZL;
    if (style === 'bald') return;
    head.add(box(0.54, 0.14, 0.5, c, 0, 0.54, 0), box(0.54, 0.3, 0.1, c, 0, 0.4, -0.22));
    if (style === 'long') head.add(box(0.58, 0.72, 0.13, c, 0, 0.16, -0.25), box(0.09, 0.5, 0.3, c, 0.27, 0.28, -0.06), box(0.09, 0.5, 0.3, c, -0.27, 0.28, -0.06));
    else if (style === 'bun') head.add(sph(0.14, c, 0, 0.69, -0.1));
    else if (style === 'pony') head.add(box(0.13, 0.46, 0.13, c, 0, 0.3, -0.34));
    else if (style === 'pigtails') head.add(box(0.14, 0.42, 0.14, c, 0.34, 0.3, -0.05), box(0.14, 0.42, 0.14, c, -0.34, 0.3, -0.05), sph(0.09, '#ff5fa8', 0.34, 0.5, -0.05), sph(0.09, '#ff5fa8', -0.34, 0.5, -0.05));
    else if (style === 'curly') [[-0.22, 0.56, 0.1], [0.22, 0.56, 0.1], [0, 0.64, 0], [-0.26, 0.4, -0.12], [0.26, 0.4, -0.12], [0, 0.5, -0.24], [-0.27, 0.2, -0.1], [0.27, 0.2, -0.1]]
      .forEach((p) => head.add(sph(0.15, c, p[0], p[1], p[2])));
    else if (style === 'mohawk') head.add(box(0.1, 0.3, 0.5, c, 0, 0.7, -0.02));
    else if (style === 'spiky') [-0.16, 0, 0.16].forEach((x) => head.add(cone(0.09, 0.22, c, x, 0.7, 0.04, 5)));
    else if (style === 'messy') {
      const a = box(0.3, 0.12, 0.3, c, -0.14, 0.63, 0.06); a.rotation.z = 0.4;
      const b = box(0.28, 0.12, 0.3, c, 0.16, 0.62, -0.06); b.rotation.z = -0.5;
      head.add(a, b, box(0.6, 0.3, 0.14, c, 0, 0.3, -0.24));
    }
  }

  function hat(head, h) {
    const { box } = ZL;
    if (h.kind === 'cap') head.add(box(0.56, 0.16, 0.52, h.color, 0, 0.57, 0), box(0.42, 0.04, 0.22, h.color, 0, 0.51, h.back ? -0.34 : 0.34));
    else if (h.kind === 'band') head.add(box(0.56, 0.08, 0.5, h.color, 0, 0.47, 0.0));
    else if (h.kind === 'ears') head.add(box(0.5, 0.05, 0.08, h.color, 0, 0.63, 0.05), box(0.12, 0.14, 0.06, h.color, -0.17, 0.72, 0.05), box(0.12, 0.14, 0.06, h.color, 0.17, 0.72, 0.05));
    else if (h.kind === 'medic') head.add(box(0.56, 0.16, 0.52, h.color, 0, 0.57, 0), box(0.16, 0.05, 0.02, '#d6293a', 0, 0.57, 0.27), box(0.05, 0.14, 0.02, '#d6293a', 0, 0.57, 0.27));
  }

  // Props are built in "hand space": with the arm held forward, -y is forward and +z is up.
  ZL.makeProp = function (kind, color) {
    const { box, cyl, sph, cone, group } = ZL;
    const g = group();
    switch (kind) {
      case 'remote': g.add(box(0.2, 0.14, 0.06, '#33363f', -0.2, -0.04, 0.08), box(0.03, 0.03, 0.22, '#888', -0.14, -0.08, 0.2), sph(0.03, '#f33', -0.14, -0.08, 0.32, { basic: true })); break;
      case 'mug': g.add(cyl(0.07, 0.06, 0.14, '#f4f1e6', 0, -0.05, 0.1, 8)); break;
      case 'ladle': g.add(box(0.04, 0.04, 0.7, '#8a8a92', 0, -0.02, -0.3), sph(0.08, '#8a8a92', 0, -0.02, -0.66)); break;
      case 'board': g.add(box(0.34, 0.42, 0.03, color || '#6b4a2a', 0.12, -0.12, 0.1), box(0.26, 0.32, 0.02, '#f6f2e2', 0.12, -0.12, 0.12)); break;
      case 'hammer': g.add(box(0.05, 0.05, 0.42, '#6b4a2a', 0, -0.02, 0.18), box(0.2, 0.1, 0.1, '#777', 0, -0.02, 0.4)); break;
      case 'spatula': g.add(box(0.04, 0.4, 0.03, '#555', 0, -0.25, 0), box(0.12, 0.16, 0.02, '#999', 0, -0.5, 0)); break;
      case 'phone': g.add(box(0.12, 0.03, 0.22, '#1a1a22', 0, -0.04, 0.12), box(0.1, 0.02, 0.19, '#8fd8ff', 0, -0.02, 0.12, { basic: true })); break;
      case 'needle': g.add(box(0.03, 0.26, 0.03, '#ccc', 0, -0.18, 0), box(0.06, 0.1, 0.06, '#d6293a', 0, -0.02, 0)); break;
      case 'tape': { const t = cyl(0.1, 0.1, 0.06, '#9a9aa2', 0, -0.06, 0.02, 10); g.add(t); break; }
      case 'megaphone': { // attached to the head, pointing forward
        const c = cone(0.2, 0.42, '#d6293a', 0, 0.16, 0.5, 10); c.rotation.x = -Math.PI / 2;
        g.add(c, box(0.1, 0.1, 0.12, '#f4f1e6', 0, 0.16, 0.26)); break;
      }
      case 'kitten': case 'puppy': {
        const c = kind === 'kitten' ? '#e89a3c' : '#f2efe6';
        g.add(box(0.2, 0.18, 0.3, c, 0, 0, 0), box(0.2, 0.18, 0.18, c, 0, 0.16, 0.14),
          box(0.05, 0.07, 0.04, kind === 'kitten' ? c : '#8a6a4a', -0.07, 0.28, 0.14), box(0.05, 0.07, 0.04, kind === 'kitten' ? c : '#8a6a4a', 0.07, 0.28, 0.14),
          box(0.03, 0.03, 0.02, '#111', -0.05, 0.18, 0.235), box(0.03, 0.03, 0.02, '#111', 0.05, 0.18, 0.235),
          box(0.04, 0.04, 0.2, c, 0, 0.06, -0.22));
        g.position.set(-0.22, 1.12, 0.3);
        g.userData.pet = kind;
        break;
      }
      case 'brains': { // tray of brains held in front of the body
        g.add(box(0.9, 0.04, 0.5, '#b8b8c0', 0, 0, 0));
        [[-0.28, 0.08], [0, -0.06], [0.28, 0.08], [-0.14, -0.1], [0.14, 0.12]].forEach((p) => {
          const b = sph(0.12, '#e98aa0', p[0], 0.1, p[1]); b.scale.set(0.13, 0.1, 0.11); g.add(b);
        });
        g.position.set(0, 1.08, 0.62);
        break;
      }
      case 'protest': { // placard on a stick
        g.add(box(0.06, 1.7, 0.06, '#8a6a4a', 0, 0.85, 0), box(1.5, 1.05, 0.06, '#f1ead2', 0, 1.95, 0));
        const o = { bg: '#f1ead2', fg: '#14121c', w: 384, h: 256, size: 78, font: '"Comic Neue", "Comic Sans MS", sans-serif' };
        const f = ZL.sign(['Zombie', 'Lives', 'Matter'], 1.42, 0.98, o); f.position.set(0, 1.95, 0.035);
        const b = ZL.sign(['Zombie', 'Lives', 'Matter'], 1.42, 0.98, o); b.position.set(0, 1.95, -0.035); b.rotation.y = Math.PI;
        g.add(f, b);
        g.position.set(0, 1.0, 0.42);
        break;
      }
    }
    return g;
  };

  ZL.makePerson = function (s) {
    const T = ZL.THREE, { box, pick } = ZL;
    const z = !!s.zombie;
    const skin = s.skin || (z ? pick(ZSKIN) : '#e8b98f');
    const shirt = s.shirt || pick(ZSHIRT);
    const pants = s.pants || pick(['#33384a', '#4a3a2a', '#3a3a3a', '#2c3a2c']);
    const hairC = s.hair || pick(ZHAIR);
    const sleeves = s.sleeves || (s.coat ? 'long' : z && !s.shirt ? pick(['short', 'none', 'long']) : 'long');
    const sleeveC = s.coat || shirt;

    const root = new T.Group();
    const body = new T.Group();
    root.add(body);

    const leg = (x) => {
      const g = new T.Group(); g.position.set(x, 0.8, 0);
      if (s.shorts) g.add(box(0.25, 0.3, 0.27, pants, 0, -0.15, 0), box(0.2, 0.36, 0.22, skin, 0, -0.46, 0));
      else g.add(box(0.24, 0.66, 0.26, pants, 0, -0.33, 0));
      g.add(box(0.26, 0.15, 0.36, s.shoes || '#1c1c22', 0, -0.725, 0.04));
      body.add(g); return g;
    };
    const legR = leg(0.16), legL = leg(-0.16);

    body.add(box(0.62, 0.72, 0.36, shirt, 0, 1.16, 0));
    if (s.skirt) body.add(box(0.68, 0.36, 0.44, s.skirt, 0, 0.78, 0));
    if (s.robe) body.add(s.sit ? box(0.7, 0.3, 0.9, s.robe, 0, 0.72, 0.28) : box(0.68, 0.86, 0.44, s.robe, 0, 0.5, 0));
    if (s.apron) body.add(box(0.5, 0.86, 0.03, s.apron, 0, 1.0, 0.2));
    if (s.coat) body.add(box(0.2, 0.98, 0.42, s.coat, 0.25, 1.03, 0), box(0.2, 0.98, 0.42, s.coat, -0.25, 1.03, 0), box(0.68, 0.98, 0.1, s.coat, 0, 1.03, -0.17));
    if (s.tie) body.add(box(0.08, 0.4, 0.02, s.tie, 0, 1.28, 0.19));
    if (z) for (let i = 0; i < 2; i++) body.add(box(ZL.rand(0.08, 0.2), ZL.rand(0.06, 0.16), 0.02, '#7a1420', ZL.rand(-0.2, 0.2), ZL.rand(0.9, 1.4), 0.185));

    const arm = (x) => {
      const g = new T.Group(); g.position.set(x, 1.46, 0);
      g.add(box(0.19, 0.32, 0.21, sleeves === 'none' ? skin : sleeveC, 0, -0.13, 0));
      g.add(box(0.16, 0.34, 0.18, sleeves === 'long' ? sleeveC : skin, 0, -0.44, 0));
      g.add(box(0.17, 0.14, 0.19, skin, 0, -0.66, 0));
      const hand = new T.Group(); hand.position.set(0, -0.68, 0); g.add(hand);
      body.add(g); g.userData.hand = hand; return g;
    };
    const armR = arm(0.41), armL = arm(-0.41);

    const head = new T.Group(); head.position.set(0, 1.54, 0);
    head.add(box(0.5, 0.48, 0.46, skin, 0, 0.26, 0));
    if (z) {
      head.add(box(0.1, 0.1, 0.02, '#f4ff9a', 0.12, 0.31, 0.235, { basic: true }), box(0.1, 0.1, 0.02, '#f4ff9a', -0.12, 0.31, 0.235, { basic: true }),
        box(0.035, 0.035, 0.03, '#111', 0.13, 0.31, 0.24), box(0.035, 0.035, 0.03, '#111', -0.1, 0.3, 0.24),
        box(0.22, 0.11, 0.02, '#2a0d0d', 0, 0.13, 0.235), box(0.05, 0.04, 0.03, '#eee', -0.05, 0.165, 0.24), box(0.05, 0.04, 0.03, '#eee', 0.06, 0.1, 0.24));
    } else {
      head.add(box(0.07, 0.085, 0.02, '#1a1a1a', 0.12, 0.31, 0.235), box(0.07, 0.085, 0.02, '#1a1a1a', -0.12, 0.31, 0.235));
      head.add(box(s.anim === 'sleep' ? 0.08 : 0.17, s.anim === 'taunt' ? 0.09 : 0.04, 0.02, '#7a2e2a', 0, 0.13, 0.235));
      if (s.anim === 'taunt') head.add(box(0.09, 0.1, 0.05, '#e8607a', 0, 0.08, 0.25)); // tongue out
    }
    if (s.glasses === 'glasses') head.add(box(0.18, 0.14, 0.02, '#111', 0.12, 0.31, 0.245), box(0.18, 0.14, 0.02, '#111', -0.12, 0.31, 0.245),
      box(0.13, 0.09, 0.03, '#cfe6ff', 0.12, 0.31, 0.248), box(0.13, 0.09, 0.03, '#cfe6ff', -0.12, 0.31, 0.248));
    if (s.glasses === 'shades') head.add(box(0.5, 0.11, 0.03, '#111', 0, 0.32, 0.245));
    if (s.beard) head.add(box(0.5, 0.2, 0.08, s.beard, 0, 0.09, 0.2), box(0.16, 0.035, 0.02, '#7a2e2a', 0, 0.14, 0.245));
    hair(head, s.hairStyle || (z ? pick(['short', 'bald', 'messy', 'long']) : 'short'), hairC);
    if (s.hat) hat(head, s.hat);
    body.add(head);

    // MBTI on the chest
    if (s.type) {
      const lab = ZL.sign(s.type, 0.46, 0.2, { w: 256, h: 112, size: 96, fg: s.label || '#ffffff' });
      lab.position.set(0, 1.26, s.apron ? 0.222 : 0.19);
      body.add(lab);
    }

    (s.props || []).forEach((p) => {
      const pr = ZL.makeProp(p.kind, p.color);
      (p.on === 'R' ? armR.userData.hand : p.on === 'L' ? armL.userData.hand : p.on === 'head' ? head : body).add(pr);
    });

    if (s.female) root.scale.setScalar(0.94);
    if (s.scale) root.scale.setScalar(s.scale);
    root.userData.baseScale = root.scale.x;
    root.userData.parts = { body, legL, legR, armL, armR, head };
    return root;
  };

  // A nameless member of the horde.
  ZL.makeGeneric = function () {
    return ZL.makePerson({ zombie: true, female: Math.random() < 0.4, scale: ZL.rand(0.86, 1.06) });
  };
})(window.ZL);
