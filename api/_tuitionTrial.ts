import crypto from 'node:crypto';
import { passwordHash, supabaseRequest } from './_supabase.js';

export default async function handler(req:any,res:any) {
 res.setHeader('Cache-Control','no-store');
 if(req.method==='GET') return res.status(200).json({renewalAvailable:process.env.NEXTCLASSES_TUITION_PAYMENTS_ENABLED==='true' && Boolean((process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID) && process.env.RAZORPAY_KEY_SECRET),available:process.env.NEXTCLASSES_TRIAL_ENABLED==='true' && Boolean((process.env.CREDENTIAL_SECRET || process.env.RAZORPAY_KEY_SECRET) && process.env.RESEND_API_KEY)});
 if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
 if(process.env.NEXTCLASSES_TRIAL_ENABLED!=='true') return res.status(503).json({error:'Online trial registration is being prepared. Please contact support on +91 8792134951.'});
 const secret=process.env.CREDENTIAL_SECRET || process.env.RAZORPAY_KEY_SECRET;
 if(!secret || !process.env.RESEND_API_KEY) return res.status(503).json({error:'Trial registration is temporarily unavailable.'});
 const email=String(req.body?.email || '').trim().toLowerCase();
 if(email.length>200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({error:'Enter your own parent or guardian email address.'});
 const hash=(code:string)=>crypto.createHmac('sha256',secret).update('tuition-trial:'+email+':'+code).digest('hex');
 try {
  if(req.body?.action==='request-code') {
   const grade=Number(req.body.grade);
   if(!Number.isInteger(grade) || grade<5 || grade>12 || req.body.parentConfirmed!==true) return res.status(400).json({error:'Choose Classes 5–12 and confirm you are the adult parent or guardian.'});
   const code=String(crypto.randomInt(100000,1000000));
   const accepted=await supabaseRequest('rpc/request_tuition_trial',{method:'POST',body:JSON.stringify({p_email:email,p_grade:grade,p_code_hash:hash(code)})});
   if(accepted) {
    if (await supabaseRequest('rpc/reserve_trial_email_slot',{method:'POST',body:'{}'}) !== true) throw new Error('Daily email budget reached');
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:'NextClasses <study@nextclasses.in>',to:[email],subject:'Your NextClasses tuition trial verification code',text:`Your verification code is ${code}. It expires in 10 minutes. Use it only if you requested a parent-managed Class ${grade} tuition trial. Never share it with anyone. No payment or automatic subscription is created.`}),signal:AbortSignal.timeout(15000)});
    if(!response.ok) throw new Error('mail');
   }
   // Do not reveal whether this address already belongs to a paid student.
   return res.status(200).json({message:'If this email is eligible, a code has been sent. Check your inbox. Existing users should sign in or contact support. Please wait a minute before requesting another code.'});
  }
  if(req.body?.action==='verify-code') {
   const code=String(req.body.code || ''),password=String(req.body.password || '');
   if(!/^\d{6}$/.test(code) || password.length<12 || password.length>128 || password.trim()!==password) return res.status(400).json({error:'Enter the six-digit code and a password of 12–128 characters without spaces at the ends.'});
   const account=await supabaseRequest('rpc/claim_tuition_trial',{method:'POST',body:JSON.stringify({p_email:email,p_code_hash:hash(code),p_password_hash:passwordHash(password)})});
   if(!account) return res.status(400).json({error:'The code is invalid, expired, or this email is not eligible for a new trial. Please request a fresh code or contact support.'});
   return res.status(200).json({account,message:'Your 30-day trial is ready. Sign in using your email and the password you chose.'});
  }
  return res.status(400).json({error:'Unknown trial action'});
 } catch { return res.status(503).json({error:'Trial registration could not be completed. Please retry shortly or contact support.'}); }
}
