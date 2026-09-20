import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StudentUser, MockTestResult } from '../types';
import { verifyStudentCredentials, getRegisteredStudents, RegisteredStudentAccount, isRegisteredStudent } from '../utils/studentRegistry';

interface AuthContextType {
  user: StudentUser | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (data: { name: string; email: string; phone: string; targetExamCode?: string; targetExamDate?: string; courseId?: string }) => void;
  loginWithCredentials: (usernameOrEmail: string, passwordInput: string, courseIdOrStandard?: string) => { success: boolean; message?: string; user?: StudentUser };
  loginWithAccount: (account: StudentUser) => void;
  setStudentStandard: (standard: 'class-6' | 'class-9') => void;
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

  const loginWithCredentials = (
    usernameOrEmail: string, 
    passwordInput: string,
    courseIdOrStandard?: string
  ) => {
    const verified = verifyStudentCredentials(usernameOrEmail, passwordInput);
    if (!verified) {
      return {
        success: false,
        message: 'Invalid Username/Email or Password. Please check your credentials or register via payment.',
      };
    }

    const courseChoice = courseIdOrStandard || verified.courseId || 'course-aissee-sainik-6';
    let effectiveStandard: 'class-6' | 'class-9' = verified.standard === 'class-9' ? 'class-9' : 'class-6';
    if (courseChoice === 'class-9' || courseChoice === 'course-aissee-sainik-9') {
      effectiveStandard = 'class-9';
    } else if (courseChoice === 'class-6' || courseChoice === 'course-aissee-sainik-6') {
      effectiveStandard = 'class-6';
    }

    const specificSainikCourseId = effectiveStandard === 'class-9' ? 'course-aissee-sainik-9' : 'course-aissee-sainik-6';
    
    // Construct enrolledCourseIds including specific selected course
    const baseEnrolled = verified.enrolledCourseIds || (verified.courseId ? [verified.courseId] : ['course-aissee-sainik']);
    const updatedEnrolled = [...baseEnrolled];
    if (courseChoice && !courseChoice.startsWith('class-') && !updatedEnrolled.includes(courseChoice)) {
      updatedEnrolled.unshift(courseChoice);
    }
    if (!updatedEnrolled.includes(specificSainikCourseId) && (courseChoice.includes('sainik') || !verified.courseId)) {
      updatedEnrolled.unshift(specificSainikCourseId);
    }

    const authenticatedUser: StudentUser = {
      id: verified.id,
      name: verified.name,
      email: verified.email,
      phone: verified.phone,
      username: verified.username,
      password: verified.password,
      standard: effectiveStandard,
      enrolledCourseIds: updatedEnrolled,
      targetExamCode: effectiveStandard === 'class-9' ? 'AISSEE-9' : 'AISSEE-6',
      targetExamDate: verified.targetExamDate || '2027-01-10',
      learningGoal: verified.learningGoal || `Master AISSEE ${effectiveStandard.replace('class-', 'Class ')}`,
      registeredAt: verified.registeredAt || new Date().toISOString().split('T')[0],
      credentialsDeliveredViaEmail: verified.credentialsDeliveredViaEmail,
      credentialsEmailSentAt: verified.credentialsEmailSentAt,
      paymentReference: verified.paymentReference,
      completedLessons: verified.completedLessons || [1],
      mockTestScores: verified.mockTestScores || [],
    };

    setUser(authenticatedUser);
    setIsAuthModalOpen(false);
    return { success: true, user: authenticatedUser };
  };

  const setStudentStandard = (standard: 'class-6' | 'class-9') => {
    if (!user) return;
    const specificCourseId = standard === 'class-9' ? 'course-aissee-sainik-9' : 'course-aissee-sainik-6';
    const updatedCourses = [specificCourseId, ...user.enrolledCourseIds.filter((c) => c !== 'course-aissee-sainik-6' && c !== 'course-aissee-sainik-9')];
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
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        loginWithCredentials,
        loginWithAccount,
        setStudentStandard,
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
