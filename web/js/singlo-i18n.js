const LANGUAGE_KEY = 'singlo_language';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espanol' },
  { code: 'pt', label: 'Portugues' },
  { code: 'fr', label: 'Francais' }
];

const COPY = {
  en: {
    pageTitle: 'Singlo Kids',
    brand: 'Singlo',
    stageName: 'Light Up The Stage',
    stageMode: 'Sound Painting',
    whiteBelt: 'White Belt',
    whiteMeaning: 'I found my voice',
    wakeStage: 'Wake Stage',
    startMic: 'Start Listening',
    stopMic: 'Stop Listening',
    tapPiano: 'Tap the piano key',
    listening: 'Listening',
    makeSound: 'Make any sound',
    soundLive: 'Sound is live',
    pitchBurst: 'Bright match',
    softShimmer: 'Soft shimmer',
    voiceEnergy: 'Voice Energy',
    micLevel: 'Mic Level',
    miclevel: 'Mic Level',
    hearVoiceOn: 'Hear Voice: On',
    hearVoiceOff: 'Hear Voice: Off',
    monitorHint: 'Use low volume or headphones',
    voiceVolume: 'Voice Volume',
    practiceSparks: 'Practice Sparks',
    soundActivations: 'Sound Activations',
    showPass: 'Show Pass',
    localOnly: 'Ghost Mode',
    target: 'Target',
    pianoVolume: 'Piano Volume',
    finale: 'Stage Finale',
    complete: 'Complete',
    notYet: 'Not yet',
    back: 'Home'
  },
  es: {
    pageTitle: 'Singlo Ninos',
    brand: 'Singlo',
    stageName: 'Enciende El Escenario',
    stageMode: 'Pintura Sonora',
    whiteBelt: 'Cinturon Blanco',
    whiteMeaning: 'Encontre mi voz',
    wakeStage: 'Despertar',
    startMic: 'Escuchar',
    stopMic: 'Parar',
    tapPiano: 'Toca la tecla',
    listening: 'Escuchando',
    makeSound: 'Haz un sonido',
    soundLive: 'Sonido activo',
    pitchBurst: 'Brillo fuerte',
    softShimmer: 'Brillo suave',
    voiceEnergy: 'Energia De Voz',
    micLevel: 'Nivel Del Microfono',
    miclevel: 'Nivel Del Microfono',
    hearVoiceOn: 'Oir Voz: Si',
    hearVoiceOff: 'Oir Voz: No',
    monitorHint: 'Volumen bajo o audifonos',
    voiceVolume: 'Volumen Voz',
    practiceSparks: 'Chispas',
    soundActivations: 'Sonidos',
    showPass: 'Show Pass',
    localOnly: 'Modo Fantasma',
    target: 'Meta',
    pianoVolume: 'Volumen Piano',
    finale: 'Final',
    complete: 'Completo',
    notYet: 'Pendiente',
    back: 'Inicio'
  },
  pt: {
    pageTitle: 'Singlo Criancas',
    brand: 'Singlo',
    stageName: 'Acenda O Palco',
    stageMode: 'Pintura Sonora',
    whiteBelt: 'Faixa Branca',
    whiteMeaning: 'Achei minha voz',
    wakeStage: 'Acordar Palco',
    startMic: 'Escutar',
    stopMic: 'Parar',
    tapPiano: 'Toque a tecla',
    listening: 'Escutando',
    makeSound: 'Faca um som',
    soundLive: 'Som ativo',
    pitchBurst: 'Brilho forte',
    softShimmer: 'Brilho suave',
    voiceEnergy: 'Energia Da Voz',
    micLevel: 'Nivel Do Microfone',
    miclevel: 'Nivel Do Microfone',
    hearVoiceOn: 'Ouvir Voz: Sim',
    hearVoiceOff: 'Ouvir Voz: Nao',
    monitorHint: 'Volume baixo ou fones',
    voiceVolume: 'Volume Voz',
    practiceSparks: 'Faíscas',
    soundActivations: 'Sons',
    showPass: 'Show Pass',
    localOnly: 'Modo Fantasma',
    target: 'Alvo',
    pianoVolume: 'Volume Piano',
    finale: 'Final',
    complete: 'Completo',
    notYet: 'Pendente',
    back: 'Inicio'
  },
  fr: {
    pageTitle: 'Singlo Enfants',
    brand: 'Singlo',
    stageName: 'Allume La Scene',
    stageMode: 'Peinture Sonore',
    whiteBelt: 'Ceinture Blanche',
    whiteMeaning: 'J ai trouve ma voix',
    wakeStage: 'Reveiller',
    startMic: 'Ecouter',
    stopMic: 'Arreter',
    tapPiano: 'Touche le piano',
    listening: 'Ecoute',
    makeSound: 'Fais un son',
    soundLive: 'Son actif',
    pitchBurst: 'Grand eclat',
    softShimmer: 'Lumiere douce',
    voiceEnergy: 'Energie Voix',
    micLevel: 'Niveau Micro',
    miclevel: 'Niveau Micro',
    hearVoiceOn: 'Entendre Voix: Oui',
    hearVoiceOff: 'Entendre Voix: Non',
    monitorHint: 'Volume bas ou casque',
    voiceVolume: 'Volume Voix',
    practiceSparks: 'Etincelles',
    soundActivations: 'Sons',
    showPass: 'Show Pass',
    localOnly: 'Mode Fantome',
    target: 'Cible',
    pianoVolume: 'Volume Piano',
    finale: 'Final',
    complete: 'Complet',
    notYet: 'Pas encore',
    back: 'Accueil'
  }
};

export function getLanguage() {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  return COPY[saved] ? saved : 'en';
}

export function setLanguage(code) {
  const next = COPY[code] ? code : 'en';
  localStorage.setItem(LANGUAGE_KEY, next);
  document.documentElement.lang = next;
  return next;
}

export function t(key, lang = getLanguage()) {
  return COPY[lang]?.[key] || COPY.en[key] || key;
}

export function applyTranslations(root = document, lang = getLanguage()) {
  document.documentElement.lang = lang;
  root.querySelectorAll('[data-i18n]').forEach(node => {
    node.textContent = t(node.dataset.i18n, lang);
  });
  root.querySelectorAll('[data-i18n-aria]').forEach(node => {
    node.setAttribute('aria-label', t(node.dataset.i18nAria, lang));
  });
  const title = document.querySelector('title');
  if (title) title.textContent = t('pageTitle', lang);
}
