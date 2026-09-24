import { StudentUser } from '../types';
import { COURSES_DATA } from '../data';

export interface RegisteredStudentAccount extends StudentUser {
  username: string;
  password: string;
  courseId: string;
  courseTitle: string;
  standard?: '6' | '9' | 'class-6' | 'class-9' | string;
  amount?: number;
  utrNumber?: string;
  emailSent?: boolean;
}

const STORAGE_KEY = 'nextclass_registered_students_v2';

/**
 * Returns the active application portal URL based on the current origin.
 * Avoids broken external domains before custom domain DNS is set up.
 */
export function getAppPortalUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}/?portal=true`;
  }
  return '/?portal=true';
}

// Remove legacy demonstration accounts that older versions stored in the browser.
const LEGACY_DEMO_ACCOUNT_IDS = new Set([
  'student-biju-aissee',
  'student-sainik-seed',
  'student-neet-seed',
  'student-jnvst-seed',
  'student-claude-seed',
]);
const LEGACY_DEMO_EMAILS = new Set([
  'siddharth.varma@gmail.com',
  'ananya.ramesh@gmail.com',
]);

/**
 * Accurately determines student gender for appropriate voice tutor selection:
 * Rule: For girls and women, a male voice speaks. For males and boys, a female voice speaks.
 */
export function detectStudentGender(name: string = '', explicitGender?: string): 'male' | 'female' {
  if (explicitGender === 'male' || explicitGender === 'female') {
    return explicitGender;
  }
  const clean = name.toLowerCase().trim();
  const femalePatterns = [
    /\b(mrs|ms|miss|lady|girl|woman|she|her|kumari|smt)\b/,
    /\b(anjali|sneha|priya|lakshmi|laxmi|pooja|puja|divya|mary|maria|sara|sarah|ayesha|deepa|swathi|meera|mira|neha|ritu|ananya|shreya|parvathi|fatima|sandra|riya|shruti|revathi|malavika|keerthi|kirthi|bhavya|radhika|preeti|priti|sunita|geetha|geeta|anita|sridevi|suma|sowmya|vidya|ashwini|deepika|kavita|kavitha|aishwarya|reshma|haritha|archana|arpitha|swetha|shwetha|chaitra|soundarya|pallavi|madhuri|nandini|renuka|sudha)\b/,
  ];
  for (const pattern of femalePatterns) {
    if (pattern.test(clean)) {
      return 'female';
    }
  }
  return 'male';
}

export function getRegisteredStudents(): RegisteredStudentAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: RegisteredStudentAccount[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const realStudents = parsed.filter((student) =>
          !LEGACY_DEMO_ACCOUNT_IDS.has(student.id) &&
          !LEGACY_DEMO_EMAILS.has(student.email?.toLowerCase()) &&
          !student.username?.toLowerCase().endsWith('_demo') &&
          !String(student.paymentReference || '').startsWith('UPI-DEMO-')
        );
        if (realStudents.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(realStudents));
        }
        return realStudents;
      }
    }
  } catch (err) {
    console.error('Failed to read student registry:', err);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch {
    // ignore
  }
  return [];
}

export function saveRegisteredStudents(students: RegisteredStudentAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (err) {
    console.error('Failed to save student registry:', err);
  }
}

/**
 * Generates an intuitive, readable student username based on course and student name.
 */
export function generateStudentUsername(name: string, courseId: string): string {
  const cleanName = (name || 'student')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 7) || 'student';
  const randomSuffix = Math.floor(100 + Math.random() * 900);

  if (courseId.includes('sainik') || courseId.includes('aissee')) {
    return `sainik_${cleanName}${randomSuffix}`;
  }
  if (courseId.includes('navodaya') || courseId.includes('jnvst')) {
    return `jnvst_${cleanName}${randomSuffix}`;
  }
  if (courseId.includes('neet')) {
    return `neet_${cleanName}${randomSuffix}`;
  }
  if (courseId.includes('jee')) {
    return `jee_${cleanName}${randomSuffix}`;
  }
  if (courseId.includes('keam')) {
    return `keam_${cleanName}${randomSuffix}`;
  }
  if (courseId.includes('claude')) {
    return `claude_${cleanName}${randomSuffix}`;
  }
  return `nc_${cleanName}${randomSuffix}`;
}

/**
 * Generates a clean, secure temporary student access password.
 */
export function generateStudentPassword(courseId: string): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  if (courseId.includes('sainik') || courseId.includes('aissee')) {
    return `Sainik@${digits}`;
  }
  if (courseId.includes('navodaya') || courseId.includes('jnvst')) {
    return `Navodaya@${digits}`;
  }
  if (courseId.includes('neet')) {
    return `Neet@${digits}`;
  }
  return `NextClass@${digits}`;
}

/**
 * Formats a clean, readable text email for student credentials delivery.
 */
export function formatCredentialsEmailBody(account: RegisteredStudentAccount): string {
  const portalUrl = getAppPortalUrl();
  const standardNote = account.standard ? `• Standard / Class: ${account.standard.replace('class-', 'Class ')}\n` : '';
  return `Dear ${account.name},

Congratulations! Your enrollment in Nextclasses.in Academy is confirmed.

Here are your official Student Learning Portal credentials:
------------------------------------------------------------
• Enrolled Course: ${account.courseTitle}
${standardNote}• Student Portal URL: ${portalUrl}
• Username: ${account.username} (or use your email: ${account.email})
• Password: ${account.password}
• Payment Ref (UTR): ${account.paymentReference || 'VERIFIED'}
------------------------------------------------------------

What's Included with Your Account:
1. Complete Printable Study Pack (PDF) containing syllabus blueprints, high-yield formula sheets, and non-verbal reasoning rules.
2. Full video masterclass lessons covering every high-yield subject.
3. Computer-Based (CBT) Mock Test simulation with instant scoring and explanations.
4. Weekly Sunday Study Drops dispatched straight to your portal & WhatsApp.

Need Help?
Connect with your Nextclasses.in Mentor on WhatsApp: +91 82816 44058
Email: support@nextclasses.in

Best wishes for your exam preparation!
Academic Director, Nextclasses.in Academy`;
}

/**
 * Creates a mailto: link so that the student or admin can immediately open their email client
 * with the pre-filled credentials.
 */
export function generateMailtoUrl(account: RegisteredStudentAccount): string {
  const subject = `Welcome to Nextclasses.in: Your Student Login ID & Password (${account.courseTitle.slice(0, 30)}...)`;
  const body = formatCredentialsEmailBody(account);
  return `mailto:${encodeURIComponent(account.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Creates a direct Gmail web compose link with the pre-filled recipient, subject, and credentials.
 */
export function generateGmailComposeUrl(account: RegisteredStudentAccount): string {
  const subject = `Welcome to Nextclasses.in: Your Student Login ID & Password (${account.courseTitle.slice(0, 30)}...)`;
  const body = formatCredentialsEmailBody(account);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(account.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Sends student credentials via the backend email API endpoint.
 */
export async function sendStudentCredentialsEmail(
  account: RegisteredStudentAccount
): Promise<{ success: boolean; message: string; gmailComposeUrl?: string; mailtoUrl?: string; outboundSmtpSent?: boolean }> {
  try {
    const res = await fetch('/api/email/send-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toEmail: account.email,
        studentName: account.name,
        username: account.username,
        password: account.password,
        courseTitle: account.courseTitle,
        courseId: account.courseId,
        utrNumber: account.paymentReference || 'UPI-PAID',
        portalUrl: getAppPortalUrl(),
      }),
    });
    const data = await res.json();
    return {
      success: data.success ?? true,
      message: data.message || 'Credentials email dispatched',
      gmailComposeUrl: data.gmailComposeUrl || generateGmailComposeUrl(account),
      mailtoUrl: data.mailtoUrl || generateMailtoUrl(account),
      outboundSmtpSent: data.outboundSmtpSent,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to dispatch email',
      gmailComposeUrl: generateGmailComposeUrl(account),
      mailtoUrl: generateMailtoUrl(account),
    };
  }
}

/**
 * Registers a student who has paid, generates their username and password,
 * saves them to the persistent registry, dispatches the email via the backend,
 * and returns the generated account object.
 */
export async function registerPaidStudent(details: {
  name: string;
  email: string;
  phone: string;
  courseId: string;
  amount?: number;
  utrNumber?: string;
  username?: string;
  password?: string;
  courseTitle?: string;
}): Promise<RegisteredStudentAccount> {
  const students = getRegisteredStudents();
  const cleanEmail = details.email.trim().toLowerCase();
  const cleanPhone = details.phone.replace(/[^0-9]/g, '');
  const course = COURSES_DATA.find((c) => c.id === details.courseId) || COURSES_DATA[2];

  // Check if this student email is already registered for this course
  let existing = students.find((s) =>
    (s.email.toLowerCase() === cleanEmail && s.courseId === details.courseId) ||
    Boolean(details.utrNumber && s.paymentReference === details.utrNumber)
  );

  let account: RegisteredStudentAccount;

  if (existing) {
    // Refresh the account and its course assignment. This is also used by the
    // admin's "Correct & Regenerate Login" action after correcting a claim.
    account = {
      ...existing,
      name: details.name.trim(),
      phone: `+91 ${cleanPhone}`,
      username: details.username || existing.username,
      password: details.password || existing.password,
      courseId: details.courseId,
      courseTitle: details.courseTitle || course.title,
      enrolledCourseIds: [details.courseId],
      targetExamCode: course.targetExamCode || 'OTHER',
      targetExamDate: course.defaultExamDate,
      learningGoal: `Excel in ${details.courseTitle || course.title}`,
      amount: details.amount || existing.amount,
      utrNumber: details.utrNumber || existing.utrNumber,
      paymentReference: details.utrNumber || existing.paymentReference,
    };
    const index = students.findIndex((s) => s.id === existing.id);
    students[index] = account;
  } else {
    // Create fresh credentials
    const username = generateStudentUsername(details.name, details.courseId);
    const password = generateStudentPassword(details.courseId);
    
    account = {
      id: `student-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: details.name.trim(),
      email: cleanEmail,
      phone: `+91 ${cleanPhone}`,
      username: details.username || username,
      password: details.password || password,
      courseId: details.courseId,
      courseTitle: details.courseTitle || course.title,
      enrolledCourseIds: [details.courseId],
      targetExamCode: course.targetExamCode || 'AISSEE',
      targetExamDate: course.defaultExamDate || '2027-01-10',
      learningGoal: `Excel in ${course.title}`,
      registeredAt: new Date().toISOString().split('T')[0],
      paymentReference: details.utrNumber || `UPI-${Date.now().toString().slice(-6)}`,
      credentialsDeliveredViaEmail: true,
      credentialsEmailSentAt: new Date().toISOString(),
      amount: details.amount || course.price,
      emailSent: true,
    };

    students.unshift(account);
  }

  // Save to local registry
  saveRegisteredStudents(students);

  // Also record in general enrollments for Admin Dispatcher
  try {
    const rawEnr = localStorage.getItem('nextclass_all_enrollments');
    const enrList = rawEnr ? JSON.parse(rawEnr) : [];
    enrList.unshift({
      id: account.id,
      studentName: account.name,
      email: account.email,
      phone: cleanPhone,
      courseId: account.courseId,
      courseTitle: account.courseTitle,
      utrNumber: account.paymentReference,
      amount: account.amount || 1799,
      username: account.username,
      password: account.password,
      timestamp: new Date().toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
    localStorage.setItem('nextclass_all_enrollments', JSON.stringify(enrList));
  } catch {
    // ignore
  }

  // 1. Dispatch Email to student via backend /api/email/send-credentials
  try {
    await fetch('/api/email/send-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toEmail: account.email,
        studentName: account.name,
        username: account.username,
        password: account.password,
        courseTitle: account.courseTitle,
        courseId: account.courseId,
        utrNumber: account.paymentReference,
        portalUrl: getAppPortalUrl(),
      }),
    });
  } catch (err) {
    console.warn('Backend email dispatch notification notice:', err);
  }

  // 2. Dispatch WhatsApp confirmation with credentials
  if (cleanPhone) {
    try {
      const waMessage = `🎉 *Nextclasses.in Academy: Student Login Credentials* 🎓\n\n` +
        `Hi *${account.name}*, your enrollment in *${account.courseTitle}* is verified!\n\n` +
        `🔐 *Your Student Portal Login:* \n` +
        `• *Username:* \`${account.username}\`\n` +
        `• *Password:* \`${account.password}\`\n` +
        `• *Portal Link:* ${getAppPortalUrl()}\n\n` +
        `📚 *Your Study Pack:* Log in to download your printable PDF study materials, formula sheets, and take the timed CBT mock test.\n\n` +
        `💬 *Tutor Helpline WhatsApp:* +91 82816 44058`;

      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          recipientName: account.name,
          messageType: 'enrollment',
          customMessage: waMessage,
        }),
      });
    } catch {
      // ignore
    }
  }

  return account;
}

/**
 * Verifies credentials and returns the student record with their enrolled course.
 * Enforces strict authentication so arbitrary fake credentials cannot gain access.
 */
export function verifyStudentCredentials(
  identifier: string,
  passwordInput: string
): RegisteredStudentAccount | null {
  const students = getRegisteredStudents();
  const cleanIdentifier = identifier.trim().toLowerCase();
  const rawNumbers = cleanIdentifier.replace(/[^0-9]/g, '');
  const cleanPassword = passwordInput.trim();

  if (!cleanIdentifier || !cleanPassword) return null;

  const found = students.find((s) => {
    const studentUser = s.username ? s.username.toLowerCase() : '';
    const studentEmail = s.email ? s.email.toLowerCase() : '';
    const studentPhoneClean = s.phone ? s.phone.replace(/[^0-9]/g, '') : '';

    const matchesUser = studentUser === cleanIdentifier;
    const matchesEmail = studentEmail === cleanIdentifier;
    // For phone lookup, require exact full phone number match (or matching last 10 digits)
    const matchesPhone = rawNumbers.length >= 10 && (studentPhoneClean === rawNumbers || studentPhoneClean.endsWith(rawNumbers));
    const matchesPass = s.password === cleanPassword;

    return (matchesUser || matchesEmail || matchesPhone) && matchesPass;
  });

  return found || null;
}

/**
 * Checks whether a given student user matches an active registered account.
 */
export function isRegisteredStudent(user: StudentUser | null): boolean {
  if (!user || !user.email) return false;
  const students = getRegisteredStudents();
  const cleanEmail = user.email.trim().toLowerCase();
  return students.some((s) => s.email.toLowerCase() === cleanEmail);
}
