const LANGUAGE_NAMES: Record<string, string> = {
  kn: 'Kannada', ml: 'Malayalam', ta: 'Tamil', te: 'Telugu', hi: 'Hindi', en: 'English',
};

function outputText(payload: any) {
  if (payload?.output_text) return payload.output_text;
  return (payload?.output || []).flatMap((item: any) => item?.content || []).map((part: any) => part?.text || '').join('');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OpenAI mentor is not configured' });
  const studentName = String(req.body?.studentName || 'Student').slice(0, 100);
  const courseTitle = String(req.body?.courseTitle || '').slice(0, 300);
  const userMessage = String(req.body?.userMessage || '').slice(0, 2000);
  const language = String(req.body?.language || 'en').toLowerCase();
  if (!courseTitle || !userMessage) return res.status(400).json({ error: 'Course and message are required' });

  const instructions = `You are the NextClasses general academic mentor for ${studentName}, whose enrolled course is "${courseTitle}". Give a direct, accurate and useful answer to any reasonable educational question, even when it is outside the enrolled course. For example, if asked "What is algebra?", define algebra plainly, show a simple equation such as x + 3 = 7, solve it step by step, and offer one practice question. Also provide deep practical coaching for the enrolled course. For public speaking, coach articulation, breathing, vocal variety, stage confidence, speech structure, storytelling, audience engagement and practice drills. Never switch the student's enrolled course or claim that an unrelated question means they study Sainik School. Be warm and encouraging without pretending to be human. Do not ask for family or private personal details. State uncertainty rather than inventing facts. Respond in natural ${LANGUAGE_NAMES[language] || 'English'}. Return only valid JSON with keys replyText, spokenScript, detectedAim, detectedDoubts, detectedFamilyMembers. Keep spokenScript under 160 words and free of markdown.`;
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-6) : [];
  const input = `Previous conversation: ${JSON.stringify(history)}\nStudent message: ${userMessage}`;
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OPENAI_MENTOR_MODEL || 'gpt-4o-mini', instructions, input, temperature: 0.55 }),
    });
    const payload: any = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error?.message || 'Mentor request failed');
    const parsed = JSON.parse(outputText(payload).replace(/^```json\s*|\s*```$/g, ''));
    return res.status(200).json({ success: true, ...parsed, voiceGender: req.body?.voiceGender === 'male' ? 'male' : 'female' });
  } catch (error: any) {
    return res.status(502).json({ error: error?.message || 'Mentor is temporarily unavailable' });
  }
}
