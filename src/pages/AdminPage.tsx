import React, { useEffect } from 'react';
import CatalogAdminModal from '../components/CatalogAdminModal';
import { AIProduct, Course, PortalVideoLesson } from '../types';

interface AdminPageProps {
  products: AIProduct[];
  courses: Course[];
  portalVideos: PortalVideoLesson[];
  razorpayKeyId: string;
  onSaveRazorpayKey: (key: string) => void;
  onAddProduct: (product: AIProduct) => void;
  onUpdateProduct: (product: AIProduct) => void;
  onDeleteProduct: (productId: string) => void;
  onAddCourse: (course: Course) => void;
  onUpdateCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onAddPortalVideo: (video: PortalVideoLesson) => void;
  onUpdatePortalVideo: (video: PortalVideoLesson) => void;
  onDeletePortalVideo: (videoId: string) => void;
  onResetPortalVideos: () => void;
  onResetToDefault: () => void;
  onNavigateHome: () => void;
}

export default function AdminPage({
  products,
  courses,
  portalVideos,
  razorpayKeyId,
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
  onNavigateHome,
}: AdminPageProps) {
  useEffect(() => {
    document.title = 'Admin Console • Nextclasses.in';
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <CatalogAdminModal
        isOpen={true}
        standalone={true}
        onBackToHome={onNavigateHome}
        onClose={onNavigateHome}
        products={products}
        courses={courses}
        portalVideos={portalVideos}
        razorpayKeyId={razorpayKeyId}
        onSaveRazorpayKey={onSaveRazorpayKey}
        onAddProduct={onAddProduct}
        onUpdateProduct={onUpdateProduct}
        onDeleteProduct={onDeleteProduct}
        onAddCourse={onAddCourse}
        onUpdateCourse={onUpdateCourse}
        onDeleteCourse={onDeleteCourse}
        onAddPortalVideo={onAddPortalVideo}
        onUpdatePortalVideo={onUpdatePortalVideo}
        onDeletePortalVideo={onDeletePortalVideo}
        onResetPortalVideos={onResetPortalVideos}
        onResetToDefault={onResetToDefault}
      />
    </div>
  );
}
