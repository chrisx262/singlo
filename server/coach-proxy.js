/* ============================================================
   Part 5 backend — deploy as Vercel serverless function.
   Place at: api/coach.js in your Vercel project root.
   Set env var: ANTHROPIC_API_KEY (Vercel dashboard → Settings → Env)
   ============================================================ */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { prompt } = req.body || {};
  if (!prompt || prompt.length > 2000) return res.status(400).json({ error: 'bad prompt' });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await r.json();
    const feedback = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join(' ').trim();
    res.status(200).json({ feedback });
  } catch (e) {
    res.status(502).json({ error: 'coach unavailable' });
  }
}
