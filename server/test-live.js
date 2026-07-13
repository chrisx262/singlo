const { io } = require('socket.io-client');
const URL = 'http://localhost:3001';
let pass = { online:false, matched:0, roster:false, harmony:false, chord:false };

/* --- quick match test --- */
const qa = io(URL), qb = io(URL);
[qa, qb].forEach((s, i) => {
  s.on('matched', ({ code }) => { pass.matched++; console.log(`QM player${i+1} matched into room ${code}`); });
  s.on('round_start', r => { if (i === 0) console.log('QM battle round', r.round, 'target', r.targetMidi); });
});
qa.on('online', n => { pass.online = true; console.log('online counter:', n); });
qa.emit('quick_match', { name: 'QM-A' });
setTimeout(() => qb.emit('quick_match', { name: 'QM-B' }), 400);

/* --- choir test: 3 singers, 2 sing chord tones, 1 sings off --- */
const singers = [io(URL), io(URL), io(URL)];
let chord = null;
singers.forEach((s, i) => {
  s.on('choir_chord', c => { chord = c; pass.chord = true; if (i===0) console.log('chord:', c.name, c.labels.join('-')); });
  s.on('choir_roster', r => { if (r.length === 3) { pass.roster = true; if (i===0) console.log('roster:', r.map(x=>x.name).join(', ')); } });
  s.on('choir_harmony', h => {
    if (i === 0 && h.active > 0) {
      console.log(`harmony: ${(h.score*100).toFixed(0)}% (${h.active} active of ${h.total})`);
      if (h.score > 0.5 && h.score < 1) pass.harmony = true; // expect 2/3 = 66%
    }
  });
  setTimeout(() => s.emit('join_choir', { name: 'Singer' + (i+1), belt: '💛' }), 300);
});
// send pitches: singers 1&2 on the chord root, singer 3 off-chord (chroma 1 = C#)
const iv = setInterval(() => {
  if (!chord) return;
  singers[0].emit('choir_pitch', { chroma: chord.tones[0], cents: 5 });
  singers[1].emit('choir_pitch', { chroma: chord.tones[2], cents: -8 });
  singers[2].emit('choir_pitch', { chroma: (chord.tones[0] + 1) % 12, cents: 0 });
}, 300);

setTimeout(() => {
  clearInterval(iv);
  console.log('\nRESULTS:', JSON.stringify(pass));
  const ok = pass.online && pass.matched === 2 && pass.roster && pass.chord && pass.harmony;
  console.log(ok ? 'ALL TESTS PASS ✅' : 'SOME TESTS FAILED ❌');
  process.exit(ok ? 0 : 1);
}, 7000);
