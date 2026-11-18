import crypto from 'node:crypto';
import { passwordHash, supabaseRequest } from './_supabase.js';
import { YOGA_AMOUNT, YOGA_COURSE_ID, YOGA_CURRENCY, YOGA_TITLE, YOGA_VERSION } from '../src/data/yogaProgramme.js';

export function yogaCredentials(payment:any) {
 const notes=payment.notes || {},email=String(notes.studentEmail || '').toLowerCase();
 const secret=process.env.CREDENTIAL_SECRET || process.env.RAZORPAY_KEY_SECRET;
 if(!secret)throw new Error('Payment service unavailable');
 const digest=crypto.createHmac('sha256',secret).update(`${payment.id}:${email}`).digest('hex');
 const prefix=email.split('@')[0].replace(/[^a-z0-9]/g,'').slice(0,10)||'learner';
 return {name:String(notes.studentName || 'Yoga learner'),email,phone:String(notes.studentPhone || ''),username:`nc_${prefix}_${String(payment.id).slice(-5)}`,password:`Nc@${digest.slice(0,10)}`,courseId:YOGA_COURSE_ID,courseTitle:YOGA_TITLE,enrolledCourseIds:[YOGA_COURSE_ID],courseTitles:{[YOGA_COURSE_ID]:YOGA_TITLE}};
}
// Only call with a payment fetched from Razorpay and matched to its paid order.
export async function activateVerifiedYogaPayment(payment:any) {
 const notes=payment.notes || {};
 if(notes.checkoutVersion!==YOGA_VERSION || notes.courseId!==YOGA_COURSE_ID || payment.status!=='captured' || payment.currency!==YOGA_CURRENCY || payment.amount!==YOGA_AMOUNT || !/^pay_[a-zA-Z0-9]+$/.test(String(payment.id)) || !/^order_[a-zA-Z0-9]+$/.test(String(payment.order_id)))throw new Error('Yoga payment could not be matched');
 const account=yogaCredentials(payment);
 const renewal=notes.mode==='renew';
 if(!['new','renew'].includes(notes.mode) || (renewal && !/^[0-9a-f-]{36}$/i.test(String(notes.studentId))) || (!renewal && (!account.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email))))throw new Error('Yoga enrolment details are incomplete');
 const access=await supabaseRequest('rpc/activate_yoga_month',{method:'POST',body:JSON.stringify({p_student_id:renewal?notes.studentId:null,p_payment_id:payment.id,p_order_id:payment.order_id,p_amount:payment.amount,p_currency:payment.currency,p_name:account.name,p_email:account.email,p_phone:account.phone,p_username:account.username,p_password_hash:passwordHash(account.password)})});
 const rows=await supabaseRequest(`students?id=eq.${encodeURIComponent(access.studentId)}&limit=1`);
 if(!rows?.[0])throw new Error('Yoga access confirmation pending');
 return {access,student:rows[0],account};
}
