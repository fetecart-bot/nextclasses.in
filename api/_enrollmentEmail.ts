import nodemailer from 'nodemailer';
import { supabaseRequest, passwordHash } from './_supabase.js';

export async function sendEnrollmentEmail(account:any,payment:any,student:any) {
 if(!account.email || !student.active || student.password_hash !== passwordHash(account.password)) return false;
 const enrollments = await supabaseRequest(`enrollments?student_id=eq.${encodeURIComponent(student.id)}&select=course_title&order=created_at.desc`);
 const titles = enrollments.map((row:any) => row.course_title).join(', ');
 const reference=`credentials:${payment.id}`;
 const logs=await supabaseRequest(`delivery_logs?student_id=eq.${encodeURIComponent(student.id)}&channel=eq.email&status=eq.sent&provider_reference=eq.${encodeURIComponent(reference)}&limit=1`);
 if(logs?.length) return true;
 const text=`Hello ${account.name},\n\nYour NextClasses payment is confirmed.\nCourse: ${titles || account.courseTitle}\nUsername: ${student.username}\nPassword: ${account.password}\nStudent portal: https://www.nextclasses.in/student-app\nPayment reference: ${payment.id}\n\nKeep your login details private. For support, contact +91 8792134951.`;
 let sent=false;
 try {
  if(process.env.RESEND_API_KEY) {
   const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':reference},body:JSON.stringify({from:'NextClasses <study@nextclasses.in>',to:[account.email],subject:'Your NextClasses student login',text}),signal:AbortSignal.timeout(20000)});
   if(!response.ok) throw new Error('Email delivery was not accepted');
   sent=true;
  } else if(process.env.SMTP_USER && process.env.SMTP_PASS) {
   const transport=nodemailer.createTransport({host:process.env.SMTP_HOST || 'smtp.gmail.com',port:Number(process.env.SMTP_PORT || 587),secure:Number(process.env.SMTP_PORT)===465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
   await transport.sendMail({from:`NextClasses <${process.env.SMTP_USER}>`,to:account.email,subject:'Your NextClasses student login',text});sent=true;
  }
  await supabaseRequest('delivery_logs',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({student_id:student.id,channel:'email',status:sent?'sent':'skipped',provider_reference:reference})});
  return sent;
 } catch {
  await supabaseRequest('delivery_logs',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({student_id:student.id,channel:'email',status:'failed',provider_reference:reference,error_message:'Credential email delivery failed'})}).catch(()=>{});
  throw new Error('Credential email delivery is pending');
 }
}
