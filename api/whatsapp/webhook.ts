import crypto from 'node:crypto';
import socialWebhook from '../_metaWebhook.js';
import { supabaseRequest } from '../_supabase.js';
import { courseAssistantAnswer } from '../_socialAssistant.js';

export const config = { api: { bodyParser: false } };

function same(a: string, b: string) {
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}


export default async function handler(req: any, res: any) {
  if (req.query?.channel === 'meta') return socialWebhook(req, res);
  if (req.method === 'GET') {
    const token = process.env.WHATSAPP_VERIFY_TOKEN || '';
    if (!token) return res.status(503).send('WhatsApp verification is not configured');
    if (req.query?.['hub.mode'] === 'subscribe' && same(String(req.query?.['hub.verify_token'] || ''), token)) {
      return res.status(200).send(String(req.query?.['hub.challenge'] || ''));
    }
    return res.status(403).send('Verification failed');
  }
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  const secret = process.env.WHATSAPP_APP_SECRET;
  const accessToken = process.env.WHATSAPP_API_KEY;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!secret || !accessToken || !phoneId) return res.status(503).send('WhatsApp is not configured');
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += Buffer.byteLength(chunk);
    if (size > 1000000) return res.status(413).send('Payload too large');
    chunks.push(Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks);
  const signature = `sha256=${crypto.createHmac('sha256', secret).update(raw).digest('hex')}`;
  if (!same(String(req.headers['x-hub-signature-256'] || ''), signature)) return res.status(401).send('Invalid signature');
  let event: any;
  try { event = JSON.parse(raw.toString('utf8')); } catch { return res.status(400).send('Invalid payload'); }
  if (event.object !== 'whatsapp_business_account') return res.status(200).json({ ignored: true });
  let stage = 'database-claim';
  try {
    for (const entry of event.entry || []) for (const change of entry.changes || []) {
      const value = change.value || {};
      if (String(value.metadata?.phone_number_id || '') !== phoneId) continue;
      for (const message of value.messages || []) {
        if (!message.id || !/^\d{7,16}$/.test(String(message.from || ''))) continue;
        // The unique message ID prevents Meta retries from producing duplicate replies.
        stage = 'database-claim';
        let claimed = await supabaseRequest('whatsapp_bot_messages?on_conflict=message_id', {
          method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
          body: JSON.stringify({ message_id: message.id, status: 'processing' }),
        });
        if (!claimed?.length) {
          claimed = await supabaseRequest(`whatsapp_bot_messages?message_id=eq.${encodeURIComponent(message.id)}&status=eq.failed`, {
            method: 'PATCH', headers: { Prefer: 'return=representation' },
            body: JSON.stringify({ status: 'processing', updated_at: new Date().toISOString() }),
          });
          if (!claimed?.length) continue;
        }
        let reply = 'Please send your question as a text message. I can help with NextClasses courses and study doubts.';
        if (message.type === 'text' && message.text?.body) {
          try { reply = await courseAssistantAnswer(String(message.text.body), 'WhatsApp'); }
          catch { reply = 'The AI assistant is temporarily unavailable. Please try again shortly or visit https://www.nextclasses.in for course details.'; }
        }
        stage = 'whatsapp-send';
        let sent: Response;
        try { sent = await fetch(`https://graph.facebook.com/v22.0/${encodeURIComponent(phoneId)}/messages`, {
          method: 'POST', signal: AbortSignal.timeout(10000),
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ messaging_product: 'whatsapp', to: message.from, type: 'text', text: { body: reply } }),
        }); } catch {
          await supabaseRequest(`whatsapp_bot_messages?message_id=eq.${encodeURIComponent(message.id)}`, {
            method: 'PATCH', body: JSON.stringify({ status: 'failed', updated_at: new Date().toISOString() }),
          });
          throw new Error('WhatsApp delivery failed');
        }
        if (!sent.ok) {
          const detail: any = await sent.json().catch(() => ({}));
          console.error('WhatsApp delivery rejected', { status: sent.status, code: detail.error?.code, subcode: detail.error?.error_subcode, reason: String(detail.error?.message || '').slice(0, 300) });
          if (detail.error?.code === 200) {
            const check = await fetch('https://graph.facebook.com/v26.0/me/permissions', { headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(5000) });
            const granted: any = await check.json().catch(() => ({}));
            console.error('WhatsApp token scopes', { status: check.status, scopes: (granted.data || []).map((p: any) => ({ permission: p.permission, status: p.status })) });
          }
        }
        stage = 'database-result';
        await supabaseRequest(`whatsapp_bot_messages?message_id=eq.${encodeURIComponent(message.id)}`, {
          method: 'PATCH', body: JSON.stringify({ status: sent.ok ? 'sent' : 'failed', updated_at: new Date().toISOString() }),
        });
        if (!sent.ok) throw new Error('WhatsApp reply failed');
      }
    }
    return res.status(200).json({ received: true });
  } catch {
    console.error('WhatsApp processing failed', { stage });
    return res.status(500).send('Processing failed');
  }
}
