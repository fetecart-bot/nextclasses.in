import { courseKnowledgeBase, mentorModels } from './_courseKnowledge.js';

const LANGUAGE_NAMES: Record<string, string> = {
  ml: 'Malayalam', ta: 'Tamil', hi: 'Hindi', te: 'Telugu', kn: 'Kannada',
  en: 'English', de: 'German', fr: 'French',
};

function extractOutputText(payload: any) {
  if (payload?.output_text) return payload.output_text;
  return (payload?.output || []).flatMap((item: any) => item?.content || []).map((part: any) => part?.text || '').join('');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OpenAI mentor is not configured' });
  const courseId = String(req.body?.courseId || '').trim();
  const courseTitle = String(req.body?.courseTitle || '').trim();
  const question = String(req.body?.question || '').trim().slice(0, 2000);
  const language = String(req.body?.language || 'en').toLowerCase();
  const voicePreference = req.body?.voicePreference === 'male' ? 'male' : 'female';
  if (!courseId || !courseTitle || !question) return res.status(400).json({ error: 'Course and question are required' });

  const instructions = `You are the flagship NextClasses AI academic mentor. The student's enrolled course is shown below, but you must directly answer reasonable doubts across academics, technology, languages, competitive exams, careers and general knowledge. Teach from first principles, then give a concrete example and one useful practice exercise. Use the official NextClasses curriculum knowledge below for questions about our programs. Preserve the student's actual enrolled course and never infer a different enrollment from an unrelated question. Adapt depth to the learner. Never claim to be human. State uncertainty instead of inventing facts. Do not request private family, financial, medical or identity information. Respond in ${LANGUAGE_NAMES[language] || 'English'}.

NEXTCLASSES COURSE KNOWLEDGE:
${courseKnowledgeBase()}

Return only JSON with string keys writtenAnswer, spokenScript, keyTakeaway. spokenScript must contain no markdown and be under 180 words.`;
  const input = `Course ID: ${courseId}\nCourse title: ${courseTitle}\nStudent question: ${question}`;
  try {
    let aiPayload: any = null;
    let lastError = 'OpenAI mentor request failed';
    for (const model of mentorModels()) {
      const aiResponse = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, instructions, input, reasoning: model.startsWith('gpt-5') ? { effort: 'low' } : undefined }),
      });
      aiPayload = await aiResponse.json().catch(() => ({}));
      if (aiResponse.ok) break;
      lastError = aiPayload?.error?.message || `${model} request failed`;
      aiPayload = null;
    }
    if (!aiPayload) throw new Error(lastError);
    const raw = extractOutputText(aiPayload).replace(/^```json\s*|\s*```$/g, '');
    const parsed = JSON.parse(raw);

    let audioUrl: string | undefined;
    try {
      const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini-tts',
          voice: voicePreference === 'male' ? 'cedar' : 'marin',
          input: String(parsed.spokenScript || parsed.writtenAnswer).slice(0, 1800),
          instructions: 'Speak warmly, clearly, and encouragingly like a professional course mentor. Use a natural conversational pace.',
          response_format: 'mp3',
        }),
      });
      if (speechResponse.ok) {
        const bytes = Buffer.from(await speechResponse.arrayBuffer());
        audioUrl = `data:audio/mpeg;base64,${bytes.toString('base64')}`;
      }
    } catch (error) {
      console.error('OpenAI mentor speech failed', error);
    }

    return res.status(200).json({ success: true, language, writtenAnswer: parsed.writtenAnswer, spokenScript: parsed.spokenScript, keyTakeaway: parsed.keyTakeaway, audioUrl });
  } catch (error: any) {
    return res.status(502).json({ error: error?.message || 'OpenAI mentor is temporarily unavailable' });
  }
}
