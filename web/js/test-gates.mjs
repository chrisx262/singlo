/* Headless test for the mastery-gate engine (node web/js/test-gates.mjs).
   Rule under test: XP measures activity, belts measure ability —
   promotion needs the XP threshold AND the belt's skill gate. */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const here = dirname(fileURLToPath(import.meta.url));
const store = {};
globalThis.window = globalThis;
globalThis.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
};
eval(readFileSync(join(here, 'singlo-core.js'), 'utf8'));
const S = window.Singlo;

let fails = 0;
const check = (name, cond) => { console.log((cond ? 'PASS  ' : 'FAIL  ') + name); if (!cond) fails++; };
const reset = () => { delete store.singlo_progress; };

/* --- new player: XP alone must NOT promote past a gated belt --- */
reset();
let r = S.addXP(300); // past Yellow's 200 XP threshold
check('300 XP but no gate → still White', r.beltIndex === 0 && !r.promoted);
check('gate reports White curriculum', r.gate && r.gate.sparks.required === 7);

/* --- sparks cap and never promote alone --- */
for (let i = 0; i < 12; i++) r = S.recordSpark();
check('sparks cap at 7', r.gate.sparks.earned === 7);
check('sparks alone do not promote', r.beltIndex === 0);

/* --- stars + show complete the gate → promotion fires (XP already there) --- */
S.awardStar('w_sounds');
S.awardStar('w_hold');
r = S.awardStar('w_startstop');
check('2 more needed: still White with all stars but no show', r.beltIndex === 0);
r = S.awardShow('w_show');
check('gate complete + XP past threshold → promoted to Yellow', r.beltIndex === 1 && r.promoted);
check('promotion result carries Yellow gate', r.gate.stars.some(s => s.id === 'y_targets'));

/* --- gate-complete but XP short must NOT promote --- */
r = S.recordSpark(7);
S.awardStar('y_targets'); S.awardStar('y_hold'); S.awardStar('y_rate');
r = S.awardShow('y_show');
check('Yellow gate done but XP < 500 → still Yellow', r.beltIndex === 1 && !r.promoted);
r = S.addXP(250); // 550 total → past Orange's 500
check('XP catches up → promoted to Orange', r.beltIndex === 2 && r.promoted);

/* --- belts without wired curricula stay XP-only --- */
r = S.addXP(1000); // 1550 → past Green's 1200
check('Orange has no gate yet → XP-only promotion to Green', r.beltIndex === 3);
check('gateStatus(current) is null for unwired belt', S.gateStatus() === null);

/* --- wrong ids are safe no-ops --- */
r = S.awardStar('nonsense'); check('unknown star id is a no-op', r.beltIndex === 3);

/* --- grandfathering: pre-gate player with big XP keeps their belt --- */
reset();
store.singlo_progress = JSON.stringify({ xp: 600, name: 'Vet' });
const p = S.getProgress();
check('existing 600-XP player keeps Orange (grandfathered)', p.beltIndex === 2);
check('grandfathered gates marked complete', S.gateStatus(0).complete && S.gateStatus(1).complete);
check('name survives migration', p.name === 'Vet');

/* --- fresh player sanity --- */
reset();
const f = S.getProgress();
check('fresh player is White with live gate', f.beltIndex === 0 && f.gate.complete === false);

console.log(fails ? `\n${fails} FAILURES` : '\nALL PASS');
process.exit(fails ? 1 : 0);
