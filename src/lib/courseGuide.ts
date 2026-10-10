import { COURSES_DATA } from '../data';

export function courseGuideReply(query: string) {
  const text = query.toLowerCase();
  const support = 'For personal enrolment help, WhatsApp +91 8792134951.';
  if (/human|counsel|contact|support|refund/.test(text)) return support;
  if (/login|password|sign in|portal/.test(text)) return `After your payment is confirmed, sign in with your student credentials at https://www.nextclasses.in/student-app. If you cannot sign in or see the wrong course, contact support with your payment reference. Do not share your password in chat. ${support}`;
  if (/material|dispatch|pdf|kit/.test(text) && !/sainik|class 6|class 9/.test(text)) return `Enrolled students can open their assigned course in the student portal to access its study guide, lessons and published study materials. Please confirm any physical delivery arrangements with support before purchasing. ${support}`;
  if (/discount|coupon|offer/.test(text)) return 'The AIFUTURE welcome coupon gives 40% off eligible courses. UPSC Civil Services, SSC CGL and Kerala PSC Degree courses are excluded from this coupon. Checkout shows the final payable price before payment. Browse the catalogue for current prices.';
  const patterns: Array<[RegExp, RegExp]> = [
    [/sainik|aissee|class 6|class 9/, /sainik|aissee/i], [/navodaya/, /navodaya/i], [/rms|rashtriya/, /rashtriya|rms/i],
    [/upsc/, /upsc/i], [/ssc/, /ssc/i], [/psc/, /psc/i], [/neet/, /neet/i], [/keam/, /keam/i], [/jee/, /jee/i],
    [/speaking|articulation/, /speaking|articulation/i], [/chatgpt|beginner| ai |^ai/, /chatgpt|generative ai/i],
  ];
  const match = patterns.find(([question]) => question.test(text));
  const courses = match ? COURSES_DATA.filter(course => match[1].test(`${course.id} ${course.title}`)) : [];
  if (courses.length) return `${courses.slice(0, 4).map(course => `${course.title}: ₹${course.price.toLocaleString('en-IN')}`).join('\n\n')}\n\nOpen the course catalogue to review the syllabus and enrolment details. Prices shown here are before eligible coupons. ${support}`;
  if (/fee|price|enrol|buy|pay/.test(text)) return `Choose your course in the catalogue, review its syllabus and price, then add it to the cart. Razorpay handles payment; access is created after server verification. Apply an eligible coupon before paying. ${support}`;
  return `I can help with course choices, fees, discounts, enrolment, study material access and student login. Which course are you interested in? For academic questions, use your enrolled course’s OpenAI mentor. ${support}`;
}
