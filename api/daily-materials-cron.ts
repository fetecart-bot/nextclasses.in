import crypto from 'node:crypto';
import { COURSES_DATA } from '../src/data.js';
import { supabaseRequest } from './_supabase.js';

export const config = { maxDuration: 60 };

function adminAuthorized(req: any) {
  const actual = Buffer.from(String(req.headers['x-admin-key'] || ''));
  const expected = Buffer.from(String(process.env.ADMIN_API_KEY || ''));
  return expected.length > 0 && actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export function validateLesson(value: any) {
  if (!value || typeof value.title !== 'string' || typeof value.focus !== 'string') throw new Error('Invalid lesson title');
  for (const field of ['lesson', 'practice', 'answers']) {
    if (!Array.isArray(value[field]) || value[field].length < 3 || value[field].length > 12 || value[field].some((line: unknown) => typeof line !== 'string' || line.trim().length < 12 || line.length > 2000)) throw new Error(`Incomplete ${field}`);
  }
  if (value.lesson.join(' ').length < 700) throw new Error('Lesson notes are too short');
  return { title: value.title.trim().slice(0, 180), focus: value.focus.trim().slice(0, 500), lesson: value.lesson, practice: value.practice, answers: value.answers };
}

export default async function handler(req: any, res: any) {
  const scheduler = req.method === 'GET' && process.env.CRON_SECRET && req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;
  if (!scheduler && !(req.method === 'POST' && adminAuthorized(req))) return res.status(401).json({ error: 'Unauthorized' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'Daily lesson generation needs the OpenAI API key' });
  try {
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    const enrollments = await supabaseRequest('enrollments?select=course_id,students!inner(active)&students.active=eq.true');
    const enrolled = new Set((enrollments || []).map((row: any) => row.course_id));
    const existing = await supabaseRequest(`daily_materials?material_date=eq.${date}&select=course_id,status,generated_by`);
    const ready = new Set((existing || []).filter((row: any) => row.status !== 'draft' || String(row.generated_by).startsWith('OpenAI')).map((row: any) => row.course_id));
    const pending = COURSES_DATA.filter(course => enrolled.has(course.id) && !ready.has(course.id));
    // Bound one invocation; a worker queue is required when many distinct courses are active.
    const courses = pending.slice(0, 4);
    const results = await Promise.allSettled(courses.map(async course => {
      const previous = await supabaseRequest(`daily_materials?course_id=eq.${encodeURIComponent(course.id)}&order=material_date.desc&select=title&limit=7`);
      const curriculum = course.curriculum.map(module => `${module.title}: ${module.lessons.join('; ')}`).join('\n');
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: process.env.OPENAI_DAILY_MATERIAL_MODEL || 'gpt-4o-mini', store: false, max_output_tokens: 2400,
          instructions: 'Write a self-contained 20-minute English lesson for the specified course. Teach a specific concept from first principles, include a fully worked example, 3 concrete practice activities and matching explained answers or a speaking rubric. At least 700 characters of substantive lesson notes. Do not write generic instructions to review a concept without teaching it. Do not invent exam dates, eligibility, current product features, outcomes or guarantees. Avoid sensitive personal information. This is a draft for teacher review. Return only JSON with title, focus, lesson (3-12 strings), practice (3-12 strings), answers (3-12 strings).',
          input: `Course: ${course.title}\nOverview: ${course.subtitle}\nCurriculum:\n${curriculum}\nDate: ${date}\nChoose a different concept from these recent lessons: ${(previous || []).map((row: any) => row.title).join('; ')}`,
        }), signal: AbortSignal.timeout(40000),
      });
      const payload: any = await response.json();
      if (!response.ok) throw new Error('AI generation failed; retry from admin');
      const raw = payload.output_text || (payload.output || []).flatMap((item: any) => item.content || []).map((part: any) => part.text || '').join('');
      const lesson = validateLesson(JSON.parse(raw.replace(/^```json\s*|\s*```$/g, '')));
      const row = { ...lesson, course_id: course.id, course_title: course.title, material_date: date, status: 'draft', generated_by: 'OpenAI course lesson generator' };
      // Never overwrite reviewed/published material, including a publication during generation.
      const current = await supabaseRequest(`daily_materials?course_id=eq.${encodeURIComponent(course.id)}&material_date=eq.${date}&select=id,status`);
      if (current?.[0]) {
        await supabaseRequest(`daily_materials?id=eq.${current[0].id}&status=eq.draft`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(row) });
      } else {
        await supabaseRequest('daily_materials?on_conflict=course_id,material_date', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify(row) });
      }
      return course.title;
    }));
    const failures = results.flatMap((result, index) => result.status === 'rejected' ? [courses[index].title] : []);
    return res.status(failures.length ? 503 : 200).json({ success: !failures.length, date, drafts: results.filter(result => result.status === 'fulfilled').length, awaitingReview: true, remaining: Math.max(0, pending.length - courses.length), failures });
  } catch { return res.status(503).json({ error: 'Daily lesson generation unavailable. Please retry from admin.' }); }
}
