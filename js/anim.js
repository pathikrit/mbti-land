// anim.js: procedural poses. One function, called every frame per character.
// Arm/leg rotation.x < 0 swings the limb forward; arm rotation.z raises it sideways (R: +, L: -).
(function (ZL) {
  'use strict';
  const sin = Math.sin, cos = Math.cos, abs = Math.abs, max = Math.max, PI = Math.PI;

  ZL.animatePerson = function (e, t, dt) {
    const s = e.spec, P = e.parts, w = t + e.phase;
    let aLx = 0, aLz = 0, aRx = 0, aRz = 0, lL = 0, lR = 0;
    let by = 0, bz = 0, brx = 0, brz = 0, hx = 0, hy = 0, hz = s.zombie ? 0.16 : 0;

    switch (e.anim || s.anim) {
      case 'talk':
        aRx = -0.9 + sin(w * 5) * 0.35; aRz = 0.25; aLx = -0.25 + sin(w * 3.1) * 0.18; hx = sin(w * 4) * 0.05; hy = sin(w * 1.2) * 0.2; break;
      case 'point':
        aRx = -1.5 + sin(w * 2) * 0.06; aLz = -0.4; aLx = 0.1; hy = sin(w * 0.9) * 0.25; by = abs(sin(w * 2)) * 0.02; break;
      case 'megaphone':
        aRx = -2.25; aRz = -0.5; aLz = -0.45; by = abs(sin(w * 6)) * 0.03; hx = -0.1; hy = sin(w * 0.8) * 0.5; break;
      case 'stir':
        aRx = -1.1 + sin(w * 4) * 0.16; aRz = -0.35 + cos(w * 4) * 0.2; aLx = -0.9; aLz = 0.3; hx = 0.15; hy = sin(w * 0.7) * 0.3; break;
      case 'write':
        aLx = -1.15; aLz = 0.3; aRx = -1.2 + sin(w * 14) * 0.06; aRz = -0.55 + sin(w * 9) * 0.08; hx = 0.25 + sin(w * 0.8) * 0.1; break;
      case 'scold':
        aLx = -1.15; aLz = 0.3; aRx = -1.6 + sin(w * 9) * 0.25; aRz = 0.1; hx = sin(w * 9) * 0.04; by = abs(sin(w * 4.5)) * 0.03; break;
      case 'hold':
        aLx = aRx = -1.15; aLz = -0.25; aRz = 0.25; by = sin(w * 2) * 0.02; hy = sin(w * 0.9) * 0.45; brz = sin(w * 1.3) * 0.04; break;
      case 'selfie':
        aRx = -2.15 + sin(w * 2) * 0.05; aRz = 0.35; aLx = -0.4; aLz = -0.9; hz = -0.22; by = abs(sin(w * 3)) * 0.05; break;
      case 'pose':
        aRx = -2.9; aRz = -0.55; aLz = -0.6; brz = sin(w * 1.5) * 0.09; hz = sin(w * 1.5) * 0.12; hy = sin(w * 0.75) * 0.3; break;
      case 'sign':
        aLx = aRx = -2.2; aLz = 0.25; aRz = -0.25; by = abs(sin(w * 4)) * 0.1; hx = -0.15; break;
      case 'knock':
        aRx = -1.75 + (sin(w * 16) > 0 ? 0.4 : 0) * (sin(w * 1.4) > -0.2 ? 1 : 0); aLx = -1.05; aLz = 0.55; by = abs(sin(w * 5)) * 0.04; hy = sin(w * 1.1) * 0.3; break;
      case 'calm':
        aLx = aRx = -0.75; aLz = 0.35; aRz = -0.35; hx = sin(w * 0.8) * 0.06; hy = sin(w * 0.5) * 0.2; break;
      case 'hug':
        aLx = aRx = -0.35; aLz = -1.25 + sin(w * 1.2) * 0.06; aRz = 1.25 - sin(w * 1.2) * 0.06; hy = sin(w * 0.6) * 0.45; hx = -0.05; break;
      case 'sketch':
        aLx = -1.1; aLz = 0.35; aRx = -1.15 + sin(w * 7) * 0.1; aRz = -0.55 + cos(w * 5) * 0.1; hx = 0.2; hz = 0.1; break;
      case 'taunt':
        aLx = aRx = -2.8 + sin(w * 8) * 0.3; aLz = -0.5; aRz = 0.5; by = abs(sin(w * 5)) * 0.14; brz = sin(w * 5) * 0.1; hz = sin(w * 5) * 0.15; break;
      case 'sleep':
        aLx = -0.2; aRx = 0.1; aRz = 0.5; by = sin(w * 1.4) * 0.015; hz = 0.2; break;
      case 'swoon':
        aRx = -2.7 + sin(w * 0.9) * 0.08; aRz = -0.5; by = sin(w * 1.6) * 0.01; hy = sin(w * 0.6) * 0.25; break;
      case 'hammer':
        aRx = -1.7 + max(0, sin(w * 7)) * 0.95; aLx = -1.15; brx = 0.28; hx = 0.15; break;
      case 'grill':
        aRx = -1.15 + sin(w * 3) * 0.3; aRz = -0.2; aLz = -0.45; hx = 0.2; break;
      case 'nurse':
        aRx = -1.0 + sin(w * 2) * 0.12; aLx = -0.85 + cos(w * 2) * 0.08; brx = 0.2; hx = 0.15; hy = sin(w * 0.7) * 0.15; break;
      case 'lab':
        aLx = -1.15 + sin(w * 3) * 0.05; aRx = -1.3 + sin(w * 5) * 0.12; aRz = -0.2; hx = 0.2; hy = sin(w * 0.7) * 0.3; break;
      case 'remote':
        aLx = aRx = -1.1; aLz = 0.4; aRz = -0.4; hy = sin(w * 0.8) * 0.35; break;
      case 'sip': {
        const k = max(0, sin(w * 0.9)) ** 6;
        aRx = -1.15 - k * 0.95; aRz = -0.25 * k; aLz = -0.3; hx = -k * 0.2; hy = sin(w * 0.5) * 0.2; break;
      }
      case 'gun':
        aLx = aRx = -1.35; aLz = 0.3; aRz = -0.3; by = sin(w * 40) * 0.012; brx = 0.08; hy = sin(w * 1.3) * 0.2; break;
      case 'run':
        lL = sin(w * 11) * 0.95; lR = -lL; aLx = -lL * 0.9 - 0.3; aRx = lL * 0.9 - 0.3; brx = 0.16; by = abs(sin(w * 11)) * 0.07; break;
      case 'chase':
        lL = sin(w * 7) * 0.6; lR = -lL; aLx = -1.4 + sin(w * 3.1) * 0.2; aRx = -1.25 + sin(w * 2.7) * 0.2; brx = 0.2; brz = sin(w * 3.5) * 0.1; by = abs(sin(w * 7)) * 0.04; break;
      case 'shamble':
        lL = sin(w * 2.6) * 0.3; lR = -lL; aLx = -1.35 + sin(w * 2.1) * 0.16; aRx = -1.2 + sin(w * 1.7 + 1) * 0.2;
        brz = sin(w * 1.3) * 0.08; hz = 0.2 + sin(w * 1.1) * 0.12; by = abs(sin(w * 2.6)) * 0.02; break;
      case 'zidle':
        aLx = -0.3 + sin(w * 1.3) * 0.1; aRx = -0.5 + sin(w * 1.1 + 2) * 0.12; brz = sin(w * 0.9) * 0.06; hz = 0.25 + sin(w * 0.7) * 0.1; break;
      case 'cuddle':
        aLx = aRx = -1.0; aLz = 0.5; aRz = -0.5; by = abs(sin(w * 3.5)) * 0.06; hz = sin(w * 1.75) * 0.25; hx = 0.1; break;
      case 'think':
        aRx = -2.05; aRz = -0.6; aLx = -0.6; aLz = 0.6; hx = -0.18 + sin(w * 0.6) * 0.06; hy = sin(w * 0.4) * 0.3; break;
      case 'stitch':
        aRx = -1.3 + sin(w * 6) * 0.14; aRz = -0.2; aLx = -1.2; aLz = 0.2; brx = 0.16; hx = 0.15; break;
      case 'march':
        aRx = -1.55; aLx = sin(w * 5) * 0.6; lL = max(0, sin(w * 5)) * -0.9; lR = max(0, -sin(w * 5)) * -0.9; by = abs(sin(w * 5)) * 0.03; hy = sin(w * 1) * 0.5; break;
      case 'tape':
        aRx = -1.2; aRz = -0.75 + sin(w * 6) * 0.12; aLx = -0.9; aLz = 0.2; hx = 0.3; hy = -0.3; break;
      case 'flex':
        aLx = aRx = -0.2; aLz = -1.9 + sin(w * 3) * 0.25; aRz = 1.9 - sin(w * 3) * 0.25; by = abs(sin(w * 3)) * 0.1; hy = sin(w * 1.5) * 0.4; break;
      case 'crossed':
        aLx = aRx = -0.85; aLz = 0.95; aRz = -0.95; hy = sin(w * 0.35) * 0.5; hx = -0.05; break;
      default: // idle
        aLx = sin(w * 1.3) * 0.06; aRx = -aLx; by = sin(w * 2) * 0.012;
    }

    if (s.sit) { lL = lR = -1.5; by += -0.4; }
    if (s.lie) { brx = -PI / 2; by += s.lie; bz = 0.9; lL = 0.05; lR = -0.08; }

    // click reaction: a squashy hop
    let sc = 1;
    if (e.pop > 0) {
      e.pop = max(0, e.pop - dt * 2.6);
      const k = sin(e.pop * PI);
      if (!s.lie) by += k * 0.35;
      sc = 1 + k * 0.16;
    }
    // launched by a trap: tumble through the air
    if (e.fly) {
      const f = e.fly; f.t += dt;
      const y = f.vy * f.t - 9 * f.t * f.t;
      if (y <= 0 && f.t > 0.1) { e.fly = null; e.pop = 1; e.obj.position.y = e.baseY || 0; }
      else { e.obj.position.y = (e.baseY || 0) + y; brx += f.t * f.spin; aLz = -2.4; aRz = 2.4; lL = -0.6; lR = 0.6; }
    }

    P.armL.rotation.set(aLx, 0, aLz); P.armR.rotation.set(aRx, 0, aRz);
    P.legL.rotation.x = lL; P.legR.rotation.x = lR;
    P.body.position.set(0, by, bz); P.body.rotation.set(brx, 0, brz);
    P.head.rotation.set(hx, hy, hz);
    e.obj.scale.setScalar(e.obj.userData.baseScale * sc);
  };
})(window.ZL);
