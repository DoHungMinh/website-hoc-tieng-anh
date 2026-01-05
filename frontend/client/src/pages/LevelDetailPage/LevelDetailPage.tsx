import { useState, useMemo, useCallback, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { SkillType, SkillCourse } from '../../types/skill';
import { skillTabs } from '../../data/skillData';
import { courseAPI, Course } from '../../services/courseAPI';
import SkillTabs from '../../components/course/SkillTabs';
import SkillCourseGrid from '../../components/course/SkillCourseGrid';
import PageLoader from '../../components/common/PageLoader';
import styles from './LevelDetailPage.module.css';

// Level metadata
const levelInfo: Record<string, { title: string; description: string }> = {
    a1: { title: 'A1 - Sơ cấp', description: 'Bắt đầu hành trình tiếng Anh của bạn' },
    a2: { title: 'A2 - Cơ bản', description: 'Xây dựng nền tảng vững chắc' },
    b1: { title: 'B1 - Trung cấp', description: 'Phát triển kỹ năng giao tiếp' },
    b2: { title: 'B2 - Trung cấp cao', description: 'Nâng cao khả năng sử dụng ngôn ngữ' },
    c1: { title: 'C1 - Nâng cao', description: 'Làm chủ ngôn ngữ chuyên nghiệp' },
    c2: { title: 'C2 - Thành thạo', description: 'Đạt trình độ gần như người bản xứ' },
};

// Map API course type to skill type
const mapCourseTypeToSkill = (type: string): SkillType => {
    const mapping: Record<string, SkillType> = {
        vocabulary: 'vocabulary',
        grammar: 'grammar',
        listening: 'listening',
        speaking: 'speaking',
        reading: 'reading',
        writing: 'writing',
    };
    return mapping[type] || 'vocabulary';
};

// Convert API Course to SkillCourse format
const convertToSkillCourse = (course: Course): SkillCourse => {
    const variants: SkillCourse['variant'][] = ['pink', 'yellow', 'green', 'blue', 'purple', 'orange'];
    const variantIndex = Math.abs(course.title.charCodeAt(0)) % variants.length;

    return {
        id: course._id || '',
        title: course.title,
        description: course.description,
        materials: course.lessonsCount || 10,
        tag: `${course.level} Guideline`,
        courseType: course.type === 'vocabulary' ? 'Từ vựng' : 'Ngữ pháp',
        status: course.status === 'active' ? 'not_started' : 'paused',
        labels: course.benefits?.slice(0, 2) || ['Thiết yếu'],
        variant: variants[variantIndex],
    };
};

const LevelDetailPage = () => {
    const { level = 'a1' } = useParams<{ level: string }>();
    const navigate = useNavigate();
    const { token, isAuthenticated } = useAuthStore();
    const [activeTab, setActiveTab] = useState<SkillType>('vocabulary');
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Scroll to top on mount - using useLayoutEffect to run before browser paint
    useLayoutEffect(() => {
        // Reset Lenis scroll if available
        if (window.lenis) {
            window.lenis.scrollTo(0, { immediate: true });
        }
        // Fallback methods
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
    }, [level]);

    // Fetch courses from API WITH ENROLLMENT CHECK
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                setError(null);

                // Check if user is authenticated
                if (!isAuthenticated || !token) {
                    navigate('/login', { state: { from: `/level/${level}` } });
                    return;
                }

                // Use new API endpoint with enrollment check
                const response = await courseAPI.getCoursesByLevel(level.toUpperCase(), token);

                if (response.success && response.data) {
                    setCourses(response.data);
                } else {
                    setError('Không thể tải danh sách khóa học');
                }
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Có lỗi xảy ra khi tải dữ liệu. Bạn có thể chưa mua gói cấp độ này.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [level, isAuthenticated, token, navigate]);

    // Group courses by skill type - ONLY courses matching current level
    const coursesBySkill = useMemo(() => {
        const grouped: Record<SkillType, SkillCourse[]> = {
            vocabulary: [],
            grammar: [],
            listening: [],
            speaking: [],
            reading: [],
            writing: [],
        };

        // Filter courses to only include those matching the current level
        const filteredCourses = courses.filter(
            course => course.level.toLowerCase() === level.toLowerCase()
        );

        filteredCourses.forEach(course => {
            const skillType = mapCourseTypeToSkill(course.type);
            grouped[skillType].push(convertToSkillCourse(course));
        });

        return grouped;
    }, [courses, level]);

    // Memoize tabs with counts from real data
    const tabs = useMemo(() =>
        skillTabs.map(tab => ({
            ...tab,
            count: coursesBySkill[tab.id].length,
        })),
        [coursesBySkill]
    );

    // Get current level info
    const currentLevel = levelInfo[level.toLowerCase()] || levelInfo.a1;

    // Handle tab change
    const handleTabChange = useCallback((tabId: SkillType) => {
        setActiveTab(tabId);
    }, []);

    // Handle course click - navigate to course detail
    const handleCourseClick = useCallback((courseId: string) => {
        navigate(`/course/${courseId}`);
    }, [navigate]);

    if (loading) {
        return <PageLoader />;
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorState}>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.levelInfo}>
                    <h1 className={styles.title}>{currentLevel.title}</h1>
                    <p className={styles.description}>{currentLevel.description}</p>
                </div>
            </header>

            {/* Tabs Navigation */}
            <SkillTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            {/* Course Grid */}
            <section
                role="tabpanel"
                id={`panel-${activeTab}`}
                aria-labelledby={activeTab}
            >
                <SkillCourseGrid
                    courses={coursesBySkill[activeTab]}
                    onCourseClick={handleCourseClick}
                />
            </section>
        </div>
    );
};

export default LevelDetailPage;
