const { io } = require('socket.io-client');
const URL = 'http://localhost:3001';

const a = io(URL), b = io(URL);
let done = 0;

function wire(sock, name, skill) {
  sock.on('round_start', ({ round, targetMidi }) => {
    console.log(`[${name}] round ${round} target midi ${targetMidi}`);
    // simulate singing: report accuracy a few times during the round
    let acc = 0;
    const iv = setInterval(() => {
      acc = Math.min(100, acc + skill);
      sock.emit('round_score', { accuracy: acc });
      sock.emit('pitch', { dev: Math.round((Math.random() - 0.5) * 60) });
    }, 400);
    setTimeout(() => clearInterval(iv), 5500);
  });
  sock.on('round_result', r => console.log(`[${name}] result`, JSON.stringify(r.scores)));
  sock.on('battle_over', r => {
    console.log(`[${name}] BATTLE OVER — winner: ${r.winner}`, JSON.stringify(r.scores));
    if (++done === 2) process.exit(0);
  });
}

wire(a, 'Ava', 18);   // stronger singer
wire(b, 'Ben', 10);

a.emit('create_room', { name: 'Ava' }, ({ code }) => {
  console.log('room code:', code);
  b.emit('join_room', { code, name: 'Ben' }, res => console.log('join:', JSON.stringify(res)));
});

setTimeout(() => { console.log('TIMEOUT'); process.exit(1); }, 60000);
