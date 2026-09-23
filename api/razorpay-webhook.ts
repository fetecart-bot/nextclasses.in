import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { credentialsFor } from './_razorpay.js';

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
  const event = JSON.parse(raw.toString('utf8'));
  if (event.event !== 'payment.captured') return res.status(200).json({ ignored: true });
  const payment = event.payload?.payment?.entity;
  const account = credentialsFor(payment);
  const portal = 'https://www.nextclasses.in/?portal=true';
  const message = `Hi ${account.name}, your Nextclasses payment is confirmed. Login: ${account.username} Password: ${account.password} Portal: ${portal}`;

  if (account.email && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com', port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transport.sendMail({ from: `Nextclasses <${process.env.SMTP_USER}>`, to: account.email, subject: 'Your Nextclasses student login', text: `${message}\nCourse: ${account.courseTitle}\nPayment: ${payment.id}` });
  }

  const token = process.env.WHATSAPP_API_KEY;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const phone = account.phone.replace(/[^0-9]/g, '');
  if (token && phoneId && phone) {
    await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: message } }),
    });
  }
  return res.status(200).json({ success: true });
}
