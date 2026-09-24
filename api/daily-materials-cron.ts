import { COURSES_DATA } from '../src/data.js';
import { supabaseRequest } from './_supabase.js';

function category(course: any) {
  const text = `${course.id} ${course.title}`.toLowerCase();
  if (/speaking|communication|articulation/.test(text)) return ['Communication practice', 'Deliver one clear idea using pace, pauses and specific examples.'];
  if (/french|german|language|english/.test(text)) return ['Language fluency practice', 'Build useful sentences, speak them aloud and correct grammar in context.'];
  if (/neet|jee|keam|aissee|sainik|navodaya/.test(text)) return ['Exam accuracy drill', 'Use timed recall, option elimination and an error log to improve exam performance.'];
  return ['Applied AI practice', 'Write a structured prompt, verify the output and document one improvement.'];
}

export default async function handler(req: any, res: any) {
  const auth = String(req.headers.authorization || '');
  if (!process.env.CRON_SECRET) return res.status(503).json({ error: 'Daily scheduler is not configured' });
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const date = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const rows = COURSES_DATA.map((course) => {
      const [title, focus] = category(course);
      return {
        course_id: course.id, course_title: course.title, material_date: date,
        title: `${title}: ${date}`, focus,
        lesson: ['Review the key concept without looking at notes.', 'Study one worked example and explain each step.', 'Write a short summary in your own words.'],
        practice: ['Complete a focused 15-minute exercise.', 'Check the result using the answer guide or a reliable source.', 'Record one mistake and the corrected method.'],
        answers: ['A complete response explains the method, not only the result.', 'Corrections should identify the exact step that caused the error.', 'Repeat the activity tomorrow if accuracy is below 80%.'],
        status: 'draft', generated_by: 'Vercel Daily Scheduler',
      };
    });
    await supabaseRequest('daily_materials?on_conflict=course_id,material_date', {
      method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify(rows),
    });
    return res.status(200).json({ success: true, date, drafts: rows.length });
  } catch (error: any) {
    return res.status(503).json({ error: error.message || 'Daily generation failed' });
  }
}
