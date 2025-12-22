import React from 'react';
import PurchasedCourses from '../dashboard/PurchasedCourses';
import Header from '../layout/Header';

const PaymentSuccessHandler: React.FC = () => {
  const handleNavigateToCourses = () => {
    // Redirect to main app courses page
    window.location.href = '/';
    // Small delay then navigate to courses
    setTimeout(() => {
      const event = new CustomEvent('navigate-to-courses');
      window.dispatchEvent(event);
    }, 100);
  };

  const handleNavigateToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onAuthClick={() => { }}
        onNavigate={(page) => {
          if (page === 'courses') {
            handleNavigateToCourses();
          } else if (page === 'home') {
            handleNavigateToHome();
          }
        }}
      />

      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800">
                  Thanh toán thành công!
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Chúc mừng bạn đã đăng ký khóa học thành công. Bây giờ bạn có thể bắt đầu học ngay.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleNavigateToHome}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Về trang chủ
              </button>
              <button
                onClick={handleNavigateToCourses}
                className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Xem tất cả khóa học
              </button>
            </div>
          </div>
        </div>

        {/* Purchased Courses Component */}
        <PurchasedCourses
          onBack={handleNavigateToHome}
          onCourseSelect={(id) => {
            console.log('Course selected from success page:', id);
            window.location.href = '/';
            // In a real app we might navigate to course detail directly
          }}
        />
      </div>
    </div>
  );
};

export default PaymentSuccessHandler;
