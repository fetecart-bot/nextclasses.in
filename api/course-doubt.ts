import { requireStudentCourse } from './_studentAccess.js';
import { courseKnowledgeBase, mentorModels } from './_courseKnowledge.js';
import { reportMentorAnswer } from './_mentorReport.js';

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
  if (req.body?.action === 'report') return reportMentorAnswer(req, res);
  const access = await requireStudentCourse(req, res);
  if (!access) return;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'OpenAI mentor is not configured' });
  if (req.body?.action === 'transcribe') {
    const encodedAudio = String(req.body?.audioBase64 || '');
    const mimeType = String(req.body?.mimeType || '').split(';')[0];
    const extensions: Record<string, string> = { 'audio/webm': 'webm', 'audio/mp4': 'mp4', 'audio/ogg': 'ogg', 'audio/wav': 'wav' };
    if (!extensions[mimeType] || !encodedAudio || encodedAudio.length > 1500000) return res.status(400).json({ error: 'Please record a short supported audio clip.' });
    try {
      const bytes = Buffer.from(encodedAudio, 'base64');
      if (bytes.length < 500) return res.status(400).json({ error: 'No speech recorded. Please try again.' });
      const form = new FormData();
      form.append('file', new Blob([bytes], { type: mimeType }), `question.${extensions[mimeType]}`);
      form.append('model', 'gpt-4o-mini-transcribe');
      const language = String(req.body?.language || 'en');
      if (LANGUAGE_NAMES[language]) form.append('language', language);
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: form, signal: AbortSignal.timeout(25000) });
      const data: any = await response.json();
      if (!response.ok) throw new Error('Transcription unavailable');
      return res.status(200).json({ transcript: String(data.text || '').slice(0, 2000) });
    } catch { return res.status(502).json({ error: 'Voice recognition is temporarily unavailable. Please type your question.' }); }
  }
  const courseId = String(req.body?.courseId || '').trim();
  const courseTitle = access.courseTitle;
  const question = String(req.body?.question || '').trim().slice(0, 2000);
  const language = String(req.body?.language || 'en').toLowerCase();
  const voicePreference = req.body?.voicePreference === 'male' ? 'male' : 'female';
  if (!courseId || !courseTitle || !question) return res.status(400).json({ error: 'Course and question are required' });

  const instructions = `You are the flagship NextClasses AI academic mentor. The student's enrolled course is shown below, but you must directly answer reasonable doubts across academics, technology, languages, competitive exams, careers and general knowledge. Teach from first principles, then give a concrete example and one useful practice exercise. Use the official NextClasses curriculum knowledge below for questions about our programs. Preserve the student's actual enrolled course and never infer a different enrollment from an unrelated question. Adapt depth to the learner. Never claim to be human. State uncertainty instead of inventing facts. Do not request private family, financial, medical or identity information. Respond in ${LANGUAGE_NAMES[language] || 'English'}.

NEXTCLASSES COURSE KNOWLEDGE:
${courseKnowledgeBase()}

Return only JSON with string keys writtenAnswer, spokenScript, keyTakeaway. spokenScript must contain no markdown and be under 180 words. Write it for listening: short conversational sentences, one idea per sentence, natural pauses, and an encouraging Indian mentor tone. In Indian languages use everyday native phrasing rather than stiff literal translation; keep familiar technical terms only where useful and explain them simply.`;
  const input = `Course ID: ${courseId}\nCourse title: ${courseTitle}\nStudent question: ${question}`;
  try {
    let aiPayload: any = null;
    let lastError = 'OpenAI mentor request failed';
    for (const model of mentorModels()) {
      const aiResponse = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, store: false, instructions, input, reasoning: model.startsWith('gpt-5') ? { effort: 'low' } : undefined }),
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
          instructions: `Speak in ${LANGUAGE_NAMES[language] || 'English'} with fluent native pronunciation and a warm, encouraging Indian mentor delivery. Use relaxed conversational phrasing, varied intonation, short pauses between ideas, and clear pronunciation of numbers and technical terms. Avoid an exaggerated accent, robotic rhythm, rushed speech or a formal newsreader tone.`,
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
