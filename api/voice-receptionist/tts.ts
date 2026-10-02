export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OpenAI voice is not configured' });
  const text = String(req.query?.text || '').replace(/[*#_~`]/g, '').trim().slice(0, 1800);
  const voiceGender = String(req.query?.voice || 'female');
  if (!text) return res.status(400).json({ error: 'Text is required' });
  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: voiceGender === 'male' ? 'cedar' : 'marin',
        input: text,
        instructions: 'Speak naturally, warmly and clearly like a patient professional mentor. Use a relaxed conversational pace and authentic pronunciation.',
        response_format: 'mp3',
      }),
    });
    if (!response.ok) {
      const payload: any = await response.json().catch(() => ({}));
      throw new Error(payload?.error?.message || 'Speech generation failed');
    }
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.status(200).send(Buffer.from(await response.arrayBuffer()));
  } catch (error: any) {
    return res.status(502).json({ error: error?.message || 'Voice is temporarily unavailable' });
  }
}
