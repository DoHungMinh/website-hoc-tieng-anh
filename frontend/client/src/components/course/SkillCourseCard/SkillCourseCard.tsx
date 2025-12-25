import { memo } from 'react';
import { SkillCourse } from '../../../types/skill';
import styles from './SkillCourseCard.module.css';

interface SkillCourseCardProps extends SkillCourse {
    onClick?: () => void;
}

const statusLabels: Record<SkillCourse['status'], string> = {
    not_started: 'Chưa bắt đầu',
    in_progress: 'Đang học',
    completed: 'Hoàn thành',
    paused: 'Tạm dừng',
};

const variantStyles = {
    pink: styles.variantPink,
    yellow: styles.variantYellow,
    green: styles.variantGreen,
    blue: styles.variantBlue,
    purple: styles.variantPurple,
    orange: styles.variantOrange,
};

const SkillCourseCard = memo(({
    title,
    description,
    materials,
    tag,
    courseType,
    status,
    labels,
    variant,
    onClick,
}: SkillCourseCardProps) => {
    return (
        <article className={styles.card} onClick={onClick}>
            {/* Header with gradient background */}
            <div className={`${styles.cardHeader} ${variantStyles[variant]}`}>
                <div className={styles.headerTop}>
                    <h3 className={styles.title}>{title}</h3>
                    <span className={styles.materials}>{materials} Tài liệu</span>
                </div>
                <span className={styles.tag}>{tag}</span>
            </div>

            {/* Card body */}
            <div className={styles.cardBody}>
                <div className={styles.courseType}>
                    <span className={styles.courseTypeIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 50 50" fill="none">
                            <path d="M41.6667 31.25C41.6667 35.1333 41.6667 37.075 41.0333 38.6042C40.6145 39.6153 40.0007 40.5341 39.2268 41.308C38.4529 42.0819 37.5341 42.6958 36.5229 43.1146C34.9917 43.75 33.05 43.75 29.1667 43.75H22.9167C15.0583 43.75 11.1292 43.75 8.6875 41.3083C6.25 38.8687 6.25 34.9396 6.25 27.0833V14.5833C6.25 12.3732 7.12797 10.2536 8.69078 8.69078C10.2536 7.12797 12.3732 6.25 14.5833 6.25" stroke="black" stroke-width="3.125" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20.8335 17.7083L21.7377 25.9771C21.7761 26.3161 21.9024 26.6391 22.1041 26.9143C22.3058 27.1895 22.5759 27.4072 22.8877 27.5458C24.3168 28.1604 26.9939 29.1666 29.1668 29.1666C31.3397 29.1666 34.0168 28.1604 35.446 27.5458C35.7581 27.4074 36.0286 27.1899 36.2307 26.9147C36.4328 26.6395 36.5595 26.3163 36.5981 25.9771L37.5002 17.7083M42.7085 15.625V23.4791M29.1668 8.33331L14.5835 14.5833L29.1668 20.8333L43.7502 14.5833L29.1668 8.33331Z" stroke="black" stroke-width="3.125" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </span>
                    <span>{courseType}</span>
                </div>

                <p className={styles.description}>{description}</p>

                <div className={styles.labels}>
                    {labels.map((label, index) => (
                        <span key={index} className={styles.label}>{label}</span>
                    ))}
                </div>

                <div className={styles.status}>
                    <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
                        {statusLabels[status]}
                    </span>
                </div>
            </div>
        </article>
    );
});

SkillCourseCard.displayName = 'SkillCourseCard';

export default SkillCourseCard;
