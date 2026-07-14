import { SingloAudioEngine, centsToTarget, freqToNote } from './singlo-audio-engine.js?v=5';
import {
  LANGUAGES,
  applyTranslations,
  getLanguage,
  setLanguage,
  t
} from './singlo-i18n.js?v=5';
import {
  loadKidsProgress,
  recordSession,
  recordShowPass,
  recordVoiceActivation,
  recordVoicePlayTime,
  whiteProgress
} from './singlo-progress.js?v=2';

const TARGETS = [
  { midi: 60, color: '#ff4f91' },
  { midi: 62, color: '#ffd93d' },
  { midi: 64, color: '#00c9a7' },
  { midi: 67, color: '#45b7ff' },
  { midi: 69, color: '#7b61ff' }
];

const state = {
  lang: getLanguage(),
  targetIndex: 0,
  stageAwake: false,
  listening: false,
  pianoVolume: loadVolume(),
  voiceVolume: loadVoiceVolume(),
  lastPaint: null,
  paintX: 0,
  lastActivationAt: 0,
  voiceStartedAt: 0,
  voiceSeconds: 0,
  voiceMonitor: false,
  finaleShown: false
};

let engine;
let paintCanvas;
let paintCtx;
let fxCanvas;
let fxCtx;
let paintDpr = 1;
let animationFrame;
const bursts = [];
const particles = [];

export function initSoundPaintingGame() {
  paintCanvas = document.getElementById('paintCanvas');
  fxCanvas = document.getElementById('fxCanvas');
  paintCtx = paintCanvas.getContext('2d');
  fxCtx = fxCanvas.getContext('2d');

  engine = new SingloAudioEngine({
    onFrame: handleAudioFrame,
    onState: handleAudioState,
    onError: handleAudioError
  });

  setupLanguageSelect();
  applyTranslations(document, state.lang);
  document.getElementById('volumeSlider').value = Math.round(state.pianoVolume * 100);
  document.getElementById('voiceVolumeSlider').value = Math.round(state.voiceVolume * 100);
  engine.setMonitorVolume(state.voiceVolume);
  updateVolumeLabel();
  updateVoiceVolumeLabel();
  bindControls();
  resizeCanvases();
  renderProgress();
  renderTarget();
  renderStatus(t('makeSound', state.lang));
  animate();

  window.addEventListener('resize', resizeCanvases);
}

function bindControls() {
  document.getElementById('wakeButton').addEventListener('click', wakeStage);
  document.getElementById('micButton').addEventListener('click', toggleMic);
  document.getElementById('monitorButton').addEventListener('click', toggleVoiceMonitor);
  document.getElementById('volumeSlider').addEventListener('input', event => {
    state.pianoVolume = Math.max(0, Math.min(1, Number(event.target.value) / 100));
    localStorage.setItem('singlo_piano_volume', String(state.pianoVolume));
    updateVolumeLabel();
  });
  document.getElementById('voiceVolumeSlider').addEventListener('input', event => {
    state.voiceVolume = Math.max(0, Math.min(1.25, Number(event.target.value) / 100));
    localStorage.setItem('singlo_voice_volume', String(state.voiceVolume));
    engine.setMonitorVolume(state.voiceVolume);
    updateVoiceVolumeLabel();
  });
}

function setupLanguageSelect() {
  const select = document.getElementById('languageSelect');
  select.innerHTML = LANGUAGES.map(language => (
    `<option value="${language.code}">${language.label}</option>`
  )).join('');
  select.value = state.lang;
  select.addEventListener('change', event => {
    state.lang = setLanguage(event.target.value);
    applyTranslations(document, state.lang);
    renderTarget();
    renderProgress();
    updateMonitorButton();
    renderStatus(state.listening ? t('listening', state.lang) : t('makeSound', state.lang));
  });
}

async function wakeStage() {
  state.stageAwake = true;
  document.body.classList.add('stage-awake');
  const target = currentTarget();
  await engine.playMidi(target.midi, { volume: state.pianoVolume, duration: 1.25 });
  addBurst(0.5, 0.42, target.color, 38);
  renderStatus(t('makeSound', state.lang));
}

async function toggleMic() {
  if (state.listening) {
    engine.stop();
    recordSession();
    return;
  }
  await engine.start();
}

function handleAudioState(next) {
  state.listening = next.running;
  engine.setMonitorEnabled(state.voiceMonitor);
  document.getElementById('micButton').textContent = next.running
    ? t('stopMic', state.lang)
    : t('startMic', state.lang);
  document.body.classList.toggle('listening', next.running);
  renderStatus(next.running ? t('listening', state.lang) : t('makeSound', state.lang));
  if (next.running) {
    state.voiceStartedAt = performance.now();
  } else if (state.voiceStartedAt) {
    const elapsed = (performance.now() - state.voiceStartedAt) / 1000;
    state.voiceSeconds = Math.max(state.voiceSeconds, elapsed);
    recordVoicePlayTime(elapsed);
    state.voiceStartedAt = 0;
  }
}

function toggleVoiceMonitor() {
  state.voiceMonitor = !state.voiceMonitor;
  engine.setMonitorEnabled(state.voiceMonitor);
  updateMonitorButton();
}

function updateMonitorButton() {
  const button = document.getElementById('monitorButton');
  button.textContent = state.voiceMonitor
    ? t('hearVoiceOn', state.lang)
    : t('hearVoiceOff', state.lang);
  button.classList.toggle('on', state.voiceMonitor);
}

function handleAudioError(error) {
  renderStatus((error?.name || 'MicError') + ': ' + (error?.message || 'Microphone failed'));
  document.body.classList.remove('listening');
  updateMicMeter({ energy: 0, voiceThreshold: 1 });
}

function handleAudioFrame(frame) {
  updateEqualizer(frame.bins);
  updateMicMeter(frame);
  if (!state.stageAwake && frame.hasVoice) {
    state.stageAwake = true;
    document.body.classList.add('stage-awake');
  }

  if (frame.hasVoice) {
    paintVoice(frame);
    maybeRecordActivation(frame);
    updateTargetMatch(frame);
  } else {
    document.body.classList.remove('voice-live', 'pitch-burst');
    updateNowNote(null);
  }
}

function maybeRecordActivation(frame) {
  const now = frame.time;
  if (!frame.onset && now - state.lastActivationAt < 1100) return;
  if (now - state.lastActivationAt < 650) return;

  state.lastActivationAt = now;
  const progress = recordVoiceActivation();
  renderProgress(progress);
  addBurst(0.5 + (Math.random() - 0.5) * 0.45, 0.48 + (Math.random() - 0.5) * 0.3, colorForFrame(frame), 18);
  renderStatus(t('soundLive', state.lang));

  const white = whiteProgress(progress);
  if (white.sparks >= white.sparkGoal && !white.complete && !state.finaleShown) {
    state.finaleShown = true;
    setTimeout(triggerFinale, 650);
  }
}

function updateTargetMatch(frame) {
  const target = currentTarget();
  const hasPitch = frame.freq > 0 && frame.note;
  if (!hasPitch) {
    document.body.classList.add('voice-live');
    document.body.classList.remove('pitch-burst');
    updateNowNote(null);
    return;
  }

  const cents = centsToTarget(frame.freq, target.midi);
  const close = Math.abs(cents) <= 200;
  updateNowNote(frame.note);
  document.body.classList.toggle('voice-live', !close);
  document.body.classList.toggle('pitch-burst', close);
  renderStatus(close ? t('pitchBurst', state.lang) : t('softShimmer', state.lang));

  if (close && Math.random() > 0.82) {
    addBurst(0.5, 0.42, target.color, 24);
  }
}

function paintVoice(frame) {
  const W = paintCanvas.clientWidth;
  const H = paintCanvas.clientHeight;
  if (!W || !H) return;

  const midi = frame.note?.midi;
  const y = midi
    ? H - ((Math.max(48, Math.min(76, midi)) - 48) / 28) * H
    : H * (0.58 - Math.min(0.28, frame.energy * 2.6));
  const x = state.paintX;
  const color = colorForFrame(frame);
  const size = Math.max(5, Math.min(20, 5 + frame.energy * 260));

  paintCtx.save();
  paintCtx.globalCompositeOperation = 'source-over';
  paintCtx.fillStyle = 'rgba(18, 17, 30, 0.018)';
  paintCtx.fillRect(0, 0, W, H);
  paintCtx.restore();

  if (state.lastPaint) {
    paintCtx.save();
    paintCtx.lineCap = 'round';
    paintCtx.lineJoin = 'round';
    paintCtx.strokeStyle = color;
    paintCtx.shadowColor = color;
    paintCtx.shadowBlur = 18;
    paintCtx.lineWidth = size;
    paintCtx.beginPath();
    paintCtx.moveTo(state.lastPaint.x, state.lastPaint.y);
    paintCtx.lineTo(x, y);
    paintCtx.stroke();
    paintCtx.restore();
  }

  state.lastPaint = { x, y };
  state.paintX = (state.paintX + 3.2) % W;
  if (state.paintX < 4) {
    state.lastPaint = null;
  }
}

function triggerFinale() {
  const progress = recordShowPass();
  renderProgress(progress);
  renderStatus(t('finale', state.lang));
  for (let i = 0; i < 54; i++) {
    particles.push({
      x: Math.random(),
      y: 0.18 + Math.random() * 0.62,
      vx: (Math.random() - 0.5) * 0.018,
      vy: -0.01 - Math.random() * 0.02,
      life: 1,
      size: 7 + Math.random() * 13,
      color: TARGETS[i % TARGETS.length].color
    });
  }
}

function resizeCanvases() {
  [paintCanvas, fxCanvas].forEach(canvas => {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintDpr = dpr;
  });
  clearPaint();
}

function clearPaint() {
  const W = paintCanvas.clientWidth;
  const H = paintCanvas.clientHeight;
  paintCtx.clearRect(0, 0, W, H);
  paintCtx.fillStyle = 'rgba(18, 17, 30, 0.62)';
  paintCtx.fillRect(0, 0, W, H);
  drawPitchGuides();
}

function drawPitchGuides() {
  const W = paintCanvas.clientWidth;
  const H = paintCanvas.clientHeight;
  paintCtx.save();
  paintCtx.strokeStyle = 'rgba(255,255,255,0.08)';
  paintCtx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = H * (0.18 + i * 0.16);
    paintCtx.beginPath();
    paintCtx.moveTo(0, y);
    paintCtx.lineTo(W, y);
    paintCtx.stroke();
  }
  paintCtx.restore();
}

function animate() {
  const W = fxCanvas.clientWidth;
  const H = fxCanvas.clientHeight;
  fxCtx.clearRect(0, 0, W, H);

  bursts.forEach(burst => {
    burst.life -= 0.025;
    const radius = burst.radius * (1.5 - burst.life);
    fxCtx.save();
    fxCtx.globalAlpha = Math.max(0, burst.life);
    fxCtx.strokeStyle = burst.color;
    fxCtx.lineWidth = 5;
    fxCtx.shadowColor = burst.color;
    fxCtx.shadowBlur = 24;
    fxCtx.beginPath();
    fxCtx.arc(burst.x * W, burst.y * H, radius, 0, Math.PI * 2);
    fxCtx.stroke();
    fxCtx.restore();
  });

  particles.forEach(particle => {
    particle.life -= 0.018;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.0014;
    fxCtx.save();
    fxCtx.globalAlpha = Math.max(0, particle.life);
    fxCtx.fillStyle = particle.color;
    fxCtx.translate(particle.x * W, particle.y * H);
    fxCtx.rotate((1 - particle.life) * 9);
    fxCtx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
    fxCtx.restore();
  });

  removeDead(bursts);
  removeDead(particles);
  animationFrame = requestAnimationFrame(animate);
}

function removeDead(items) {
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].life <= 0) items.splice(i, 1);
  }
}

function addBurst(x, y, color, radius) {
  bursts.push({ x, y, color, radius, life: 1 });
}

function updateEqualizer(bins) {
  const bars = document.querySelectorAll('.eq-bar');
  if (!bins || !bars.length) return;
  const usableBins = Math.floor(bins.length * 0.42);
  const binsPerBar = Math.max(1, Math.floor(usableBins / bars.length));
  bars.forEach((bar, i) => {
    let sum = 0;
    const start = i * binsPerBar;
    for (let j = 0; j < binsPerBar; j++) sum += bins[start + j] || 0;
    const avg = sum / binsPerBar;
    const height = Math.max(9, Math.min(72, 9 + (avg / 255) * 74));
    bar.style.height = height + 'px';
    bar.style.opacity = Math.max(0.4, Math.min(1, 0.35 + avg / 190));
  });
}

function updateMicMeter(frame) {
  const ratio = frame.energy / Math.max(frame.voiceThreshold, 0.001);
  const pct = Math.max(0, Math.min(100, Math.round(ratio * 36)));
  document.getElementById('micLevelFill').style.width = pct + '%';
  document.getElementById('micLevelText').textContent = pct + '%';
}

function renderProgress(progress = loadKidsProgress()) {
  const white = whiteProgress(progress);
  document.getElementById('sparkCount').textContent = `${white.sparks}/${white.sparkGoal}`;
  document.getElementById('soundCount').textContent = String(white.soundActivations);
  document.getElementById('showPassValue').textContent = white.complete
    ? t('complete', state.lang)
    : t('notYet', state.lang);
  document.getElementById('sparkFill').style.width = white.sparkPct + '%';
}

function renderTarget() {
  const target = currentTarget();
  const note = freqToNote(440 * Math.pow(2, (target.midi - 69) / 12));
  document.getElementById('targetNote').textContent = note.name;
  document.getElementById('targetMirror').textContent = note.name;
  document.documentElement.style.setProperty('--target-color', target.color);
}

function renderStatus(text) {
  document.getElementById('statusText').textContent = text;
}

function updateNowNote(note) {
  document.getElementById('nowNote').textContent = note ? note.name : '-';
}

function currentTarget() {
  return TARGETS[state.targetIndex % TARGETS.length];
}

function colorForFrame(frame) {
  if (!frame.note) return '#ffd93d';
  const hue = ((frame.note.midi - 48) / 28) * 270 + 335;
  return `hsl(${hue % 360} 96% 64%)`;
}

function updateVolumeLabel() {
  document.getElementById('volumeValue').textContent = Math.round(state.pianoVolume * 100) + '%';
}

function updateVoiceVolumeLabel() {
  document.getElementById('voiceVolumeValue').textContent = Math.round(state.voiceVolume * 100) + '%';
}

function loadVolume() {
  const saved = parseFloat(localStorage.getItem('singlo_piano_volume'));
  return Number.isNaN(saved) ? 0.85 : Math.max(0, Math.min(1, saved));
}

function loadVoiceVolume() {
  const saved = parseFloat(localStorage.getItem('singlo_voice_volume'));
  return Number.isNaN(saved) ? 0.75 : Math.max(0, Math.min(1.25, saved));
}

window.addEventListener('beforeunload', () => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  if (engine?.running) engine.stop();
});
