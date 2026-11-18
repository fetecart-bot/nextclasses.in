import crypto from 'node:crypto';
import { passwordHash, supabaseRequest } from './_supabase.js';
import { activateVerifiedYogaPayment } from './_yogaBilling.js';
import { sendEnrollmentEmail } from './_enrollmentEmail.js';
import { YOGA_AMOUNT, YOGA_COURSE_ID, YOGA_CURRENCY, YOGA_TITLE, YOGA_VERSION } from '../src/data/yogaProgramme.js';
async function provider(path:string,body?:any) {
 const key=process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID,secret=process.env.RAZORPAY_KEY_SECRET;
 if(!key||!secret)throw new Error('Yoga payments are temporarily unavailable');
 const response=await fetch(`https://api.razorpay.com/v1/${path}`,{method:body?'POST':'GET',headers:{Authorization:`Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});
 const data:any=await response.json(); if(!response.ok)throw new Error('Razorpay could not complete this request. Contact support if international checkout is unavailable.');return data;
}
async function signedIn(body:any) {
 const identifier=String(body.identifier||'').trim().toLowerCase(),password=String(body.password||'');
 if(!identifier||!password)throw new Error('Sign in with your yoga account.');
 const pattern=encodeURIComponent(identifier.replace(/([\\%_*])/g,'\\$1'));
 const rows=await supabaseRequest(`students?or=(username.ilike.${pattern},email.eq.${encodeURIComponent(identifier)})&active=eq.true&limit=1`);
 const student=rows?.[0];if(!student||student.password_hash!==passwordHash(password))throw new Error('Check your yoga account sign-in details.');
 return student;
}
export default async function yogaPayment(req:any,res:any) {
 res.setHeader('Cache-Control','no-store');
 try {
  if(['yoga-admin-resources','yoga-admin-save-resource'].includes(req.body.action)) {
   const supplied=Buffer.from(String(req.headers['x-admin-key']||'')),expected=Buffer.from(String(process.env.ADMIN_API_KEY||''));
   if(!expected.length||supplied.length!==expected.length||!crypto.timingSafeEqual(supplied,expected))return res.status(401).json({error:'Administrator sign-in required.'});
   if(req.body.action==='yoga-admin-save-resource') {
    const {id,kind,title,url,startsAt,published}=req.body;
    let parsed:URL;try{parsed=new URL(String(url))}catch{return res.status(400).json({error:'Enter a valid HTTPS resource link.'})}
    if(parsed.protocol!=='https:'||parsed.username||parsed.password||!['live','video','notes'].includes(kind)||!String(title||'').trim()||String(title).length>200||(startsAt&&!Number.isFinite(Date.parse(startsAt)))||(id&&!/^[0-9a-f-]{36}$/i.test(id)))return res.status(400).json({error:'Check the resource title, type, HTTPS URL and date.'});
    const path=id?`yoga_resources?id=eq.${encodeURIComponent(id)}`:'yoga_resources';
    await supabaseRequest(path,{method:id?'PATCH':'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({kind,title:String(title).trim(),url:parsed.href,starts_at:startsAt?new Date(startsAt).toISOString():null,published:published===true})});
   }
   const resources=await supabaseRequest('yoga_resources?order=created_at.desc');
   const payments=await supabaseRequest('yoga_payments?select=payment_id,amount_cents,currency,access_until,created_at&order=created_at.desc&limit=50');
   return res.status(200).json({resources,payments});
  }
  if(req.body.action==='yoga-access') {
   const student=await signedIn(req.body);
   const memberships=await supabaseRequest(`yoga_memberships?student_id=eq.${encodeURIComponent(student.id)}&limit=1`);
   const membership=memberships?.[0]; if(!membership)return res.status(403).json({error:'No yoga membership is assigned to this account.'});
   const active=Date.parse(membership.access_until)>Date.now();
   const resources=active?await supabaseRequest('yoga_resources?published=eq.true&select=id,kind,title,url,starts_at&order=starts_at.asc.nullslast,created_at.asc'):[];
   return res.status(200).json({active,accessUntil:membership.access_until,resources});
  }
  if(req.body.action==='create-yoga-order') {
   if(req.body.acceptedTerms!==true)return res.status(400).json({error:'Confirm the one-month programme details before paying.'});
   // Refuse to take payment until the membership migration is available.
   await supabaseRequest('yoga_memberships?select=student_id&limit=0');
   const renewal=req.body.mode==='renew';
   if(!['new','renew'].includes(req.body.mode))return res.status(400).json({error:'Choose enrolment or renewal.'});
   let notes:any={checkoutVersion:YOGA_VERSION,courseId:YOGA_COURSE_ID,courseTitle:YOGA_TITLE,mode:req.body.mode};
   if(renewal) {
    const student=await signedIn(req.body);
    notes={...notes,studentId:student.id,studentName:student.name,studentEmail:student.email,studentPhone:student.phone||''};
   } else {
    const name=String(req.body.name||'').trim().slice(0,100),email=String(req.body.email||'').trim().toLowerCase().slice(0,200),phone=String(req.body.phone||'').replace(/[^\d+]/g,'').slice(0,20);
    if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^\+[1-9]\d{6,14}$/.test(phone))return res.status(400).json({error:'Enter your name, email and phone with country code.'});
    const existing=await supabaseRequest(`students?email=eq.${encodeURIComponent(email)}&limit=1`);
    if(existing?.length)return res.status(409).json({error:'This email already has a NextClasses account. Choose the existing-account option to enrol or renew with your current login.'});
    notes={...notes,studentName:name,studentEmail:email,studentPhone:phone};
   }
   const order=await provider('orders',{amount:YOGA_AMOUNT,currency:YOGA_CURRENCY,receipt:`NC-Y-${crypto.randomUUID().slice(0,28)}`,notes});
   if(order.amount!==YOGA_AMOUNT||order.currency!==YOGA_CURRENCY)throw new Error('Payment currency mismatch. Do not pay.');
   return res.status(200).json({orderId:order.id,amount:YOGA_AMOUNT,currency:YOGA_CURRENCY,keyId:process.env.RAZORPAY_KEY_ID||process.env.VITE_RAZORPAY_KEY_ID});
  }
  if(req.body.action==='verify-yoga-payment') {
   const paymentId=String(req.body.paymentId||''),orderId=String(req.body.orderId||''),signature=String(req.body.signature||'');
   if(!/^pay_[a-zA-Z0-9]+$/.test(paymentId)||!/^order_[a-zA-Z0-9]+$/.test(orderId)||!/^[a-f0-9]{64}$/.test(signature))return res.status(400).json({error:'Payment verification details are incomplete.'});
   const secret=process.env.RAZORPAY_KEY_SECRET;if(!secret)throw new Error('Payments unavailable');
   const expected=crypto.createHmac('sha256',secret).update(`${orderId}|${paymentId}`).digest('hex');
   if(!crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(signature)))return res.status(401).json({error:'Payment signature could not be verified.'});
   const [payment,order]=await Promise.all([provider(`payments/${paymentId}`),provider(`orders/${orderId}`)]);
   if(payment.order_id!==orderId||order.status!=='paid'||payment.status!=='captured'||payment.amount!==YOGA_AMOUNT||order.amount!==YOGA_AMOUNT||payment.currency!==YOGA_CURRENCY||order.currency!==YOGA_CURRENCY||order.notes?.checkoutVersion!==YOGA_VERSION||order.notes?.courseId!==YOGA_COURSE_ID)return res.status(409).json({error:'Payment confirmation pending. Do not pay again; contact support with the payment reference.'});
   const verified={...payment,notes:order.notes};
   const {access,student,account}=await activateVerifiedYogaPayment(verified);
   const newCredentials=order.notes.mode==='new'&&student.password_hash===passwordHash(account.password);
   const emailSent=newCredentials?await sendEnrollmentEmail(account,verified,student).catch(()=>false):false;
   return res.status(200).json({paymentId,accessUntil:access.accessUntil,emailSent,...(newCredentials?{account:{username:student.username,password:account.password,email:student.email}}:{message:'Use your existing account credentials.'})});
  }
  return res.status(400).json({error:'Unknown yoga action.'});
 }catch{return res.status(503).json({error:'Yoga payment or access could not be confirmed. If charged, do not pay again; contact support with the payment reference.'});}
}
