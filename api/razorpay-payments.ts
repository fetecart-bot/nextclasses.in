type ApiRequest = { method?: string; headers: Record<string, string | string[] | undefined> };
type ApiResponse = { status: (code: number) => ApiResponse; json: (body: unknown) => void };

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const adminKey = process.env.ADMIN_API_KEY;
  const suppliedKey = req.headers['x-admin-key'];
  if (!adminKey || suppliedKey !== adminKey) {
    return res.status(401).json({ error: 'Admin authorization failed. Check ADMIN_API_KEY.' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return res.status(503).json({ error: 'Razorpay server keys are not configured.' });
  }

  try {
    const from = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const result = await fetch(`https://api.razorpay.com/v1/payments?from=${from}&count=100`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!result.ok) return res.status(502).json({ error: 'Razorpay rejected the server credentials.' });
    const data: any = await result.json();
    const payments = (data.items || [])
      .filter((payment: any) => payment.status === 'captured')
      .map((payment: any) => ({
        id: payment.id,
        amount: Number(payment.amount || 0) / 100,
        method: payment.method,
        email: payment.email || payment.notes?.studentEmail || '',
        phone: payment.contact || payment.notes?.studentPhone || '',
        studentName: payment.notes?.studentName || '',
        courseId: payment.notes?.courseId || '',
        courseTitle: payment.notes?.courseTitle || '',
        createdAt: new Date(Number(payment.created_at) * 1000).toISOString(),
      }));
    return res.status(200).json({ payments });
  } catch {
    return res.status(500).json({ error: 'Could not connect to Razorpay.' });
  }
}
