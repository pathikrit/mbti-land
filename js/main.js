// main.js: boot, scene, camera, the cast, picking and the frame loop.
(async function () {
  'use strict';
  const ZL = window.ZL, $ = (id) => document.getElementById(id);
  let THREE, MapControls;
  try {
    THREE = await import('three');
    ({ MapControls } = await import('three/addons/controls/MapControls.js'));
    ZL.mergeGeometries = (await import('three/addons/utils/BufferGeometryUtils.js')).mergeGeometries;
  } catch (err) {
    $('go').textContent = 'Could not load Three.js (are you online?)';
    throw err;
  }
  ZL.THREE = THREE;
  Object.assign(ZL, { anchors: {}, byId: {}, showTags: true, chatter: true, isDay: false, started: false });
  try {
    await Promise.race([Promise.all([document.fonts.load('40px Bangers'), document.fonts.load('700 20px "Comic Neue"')]), new Promise((r) => setTimeout(r, 2500))]);
  } catch (e) { /* fall back to system fonts */ }

  // ------------------------------------------------------------------ renderer, camera, lights
  const stage = $('stage');
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  stage.appendChild(renderer.domElement);
  const canvas = renderer.domElement;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#10142a');
  const VIEW = 30;
  const camera = new THREE.OrthographicCamera(-VIEW, VIEW, VIEW, -VIEW, 1, 600);
  const az = 0.32, el = 0.74, target0 = new THREE.Vector3(1.5, 0, 4);
  camera.position.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(200).add(target0);
  camera.zoom = 1.3;
  const controls = new MapControls(camera, canvas);
  controls.target.copy(target0);
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.09, screenSpacePanning: false, minZoom: 0.55, maxZoom: 7, minPolarAngle: 0.3, maxPolarAngle: 1.22, zoomToCursor: true, zoomSpeed: 1.4 });
  Object.assign(ZL, { scene, camera, controls, renderer });

  const hemi = new THREE.HemisphereLight('#7686d6', '#3a2f2a', 2.1);
  const moon = new THREE.DirectionalLight('#a9bcff', 2.0);
  moon.position.set(-38, 62, 30);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, { left: -52, right: 52, top: 52, bottom: -52, near: 5, far: 220 });
  moon.shadow.bias = -0.0006; moon.shadow.normalBias = 0.04;
  scene.add(hemi, moon, moon.target);
  ZL.lights = { hemi, moon };

  function resize() {
    const w = window.innerWidth, h = window.innerHeight, a = w / h;
    renderer.setSize(w, h);
    const v = a < 1 ? VIEW / a * 0.8 : VIEW; // on portrait screens widen the view so the camp still fits
    camera.left = -v * a; camera.right = v * a; camera.top = v; camera.bottom = -v;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // ------------------------------------------------------------------ entities (anything clickable)
  const pickables = [];
  const hitGeo = new THREE.BoxGeometry(1, 1, 1), hitMat = new THREE.MeshBasicMaterial({ visible: false });
  function register(e, h) {
    const m = new THREE.Mesh(hitGeo, hitMat);
    m.scale.set(h.w, h.h, h.d); m.position.set(h.x || 0, h.y || 0, h.z || 0);
    m.userData.e = e; e.obj.add(m);
    e.hitMesh = m; e.idx = 0; e.pop = 0;
    pickables.push(m); ZL.entities.push(e); ZL.byId[e.id] = e;
    return e;
  }
  ZL.addItem = (o) => register({ id: o.id, kind: 'item', title: o.title, lines: o.lines, obj: o.obj, onClick: o.onClick }, o.hit);

  const PETS = {
    kitten: { title: 'Kitten', sfx: 'meow', lines: ['Mew.', 'Mew? (Translation: "I am the real leader of this camp.")', 'Purrrr. (Has not been told about the apocalypse.)'] },
    puppy: { title: 'Zombie-Puppy (pending)', sfx: 'woof', lines: ['Arf!', 'Arf... grrr-ains?', '*wags tail* *tail falls off* *wags anyway*'] },
  };
  function addPerson(s) {
    const obj = ZL.makePerson(s);
    (s.at ? ZL.anchors[s.at] : scene).add(obj);
    if (s.pos) obj.position.set(s.pos[0], s.y || 0, s.pos[1]);
    obj.rotation.y = s.face || 0;
    const hit = s.lie ? { w: 0.95, h: 0.8, d: 2.1, y: s.lie + 0.1 } : s.sit ? { w: 0.95, h: 1.55, d: 1.2, y: 0.85, z: 0.2 } : { w: 0.95, h: 2.1, d: 0.95, y: 1.05 };
    const e = register({ id: s.id, kind: s.zombie ? 'zombie' : 'human', type: s.type, title: s.title, spec: s, obj, parts: obj.userData.parts,
      phase: Math.random() * 10, lines: s.lines, bubble: s.bubble || 'speech', baseY: s.y || 0, home: s.pos && !s.at ? { x: s.pos[0], z: s.pos[1] } : null }, hit);
    if (s.type) { e.tag = ZL.tag(s.type, s.zombie); e.tagBase = hit.y + hit.h / 2; obj.add(e.tag); }
    obj.traverse((o) => {
      const p = PETS[o.userData.pet];
      if (p) ZL.addItem({ id: o.userData.pet, title: p.title, obj: o, hit: { w: 0.55, h: 0.55, d: 0.75, y: 0.12, z: 0.1 }, lines: p.lines, onClick: () => ZL.sfx[p.sfx]() });
    });
    return e;
  }

  // ------------------------------------------------------------------ build the world
  ZL.buildCamp(scene);
  ZL.buildBunker(scene);
  ZL.buildLab(scene);
  ZL.buildScenery(scene);
  ZL.CAST.forEach(addPerson);

  // the nameless horde
  const named = ZL.entities.filter((e) => e.home);
  const free = (x, z, gap) => named.every((e) => Math.hypot(e.home.x - x, e.home.z - z) > gap);
  let hordeN = 0;
  function zombie(x, z, face, anim, extra) {
    const s = { id: 'horde' + hordeN++, zombie: true, pos: [x, z], face, anim, female: Math.random() < 0.4, scale: ZL.rand(0.86, 1.06) };
    const e = addPerson(s);
    e.title = 'Zombie'; e.lines = null;
    named.push(e);
    return Object.assign(e, extra || {});
  }
  for (let i = 0, tries = 0; i < 62 && tries < 2000; tries++) {
    const x = ZL.rand(-18, 21), z = 17.2 + Math.pow(Math.random(), 1.4) * 14.5;
    if (!free(x, z, 1.25) || (Math.abs(x) < 2.2 && z < 18)) continue;
    const toGate = Math.atan2(-x, 15 - z);
    zombie(x, z, Math.random() < 0.62 ? toGate + ZL.rand(-0.5, 0.5) : ZL.rand(-0.9, 0.9), Math.random() < 0.75 ? 'shamble' : 'zidle', { surge: true });
    i++;
  }
  [[16.3, 0.6], [16.8, 2.2], [16.2, 3.8]].forEach((p) => zombie(p[0], p[1], -Math.PI / 2 + ZL.rand(-0.2, 0.2), 'shamble'));
  [[29.2, 7.2], [21.4, 8.6], [27.2, -1.2], [30.5, 1.5]].forEach((p) => zombie(p[0], p[1], Math.atan2(25 - p[0], 3 - p[1]), 'zidle'));
  for (let i = 0; i < 9; i++) { const a = 2.2 + i * 0.22 + ZL.rand(-0.06, 0.06), d = ZL.rand(17, 21); if (i !== 4) zombie(Math.sin(a) * d, Math.cos(a) * d, a + Math.PI + ZL.rand(-0.4, 0.4), 'shamble'); }
  for (let i = 0; i < 10; i++) zombie(0, 0, 0, 'chase', { chase: 'jeep', lag: 0.5 + i * 0.2 + ZL.rand(-0.05, 0.05), dr: ZL.rand(-1.6, 1.6), home: null });
  for (let i = 0; i < 4; i++) zombie(0, 0, 0, 'chase', { chase: 'run', lag: 0.55 + i * 0.3 + ZL.rand(-0.05, 0.05), dr: ZL.rand(-0.5, 0.5), home: null });
  [[-31, -8], [-34, -19], [-27, -27.5], [-14, -22], [-16.5, -29], [-30, -3], [-12, -16]].forEach((p) => zombie(p[0], p[1], ZL.rand(-3, 3), ZL.pick(['shamble', 'zidle'])));

  const stats = ZL.bake(scene);
  ZL.setTags = (v) => { ZL.showTags = v; ZL.entities.forEach((e) => { if (e.tag) e.tag.visible = v; }); };
  ZL.buildRoster();
  ZL.wireButtons();

  // hover ring
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 28), new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0.9, depthTest: false }));
  ring.rotation.x = -Math.PI / 2; ring.visible = false; ring.renderOrder = 40; scene.add(ring);

  // ------------------------------------------------------------------ picking
  let tagK = 1;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), v3 = new THREE.Vector3();
  function pick(cx, cy) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickables, false).find((h) => !h.object.userData.e.off && !h.object.userData.e.hidden);
    return hit ? hit.object.userData.e : null;
  }
  ZL.speak = function (e, idx) {
    if (!e) return;
    const text = e.lines && e.lines.length ? e.lines[idx != null ? idx : e.idx++ % e.lines.length] : e.kind === 'zombie' ? ZL.pick(ZL.GROANS) : null;
    ZL.say(e, text);
  };
  function activate(e) {
    e.pop = 1;
    if (e.onClick && e.onClick(e) === false) return;
    ZL.speak(e);
  }
  ZL.anchorOf = function (e, out) {
    e.hitMesh.getWorldPosition(out);
    e.hitMesh.getWorldScale(v3);
    out.y += v3.y / 2 + 0.1 + (e.tag && e.tag.visible ? 0.12 + 0.56 * tagK : 0);
    return out;
  };
  const pv = new THREE.Vector3();
  function project(e) {
    ZL.anchorOf(e, pv).project(camera);
    return { x: (pv.x * 0.5 + 0.5) * window.innerWidth, y: (-pv.y * 0.5 + 0.5) * window.innerHeight };
  }
  ZL.project = project;

  let down = null, mouse = null, hover = null;
  canvas.addEventListener('pointerdown', (ev) => { down = { x: ev.clientX, y: ev.clientY, t: performance.now() }; stage.classList.add('drag'); });
  window.addEventListener('pointerup', (ev) => {
    stage.classList.remove('drag');
    if (!down || ev.target !== canvas) { down = null; return; }
    const still = Math.hypot(ev.clientX - down.x, ev.clientY - down.y) < 7 && performance.now() - down.t < 700;
    down = null;
    if (!still || ev.button !== 0) return;
    const e = pick(ev.clientX, ev.clientY);
    if (e) activate(e);
    $('hint').style.opacity = 0;
  });
  canvas.addEventListener('pointermove', (ev) => { mouse = ev.pointerType === 'touch' ? null : { x: ev.clientX, y: ev.clientY }; });
  canvas.addEventListener('pointerleave', () => { mouse = null; });
  canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());

  function label(e) {
    if (e.kind === 'item') return e.title;
    if (!e.type) return e.title || 'Zombie';
    return e.type + (e.kind === 'zombie' ? ' zombie' : ' survivor');
  }

  ZL.initEvents();

  // ------------------------------------------------------------------ frame loop
  const wp = new THREE.Vector3();
  let t = 0, frame = 0, last = performance.now(), lastZoom = 0;
  const J = ZL.JEEP, RN = ZL.RUN, runner = ZL.byId.estj_run;
  function step() {
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000);
    last = now; t += dt; frame++;
    if (camera.zoom !== lastZoom) { // keep name tags readable when zoomed out
      lastZoom = camera.zoom; tagK = Math.min(2.4, Math.max(0.85, 1.8 / camera.zoom));
      ZL.entities.forEach((e) => { if (e.tag) { e.tag.scale.set(1.25 * tagK, 0.52 * tagK, 1); e.tag.position.y = e.tagBase + 0.14 + 0.3 * tagK; } });
    }
    ZL.time = t;
    ZL.tickers.forEach((f) => f(t, dt));

    const runA = t * runner.spec.path.speed;
    ZL.entities.forEach((e) => {
      if (!e.parts) return;
      if (e === runner || e.chase === 'run') {
        const a = runA - (e.lag || 0), rx = RN.rx + (e.dr || 0), rz = RN.rz + (e.dr || 0);
        e.obj.position.x = RN.cx + Math.cos(a) * rx; e.obj.position.z = RN.cz + Math.sin(a) * rz;
        e.obj.rotation.y = Math.atan2(-rx * Math.sin(a), rz * Math.cos(a));
      } else if (e.chase === 'jeep') {
        const a = J.a - e.lag - J.boost * 0.5, r = J.r + e.dr;
        e.obj.position.x = J.cx + Math.cos(a) * r; e.obj.position.z = J.cz + Math.sin(a) * r;
        e.obj.rotation.y = Math.atan2(-Math.sin(a), Math.cos(a));
      } else if (e.home && e.kind === 'zombie' && !e.spec.type) {
        const k = e.surge ? ZL.breachK : 0, dx = -e.home.x, dz = 15.6 - e.home.z, d = Math.hypot(dx, dz) || 1, push = k * Math.min(2.2, Math.max(0, d - 1.6));
        e.obj.position.x = e.home.x + Math.sin(t * 0.31 + e.phase) * 0.22 + (dx / d) * push;
        e.obj.position.z = e.home.z + Math.cos(t * 0.27 + e.phase * 2) * 0.18 + (dz / d) * push + Math.abs(Math.sin(t * 9 + e.phase)) * k * 0.15;
      }
      ZL.animatePerson(e, t, dt);
    });

    ZL.tickEvents(t, dt);
    controls.update();

    if (frame % 3 === 0) {
      const e = mouse && !down && ZL.started ? pick(mouse.x, mouse.y) : null;
      if (e !== hover) { hover = e; stage.classList.toggle('hot', !!e); ZL.tip(e ? label(e) : null, mouse ? mouse.x : 0, mouse ? mouse.y : 0); }
      else if (e && mouse) ZL.tip(label(e), mouse.x, mouse.y);
      renderer.shadowMap.needsUpdate = true;
    }
    ring.visible = !!hover;
    if (hover) {
      hover.obj.getWorldPosition(wp);
      const big = hover.kind === 'item' ? Math.max(hover.hitMesh.scale.x, hover.hitMesh.scale.z) * 0.62 : 1;
      if (hover.kind === 'item') { hover.hitMesh.getWorldPosition(wp); wp.y -= hover.hitMesh.scale.y / 2; }
      ring.position.set(wp.x, Math.max(0.12, wp.y + 0.1), wp.z);
      ring.scale.setScalar(big * (1 + Math.sin(t * 8) * 0.06));
    }

    renderer.render(scene, camera);
    ZL.updateBubbles(project, window.innerWidth, window.innerHeight);
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  // ------------------------------------------------------------------ intro
  const go = $('go'), intro = $('intro');
  go.classList.remove('wait'); go.textContent = 'Enter the camp';
  const start = () => {
    if (ZL.started) return;
    ZL.started = true; intro.classList.add('bye'); ZL.sfx.pop();
    setTimeout(() => ZL.speak(ZL.byId.entj_m, 0), 900);
    setTimeout(() => { $('hint').style.opacity = 0; }, 14000);
  };
  intro.addEventListener('click', start);
  if (/[?&]skip/.test(location.search)) { ZL.sfx.on = false; start(); }
  ZL.ready = true; ZL.stats = stats;
})();
