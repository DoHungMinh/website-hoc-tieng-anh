import { memo, useCallback } from 'react';
import { SkillCourse } from '../../../types/skill';
import SkillCourseCard from '../SkillCourseCard';
import styles from './SkillCourseGrid.module.css';

interface SkillCourseGridProps {
    courses: SkillCourse[];
    onCourseClick?: (courseId: string) => void;
}

const SkillCourseGrid = memo(({ courses, onCourseClick }: SkillCourseGridProps) => {
    const handleClick = useCallback((courseId: string) => {
        onCourseClick?.(courseId);
    }, [onCourseClick]);

    if (courses.length === 0) {
        return (
            <div className={styles.empty}>
                <p>Chưa có khoá học nào trong mục này.</p>
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            {courses.map((course) => (
                <SkillCourseCard
                    key={course.id}
                    {...course}
                    onClick={() => handleClick(course.id)}
                />
            ))}
        </div>
    );
});

SkillCourseGrid.displayName = 'SkillCourseGrid';

export default SkillCourseGrid;
