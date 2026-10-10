import crypto from 'node:crypto';
import { sendEnrollmentEmail } from './_enrollmentEmail.js';
import { credentialsFor, paymentWithOrderNotes } from './_razorpay.js';
import { saveStudentAndEnrollment, supabaseRequest } from './_supabase.js';

export const config = { api: { bodyParser: false } };

async function readBody(req: any) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return res.status(503).json({ error: 'Webhook secret missing' });
  const raw = await readBody(req);
  const expected = crypto.createHmac('sha256', webhookSecret).update(raw).digest('hex');
  const supplied = String(req.headers['x-razorpay-signature'] || '');
  if (!supplied || supplied.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  let event: any;
  try { event = JSON.parse(raw.toString('utf8')); } catch { return res.status(400).json({ error: 'Invalid event JSON' }); }
  if (event.event !== 'payment.captured') return res.status(200).json({ ignored: true });
  let payment = event.payload?.payment?.entity;
  if (!payment?.id || payment.status !== 'captured') return res.status(400).json({ error: 'Invalid captured payment' });
  try { payment = await paymentWithOrderNotes(payment); } catch { return res.status(503).json({ error: 'Order verification pending. Retry delivery.' }); }
  const account = credentialsFor(payment);
  let student: any;
  try {
    student = await saveStudentAndEnrollment(account, payment, { preserveExisting: true });
  } catch (error) {
    console.error('Supabase enrollment sync failed', error);
    return res.status(503).json({ error: 'Enrollment could not be saved. Retry delivery.' });
  }

  try { await sendEnrollmentEmail(account, payment, student); } catch { return res.status(503).json({ error: 'Email delivery pending. Retry delivery.' }); }

  // Proactive WhatsApp delivery requires an approved utility template. Do not
  // send credentials as an unchecked freeform message outside its session.
  const token = process.env.WHATSAPP_API_KEY;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const template = process.env.WHATSAPP_ENROLLMENT_TEMPLATE;
  const phone = account.phone.replace(/[^0-9]/g, '');
  const reference = `enrollment-notice:${payment.id}`;
  const prior = await supabaseRequest(`delivery_logs?student_id=eq.${encodeURIComponent(student.id)}&channel=eq.whatsapp&status=eq.sent&provider_reference=eq.${encodeURIComponent(reference)}&limit=1`);
  if (!prior?.length) {
    let status = 'skipped';
    if (token && phoneId && template && phone && student.active) {
      const response = await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: phone, type: 'template',
          template: { name: template, language: { code: process.env.WHATSAPP_ENROLLMENT_TEMPLATE_LANGUAGE || 'en' } } }),
        signal: AbortSignal.timeout(20000),
      }).catch(() => null);
      status = response?.ok ? 'sent' : 'failed';
    }
    await supabaseRequest('delivery_logs', { method: 'POST', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ student_id: student.id, channel: 'whatsapp', status, provider_reference: reference }) }).catch(() => {});
  }
  return res.status(200).json({ success: true });
}
