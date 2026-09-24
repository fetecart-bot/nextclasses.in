import { COURSES_DATA } from '../data';

export interface DailyStudyMaterial {
  id: string;
  date: string;
  courseId: string;
  courseTitle: string;
  title: string;
  focus: string;
  lesson: string[];
  practice: string[];
  answers: string[];
  estimatedMinutes: number;
}

const TOPICS: Record<string, Array<{ title: string; focus: string; lesson: string[]; practice: string[]; answers: string[] }>> = {
  speaking: [
    { title: 'Clear Speech and Confident Delivery', focus: 'Pace, pause, emphasis and audience connection', lesson: ['Speak at a steady pace and pause after each main idea.', 'Stress the key word in every sentence.', 'Look at one listener for a complete thought before moving to another.'], practice: ['Read a news paragraph aloud in 60 seconds, then repeat it in 45 seconds without losing clarity.', 'Record a 90-second introduction using three deliberate pauses.', 'Rewrite “Our plan is good” with a specific benefit and measurable result.'], answers: ['Self-check: every word remains understandable.', 'Three pauses should separate opening, evidence and conclusion.', 'Example: “Our plan reduces waiting time by 20 minutes.”'] },
    { title: 'Persuasive Speaking Framework', focus: 'Claim, evidence and action', lesson: ['Begin with one clear claim.', 'Support it with an example, fact or short story.', 'Finish with one action the listener can take.'], practice: ['Prepare a two-minute speech encouraging daily reading.', 'Mark the claim, evidence and action in your script.', 'Deliver it once without reading.'], answers: ['A valid response contains all three parts.', 'Evidence must directly support the claim.', 'The action should be specific and realistic.'] },
  ],
  exam: [
    { title: 'Speed and Accuracy Drill', focus: 'Careful reading, elimination and timed practice', lesson: ['Read the final instruction before solving.', 'Eliminate clearly incorrect options first.', 'Mark difficult questions and return after completing easier ones.'], practice: ['Solve 12 mixed questions in 15 minutes.', 'Write why each rejected option is wrong for three questions.', 'Review every calculation and unit.'], answers: ['Target at least 10 correct answers.', 'Each elimination needs a factual or calculation-based reason.', 'Correct any unit or sign errors before submission.'] },
    { title: 'Revision and Recall Practice', focus: 'Active recall and error correction', lesson: ['Close the book before recalling the main points.', 'Use short questions instead of rereading entire chapters.', 'Keep an error log and retry mistakes after one day.'], practice: ['Write ten facts or formulas from memory.', 'Create five one-line questions from today’s chapter.', 'Retry yesterday’s three hardest questions.'], answers: ['Compare recall with the source and correct omissions.', 'Questions should test one idea each.', 'Record the corrected method in the error log.'] },
  ],
  ai: [
    { title: 'Prompt Design Lab', focus: 'Goal, context, constraints and output format', lesson: ['State the task as a clear verb and result.', 'Provide only the context needed to complete it.', 'Specify length, format and quality checks.'], practice: ['Write a prompt that turns notes into five flashcards.', 'Add a rule requiring the model to identify uncertain claims.', 'Ask for the result as a Markdown table.'], answers: ['The prompt includes task, source notes and number of cards.', 'It asks the model to label or verify uncertainty.', 'The requested columns are explicitly named.'] },
    { title: 'AI Output Verification', focus: 'Accuracy, sources and human review', lesson: ['Treat generated facts as drafts until verified.', 'Check important claims against reliable primary sources.', 'Test code and calculations with known examples.'], practice: ['Highlight three factual claims in an AI answer.', 'List a suitable primary source for each claim.', 'Create one test case that could reveal an error.'], answers: ['Claims must be independently checkable.', 'Prefer official documentation or original data.', 'A useful test has a known expected result.'] },
  ],
  language: [
    { title: 'Daily Language Fluency', focus: 'Useful vocabulary, sentence building and speaking', lesson: ['Learn words inside complete sentences.', 'Repeat short phrases aloud with natural rhythm.', 'Use the new words in a personal situation.'], practice: ['Write five sentences about your daily routine.', 'Read them aloud twice without stopping.', 'Change each sentence from present to past tense.'], answers: ['Each sentence needs a subject and a verb.', 'The second reading should be smoother.', 'Check the verb form and time marker.'] },
  ],
};

function categoryFor(courseId: string, title: string): keyof typeof TOPICS {
  const text = `${courseId} ${title}`.toLowerCase();
  if (/speaking|articulation|communication/.test(text)) return 'speaking';
  if (/french|german|language|english/.test(text)) return 'language';
  if (/neet|jee|keam|aissee|sainik|navodaya|exam/.test(text)) return 'exam';
  return 'ai';
}

export function getDailyStudyMaterial(courseId: string, date = new Date()): DailyStudyMaterial {
  const course = COURSES_DATA.find((item) => item.id === courseId);
  const courseTitle = course?.title || 'Nextclasses Course';
  const dateKey = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const dayNumber = Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / 86400000);
  const topics = TOPICS[categoryFor(courseId, courseTitle)];
  const topic = topics[Math.abs(dayNumber) % topics.length];
  return { id: `${courseId}-${dateKey}`, date: dateKey, courseId, courseTitle, ...topic, estimatedMinutes: 30 };
}

export function downloadDailyStudyMaterial(material: DailyStudyMaterial, studentName = 'Student') {
  const list = (items: string[], ordered = false) => `<${ordered ? 'ol' : 'ul'}>${items.map((item) => `<li>${item}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${material.title}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;line-height:1.55;color:#172033}h1{color:#ea580c}section{margin:24px 0;padding:18px;border:1px solid #ddd;border-radius:12px}.meta{color:#64748b}@media print{body{margin:20px}}</style></head><body><h1>${material.title}</h1><p class="meta">${material.courseTitle}<br>${material.date} • ${material.estimatedMinutes} minutes • Prepared for ${studentName}</p><section><h2>Today’s focus</h2><p>${material.focus}</p>${list(material.lesson)}</section><section><h2>Practice</h2>${list(material.practice, true)}</section><section><h2>Answer guide</h2>${list(material.answers, true)}</section><p>Nextclasses.in • Review your answers before moving to the next lesson.</p></body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `nextclasses-daily-${material.courseId}-${material.date}.html`;
  link.click();
  URL.revokeObjectURL(url);
}
