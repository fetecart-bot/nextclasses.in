import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { checkout, priceCourses } from '../api/_checkout.ts';
import { credentialsFor } from '../api/_razorpay.ts';
import { saveStudentAndEnrollment } from '../api/_supabase.ts';
process.env.RAZORPAY_KEY_ID='rzp_test_example';process.env.RAZORPAY_KEY_SECRET='test-secret';process.env.SUPABASE_URL='https://database.example';process.env.SUPABASE_SECRET_KEY='test';
const ids=['course-upsc-civil-services','course-ssc-cgl'];
assert.equal(priceCourses(ids,'AIFUTURE').amount,399800);
assert.throws(()=>priceCourses(['fake'],'AIFUTURE'));
assert.throws(()=>priceCourses([ids[0],ids[0]],'AIFUTURE'));
assert.throws(()=>priceCourses(ids,'FAKE'));
let calls=0, saved:any;
globalThis.fetch=async (input:any,init:any) => {
 const url=String(input);calls++;
 if(url.endsWith('/orders')) { const body=JSON.parse(init.body);assert.equal(body.amount,399800);assert.deepEqual(JSON.parse(body.notes.courseIds),ids);return new Response(JSON.stringify({id:'order_test',amount:body.amount,currency:'INR'})); }
 if(url.includes('/students?on_conflict')) return new Response(JSON.stringify([{id:'student-test'}]));
 if(url.includes('/enrollments?on_conflict')) {saved=JSON.parse(init.body);return new Response(null,{status:204});}
 throw new Error('Unexpected request');
};
async function run(body:any) {let status=0,data:any;const res:any={status(c:number){status=c;return this},json(b:any){data=b;return this}};await checkout({body},res);return {status,data};}
const result=await run({action:'create-order',courseIds:ids,coupon:'AIFUTURE',studentName:'Test',studentEmail:'test@example.com',studentPhone:'+919000000000',amount:1});assert.equal(result.status,200);assert.equal(result.data.amount,399800);
const before=calls;assert.equal((await run({action:'verify-checkout',paymentId:'pay_test',orderId:'order_test',signature:'0'.repeat(64)})).status,401);assert.equal(calls,before);
const payment={id:'pay_test',amount:399800,created_at:1700000000,email:'test@example.com',notes:{courseId:ids[0],courseIds:JSON.stringify(ids)}};
const account=credentialsFor(payment);assert.deepEqual(account.enrolledCourseIds,ids);await saveStudentAndEnrollment(account,payment);assert.equal(saved.length,2);assert.deepEqual(saved.map((row:any)=>row.course_id),ids);
console.log('PASS: authoritative prices, coupon exclusions, bad course/coupon/duplicates, forged signature, all courses saved atomically');

const captured={...payment,status:'captured',currency:'INR',order_id:'order_test'};
const stored={id:'student-test',username:account.username,active:true,password_hash:(await import('../api/_supabase.ts')).passwordHash(account.password)};
let writes=0;
globalThis.fetch=async(input:any,init:any={})=>{
 const url=String(input);
 if(url.endsWith('/payments/pay_test')) return Response.json(captured);
 if(url.endsWith('/orders/order_test')) return Response.json({id:'order_test',status:'paid',amount:399800,notes:{...payment.notes,checkoutVersion:'2'},currency:'INR'});
 if(url.includes('/students?payment_id=')) return Response.json([stored]);
 if(url.includes('/enrollments?') && !url.includes('on_conflict')) return Response.json(ids.map(course_id=>({course_id,course_title:course_id})));
 if(url.includes('/delivery_logs?')) return Response.json([{status:'sent'}]);
 if(init.method==='POST') writes++;
 throw new Error('Unexpected request '+url);
};
const signature=crypto.createHmac('sha256','test-secret').update('order_test|pay_test').digest('hex');
const verified=await run({action:'verify-checkout',paymentId:'pay_test',orderId:'order_test',signature});
assert.equal(verified.status,200);assert.deepEqual(verified.data.account.enrolledCourseIds,ids);assert.equal(verified.data.emailSent,true);assert.equal(writes,0);
stored.active=false;
assert.equal((await run({action:'verify-checkout',paymentId:'pay_test',orderId:'order_test',signature})).status,409);
assert.equal(writes,0);
console.log('PASS: legitimate signed checkout restores all purchased courses, preserves corrected account, avoids duplicate email, blocks inactive login');
