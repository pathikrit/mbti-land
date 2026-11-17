// kit.js: tiny helpers for building low-poly things out of boxes, cylinders and canvas text.
// Everything hangs off the global ZL namespace; ZL.THREE is set by main.js before any of this runs.
(function (ZL) {
  'use strict';
  const mats = new Map();
  const geos = new Map();

  ZL.rand = (a, b) => a + Math.random() * (b - a);
  ZL.pick = (arr) => arr[(Math.random() * arr.length) | 0];
  ZL.TEMPER = { NT: '#9a6fd0', NF: '#3fb27f', SJ: '#3e97d8', SP: '#e8ac2c' };
  ZL.temper = function (type) {
    if (type[1] === 'N') return type[2] === 'T' ? 'NT' : 'NF';
    return type[3] === 'J' ? 'SJ' : 'SP';
  };

  // Cached material. opts: { basic, emissive, ei, opacity, double }
  ZL.mat = function (color, opts) {
    const key = color + (opts ? JSON.stringify(opts) : '');
    let m = mats.get(key);
    if (m) return m;
    const T = ZL.THREE;
    m = opts && opts.basic ? new T.MeshBasicMaterial({ color }) : new T.MeshLambertMaterial({ color });
    if (opts) {
      if (opts.emissive && !opts.basic) { m.emissive = new T.Color(opts.emissive); m.emissiveIntensity = opts.ei == null ? 1 : opts.ei; }
      if (opts.opacity != null) { m.transparent = true; m.opacity = opts.opacity; m.depthWrite = false; }
      if (opts.double) m.side = T.DoubleSide;
    }
    mats.set(key, m);
    return m;
  };

  function geo(key, make) {
    let g = geos.get(key);
    if (!g) { g = make(); geos.set(key, g); }
    return g;
  }

  function mesh(g, color, x, y, z, opts) {
    const T = ZL.THREE;
    const m = new T.Mesh(g, typeof color === 'string' || typeof color === 'number' ? ZL.mat(color, opts) : color);
    m.position.set(x || 0, y || 0, z || 0);
    const glow = opts && (opts.basic || opts.opacity != null);
    m.castShadow = !glow;
    m.receiveShadow = !glow;
    return m;
  }

  ZL.box = function (w, h, d, color, x, y, z, opts) {
    const T = ZL.THREE;
    const m = mesh(geo('box', () => new T.BoxGeometry(1, 1, 1)), color, x, y, z, opts);
    m.scale.set(w, h, d);
    return m;
  };
  ZL.cyl = function (rt, rb, h, color, x, y, z, seg, opts) {
    const T = ZL.THREE;
    seg = seg || 12;
    return mesh(geo(`cyl${rt}_${rb}_${h}_${seg}`, () => new T.CylinderGeometry(rt, rb, h, seg)), color, x, y, z, opts);
  };
  ZL.cone = function (r, h, color, x, y, z, seg, opts) {
    const T = ZL.THREE;
    seg = seg || 8;
    return mesh(geo(`cone${r}_${h}_${seg}`, () => new T.ConeGeometry(r, h, seg)), color, x, y, z, opts);
  };
  ZL.sph = function (r, color, x, y, z, opts) {
    const T = ZL.THREE;
    const m = mesh(geo('sph', () => new T.SphereGeometry(1, 12, 9)), color, x, y, z, opts);
    m.scale.setScalar(r);
    return m;
  };
  ZL.rock = function (r, color, x, y, z) {
    const T = ZL.THREE;
    const m = mesh(geo('rock', () => new T.DodecahedronGeometry(1, 0)), color, x, y, z);
    m.scale.set(r, r * 0.7, r * 0.9);
    m.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    return m;
  };
  ZL.group = function (x, y, z, ...kids) {
    const g = new ZL.THREE.Group();
    g.position.set(x || 0, y || 0, z || 0);
    kids.forEach((k) => k && g.add(k));
    return g;
  };

  // Canvas text -> texture. lines: string or array. opts: { w, h, font, size, fg, bg, border, radius }
  ZL.textTex = function (lines, o) {
    o = o || {};
    const T = ZL.THREE;
    const W = o.w || 256, H = o.h || 128;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    const r = o.radius == null ? 0 : o.radius;
    if (o.bg) {
      g.fillStyle = o.bg;
      g.beginPath(); g.roundRect(2, 2, W - 4, H - 4, r); g.fill();
      if (o.border) { g.lineWidth = o.bw || 6; g.strokeStyle = o.border; g.stroke(); }
    }
    if (o.draw) o.draw(g, W, H);
    lines = [].concat(lines || []);
    const size = o.size || Math.floor(H / (lines.length + 0.6));
    g.font = `${size}px ${o.font || 'Bangers, Impact, "Arial Black", sans-serif'}`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const lh = size * 1.08, y0 = H / 2 - (lh * (lines.length - 1)) / 2 + size * 0.06;
    lines.forEach((ln, i) => {
      if (o.stroke) { g.lineWidth = size * 0.22; g.strokeStyle = o.stroke; g.lineJoin = 'round'; g.strokeText(ln, W / 2, y0 + i * lh); }
      g.fillStyle = o.fg || '#fff';
      g.fillText(ln, W / 2, y0 + i * lh, W - 14);
    });
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  };

  // A flat sign: plane (w x h world units) with canvas text. Faces +z. opts.lit => reacts to light.
  ZL.sign = function (lines, w, h, o) {
    const T = ZL.THREE;
    o = Object.assign({ w: Math.round(256 * Math.min(4, w / h)), h: 256 }, o || {});
    const tex = ZL.textTex(lines, o);
    const M = o.lit ? T.MeshLambertMaterial : T.MeshBasicMaterial;
    const m = new T.Mesh(geo('plane', () => new T.PlaneGeometry(1, 1)),
      new M({ map: tex, transparent: !o.bg || (o.radius || 0) > 0, side: o.double ? T.DoubleSide : T.FrontSide, color: o.tint || '#ffffff' }));
    m.scale.set(w, h, 1);
    return m;
  };

  // Floating name tag (always faces the camera, drawn on top of everything).
  ZL.tag = function (type, zombie) {
    const T = ZL.THREE;
    const col = ZL.TEMPER[ZL.temper(type)];
    const tex = ZL.textTex(type, {
      w: 192, h: 80, size: 50, radius: 34, bg: zombie ? '#243a17' : col, border: zombie ? '#9be564' : '#14121c',
      fg: zombie ? '#c9ff9a' : '#ffffff', stroke: zombie ? null : 'rgba(0,0,0,.55)',
    });
    const s = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    s.scale.set(1.25, 0.52, 1);
    s.renderOrder = 50;
    s.userData.isTag = true;
    return s;
  };

  // A-frame tent: two slanted panels. a = half width, h = height, d = depth (along z).
  ZL.tent = function (a, h, d, color) {
    const L = Math.hypot(a, h), phi = Math.atan2(h, a);
    const g = ZL.group();
    const l = ZL.box(L, 0.07, d, color, -a / 2, h / 2, 0); l.rotation.z = phi;
    const r = ZL.box(L, 0.07, d, color, a / 2, h / 2, 0); r.rotation.z = -phi;
    g.add(l, r, ZL.box(0.1, 0.1, d + 0.3, '#3b2a1a', 0, h, 0));
    g.add(ZL.box(a * 1.5, 0.12, d * 0.8, '#4a4f63', 0, 0.07, 0)); // bedroll
    return g;
  };

  // Flickering fire. Returns a group; registers its own ticker. light > 0 adds a point light.
  ZL.fire = function (size, light, color) {
    const T = ZL.THREE;
    const g = ZL.group();
    const cols = ['#ff5a1f', '#ffa52e', '#ffe36e'];
    const flames = cols.map((c, i) => {
      const f = ZL.cone(0.34 - i * 0.09, 1 - i * 0.22, c, (i - 1) * 0.1, 0.5 - i * 0.08, (i % 2) * 0.1, 6, { basic: true });
      g.add(f);
      return f;
    });
    let pl = null;
    if (light) { pl = new T.PointLight(color || '#ff9a3c', light, 22 * size, 1.6); pl.position.y = 1.2; g.add(pl); }
    g.scale.setScalar(size);
    const ph = Math.random() * 10;
    g.userData.boost = 0;
    ZL.tickers.push((t, dt) => {
      const b = 1 + g.userData.boost;
      g.userData.boost = Math.max(0, g.userData.boost - dt * 0.8);
      flames.forEach((f, i) => {
        const k = 0.8 + 0.3 * Math.sin(t * (9 + i * 3) + ph + i) + 0.12 * Math.sin(t * 23 + i * 2);
        f.scale.set(1, k * b, 1);
        f.position.y = (0.5 - i * 0.08) * k * b;
        f.rotation.y = t * (1 + i);
      });
      if (pl) pl.intensity = light * (0.82 + 0.2 * Math.sin(t * 11 + ph) + 0.1 * Math.sin(t * 27)) * (1 + g.userData.boost * 0.6);
    });
    return g;
  };

  // Draw-call diet: inside every group, fuse the plain opaque meshes into one vertex-coloured mesh.
  // Groups keep their own transforms, so anything animated via a group (limbs, doors, lids) still works.
  // Meshes that are glowing, see-through, textured or flagged userData.keep are left alone.
  ZL.bake = function (root) {
    const T = ZL.THREE, merge = ZL.mergeGeometries;
    const shared = new T.MeshLambertMaterial({ vertexColors: true });
    const groups = [];
    root.traverse((o) => { if (!o.isMesh && !o.isSprite && !o.isLight) groups.push(o); });
    let before = 0, after = 0;
    groups.forEach((g) => {
      const kids = g.children.filter((c) => c.isMesh && c.material.isMeshLambertMaterial && !c.material.transparent && !c.material.map && !c.userData.keep && !c.children.length);
      before += kids.length;
      if (kids.length < 2) { after += kids.length; return; }
      const parts = kids.map((c) => {
        c.updateMatrix();
        const geo = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone();
        geo.applyMatrix4(c.matrix);
        const n = geo.attributes.position.count, col = new Float32Array(n * 3), k = c.material.color;
        for (let i = 0; i < n; i++) { col[i * 3] = k.r; col[i * 3 + 1] = k.g; col[i * 3 + 2] = k.b; }
        geo.setAttribute('color', new T.BufferAttribute(col, 3));
        return geo;
      });
      const m = new T.Mesh(merge(parts, false), shared);
      m.castShadow = m.receiveShadow = true;
      kids.forEach((c) => g.remove(c));
      parts.forEach((p) => p.dispose());
      g.add(m);
      after++;
    });
    return { before, after };
  };

  // Lantern on a post, emissive only (no real light, to keep the light count down).
  ZL.lantern = function (x, z, h) {
    h = h || 2.2;
    return ZL.group(x, 0, z,
      ZL.box(0.12, h, 0.12, '#3b2a1a', 0, h / 2, 0),
      ZL.box(0.3, 0.36, 0.3, '#ffd77a', 0, h + 0.1, 0, { basic: true }),
      ZL.box(0.36, 0.06, 0.36, '#222', 0, h + 0.31, 0));
  };
})(window.ZL);
