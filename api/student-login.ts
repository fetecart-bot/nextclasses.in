import { credentialsFor, recentCapturedPayments } from './_razorpay.js';
import { passwordHash, supabaseRequest } from './_supabase.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const identifier = String(req.body?.identifier || '').trim().toLowerCase();
  const password = String(req.body?.password || '').trim();
  if (!identifier || !password) return res.status(400).json({ error: 'Credentials required' });
  try {
    // Supabase is authoritative after an administrator corrects a course.
    try {
      const encoded = encodeURIComponent(identifier);
      const students = await supabaseRequest(`students?or=(username.eq.${encoded},email.eq.${encoded})&active=eq.true&limit=1`);
      const student = students?.[0];
      if (student && student.password_hash === passwordHash(password)) {
        const enrollments = await supabaseRequest(`enrollments?student_id=eq.${encodeURIComponent(student.id)}&select=course_id,course_title&order=created_at.desc`);
        const enrolledCourseIds = (enrollments || []).map((item: any) => item.course_id).filter(Boolean);
        if (enrolledCourseIds.length) {
          return res.status(200).json({ account: {
            id: student.id, name: student.name, email: student.email,
            phone: student.phone || '', username: student.username,
            courseId: enrolledCourseIds[0],
            courseTitle: enrollments[0]?.course_title || 'Nextclasses course',
            enrolledCourseIds,
            registeredAt: String(student.created_at || new Date().toISOString()).slice(0, 10),
            paymentReference: student.payment_id,
          } });
        }
      }
    } catch (error) {
      console.error('Supabase student login lookup failed', error);
    }

    // Compatibility fallback for captured payments that have not synced yet.
    const payments = await recentCapturedPayments();
    for (const payment of payments) {
      const account = credentialsFor(payment);
      const phone = account.phone.replace(/[^0-9]/g, '');
      if ((account.username.toLowerCase() === identifier || account.email === identifier || (phone.length >= 10 && phone.endsWith(identifier.replace(/[^0-9]/g, '')))) && account.password === password) {
        return res.status(200).json({ account });
      }
    }
    return res.status(401).json({ error: 'Invalid Username/Email or Password.' });
  } catch (error: any) {
    return res.status(503).json({ error: error.message || 'Login service unavailable' });
  }
}
