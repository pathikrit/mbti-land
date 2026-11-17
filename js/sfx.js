// sfx.js: tiny synthesised sound effects (no audio files). Everything is a no-op until the first click.
(function (ZL) {
  'use strict';
  let ctx = null, master = null;

  function ac() {
    if (!ZL.sfx.on) return null;
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = 0.2; master.connect(ctx.destination);
      } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(type, f0, f1, dur, vol, delay) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }

  function noise(dur, vol, f0, f1, delay) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + (delay || 0), n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; f.type = 'lowpass'; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }

  ZL.sfx = {
    on: true,
    pop() { tone('sine', 520, 880, 0.09, 0.5); },
    think() { tone('sine', 700, 1100, 0.07, 0.25); tone('sine', 900, 1400, 0.07, 0.25, 0.08); },
    item() { tone('triangle', 330, 500, 0.08, 0.4); },
    groan() { const f = 70 + Math.random() * 50; tone('sawtooth', f * 1.5, f, 0.5, 0.3); tone('sawtooth', f * 1.52 + 3, f * 0.98, 0.5, 0.2); },
    honk() { tone('square', 370, 365, 0.18, 0.3); tone('square', 466, 460, 0.18, 0.3); tone('square', 370, 365, 0.35, 0.3, 0.24); tone('square', 466, 460, 0.35, 0.3, 0.24); },
    boom() { noise(0.7, 1.2, 1400, 60); tone('sine', 120, 30, 0.5, 0.9); },
    rumble() { noise(1.3, 0.7, 220, 60); tone('sawtooth', 55, 38, 1.2, 0.35); },
    slam() { noise(0.18, 1, 900, 80); tone('sine', 140, 50, 0.15, 0.6); },
    creak() { tone('sawtooth', 240, 520, 0.7, 0.12); tone('sawtooth', 247, 560, 0.7, 0.1); },
    rattle() { for (let i = 0; i < 7; i++) noise(0.05, 0.6, 5000, 1500, i * 0.07 + Math.random() * 0.02); },
    blub() { for (let i = 0; i < 4; i++) tone('sine', 180 + Math.random() * 120, 420, 0.1, 0.4, i * 0.11); },
    whoosh() { noise(0.6, 0.6, 300, 2400); },
    meow() { tone('triangle', 620, 900, 0.14, 0.3); tone('triangle', 900, 520, 0.28, 0.3, 0.14); },
    woof() { tone('square', 220, 130, 0.1, 0.3); tone('square', 240, 120, 0.12, 0.3, 0.16); },
    alarm() { for (let i = 0; i < 4; i++) { tone('square', 660, 660, 0.16, 0.22, i * 0.36); tone('square', 495, 495, 0.16, 0.22, i * 0.36 + 0.18); } },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, 0.22, 0.4, i * 0.12)); },
  };
})(window.ZL);
