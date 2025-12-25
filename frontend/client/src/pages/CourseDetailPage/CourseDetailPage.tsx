import { useState, useEffect, useLayoutEffect, useCallback, useRef, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI, Course } from '../../services/courseAPI';
import { useAuthStore } from '../../stores/authStore';
import { useEnrollment } from '../../hooks/useEnrollment';
import { STORAGE_KEYS } from '../../utils/constants';
import PageLoader from '../../components/common/PageLoader';
import styles from './CourseDetailPage.module.css';

const API_URL = import.meta.env.VITE_API_URL;

// Generate content based on course level and type
const generateWhatYouLearn = (level: string, type: string): string[] => {
    const baseSkills = {
        vocabulary: {
            'A1': ['Học 200+ từ vựng cơ bản thường ngày', 'Phát âm chính xác các từ vựng cơ bản', 'Sử dụng từ vựng trong giao tiếp hàng ngày'],
            'A2': ['Mở rộng vốn từ vựng lên 500+ từ', 'Sử dụng từ vựng để mô tả hoạt động hàng ngày', 'Kết hợp từ vựng để tạo câu phức tạp hơn'],
            'B1': ['Nắm vững 1000+ từ vựng đa dạng chủ đề', 'Sử dụng từ vựng chuyên ngành cơ bản', 'Phân biệt sắc thái nghĩa của từ vựng'],
            'B2': ['Làm chủ 1500+ từ vựng nâng cao', 'Sử dụng idioms và phrases thông dụng', 'Hiểu từ vựng academic và formal'],
            'C1': ['Thành thạo 2000+ từ vựng chuyên sâu', 'Sử dụng từ vựng academic một cách tự nhiên', 'Hiểu và dùng collocation chính xác'],
            'C2': ['Nắm vững 3000+ từ vựng đa dạng lĩnh vực', 'Sử dụng từ vựng như người bản ngữ', 'Hiểu và vận dụng từ vựng chuyên ngành sâu'],
        },
        grammar: {
            'A1': ['Sử dụng thì hiện tại đơn và hiện tại tiếp diễn', 'Tạo câu khẳng định, phủ định và nghi vấn cơ bản', 'Hiểu cấu trúc câu đơn giản'],
            'A2': ['Nắm vững các thì quá khứ đơn và tương lai đơn', 'Sử dụng modal verbs cơ bản (can, must, should)', 'Tạo câu ghép đơn giản'],
            'B1': ['Thành thạo perfect tenses (hiện tại hoàn thành)', 'Sử dụng passive voice trong các tình huống cơ bản', 'Hiểu và dùng conditional sentences loại 1'],
            'B2': ['Làm chủ tất cả các thì tiếng Anh', 'Sử dụng reported speech thành thạo', 'Hiểu và dùng conditional sentences loại 2, 3'],
            'C1': ['Sử dụng cấu trúc ngữ pháp nâng cao một cách tự nhiên', 'Hiểu và vận dụng inversion, emphasis structures', 'Sử dụng subjunctive mood chính xác'],
            'C2': ['Thành thạo tất cả cấu trúc ngữ pháp tiếng Anh', 'Sử dụng ngữ pháp như người bản ngữ', 'Thể hiện sự tinh tế trong cách diễn đạt'],
        },
    };
    return baseSkills[type as keyof typeof baseSkills]?.[level as keyof typeof baseSkills.vocabulary] ||
        ['Nâng cao kỹ năng tiếng Anh của bạn', 'Học từ vựng và ngữ pháp thực tế', 'Áp dụng kiến thức vào giao tiếp'];
};

const CourseDetailPage = memo(() => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [enrolling, setEnrolling] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [paymentData, setPaymentData] = useState<{
        qrCode?: string;
        checkoutUrl?: string;
        orderCode?: number;
    } | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<string>('');
    const paymentCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const { enrollments, fetchEnrollments } = useEnrollment();

    // Check if course is enrolled
    const isEnrolled = enrollments?.some(e => e.courseId?._id === courseId) || false;

    // Cleanup payment status check on unmount
    useEffect(() => {
        return () => {
            if (paymentCheckRef.current) {
                clearTimeout(paymentCheckRef.current);
            }
        };
    }, []);

    // Scroll to top on mount
    useLayoutEffect(() => {
        if (window.lenis) {
            window.lenis.scrollTo(0, { immediate: true });
        }
        window.scrollTo(0, 0);
    }, [courseId]);

    // Fetch course details
    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) return;

            try {
                setLoading(true);
                setError(null);
                const response = await courseAPI.getPublicCourseById(courseId);

                if (response.success && response.data) {
                    setCourse(response.data);
                } else {
                    setError('Không thể tải thông tin khóa học');
                }
            } catch (err) {
                console.error('Error fetching course:', err);
                setError('Có lỗi xảy ra khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    // Fetch enrollments on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchEnrollments();
        }
    }, [isAuthenticated, fetchEnrollments]);

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    // Check payment status
    const startPaymentStatusCheck = useCallback((orderCode: number) => {
        let attempts = 0;
        const maxAttempts = 20;

        const checkStatus = async () => {
            if (attempts >= maxAttempts) {
                console.log('Payment status check timeout');
                return;
            }

            attempts++;

            try {
                const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
                const response = await fetch(
                    `${API_URL}/payos/payment-status/${orderCode}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const result = await response.json();
                if (result.success) {
                    setPaymentStatus(result.status);

                    if (result.status === 'PAID') {
                        await handlePaymentSuccess(orderCode);
                        return;
                    }

                    if (result.status === 'CANCELLED' || result.status === 'EXPIRED') {
                        console.log('Payment was cancelled or expired');
                        return;
                    }
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
            }

            if (attempts < maxAttempts) {
                paymentCheckRef.current = setTimeout(checkStatus, 3000);
            }
        };

        paymentCheckRef.current = setTimeout(checkStatus, 2000);
    }, [courseId]);

    // Handle payment success
    const handlePaymentSuccess = useCallback(async (orderCode: number) => {
        try {
            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

            const response = await fetch(
                `${API_URL}/course/payos-payment-success`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        orderCode,
                        courseId: courseId,
                    }),
                }
            );

            const result = await response.json();

            if (result.success) {
                alert('✅ Thanh toán thành công! Bạn đã được đăng ký khóa học.');
                setShowQR(false);
                setPaymentData(null);
                window.location.reload();
            } else {
                alert(`❌ Lỗi xử lý thanh toán: ${result.message}`);
            }
        } catch (error) {
            console.error('Error handling payment success:', error);
            alert('❌ Lỗi xử lý thanh toán');
        }
    }, [courseId]);

    // Create PayOS payment
    const handleEnroll = useCallback(async () => {
        if (!isAuthenticated) {
            const confirmLogin = window.confirm(
                'Bạn cần đăng nhập để mua khóa học.\n\nNhấn OK để chuyển đến trang đăng nhập.'
            );
            if (confirmLogin) {
                navigate('/login');
            }
            return;
        }

        if (isEnrolled) {
            alert('Bạn đã đăng ký khóa học này rồi!');
            return;
        }

        try {
            setEnrolling(true);

            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            if (!token) {
                alert('Vui lòng đăng nhập để thanh toán');
                return;
            }

            const response = await fetch(
                `${API_URL}/payos/create-payment`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ courseId: courseId }),
                }
            );

            const result = await response.json();

            if (result.success && result.data) {
                setPaymentData(result.data);
                setShowQR(true);

                if (result.data.checkoutUrl) {
                    window.open(result.data.checkoutUrl, '_blank');
                    startPaymentStatusCheck(result.data.orderCode);
                } else {
                    alert('❌ Lỗi: Không nhận được link thanh toán từ PayOS');
                }
            } else {
                alert(`❌ Lỗi tạo thanh toán: ${result.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Payment creation error:', error);
            alert('❌ Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setEnrolling(false);
        }
    }, [isAuthenticated, isEnrolled, courseId, navigate, startPaymentStatusCheck]);

    const handleStartLearning = useCallback(() => {
        if (courseId) {
            navigate(`/learn/${courseId}`);
        }
    }, [navigate, courseId]);

    if (loading) {
        return <PageLoader />;
    }

    if (error || !course) {
        return (
            <div className={styles.container}>
                <div className={styles.errorState}>
                    <p>{error || 'Không tìm thấy khóa học'}</p>
                    <button onClick={handleBack}>Quay lại</button>
                </div>
            </div>
        );
    }

    const whatYouLearn = generateWhatYouLearn(course.level, course.type);

    // QR Code Modal
    if (showQR && paymentData) {
        return (
            <div className={styles.qrModal}>
                <div className={styles.qrCard}>
                    <div className={styles.qrHeader}>
                        <h2>Quét mã QR để thanh toán</h2>
                        <button onClick={() => setShowQR(false)} className={styles.closeBtn}>✕</button>
                    </div>

                    <div className={styles.qrContent}>
                        {paymentData.qrCode ? (
                            <img
                                src={`data:image/png;base64,${paymentData.qrCode}`}
                                alt="PayOS QR Code"
                                className={styles.qrImage}
                            />
                        ) : (
                            <div className={styles.qrPlaceholder}>
                                <p>Đang tạo mã QR...</p>
                            </div>
                        )}
                    </div>

                    <div className={styles.qrInfo}>
                        <div className={styles.qrInfoRow}>
                            <span>Khóa học:</span>
                            <span>{course.title}</span>
                        </div>
                        <div className={styles.qrInfoRow}>
                            <span>Số tiền:</span>
                            <span className={styles.qrAmount}>{course.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className={styles.qrInfoRow}>
                            <span>Trạng thái:</span>
                            <span className={styles.qrStatus}>{paymentStatus || 'Chờ thanh toán'}</span>
                        </div>
                    </div>

                    <div className={styles.qrInstructions}>
                        <p>1. Mở ứng dụng ngân hàng hoặc ví điện tử</p>
                        <p>2. Quét mã QR hoặc click vào link đã mở</p>
                        <p>3. Xác nhận thanh toán</p>
                    </div>

                    <div className={styles.qrLoading}>
                        <div className={styles.spinner}></div>
                        <span>Đang chờ thanh toán...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Left Column - Course Info */}
                <div className={styles.mainContent}>
                    {/* Header */}
                    <div className={styles.header}>
                        <span className={styles.levelBadge}>{course.level}</span>
                        <span className={styles.typeBadge}>
                            {course.type === 'vocabulary' ? 'Từ vựng' : 'Ngữ pháp'}
                        </span>
                    </div>

                    <h1 className={styles.title}>{course.title}</h1>
                    <p className={styles.description}>{course.description}</p>

                    {/* Stats */}
                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{course.lessonsCount}</span>
                            <span className={styles.statLabel}>Bài học</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{course.duration}</span>
                            <span className={styles.statLabel}>Thời lượng</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{course.studentsCount}</span>
                            <span className={styles.statLabel}>Học viên</span>
                        </div>
                    </div>

                    {/* What You'll Learn */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Bạn sẽ học được gì</h2>
                        <ul className={styles.learnList}>
                            {whatYouLearn.map((item, index) => (
                                <li key={index} className={styles.learnItem}>
                                    <span className={styles.checkIcon}>✓</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Benefits */}
                    {course.benefits && course.benefits.length > 0 && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Lợi ích khóa học</h2>
                            <ul className={styles.benefitsList}>
                                {course.benefits.map((benefit, index) => (
                                    <li key={index} className={styles.benefitItem}>
                                        <span className={styles.checkIcon}>✓</span>
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Instructor */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Giảng viên</h2>
                        <div className={styles.instructor}>
                            <div className={styles.instructorAvatar}>👨‍🏫</div>
                            <div className={styles.instructorInfo}>
                                <h3 className={styles.instructorName}>{course.instructor}</h3>
                                <p className={styles.instructorTitle}>Giáo viên chuyên ngành</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column - Purchase Card */}
                <div className={styles.sidebar}>
                    <div className={styles.purchaseCard}>
                        <div className={styles.priceSection}>
                            <span className={styles.price}>
                                {course.price.toLocaleString('vi-VN')}đ
                            </span>
                            {course.originalPrice && course.originalPrice > course.price && (
                                <span className={styles.originalPrice}>
                                    {course.originalPrice.toLocaleString('vi-VN')}đ
                                </span>
                            )}
                        </div>

                        {isEnrolled ? (
                            <button
                                className={styles.enrollButton}
                                onClick={handleStartLearning}
                            >
                                Tiếp tục học
                            </button>
                        ) : (
                            <button
                                className={styles.enrollButton}
                                onClick={handleEnroll}
                                disabled={enrolling}
                            >
                                {enrolling ? 'Đang xử lý...' : 'Đăng ký ngay'}
                            </button>
                        )}

                        <div className={styles.courseIncludes}>
                            <h4>Khóa học bao gồm:</h4>
                            <ul>
                                <li>{course.lessonsCount} bài học</li>
                                <li>{course.duration} học tập</li>
                                <li>Truy cập mọi thiết bị</li>
                                <li>Chứng chỉ hoàn thành</li>
                                <li>Truy cập trọn đời</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

CourseDetailPage.displayName = 'CourseDetailPage';

export default CourseDetailPage;
