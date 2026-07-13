/* ============================================================
   Singlo Coach (Part 5) — AI feedback after each exercise
   Exposes: window.SingloCoach.getFeedback(summary) -> Promise<string>

   PRODUCTION NOTE: browsers can't call the Anthropic API directly
   with your key (it would be exposed). Deploy server/coach-proxy.js
   as a Vercel serverless function and set ENDPOINT to '/api/coach'.
   ============================================================ */
(function () {
  // '/api/coach' once you deploy the proxy; the direct URL works
  // inside claude.ai artifact previews only.
  const ENDPOINT = '/api/coach';

  const FALLBACKS = {
    kids: [
      'Great singing! Your voice found the note like a superhero. 🎤',
      'Wow, you held that note so bravely — try one big deep breath before the next one!',
    ],
    teens: [
      'Solid run — your pitch locked in more than half the time. Try landing the note softly instead of scooping up to it.',
      'Nice control on the sustained notes. Next round, focus on keeping your jaw relaxed for steadier pitch.',
    ],
    adults: [
      'Good session. Your cents deviation widened at phrase ends — likely breath support fading. Add a 4-count exhale drill before drilling sustains.',
      'Accuracy is trending up. Your flat drift on descending intervals suggests under-supporting; engage the diaphragm earlier on the leap.',
    ],
  };

  function buildPrompt(s) {
    const tone = {
      kids: 'a 6-year-old child — use one short cheerful sentence and one gentle tip, simple words, one emoji max',
      teens: 'a teenager — casual, encouraging, one concrete technique tip',
      adults: 'an adult vocalist — precise and technical, reference cents/breath/placement',
    }[s.ageGroup] || 'a beginner';

    return `You are Singlo, a friendly vocal coach. The singer is ${tone}.
Exercise: ${s.exercise}
Pitch accuracy: ${s.accuracy}% of samples within tolerance
Average deviation: ${s.avgCents} cents (positive = sharp, negative = flat)
Longest steady hold: ${s.maxHoldSec}s
Weakest notes: ${s.weakNotes.join(', ') || 'none stood out'}
Respond with EXACTLY 2 sentences of coaching feedback. No preamble.`;
  }

  async function getFeedback(summary) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: buildPrompt(summary) }),
      });
      if (!res.ok) throw new Error('coach endpoint ' + res.status);
      const data = await res.json();
      // proxy returns { feedback } ; raw Anthropic API returns { content:[{text}] }
      const text = data.feedback || (data.content || []).filter(b => b.type === 'text').map(b => b.text).join(' ');
      if (!text) throw new Error('empty');
      return text.trim();
    } catch (e) {
      const pool = FALLBACKS[summary.ageGroup] || FALLBACKS.teens;
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }

  window.SingloCoach = { getFeedback, buildPrompt };
})();
