import { passwordHash, supabaseRequest } from './_supabase.js';

export async function requireStudentCourse(req: any, res: any) {
  const identifier = String(req.body?.identifier || '').trim().toLowerCase().slice(0, 200);
  const password = String(req.body?.password || '');
  const courseId = String(req.body?.courseId || '').trim().slice(0, 200);
  if (!identifier || !password || !courseId) { res.status(401).json({ error: 'Please sign in to use your course mentor.' }); return null; }
  try {
    const encoded = encodeURIComponent(identifier);
    const pattern = encodeURIComponent(identifier.replace(/([\\%_*])/g, '\\$1'));
    const students = await supabaseRequest(`students?or=(username.ilike.${pattern},email.eq.${encoded})&limit=1`);
    const student = students?.[0];
    if (!student?.active || student.password_hash !== passwordHash(password)) { res.status(401).json({ error: 'Please sign in again.' }); return null; }
    const rows = await supabaseRequest(`enrollments?student_id=eq.${encodeURIComponent(student.id)}&course_id=eq.${encodeURIComponent(courseId)}&select=course_id,course_title&limit=1`);
    if (!rows?.[0]) { res.status(403).json({ error: 'This course is not assigned to your account.' }); return null; }
    return { studentId: student.id, courseId: rows[0].course_id, courseTitle: rows[0].course_title };
  } catch { res.status(503).json({ error: 'Course access could not be verified. Please try again shortly.' }); return null; }
}
