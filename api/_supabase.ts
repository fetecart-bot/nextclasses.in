import crypto from 'node:crypto';

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('Supabase is not configured');
  return { url: url.replace(/\/$/, ''), key };
}

export function passwordHash(password: string) {
  const secret = process.env.CREDENTIAL_SECRET || process.env.RAZORPAY_KEY_SECRET || '';
  return crypto.createHmac('sha256', secret).update(password).digest('hex');
}

export async function supabaseRequest(path: string, init: RequestInit = {}) {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || data?.error || `Supabase request failed (${response.status})`);
  return data;
}

export async function saveStudentAndEnrollment(account: any, payment: any) {
  const students = await supabaseRequest('students?on_conflict=payment_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({
      payment_id: payment.id,
      name: account.name,
      email: account.email,
      phone: account.phone,
      username: account.username,
      password_hash: passwordHash(account.password),
      active: true,
    }),
  });
  const student = students?.[0];
  if (!student) throw new Error('Student database record was not created');
  await supabaseRequest('enrollments?on_conflict=student_id,course_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      student_id: student.id,
      course_id: account.courseId,
      course_title: account.courseTitle,
      payment_amount: Number(payment.amount || 0) / 100,
    }),
  });
  return student;
}
