import { COURSES_DATA } from '../src/data.js';
import crypto from 'node:crypto';

export function credentialsFor(payment: any) {
  const email = String(payment.email || payment.notes?.studentEmail || '').toLowerCase();
  const name = String(payment.notes?.studentName || email.split('@')[0] || 'Student');
  const courseId = String(payment.notes?.courseId || 'course-unassigned');
  const courseTitle = String(payment.notes?.courseTitle || 'Nextclasses course');
  let enrolledCourseIds = [courseId];
  try {
    const ids = JSON.parse(payment.notes?.courseIds || 'null');
    if (Array.isArray(ids) && ids.length && ids.every(id => typeof id === 'string' && COURSES_DATA.some(c => c.id === id))) enrolledCourseIds = [...new Set(ids)] as string[];
  } catch {}
  const courseTitles = Object.fromEntries(enrolledCourseIds.map(id => [id, COURSES_DATA.find(c => c.id === id)?.title || courseTitle]));
  const secret = process.env.CREDENTIAL_SECRET || process.env.RAZORPAY_KEY_SECRET || '';
  const digest = crypto.createHmac('sha256', secret).update(`${payment.id}:${email}`).digest('hex');
  const prefix = email.split('@')[0].replace(/[^a-z0-9]/g, '').slice(0, 10) || 'student';
  return {
    id: `student-${payment.id}`,
    name, email,
    phone: String(payment.contact || payment.notes?.studentPhone || ''),
    username: `nc_${prefix}_${String(payment.id).slice(-5)}`,
    password: `Nc@${digest.slice(0, 10)}`,
    courseId, courseTitle,
    enrolledCourseIds, courseTitles,
    registeredAt: new Date(Number(payment.created_at) * 1000).toISOString().slice(0, 10),
    paymentReference: payment.id,
  };
}

export async function recentCapturedPayments() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) throw new Error('Razorpay server keys are not configured');
  const from = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 180;
  const auth = Buffer.from(`${keyId}:${secret}`).toString('base64');
  const response = await fetch(`https://api.razorpay.com/v1/payments?from=${from}&count=100`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!response.ok) throw new Error('Razorpay authorization failed');
  const data: any = await response.json();
  return (data.items || []).filter((item: any) => item.status === 'captured');
}

export async function paymentWithOrderNotes(payment: any) {
  if (!payment.order_id) return payment;
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) throw new Error('Payment service is not configured');
  const response = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(payment.order_id)}`, { headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString('base64')}` }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error('Payment order could not be verified');
  const order: any = await response.json();
  if (order.notes?.checkoutVersion !== '2') return payment;
  if (order.amount !== payment.amount || order.currency !== payment.currency || order.status !== 'paid') throw new Error('Payment and order do not match');
  return { ...payment, notes: order.notes };
}
