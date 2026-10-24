// Availability for new enrolment only. Keep historical course data for students.
export function isCourseOpenForEnrollment(course: { id: string }): boolean {
  return new Set([
    'course-chatgpt-6-openai',
    'course-english-speaking', 'course-french-speaking',
    'course-german-speaking', 'course-public-speaking-articulation',
    'course-aissee-sainik-6', 'course-aissee-sainik-9',
    'course-navodaya-jnvst', 'course-rms',
  ]).has(course.id) || /^course-cbse-class-(?:[5-9]|1[0-2])$/.test(course.id);
}
