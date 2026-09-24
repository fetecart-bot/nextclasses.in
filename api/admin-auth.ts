import crypto from 'node:crypto';

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const supplied = String(req.body?.passcode || '').trim();
  const expected = String(process.env.ADMIN_API_KEY || '').trim();
  if (!supplied || !expected) return res.status(503).json({ error: 'Admin access is not configured' });
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  const valid = left.length === right.length && crypto.timingSafeEqual(left, right);
  return valid ? res.status(200).json({ ok: true }) : res.status(401).json({ error: 'Incorrect admin passcode' });
}
