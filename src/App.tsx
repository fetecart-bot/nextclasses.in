import { useState, useEffect } from 'react';
import AnnouncementBanner from './components/AnnouncementBanner';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CourseCatalog from './components/CourseCatalog';
import ProductCatalog from './components/ProductCatalog';
import WhyNextClass from './components/WhyNextClass';
import InstitutionalBanner from './components/InstitutionalBanner';
import Testimonials from './components/Testimonials';
import FAQSection from './components/FAQSection';
import AboutUsSection from './components/AboutUsSection';
import Footer from './components/Footer';
import CourseModal from './components/CourseModal';
import StudentPortalModal from './components/StudentPortalModal';
import CartDrawer from './components/CartDrawer';
import StudentAuthModal from './components/StudentAuthModal';
import InteractiveMockTestModal from './components/InteractiveMockTestModal';
import LanguageSelectorModal from './components/LanguageSelectorModal';
import CatalogAdminModal from './components/CatalogAdminModal';
import AdminDispatchModal from './components/AdminDispatchModal';
import PolicyModal, { PolicyTab } from './components/PolicyModal';
import { AIChatBot } from './components/AIChatBot';
import { DirectUPIModal } from './components/DirectUPIModal';
import { PaymentVerificationModal } from './components/PaymentVerificationModal';
import { VoiceReceptionistModal } from './components/VoiceReceptionistModal';
import { VoiceReceptionistFloatingButton } from './components/VoiceReceptionistFloatingButton';
import { COURSES_DATA, AI_PRODUCTS_DATA, DEFAULT_PORTAL_VIDEOS } from './data';
import { Course, CartItem, AIProduct, PortalVideoLesson } from './types';

const STORAGE_PRODUCTS_KEY = 'nextclass_custom_products';
const STORAGE_COURSES_KEY = 'nextclass_custom_courses';
const STORAGE_PORTAL_VIDEOS_KEY = 'nextclass_custom_portal_videos';
const STORAGE_RAZORPAY_KEY = 'nextclass_custom_razorpay_key';

const AI_CATEGORY_SET = new Set(['ai_platforms', 'automation', 'creators', 'beginners', 'students', 'educators']);

export function sortCoursesWithAIFirst(list: Course[]): Course[] {
  return [...list].sort((a, b) => {
    const aRank = AI_CATEGORY_SET.has(a.category) ? 0 : a.category === 'languages' ? 1 : 2;
    const bRank = AI_CATEGORY_SET.has(b.category) ? 0 : b.category === 'languages' ? 1 : 2;
    return aRank - bRank;
  });
}

export default function App() {
  // State for products & courses (with persistence and smart default-merging)
  const [products, setProducts] = useState<AIProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (saved) {
        const parsed: AIProduct[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((p) => p.id));
          const missingDefaults = AI_PRODUCTS_DATA.filter((p) => !existingIds.has(p.id));
          if (missingDefaults.length > 0) {
            return [...parsed, ...missingDefaults];
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return AI_PRODUCTS_DATA;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COURSES_KEY);
      if (saved) {
        const parsed: Course[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((c) => c.id));
          // Always ensure all default courses from COURSES_DATA exist (including all 4 Language & Public Speaking courses)
          const missingDefaults = COURSES_DATA.filter((c) => !existingIds.has(c.id));

          // Fix any courses that should have category 'languages' or have old Live Cohort format
          const updatedParsed = parsed.map((c) => {
            const defaultMatch = COURSES_DATA.find((d) => d.id === c.id);
            let updated = { ...c };
            if (defaultMatch) {
              if (c.format === 'Live Cohort + Recorded') {
                updated.format = defaultMatch.format;
              }
              if (c.nextCohortDate && (c.nextCohortDate.includes('Cohort') || c.nextCohortDate.includes('Starts this Saturday') || c.nextCohortDate.includes('Batch Starts'))) {
                updated.nextCohortDate = defaultMatch.nextCohortDate;
              }
              if (defaultMatch.category === 'languages' && c.category !== 'languages') {
                updated.category = 'languages' as const;
              }
              if (c.id === 'course-google-ai-studio') {
                updated.language = 'All Indian Languages & English';
              } else if (defaultMatch.language && defaultMatch.language !== c.language) {
                updated.language = defaultMatch.language;
              }
              // Sync updated high-definition thumbnails
              if (defaultMatch.thumbnail && (
                !c.thumbnail ||
                defaultMatch.thumbnail.startsWith('/courses/') ||
                c.thumbnail.includes('photo-1526374965328-7f61d4dc18c5') ||
                c.thumbnail.includes('photo-1677442136019-21780ecad995') ||
                c.thumbnail.includes('photo-1618005182384-a83a8bd57fbe') ||
                c.thumbnail.includes('photo-1516321318423-f06f85e504b3')
              )) {
                updated.thumbnail = defaultMatch.thumbnail;
              }
            }
            return updated;
          });

          // If language courses count was 0 in cache, guarantee injection from COURSES_DATA
          const hasLanguages = updatedParsed.some((c) => c.category === 'languages');
          if (!hasLanguages) {
            const defaultLanguages = COURSES_DATA.filter((c) => c.category === 'languages');
            return [...updatedParsed, ...defaultLanguages];
          }

          if (missingDefaults.length > 0) {
            return sortCoursesWithAIFirst([...updatedParsed, ...missingDefaults]);
          }
          return sortCoursesWithAIFirst(updatedParsed);
        }
      }
    } catch {
      // fallback
    }
    return sortCoursesWithAIFirst(COURSES_DATA);
  });

  const [portalVideos, setPortalVideos] = useState<PortalVideoLesson[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PORTAL_VIDEOS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_PORTAL_VIDEOS;
  });

  const [razorpayKeyId, setRazorpayKeyId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RAZORPAY_KEY);
      if (saved && saved.startsWith('rzp_live_')) {
        return saved;
      }
    } catch {
      // fallback
    }
    const liveKey = (((import.meta as any).env?.VITE_RAZORPAY_KEY_ID as string) || 'rzp_live_TefblkmIMTFIRH').trim();
    try {
      localStorage.setItem(STORAGE_RAZORPAY_KEY, liveKey);
    } catch {
      // ignore
    }
    return liveKey;
  });

  // State for shopping cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // State for modals
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isMockTestModalOpen, setIsMockTestModalOpen] = useState<boolean>(false);
  const [activeMockTestId, setActiveMockTestId] = useState<string | undefined>(undefined);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAdminDispatchModalOpen, setIsAdminDispatchModalOpen] = useState<boolean>(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState<boolean>(false);
  const [activePolicyTab, setActivePolicyTab] = useState<PolicyTab>('terms');
  const [isUpiModalOpen, setIsUpiModalOpen] = useState<boolean>(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);
  const [isVoiceReceptionistOpen, setIsVoiceReceptionistOpen] = useState<boolean>(false);
  const [verificationModalData, setVerificationModalData] = useState<{
    courseId: string;
    courseTitle: string;
    amount: number;
    utr?: string;
    paymentMethod?: string;
    paymentApp?: string;
    studentName?: string;
    email?: string;
    phone?: string;
  }>({
    courseId: 'course-aissee-sainik',
    courseTitle: 'AISSEE (All India Sainik School Entrance) 2027: Class 6 & 9 Kit',
    amount: 1799,
    utr: '',
    paymentMethod: 'Direct HDFC UPI (8281644058@hdfc)',
    paymentApp: 'Google Pay',
    studentName: '',
    email: '',
    phone: '',
  });

  const handleOpenVerificationModal = (data: {
    courseId: string;
    courseTitle: string;
    amount: number;
    utr?: string;
    paymentMethod?: string;
    paymentApp?: string;
    studentName?: string;
    email?: string;
    phone?: string;
  }) => {
    setVerificationModalData((prev) => ({
      ...prev,
      ...data,
    }));
    setIsVerificationModalOpen(true);
  };

  // Sync products to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  // Sync courses to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COURSES_KEY, JSON.stringify(courses));
    } catch {
      // ignore
    }
  }, [courses]);

  // Fail-safe: ensure Language and Public Speaking courses are never 0
  useEffect(() => {
    const languageCount = courses.filter((c) => c.category === 'languages').length;
    if (languageCount === 0) {
      const defaultLanguageCourses = COURSES_DATA.filter((c) => c.category === 'languages');
      if (defaultLanguageCourses.length > 0) {
        setCourses((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const missing = defaultLanguageCourses.filter((c) => !existingIds.has(c.id));
          return [...prev, ...missing];
        });
      }
    }
  }, [courses]);

  // Sync portal videos to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PORTAL_VIDEOS_KEY, JSON.stringify(portalVideos));
    } catch {
      // ignore
    }
  }, [portalVideos]);

  // Support direct hash URLs like #about-us, #products, #courses, and policy hashes
  useEffect(() => {
    const handleHash = () => {
      const rawHash = window.location.hash.replace('#', '').toLowerCase();
      if (!rawHash) return;

      // Handle direct policy URLs for Razorpay reviewer checks
      if (rawHash === 'voice' || rawHash === 'receptionist' || rawHash === 'call') {
        setIsVoiceReceptionistOpen(true);
        return;
      }
      if (rawHash === 'portal' || rawHash === 'student-portal') {
        setIsPortalModalOpen(true);
        return;
      }
      if (rawHash === 'about' || rawHash === 'about-us-policy') {
        setActivePolicyTab('about');
        setIsPolicyModalOpen(true);
        return;
      }
      if (rawHash === 'pricing' || rawHash === 'pricing-policy') {
        setActivePolicyTab('pricing');
        setIsPolicyModalOpen(true);
        return;
      }
      if (rawHash === 'shipping' || rawHash === 'shipping-policy' || rawHash === 'delivery-policy') {
        setActivePolicyTab('shipping');
        setIsPolicyModalOpen(true);
        return;
      }
      if (rawHash === 'terms' || rawHash === 'terms-and-conditions' || rawHash === 'terms-of-service') {
        setActivePolicyTab('terms');
        setIsPolicyModalOpen(true);
        return;
      }
      if (rawHash === 'privacy' || rawHash === 'privacy-policy') {
        setActivePolicyTab('privacy');
        setIsPolicyModalOpen(true);
        return;
      }
      if (rawHash === 'refund' || rawHash === 'refund-policy' || rawHash === 'cancellation-policy' || rawHash === 'cancellation-refund') {
        setActivePolicyTab('refund');
        setIsPolicyModalOpen(true);
        return;
      }

      setTimeout(() => {
        const el = document.getElementById(rawHash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    };

    // Check if opened via direct email or portal query link
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('portal') === 'true' || window.location.pathname.endsWith('/portal')) {
        setIsPortalModalOpen(true);
      }
    } catch {
      // ignore
    }

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // --- PRODUCT MANAGEMENT HANDLERS ---
  const handleAddProduct = (newProduct: AIProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updated: AIProduct) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  // --- COURSE MANAGEMENT HANDLERS ---
  const handleAddCourse = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
  };

  const handleUpdateCourse = (updated: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setCartItems((prev) => prev.filter((item) => item.id !== courseId));
    if (selectedCourseForModal?.id === courseId) {
      setSelectedCourseForModal(null);
    }
  };

  // --- PORTAL VIDEOS MANAGEMENT HANDLERS ---
  const handleAddPortalVideo = (newVideo: PortalVideoLesson) => {
    setPortalVideos((prev) => [newVideo, ...prev]);
  };

  const handleUpdatePortalVideo = (updated: PortalVideoLesson) => {
    setPortalVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  const handleDeletePortalVideo = (videoId: string) => {
    setPortalVideos((prev) => prev.filter((v) => v.id !== videoId));
  };

  const handleResetPortalVideos = () => {
    try {
      localStorage.removeItem(STORAGE_PORTAL_VIDEOS_KEY);
    } catch {
      // ignore
    }
    setPortalVideos(DEFAULT_PORTAL_VIDEOS);
  };

  const handleSaveRazorpayKey = (newKey: string) => {
    const trimmed = newKey.trim();
    setRazorpayKeyId(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem(STORAGE_RAZORPAY_KEY, trimmed);
      } else {
        localStorage.removeItem(STORAGE_RAZORPAY_KEY);
      }
    } catch {
      // ignore
    }
  };

  const handleResetToDefault = () => {
    try {
      localStorage.removeItem(STORAGE_PRODUCTS_KEY);
      localStorage.removeItem(STORAGE_COURSES_KEY);
      localStorage.removeItem(STORAGE_PORTAL_VIDEOS_KEY);
      localStorage.removeItem(STORAGE_RAZORPAY_KEY);
    } catch {
      // ignore
    }
    setProducts(AI_PRODUCTS_DATA);
    setCourses(COURSES_DATA);
    setPortalVideos(DEFAULT_PORTAL_VIDEOS);
    setRazorpayKeyId((((import.meta as any).env?.VITE_RAZORPAY_KEY_ID as string) || 'rzp_live_TefblkmIMTFIRH').trim());
  };

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    const exists = cartItems.some((ci) => ci.id === item.id);
    if (!exists) {
      setCartItems((prev) => [...prev, item]);
    }
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Navigation smoothly scrolls to anchor sections
  const handleNavigateTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchMockTest = (testId?: string) => {
    setActiveMockTestId(testId);
    setIsMockTestModalOpen(true);
  };

  // Flagship course for the hero feature spotlight (Google AI Studio & Gemini 2.0 Flash)
  const flagshipCourse =
    courses.find((c) => c.id === 'course-google-ai-studio') ||
    courses.find((c) => c.category === 'ai_platforms') ||
    courses[0] ||
    COURSES_DATA[0];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-orange-500 selection:text-neutral-950 font-sans antialiased">
      {/* Top Promos & Announcement Bar */}
      <AnnouncementBanner onPromoApply={() => setIsCartOpen(true)} />

      {/* Primary Sticky Navigation */}
      <Navbar
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenStudentPortal={() => setIsPortalModalOpen(true)}
        onNavigateTo={handleNavigateTo}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenMockTest={() => handleLaunchMockTest()}
        onOpenLanguageSelector={() => setIsLanguageModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenUpiModal={() => setIsUpiModalOpen(true)}
        onOpenAdminDispatch={() => setIsAdminDispatchModalOpen(true)}
        onOpenVoiceReceptionist={() => setIsVoiceReceptionistOpen(true)}
      />

      {/* Main Content Sections */}
      <main id="main-content">
        {/* Hero Section */}
        <Hero
          flagshipCourse={flagshipCourse}
          onExploreCourses={() => handleNavigateTo('courses')}
          onExploreProducts={() => handleNavigateTo('products')}
          onSelectCourse={(course) => setSelectedCourseForModal(course)}
          onOpenStudentPortal={() => setIsPortalModalOpen(true)}
          onAddToCart={handleAddToCart}
          onOpenVoiceReceptionist={() => setIsVoiceReceptionistOpen(true)}
        />

        {/* AI Courses Catalog */}
        <CourseCatalog
          courses={courses}
          onSelectCourse={(course) => setSelectedCourseForModal(course)}
          onAddToCart={handleAddToCart}
          onOpenLanguageSelector={() => setIsLanguageModalOpen(true)}
        />

        {/* Digital Products & Prompt Toolkits */}
        <ProductCatalog
          products={products}
          onAddToCart={handleAddToCart}
          onInstantBuy={(item) => {
            handleAddToCart(item);
            setIsCartOpen(true);
          }}
        />

        {/* Why NextClass (The 6 Pillars) */}
        <WhyNextClass />

        {/* Institutional Training for Schools & Colleges */}
        <InstitutionalBanner />

        {/* Real Student Testimonials & Ratings */}
        <Testimonials />

        {/* About Us (Nextclasses.in & Fetecart Store) */}
        <AboutUsSection
          onOpenPolicyModal={(tab) => {
            setActivePolicyTab(tab);
            setIsPolicyModalOpen(true);
          }}
          onExploreCourses={() => handleNavigateTo('courses')}
        />

        {/* Frequently Asked Questions */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer
        onNavigateTo={handleNavigateTo}
        onOpenStudentPortal={() => setIsPortalModalOpen(true)}
        onOpenPolicyModal={(tab) => {
          setActivePolicyTab(tab);
          setIsPolicyModalOpen(true);
        }}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      {/* Mandatory Legal & Razorpay Policy Modal */}
      <PolicyModal
        isOpen={isPolicyModalOpen}
        initialTab={activePolicyTab}
        onClose={() => setIsPolicyModalOpen(false)}
      />

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      {/* Admin Product & Course Catalog Modal */}
      <CatalogAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        products={products}
        courses={courses}
        portalVideos={portalVideos}
        razorpayKeyId={razorpayKeyId}
        onSaveRazorpayKey={handleSaveRazorpayKey}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onAddCourse={handleAddCourse}
        onUpdateCourse={handleUpdateCourse}
        onDeleteCourse={handleDeleteCourse}
        onAddPortalVideo={handleAddPortalVideo}
        onUpdatePortalVideo={handleUpdatePortalVideo}
        onDeletePortalVideo={handleDeletePortalVideo}
        onResetPortalVideos={handleResetPortalVideos}
        onResetToDefault={handleResetToDefault}
      />

      {/* Course Detailed Syllabus & Curriculum Modal */}
      {selectedCourseForModal && (
        <CourseModal
          course={selectedCourseForModal}
          onClose={() => setSelectedCourseForModal(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Student Portal Interactive Learning Hub */}
      {isPortalModalOpen && (
        <StudentPortalModal 
          onClose={() => setIsPortalModalOpen(false)}
          portalVideos={portalVideos}
          initialCourseId="course-aissee-sainik"
          onOpenAdminDispatch={() => setIsAdminDispatchModalOpen(true)}
          onLaunchMockTest={(testId) => {
            setIsPortalModalOpen(false);
            handleLaunchMockTest(testId);
          }}
        />
      )}

      {/* Interactive Mock Test CBT Simulation Modal */}
      {isMockTestModalOpen && (
        <InteractiveMockTestModal
          initialTestId={activeMockTestId}
          onClose={() => setIsMockTestModalOpen(false)}
          onOpenStudentPortal={() => {
            setIsMockTestModalOpen(false);
            setIsPortalModalOpen(true);
          }}
        />
      )}

      {/* Student Authentication Modal */}
      {isAuthModalOpen && (
        <StudentAuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => setIsAuthModalOpen(false)}
        />
      )}

      {/* Sliding Cart & Instant Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOpenPortalDemo={() => setIsPortalModalOpen(true)}
        customRazorpayKeyId={razorpayKeyId}
        onOpenAdmin={() => {
          setIsCartOpen(false);
          setIsAdminModalOpen(true);
        }}
        onOpenPolicyModal={(tab) => {
          setActivePolicyTab(tab);
          setIsPolicyModalOpen(true);
        }}
        onOpenVerificationModal={handleOpenVerificationModal}
      />

      {/* Direct UPI Scan & Pay Modal */}
      <DirectUPIModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        courseId="course-aissee-sainik"
        courseTitle="AISSEE (All India Sainik School Entrance) 2027: Class 6 & 9 Kit"
        amount={
          cartItems.length > 0
            ? cartItems.reduce((acc, it) => acc + (Number(it.price) || 0), 0) || undefined
            : 1799
        }
        onOpenPortal={() => setIsPortalModalOpen(true)}
        onOpenVerificationModal={handleOpenVerificationModal}
        onPaymentConfirmed={(utr) => {
          console.log('UPI payment recorded with UTR:', utr);
        }}
      />

      {/* Separate Payment Verification Submission Popup */}
      <PaymentVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        initialCourseId={verificationModalData.courseId}
        initialCourseTitle={verificationModalData.courseTitle}
        initialAmount={verificationModalData.amount}
        initialUtr={verificationModalData.utr}
        initialPaymentMethod={verificationModalData.paymentMethod}
        initialPaymentApp={verificationModalData.paymentApp}
        initialStudentName={verificationModalData.studentName}
        initialEmail={verificationModalData.email}
        initialPhone={verificationModalData.phone}
        onClaimSubmitted={() => {
          // Open notification or keep tracking
        }}
      />

      {/* Admin Study Material Dispatch & Reconciliation Modal */}
      {isAdminDispatchModalOpen && (
        <AdminDispatchModal
          isOpen={isAdminDispatchModalOpen}
          onClose={() => setIsAdminDispatchModalOpen(false)}
          initialCourseId="course-aissee-sainik"
        />
      )}

      {/* Floating Interactive AI Counselor ChatBot & Direct QR Scan */}
      <AIChatBot
        onOpenUpiModal={() => setIsUpiModalOpen(true)}
        onNavigateTo={handleNavigateTo}
        onOpenMockTest={() => handleLaunchMockTest()}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenVoiceReceptionist={() => setIsVoiceReceptionistOpen(true)}
      />

      {/* Floating AI Voice Receptionist Button (Priya • Indian Accent) */}
      <VoiceReceptionistFloatingButton
        onOpenVoiceModal={() => setIsVoiceReceptionistOpen(true)}
        isOpen={isVoiceReceptionistOpen}
      />

      {/* AI Voice Receptionist Interactive Live Modal */}
      <VoiceReceptionistModal
        isOpen={isVoiceReceptionistOpen}
        onClose={() => setIsVoiceReceptionistOpen(false)}
        onNavigateTo={handleNavigateTo}
        onOpenUpiModal={() => setIsUpiModalOpen(true)}
        onOpenCourseCatalog={() => handleNavigateTo('courses')}
      />
    </div>
  );
}
