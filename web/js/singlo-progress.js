const KIDS_PROGRESS_KEY = 'singlo_kids_progress_v1';
const LEGACY_PROGRESS_KEY = 'singlo_progress';

const DEFAULT_PROGRESS = {
  xp: 0,
  sessions: 0,
  bestVoicePlaySeconds: 0,
  white: {
    practiceSparks: 0,
    soundActivations: 0,
    showPasses: 0,
    completed: false
  }
};

function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
}

export function loadKidsProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KIDS_PROGRESS_KEY));
    return mergeProgress(parsed);
  } catch {
    return cloneDefault();
  }
}

export function saveKidsProgress(progress) {
  localStorage.setItem(KIDS_PROGRESS_KEY, JSON.stringify(mergeProgress(progress)));
}

function mergeProgress(progress = {}) {
  const base = cloneDefault();
  return {
    ...base,
    ...progress,
    white: {
      ...base.white,
      ...(progress.white || {})
    }
  };
}

export function recordSession() {
  const progress = loadKidsProgress();
  progress.sessions += 1;
  saveKidsProgress(progress);
  return progress;
}

/* Bridge to the shared mastery-gate ladder (singlo-core.js, when loaded):
   the kids game keeps its own gentle world, but every real achievement
   also counts toward the family-wide belt — same rules as practice/waves. */
const gate = () => (typeof window !== 'undefined' && window.Singlo) || null;

export function recordVoiceActivation() {
  const progress = loadKidsProgress();
  progress.white.soundActivations += 1;
  if (progress.white.practiceSparks < 7) {
    progress.white.practiceSparks += 1;
  }
  progress.xp += 5;
  syncLegacyXp(5);
  saveKidsProgress(progress);
  const S = gate();
  if (S) {
    S.recordSpark();                                        // playful effort
    if (progress.white.soundActivations >= 10) S.awardStar('w_sounds');
  }
  return progress;
}

export function recordShowPass() {
  const progress = loadKidsProgress();
  progress.white.showPasses += 1;
  progress.white.completed = true;
  progress.xp += 25;
  syncLegacyXp(25);
  saveKidsProgress(progress);
  const S = gate();
  if (S) { S.awardShow('w_show'); S.awardStar('w_startstop'); }
  return progress;
}

export function recordVoicePlayTime(seconds) {
  const progress = loadKidsProgress();
  if (seconds > progress.bestVoicePlaySeconds) {
    progress.bestVoicePlaySeconds = Math.round(seconds);
    saveKidsProgress(progress);
  }
  const S = gate();
  if (S && seconds >= 3) S.awardStar('w_hold');             // kids threshold: 3s
  return progress;
}

export function whiteProgress(progress = loadKidsProgress()) {
  const sparks = progress.white.practiceSparks;
  const sparkPct = Math.min(100, Math.round((sparks / 7) * 100));
  return {
    sparks,
    sparkGoal: 7,
    soundActivations: progress.white.soundActivations,
    showPasses: progress.white.showPasses,
    complete: Boolean(progress.white.completed),
    sparkPct
  };
}

function syncLegacyXp(amount) {
  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_PROGRESS_KEY)) || {};
    legacy.xp = (legacy.xp || 0) + amount;
    legacy.sessions = legacy.sessions || 0;
    localStorage.setItem(LEGACY_PROGRESS_KEY, JSON.stringify(legacy));
  } catch {
    localStorage.setItem(LEGACY_PROGRESS_KEY, JSON.stringify({ xp: amount, sessions: 0 }));
  }
}
