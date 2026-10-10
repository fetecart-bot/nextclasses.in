import { courseKnowledgeBase, mentorModels } from '../_courseKnowledge.js';

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
  const courseTitle = String(req.body?.courseTitle || '').slice(0, 300);
  const userMessage = String(req.body?.userMessage || '').slice(0, 2000);
  const language = String(req.body?.language || 'en').toLowerCase();
  if (!courseTitle || !userMessage) return res.status(400).json({ error: 'Course and message are required' });

  const instructions = `You are the flagship NextClasses AI Mentor. The learner's enrolled course is "${courseTitle}".

Your job:
1. Directly answer any reasonable academic, course, technology, language, exam-preparation, career or general-knowledge doubt.
2. Teach from first principles with a plain explanation, a concrete example, and a useful next exercise.
3. Use the NextClasses curriculum knowledge below whenever the question concerns one of our courses. Never invent course facts.
4. Preserve the student's actual enrolled course. An unrelated question must never change it.
5. Adapt depth to the question. For a beginner, avoid jargon; for an advanced question, provide rigorous detail.
6. Be warm, confident and engaging without pretending to be human. Do not ask for private family, financial, medical or identity information. State uncertainty clearly.
7. Respond in natural ${LANGUAGE_NAMES[language] || 'English'}.

NEXTCLASSES COURSE KNOWLEDGE:
${courseKnowledgeBase()}

Return only valid JSON with keys replyText, spokenScript, detectedAim, detectedDoubts, detectedFamilyMembers. replyText may use light markdown. spokenScript must be natural, under 180 words and contain no markdown.`;
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-6) : [];
  const input = `Previous conversation: ${JSON.stringify(history)}\nStudent message: ${userMessage}`;
  try {
    let payload: any = null;
    let lastError = 'Mentor request failed';
    for (const model of mentorModels()) {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, store: false, instructions, input, reasoning: model.startsWith('gpt-5') ? { effort: 'low' } : undefined }),
      });
      payload = await response.json().catch(() => ({}));
      if (response.ok) break;
      lastError = payload?.error?.message || `${model} request failed`;
      payload = null;
    }
    if (!payload) throw new Error(lastError);
    const parsed = JSON.parse(outputText(payload).replace(/^```json\s*|\s*```$/g, ''));
    return res.status(200).json({ success: true, ...parsed, voiceGender: req.body?.voiceGender === 'male' ? 'male' : 'female' });
  } catch (error: any) {
    return res.status(502).json({ error: error?.message || 'Mentor is temporarily unavailable' });
  }
}
