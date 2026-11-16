import { isCourseOpenForEnrollment } from '../src/cataloguePolicy.js';
import { trialIsExpired } from './_trialPolicy.js';
import crypto from 'node:crypto';
import { COURSES_DATA } from '../src/data.js';
import { supabaseRequest } from './_supabase.js';

export const config = { maxDuration: 60 };

class GenerationError extends Error {
  constructor(public code: string, message: string) { super(message); }
}

// Do not expose provider payloads, credentials, or student records in admin errors/logs.
async function database(path: string, init: RequestInit = {}) {
  try { return await supabaseRequest(path, { ...init, signal: AbortSignal.timeout(8000) }); }
  catch (error: any) {
    const code = String(error?.code || error?.status || error?.name || 'unavailable').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50);
    throw new GenerationError(`database_${code}`, 'Supabase could not read or save lesson data. Check database availability and permissions, then retry.');
  }
}

export const lessonFormat = {
  type: 'json_schema', name: 'daily_lesson', strict: true,
  schema: {
    type: 'object', additionalProperties: false,
    properties: {
      title: { type: 'string', minLength: 1 }, focus: { type: 'string', minLength: 1 },
      lesson: { type: 'array', items: { type: 'string', minLength: 500, maxLength: 2000 }, minItems: 6, maxItems: 8 },
      practice: { type: 'array', items: { type: 'string', minLength: 12, maxLength: 2000 }, minItems: 5, maxItems: 8 },
      answers: { type: 'array', items: { type: 'string', minLength: 12, maxLength: 2000 }, minItems: 5, maxItems: 8 },
    }, required: ['title', 'focus', 'lesson', 'practice', 'answers'],
  },
};

function failure(error: unknown) {
  if (error instanceof GenerationError) return { code: error.code, message: error.message };
  if (error instanceof SyntaxError) return { code: 'lesson_json', message: 'The AI response was not valid lesson JSON. Nothing was saved; please retry.' };
  if (error instanceof TypeError) return { code: 'ai_connection', message: 'The AI connection failed. Please retry.' };
  if (error instanceof Error && /^(Invalid lesson title|Incomplete (lesson|practice|answers)|Lesson notes are too short)$/.test(error.message)) return { code: 'lesson_validation', message: `Lesson validation failed: ${error.message}. Nothing was saved; please retry.` };
  if (error instanceof Error && /timeout|abort/i.test(error.name)) return { code: 'ai_timeout', message: 'The AI service took too long. Please retry.' };
  return { code: 'lesson_invalid', message: 'The generated lesson was incomplete or invalid. Nothing was saved; please retry.' };
}

function adminAuthorized(req: any) {
  const actual = Buffer.from(String(req.headers['x-admin-key'] || ''));
  const expected = Buffer.from(String(process.env.ADMIN_API_KEY || ''));
  return expected.length > 0 && actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export function validateLesson(value: any) {
  if (!value || typeof value.title !== 'string' || typeof value.focus !== 'string') throw new Error('Invalid lesson title');
  for (const field of ['lesson', 'practice', 'answers']) {
    if (!Array.isArray(value[field]) || value[field].length < (field === 'lesson' ? 6 : 5) || value[field].length > 12 || value[field].some((line: unknown) => typeof line !== 'string' || line.trim().length < 12 || line.length > 2000)) throw new Error(`Incomplete ${field}`);
  }
  if (value.lesson.join(' ').length < 3000) throw new Error('Lesson notes are too short');
  if (value.practice.length !== value.answers.length) throw new Error('Incomplete answers');
  return { title: value.title.trim().slice(0, 180), focus: value.focus.trim().slice(0, 500), lesson: value.lesson, practice: value.practice, answers: value.answers };
}

export default async function handler(req: any, res: any) {
  const scheduler = req.method === 'GET' && process.env.CRON_SECRET && req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;
  if (!scheduler && !(req.method === 'POST' && adminAuthorized(req))) return res.status(401).json({ error: 'Unauthorized' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'Daily lesson generation needs the OpenAI API key' });
  try {
    const improveCourse = !scheduler && req.body?.improveDraft === true && typeof req.body?.courseId === 'string' ? req.body.courseId : '';
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    const studentFields = process.env.NEXTCLASSES_TRIAL_ENABLED === 'true' ? 'active,account_kind,access_expires_at' : 'active';
    const enrollments = await database(`enrollments?select=course_id,students!inner(${studentFields})&students.active=eq.true`);
    const enrolled = new Set((enrollments || []).filter((row: any) => !trialIsExpired(Array.isArray(row.students) ? row.students[0] || {} : row.students || {})).map((row: any) => row.course_id));
    const existing = await database(`daily_materials?material_date=eq.${date}&select=course_id,status,generated_by,id`);
    const ready = new Set((existing || []).filter((row: any) => !(improveCourse === row.course_id && row.status === 'draft')).map((row: any) => row.course_id));
    const pending = COURSES_DATA.filter(course => isCourseOpenForEnrollment(course) && enrolled.has(course.id) && !ready.has(course.id) && (!improveCourse || course.id === improveCourse));
    // Bound one invocation; a worker queue is required when many distinct courses are active.
    const courses = pending.slice(0, 4);
    const results = await Promise.allSettled(courses.map(async course => {
      const previous = await database(`daily_materials?course_id=eq.${encodeURIComponent(course.id)}&order=material_date.desc&select=title,status,generated_by,material_date&limit=200`);
      const plan = course.curriculum.flatMap(module => module.lessons.map(topic => `${module.title}: ${topic}`)).slice(0, 30);
      const completed = (previous || []).filter((row: any) => row.status !== 'rejected' && !(improveCourse && row.material_date === date) && (row.status === 'published' || row.status === 'approved' || String(row.generated_by).startsWith('OpenAI')));
      if (!plan.length) return { courseId: course.id, status: 'plan_complete' };
      const ongoingTuition = course.id.startsWith('course-cbse-class-');
      if (!ongoingTuition && completed.length >= plan.length) return { courseId: course.id, status: 'plan_complete' };
      const nextTopic = improveCourse ? (previous || []).find((row: any) => row.material_date === date)?.title || plan[completed.length % plan.length] : plan[completed.length % plan.length];
      const progression = ongoingTuition ? `Ongoing monthly tuition, study day ${completed.length + 1}. Choose a fresh age-appropriate CBSE concept or a new application within the planned subject. Build on prior lessons; do not repeat their examples or questions.` : `Lesson ${completed.length + 1} of ${plan.length}.`;
      const curriculum = course.curriculum.map(module => `${module.title}: ${module.lessons.join('; ')}`).join('\n');
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: process.env.OPENAI_DAILY_MATERIAL_MODEL || 'gpt-4o-mini', store: false, max_output_tokens: 5000, text: { format: lessonFormat },
          instructions: 'Create a substantive 20-30 minute teacher-review study pack for the named class/course and a single specific planned concept. Use Indian classroom context; money examples use rupees and paise, never dollars. Write 6-8 well-developed lesson sections, each 500-1200 characters, total about 4000-6500 characters. Sections must teach, not merely tell the learner to review: (1) specific learning goals and a prerequisite check with its answer, (2-3) step-by-step conceptual explanations with concrete examples, (4) a fully worked example showing each step and why, (5) a second application or contrasting example plus common mistakes and corrections, (6) a concise recap and self-check. For language/articulation courses use actual sample sentences/speeches and a concrete rubric instead of numerical workings. Include 5-8 numbered independent practice tasks progressing from basic to application, at least one reasoning task, and exactly one matching explained answer/rubric per task in the same order. Explain answers, do not only give final values. Adapt vocabulary, difficulty and prerequisites to the specified class. Avoid padding, generic motivational filler, unsupported price/value judgements, private information, invented exam facts or claims of guaranteed results. Stay within standard textbook concepts. Return JSON with title, focus, lesson, practice, answers. The teacher must still check correctness and curriculum alignment.',
          input: `${progression} Teach this planned topic: ${nextTopic}\nCourse: ${course.title}\nOverview: ${course.subtitle}\nCurriculum:\n${curriculum}\nDate: ${date}\nChoose a different concept from these recent lessons: ${(previous || []).map((row: any) => row.title).join('; ')}`,
        }), signal: AbortSignal.timeout(40000),
      });
      const payload: any = await response.json();
      if (!response.ok) {
        const code = payload?.error?.code;
        if (code === 'insufficient_quota' || code === 'credit_balance_exhausted') throw new GenerationError('ai_credits', 'OpenAI lesson-generation credits are unavailable. Check the website API project billing.');
        if (response.status === 401 || response.status === 403) throw new GenerationError('ai_access', 'The website OpenAI key or model access needs checking.');
        throw new GenerationError(`ai_http_${response.status}`, 'OpenAI could not generate the lesson. Please retry.');
      }
      if (payload.status === 'incomplete') throw new GenerationError('ai_incomplete', 'The AI response ended before the lesson was complete. Nothing was saved; please retry.');
      const raw = payload.output_text || (payload.output || []).flatMap((item: any) => item.content || []).map((part: any) => part.text || '').join('');
      const lesson = validateLesson(JSON.parse(raw.replace(/^```json\s*|\s*```$/g, '')));
      const row = { ...lesson, course_id: course.id, course_title: course.title, material_date: date, status: 'draft', generated_by: 'OpenAI course lesson generator' };
      // Never overwrite reviewed/published material, including a publication during generation.
      const current = await database(`daily_materials?course_id=eq.${encodeURIComponent(course.id)}&material_date=eq.${date}&select=id,status`);
      if (current?.[0]) {
        if (!improveCourse || current[0].status !== 'draft') return { courseId: course.id, status: current[0].status };
        const updated = await database(`daily_materials?id=eq.${encodeURIComponent(current[0].id)}&status=eq.draft&material_date=eq.${date}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(row) });
        if (!updated?.length) return { courseId: course.id, status: 'unchanged' };
      }
      else {
        await database('daily_materials?on_conflict=course_id,material_date', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify(row) });
      }
      return { courseId: course.id, status: 'draft', created: true };
    }));
    const failures = results.flatMap((result, index) => result.status === 'rejected' ? [courses[index].title] : []);
    const failureDetails = results.flatMap((result, index) => result.status === 'rejected' ? [{ course: courses[index].title, ...failure(result.reason) }] : []);
    failureDetails.forEach(detail => console.error('daily-material-generation', { course: detail.course, code: detail.code }));
    const courseStatus = COURSES_DATA.filter(course => isCourseOpenForEnrollment(course) && enrolled.has(course.id)).map(course => {
      const saved = (existing || []).find((row: any) => row.course_id === course.id);
      const index = courses.findIndex(item => item.id === course.id);
      const result = results[index];
      return { course: course.title, status: saved?.status || (result?.status === 'fulfilled' ? result.value.status : result?.status === 'rejected' ? 'failed' : 'pending') };
    });
    return res.status(failures.length ? 503 : 200).json({ success: !failures.length, date, drafts: results.filter(result => result.status === 'fulfilled' && 'created' in result.value && result.value.created).length, awaitingReview: true, remaining: Math.max(0, pending.length - courses.length), failures, failureDetails, courseStatus });
  } catch (error) {
    const detail = failure(error);
    console.error('daily-material-generation', { code: detail.code });
    return res.status(503).json({ error: detail.message, code: detail.code });
  }
}
