import { memo } from 'react';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Course.module.css';
import { useTextReveal } from '../../../hooks/useTextReveal';

interface CourseLevel {
  id: string;
  level: string;
  name: string;
  description: string;
  image?: string;
  isFeatured?: boolean;
}

const COURSE_LEVELS: CourseLevel[] = [
  {
    id: 'a1',
    level: 'A1',
    name: 'Sơ cấp',
    description: 'Xây dựng nền tảng với từ vựng cơ bản và các cụm từ đơn giản.',
    image: '/img/course.webp',
    isFeatured: true,
  },
  {
    id: 'a2',
    level: 'A2',
    name: 'Cơ bản',
    description: 'Hiểu các cuộc hội thoại hàng ngày và tạo câu cơ bản.',
  },
  {
    id: 'b1',
    level: 'B1',
    name: 'Trung cấp',
    description: 'Cải thiện sự lưu loát và giao tiếp rõ ràng trong các tình huống thực tế.',
  },
  {
    id: 'b2',
    level: 'B2',
    name: 'Trung cấp cao',
    description: 'Nâng cao độ chính xác, vốn từ vựng và sự tự tin.',
  },
  {
    id: 'c1',
    level: 'C1',
    name: 'Nâng cao',
    description: 'Nói như người bản xứ với ngữ pháp và phát âm chuẩn.',
  },
];

/**
 * Course component - Displays English course levels
 * Features a highlighted A1 course with image and grid of other levels
 */
const Course = memo(() => {
  const navigate = useNavigate();

  const { ref: titleRef } = useTextReveal({
    type: 'words,lines',
    duration: 0.8,
    stagger: 0.08,
    ease: 'expo.out',
    autoStart: false,
    delay: 0,
    scrollTrigger: {
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  });

  const { ref: subtitleRef } = useTextReveal({
    type: 'words,lines',
    duration: 0.8,
    stagger: 0.08,
    ease: 'expo.out',
    autoStart: false,
    delay: 0.2,
    scrollTrigger: {
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  });

  const handleStartCourse = (level: string) => {
    navigate(`/courses?level=${level.toLowerCase()}`);
  };

  const featuredCourse = COURSE_LEVELS.find((c) => c.isFeatured);
  const otherCourses = COURSE_LEVELS.filter((c) => !c.isFeatured);

  return (
    <section className={styles.course}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <GraduationCap size={18} />
            <span>Cấp độ khóa học</span>
          </div>
          <h2 ref={titleRef} className={styles.title}>Khóa học tiếng Anh cho mọi trình độ</h2>
          <p ref={subtitleRef} className={styles.subtitle}>
            Chọn cấp độ phù hợp và tiến bộ từng bước với các bài học
            được thiết kế theo tốc độ học của bạn.
          </p>
        </div>

        {/* Course Grid */}
        <div className={styles.grid}>
          {/* Featured Course - A1 */}
          {featuredCourse && (
            <div className={styles.featuredCard}>
              <div className={styles.featuredBadge}>
                <span className={styles.levelTag}>{featuredCourse.level}</span>
                <span className={styles.levelName}>{featuredCourse.name}</span>
              </div>
              <p className={styles.featuredDescription}>
                {featuredCourse.description}
              </p>
              <div className={styles.featuredImage}>
                <img
                  src={featuredCourse.image}
                  alt={`${featuredCourse.level} Course`}
                  loading="lazy"
                />
              </div>
              <button
                className={styles.featuredButton}
                onClick={() => handleStartCourse(featuredCourse.level)}
              >
                Bắt đầu {featuredCourse.level}
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Other Courses Grid */}
          <div className={styles.cardsGrid}>
            {otherCourses.map((course) => (
              <div key={course.id} className={styles.card}>
                <div className={styles.cardBadge}>
                  <span className={styles.cardLevel}>{course.level}</span>
                  <span className={styles.cardName}>{course.name}</span>
                </div>
                <p className={styles.cardDescription}>{course.description}</p>
                <button
                  className={styles.cardButton}
                  onClick={() => handleStartCourse(course.level)}
                >
                  Bắt đầu {course.level}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

Course.displayName = 'Course';

export default Course;
