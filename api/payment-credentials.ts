import crypto from 'node:crypto';
import { credentialsFor, recentCapturedPayments } from './_razorpay.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const supplied = String(req.headers['x-admin-key'] || '').trim();
  const expected = String(process.env.ADMIN_API_KEY || '').trim();
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  if (!expected || left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    return res.status(401).json({ error: 'Admin authorization failed' });
  }
  const paymentId = String(req.body?.paymentId || '');
  const courseId = String(req.body?.courseId || '');
  const courseTitle = String(req.body?.courseTitle || '');
  if (!paymentId.startsWith('pay_') || !courseId || courseId === 'course-unassigned') {
    return res.status(400).json({ error: 'Choose the correct course before generating credentials' });
  }
  try {
    const payment = (await recentCapturedPayments()).find((item: any) => item.id === paymentId);
    if (!payment) return res.status(404).json({ error: 'Captured Razorpay payment not found' });
    const account = { ...credentialsFor(payment), courseId, courseTitle, enrolledCourseIds: [courseId] };
    return res.status(200).json({ account });
  } catch (error: any) {
    return res.status(503).json({ error: error.message || 'Unable to create credentials' });
  }
}
