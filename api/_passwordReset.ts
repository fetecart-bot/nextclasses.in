import crypto from 'node:crypto';
import { passwordHash, supabaseRequest } from './_supabase.js';
const requests = new Map<string, number>();
const message = 'If this email has an active account, a password reset link has been sent. Check your inbox and spam folder. Wait a minute before requesting another link.';
function signature(payload: string, hash: string, secret: string) { return crypto.createHmac('sha256', secret).update(`student-reset:${payload}:${hash}`).digest('base64url'); }
export default async function passwordReset(req: any, res: any) {
 res.setHeader('Cache-Control', 'no-store');
 const secret = process.env.CREDENTIAL_SECRET || process.env.RAZORPAY_KEY_SECRET;
 if (!secret || !process.env.RESEND_API_KEY) return res.status(503).json({error:'Password recovery is temporarily unavailable. Please contact +91 8792134951.'});
 try {
  if (req.body?.action === 'request-password-reset') {
   const email = String(req.body.email || '').trim().toLowerCase();
   if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({error:'Enter your registered email address.'});
   const now = Date.now();
   for (const [key, time] of requests) if (time < now - 60000) requests.delete(key);
   if (requests.has(email)) return res.status(200).json({message});
   requests.set(email, now);
   // A persistent global email budget bounds cost across serverless workers.
   if (await supabaseRequest('rpc/reserve_trial_email_slot', {method:'POST',body:'{}'}) !== true) return res.status(503).json({error:'Email recovery is busy. Please try again later or contact support.'});
   const rows = await supabaseRequest(`students?email=eq.${encodeURIComponent(email)}&active=eq.true&select=id,email,password_hash&limit=1`);
   const student = rows?.[0];
   if (student?.password_hash) {
    const payload = Buffer.from(JSON.stringify({id:student.id, exp:now + 15 * 60000, nonce:crypto.randomBytes(16).toString('hex')})).toString('base64url');
    const token = `${payload}.${signature(payload, student.password_hash, secret)}`;
    // Fragment prevents the reset token appearing in server access logs/referrers.
    const link = `https://www.nextclasses.in/student-app#reset=${token}`;
    const result = await fetch('https://api.resend.com/emails', {method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:'NextClasses <study@nextclasses.in>',to:[student.email],subject:'Reset your NextClasses password',text:`Use this private link to choose a new password:\n${link}\n\nIt expires in 15 minutes and can only be used once. If you did not request this, ignore this email. Your password remains unchanged. Never share this link.`}),signal:AbortSignal.timeout(15000)});
    if (!result.ok) throw new Error('mail');
   }
   return res.status(200).json({message});
  }
  const token = String(req.body?.token || ''), password = String(req.body?.password || '');
  if (token.length > 2000 || password.length < 12 || password.length > 128 || password.trim() !== password) return res.status(400).json({error:'Choose a password of 12–128 characters without spaces at the ends.'});
  const [payload, supplied, extra] = token.split('.');
  let data: any; try { data = JSON.parse(Buffer.from(payload, 'base64url').toString()); } catch { return res.status(400).json({error:'This link is invalid or expired. Request a new one.'}); }
  if (extra || !supplied || typeof data.id !== 'string' || !Number.isFinite(data.exp) || data.exp < Date.now() || data.exp > Date.now() + 15 * 60000) return res.status(400).json({error:'This link is invalid or expired. Request a new one.'});
  const rows = await supabaseRequest(`students?id=eq.${encodeURIComponent(data.id)}&active=eq.true&select=id,password_hash&limit=1`);
  const student = rows?.[0];
  const expected = student?.password_hash ? signature(payload, student.password_hash, secret) : '';
  if (!expected || expected.length !== supplied.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) return res.status(400).json({error:'This link is invalid or expired. Request a new one.'});
  const nextHash = passwordHash(password);
  if (nextHash === student.password_hash) return res.status(400).json({error:'Choose a different password from your current password.'});
  const changed = await supabaseRequest(`students?id=eq.${encodeURIComponent(student.id)}&password_hash=eq.${encodeURIComponent(student.password_hash)}`, {method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({password_hash:nextHash})});
  if (!changed?.length) return res.status(400).json({error:'This link has already been used. Request a new one.'});
  return res.status(200).json({message:'Password changed. Sign in using your new password.'});
 } catch { return res.status(503).json({error:'Password recovery could not be completed. Please try again shortly.'}); }
}
