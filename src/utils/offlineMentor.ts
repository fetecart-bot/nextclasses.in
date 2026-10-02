import { COURSES_DATA } from '../data';

export interface OfflineCoursePack {
  version: number;
  savedAt: string;
  courseId: string;
  courseTitle: string;
  overview: string;
  sections: Array<{ title: string; content: string }>;
}

const PACK_VERSION = 1;
const packKey = (courseId: string) => `nextclasses_offline_course_${courseId}_v${PACK_VERSION}`;
export const historyKey = (courseId: string) => `nextclasses_offline_mentor_history_${courseId}`;

export function saveOfflineCoursePack(courseId: string): OfflineCoursePack | null {
  const course = COURSES_DATA.find((item) => item.id === courseId);
  if (!course) return null;
  const sections = [
    { title: 'Course overview', content: course.subtitle },
    { title: 'Learning outcomes', content: course.highlights.join('. ') },
    { title: 'Tools and subjects', content: [...(course.toolsCovered || []), ...(course.subjects || [])].join(', ') },
    ...course.curriculum.map((module) => ({
      title: `Module ${module.moduleNumber}: ${module.title}`,
      content: module.lessons.join('. '),
    })),
    { title: 'Who this course is for', content: course.targetAudience.join('. ') },
  ];
  const pack: OfflineCoursePack = {
    version: PACK_VERSION,
    savedAt: new Date().toISOString(),
    courseId: course.id,
    courseTitle: course.title,
    overview: course.subtitle,
    sections,
  };
  try {
    localStorage.setItem(packKey(courseId), JSON.stringify(pack));
    return pack;
  } catch {
    return null;
  }
}

export function getOfflineCoursePack(courseId: string): OfflineCoursePack | null {
  try {
    const raw = localStorage.getItem(packKey(courseId));
    return raw ? JSON.parse(raw) : saveOfflineCoursePack(courseId);
  } catch {
    return null;
  }
}

function tokens(text: string) {
  return [...new Set(text.toLowerCase().replace(/[^a-z0-9\u0900-\u0d7f ]/g, ' ').split(/\s+/).filter((word) => word.length > 2))];
}

export function answerFromOfflinePack(courseId: string, question: string) {
  const pack = getOfflineCoursePack(courseId);
  if (!pack) return null;
  const queryTokens = tokens(question);
  const ranked = pack.sections
    .map((section) => {
      const searchable = `${section.title} ${section.content}`.toLowerCase();
      const score = queryTokens.reduce((total, token) => total + (searchable.includes(token) ? 1 : 0), 0);
      return { ...section, score };
    })
    .sort((a, b) => b.score - a.score);
  const useful = ranked.filter((item) => item.score > 0).slice(0, 3);
  const selected = useful.length ? useful : ranked.slice(0, 2);
  const explanation = selected.map((item) => `**${item.title}**\n${item.content}`).join('\n\n');
  const limited = useful.length === 0;
  return {
    writtenAnswer: `### Offline Course Assistant\n\n${explanation}\n\n${limited ? 'This question is not covered directly in the downloaded course pack. Reconnect for the full AI Mentor and broader knowledge.' : 'Try explaining the main idea in your own words, then practise the related lesson from this module.'}`,
    spokenScript: limited
      ? `I found the closest material in your downloaded ${pack.courseTitle} course pack. This question needs the online AI mentor for a broader answer.`
      : `I found this in your downloaded ${pack.courseTitle} course pack. ${selected[0].title}. ${selected[0].content.slice(0, 420)}`,
    keyTakeaway: limited ? 'Reconnect for the full AI Mentor.' : selected[0].title,
  };
}
