import crypto from 'node:crypto';

export function credentialsFor(payment: any) {
  const email = String(payment.email || payment.notes?.studentEmail || '').toLowerCase();
  const name = String(payment.notes?.studentName || email.split('@')[0] || 'Student');
  const courseId = String(payment.notes?.courseId || 'course-unassigned');
  const courseTitle = String(payment.notes?.courseTitle || 'Nextclasses course');
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
    enrolledCourseIds: [courseId],
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
