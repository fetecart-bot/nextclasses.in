import { useState, useEffect, FormEvent } from 'react';
import { 
  X, Plus, Trash2, Edit3, Check, RefreshCw, Download, 
  Package, BookOpen, AlertTriangle, ShieldCheck, DollarSign, 
  Layers, Sparkles, ExternalLink, Copy, Link2, Video, Play, Tv, Eye, EyeOff,
  CreditCard, Key, Smartphone, HelpCircle, CheckCircle2, Lock, Unlock, LogOut,
  Search, Clock, MessageCircle, Send, UserCheck, Loader2, Mail
} from 'lucide-react';
import { AIProduct, Course, ProductCategory, CourseCategory, PortalVideoLesson } from '../types';
import { 
  getPaymentClaims, 
  approvePaymentClaim, 
  rejectPaymentClaim, 
  PaymentClaim 
} from '../utils/paymentClaims';
import { 
  getRegisteredStudents, 
  generateGmailComposeUrl, 
  sendStudentCredentialsEmail, 
  RegisteredStudentAccount 
} from '../utils/studentRegistry';
import { 
  downloadStudyMaterialFile, 
  generateWhatsAppDispatchMessage 
} from '../utils/studyMaterialGenerator';

export function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

interface CatalogAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: AIProduct[];
  courses: Course[];
  portalVideos?: PortalVideoLesson[];
  razorpayKeyId?: string;
  initialTab?: 'reconciliation' | 'products' | 'courses' | 'videos' | 'payments' | 'security';
  onSaveRazorpayKey?: (key: string) => void;
  onAddProduct: (product: AIProduct) => void;
  onUpdateProduct: (product: AIProduct) => void;
  onDeleteProduct: (productId: string) => void;
  onAddCourse: (course: Course) => void;
  onUpdateCourse: (course: Course) => void;
  onDeleteCourse: (course: string) => void;
  onAddPortalVideo?: (video: PortalVideoLesson) => void;
  onUpdatePortalVideo?: (video: PortalVideoLesson) => void;
  onDeletePortalVideo?: (videoId: string) => void;
  onResetPortalVideos?: () => void;
  onResetToDefault: () => void;
}

export default function CatalogAdminModal({
  isOpen,
  onClose,
  products,
  courses,
  portalVideos = [],
  razorpayKeyId = 'rzp_live_TefblkmIMTFIRH',
  initialTab,
  onSaveRazorpayKey,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onAddPortalVideo,
  onUpdatePortalVideo,
  onDeletePortalVideo,
  onResetPortalVideos,
  onResetToDefault,
}: CatalogAdminModalProps) {
  const [activeTab, setActiveTab] = useState<'reconciliation' | 'products' | 'courses' | 'videos' | 'payments' | 'security'>(initialTab || 'reconciliation');
  const [inputRazorpayKey, setInputRazorpayKey] = useState<string>(razorpayKeyId);
  const [keySavedNotice, setKeySavedNotice] = useState<string | null>(null);

  // Admin Password Gate State (Default passcode: "admin123" or user-configured)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('fetecart_admin_authed') === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newPassInput, setNewPassInput] = useState('');
  const [passChangedNotice, setPassChangedNotice] = useState<string | null>(null);

  const getStoredPassword = (): string => {
    try {
      return (localStorage.getItem('fetecart_admin_password') || 'admin123').trim();
    } catch {
      return 'admin123';
    }
  };

  const handleAdminLogin = (e: FormEvent) => {
    e.preventDefault();
    const cleanInput = passwordInput.trim();
    const stored = getStoredPassword();

    // Universal master passwords so admin is NEVER locked out:
    // 1. 'admin123' (case-insensitive)
    // 2. 'fetecart' (case-insensitive)
    // 3. User configured password
    const isMatch =
      cleanInput.toLowerCase() === 'admin123' ||
      cleanInput.toLowerCase() === 'fetecart' ||
      cleanInput === stored ||
      cleanInput.toLowerCase() === stored.toLowerCase();

    if (isMatch) {
      setIsAuthenticated(true);
      setAuthError(null);
      setPasswordInput('');
      try {
        sessionStorage.setItem('fetecart_admin_authed', 'true');
      } catch {
        // ignore
      }
    } else {
      setAuthError('Incorrect passcode. Please try again or reset.');
    }
  };

  const handleResetPasswordToDefault = () => {
    try {
      localStorage.removeItem('fetecart_admin_password');
      localStorage.setItem('fetecart_admin_password', 'admin123');
      setIsAuthenticated(true);
      setAuthError(null);
      setPasswordInput('');
      sessionStorage.setItem('fetecart_admin_authed', 'true');
    } catch {
      setIsAuthenticated(true);
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError(null);
    try {
      sessionStorage.removeItem('fetecart_admin_authed');
    } catch {
      // ignore
    }
  };

  const handleUpdatePassword = (e: FormEvent) => {
    e.preventDefault();
    if (!newPassInput.trim() || newPassInput.trim().length < 4) {
      setPassChangedNotice('Password must be at least 4 characters long.');
      return;
    }
    try {
      localStorage.setItem('fetecart_admin_password', newPassInput.trim());
      setPassChangedNotice('Admin password updated successfully!');
      setNewPassInput('');
      setTimeout(() => {
        setIsChangingPass(false);
        setPassChangedNotice(null);
      }, 2000);
    } catch {
      setPassChangedNotice('Failed to save new password.');
    }
  };
  
  // Product Form State
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<AIProduct>>({
    title: '',
    tagline: '',
    category: 'prompts',
    price: 499,
    originalPrice: 1499,
    badge: 'New 🔥',
    format: 'Notion Template + PDF',
    fileType: 'Digital Download',
    features: ['Instant digital access', 'Lifetime updates', 'Copy-paste workflows'],
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    previewSnippet: 'Instant access via your student portal and email download link.',
  });
  const [featureInput, setFeatureInput] = useState('');

  // Course Form State
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<Partial<Course>>({
    title: '',
    subtitle: '',
    category: 'ai_platforms',
    level: 'Beginner',
    language: 'All Indian Languages & English',
    price: 1999,
    originalPrice: 4999,
    badge: 'Bestseller ⚡',
    duration: 'Self-Paced (Lifetime Access)',
    format: '100% Self-Paced • Instant Access',
    nextCohortDate: 'Instant Access • Lifetime Replay',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    highlights: ['Hands-On Studio Labs', 'Lifetime Community Access', 'Certificate of Completion'],
    toolsCovered: ['Google AI Studio', 'Gemini 2.0 Flash', 'Prompt Engineering'],
  });
  const [highlightInput, setHighlightInput] = useState('');
  const [toolInput, setToolInput] = useState('');

  // Video Form State (Student Portal YouTube Videos)
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoForm, setVideoForm] = useState<Partial<PortalVideoLesson>>({
    title: '',
    duration: '10:00',
    company: 'Nextclasses.in',
    youtubeId: '',
    youtubeUrl: '',
    description: '',
    badge: '1080p Full HD',
  });
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [showResetVideosConfirm, setShowResetVideosConfirm] = useState(false);

  // Confirmation alerts
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'product' | 'course' | 'video'; title: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // --- PAYMENT RECONCILIATION & CLAIMS STATE ---
  const [claims, setClaims] = useState<PaymentClaim[]>([]);
  const [claimsFilter, setClaimsFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [claimsSearchQuery, setClaimsSearchQuery] = useState('');
  const [processingClaimId, setProcessingClaimId] = useState<string | null>(null);
  const [claimStatusNotice, setClaimStatusNotice] = useState<string | null>(null);
  const [copiedUtrId, setCopiedUtrId] = useState<string | null>(null);
  const [registeredStudents, setRegisteredStudents] = useState<RegisteredStudentAccount[]>([]);
  const [showStudentsList, setShowStudentsList] = useState(false);
  const [rejectingClaim, setRejectingClaim] = useState<PaymentClaim | null>(null);
  const [rejectReason, setRejectReason] = useState('Payment not found in bank statement / invalid transaction ref');

  const loadClaimsData = () => {
    try {
      const allClaims = getPaymentClaims();
      setClaims(allClaims);
      const students = getRegisteredStudents();
      setRegisteredStudents(students);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadClaimsData();
    }
  }, [isOpen]);

  const handleApproveClaim = async (claim: PaymentClaim) => {
    setProcessingClaimId(claim.id);
    setClaimStatusNotice(null);
    try {
      const result = await approvePaymentClaim(claim.id, 'Admin (fetecart@gmail.com)');
      if (result.success && result.account) {
        setClaimStatusNotice(`✓ Approved! Generated Credentials for ${claim.studentName} (@${result.account.username}). Study materials unlocked!`);
        loadClaimsData();
      } else {
        setClaimStatusNotice(`⚠️ Approval error: ${result.error || 'Failed to approve'}`);
      }
    } catch (err: any) {
      setClaimStatusNotice(`⚠️ Error approving claim: ${err?.message || 'Unexpected error'}`);
    } finally {
      setProcessingClaimId(null);
      setTimeout(() => setClaimStatusNotice(null), 6000);
    }
  };

  const handleInitiateReject = (claim: PaymentClaim) => {
    setRejectingClaim(claim);
    setRejectReason('Payment not found in bank statement / invalid transaction ref');
  };

  const handleConfirmReject = async () => {
    if (!rejectingClaim) return;
    const claimToReject = rejectingClaim;
    const finalReason = rejectReason.trim() || 'Payment not found in bank statement / invalid transaction ref';

    setProcessingClaimId(claimToReject.id);
    try {
      await rejectPaymentClaim(claimToReject.id, finalReason);
      setClaimStatusNotice(`✓ Claim ${claimToReject.claimCode} from ${claimToReject.studentName} marked as REJECTED.`);
      setRejectingClaim(null);
      loadClaimsData();
    } catch (err: any) {
      setClaimStatusNotice(`⚠️ Failed to reject claim: ${err?.message || 'Error rejecting claim'}`);
    } finally {
      setProcessingClaimId(null);
      setTimeout(() => setClaimStatusNotice(null), 5000);
    }
  };

  const handleCopyUtr = (utr: string, claimId: string) => {
    try {
      navigator.clipboard?.writeText(utr);
      setCopiedUtrId(claimId);
      setTimeout(() => setCopiedUtrId(null), 2500);
    } catch {
      // fallback
    }
  };

  const handleSendClaimWhatsApp = (claim: PaymentClaim) => {
    let cleanPhone = claim.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const username = claim.credentialsGenerated?.username || claim.studentName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const password = claim.credentialsGenerated?.password || 'NextClass@2027';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.nextclasses.in';

    const message = `🎉 *NEXTCLASSES.IN - ENROLLMENT VERIFIED*\n\nDear *${claim.studentName}*,\n\nWe have verified your payment of *₹${claim.amount.toLocaleString('en-IN')}* (${claim.paymentMethod}, Ref: ${claim.utrNumber}) in our account for:\n📚 *${claim.courseTitle}*\n\nYour official student portal login credentials:\n🌐 *Student Portal:* ${origin}\n👤 *Username:* ${username}\n🔑 *Password:* ${password}\n\nStudy materials, mock tests, and video lessons are now unlocked! Need help? WhatsApp us at +91 82816 44058.`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSendClaimEmail = async (claim: PaymentClaim) => {
    const username = claim.credentialsGenerated?.username || claim.studentName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const password = claim.credentialsGenerated?.password || 'NextClass@2027';

    const mockAccount: RegisteredStudentAccount = {
      id: 'acc-' + Date.now(),
      name: claim.studentName,
      email: claim.email,
      phone: claim.phone,
      username,
      password,
      courseId: claim.courseId,
      courseTitle: claim.courseTitle,
      enrolledCourseIds: [claim.courseId],
      targetExamCode: 'AISSEE',
      learningGoal: 'Course Enrollment',
      registeredAt: new Date().toISOString().split('T')[0],
      amount: claim.amount,
    };

    const res = await sendStudentCredentialsEmail(mockAccount);
    if (res.outboundSmtpSent) {
      setClaimStatusNotice(`✓ Credentials & study pack sent directly to ${claim.email} via SMTP!`);
    } else {
      const gmailUrl = res.gmailComposeUrl || generateGmailComposeUrl(mockAccount);
      window.open(gmailUrl, '_blank');
      setClaimStatusNotice(`✓ Opened in Gmail! Click 'Send' to deliver directly to ${claim.email}.`);
    }
    setTimeout(() => setClaimStatusNotice(null), 5000);
  };

  const handleDownloadStudyPack = (courseId: string, studentName: string) => {
    downloadStudyMaterialFile(courseId, studentName);
  };

  if (!isOpen) return null;

  // --- PRODUCT ACTIONS ---
  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setProductForm({
      title: '',
      tagline: '',
      category: 'prompts',
      price: 499,
      originalPrice: 1499,
      badge: 'New 🔥',
      format: 'Notion Template + PDF',
      fileType: 'Digital Download',
      features: ['Instant digital access', 'Lifetime weekly updates', 'Copy-paste workflows'],
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      previewSnippet: 'Instant access via your student portal and email download link.',
    });
    setFeatureInput('');
    setIsEditingProduct(true);
  };

  const handleEditProduct = (product: AIProduct) => {
    setEditingProductId(product.id);
    setProductForm({ ...product });
    setIsEditingProduct(true);
  };

  const handleSaveProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!productForm.title || !productForm.price) return;

    if (editingProductId) {
      // Update existing
      onUpdateProduct({
        ...(productForm as AIProduct),
        id: editingProductId,
      });
    } else {
      // Add new
      const newProduct: AIProduct = {
        id: `product-${Date.now()}`,
        title: productForm.title || 'Untitled Product',
        tagline: productForm.tagline || '',
        category: (productForm.category as ProductCategory) || 'prompts',
        price: Number(productForm.price) || 0,
        originalPrice: Number(productForm.originalPrice) || Number(productForm.price) * 2,
        rating: 5.0,
        downloadsCount: 1,
        badge: productForm.badge || 'New 🔥',
        thumbnail: productForm.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        format: productForm.format || 'Notion + PDF',
        fileType: productForm.fileType || 'Digital Download',
        features: productForm.features && productForm.features.length > 0 ? productForm.features : ['Instant Access', 'Lifetime Updates'],
        previewSnippet: productForm.previewSnippet || 'Instant access via portal.',
      };
      onAddProduct(newProduct);
    }
    setIsEditingProduct(false);
  };

  // --- COURSE ACTIONS ---
  const handleOpenNewCourse = () => {
    setEditingCourseId(null);
    setCourseForm({
      title: '',
      subtitle: '',
      category: 'ai_platforms',
      level: 'Beginner',
      language: 'All Indian Languages & English',
      price: 1999,
      originalPrice: 4999,
      badge: 'Bestseller ⚡',
      duration: 'Self-Paced (Lifetime Access)',
      format: '100% Self-Paced • Instant Access',
      nextCohortDate: 'Instant Access • Lifetime Replay',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
      highlights: ['Hands-On Studio Labs', 'Lifetime Community Access', 'Certificate of Completion'],
      toolsCovered: ['Google AI Studio', 'Gemini 2.0 Flash'],
    });
    setHighlightInput('');
    setToolInput('');
    setIsEditingCourse(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setCourseForm({ ...course });
    setIsEditingCourse(true);
  };

  const handleSaveCourse = (e: FormEvent) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.price) return;

    if (editingCourseId) {
      onUpdateCourse({
        ...(courseForm as Course),
        id: editingCourseId,
      });
    } else {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: courseForm.title || 'Untitled Course',
        subtitle: courseForm.subtitle || '',
        category: (courseForm.category as CourseCategory) || 'ai_platforms',
        level: (courseForm.level as any) || 'Beginner',
        language: (courseForm.language as any) || 'All Indian Languages & English',
        price: Number(courseForm.price) || 0,
        originalPrice: Number(courseForm.originalPrice) || Number(courseForm.price) * 2,
        rating: 4.9,
        reviewCount: 15,
        enrolledCount: 30,
        badge: courseForm.badge || 'New 🌟',
        thumbnail: courseForm.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
        duration: courseForm.duration || '4 Weeks',
        format: (courseForm.format as any) || '100% Self-Paced • Instant Access',
        nextCohortDate: courseForm.nextCohortDate || 'Instant Access • Lifetime Replay',
        highlights: courseForm.highlights && courseForm.highlights.length > 0 ? courseForm.highlights : ['Comprehensive syllabus', 'Certificate'],
        toolsCovered: courseForm.toolsCovered && courseForm.toolsCovered.length > 0 ? courseForm.toolsCovered : ['AI Tools'],
        curriculum: [
          {
            moduleNumber: 1,
            title: 'Foundation & Setup',
            duration: 'Week 1',
            lessons: ['Orientation and environment setup', 'Core principles & practical workflow']
          },
          {
            moduleNumber: 2,
            title: 'Advanced Implementation & Projects',
            duration: 'Week 2',
            lessons: ['Hands-on project development', 'Deployment & real-world workflows']
          }
        ],
        targetAudience: ['Students', 'Professionals', 'Enthusiasts'],
        instructor: {
          name: 'Nextclasses.in Faculty',
          role: 'Industry Practitioner & AI Educator',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          bio: 'Experienced AI engineer and mentor.',
          credentials: 'Top Rated Instructor'
        }
      };
      onAddCourse(newCourse);
    }
    setIsEditingCourse(false);
  };

  const handleStartAddVideo = () => {
    setEditingVideoId(null);
    setVideoForm({
      title: '',
      duration: '10:00',
      company: 'Nextclasses.in',
      youtubeId: '',
      youtubeUrl: '',
      description: '',
      badge: 'Verified Video • 1080p',
    });
    setVideoUrlInput('');
    setIsEditingVideo(true);
  };

  const handleStartEditVideo = (video: PortalVideoLesson) => {
    setEditingVideoId(video.id);
    setVideoForm({ ...video });
    setVideoUrlInput(video.youtubeUrl || video.youtubeId);
    setIsEditingVideo(true);
  };

  const handleSaveVideo = (e: FormEvent) => {
    e.preventDefault();
    const finalYId = extractYouTubeId(videoUrlInput || videoForm.youtubeId || videoForm.youtubeUrl || '');
    if (!finalYId) {
      alert('Please enter a valid YouTube video link (e.g. https://www.youtube.com/watch?v=...) or an 11-character video ID.');
      return;
    }

    const payload: PortalVideoLesson = {
      id: editingVideoId || `portal-vid-${Date.now()}`,
      title: videoForm.title?.trim() || 'Untitled Video Lesson',
      duration: videoForm.duration?.trim() || '10:00',
      company: videoForm.company?.trim() || 'Nextclasses.in',
      youtubeId: finalYId,
      youtubeUrl: `https://www.youtube.com/watch?v=${finalYId}`,
      description: videoForm.description?.trim() || 'Interactive video lesson walkthrough.',
      badge: videoForm.badge?.trim() || 'Verified Video • 1080p',
      completed: false,
    };

    if (editingVideoId) {
      onUpdatePortalVideo?.(payload);
    } else {
      onAddPortalVideo?.(payload);
    }
    setIsEditingVideo(false);
    setEditingVideoId(null);
    setVideoUrlInput('');
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ products, courses, portalVideos }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nextclass_catalog_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-in fade-in duration-200">
        <div 
          className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-neutral-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-orange-500/20 mb-3">
              <Lock className="w-6 h-6 text-neutral-950" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Staff & Merchant Admin</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Restricted area. Please enter your administrator passcode to access catalog and payment controls.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Admin Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="Enter administrator passcode"
                  autoFocus
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-neutral-950 border border-neutral-700 text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 text-sm tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                  title={showPassword ? "Hide passcode" : "Show passcode"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-xs text-rose-400 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{authError}</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleResetPasswordToDefault}
                    className="text-[11px] text-orange-400 hover:text-orange-300 underline cursor-pointer block font-medium"
                  >
                    Click here to reset passcode to default & unlock instantly
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Admin</span>
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-800/80 text-center">
            <span className="text-[11px] text-neutral-500">
              Authorized personnel only • Fetecart Store & Nextclasses.in
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-orange-500/20">
              <ShieldCheck className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">Nextclasses.in Admin & Payment Reconciliation Portal</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Reconcile Razorpay & UPI payments, verify student enrollments, issue credentials, and manage course catalog.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJSON}
              title="Export catalog as JSON backup"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              title="Restore factory default catalog"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-rose-950/60 hover:text-rose-300 text-xs font-semibold text-neutral-300 border border-neutral-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleAdminLogout}
              title="Lock Admin Session"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 border border-neutral-700 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Lock Admin</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-neutral-800 bg-neutral-950/50 overflow-x-auto scrollbar-none">
          {/* TAB 1: PAYMENT RECONCILIATION */}
          <button
            type="button"
            onClick={() => setActiveTab('reconciliation')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'reconciliation'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <span>Payment Reconciliation</span>
            {claims.filter((c) => c.status === 'pending_verification').length > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-neutral-950 animate-pulse">
                {claims.filter((c) => c.status === 'pending_verification').length} Pending
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-400">
                {claims.length}
              </span>
            )}
          </button>

          {/* TAB 2: DIGITAL PRODUCTS */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('products');
              setIsEditingProduct(false);
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'products'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Digital Products ({products.length})</span>
          </button>

          {/* TAB 3: COURSES & PROGRAMS */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('courses');
              setIsEditingCourse(false);
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'courses'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Courses & Programs ({courses.length})</span>
          </button>

          {/* TAB 4: PORTAL VIDEOS */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('videos');
              setIsEditingVideo(false);
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'videos'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Video className="w-4 h-4 text-red-400" />
            <span>Portal Videos ({portalVideos.length})</span>
          </button>

          {/* TAB 5: PAYMENT GATEWAY (RAZORPAY) */}
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Payment Gateway (Razorpay)</span>
            {razorpayKeyId && razorpayKeyId.startsWith('rzp_') && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>

          {/* TAB 6: ADMIN SECURITY */}
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>Admin Passcode</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-900/60">
          
          {/* TAB 1: DIGITAL PRODUCTS */}
          {activeTab === 'products' && (
            <div>
              {!isEditingProduct ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-base font-bold text-white">Active Digital Products</h4>
                      <p className="text-xs text-neutral-400">Prompt vaults, educator toolkits, eBooks, and templates.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenNewProduct}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-neutral-950 font-extrabold text-xs transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Product</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between gap-3"
                      >
                        <div className="flex gap-3">
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-16 h-16 rounded-lg object-cover border border-neutral-800 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300">
                                {product.category.toUpperCase()}
                              </span>
                              {product.badge && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                            <h5 className="font-bold text-white text-sm truncate">{product.title}</h5>
                            <p className="text-xs text-neutral-400 line-clamp-1">{product.tagline}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 text-xs">
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-black text-amber-400">₹{product.price}</span>
                            <span className="text-neutral-500 line-through">₹{product.originalPrice}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditProduct(product)}
                              className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-orange-500 text-neutral-200 hover:text-white transition-colors"
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemToDelete({ id: product.id, type: 'product', title: product.title })}
                              className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-rose-500 text-neutral-400 hover:text-rose-400 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* PRODUCT EDIT / ADD FORM */
                <form onSubmit={handleSaveProduct} className="max-w-2xl mx-auto space-y-4 bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{editingProductId ? 'Edit Product' : 'Add New Digital Product'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsEditingProduct(false)}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={productForm.title || ''}
                        onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                        placeholder="e.g., Master AI Prompt Engineering Vault"
                        className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">Tagline / Short Summary *</label>
                      <input
                        type="text"
                        required
                        value={productForm.tagline || ''}
                        onChange={(e) => setProductForm({ ...productForm, tagline: e.target.value })}
                        placeholder="e.g., 500+ curated system prompts for productivity"
                        className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Category</label>
                        <select
                          value={productForm.category || 'prompts'}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                        >
                          <option value="prompts">Prompt Vaults</option>
                          <option value="toolkits">Educator Systems</option>
                          <option value="ebooks">eBooks & Guides</option>
                          <option value="templates">Templates</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Price (₹) *</label>
                        <input
                          type="number"
                          required
                          value={productForm.price || ''}
                          onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                          placeholder="499"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Original Price (₹)</label>
                        <input
                          type="number"
                          value={productForm.originalPrice || ''}
                          onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                          placeholder="1499"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={productForm.badge || ''}
                          onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                          placeholder="Bestseller 🔥 or 60% OFF"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Format</label>
                        <input
                          type="text"
                          value={productForm.format || ''}
                          onChange={(e) => setProductForm({ ...productForm, format: e.target.value })}
                          placeholder="Notion Template + PDF"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">File Type</label>
                        <input
                          type="text"
                          value={productForm.fileType || ''}
                          onChange={(e) => setProductForm({ ...productForm, fileType: e.target.value })}
                          placeholder="Digital Download"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">Thumbnail Image URL</label>
                      <input
                        type="url"
                        value={productForm.thumbnail || ''}
                        onChange={(e) => setProductForm({ ...productForm, thumbnail: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">Bullet Point Features</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={featureInput}
                          onChange={(e) => setFeatureInput(e.target.value)}
                          placeholder="Add a feature (e.g. 500+ curated prompts)"
                          className="flex-1 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (featureInput.trim()) {
                                setProductForm({
                                  ...productForm,
                                  features: [...(productForm.features || []), featureInput.trim()],
                                });
                                setFeatureInput('');
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (featureInput.trim()) {
                              setProductForm({
                                ...productForm,
                                features: [...(productForm.features || []), featureInput.trim()],
                              });
                              setFeatureInput('');
                            }
                          }}
                          className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold"
                        >
                          Add
                        </button>
                      </div>

                      <div className="space-y-1">
                        {productForm.features?.map((feat, idx) => (
                          <div key={idx} className="flex items-center justify-between px-2.5 py-1.5 rounded bg-neutral-900 text-neutral-300 text-xs">
                            <span>• {feat}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setProductForm({
                                  ...productForm,
                                  features: productForm.features?.filter((_, i) => i !== idx),
                                });
                              }}
                              className="text-neutral-500 hover:text-rose-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setIsEditingProduct(false)}
                      className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-neutral-950 text-xs font-extrabold shadow"
                    >
                      {editingProductId ? 'Save Changes' : 'Create Product'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: COURSES & PREP PROGRAMS */}
          {activeTab === 'courses' && (
            <div>
              {!isEditingCourse ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-base font-bold text-white">Active Courses & Exam Tracks</h4>
                      <p className="text-xs text-neutral-400">AI Platform masterclasses and Indian competitive exam prep programs.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenNewCourse}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-neutral-950 font-extrabold text-xs transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Course</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between gap-3"
                      >
                        <div className="flex gap-3">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-16 h-16 rounded-lg object-cover border border-neutral-800 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300">
                                {course.category.replace('_', ' ').toUpperCase()}
                              </span>
                              {course.badge && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">
                                  {course.badge}
                                </span>
                              )}
                            </div>
                            <h5 className="font-bold text-white text-sm line-clamp-1">{course.title}</h5>
                            <p className="text-xs text-neutral-400 line-clamp-1">{course.subtitle}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 text-xs">
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-black text-orange-400">₹{course.price}</span>
                            <span className="text-neutral-500 line-through">₹{course.originalPrice}</span>
                            <span className="text-[11px] text-neutral-400">({course.duration})</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditCourse(course)}
                              className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-orange-500 text-neutral-200 hover:text-white transition-colors"
                              title="Edit Course"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemToDelete({ id: course.id, type: 'course', title: course.title })}
                              className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-rose-500 text-neutral-400 hover:text-rose-400 transition-colors"
                              title="Delete Course"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* COURSE ADD / EDIT FORM */
                <form onSubmit={handleSaveCourse} className="max-w-2xl mx-auto space-y-4 bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                    <h4 className="text-base font-bold text-white">
                      {editingCourseId ? 'Edit Course Program' : 'Add New Course / Exam Track'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsEditingCourse(false)}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">Course Title *</label>
                      <input
                        type="text"
                        required
                        value={courseForm.title || ''}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                        placeholder="e.g., Python AI Agents & Autonomous Workflows"
                        className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">Subtitle / Goal *</label>
                      <input
                        type="text"
                        required
                        value={courseForm.subtitle || ''}
                        onChange={(e) => setCourseForm({ ...courseForm, subtitle: e.target.value })}
                        placeholder="e.g., Build autonomous multi-agent systems with Google AI Studio"
                        className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Category</label>
                        <select
                          value={courseForm.category || 'ai_platforms'}
                          onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value as CourseCategory })}
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                        >
                          <option value="ai_platforms">AI Platforms</option>
                          <option value="competitive_exams">Competitive Exams</option>
                          <option value="languages">Languages & Public Speaking</option>
                          <option value="educators">Teachers & Educators</option>
                          <option value="students">Students & Academics</option>
                          <option value="beginners">Beginners & GenAI</option>
                          <option value="creators">Creators & Designers</option>
                          <option value="automation">Automations & Agents</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Price (₹) *</label>
                        <input
                          type="number"
                          required
                          value={courseForm.price || ''}
                          onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                          placeholder="1999"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Original Price (₹)</label>
                        <input
                          type="number"
                          value={courseForm.originalPrice || ''}
                          onChange={(e) => setCourseForm({ ...courseForm, originalPrice: Number(e.target.value) })}
                          placeholder="4999"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Duration</label>
                        <input
                          type="text"
                          value={courseForm.duration || ''}
                          onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                          placeholder="4 Weeks (16 Hours)"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Format</label>
                        <input
                          type="text"
                          value={courseForm.format || ''}
                          onChange={(e) => setCourseForm({ ...courseForm, format: e.target.value as any })}
                          placeholder="100% Self-Paced • Instant Access"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Delivery Medium</label>
                        <input
                          type="text"
                          value={courseForm.language || ''}
                          onChange={(e) => setCourseForm({ ...courseForm, language: e.target.value as any })}
                          placeholder="All Indian Languages & English"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Badge</label>
                        <input
                          type="text"
                          value={courseForm.badge || ''}
                          onChange={(e) => setCourseForm({ ...courseForm, badge: e.target.value })}
                          placeholder="Bestseller ⚡"
                          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">Thumbnail URL</label>
                      <input
                        type="url"
                        value={courseForm.thumbnail || ''}
                        onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">Highlights</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={highlightInput}
                          onChange={(e) => setHighlightInput(e.target.value)}
                          placeholder="e.g. 1-on-1 Code Reviews"
                          className="flex-1 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (highlightInput.trim()) {
                              setCourseForm({
                                ...courseForm,
                                highlights: [...(courseForm.highlights || []), highlightInput.trim()],
                              });
                              setHighlightInput('');
                            }
                          }}
                          className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold"
                        >
                          Add
                        </button>
                      </div>
                      <div className="space-y-1">
                        {courseForm.highlights?.map((hl, idx) => (
                          <div key={idx} className="flex items-center justify-between px-2.5 py-1.5 rounded bg-neutral-900 text-neutral-300 text-xs">
                            <span>• {hl}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setCourseForm({
                                  ...courseForm,
                                  highlights: courseForm.highlights?.filter((_, i) => i !== idx),
                                });
                              }}
                              className="text-neutral-500 hover:text-rose-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setIsEditingCourse(false)}
                      className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-neutral-950 text-xs font-extrabold shadow"
                    >
                      {editingCourseId ? 'Save Course' : 'Create Course'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 1: PAYMENT RECONCILIATION & CLAIMS VERIFICATION */}
          {activeTab === 'reconciliation' && (
            <div className="space-y-6">
              {/* Notification Banner */}
              {claimStatusNotice && (
                <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{claimStatusNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setClaimStatusNotice(null)}
                    className="p-1 text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Status Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-neutral-950 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400 font-medium">Pending Claims</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {claims.filter((c) => c.status === 'pending_verification').length}
                  </div>
                  <span className="text-[10px] text-neutral-500">Awaiting bank/gateway check</span>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400 font-medium">Verified & Approved</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {claims.filter((c) => c.status === 'approved').length}
                  </div>
                  <span className="text-[10px] text-neutral-500">Credentials active</span>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-rose-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400 font-medium">Rejected Fake Claims</span>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-black text-rose-400 mt-1">
                    {claims.filter((c) => c.status === 'rejected').length}
                  </div>
                  <span className="text-[10px] text-neutral-500">Fraudulent attempts blocked</span>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400 font-medium">Registered Accounts</span>
                    <UserCheck className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="text-2xl font-black text-white mt-1">
                    {registeredStudents.length}
                  </div>
                  <span className="text-[10px] text-neutral-500">Active student accounts</span>
                </div>
              </div>

              {/* Bank & Razorpay Reconciliation Guidance Banner */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-orange-500/30 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">1. Razorpay Verification</h5>
                    <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                      Check <span className="text-emerald-400 font-mono">dashboard.razorpay.com</span> &gt; Transactions. Match the <strong className="text-neutral-200">Payment ID</strong> (<code className="text-emerald-400 font-mono">pay_...</code>). If status is <strong>Captured</strong>, click <strong className="text-emerald-400">Verify & Approve</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0 text-orange-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">2. Direct UPI / HDFC Reconciliation</h5>
                    <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                      Check HDFC NetBanking / App for <span className="text-orange-400 font-mono">8281644058@hdfc</span>. Verify the 12-digit <strong className="text-neutral-200">UTR number</strong> in transaction details before unlocking credentials.
                    </p>
                  </div>
                </div>
              </div>

              {/* Filters, Search & View Switcher */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStudentsList(false);
                      setClaimsFilter('all');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                      !showStudentsList && claimsFilter === 'all'
                        ? 'bg-orange-500 text-neutral-950'
                        : 'bg-neutral-800 text-neutral-300 hover:text-white'
                    }`}
                  >
                    All Claims ({claims.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowStudentsList(false);
                      setClaimsFilter('pending');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                      !showStudentsList && claimsFilter === 'pending'
                        ? 'bg-amber-500 text-neutral-950'
                        : 'bg-neutral-800 text-amber-400 hover:bg-neutral-700'
                    }`}
                  >
                    Pending ({claims.filter((c) => c.status === 'pending_verification').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowStudentsList(false);
                      setClaimsFilter('approved');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                      !showStudentsList && claimsFilter === 'approved'
                        ? 'bg-emerald-500 text-neutral-950'
                        : 'bg-neutral-800 text-emerald-400 hover:bg-neutral-700'
                    }`}
                  >
                    Approved ({claims.filter((c) => c.status === 'approved').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowStudentsList(false);
                      setClaimsFilter('rejected');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                      !showStudentsList && claimsFilter === 'rejected'
                        ? 'bg-rose-500 text-neutral-950'
                        : 'bg-neutral-800 text-rose-400 hover:bg-neutral-700'
                    }`}
                  >
                    Rejected ({claims.filter((c) => c.status === 'rejected').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStudentsList(!showStudentsList)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                      showStudentsList
                        ? 'bg-blue-600 text-white'
                        : 'bg-neutral-800 text-blue-400 hover:bg-neutral-700'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 inline mr-1" />
                    Student Roster ({registeredStudents.length})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={claimsSearchQuery}
                      onChange={(e) => setClaimsSearchQuery(e.target.value)}
                      placeholder="Search name, UTR, phone, email..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs placeholder:text-neutral-500 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={loadClaimsData}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                    title="Refresh Data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* VIEW A: REGISTERED STUDENTS LIST */}
              {showStudentsList ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <h4 className="text-sm font-bold text-white">Active Student Accounts ({registeredStudents.length})</h4>
                    <span className="text-xs text-neutral-400">Credentials generated & portal unlocked</span>
                  </div>

                  {registeredStudents.length === 0 ? (
                    <div className="p-8 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-neutral-400 text-xs">
                      No active student accounts found yet. Approve a pending payment claim to generate credentials.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {registeredStudents.map((account) => (
                        <div
                          key={account.id}
                          className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 space-y-3 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-sm font-bold text-white">{account.name}</div>
                              <div className="text-xs text-neutral-400">{account.email} • {account.phone}</div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-center justify-between text-xs font-mono">
                            <div>
                              <span className="text-neutral-400">User: </span>
                              <strong className="text-orange-400">{account.username}</strong>
                            </div>
                            <div>
                              <span className="text-neutral-400">Pass: </span>
                              <strong className="text-emerald-400">{account.password}</strong>
                            </div>
                          </div>

                          <div className="text-xs text-neutral-300 font-medium">
                            📚 {account.courseTitle}
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/60">
                            <button
                              type="button"
                              onClick={() => handleDownloadStudyPack(account.courseId, account.name)}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-400" />
                              <span>Study Pack</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const claim = claims.find((c) => c.studentName === account.name);
                                if (claim) handleSendClaimWhatsApp(claim);
                              }}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1 border border-emerald-800/60 transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* VIEW B: CLAIMS LIST */
                <div className="space-y-4">
                  {claims
                    .filter((claim) => {
                      if (claimsFilter !== 'all' && claim.status !== claimsFilter) return false;
                      if (claimsSearchQuery.trim()) {
                        const q = claimsSearchQuery.toLowerCase().trim();
                        return (
                          claim.studentName.toLowerCase().includes(q) ||
                          claim.phone.includes(q) ||
                          claim.email.toLowerCase().includes(q) ||
                          claim.utrNumber.toLowerCase().includes(q) ||
                          claim.courseTitle.toLowerCase().includes(q) ||
                          claim.claimCode.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((claim) => {
                      const isPending = claim.status === 'pending_verification';
                      const isApproved = claim.status === 'approved';
                      const isRejected = claim.status === 'rejected';

                      return (
                        <div
                          key={claim.id}
                          className={`p-5 rounded-2xl bg-neutral-950 border transition-all ${
                            isPending
                              ? 'border-amber-500/50 shadow-lg shadow-amber-500/5'
                              : isApproved
                              ? 'border-emerald-500/40'
                              : 'border-rose-500/30 opacity-75'
                          }`}
                        >
                          {/* Claim Top Line */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800/80">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                                {claim.claimCode}
                              </span>
                              <span className="text-xs text-neutral-400">
                                Submitted {new Date(claim.submittedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {isPending && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 animate-spin" />
                                  <span>Pending Verification</span>
                                </span>
                              )}
                              {isApproved && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Approved & Enrolled</span>
                                </span>
                              )}
                              {isRejected && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Rejected</span>
                                </span>
                              )}
                              <span className="text-base font-extrabold text-white">
                                ₹{claim.amount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Claim Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            {/* Left: Student & Course */}
                            <div className="space-y-2">
                              <div>
                                <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">Student Information</span>
                                <div className="text-sm font-bold text-white mt-0.5">{claim.studentName}</div>
                                <div className="text-xs text-neutral-300">{claim.email} • {claim.phone}</div>
                              </div>

                              <div className="pt-1">
                                <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">Enrolled Course / Pack</span>
                                <div className="text-xs font-semibold text-orange-300 mt-0.5">
                                  {claim.courseTitle}
                                </div>
                              </div>

                              {claim.notes && (
                                <div className="pt-1">
                                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">Student Notes</span>
                                  <p className="text-xs text-neutral-400 italic bg-neutral-900 p-2 rounded-lg border border-neutral-800 mt-0.5">
                                    "{claim.notes}"
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Right: Payment Method & Reference Proof */}
                            <div className="space-y-3 bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800">
                              <div>
                                <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">Payment Channel</span>
                                <div className="text-xs font-bold text-neutral-200 mt-0.5 flex items-center gap-2">
                                  <span>{claim.paymentMethod}</span>
                                  {claim.paymentApp && (
                                    <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300">
                                      {claim.paymentApp}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                                  Transaction Ref / 12-Digit UTR
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="text-sm font-black font-mono text-emerald-400 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 tracking-wider">
                                    {claim.utrNumber}
                                  </code>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyUtr(claim.utrNumber, claim.id)}
                                    className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Copy reference number"
                                  >
                                    {copiedUtrId === claim.id ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-emerald-400">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {isApproved && claim.credentialsGenerated && (
                                <div className="pt-2 border-t border-neutral-800">
                                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">Active Credentials</span>
                                  <div className="flex items-center justify-between text-xs font-mono bg-neutral-950 p-2 rounded-lg border border-neutral-800 mt-1">
                                    <span className="text-neutral-400">User: <strong className="text-orange-400">{claim.credentialsGenerated.username}</strong></span>
                                    <span className="text-neutral-400">Pass: <strong className="text-emerald-400">{claim.credentialsGenerated.password}</strong></span>
                                  </div>
                                </div>
                              )}

                              {isRejected && claim.rejectionReason && (
                                <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300">
                                  <strong>Reason for rejection:</strong> {claim.rejectionReason}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons Row */}
                          <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-end gap-2">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleInitiateReject(claim)}
                                  disabled={processingClaimId === claim.id}
                                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-rose-950/60 text-rose-300 text-xs font-bold border border-rose-500/40 hover:border-rose-500 transition-colors cursor-pointer"
                                >
                                  Reject Fake Claim
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApproveClaim(claim)}
                                  disabled={processingClaimId === claim.id}
                                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {processingClaimId === claim.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span>Verifying & Generating...</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShieldCheck className="w-4 h-4" />
                                      <span>Verify & Approve (Generate Login)</span>
                                    </>
                                  )}
                                </button>
                              </>
                            )}

                            {isApproved && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadStudyPack(claim.courseId, claim.studentName)}
                                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title="Download watermarked study material PDF"
                                >
                                  <Download className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Download Study Pack</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSendClaimEmail(claim)}
                                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title="Send official enrollment credentials email"
                                >
                                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                                  <span>Email Credentials</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSendClaimWhatsApp(claim)}
                                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow cursor-pointer"
                                  title="Send login credentials directly to student WhatsApp"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  <span>Send on WhatsApp</span>
                                </button>
                              </>
                            )}

                            {isRejected && (
                              <button
                                type="button"
                                onClick={() => handleApproveClaim(claim)}
                                disabled={processingClaimId === claim.id}
                                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
                              >
                                Re-evaluate Claim
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {claims.length === 0 && (
                    <div className="p-12 text-center rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-400 text-sm">
                      No customer payment claims submitted yet.
                    </div>
                  )}
                </div>
              )}

              {/* IN-APP REJECTION CONFIRMATION DIALOG (Works 100% in all browsers & iframes) */}
              {rejectingClaim && (
                <div className="fixed inset-0 z-[160] bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-neutral-900 border border-rose-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white">Reject Fake / Invalid Claim</h4>
                          <p className="text-xs text-neutral-400">The student will be denied login access & study materials.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRejectingClaim(null)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Claim Summary Box */}
                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Student Name:</span>
                        <strong className="text-white">{rejectingClaim.studentName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Phone & Email:</span>
                        <span className="text-neutral-300">{rejectingClaim.phone} • {rejectingClaim.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Course / Amount:</span>
                        <span className="text-orange-300 font-semibold">{rejectingClaim.courseTitle} (₹{rejectingClaim.amount.toLocaleString('en-IN')})</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-neutral-800/80">
                        <span className="text-neutral-400">Claimed UTR / Ref:</span>
                        <code className="px-2 py-0.5 rounded bg-neutral-900 text-rose-400 font-mono font-bold">
                          {rejectingClaim.utrNumber}
                        </code>
                      </div>
                    </div>

                    {/* Preset Reasons */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-neutral-300">
                        Select Reason for Rejection:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'Payment not found in bank statement',
                          'Invalid / fake 12-digit UTR',
                          'Transaction failed or reversed in bank',
                          'Amount mismatch',
                          'Duplicate transaction reference'
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setRejectReason(preset)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                              rejectReason === preset
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={2}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Detailed reason..."
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs placeholder:text-neutral-500 focus:border-rose-500 outline-none resize-none mt-2"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setRejectingClaim(null)}
                        className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmReject}
                        disabled={processingClaimId === rejectingClaim.id}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                      >
                        {processingClaimId === rejectingClaim.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Rejecting...</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Confirm Rejection (Mark as Fake)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: STUDENT PORTAL VIDEOS */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              {/* Header & Action bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Video className="w-5 h-5 text-red-400" />
                      <span>Student Portal Video Lessons</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {portalVideos.length} Available
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Manage the video lessons displayed in the Student Portal. Add, edit, or delete any YouTube video with automatic ID parsing.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResetVideosConfirm(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold border border-neutral-700 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reset Video Defaults</span>
                  </button>
                  {!isEditingVideo && (
                    <button
                      type="button"
                      onClick={handleStartAddVideo}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-extrabold shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add YouTube Video</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ADD / EDIT VIDEO FORM */}
              {isEditingVideo && (
                <div className="p-6 rounded-2xl bg-neutral-950/80 border border-orange-500/40 shadow-xl space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                        <Video className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        {editingVideoId ? 'Edit YouTube Video Lesson' : 'Add New YouTube Video to Student Portal'}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingVideo(false);
                        setEditingVideoId(null);
                      }}
                      className="text-xs text-neutral-400 hover:text-white p-1 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveVideo} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Video Title */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          Lesson Title <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={videoForm.title || ''}
                          onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                          placeholder="e.g. 01. Complete Guide to Google AI Studio & Gemini 2.0"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* YouTube Link / ID Input with auto extraction */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          YouTube Video URL or 11-Character ID <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={videoUrlInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              setVideoUrlInput(val);
                              const parsedId = extractYouTubeId(val);
                              setVideoForm((prev) => ({
                                ...prev,
                                youtubeId: parsedId,
                                youtubeUrl: parsedId ? `https://www.youtube.com/watch?v=${parsedId}` : val,
                              }));
                            }}
                            placeholder="Paste link: https://www.youtube.com/watch?v=... or https://youtu.be/... or ID"
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-orange-500"
                          />
                          <Link2 className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1">
                          Supports full desktop links, mobile links (youtu.be), YouTube Shorts, embed links, or raw 11-character video IDs.
                        </p>
                      </div>

                      {/* Live Embed Preview if YouTube ID detected */}
                      {videoForm.youtubeId && extractYouTubeId(videoForm.youtubeId).length === 11 && (
                        <div className="md:col-span-2 p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5" />
                              <span>Detected Video ID: <code className="font-mono bg-neutral-800 px-1.5 py-0.5 rounded text-white">{videoForm.youtubeId}</code></span>
                            </span>
                            <a
                              href={`https://www.youtube.com/watch?v=${videoForm.youtubeId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1"
                            >
                              <span>Test Link on YouTube</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="relative aspect-video max-w-md mx-auto rounded-lg overflow-hidden border border-neutral-700 bg-black">
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${videoForm.youtubeId}?rel=0`}
                              title="Live Preview"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}

                      {/* Instructor / Channel */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          Channel / Instructor / Organization
                        </label>
                        <input
                          type="text"
                          value={videoForm.company || ''}
                          onChange={(e) => setVideoForm({ ...videoForm, company: e.target.value })}
                          placeholder="e.g. Nextclasses.in or Google Cloud Tech"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={videoForm.duration || ''}
                          onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                          placeholder="e.g. 12:45"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Badge / Tag */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          Badge Label
                        </label>
                        <input
                          type="text"
                          value={videoForm.badge || ''}
                          onChange={(e) => setVideoForm({ ...videoForm, badge: e.target.value })}
                          placeholder="e.g. Verified Video • 1080p Full HD"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          Lesson Description
                        </label>
                        <textarea
                          rows={3}
                          value={videoForm.description || ''}
                          onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                          placeholder="Overview of topics, exercises, or resources covered in this lecture..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingVideo(false);
                          setEditingVideoId(null);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-neutral-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-neutral-950" />
                        <span>{editingVideoId ? 'Save Video Changes' : 'Publish Video to Portal'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* LIST OF PORTAL VIDEOS */}
              <div className="space-y-3">
                {portalVideos.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
                      <Tv className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">No Video Lessons Configured</h4>
                      <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                        Your student portal currently has no video lessons. Add your own YouTube links or restore the default curated lessons.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleStartAddVideo}
                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-neutral-950 text-xs font-bold cursor-pointer"
                      >
                        + Add First Video
                      </button>
                      <button
                        type="button"
                        onClick={() => onResetPortalVideos?.()}
                        className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer"
                      >
                        Restore Defaults
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {portalVideos.map((video, index) => (
                      <div
                        key={video.id}
                        className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-3 shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          {/* Thumbnail preview with play badge */}
                          <div className="relative w-32 shrink-0 aspect-video rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800">
                            <img
                              src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">
                              {video.duration}
                            </span>
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-75 hover:opacity-100 transition-opacity">
                              <Play className="w-5 h-5 text-white drop-shadow" />
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-800 text-neutral-300">
                                #{index + 1}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 truncate">
                                {video.badge || 'YouTube Video'}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white line-clamp-1">
                              {video.title}
                            </h4>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              {video.company}
                            </p>
                            <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                              {video.description}
                            </p>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-900 text-xs">
                          <span className="text-[10px] font-mono text-neutral-500">
                            ID: {video.youtubeId}
                          </span>
                          <div className="flex items-center gap-2">
                            <a
                              href={video.youtubeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
                              title="Watch on YouTube"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleStartEditVideo(video)}
                              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
                              title="Edit Video Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemToDelete({ id: video.id, type: 'video', title: video.title })}
                              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-rose-950/60 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete Video"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENT GATEWAY & RAZORPAY CONFIGURATION */}
          {activeTab === 'payments' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Header card */}
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>Razorpay Payment Gateway</span>
                        {razorpayKeyId && razorpayKeyId.startsWith('rzp_live_') ? (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Live Production Active
                          </span>
                        ) : razorpayKeyId && razorpayKeyId.startsWith('rzp_test_') ? (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Test Sandbox Mode
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800">
                            Simulator Mode
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Collect real customer payments via UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, Netbanking, & EMI.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Configuration Form */}
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-5">
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <Key className="w-4 h-4 text-orange-400" />
                      <span>Razorpay Key ID Setup</span>
                    </h5>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Enter your public Key ID from your Razorpay Dashboard. (Do NOT enter your Key Secret).
                    </p>
                  </div>
                  {inputRazorpayKey && (
                    <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded">
                      Prefix: {inputRazorpayKey.startsWith('rzp_live_') ? 'Live Production (rzp_live_)' : inputRazorpayKey.startsWith('rzp_test_') ? 'Test Sandbox (rzp_test_)' : 'Custom'}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Razorpay Key ID <span className="text-orange-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={inputRazorpayKey}
                        onChange={(e) => {
                          setInputRazorpayKey(e.target.value.trim());
                          setKeySavedNotice(null);
                        }}
                        placeholder="e.g. rzp_live_xxxxxxxxxxxxxx or rzp_test_xxxxxxxxxxxxxx"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono text-sm focus:outline-none focus:border-orange-500 placeholder:text-neutral-600"
                      />
                      {inputRazorpayKey && (
                        <button
                          type="button"
                          onClick={() => setInputRazorpayKey('')}
                          className="absolute right-3 top-3 text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Only the public Key ID is required on the client side. Your Key Secret is never exposed.</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-neutral-800/60">
                      <span className="text-[11px] text-neutral-400 font-medium">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setInputRazorpayKey('rzp_test_TefOJtQvLEYw4p');
                          if (onSaveRazorpayKey) {
                            onSaveRazorpayKey('rzp_test_TefOJtQvLEYw4p');
                            setKeySavedNotice('Activated Razorpay Test Sandbox Key!');
                            setTimeout(() => setKeySavedNotice(null), 4000);
                          }
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer ${
                          inputRazorpayKey === 'rzp_test_TefOJtQvLEYw4p'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
                            : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        ⚡ Test Sandbox (rzp_test_TefOJtQvLEYw4p)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputRazorpayKey('rzp_live_TefblkmIMTFIRH');
                          if (onSaveRazorpayKey) {
                            onSaveRazorpayKey('rzp_live_TefblkmIMTFIRH');
                            setKeySavedNotice('Activated Razorpay Live Production Key!');
                            setTimeout(() => setKeySavedNotice(null), 4000);
                          }
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer ${
                          inputRazorpayKey === 'rzp_live_TefblkmIMTFIRH'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-semibold'
                            : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        🟢 Live Production (rzp_live_TefblkmIMTFIRH)
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onSaveRazorpayKey) {
                            onSaveRazorpayKey(inputRazorpayKey);
                            setKeySavedNotice('Razorpay Key ID successfully saved and activated!');
                            setTimeout(() => setKeySavedNotice(null), 4000);
                          }
                        }}
                        className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-neutral-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save & Activate Razorpay Key</span>
                      </button>

                      {inputRazorpayKey && (
                        <button
                          type="button"
                          onClick={() => {
                            setInputRazorpayKey('');
                            if (onSaveRazorpayKey) {
                              onSaveRazorpayKey('');
                              setKeySavedNotice('Razorpay key cleared. Reverted to Sandbox Simulator.');
                              setTimeout(() => setKeySavedNotice(null), 4000);
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Clear & Reset to Sandbox
                        </button>
                      )}
                    </div>

                    {keySavedNotice && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{keySavedNotice}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <h5 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>Where to find your Razorpay Key ID</span>
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800/80 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">1</span>
                    <strong className="text-white block pt-1">Log in to Razorpay Dashboard</strong>
                    <p className="text-neutral-400 leading-relaxed">
                      Go to <a href="https://dashboard.razorpay.com/" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">dashboard.razorpay.com <ExternalLink className="w-3 h-3" /></a> with your registered merchant account.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800/80 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">2</span>
                    <strong className="text-white block pt-1">Go to API Keys</strong>
                    <p className="text-neutral-400 leading-relaxed">
                      In the left menu, click <strong>Settings</strong> &gt; <strong>API Keys</strong> tab. If you haven't generated one yet, click <strong>Generate Key</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800/80 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">3</span>
                    <strong className="text-white block pt-1">Copy "Key ID" & Paste Above</strong>
                    <p className="text-neutral-400 leading-relaxed">
                      Copy the <strong>Key ID</strong> (starts with <span className="font-mono text-emerald-400">rzp_live_</span> for real payments or <span className="font-mono text-amber-400">rzp_test_</span> for testing) and paste it into the box above.
                    </p>
                  </div>
                </div>
              </div>

              {/* Supported Payment Modes in Nextclasses.in */}
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h5 className="text-sm font-bold text-white">Supported Customer Payment Methods</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-base block mb-1">📱</span>
                    <span className="text-xs font-bold text-white block">UPI Instant Pay</span>
                    <span className="text-[10px] text-neutral-500">GPay, PhonePe, Paytm, CRED</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-base block mb-1">💳</span>
                    <span className="text-xs font-bold text-white block">Cards (Debit/Credit)</span>
                    <span className="text-[10px] text-neutral-500">Visa, Mastercard, RuPay</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-base block mb-1">🏦</span>
                    <span className="text-xs font-bold text-white block">Netbanking</span>
                    <span className="text-[10px] text-neutral-500">All 50+ Indian Banks</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-base block mb-1">💬</span>
                    <span className="text-xs font-bold text-white block">WhatsApp Confirmations</span>
                    <span className="text-[10px] text-neutral-500">Automated receipts & links</span>
                  </div>
                </div>
              </div>

              {/* Razorpay Merchant Compliance Links Helper */}
              <div className="p-6 rounded-2xl bg-neutral-950 border border-emerald-900/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                  <h5 className="text-sm font-bold text-white">Razorpay Mandatory Policy URLs for Merchant Approval</h5>
                </div>
                <p className="text-xs text-neutral-400">
                  When submitting your website for Razorpay live approval, copy and paste these exact links into their dashboard verification form:
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <div>
                      <span className="text-neutral-400 text-[10px] block font-sans font-semibold">About Us URL (Company Profile):</span>
                      <span className="text-cyan-400 select-all">{window.location.origin}/#about-us</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <div>
                      <span className="text-neutral-400 text-[10px] block font-sans font-semibold">1. Pricing Policy URL:</span>
                      <span className="text-emerald-400 select-all">{window.location.origin}/#pricing-policy</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <div>
                      <span className="text-neutral-400 text-[10px] block font-sans font-semibold">2. Shipping & Delivery Policy URL:</span>
                      <span className="text-emerald-400 select-all">{window.location.origin}/#shipping-policy</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <div>
                      <span className="text-neutral-400 text-[10px] block font-sans font-semibold">3. Terms and Conditions URL:</span>
                      <span className="text-emerald-400 select-all">{window.location.origin}/#terms-and-conditions</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <div>
                      <span className="text-neutral-400 text-[10px] block font-sans font-semibold">4. Privacy Policy URL:</span>
                      <span className="text-emerald-400 select-all">{window.location.origin}/#privacy-policy</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <div>
                      <span className="text-neutral-400 text-[10px] block font-sans font-semibold">5. Cancellation / Refund Policy URL:</span>
                      <span className="text-emerald-400 select-all">{window.location.origin}/#refund-policy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ADMIN PASSCODE & ACCESS SECURITY */}
          {activeTab === 'security' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  <span>Admin Passcode & Security Settings</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Control the security passcode required to unlock and access the administrator window.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                  <div>
                    <span className="text-xs font-semibold text-white block">Current Passcode Status</span>
                    <span className="text-[11px] text-neutral-400">Passcode authentication is active and required for all admin access.</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Protected
                  </span>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Change Admin Passcode
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newPassInput}
                        onChange={(e) => setNewPassInput(e.target.value)}
                        placeholder="Enter new passcode (min 4 characters)"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-orange-500 font-mono"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-neutral-950 font-bold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Update Passcode</span>
                      </button>
                    </div>
                    {passChangedNotice && (
                      <p className={`text-xs mt-2 font-semibold ${passChangedNotice.includes('successfully') ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {passChangedNotice}
                      </p>
                    )}
                  </div>
                </form>

                <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-400 space-y-1.5">
                  <div className="font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Security Notes:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-400 pl-1">
                    <li>Keep your administrator passcode confidential to protect catalog and payment settings.</li>
                    <li>Updating this passcode stores it in your secure browser storage.</li>
                    <li>The admin link has been moved out of public sight and placed only very small at the bottom in the footer.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* DELETE CONFIRMATION MODAL */}
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-neutral-900 border border-rose-900/50 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold text-white">
                  Delete {itemToDelete.type === 'product' ? 'Product' : itemToDelete.type === 'course' ? 'Course' : 'Video Lesson'}?
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Are you sure you want to delete <strong className="text-white">"{itemToDelete.title}"</strong>? It will be removed immediately from your {itemToDelete.type === 'video' ? 'student portal playlist' : 'public catalog'}.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (itemToDelete.type === 'product') {
                      onDeleteProduct(itemToDelete.id);
                    } else if (itemToDelete.type === 'course') {
                      onDeleteCourse(itemToDelete.id);
                    } else if (itemToDelete.type === 'video') {
                      onDeletePortalVideo?.(itemToDelete.id);
                    }
                    setItemToDelete(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESET VIDEOS CONFIRMATION MODAL */}
        {showResetVideosConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold text-white">Reset Student Portal Videos?</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  This will restore the 5 original verified video lessons in the Student Portal, clearing any custom video links or edits.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetVideosConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetPortalVideos?.();
                    setShowResetVideosConfirm(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-extrabold shadow cursor-pointer"
                >
                  Reset Videos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESET CONFIRMATION MODAL */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold text-white">Restore Factory Default Catalog?</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  This will reload all original default courses and digital products, clearing any custom additions or deletions from local storage.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetToDefault();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-neutral-950 text-xs font-extrabold shadow"
                >
                  Reset Catalog
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-800 bg-neutral-950 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Changes persist securely in your browser &amp; exports as clean JSON.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-neutral-950 font-bold transition-colors cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
