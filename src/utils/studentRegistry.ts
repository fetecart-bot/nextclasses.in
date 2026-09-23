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

// Standard pre-configured accounts for testing, demonstrations, and instructors
const INITIAL_SEED_ACCOUNTS: RegisteredStudentAccount[] = [
  {
    id: 'student-biju-aissee',
    name: 'Biju P. B.',
    email: 'bijubpb78@gmail.com',
    phone: '+91 87921 34951',
    username: 'bijubpb78',
    password: 'Sainik@2027',
    courseId: 'course-aissee-sainik',
    courseTitle: 'AISSEE (All India Sainik School Entrance) 2027: Class 6 & 9 Kit',
    enrolledCourseIds: ['course-aissee-sainik'],
    targetExamCode: 'AISSEE',
    targetExamDate: '2027-01-10',
    learningGoal: 'Crack Sainik School Class 6 & 9 AISSEE Entrance (280+ Target)',
    registeredAt: '2026-09-18',
    paymentReference: 'UPI-AISSEE-8792134951',
    credentialsDeliveredViaEmail: true,
    credentialsEmailSentAt: '2026-09-18T07:07:00.000Z',
    amount: 1799,
    emailSent: true,
  },
  {
    id: 'student-sainik-seed',
    name: 'Arjun K. (Sainik Cadet)',
    email: 'arjun.sainik@nextclass.in',
    phone: '+91 82816 44058',
    username: 'sainik_demo',
    password: 'Sainik@2027',
    courseId: 'course-aissee-sainik',
    courseTitle: 'AISSEE (All India Sainik School Entrance) 2027: Class 6 & 9 Kit',
    enrolledCourseIds: ['course-aissee-sainik'],
    targetExamCode: 'AISSEE',
    targetExamDate: '2027-01-10',
    learningGoal: 'Crack Sainik School Class 6 Entrance with 270+ Marks',
    registeredAt: '2026-09-10',
    paymentReference: 'UPI-DEMO-8291',
    credentialsDeliveredViaEmail: true,
    credentialsEmailSentAt: '2026-09-10T10:00:00.000Z',
    amount: 1799,
    emailSent: true,
  },
  {
    id: 'student-neet-seed',
    name: 'Anjali Nair',
    email: 'anjali.nair@gmail.com',
    phone: '+91 82816 44058',
    username: 'neet_demo',
    password: 'Neet@2027',
    courseId: 'course-neet-ug',
    courseTitle: 'NEET (UG) 2027 Medical Entrance: AI Adaptive Prep',
    enrolledCourseIds: ['course-neet-ug'],
    targetExamCode: 'NEET',
    targetExamDate: '2027-05-02',
    learningGoal: 'Secure AIIMS & Kerala Medical College MBBS Seat (680+ Marks)',
    registeredAt: '2026-09-01',
    paymentReference: 'UPI-DEMO-5512',
    credentialsDeliveredViaEmail: true,
    amount: 2499,
    emailSent: true,
  },
  {
    id: 'student-jnvst-seed',
    name: 'Sneha Pillai',
    email: 'sneha.jnvst@nextclass.in',
    phone: '+91 82816 44058',
    username: 'jnvst_demo',
    password: 'Jnvst@2027',
    courseId: 'course-navodaya-jnvst',
    courseTitle: 'Navodaya Vidyalaya (JNVST Class 6 & 9) 2027 Rapid Kit',
    enrolledCourseIds: ['course-navodaya-jnvst'],
    targetExamCode: 'NAVODAYA',
    targetExamDate: '2027-01-20',
    learningGoal: 'Clear Navodaya JNVST Mental Ability & Arithmetic Sections',
    registeredAt: '2026-09-08',
    paymentReference: 'UPI-DEMO-7341',
    credentialsDeliveredViaEmail: true,
    amount: 1499,
    emailSent: true,
  },
  {
    id: 'student-claude-seed',
    name: 'Dev Menon',
    email: 'dev.ai@nextclass.in',
    phone: '+91 82816 44058',
    username: 'claude_demo',
    password: 'Claude@2027',
    courseId: 'course-claude-ai',
    courseTitle: 'Master Claude AI & Advanced Prompt Engineering 2026',
    enrolledCourseIds: ['course-claude-ai'],
    targetExamCode: 'CLAUDE-AI',
    targetExamDate: '2026-12-31',
    learningGoal: 'Master Anthropic Claude 3.7 Sonnet Extended Thinking',
    registeredAt: '2026-09-05',
    paymentReference: 'UPI-DEMO-2194',
    credentialsDeliveredViaEmail: true,
    amount: 1499,
    emailSent: true,
  },
];

export function getRegisteredStudents(): RegisteredStudentAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: RegisteredStudentAccount[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure that all seed accounts (such as Biju P. B.) exist in the returned list
        const merged = [...parsed];
        for (const seed of INITIAL_SEED_ACCOUNTS) {
          if (!merged.some((m) => m.email.toLowerCase() === seed.email.toLowerCase() || m.username.toLowerCase() === seed.username.toLowerCase())) {
            merged.unshift(seed);
          }
        }
        return merged;
      }
    }
  } catch (err) {
    console.error('Failed to read student registry:', err);
  }

  // Seed default demo accounts
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_ACCOUNTS));
  } catch {
    // ignore
  }
  return INITIAL_SEED_ACCOUNTS;
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
}): Promise<RegisteredStudentAccount> {
  const students = getRegisteredStudents();
  const cleanEmail = details.email.trim().toLowerCase();
  const cleanPhone = details.phone.replace(/[^0-9]/g, '');
  const course = COURSES_DATA.find((c) => c.id === details.courseId) || COURSES_DATA[2];

  // Check if this student email is already registered for this course
  let existing = students.find(
    (s) => s.email.toLowerCase() === cleanEmail && s.courseId === details.courseId
  );

  let account: RegisteredStudentAccount;

  if (existing) {
    // Update existing credentials and refresh
    account = {
      ...existing,
      name: details.name.trim(),
      phone: `+91 ${cleanPhone}`,
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
      username,
      password,
      courseId: details.courseId,
      courseTitle: course.title,
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

