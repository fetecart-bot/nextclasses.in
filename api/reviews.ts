import crypto from 'node:crypto';
import { passwordHash, supabaseRequest } from './_supabase.js';

function adminAuthorized(req: any) {
  const supplied = Buffer.from(String(req.headers['x-admin-key'] || ''));
  const expected = Buffer.from(String(process.env.ADMIN_API_KEY || ''));
  return expected.length > 0 && supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

function clean(value: unknown, max = 1000) {
  return String(value || '').trim().slice(0, max);
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      if (String(req.query?.admin || '') === 'true') {
        if (!adminAuthorized(req)) return res.status(401).json({ error: 'Admin access required' });
        const reviews = await supabaseRequest('student_reviews?select=*&order=created_at.desc&limit=200');
        return res.status(200).json({ reviews: reviews || [] });
      }

      const reviews = await supabaseRequest(
        'student_reviews?status=eq.published&consent_to_publish=eq.true&select=id,display_name,course_title,rating,review_text,published_at&order=published_at.desc&limit=50'
      );
      return res.status(200).json({ reviews: reviews || [] });
    }

    if (req.method === 'POST') {
      const identifier = clean(req.body?.identifier, 200).toLowerCase();
      const password = clean(req.body?.password, 200);
      const courseId = clean(req.body?.courseId, 200);
      const rating = Number(req.body?.rating);
      const reviewText = clean(req.body?.reviewText, 1000);
      const consent = req.body?.consentToPublish === true;

      if (!identifier || !password || !courseId) return res.status(400).json({ error: 'Student login and course are required' });
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Choose a rating from 1 to 5 stars' });
      if (reviewText.length < 20) return res.status(400).json({ error: 'Please write at least 20 characters' });
      if (!consent) return res.status(400).json({ error: 'Permission to publish is required' });

      const encoded = encodeURIComponent(identifier);
      const students = await supabaseRequest(`students?or=(username.eq.${encoded},email.eq.${encoded})&active=eq.true&select=id,name,password_hash&limit=1`);
      const student = students?.[0];
      if (!student || student.password_hash !== passwordHash(password)) return res.status(401).json({ error: 'Student login could not be verified' });

      const enrollments = await supabaseRequest(
        `enrollments?student_id=eq.${encodeURIComponent(student.id)}&course_id=eq.${encodeURIComponent(courseId)}&select=course_id,course_title&limit=1`
      );
      const enrollment = enrollments?.[0];
      if (!enrollment) return res.status(403).json({ error: 'Only enrolled students can review this course' });

      const reviews = await supabaseRequest('student_reviews?on_conflict=student_id,course_id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({
          student_id: student.id,
          course_id: enrollment.course_id,
          course_title: enrollment.course_title,
          display_name: student.name,
          rating,
          review_text: reviewText,
          consent_to_publish: true,
          status: 'pending',
          admin_note: null,
          reviewed_at: null,
          published_at: null,
          updated_at: new Date().toISOString(),
        }),
      });
      return res.status(200).json({ review: reviews?.[0], message: 'Thank you. Your review was sent for approval.' });
    }

    if (req.method === 'PATCH') {
      if (!adminAuthorized(req)) return res.status(401).json({ error: 'Admin access required' });
      const id = clean(req.body?.id, 100);
      const status = clean(req.body?.status, 20);
      if (!id || !['published', 'rejected'].includes(status)) return res.status(400).json({ error: 'Review and valid status are required' });
      const now = new Date().toISOString();
      const reviews = await supabaseRequest(`student_reviews?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          status,
          admin_note: clean(req.body?.adminNote, 500) || null,
          reviewed_at: now,
          published_at: status === 'published' ? now : null,
          updated_at: now,
        }),
      });
      return res.status(200).json({ review: reviews?.[0] });
    }

    res.setHeader('Allow', 'GET, POST, PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Reviews API error:', error);
    return res.status(500).json({ error: error?.message || 'Unable to process reviews' });
  }
}
