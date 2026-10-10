import crypto from 'node:crypto';
import { passwordHash, supabaseRequest } from './_supabase.js';

export async function reportMentorAnswer(req: any, res: any) {
  const identifier = String(req.body?.identifier || '').trim().toLowerCase().slice(0, 200);
  const password = String(req.body?.password || '').slice(0, 200);
  const courseId = String(req.body?.courseId || '').trim().slice(0, 200);
  const answer = String(req.body?.answer || '').trim().slice(0, 6000);
  const question = String(req.body?.question || '').trim().slice(0, 2000);
  const exchangeId = String(req.body?.exchangeId || '').trim().slice(0, 100);
  if (!identifier || !password || !courseId || !answer || !exchangeId) return res.status(400).json({ error: 'Sign in and choose an answer to report.' });
  try {
    const encoded = encodeURIComponent(identifier);
    const usernamePattern = encodeURIComponent(identifier.replace(/([\\%_*])/g, '\\$1'));
    const students = await supabaseRequest(`students?or=(username.ilike.${usernamePattern},email.eq.${encoded})&active=eq.true&select=id,password_hash&limit=1`);
    const student = students?.[0];
    if (!student || student.password_hash !== passwordHash(password)) return res.status(401).json({ error: 'Please sign in again before reporting.' });
    const enrollments = await supabaseRequest(`enrollments?student_id=eq.${encodeURIComponent(student.id)}&course_id=eq.${encodeURIComponent(courseId)}&select=course_id&limit=1`);
    if (!enrollments?.length) return res.status(403).json({ error: 'Course access could not be verified.' });
    if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'Reporting is temporarily unavailable. Please try again later.' });
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.createHash('sha256').update(`${student.id}:${courseId}:${exchangeId}`).digest('hex'),
      },
      body: JSON.stringify({
        from: 'NextClasses <study@nextclasses.in>', to: ['fetecart@gmail.com'],
        subject: 'NextClasses AI answer reported for review',
        text: `Student reference: ${student.id}\nCourse: ${courseId}\nAnswer reference: ${exchangeId}\n\nQuestion:\n${question}\n\nReported answer:\n${answer}\n\nReview this report and update teaching content or safeguards as appropriate. This report is private and must not be published.`,
      }),
    });
    if (!response.ok) throw new Error('Report delivery failed');
    return res.status(200).json({ message: 'Report sent to NextClasses for review.' });
  } catch (error) {
    console.error('Mentor report could not be delivered');
    return res.status(503).json({ error: 'Your report was not sent. Please try again later.' });
  }
}
