import { supabaseRequest } from './_supabase.js';
import { tuitionMonthlyFee } from '../src/data/tuitionPricing.js';
// Caller must obtain payment/order data from Razorpay, never from the browser.
export async function activateVerifiedTuitionPayment(payment:any) {
 const notes=payment.notes || {},match=String(notes.courseId || '').match(/^course-cbse-class-([5-9]|1[0-2])$/);
 if(notes.checkoutVersion!=='tuition-month-v1'||!match||payment.status!=='captured'||payment.currency!=='INR'||payment.amount!==tuitionMonthlyFee(Number(match[1]))*100||!/^pay_[a-zA-Z0-9]+$/.test(String(payment.id))||!/^order_[a-zA-Z0-9]+$/.test(String(payment.order_id))||!/^[0-9a-f-]{36}$/i.test(String(notes.studentId)))throw new Error('Tuition payment could not be matched');
 return supabaseRequest('rpc/activate_tuition_month',{method:'POST',body:JSON.stringify({p_student_id:notes.studentId,p_course_id:notes.courseId,p_payment_id:payment.id,p_order_id:payment.order_id,p_amount:payment.amount})});
}
