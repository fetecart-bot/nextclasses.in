import { activateVerifiedTuitionPayment } from './_tuitionBilling.js';
import crypto from 'node:crypto';
import { passwordHash, supabaseRequest } from './_supabase.js';
import { tuitionMonthlyFee } from '../src/data/tuitionPricing.js';
async function provider(path:string,body?:any) {
 const key=process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID,secret=process.env.RAZORPAY_KEY_SECRET;
 if(!key || !secret)throw new Error('Payments are temporarily unavailable');
 const response=await fetch(`https://api.razorpay.com/v1/${path}`,{method:body?'POST':'GET',headers:{Authorization:`Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});
 const data:any=await response.json();if(!response.ok)throw new Error('Payment provider could not confirm this request');return data;
}
export default async function handler(req:any,res:any) {
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(process.env.NEXTCLASSES_TUITION_PAYMENTS_ENABLED!=='true')return res.status(503).json({error:'Monthly online renewal is being prepared. Contact support; do not pay through an unrelated course.'});
 try {
  const identifier=String(req.body?.identifier||'').trim().toLowerCase(),password=String(req.body?.password||''),courseId=String(req.body?.courseId||'');
  const match=courseId.match(/^course-cbse-class-([5-9]|1[0-2])$/);if(!match||!identifier||!password)return res.status(400).json({error:'Sign in and choose your assigned CBSE class.'});
  const pattern=encodeURIComponent(identifier.replace(/([\\%_*])/g,'\\$1'));
  const students=await supabaseRequest(`students?or=(username.ilike.${pattern},email.eq.${encodeURIComponent(identifier)})&active=eq.true&limit=1`);const student=students?.[0];
  if(!student || student.password_hash!==passwordHash(password))return res.status(401).json({error:'Check your parent account email and password.'});
  const rows=await supabaseRequest(`enrollments?student_id=eq.${encodeURIComponent(student.id)}&course_id=eq.${encodeURIComponent(courseId)}&limit=1`);
  if(!rows?.length || !['trial','monthly'].includes(student.account_kind))return res.status(403).json({error:'This class is not assigned to a tuition account.'});
  const amount=tuitionMonthlyFee(Number(match[1]))*100;
  if(req.body.action==='create-order') {
   const order=await provider('orders',{amount,currency:'INR',receipt:`NC-T-${crypto.randomUUID().slice(0,28)}`,notes:{checkoutVersion:'tuition-month-v1',studentId:student.id,courseId}});
   return res.status(200).json({orderId:order.id,amount,currency:'INR',keyId:process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID});
  }
  if(req.body.action==='verify-payment') {
   const paymentId=String(req.body.paymentId||''),orderId=String(req.body.orderId||''),signature=String(req.body.signature||'');
   if(!/^pay_[a-zA-Z0-9]+$/.test(paymentId)||!/^order_[a-zA-Z0-9]+$/.test(orderId)||!/^[a-f0-9]{64}$/.test(signature))return res.status(400).json({error:'Payment details are incomplete.'});
   const secret=process.env.RAZORPAY_KEY_SECRET;if(!secret)throw new Error('Payment service unavailable');
   const expected=crypto.createHmac('sha256',secret).update(`${orderId}|${paymentId}`).digest('hex');
   if(!crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(signature)))return res.status(401).json({error:'Payment signature could not be verified.'});
   const [payment,order]=await Promise.all([provider(`payments/${paymentId}`),provider(`orders/${orderId}`)]);
   if(payment.order_id!==orderId||payment.status!=='captured'||order.status!=='paid'||payment.amount!==amount||order.amount!==amount||payment.currency!=='INR'||order.currency!=='INR'||order.notes?.checkoutVersion!=='tuition-month-v1'||order.notes?.studentId!==student.id||order.notes?.courseId!==courseId)return res.status(409).json({error:'Payment is pending verification. Do not pay again. Contact support with the payment reference.'});
   const access=await activateVerifiedTuitionPayment({...payment,notes:order.notes});
   return res.status(200).json({paymentId,accessUntil:access.accessUntil,message:'Your monthly tuition access is active. Sign in with your existing credentials.'});
  }
  return res.status(400).json({error:'Unknown payment action.'});
 }catch{return res.status(503).json({error:'We could not confirm the request. If money was deducted, do not pay again; contact support with the payment reference.'});}
}
