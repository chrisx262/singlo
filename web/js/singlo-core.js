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

  /** Add XP. Returns { xp, beltIndex, belt, next, promoted } */
  function addXP(amount) {
    const p = loadProg();
    const oldBelt = beltIdx(p.xp || 0);
    p.xp = (p.xp || 0) + amount;
    const newBelt = beltIdx(p.xp);
    saveProg(p);
    return {
      xp: p.xp,
      beltIndex: newBelt,
      belt: BELTS[newBelt],
      next: BELTS[newBelt + 1] || null,
      promoted: newBelt > oldBelt,
    };
  }

  function getProgress() {
    const p = loadProg();
    const xp = p.xp || 0;
    const bi = beltIdx(xp);
    return { ...p, xp, beltIndex: bi, belt: BELTS[bi], next: BELTS[bi + 1] || null };
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
    NOTE_NAMES, BELTS, beltIdx, loadProg, saveProg, addXP, getProgress, setPref,
    midiToFreq, freqToMidi, noteName, chromaName, autoCorrelate, startMic, playTone, attachWaveform,
  };
})();
