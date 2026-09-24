import crypto from 'node:crypto';
import { passwordHash, supabaseRequest } from './_supabase.js';

function adminAuthorized(req: any) {
  const supplied = Buffer.from(String(req.headers['x-admin-key'] || ''));
  const expected = Buffer.from(String(process.env.ADMIN_API_KEY || ''));
  return expected.length > 0 && supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      if (!adminAuthorized(req)) return res.status(401).json({ error: 'Admin authorization failed' });
      const status = encodeURIComponent(String(req.query?.status || 'draft'));
      const rows = await supabaseRequest(`daily_materials?status=eq.${status}&order=material_date.desc,course_title.asc&limit=200`);
      return res.status(200).json({ materials: rows });
    }
    if (req.method === 'PATCH') {
      if (!adminAuthorized(req)) return res.status(401).json({ error: 'Admin authorization failed' });
      const id = String(req.body?.id || '');
      const status = String(req.body?.status || '');
      if (!id || !['approved', 'published', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid material update' });
      const now = new Date().toISOString();
      await supabaseRequest(`daily_materials?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status, reviewed_by: 'Nextclasses Admin', reviewed_at: now, ...(status === 'published' ? { published_at: now } : {}) }),
      });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'POST') {
      const identifier = String(req.body?.identifier || '').trim().toLowerCase();
      const password = String(req.body?.password || '').trim();
      const courseId = String(req.body?.courseId || '');
      if (!identifier || !password || !courseId) return res.status(400).json({ error: 'Login and course are required' });
      const encoded = encodeURIComponent(identifier);
      const students = await supabaseRequest(`students?or=(username.eq.${encoded},email.eq.${encoded})&active=eq.true&limit=1`);
      const student = students?.[0];
      if (!student || student.password_hash !== passwordHash(password)) return res.status(401).json({ error: 'Invalid student credentials' });
      const enrollments = await supabaseRequest(`enrollments?student_id=eq.${student.id}&course_id=eq.${encodeURIComponent(courseId)}&limit=1`);
      if (!enrollments?.length) return res.status(403).json({ error: 'This course is not enrolled' });
      const rows = await supabaseRequest(`daily_materials?course_id=eq.${encodeURIComponent(courseId)}&status=eq.published&order=material_date.desc&limit=30`);
      return res.status(200).json({ materials: rows });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(503).json({ error: error.message || 'Material service unavailable' });
  }
}
