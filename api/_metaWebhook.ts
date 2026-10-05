import crypto from 'node:crypto';
import { supabaseRequest } from './_supabase.js';
import { courseAssistantAnswer } from './_socialAssistant.js';

export const config = { api: { bodyParser: false } };
function equal(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// A separate callback lets the existing WhatsApp connection remain operational.
// Only the explicitly configured business accounts may receive bot replies.
export function incomingMessages(event: any, now = Date.now()) {
  const channel = event.object === 'page' ? 'Facebook' : event.object === 'instagram' ? 'Instagram' : null;
  if (!channel) return [];
  const accountId = channel === 'Facebook' ? process.env.FACEBOOK_PAGE_ID : process.env.INSTAGRAM_ACCOUNT_ID;
  if (!accountId) return [];
  const messages: any[] = [];
  for (const entry of event.entry || []) {
    if (String(entry.id) !== accountId) continue;
    for (const item of entry.messaging || []) {
      const message = item.message;
      // Delivery/read events, echoes, deleted messages and our own messages must not loop.
      if (!message?.mid || message.is_echo || message.is_deleted || item.sender?.id === accountId) continue;
      if (String(item.recipient?.id) !== accountId || !/^\d+$/.test(String(item.sender?.id || ''))) continue;
      // Never answer an old replay outside the standard customer messaging window.
      if (!Number.isFinite(item.timestamp) || now - item.timestamp > 24 * 60 * 60 * 1000 || item.timestamp > now + 60000) continue;
      messages.push({ channel, accountId, sender: String(item.sender.id), id: `${channel}:${accountId}:${message.mid}`, text: String(message.text || '').slice(0, 2000) });
    }
  }
  return messages;
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const token = process.env.META_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || '';
    if (!token) return res.status(503).send('Verification is not configured');
    if (req.query?.['hub.mode'] === 'subscribe' && equal(String(req.query?.['hub.verify_token'] || ''), token)) return res.status(200).send(String(req.query?.['hub.challenge'] || ''));
    return res.status(403).send('Verification failed');
  }
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  const secret = process.env.META_APP_SECRET || process.env.WHATSAPP_APP_SECRET;
  if (!secret) return res.status(503).send('App is not configured');
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += Buffer.byteLength(chunk);
    if (size > 1000000) return res.status(413).send('Payload too large');
    chunks.push(Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks);
  if (!equal(String(req.headers['x-hub-signature-256'] || ''), `sha256=${crypto.createHmac('sha256', secret).update(raw).digest('hex')}`)) return res.status(401).send('Invalid signature');
  let event: any;
  try { event = JSON.parse(raw.toString('utf8')); } catch { return res.status(400).send('Invalid payload'); }
  try {
    for (const message of incomingMessages(event)) {
      const token = message.channel === 'Facebook' ? process.env.FACEBOOK_PAGE_ACCESS_TOKEN : process.env.INSTAGRAM_ACCESS_TOKEN;
      if (!token) throw new Error('Channel token missing');
      let claimed = await supabaseRequest('whatsapp_bot_messages?on_conflict=message_id', {
        method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify({ message_id: message.id, status: 'processing' }),
      });
      if (!claimed?.length) {
        claimed = await supabaseRequest(`whatsapp_bot_messages?message_id=eq.${encodeURIComponent(message.id)}&status=eq.failed`, {
          method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status: 'processing', updated_at: new Date().toISOString() }),
        });
        if (!claimed?.length) continue;
      }
      const statePath = `whatsapp_bot_messages?message_id=eq.${encodeURIComponent(message.id)}`;
      try {
        let reply = 'I am the NextClasses AI assistant. Please send your question as text. Explore courses at https://www.nextclasses.in/';
        if (message.text) {
          try { reply = await courseAssistantAnswer(message.text, message.channel); }
          catch { reply = 'Our AI assistant is temporarily unavailable. Our team can help with your enquiry here. Course information: https://www.nextclasses.in/'; }
        }
        const instagramLogin = message.channel === 'Instagram' && process.env.INSTAGRAM_LOGIN_MODE !== 'facebook';
        const host = instagramLogin ? 'graph.instagram.com' : 'graph.facebook.com';
        const sendId = message.channel === 'Instagram' && !instagramLogin ? process.env.FACEBOOK_PAGE_ID : message.accountId;
        if (!sendId) throw new Error('Send account missing');
        const response = await fetch(`https://${host}/v26.0/${encodeURIComponent(sendId)}/messages`, {
          method: 'POST', signal: AbortSignal.timeout(10000), headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipient: { id: message.sender }, message: { text: reply.slice(0, 950) }, ...(message.channel === 'Facebook' ? { messaging_type: 'RESPONSE' } : {}) }),
        });
        if (!response.ok) {
          const error: any = await response.json().catch(() => ({}));
          // Log only error codes, never tokens, student questions or sender IDs.
          console.error('Social bot delivery rejected', { channel: message.channel, status: response.status, code: error.error?.code, subcode: error.error?.error_subcode });
          throw new Error('Delivery rejected');
        }
        await supabaseRequest(statePath, { method: 'PATCH', body: JSON.stringify({ status: 'sent', updated_at: new Date().toISOString() }) });
      } catch (error) {
        await supabaseRequest(statePath, { method: 'PATCH', body: JSON.stringify({ status: 'failed', updated_at: new Date().toISOString() }) });
        throw error;
      }
    }
    return res.status(200).json({ received: true });
  } catch {
    console.error('Social bot processing failed');
    return res.status(500).send('Processing failed');
  }
}
