import { useEffect, useLayoutEffect, useState, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI, Course } from '../../services/courseAPI';
import { useAuthStore } from '../../stores/authStore';
import { useEnrollment } from '../../hooks/useEnrollment';
import PageLoader from '../../components/common/PageLoader';
import styles from './CourseLearningPage.module.css';

const CourseLearningPage = memo(() => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'vocabulary' | 'grammar'>('vocabulary');
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const { enrollments, fetchEnrollments } = useEnrollment();

    // Check if course is enrolled
    const isEnrolled = enrollments?.some(e => e.courseId?._id === courseId) || false;

    // Scroll to top
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
                const response = await courseAPI.getPublicCourseById(courseId);

                if (response.success && response.data) {
                    setCourse(response.data);
                    // Set default tab based on available content
                    if (response.data.vocabulary?.length > 0) {
                        setActiveTab('vocabulary');
                    } else if (response.data.grammar?.length > 0) {
                        setActiveTab('grammar');
                    }
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

    // Fetch enrollments
    useEffect(() => {
        if (isAuthenticated) {
            fetchEnrollments();
        }
    }, [isAuthenticated, fetchEnrollments]);

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);


    // Play audio pronunciation
    const playAudio = useCallback((audioUrl: string, wordId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card expansion

        const audio = new Audio(audioUrl);
        setPlayingAudio(wordId);

        audio.onended = () => {
            setPlayingAudio(null);
        };

        audio.onerror = () => {
            setPlayingAudio(null);
            console.error('Error playing audio');
        };

        audio.play().catch((error) => {
            console.error('Error playing audio:', error);
            setPlayingAudio(null);
        });
    }, []);

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

    // Check access
    if (!isEnrolled && !isAuthenticated) {
        return (
            <div className={styles.container}>
                <div className={styles.accessDenied}>
                    <div className={styles.accessIcon}>🔒</div>
                    <h2>Bạn cần đăng ký khóa học</h2>
                    <p>Vui lòng đăng nhập và đăng ký khóa học để truy cập nội dung học tập.</p>
                    <div className={styles.accessActions}>
                        <button onClick={() => navigate('/login')}>Đăng nhập</button>
                        <button onClick={handleBack} className={styles.secondaryBtn}>Quay lại</button>
                    </div>
                </div>
            </div>
        );
    }

    const hasVocabulary = course.vocabulary && course.vocabulary.length > 0;
    const hasGrammar = course.grammar && course.grammar.length > 0;

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>

                <div className={styles.headerInfo}>
                    <span className={styles.levelBadge}>{course.level}</span>
                    <h1 className={styles.title}>{course.title}</h1>
                </div>
            </header>



            {/* Content */}
            <div className={styles.content}>
                {activeTab === 'vocabulary' && hasVocabulary && (
                    <div className={styles.vocabularyGrid}>
                        {course.vocabulary?.map((item) => (
                            <div
                                key={item.id}
                                className={styles.vocabCard}
                            >
                                <div className={styles.vocabHeader}>
                                    <div className={styles.vocabWord}>
                                        <div className={styles.wordWithAudio}>
                                            <h3>{item.word}</h3>
                                            {item.audioUrl && (
                                                <button
                                                    className={`${styles.audioButton} ${playingAudio === item.id ? styles.playing : ''}`}
                                                    onClick={(e) => playAudio(item.audioUrl!, item.id, e)}
                                                    disabled={playingAudio === item.id}
                                                    title="Nghe phát âm"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                                    </svg>
                                                    {playingAudio === item.id && (
                                                        <span className={styles.audioWave}></span>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                        {item.pronunciation && (
                                            <span className={styles.pronunciation}>/{item.pronunciation}/</span>
                                        )}
                                    </div>
                                </div>
                                <p className={styles.vocabMeaning}>{item.meaning}</p>
                                {item.example && (
                                    <div className={styles.vocabExample}>
                                        <span className={styles.exampleLabel}>Ví dụ:</span>
                                        <p>{item.example}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'grammar' && hasGrammar && (
                    <div className={styles.grammarList}>
                        {course.grammar?.map((item) => (
                            <div
                                key={item.id}
                                className={styles.grammarCard}
                            >
                                <div className={styles.grammarHeader}>
                                    <h3>{item.rule}</h3>
                                </div>
                                {item.structure && (
                                    <div className={styles.grammarStructure}>
                                        <code>{item.structure}</code>
                                    </div>
                                )}
                                <div className={styles.grammarDetails}>
                                    <div className={styles.grammarExplanation}>
                                        <span className={styles.detailLabel}>Giải thích:</span>
                                        <p>{item.explanation}</p>
                                    </div>
                                    <div className={styles.grammarExample}>
                                        <span className={styles.detailLabel}>Ví dụ:</span>
                                        <p>{item.example}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!hasVocabulary && !hasGrammar && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📭</div>
                        <h3>Chưa có nội dung</h3>
                        <p>Nội dung khóa học đang được cập nhật. Vui lòng quay lại sau.</p>
                    </div>
                )}
            </div>
        </div>
    );
});

CourseLearningPage.displayName = 'CourseLearningPage';

export default CourseLearningPage;
