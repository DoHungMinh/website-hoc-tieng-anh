import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import * as levelPackageAPI from '../../services/levelPackageAPI';
import CourseCard, { CourseCardProps } from '../../components/course/CourseCard';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import styles from './CourseNewPage.module.css';

type CourseLevelData = Omit<CourseCardProps, 'onClick'>;

interface PaymentModalData {
    orderCode: number;
    qrCode: string;
    checkoutUrl: string;
    amount: number;
    level: string;
}

const courseLevels: CourseLevelData[] = [
    {
        id: 'a1',
        level: 'A1',
        tag: 'Sơ cấp',
        variant: 'a1',
        title: 'A1 - Sơ cấp',
        description: 'Bắt đầu hành trình tiếng Anh! Học từ vựng cơ bản, cụm từ đơn giản và các biểu đạt hàng ngày.',
        tasks: 120,
        projects: 2,
        progress: 72,
        modules: { current: 12, total: 16 },
        icon: '/img/level/a1.svg',
        isEnrolled: true,
    },
    {
        id: 'a2',
        level: 'A2',
        tag: 'Cơ bản',
        variant: 'a2',
        title: 'A2 - Cơ bản',
        description: 'Xây dựng nền tảng với ngữ pháp thiết yếu và mở rộng vốn từ vựng cho giao tiếp hàng ngày.',
        tasks: 180,
        projects: 3,
        progress: 45,
        modules: { current: 8, total: 18 },
        icon: '/img/level/a2.svg',
        isEnrolled: true,
    },
    {
        id: 'b1',
        level: 'B1',
        tag: 'Trung cấp',
        variant: 'b1',
        title: 'B1 - Trung cấp',
        description: 'Phát triển sự lưu loát trong hội thoại, hiểu các điểm chính và diễn đạt ý kiến rõ ràng.',
        tasks: 250,
        projects: 4,
        progress: 0,
        modules: { current: 0, total: 20 },
        icon: '/img/level/b1.svg',
        isEnrolled: false,
        startDate: '15/01/2025',
    },
    {
        id: 'b2',
        level: 'B2',
        tag: 'Trung cấp cao',
        variant: 'b2',
        title: 'B2 - Trung cấp cao',
        description: 'Tham gia các cuộc thảo luận phức tạp, hiểu chủ đề trừu tượng và viết bài luận chi tiết.',
        tasks: 320,
        projects: 5,
        progress: 0,
        modules: { current: 0, total: 24 },
        icon: '/img/level/b2.svg',
        isEnrolled: false,
        startDate: '01/03/2025',
    },
    {
        id: 'c1',
        level: 'C1',
        tag: 'Nâng cao',
        variant: 'c1',
        title: 'C1 - Nâng cao',
        description: 'Làm chủ ngôn ngữ tinh tế, viết học thuật và kỹ năng giao tiếp chuyên nghiệp.',
        tasks: 400,
        projects: 6,
        progress: 0,
        modules: { current: 0, total: 28 },
        icon: '/img/level/c1.svg',
        isEnrolled: false,
        startDate: '01/05/2025',
    },
    {
        id: 'c2',
        level: 'C2',
        tag: 'Thành thạo',
        variant: 'c2',
        title: 'C2 - Thành thạo',
        description: 'Đạt trình độ gần như người bản xứ với cách diễn đạt tinh vi và làm chủ hoàn toàn ngôn ngữ.',
        tasks: 500,
        projects: 8,
        progress: 0,
        modules: { current: 0, total: 32 },
        icon: '/img/level/c2.svg',
        isEnrolled: false,
        startDate: '01/08/2025',
    },
];

const CourseNewPage = () => {
    const navigate = useNavigate();
    const { token, isAuthenticated } = useAuthStore();
    const { addNotification } = useNotificationStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [enrolledLevels, setEnrolledLevels] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [paymentModal, setPaymentModal] = useState<PaymentModalData | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');

    // Detect payment return from PayOS
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const orderCode = urlParams.get('orderCode');
        const status = urlParams.get('status');
        const code = urlParams.get('code');
        const cancel = urlParams.get('cancel');
        const levelParam = urlParams.get('level');
        
        const isPaymentSuccess = orderCode && (
            status === 'PAID' || 
            (code === '00' && cancel === 'false')
        );
        
        if (isPaymentSuccess && levelParam) {
            console.log('🎉 Payment return detected in /courses:', {
                orderCode,
                level: levelParam,
                isOpener: window.opener != null
            });
            
            // Nếu đây là tab được mở từ payment flow
            if (window.opener && !window.opener.closed) {
                console.log('📤 Sending message to parent tab...');
                window.opener.postMessage({
                    type: 'PAYMENT_SUCCESS',
                    orderCode,
                    level: levelParam.toUpperCase()
                }, window.location.origin);
                
                // Đóng tab này sau 500ms
                setTimeout(() => {
                    console.log('🔒 Closing payment return tab...');
                    window.close();
                    
                    // Fallback: Nếu không đóng được, chỉ xóa query params
                    setTimeout(() => {
                        if (window.location.search) {
                            window.history.replaceState({}, '', '/courses');
                        }
                    }, 500);
                }, 500);
            } else {
                // Không phải tab con, xử lý payment trực tiếp
                console.log('✅ Direct payment return, processing...');
                setPaymentStatus('processing');
                
                const processPayment = async () => {
                    try {
                        if (token) {
                            await levelPackageAPI.confirmLevelPayment(
                                token,
                                parseInt(orderCode),
                                levelParam.toUpperCase()
                            );
                        }
                        setPaymentStatus('success');
                        
                        // Refresh enrollments
                        if (isAuthenticated && token) {
                            const enrollmentsResponse = await levelPackageAPI.getUserLevelEnrollments(token);
                            if (enrollmentsResponse.success && enrollmentsResponse.data) {
                                const enrolled = new Set(enrollmentsResponse.data.map(e => e.level));
                                setEnrolledLevels(enrolled);
                            }
                        }
                        
                        // Xóa query params sau 2 giây
                        setTimeout(() => {
                            window.history.replaceState({}, '', '/courses');
                            setPaymentStatus('pending');
                        }, 2000);
                    } catch (error) {
                        console.error('❌ Payment processing error:', error);
                        setPaymentStatus('failed');
                    }
                };
                
                processPayment();
            }
        }
    }, [window.location.search, isAuthenticated, token]); // ✅ Thêm window.location.search để detect URL changes

    // Fetch user enrollments (và check pending payments)
    useEffect(() => {
        const fetchEnrollments = async () => {
            if (isAuthenticated && token) {
                try {
                    const enrollmentsResponse = await levelPackageAPI.getUserLevelEnrollments(token);
                    if (enrollmentsResponse.success && enrollmentsResponse.data) {
                        const enrolled = new Set(enrollmentsResponse.data.map(e => e.level));
                        setEnrolledLevels(enrolled);
                        
                        // ✅ AUTO-CHECK: Kiểm tra xem có pending payments trong localStorage không
                        const pendingPayments = localStorage.getItem('pendingLevelPayments');
                        if (pendingPayments) {
                            try {
                                const payments = JSON.parse(pendingPayments);
                                console.log('🔍 Found pending payments:', payments);
                                
                                // Kiểm tra từng payment
                                for (const payment of payments) {
                                    const { orderCode, level } = payment;
                                    
                                    // Nếu chưa enrolled, thử confirm payment
                                    if (!enrolled.has(level)) {
                                        console.log(`🔄 Auto-confirming payment: ${orderCode} for ${level}`);
                                        try {
                                            await levelPackageAPI.confirmLevelPayment(token, orderCode, level);
                                            console.log(`✅ Auto-confirmed: ${level}`);
                                            
                                            // ⚠️ KHÔNG tạo notification ở đây để tránh duplicate
                                            // Notification chỉ tạo ở message handler khi user đang active
                                            
                                            // Refresh enrollments
                                            const refreshed = await levelPackageAPI.getUserLevelEnrollments(token);
                                            if (refreshed.success && refreshed.data) {
                                                const newEnrolled = new Set(refreshed.data.map(e => e.level));
                                                setEnrolledLevels(newEnrolled);
                                            }
                                        } catch (confirmError) {
                                            console.error(`❌ Auto-confirm failed for ${level}:`, confirmError);
                                        }
                                    }
                                }
                                
                                // Xóa pending payments đã xử lý
                                localStorage.removeItem('pendingLevelPayments');
                            } catch (parseError) {
                                console.error('❌ Error parsing pending payments:', parseError);
                                localStorage.removeItem('pendingLevelPayments');
                            }
                        }
                    }
                } catch (error) {
                    console.error('Lỗi tải enrollments:', error);
                }
            }
            setLoading(false);
        };

        fetchEnrollments();
    }, [isAuthenticated, token]);

    // Lắng nghe message từ tab thanh toán
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            // Kiểm tra origin để bảo mật
            if (event.origin !== window.location.origin) {
                console.log('⚠️ Message from different origin, ignoring:', event.origin);
                return;
            }
            
            if (event.data.type === 'PAYMENT_SUCCESS') {
                console.log('✅ Nhận được thông báo thanh toán thành công:', event.data);
                console.log('Order Code:', event.data.orderCode);
                console.log('Level:', event.data.level);
                
                // ✅ ĐÓNG MODAL NGAY LẬP TỨC
                setPaymentModal(null);
                setPaymentStatus('processing');
                
                // Confirm payment và tạo enrollment
                try {
                    if (token) {
                        console.log('🔄 Gọi API confirm payment...');
                        const confirmResponse = await levelPackageAPI.confirmLevelPayment(
                            token,
                            parseInt(event.data.orderCode),
                            event.data.level
                        );
                        console.log('✅ Confirm payment response:', confirmResponse);
                        
                        // Thêm notification
                        addNotification(`level-${event.data.level}`, `Level ${event.data.level}`);
                        
                        // ✅ XÓA pending payment để tránh auto-check chạy lại
                        const pendingPayments = localStorage.getItem('pendingLevelPayments');
                        if (pendingPayments) {
                            try {
                                const payments = JSON.parse(pendingPayments);
                                const filtered = payments.filter(p => p.orderCode !== parseInt(event.data.orderCode));
                                if (filtered.length > 0) {
                                    localStorage.setItem('pendingLevelPayments', JSON.stringify(filtered));
                                } else {
                                    localStorage.removeItem('pendingLevelPayments');
                                }
                            } catch (e) {
                                localStorage.removeItem('pendingLevelPayments');
                            }
                        }
                    }
                } catch (error) {
                    console.error('❌ Lỗi tạo enrollment:', error);
                    // Vẫn tiếp tục refresh enrollments
                }
                
                // Cập nhật lại danh sách enrollments
                if (isAuthenticated && token) {
                    console.log('🔄 Đang refresh enrollments...');
                    const enrollmentsResponse = await levelPackageAPI.getUserLevelEnrollments(token);
                    if (enrollmentsResponse.success && enrollmentsResponse.data) {
                        const enrolled = new Set(enrollmentsResponse.data.map(e => e.level));
                        setEnrolledLevels(enrolled);
                        console.log('✅ Enrollments updated:', Array.from(enrolled));
                        
                        // Reset status
                        setPaymentStatus('pending');
                        console.log('✅ Payment flow hoàn tất');
                    }
                }
            }
        };
        
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [isAuthenticated, token]);

    // Update courseLevels with real enrollment data
    const courseLevelsWithEnrollment = courseLevels.map(course => ({
        ...course,
        isEnrolled: enrolledLevels.has(course.level),
    }));

    const filteredCourses = courseLevelsWithEnrollment.filter(
        (course) =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCourseClick = useCallback((levelId: string) => {
        const course = courseLevelsWithEnrollment.find(c => c.id === levelId);
        if (!course) return;

        // Nếu đã mua level → vào học ngay
        if (course.isEnrolled) {
            navigate(`/level/${levelId}`);
            return;
        }

        // Nếu chưa mua → kiểm tra login
        if (!isAuthenticated || !token) {
            navigate('/login', { state: { from: `/courses` } });
            return;
        }

        // Chưa mua và đã login → mở PayOS payment modal
        handlePurchase(course);
    }, [navigate, courseLevelsWithEnrollment, isAuthenticated, token]);

    const handlePurchase = async (course: CourseLevelData) => {
        if (!token) return;

        try {
            setPaymentStatus('processing');

            // Gọi API tạo payment link
            const response = await levelPackageAPI.createLevelPayment(token, course.level);

            if (response.success && response.data) {
                // ✅ LƯU pending payment vào localStorage (để check khi user quay lại)
                const pendingPayments = JSON.parse(localStorage.getItem('pendingLevelPayments') || '[]');
                pendingPayments.push({
                    orderCode: response.data.orderCode,
                    level: course.level,
                    timestamp: Date.now()
                });
                localStorage.setItem('pendingLevelPayments', JSON.stringify(pendingPayments));
                console.log('💾 Saved pending payment to localStorage:', response.data.orderCode);
                
                // Mở checkoutUrl trực tiếp trong tab mới
                window.open(response.data.checkoutUrl, '_blank');
                
                // Lưu thông tin để hiển thị modal chờ
                setPaymentModal({
                    orderCode: response.data.orderCode,
                    qrCode: response.data.qrCode,
                    checkoutUrl: response.data.checkoutUrl,
                    amount: response.data.amount,
                    level: course.level,
                });
            } else {
                alert(response.message || 'Không thể tạo thanh toán');
                setPaymentStatus('failed');
            }
        } catch (error) {
            console.error('Lỗi tạo thanh toán:', error);
            alert(error instanceof Error ? error.message : 'Lỗi khi tạo thanh toán');
            setPaymentStatus('failed');
        }
    };

    const closePaymentModal = () => {
        setPaymentModal(null);
        setPaymentStatus('pending');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <Loader2 style={{ width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <header className={styles.header}>
                <h1 className={styles.title}>Nâng cao kỹ năng của bạn</h1>
                <p className={styles.subtitle}>
                    Khám phá các khóa học tiếng Anh từ A1 đến C2, học từ nguồn tài liệu chuyên nghiệp,
                    và xây dựng kỹ năng ngôn ngữ cho tương lai của bạn!
                </p>
            </header>

            {/* Search Section */}
            <section className={styles.searchSection}>
                <div className={styles.searchWrapper}>
                    <div className={styles.searchInputContainer}>
                        <span className={styles.searchIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 38 38" fill="none">
                                <path d="M34.5833 37.5L21.4583 24.375C20.4167 25.2083 19.2188 25.8681 17.8646 26.3542C16.5104 26.8403 15.0694 27.0833 13.5417 27.0833C9.75694 27.0833 6.55417 25.7722 3.93333 23.15C1.3125 20.5278 0.00138999 17.325 1.10229e-06 13.5417C-0.00138779 9.75833 1.30972 6.55556 3.93333 3.93333C6.55695 1.31111 9.75972 0 13.5417 0C17.3236 0 20.5271 1.31111 23.1521 3.93333C25.7771 6.55556 27.0875 9.75833 27.0833 13.5417C27.0833 15.0694 26.8403 16.5104 26.3542 17.8646C25.8681 19.2187 25.2083 20.4167 24.375 21.4583L37.5 34.5833L34.5833 37.5ZM13.5417 22.9167C16.1458 22.9167 18.3597 22.0056 20.1833 20.1833C22.0069 18.3611 22.9181 16.1472 22.9167 13.5417C22.9153 10.9361 22.0042 8.72292 20.1833 6.90208C18.3625 5.08125 16.1486 4.16944 13.5417 4.16667C10.9347 4.16389 8.72153 5.07569 6.90208 6.90208C5.08264 8.72847 4.17083 10.9417 4.16667 13.5417C4.1625 16.1417 5.07431 18.3556 6.90208 20.1833C8.72986 22.0111 10.9431 22.9222 13.5417 22.9167Z" fill="black" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Tìm kiếm theo cấp độ, độ khó, chủ đề..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className={styles.filterButton} title="Lọc khóa học">
                        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 38 40" fill="none">
                            <path fillRule="evenodd" clipRule="evenodd" d="M0 3.125C0 2.2962 0.32924 1.50134 0.915291 0.915291C1.50134 0.32924 2.2962 0 3.125 0H34.375C35.2038 0 35.9987 0.32924 36.5847 0.915291C37.1708 1.50134 37.5 2.2962 37.5 3.125V7.47083C37.4998 8.57581 37.0606 9.63545 36.2792 10.4167L25 21.6958V37.1625C25.0001 37.5532 24.9002 37.9374 24.71 38.2786C24.5198 38.6198 24.2455 38.9068 23.9132 39.1122C23.5809 39.3176 23.2016 39.4346 22.8113 39.4522C22.421 39.4697 22.0327 39.3872 21.6833 39.2125L13.9396 35.3417C13.507 35.1254 13.1432 34.7929 12.889 34.3816C12.6347 33.9702 12.5 33.4961 12.5 33.0125V21.6958L1.22083 10.4167C0.439378 9.63545 0.000235989 8.57581 0 7.47083V3.125ZM4.16667 4.16667V7.47083L15.75 19.0542C16.0405 19.3443 16.271 19.6889 16.4283 20.0682C16.5856 20.4474 16.6666 20.854 16.6667 21.2646V32.0458L20.8333 34.1292V21.2646C20.8333 20.4354 21.1625 19.6396 21.75 19.0562L33.3333 7.46875V4.16667H4.16667Z" fill="black" />
                        </svg>
                        <span className={styles.filterBadge}>3</span>
                    </button>
                    <button className={styles.searchButton}>Tìm kiếm</button>
                </div>
            </section>

            {/* Course Cards Grid */}
            <section className={styles.cardsGrid}>
                {filteredCourses.map((course) => (
                    <CourseCard
                        key={course.id}
                        {...course}
                        onClick={() => handleCourseClick(course.id)}
                    />
                ))}
            </section>

            {/* Payment Modal - Chỉ hiển thị khi đang chờ thanh toán */}
            {paymentModal && paymentStatus === 'processing' && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '400px',
                        width: '100%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        <h3 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#111',
                            marginBottom: '16px'
                        }}>
                            Đang chờ thanh toán...
                        </h3>
                        <p style={{
                            color: '#666',
                            marginBottom: '24px'
                        }}>
                            Vui lòng hoàn tất thanh toán trên trang vừa mở
                        </p>

                        {/* Payment Info */}
                        <div style={{
                            backgroundColor: '#eff6ff',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '24px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#666' }}>Gói cấp độ:</span>
                                <span style={{ fontWeight: 600, color: '#111' }}>{paymentModal.level}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#666' }}>Số tiền:</span>
                                <span style={{ fontWeight: 600, color: '#111' }}>
                                    {formatPrice(paymentModal.amount)}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#666' }}>Mã đơn hàng:</span>
                                <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#111' }}>
                                    {paymentModal.orderCode}
                                </span>
                            </div>
                        </div>

                        {/* Loading Indicator */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: '#2563eb',
                            marginBottom: '16px'
                        }}>
                            <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                            <span>Đang chờ thanh toán...</span>
                        </div>

                        {/* Cancel Button */}
                        <button
                            onClick={closePaymentModal}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#f3f4f6',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#374151',
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {paymentStatus === 'success' && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        textAlign: 'center',
                        maxWidth: '400px'
                    }}>
                        <CheckCircle style={{ width: '64px', height: '64px', color: '#10b981', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Thanh toán thành công!</h3>
                        <p style={{ color: '#666' }}>Đang chuyển hướng...</p>
                    </div>
                </div>
            )}

            {/* Failed Modal */}
            {paymentStatus === 'failed' && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        textAlign: 'center',
                        maxWidth: '400px'
                    }}>
                        <XCircle style={{ width: '64px', height: '64px', color: '#ef4444', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Thanh toán thất bại</h3>
                        <p style={{ color: '#666', marginBottom: '16px' }}>Vui lòng thử lại</p>
                        <button
                            onClick={closePaymentModal}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseNewPage;
