import { credentialsFor, recentCapturedPayments } from './_razorpay.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const identifier = String(req.body?.identifier || '').trim().toLowerCase();
  const password = String(req.body?.password || '').trim();
  if (!identifier || !password) return res.status(400).json({ error: 'Credentials required' });
  try {
    const payments = await recentCapturedPayments();
    for (const payment of payments) {
      const account = credentialsFor(payment);
      const phone = account.phone.replace(/[^0-9]/g, '');
      if ((account.username.toLowerCase() === identifier || account.email === identifier || (phone.length >= 10 && phone.endsWith(identifier.replace(/[^0-9]/g, '')))) && account.password === password) {
        return res.status(200).json({ account });
      }
    }
    return res.status(401).json({ error: 'Invalid Username/Email or Password.' });
  } catch (error: any) {
    return res.status(503).json({ error: error.message || 'Login service unavailable' });
  }
}
