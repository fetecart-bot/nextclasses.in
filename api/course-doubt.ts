const LANGUAGE_NAMES: Record<string, string> = {
  ml: 'Malayalam', ta: 'Tamil', hi: 'Hindi', te: 'Telugu', kn: 'Kannada',
  en: 'English', de: 'German', fr: 'French',
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Mentor AI is not configured' });
  const courseId = String(req.body?.courseId || '').trim();
  const courseTitle = String(req.body?.courseTitle || '').trim();
  const question = String(req.body?.question || '').trim().slice(0, 2000);
  const language = String(req.body?.language || 'en').toLowerCase();
  if (!courseId || !courseTitle || !question) return res.status(400).json({ error: 'Course and question are required' });

  const prompt = `You are the NextClasses course mentor for only this enrolled course:\nCourse ID: ${courseId}\nCourse title: ${courseTitle}\n\nAnswer the student's question accurately and practically. Stay within this course. If the question needs facts not present in the title, say what you are uncertain about instead of inventing details. Teach like a warm, patient mentor: concise first, then a simple example and one practice step. Never claim to be human. Do not ask for private family, financial, medical, or identity information. Respond in ${LANGUAGE_NAMES[language] || 'English'}.\n\nStudent question: ${question}\n\nReturn only JSON with keys writtenAnswer, spokenScript, and keyTakeaway. spokenScript must be natural speech without markdown and under 120 words.`;
  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.45 } }),
    });
    const payload: any = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error?.message || 'Mentor model request failed');
    const raw = payload?.candidates?.[0]?.content?.parts?.map((part: any) => part.text || '').join('') || '';
    const parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, ''));
    return res.status(200).json({ success: true, language, writtenAnswer: parsed.writtenAnswer, spokenScript: parsed.spokenScript, keyTakeaway: parsed.keyTakeaway });
  } catch (error: any) {
    return res.status(502).json({ error: error?.message || 'Mentor AI is temporarily unavailable' });
  }
}
