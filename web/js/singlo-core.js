/* ============================================================
   Singlo Core — shared pitch detection, note utils, belts & XP
   Matches the conventions already used by pitch.html/badges.html:
   - localStorage key 'singlo_progress' (JSON: { xp, bestStreak, name, ageGroup })
   - BELTS identical to pitch.html
   Include: <script src="js/singlo-core.js"></script> → window.Singlo
   ============================================================ */
(function () {
  const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

  /* ---------------- Belts — EXACT copy of pitch.html table ---------------- */
  const BELTS = [
    { name:'White Belt',  emoji:'🤍', color:'#c8c8e8', xp:0      },
    { name:'Yellow Belt', emoji:'💛', color:'#FFD93D', xp:200    },
    { name:'Orange Belt', emoji:'🧡', color:'#FF7043', xp:500    },
    { name:'Green Belt',  emoji:'💚', color:'#4CAF50', xp:1200   },
    { name:'Blue Belt',   emoji:'💙', color:'#3D9EFF', xp:2500   },
    { name:'Purple Belt', emoji:'💜', color:'#7B61FF', xp:5000   },
    { name:'Red Belt',    emoji:'❤️', color:'#F44336', xp:10000  },
    { name:'Brown Belt',  emoji:'🤎', color:'#8D5524', xp:20000  },
    { name:'Black Belt',  emoji:'🖤', color:'#9b9bc8', xp:40000  },
  ];

  /* ---------------- Progress store (same schema as pitch.html) ------------- */
  function loadProg()  { try { return JSON.parse(localStorage.getItem('singlo_progress')) || {}; } catch { return {}; } }
  function saveProg(p) { localStorage.setItem('singlo_progress', JSON.stringify(p)); }
  function beltIdx(xp) { let b = 0; BELTS.forEach((bt, i) => { if (xp >= bt.xp) b = i; }); return b; }

  /* ---------------- Mastery Gates (docs/KIDS_BELT_CRITERIA.md) --------------
     XP measures activity; belts measure ability. Each belt's curriculum gates
     promotion to the NEXT belt: 7 Practice Sparks (effort — playful tries) +
     3 Mastery Stars (measured, age-adaptive) + 1 Show Pass (tiny performance).
     GATES[i] = curriculum of belt i. A null/missing entry = XP-only promotion
     until that belt's curriculum is wired (Orange..Black land later). */
  const GATES = [
    { // White Belt — Voice Activation (→ Yellow)
      sparks: 7,
      stars: [
        { id: 'w_sounds',    name: 'Sound Maker',   desc: 'Make 10 clear sounds in one session' },
        { id: 'w_hold',      name: 'Steady Voice',  desc: 'Hold one sound (3s kids / 5s)' },
        { id: 'w_startstop', name: 'On Cue',        desc: 'Finish an exercise start to stop' },
      ],
      show: { id: 'w_show', name: 'Stage Wake-Up', desc: 'Complete an exercise and make the stage react' },
    },
    { // Yellow Belt — Pitch Awareness (→ Orange)
      sparks: 7,
      stars: [
        { id: 'y_targets', name: 'Note Finder',   desc: 'Land near target notes (200¢ kids / 100¢)' },
        { id: 'y_hold',    name: 'Hold the Note', desc: 'Hold a matched note about 1 second' },
        { id: 'y_rate',    name: '5 of 10',       desc: 'Half your attempts land on target' },
      ],
      show: { id: 'y_show', name: 'Three Glowing Notes', desc: 'Strong accuracy across a full round' },
    },
  ];

  function _gate(p, i) {
    p.gates = p.gates || {};
    return (p.gates[i] = p.gates[i] || { sparks: 0, stars: {}, show: false });
  }

  /* Existing players earned their current XP-belt before gates existed —
     grandfather every gate below it so nobody wakes up demoted. */
  function _grandfather(p) {
    if (p.gatesMigrated) return;
    const xb = beltIdx(p.xp || 0);
    for (let i = 0; i < xb; i++) {
      const def = GATES[i];
      if (!def) continue;
      const g = _gate(p, i);
      g.sparks = def.sparks;
      def.stars.forEach(s => { g.stars[s.id] = true; });
      g.show = true;
    }
    p.gatesMigrated = true;
  }

  function _gateComplete(p, i) {
    const def = GATES[i];
    if (!def) return true; // no curriculum wired yet → XP-only
    const g = (p.gates || {})[i] || { sparks: 0, stars: {}, show: false };
    return g.sparks >= def.sparks && def.stars.every(s => g.stars[s.id]) && g.show;
  }

  /* Earned belt = XP threshold AND every lower belt's skill gate cleared. */
  function earnedBeltIdx(p) {
    const xb = beltIdx(p.xp || 0);
    let i = 0;
    while (i < xb && _gateComplete(p, i)) i++;
    return i;
  }

  function _result(p, oldBelt) {
    const bi = earnedBeltIdx(p);
    return {
      xp: p.xp || 0,
      beltIndex: bi,
      belt: BELTS[bi],
      next: BELTS[bi + 1] || null,
      promoted: bi > oldBelt,
      gate: _status(p, bi),
    };
  }

  function _status(p, i) {
    const def = GATES[i];
    if (!def) return null; // XP-only belt
    const g = (p.gates || {})[i] || { sparks: 0, stars: {}, show: false };
    return {
      beltIndex: i,
      sparks: { earned: Math.min(g.sparks, def.sparks), required: def.sparks },
      stars: def.stars.map(s => ({ ...s, earned: !!g.stars[s.id] })),
      show: { ...def.show, earned: !!g.show },
      complete: _gateComplete(p, i),
    };
  }

  /** Add XP (activity). Returns { xp, beltIndex, belt, next, promoted, gate } */
  function addXP(amount) {
    const p = loadProg();
    _grandfather(p);
    const oldBelt = earnedBeltIdx(p);
    p.xp = (p.xp || 0) + amount;
    saveProg(p);
    return _result(p, oldBelt);
  }

  /** Practice Spark — playful effort on the current belt. Never fails. */
  function recordSpark(n = 1) {
    const p = loadProg();
    _grandfather(p);
    const oldBelt = earnedBeltIdx(p);
    const def = GATES[oldBelt];
    if (def) {
      const g = _gate(p, oldBelt);
      g.sparks = Math.min(def.sparks, g.sparks + n);
    }
    saveProg(p);
    return _result(p, oldBelt);
  }

  /** Mastery Star — a measured benchmark hit. Idempotent; id maps to its belt. */
  function awardStar(id) {
    const p = loadProg();
    _grandfather(p);
    const oldBelt = earnedBeltIdx(p);
    GATES.forEach((def, i) => {
      if (def && def.stars.some(s => s.id === id)) _gate(p, i).stars[id] = true;
    });
    saveProg(p);
    return _result(p, oldBelt);
  }

  /** Show Pass — the belt's tiny performance, passed. */
  function awardShow(id) {
    const p = loadProg();
    _grandfather(p);
    const oldBelt = earnedBeltIdx(p);
    GATES.forEach((def, i) => {
      if (def && def.show.id === id) _gate(p, i).show = true;
    });
    saveProg(p);
    return _result(p, oldBelt);
  }

  /** Gate progress for a belt (default: current). null = XP-only belt. */
  function gateStatus(i) {
    const p = loadProg();
    _grandfather(p);
    saveProg(p);
    return _status(p, i === undefined ? earnedBeltIdx(p) : i);
  }

  function getProgress() {
    const p = loadProg();
    _grandfather(p);
    saveProg(p);
    const xp = p.xp || 0;
    const bi = earnedBeltIdx(p);
    return {
      ...p, xp,
      beltIndex: bi, belt: BELTS[bi], next: BELTS[bi + 1] || null,
      xpBeltIndex: beltIdx(xp),           // raw XP tier (activity only)
      gate: _status(p, bi),
    };
  }

  function setPref(key, val) { const p = loadProg(); p[key] = val; saveProg(p); }

  /* ---------------- Note utilities ---------------- */
  const midiToFreq = m => 440 * Math.pow(2, (m - 69) / 12);
  const freqToMidi = f => 69 + 12 * Math.log2(f / 440);
  const noteName   = m => NOTE_NAMES[((Math.round(m) % 12) + 12) % 12] + (Math.floor(Math.round(m) / 12) - 1);
  const chromaName = m => NOTE_NAMES[((Math.round(m) % 12) + 12) % 12];

  /* ---------------- Pitch detection (autocorrelation, ACF2+) ---------------- */
  function autoCorrelate(buf, sampleRate) {
    let SIZE = buf.length, rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.012) return { freq: -1, rms };

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < SIZE / 2; i++) if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    buf = buf.slice(r1, r2); SIZE = buf.length;

    const c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++)
      for (let j = 0; j < SIZE - i; j++)
        c[i] += buf[j] * buf[j + i];

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
    let T0 = maxpos;
    if (T0 <= 0) return { freq: -1, rms };
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2, b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);
    return { freq: sampleRate / T0, rms };
  }

  /**
   * Mic listener:
   *   const mic = await Singlo.startMic(sample => {...});
   * sample = { freq, midi, nearestMidi, cents, name, chroma, rms } | { silent:true, rms }
   * Returns { stop(), ctx }
   */
  async function startMic(onSample) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    });
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    src.connect(analyser);
    const buf = new Float32Array(analyser.fftSize);
    let running = true;

    function tick() {
      if (!running) return;
      analyser.getFloatTimeDomainData(buf);
      const { freq, rms } = autoCorrelate(buf, ctx.sampleRate);
      if (freq > 60 && freq < 1600) {
        const midi = freqToMidi(freq);
        const nearestMidi = Math.round(midi);
        onSample({
          freq, midi, nearestMidi,
          cents: Math.round((midi - nearestMidi) * 100),
          name: noteName(nearestMidi),
          chroma: ((nearestMidi % 12) + 12) % 12,
          rms,
        });
      } else {
        onSample({ silent: true, rms });
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    return { stop() { running = false; stream.getTracks().forEach(t => t.stop()); }, ctx, analyser, stream };
  }

  /**
   * Draw a live neon waveform from an analyser onto a canvas.
   * Returns { stop() }. opts: { colors:[..], lineWidth, glow:boolean }
   */
  function attachWaveform(canvas, analyser, opts = {}) {
    const colors = opts.colors || ['#FF4F91', '#FFD93D', '#00C9A7'];
    const ctx2d = canvas.getContext('2d');
    const buf = new Float32Array(analyser.fftSize);
    let running = true;

    function draw() {
      if (!running) return;
      const w = canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1);
      const h = canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1);
      analyser.getFloatTimeDomainData(buf);
      ctx2d.clearRect(0, 0, w, h);

      const grad = ctx2d.createLinearGradient(0, 0, w, 0);
      colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
      ctx2d.strokeStyle = grad;
      ctx2d.lineWidth = (opts.lineWidth || 3) * (window.devicePixelRatio || 1);
      ctx2d.lineJoin = ctx2d.lineCap = 'round';
      if (opts.glow !== false) { ctx2d.shadowBlur = 14; ctx2d.shadowColor = colors[1] || colors[0]; }

      ctx2d.beginPath();
      const step = Math.max(1, Math.floor(buf.length / w));
      for (let i = 0, x = 0; i < buf.length; i += step, x++) {
        const y = h / 2 + buf[i] * h * 0.45;
        i === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
      }
      ctx2d.stroke();
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
    return { stop() { running = false; } };
  }

  function playTone(ctx, midi, dur = 1.0, gain = 0.15) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = midiToFreq(midi);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur + 0.05);
  }

  window.Singlo = {
    NOTE_NAMES, BELTS, GATES, beltIdx, loadProg, saveProg, addXP, getProgress, setPref,
    recordSpark, awardStar, awardShow, gateStatus,
    midiToFreq, freqToMidi, noteName, chromaName, autoCorrelate, startMic, playTone, attachWaveform,
  };
})();
