import styles from './CourseCard.module.css';

export interface CourseCardProps {
    id: string;
    level: string;
    tag: string;
    variant: 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';
    title: string;
    description: string;
    tasks: number;
    projects: number;
    progress: number;
    modules: { current: number; total: number };
    icon: string;
    isEnrolled: boolean;
    startDate?: string;
    onClick?: () => void;
}

const variantStyles = {
    a1: styles.cardA1,
    a2: styles.cardA2,
    b1: styles.cardB1,
    b2: styles.cardB2,
    c1: styles.cardC1,
    c2: styles.cardC2,
};

const CourseCard = ({
    level,
    tag,
    variant,
    title,
    description,
    tasks,
    projects,
    progress,
    modules,
    icon,
    isEnrolled,
    startDate,
    onClick,
}: CourseCardProps) => {
    return (
        <article
            className={`${styles.card} ${variantStyles[variant]}`}
            onClick={onClick}
        >
            <div className={styles.cardContent}>
                <div className={styles.topContent}>
                    {/* Flex container: Info left, Icon right */}
                    <div className={styles.cardMain}>
                        {/* Left side - Text info */}
                        <div className={styles.cardInfo}>
                            <span className={styles.tag}>{tag}</span>
                            <h2 className={styles.cardTitle}>{title}</h2>
                            <p className={styles.cardDescription}>{description}</p>

                            <div className={styles.stats}>
                                <div className={styles.stat}>
                                    <span className={styles.statIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 50 50" fill="none">
                                            <path d="M16.6587 31.25H23.8024M16.6587 22.9166H33.3254M30.2004 4.16663H19.7837C18.9549 4.16663 18.16 4.49587 17.574 5.08192C16.9879 5.66797 16.6587 6.46282 16.6587 7.29163C16.6587 8.12043 16.9879 8.91528 17.574 9.50133C18.16 10.0874 18.9549 10.4166 19.7837 10.4166H30.2004C31.0292 10.4166 31.824 10.0874 32.4101 9.50133C32.9961 8.91528 33.3254 8.12043 33.3254 7.29163C33.3254 6.46282 32.9961 5.66797 32.4101 5.08192C31.824 4.49587 31.0292 4.16663 30.2004 4.16663Z" stroke="black" stroke-width="3.125" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M33.3252 7.29163C36.5627 7.38954 38.4919 7.74996 39.8273 9.08746C41.6606 10.9166 41.6606 13.8645 41.6606 19.7541V33.3333C41.6606 39.225 41.6606 42.1708 39.8273 44.002C37.9981 45.8333 35.0502 45.8333 29.1606 45.8333H20.8273C14.9314 45.8333 11.9856 45.8333 10.1564 44.002C8.32728 42.1708 8.3252 39.225 8.3252 33.3333V19.7562C8.3252 13.8645 8.3252 10.9166 10.1564 9.08746C11.4919 7.74996 13.4231 7.38954 16.6585 7.29163" stroke="black" stroke-width="3.125" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </span>
                                    <span>{tasks} bài tập</span>
                                </div>
                                <span className={styles.statDivider}>•</span>
                                <div className={styles.stat}>
                                    <span className={styles.statIcon}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 50 50" fill="none">
                                            <path d="M41.6667 31.25C41.6667 35.1333 41.6667 37.075 41.0333 38.6042C40.6145 39.6153 40.0007 40.5341 39.2268 41.308C38.4529 42.0819 37.5341 42.6958 36.5229 43.1146C34.9917 43.75 33.05 43.75 29.1667 43.75H22.9167C15.0583 43.75 11.1292 43.75 8.6875 41.3083C6.25 38.8687 6.25 34.9396 6.25 27.0833V14.5833C6.25 12.3732 7.12797 10.2536 8.69078 8.69078C10.2536 7.12797 12.3732 6.25 14.5833 6.25" stroke="black" stroke-width="3.125" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M20.8335 17.7083L21.7377 25.9771C21.7761 26.3161 21.9024 26.6391 22.1041 26.9143C22.3058 27.1895 22.5759 27.4072 22.8877 27.5458C24.3168 28.1604 26.9939 29.1666 29.1668 29.1666C31.3397 29.1666 34.0168 28.1604 35.446 27.5458C35.7581 27.4074 36.0286 27.1899 36.2307 26.9147C36.4328 26.6395 36.5595 26.3163 36.5981 25.9771L37.5002 17.7083M42.7085 15.625V23.4791M29.1668 8.33331L14.5835 14.5833L29.1668 20.8333L43.7502 14.5833L29.1668 8.33331Z" stroke="black" stroke-width="3.125" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </span>
                                    <span>{projects} khoá</span>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Icon */}
                        <div className={styles.avatarWrapper}>
                            <img
                                src={icon}
                                alt={level}
                                className={styles.avatarImage}
                            />
                        </div>
                    </div>

                    {/* Progress bar - full width */}
                    <div className={styles.progressSection}>
                        <div className={styles.progressHeader}>
                            <span className={styles.progressLabel}>Tiến độ</span>
                            <span className={styles.progressValue}>{progress}%</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>


                <div className={styles.cardFooter}>
                    <div className={styles.footerInfo}>
                        {isEnrolled ? (
                            <>
                                <span className={styles.footerInfoLabel}>Bài học: </span>
                                <span className={styles.footerInfoValue}>
                                    {modules.current}/{modules.total}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className={styles.footerInfoLabel}>Ngày bắt đầu: </span>
                                <span className={styles.footerInfoValue}>{startDate}</span>
                            </>
                        )}
                    </div>
                    <button
                        className={`${styles.actionButton} ${isEnrolled ? styles.continueButton : styles.applyButton
                            }`}
                    >
                        {isEnrolled ? 'Tiếp tục' : 'Đăng ký'}
                    </button>
                </div>
            </div>
        </article>
    );
};

export default CourseCard;
