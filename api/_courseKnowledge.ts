import { COURSES_DATA } from '../src/data.js';

export function courseKnowledgeBase() {
  return COURSES_DATA.map((course) => {
    const modules = course.curriculum
      .map((module) => `${module.title}: ${module.lessons.slice(0, 3).join('; ')}`)
      .join(' | ');
    return [
      `ID: ${course.id}`,
      `Title: ${course.title}`,
      `Overview: ${course.subtitle}`,
      `Level/Language: ${course.level}; ${course.language}`,
      `Highlights: ${course.highlights.slice(0, 5).join('; ')}`,
      `Tools/Subjects: ${[...(course.toolsCovered || []), ...(course.subjects || [])].join('; ')}`,
      `Curriculum: ${modules}`,
    ].join('\n');
  }).join('\n\n---\n\n');
}

export function mentorModels() {
  return [...new Set([
    process.env.OPENAI_MENTOR_MODEL,
    'gpt-5.4-mini',
    'gpt-4o-mini',
  ].filter(Boolean))] as string[];
}
