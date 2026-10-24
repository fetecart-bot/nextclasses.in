import { isCourseOpenForEnrollment } from '../src/cataloguePolicy.js';
import { COURSES_DATA } from '../src/data.js';

export function courseKnowledgeBase(assignedCourseId?: string) {
  return COURSES_DATA.filter(course => isCourseOpenForEnrollment(course) || course.id === assignedCourseId).map((course) => {
    const modules = course.curriculum
      .map((module) => `${module.title}: ${module.lessons.slice(0, 3).join('; ')}`)
      .join(' | ');
    return [
      `ID: ${course.id}`,
      `Availability: ${isCourseOpenForEnrollment(course) ? 'Open for enquiry/enrolment; tuition trial and monthly terms are shown on website' : 'Existing enrolments only; not offered to new students'}`,
      `Title: ${course.title}`,
      `Overview: ${course.subtitle}`,
      `Price: INR ${course.price}${course.id.startsWith('course-cbse-class-') ? ' per month after the 30-day trial, all offered subjects, five daily mentor questions; no automatic charge' : '; check current website terms'}`,
      `Official syllabus/notifications: ${course.officialSyllabusUrl || "Check the exam authority"}`,
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
