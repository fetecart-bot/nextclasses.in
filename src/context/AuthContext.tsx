import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StudentUser, MockTestResult } from '../types';
import { verifyStudentCredentials, getRegisteredStudents, RegisteredStudentAccount, isRegisteredStudent, detectStudentGender } from '../utils/studentRegistry';
import { saveOfflineCoursePack } from '../utils/offlineMentor';

interface AuthContextType {
  user: StudentUser | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  justLoggedInUser: StudentUser | null;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  clearJustLoggedIn: () => void;
  login: (data: { name: string; email: string; phone: string; targetExamCode?: string; targetExamDate?: string; courseId?: string }) => void;
  loginWithCredentials: (usernameOrEmail: string, passwordInput: string, courseIdOrStandard?: string, options?: { serverOnly?: boolean }) => Promise<{ success: boolean; message?: string; user?: StudentUser }>;
  loginWithAccount: (account: StudentUser) => void;
  setStudentStandard: (standard: 'class-6' | 'class-9') => void;
  updateStudentProfile: (updates: Partial<StudentUser>) => void;
  logout: () => void;
  enrollCourse: (courseId: string) => void;
  updateExamGoal: (examCode: string, examDate: string) => void;
  saveMockTestScore: (result: MockTestResult) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'nextclass_ai_student_user_v2';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudentUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore student sessions that are verified registered accounts with a password/username
        if (parsed && parsed.email && (parsed.username || isRegisteredStudent(parsed))) {
          if (!parsed.gender) {
            parsed.gender = detectStudentGender(parsed.name);
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    // Default to null - students must authenticate with verified credentials or upon verified payment
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [justLoggedInUser, setJustLoggedInUser] = useState<StudentUser | null>(null);

  // Refresh restored sessions from the server so admin course corrections take
  // effect without asking a student to clear browser storage or sign out.
  useEffect(() => {
    const restored = user;
    if (!restored?.password || !(restored.username || restored.email)) return;
    let cancelled = false;
    fetch('/api/student-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: restored.username || restored.email, password: restored.password }),
    })
      .then(async (response) => ({ ok: response.ok, status: response.status, data: await response.json().catch(() => ({})) }))
      .then(({ ok, status, data }) => {
        if (!cancelled && (status === 401 || status === 403)) { setUser(null); return; }
        if (!cancelled && ok && data.account?.enrolledCourseIds?.length) {
          setUser((current) => current ? { ...current, ...data.account, password: current.password } : current);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [user]);

  const clearJustLoggedIn = () => {
    setJustLoggedInUser(null);
  };

  const updateStudentProfile = (updates: Partial<StudentUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...updates,
      };
    });
  };

  const loginWithCredentials = async (
    usernameOrEmail: string, 
    passwordInput: string,
    courseIdOrStandard?: string,
    options?: { serverOnly?: boolean }
  ) => {
    // The server is authoritative. Mobile browsers may still hold an older
    // locally cached account from before an admin corrected the course.
    let verified: RegisteredStudentAccount | null = null;
    try {
      const response = await fetch('/api/student-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: usernameOrEmail, password: passwordInput, courseId: courseIdOrStandard }) });
      const data = await response.json();
      if (response.ok && data.account) verified = data.account;
    } catch {
      return { success: false, message: 'Sign-in is temporarily unavailable. Please reconnect and try again.' };
    }
    if (!verified) {
      return {
        success: false,
        message: 'Invalid Username/Email or Password. Please check your credentials or register via payment.',
      };
    }

    // Prefer the corrected enrollment list over the legacy single courseId.
    const courseChoice = verified.enrolledCourseIds?.[0] || verified.courseId || courseIdOrStandard || '';
    let effectiveStandard: 'class-6' | 'class-9' = verified.standard === 'class-9' ? 'class-9' : 'class-6';
    if (courseChoice === 'class-9' || courseChoice === 'course-aissee-sainik-9') {
      effectiveStandard = 'class-9';
    } else if (courseChoice === 'class-6' || courseChoice === 'course-aissee-sainik-6') {
      effectiveStandard = 'class-6';
    }

    const specificSainikCourseId = effectiveStandard === 'class-9' ? 'course-aissee-sainik-9' : 'course-aissee-sainik-6';
    
    // Construct enrolledCourseIds including specific selected course
    const baseEnrolled = verified.enrolledCourseIds?.length
      ? verified.enrolledCourseIds
      : (verified.courseId ? [verified.courseId] : (courseIdOrStandard ? [courseIdOrStandard] : []));
    const updatedEnrolled = [...baseEnrolled];
    if (courseChoice && !courseChoice.startsWith('class-') && !updatedEnrolled.includes(courseChoice)) {
      updatedEnrolled.unshift(courseChoice);
    }


    const detectedGender = verified.gender || detectStudentGender(verified.name);

    const authenticatedUser: StudentUser = {
      id: verified.id,
      name: verified.name,
      email: verified.email,
      phone: verified.phone,
      gender: detectedGender,
      username: verified.username,
      password: verified.password || passwordInput,
      standard: courseChoice.includes('sainik') ? effectiveStandard : undefined,
      enrolledCourseIds: updatedEnrolled,
      targetExamCode: verified.targetExamCode || (courseChoice.includes('sainik') ? (effectiveStandard === 'class-9' ? 'AISSEE-9' : 'AISSEE-6') : undefined),
      targetExamDate: verified.targetExamDate,
      learningGoal: verified.learningGoal || `Master ${verified.courseTitle || 'your enrolled course'}`,
      registeredAt: verified.registeredAt || new Date().toISOString().split('T')[0],
      credentialsDeliveredViaEmail: verified.credentialsDeliveredViaEmail,
      credentialsEmailSentAt: verified.credentialsEmailSentAt,
      paymentReference: verified.paymentReference,
      completedLessons: verified.completedLessons || [1],
      mockTestScores: verified.mockTestScores || [],
    };

    setUser(authenticatedUser);
    authenticatedUser.enrolledCourseIds.forEach((courseId) => saveOfflineCoursePack(courseId));
    setJustLoggedInUser(authenticatedUser);
    setIsAuthModalOpen(false);
    return { success: true, user: authenticatedUser };
  };

  const setStudentStandard = (standard: 'class-6' | 'class-9') => {
    if (!user) return;
    const specificCourseId = standard === 'class-9' ? 'course-aissee-sainik-9' : 'course-aissee-sainik-6';
    if (!user.enrolledCourseIds.includes(specificCourseId)) return;
    const updatedCourses = [specificCourseId, ...user.enrolledCourseIds.filter(c => c !== specificCourseId)];
    setUser({
      ...user,
      standard,
      targetExamCode: standard === 'class-9' ? 'AISSEE-9' : 'AISSEE-6',
      enrolledCourseIds: updatedCourses,
    });
  };

  const loginWithAccount = (account: StudentUser) => {
    setUser(account);
    setIsAuthModalOpen(false);
  };

  const login = (data: {
    name: string;
    email: string;
    phone: string;
    targetExamCode?: string;
    targetExamDate?: string;
    courseId?: string;
  }) => {
    const newUser: StudentUser = {
      id: `student-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      enrolledCourseIds: data.courseId ? [data.courseId] : ['course-aissee-sainik'],
      targetExamCode: data.targetExamCode || 'AISSEE',
      targetExamDate: data.targetExamDate || '2027-01-10',
      learningGoal: 'Master Course Curriculum & Clear Entrance Exam',
      registeredAt: new Date().toISOString().split('T')[0],
      completedLessons: [1],
      mockTestScores: [],
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
  };

  const enrollCourse = (courseId: string) => {
    if (!user) return;
    if (!user.enrolledCourseIds.includes(courseId)) {
      setUser({
        ...user,
        enrolledCourseIds: [...user.enrolledCourseIds, courseId],
      });
    }
  };

  const updateExamGoal = (examCode: string, examDate: string) => {
    if (!user) return;
    setUser({
      ...user,
      targetExamCode: examCode,
      targetExamDate: examDate,
    });
  };

  const saveMockTestScore = (result: MockTestResult) => {
    if (!user) return;
    const newEntry = {
      testId: result.testId,
      testTitle: result.testTitle,
      score: result.score,
      totalMarks: result.totalMarks,
      accuracy: result.accuracyPercentage,
      date: new Date().toISOString().split('T')[0],
    };
    setUser({
      ...user,
      mockTestScores: [newEntry, ...(user.mockTestScores || [])],
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        justLoggedInUser,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        clearJustLoggedIn,
        login,
        loginWithCredentials,
        loginWithAccount,
        setStudentStandard,
        updateStudentProfile,
        logout,
        enrollCourse,
        updateExamGoal,
        saveMockTestScore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
