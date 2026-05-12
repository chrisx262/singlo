const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function freqToNote(freq) {
  const exactMidi = 12 * Math.log2(freq / 440) + 69;
  const midi = Math.round(exactMidi);
  const cents = Math.round((exactMidi - midi) * 100);
  const noteClass = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return {
    name: NOTE_NAMES[noteClass],
    octave,
    label: NOTE_NAMES[noteClass] + octave,
    noteClass,
    midi,
    cents,
    freq
  };
}

export function centsToTarget(freq, targetMidi) {
  return Math.round(1200 * Math.log2(freq / midiToFreq(targetMidi)));
}

export class SingloAudioEngine {
  constructor({ onFrame, onState, onError, fftSize = 2048 } = {}) {
    this.onFrame = onFrame || (() => {});
    this.onState = onState || (() => {});
    this.onError = onError || (() => {});
    this.fftSize = fftSize;
    this.audioCtx = null;
    this.analyser = null;
    this.micStream = null;
    this.source = null;
    this.monitorGain = null;
    this.monitorEnabled = false;
    this.monitorVolume = 0.65;
    this.rafId = null;
    this.timeData = new Float32Array(this.fftSize);
    this.frequencyData = null;
    this.running = false;
    this.prevHasVoice = false;
    this.noiseFloor = 0.012;
  }

  async ensureContext() {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') await this.audioCtx.resume();
    return this.audioCtx;
  }

  async start() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access is not available on this page.');
      }
      const audioCtx = await this.ensureContext();
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      this.analyser = audioCtx.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = 0.72;
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.source = audioCtx.createMediaStreamSource(this.micStream);
      this.source.connect(this.analyser);
      this.monitorGain = audioCtx.createGain();
      this.monitorGain.gain.value = this.monitorEnabled ? this.monitorVolume : 0;
      this.source.connect(this.monitorGain);
      this.monitorGain.connect(audioCtx.destination);
      this.running = true;
      this.onState({ running: true });
      this.loop();
    } catch (error) {
      this.onError(error);
      this.onState({ running: false });
    }
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.micStream?.getTracks().forEach(track => track.stop());
    this.micStream = null;
    this.source = null;
    this.monitorGain = null;
    this.prevHasVoice = false;
    this.onState({ running: false });
  }

  setMonitorEnabled(enabled) {
    this.monitorEnabled = Boolean(enabled);
    if (this.monitorGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      const target = this.monitorEnabled ? this.monitorVolume : 0;
      this.monitorGain.gain.cancelScheduledValues(now);
      this.monitorGain.gain.setTargetAtTime(target, now, 0.025);
    }
  }

  setMonitorVolume(volume) {
    this.monitorVolume = Math.max(0, Math.min(1.25, volume));
    if (this.monitorEnabled) this.setMonitorEnabled(true);
  }

  async playMidi(midi, { volume = 0.85, duration = 1.2 } = {}) {
    const audioCtx = await this.ensureContext();
    const now = audioCtx.currentTime;
    const freq = midiToFreq(midi);
    const master = audioCtx.createGain();
    master.connect(audioCtx.destination);
    master.gain.setValueAtTime(0.001, now);
    master.gain.linearRampToValueAtTime(Math.max(0.001, 0.7 * volume), now + 0.01);
    master.gain.exponentialRampToValueAtTime(Math.max(0.001, 0.25 * volume), now + 0.28);
    master.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const partials = [
      { type: 'triangle', ratio: 1, gain: 1 },
      { type: 'sine', ratio: 2, gain: 0.3 },
      { type: 'sine', ratio: 3, gain: 0.1 }
    ];

    partials.forEach(partial => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = partial.type;
      osc.frequency.value = freq * partial.ratio;
      gain.gain.value = partial.gain;
      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + duration);
    });
  }

  loop = () => {
    if (!this.running || !this.analyser || !this.audioCtx) return;

    this.analyser.getFloatTimeDomainData(this.timeData);
    this.analyser.getByteFrequencyData(this.frequencyData);

    const energy = rms(this.timeData);
    if (energy < this.noiseFloor * 1.35) {
      this.noiseFloor = this.noiseFloor * 0.98 + energy * 0.02;
    }

    const voiceThreshold = Math.max(0.006, this.noiseFloor * 1.55);
    const hasVoice = energy > voiceThreshold;
    const onset = hasVoice && !this.prevHasVoice;
    const freq = hasVoice ? detectPitch(this.timeData, this.audioCtx.sampleRate, energy) : -1;
    const note = freq > 0 ? freqToNote(freq) : null;

    this.onFrame({
      energy,
      voiceThreshold,
      hasVoice,
      onset,
      freq,
      note,
      bins: this.frequencyData,
      time: performance.now()
    });

    this.prevHasVoice = hasVoice;
    this.rafId = requestAnimationFrame(this.loop);
  };
}

function rms(buf) {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
  return Math.sqrt(sum / buf.length);
}

function detectPitch(buf, sampleRate, energy) {
  if (energy < 0.012) return -1;

  const n = buf.length;
  const half = n >> 1;
  const d = new Float32Array(half);

  for (let lag = 1; lag < half; lag++) {
    for (let i = 0; i < half; i++) {
      const diff = buf[i] - buf[i + lag];
      d[lag] += diff * diff;
    }
  }

  const cmnd = new Float32Array(half);
  cmnd[0] = 1;
  let runSum = 0;
  for (let lag = 1; lag < half; lag++) {
    runSum += d[lag];
    cmnd[lag] = runSum > 0 ? (d[lag] * lag) / runSum : 1;
  }

  const threshold = 0.16;
  let lag = 2;
  while (lag < half - 1) {
    if (cmnd[lag] < threshold) {
      while (lag + 1 < half && cmnd[lag + 1] < cmnd[lag]) lag++;
      break;
    }
    lag++;
  }
  if (lag >= half - 1) return -1;

  const a = cmnd[lag - 1];
  const b = cmnd[lag];
  const c = cmnd[lag + 1];
  const denom = 2 * b - a - c;
  const refined = denom !== 0 ? lag + 0.5 * (a - c) / denom : lag;
  const freq = sampleRate / refined;

  return freq >= 70 && freq <= 1200 ? freq : -1;
}
