/* ============================================================
   Singlo Live Server (Parts 4 + 9)
   - 1v1 battles (room codes)  - Quick Match (global queue)
   - Online counter            - Choir Room (bonfire harmony)
   Run: cd server && npm install && npm start   (PORT env, default 3001)
   ============================================================ */
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Singlo live server OK');
});
const io = new Server(server, { cors: { origin: '*' } });

/* ======================= PRESENCE ======================= */
let online = 0;
function broadcastOnline() { io.emit('online', online); }

/* ======================= BATTLES ======================= */
const ROUNDS = 5, ROUND_SECONDS = 6;
const NOTE_POOL = [60, 62, 64, 65, 67, 69];
const rooms = new Map();
const makeCode = () => Math.random().toString(36).slice(2, 6).toUpperCase();

function createRoom(hostSocket, hostName) {
  let code = makeCode();
  while (rooms.has(code)) code = makeCode();
  rooms.set(code, {
    players: [{ id: hostSocket.id, name: hostName || 'Player 1', score: 0, roundScore: 0 }],
    targets: Array.from({ length: ROUNDS }, () => NOTE_POOL[Math.floor(Math.random() * NOTE_POOL.length)]),
    round: -1, timer: null,
  });
  hostSocket.join(code);
  hostSocket.data.code = code;
  return code;
}

function addToRoom(socket, code, name) {
  const room = rooms.get(code);
  if (!room) return { error: 'Room not found' };
  if (room.players.length >= 2) return { error: 'Room is full' };
  room.players.push({ id: socket.id, name: name || 'Player 2', score: 0, roundScore: 0 });
  socket.join(code);
  socket.data.code = code;
  io.to(code).emit('players', room.players.map(p => p.name));
  startRound(code);
  return { ok: true };
}

function startRound(code) {
  const room = rooms.get(code);
  if (!room) return;
  room.round++;
  if (room.round >= ROUNDS) return finish(code);
  room.players.forEach(p => (p.roundScore = 0));
  io.to(code).emit('round_start', {
    round: room.round + 1, totalRounds: ROUNDS,
    targetMidi: room.targets[room.round], seconds: ROUND_SECONDS,
  });
  room.timer = setTimeout(() => endRound(code), ROUND_SECONDS * 1000 + 800);
}

function endRound(code) {
  const room = rooms.get(code);
  if (!room) return;
  room.players.forEach(p => (p.score += p.roundScore));
  io.to(code).emit('round_result', {
    round: room.round + 1,
    scores: room.players.map(p => ({ name: p.name, roundScore: p.roundScore, total: p.score })),
  });
  setTimeout(() => startRound(code), 2500);
}

function finish(code) {
  const room = rooms.get(code);
  if (!room) return;
  const [a, b] = room.players;
  const winner = a.score === b.score ? null : (a.score > b.score ? a.name : b.name);
  io.to(code).emit('battle_over', { winner, scores: room.players.map(p => ({ name: p.name, total: p.score })) });
  rooms.delete(code);
}

/* ======================= QUICK MATCH ======================= */
let queue = []; // [{ socket, name }]
function tryMatch() {
  queue = queue.filter(q => q.socket.connected);
  while (queue.length >= 2) {
    const a = queue.shift(), b = queue.shift();
    const code = createRoom(a.socket, a.name);
    a.socket.emit('matched', { code });
    b.socket.emit('matched', { code });
    addToRoom(b.socket, code, b.name);
  }
}

/* ======================= CHOIR ROOM ======================= */
// One global bonfire. Server cycles a chord; singers on chord tones
// (any octave) count toward the harmony score that feeds the fire.
const CHORDS = [
  { name: 'C major',  tones: [0, 4, 7],  labels: ['C', 'E', 'G'] },
  { name: 'A minor',  tones: [9, 0, 4],  labels: ['A', 'C', 'E'] },
  { name: 'F major',  tones: [5, 9, 0],  labels: ['F', 'A', 'C'] },
  { name: 'G major',  tones: [7, 11, 2], labels: ['G', 'B', 'D'] },
];
const CHORD_SECONDS = 25;
let chordIdx = 0;
const choir = new Map(); // socketId -> { name, belt, lastPitch:{chroma,at} }

function currentChord() { return CHORDS[chordIdx % CHORDS.length]; }

setInterval(() => {
  if (choir.size === 0) return;
  chordIdx++;
  io.to('choir').emit('choir_chord', { ...currentChord(), seconds: CHORD_SECONDS });
}, CHORD_SECONDS * 1000);

// harmony pulse: every second, score = singers-on-chord-tones / active singers
setInterval(() => {
  if (choir.size === 0) return;
  const now = Date.now();
  let active = 0, inHarmony = 0;
  const tones = new Set(currentChord().tones);
  for (const m of choir.values()) {
    if (m.lastPitch && now - m.lastPitch.at < 2000) {
      active++;
      if (tones.has(m.lastPitch.chroma)) inHarmony++;
    }
  }
  io.to('choir').emit('choir_harmony', {
    score: active ? inHarmony / active : 0,
    active, total: choir.size,
  });
}, 1000);

function choirRoster() {
  return [...choir.entries()].map(([id, m]) => ({ id, name: m.name, belt: m.belt }));
}

/* ======================= CONNECTIONS ======================= */
io.on('connection', socket => {
  online++; broadcastOnline();

  /* --- battles --- */
  socket.on('create_room', ({ name }, cb) => cb({ code: createRoom(socket, name) }));
  socket.on('join_room', ({ code, name }, cb) => cb(addToRoom(socket, code, name)));
  socket.on('quick_match', ({ name }) => {
    if (queue.some(q => q.socket.id === socket.id)) return;
    queue.push({ socket, name: name || 'Singer' });
    socket.emit('queued', { position: queue.length });
    tryMatch();
  });
  socket.on('cancel_quick_match', () => { queue = queue.filter(q => q.socket.id !== socket.id); });

  socket.on('pitch', data => {
    if (socket.data.code) socket.to(socket.data.code).volatile.emit('opponent_pitch', data);
  });
  socket.on('round_score', ({ accuracy }) => {
    const room = rooms.get(socket.data.code);
    if (!room) return;
    const p = room.players.find(p => p.id === socket.id);
    if (p) p.roundScore = Math.max(0, Math.min(100, accuracy | 0));
  });

  /* --- choir --- */
  socket.on('join_choir', ({ name, belt }) => {
    socket.join('choir');
    choir.set(socket.id, { name: (name || 'Singer').slice(0, 16), belt: (belt || '🤍').slice(0, 4), lastPitch: null });
    socket.emit('choir_chord', { ...currentChord(), seconds: CHORD_SECONDS });
    io.to('choir').emit('choir_roster', choirRoster());
  });
  socket.on('choir_pitch', ({ chroma, cents }) => {
    const m = choir.get(socket.id);
    if (!m) return;
    m.lastPitch = { chroma: chroma | 0, at: Date.now() };
    socket.to('choir').volatile.emit('choir_peer_pitch', { id: socket.id, chroma: chroma | 0, cents: cents | 0 });
  });
  socket.on('leave_choir', () => {
    socket.leave('choir');
    choir.delete(socket.id);
    io.to('choir').emit('choir_roster', choirRoster());
  });

  /* --- disconnect --- */
  socket.on('disconnect', () => {
    online = Math.max(0, online - 1); broadcastOnline();
    queue = queue.filter(q => q.socket.id !== socket.id);
    if (choir.delete(socket.id)) io.to('choir').emit('choir_roster', choirRoster());
    const code = socket.data.code;
    const room = rooms.get(code);
    if (room) {
      clearTimeout(room.timer);
      socket.to(code).emit('opponent_left');
      rooms.delete(code);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log('Singlo live server on :' + PORT));
