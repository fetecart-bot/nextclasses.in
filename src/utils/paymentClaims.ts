import { COURSES_DATA } from '../data';
import { registerPaidStudent, RegisteredStudentAccount } from './studentRegistry';

export interface PaymentClaim {
  id: string;
  claimCode: string;
  studentName: string;
  email: string;
  phone: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  utrNumber: string;
  paymentMethod: string;
  paymentApp?: string;
  status: 'pending_verification' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
  credentialsGenerated?: {
    username: string;
    password: string;
  };
}

const STORAGE_KEY = 'nextclass_payment_claims_v1';

// Initial seed claims for demonstration & admin testing
const SEED_CLAIMS: PaymentClaim[] = [
  {
    id: 'claim-seed-1',
    claimCode: 'CLAIM-77291',
    studentName: 'Siddharth Varma',
    email: 'siddharth.varma@gmail.com',
    phone: '9847123456',
    courseId: 'course-aissee-sainik',
    courseTitle: 'AISSEE (All India Sainik School Entrance) 2027: Class 6 & 9 Kit',
    amount: 1799,
    utrNumber: '425981726481',
    paymentMethod: 'Direct HDFC UPI (8281644058@hdfc)',
    paymentApp: 'Google Pay',
    status: 'pending_verification',
    submittedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    notes: 'Paid via GPay. Awaiting admin bank reconciliation.',
  },
  {
    id: 'claim-seed-2',
    claimCode: 'CLAIM-66104',
    studentName: 'Ananya Ramesh',
    email: 'ananya.ramesh@gmail.com',
    phone: '8281987654',
    courseId: 'course-deepseek-r1',
    courseTitle: 'DeepSeek R1 Reasoning Model: Deep Dive 2026',
    amount: 899,
    utrNumber: '426019384725',
    paymentMethod: 'Direct HDFC UPI (8281644058@hdfc)',
    paymentApp: 'PhonePe',
    status: 'pending_verification',
    submittedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    notes: 'PhonePe transfer successful. Transaction ref attached.',
  },
];

export function getPaymentClaims(): PaymentClaim[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CLAIMS));
      return SEED_CLAIMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_CLAIMS;
  } catch {
    return SEED_CLAIMS;
  }
}

export function savePaymentClaims(claims: PaymentClaim[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
  } catch {
    // ignore
  }
}

export function assignPaymentClaimCourse(claimId: string, courseId: string): boolean {
  const course = COURSES_DATA.find((item) => item.id === courseId);
  if (!course) return false;
  const claims = getPaymentClaims();
  const claim = claims.find((item) => item.id === claimId);
  if (!claim) return false;
  claim.courseId = course.id;
  claim.courseTitle = course.title;
  savePaymentClaims(claims);
  return true;
}

export async function syncRazorpayPayments(adminKey: string): Promise<{ imported: number; total: number }> {
  const response = await fetch('/api/razorpay-payments', {
    headers: { 'x-admin-key': adminKey },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Unable to read Razorpay payments');

  const claims = getPaymentClaims();
  const knownRefs = new Set(claims.map((claim) => claim.utrNumber));
  let imported = 0;
  for (const payment of payload.payments || []) {
    if (!payment.id || knownRefs.has(payment.id)) continue;
    const exactCourse = COURSES_DATA.find((item) => item.id === payment.courseId);
    const priceMatches = COURSES_DATA.filter((item) => Number(item.price) === Number(payment.amount));
    const course = exactCourse || (priceMatches.length === 1 ? priceMatches[0] : undefined);
    claims.unshift({
      id: `claim-rzp-${payment.id}`,
      claimCode: `RZP-${payment.id.slice(-8).toUpperCase()}`,
      studentName: payment.studentName || 'Razorpay customer',
      email: payment.email || '',
      phone: String(payment.phone || '').replace(/[^0-9]/g, ''),
      courseId: course?.id || payment.courseId || 'course-unassigned',
      courseTitle: course?.title || payment.courseTitle || 'Course confirmation required',
      amount: Number(payment.amount || 0),
      utrNumber: payment.id,
      paymentMethod: `Razorpay ${payment.method || 'payment'}`,
      paymentApp: 'Razorpay',
      status: 'pending_verification',
      submittedAt: payment.createdAt || new Date().toISOString(),
      notes: 'Imported directly from a captured Razorpay payment.',
    });
    knownRefs.add(payment.id);
    imported += 1;
  }
  savePaymentClaims(claims);
  return { imported, total: payload.payments?.length || 0 };
}

export function getPendingClaimsCount(): number {
  const claims = getPaymentClaims();
  return claims.filter((c) => c.status === 'pending_verification').length;
}

/**
 * Submits a new customer payment claim.
 * Saves to local registry and attempts to notify server/admin.
 */
export async function submitPaymentClaim(params: {
  studentName: string;
  email: string;
  phone: string;
  courseId: string;
  courseTitle?: string;
  amount: number;
  utrNumber: string;
  paymentMethod?: string;
  paymentApp?: string;
  notes?: string;
}): Promise<PaymentClaim> {
  const claims = getPaymentClaims();
  const cleanUtr = params.utrNumber.trim();
  const cleanPhone = params.phone.replace(/[^0-9]/g, '');
  const cleanEmail = params.email.trim().toLowerCase();
  
  const course = COURSES_DATA.find((c) => c.id === params.courseId) || COURSES_DATA[2];
  const courseTitle = params.courseTitle || course?.title || 'Nextclasses Academy Course';

  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const claimCode = `CLAIM-${randomSuffix}`;

  const newClaim: PaymentClaim = {
    id: `claim-${Date.now()}-${randomSuffix}`,
    claimCode,
    studentName: params.studentName.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    courseId: params.courseId,
    courseTitle,
    amount: params.amount,
    utrNumber: cleanUtr,
    paymentMethod: params.paymentMethod || 'Direct HDFC UPI (8281644058@hdfc)',
    paymentApp: params.paymentApp || 'UPI App',
    status: 'pending_verification',
    submittedAt: new Date().toISOString(),
    notes: params.notes || '',
  };

  claims.unshift(newClaim);
  savePaymentClaims(claims);

  // Notify backend API & Admin Email (fetecart@gmail.com)
  try {
    await fetch('/api/payment-claims/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClaim),
    });
  } catch (err) {
    console.warn('Backend claim notification dispatch notice:', err);
  }

  return newClaim;
}

/**
 * Admin action: Verifies bank credit, creates student credentials,
 * dispatches email and WhatsApp, and updates claim status to 'approved'.
 */
export async function approvePaymentClaim(
  claimId: string,
  verifiedBy: string = 'Admin (fetecart@gmail.com)',
  adminKey: string = ''
): Promise<{ success: boolean; account?: RegisteredStudentAccount; error?: string }> {
  const claims = getPaymentClaims();
  const index = claims.findIndex((c) => c.id === claimId);
  if (index === -1) {
    return { success: false, error: 'Claim not found' };
  }

  const claim = claims[index];

  if (!claim.courseId || claim.courseId === 'course-unassigned') {
    return { success: false, error: 'Choose the correct course before approval' };
  }

  try {
    // 1. Register student account and dispatch official credentials
    let serverAccount: any = null;
    if (claim.utrNumber.startsWith('pay_')) {
      const response = await fetch('/api/payment-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ paymentId: claim.utrNumber, courseId: claim.courseId, courseTitle: claim.courseTitle }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Unable to verify Razorpay payment');
      serverAccount = payload.account;
    }
    const account = await registerPaidStudent({
      name: claim.studentName,
      email: claim.email,
      phone: claim.phone,
      courseId: claim.courseId,
      amount: claim.amount,
      utrNumber: claim.utrNumber,
      username: serverAccount?.username,
      password: serverAccount?.password,
      courseTitle: claim.courseTitle,
    });

    // 2. Mark claim as approved
    claim.status = 'approved';
    claim.verifiedAt = new Date().toISOString();
    claim.verifiedBy = verifiedBy;
    claim.credentialsGenerated = {
      username: account.username,
      password: account.password,
    };

    claims[index] = claim;
    savePaymentClaims(claims);

    // 3. Notify backend of approval
    try {
      await fetch('/api/payment-claims/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId: claim.id,
          action: 'approve',
          verifiedBy,
          accountUsername: account.username,
        }),
      });
    } catch {
      // ignore
    }

    return { success: true, account };
  } catch (err: any) {
    console.error('Error approving payment claim:', err);
    return { success: false, error: err?.message || 'Failed to approve claim' };
  }
}

/**
 * Admin action: Rejects claim if payment was fake or not credited to HDFC bank account.
 */
export async function rejectPaymentClaim(
  claimId: string,
  reason: string = 'Payment not credited to bank account / Invalid UTR'
): Promise<boolean> {
  const claims = getPaymentClaims();
  const index = claims.findIndex((c) => c.id === claimId);
  if (index === -1) return false;

  claims[index].status = 'rejected';
  claims[index].rejectionReason = reason;
  claims[index].verifiedAt = new Date().toISOString();
  savePaymentClaims(claims);

  // Notify backend
  try {
    await fetch('/api/payment-claims/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        claimId,
        action: 'reject',
        rejectionReason: reason,
      }),
    });
  } catch {
    // ignore
  }

  return true;
}

/**
 * Deletes a claim record from local registry.
 */
export function deletePaymentClaim(claimId: string): boolean {
  const claims = getPaymentClaims();
  const filtered = claims.filter((c) => c.id !== claimId);
  savePaymentClaims(filtered);
  return true;
}
