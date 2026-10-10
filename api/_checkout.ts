import { sendEnrollmentEmail } from './_enrollmentEmail.js';
import crypto from 'node:crypto';
import { COURSES_DATA } from '../src/data.js';
import { credentialsFor } from './_razorpay.js';
import { saveStudentAndEnrollment, supabaseRequest, passwordHash } from './_supabase.js';
const excluded = new Set(['course-upsc-civil-services','course-ssc-cgl','course-kerala-psc-degree']);
const coupons: Record<string, number> = {AIFUTURE:40,NEXTCLASS20:20,LASTSCHOOL20:20};
function auth() {
 const key=process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
 const secret=process.env.RAZORPAY_KEY_SECRET;
 if (!key || !secret) throw new Error('Payment service is not configured');
 return {key,secret,headers:{Authorization:`Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`,'Content-Type':'application/json'}};
}
async function razorpay(path:string,init:RequestInit={}) {
 const response=await fetch(`https://api.razorpay.com/v1/${path}`,{...init,headers:{...auth().headers,...init.headers},signal:AbortSignal.timeout(20000)});
 const data:any=await response.json();
 if(!response.ok) throw new Error('Payment service could not complete this request');
 return data;
}
export function priceCourses(ids:string[],coupon:string) {
 if(!ids.length || ids.length>5 || new Set(ids).size!==ids.length) throw new Error('Choose up to five different courses');
 const courses=ids.map(id=>COURSES_DATA.find(c=>c.id===id));
 if(courses.some(c=>!c || !Number.isFinite(c.price) || c.price<=0)) throw new Error('One of these courses is unavailable for checkout');
 if(coupon && !coupons[coupon]) throw new Error('This coupon is not valid');
 const selected=courses as typeof COURSES_DATA;
 const raw=selected.reduce((sum,c)=>sum+c.price,0);
 const eligible=selected.filter(c=>!excluded.has(c.id)).reduce((sum,c)=>sum+c.price,0);
 return {courses:selected,amount:Math.round((raw-Math.round(eligible*(coupons[coupon] || 0)/100))*100)};
}
export async function checkout(req:any,res:any) {
 try {
  if(req.body?.action==='create-order') {
   const ids=Array.isArray(req.body.courseIds)?req.body.courseIds.map(String):[];
   const {courses,amount}=priceCourses(ids,String(req.body.coupon || '').toUpperCase());
   const encoded=JSON.stringify(ids);if(encoded.length>256) return res.status(400).json({error:'Please split this cart into smaller orders'});
   const name=String(req.body.studentName || '').trim().slice(0,100);
   const email=String(req.body.studentEmail || '').trim().toLowerCase().slice(0,200);
   const phone=String(req.body.studentPhone || '').replace(/[^0-9+]/g,'').slice(0,20);
   if(!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.replace(/\D/g,'').length<10) return res.status(400).json({error:'Enter your name, valid email and phone number'});
   const order=await razorpay('orders',{method:'POST',body:JSON.stringify({amount,currency:'INR',receipt:`NC-${crypto.randomUUID().slice(0,30)}`,notes:{checkoutVersion:'2',studentName:name,studentEmail:email,studentPhone:phone,courseId:ids[0],courseIds:encoded,courseTitle:courses[0].title.slice(0,256)}})});
   return res.status(200).json({orderId:order.id,amount:order.amount,currency:order.currency,keyId:auth().key});
  }
  if(req.body?.action==='verify-checkout') {
   const paymentId=String(req.body.paymentId || ''),orderId=String(req.body.orderId || ''),signature=String(req.body.signature || '');
   if(!/^pay_[a-zA-Z0-9]+$/.test(paymentId) || !/^order_[a-zA-Z0-9]+$/.test(orderId) || !/^[a-f0-9]{64}$/.test(signature)) return res.status(400).json({error:'Payment verification details are missing'});
   const expected=crypto.createHmac('sha256',auth().secret).update(`${orderId}|${paymentId}`).digest('hex');
   if(!crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(signature))) return res.status(401).json({error:'Payment signature could not be verified'});
   const [payment,order]=await Promise.all([razorpay(`payments/${paymentId}`),razorpay(`orders/${orderId}`)]);
   if(payment.order_id!==orderId || payment.status!=='captured' || order.status!=='paid' || payment.amount!==order.amount || payment.currency!=='INR' || order.notes?.checkoutVersion!=='2') return res.status(409).json({error:'Your payment is still being confirmed. Please do not pay again; contact support with the payment reference.'});
   const verifiedPayment={...payment,notes:order.notes};
   const account=credentialsFor(verifiedPayment);
   const student=await saveStudentAndEnrollment(account,verifiedPayment,{preserveExisting:true});
   if (!student.active || student.password_hash !== passwordHash(account.password)) return res.status(409).json({ error: 'Payment is confirmed, but these login details were updated. Please contact support; do not pay again.' });
   const enrollments = await supabaseRequest(`enrollments?student_id=eq.${encodeURIComponent(student.id)}&select=course_id,course_title&order=created_at.desc`);
   const emailSent = await sendEnrollmentEmail(account, verifiedPayment, student).catch(() => false);
   return res.status(200).json({emailSent,account:{...account,id:student.id,username:student.username,courseId:enrollments[0]?.course_id,courseTitle:enrollments[0]?.course_title,enrolledCourseIds:enrollments.map((row:any)=>row.course_id)},paymentId});
  }
  return res.status(400).json({error:'Unknown checkout action'});
 } catch(error:any) { return res.status(503).json({error:error.message || 'Checkout is temporarily unavailable'}); }
}
