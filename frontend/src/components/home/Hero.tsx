import React, { useEffect, useRef } from "react";
import { Video, GraduationCap, Smartphone, BookOpen } from "lucide-react";
import Logo from '@/components/common/Logo/Logo';
import { useTextReveal } from '@/hooks/useTextReveal';
// import { useScrambleText } from '@/hooks/useScrambleText';
import gsap from 'gsap';
import styles from './Hero.module.css';

interface HeroProps {
    onNavigate?: (page: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
    // Text reveal animations - matching SplitText mask effect
    const { ref: titleRef } = useTextReveal({
        type: 'words,lines',
        duration: 0.8,
        stagger: 0.1,
        ease: 'ease.out',
        delay: 0.2,
    });

    const { ref: descRef } = useTextReveal({
        type: 'words,lines',
        duration: 0.8,
        stagger: 0.1,
        ease: 'ease.out',
        delay: 0.5,
    });

    // Scramble text animation for stats - TEMPORARILY DISABLED
    // const { ref: statsTextRef } = useScrambleText({
    //     chars: 'upperAndLowerCase',
    //     duration: 2,
    //     revealDelay: 0.3,
    //     delay: 0,
    // });
    
    // Refs for floating badges
    const floatingBadgesRef = useRef<HTMLDivElement>(null);

    // Floating badges animation - slide from right
    useEffect(() => {
        if (!floatingBadgesRef.current) return;

        const badges = floatingBadgesRef.current.querySelectorAll(`.${styles.floatingBadge}`);
        
        gsap.set(badges, { 
            x: 100, 
            opacity: 0 
        });

        gsap.to(badges, {
            x: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.inOut',
            delay: 1,
        });

        return () => {
            gsap.killTweensOf(badges);
        };
    }, []);
    return (
        <section className={styles.hero}>
            <div className={styles.container}>
                <div className={styles.content}>
                    {/* Left Section */}
                    <div className={styles.leftSection}>
                        {/* Badge */}
                        <div className={styles.badge}>
                            <BookOpen className={styles.topBadgeIcon} size={20} />
                            <span className={styles.badgeText}>
                                Khóa học tiếng Anh cho mọi trình độ & mục tiêu
                            </span>
                        </div>

                        {/* Title */}
                        <h1 ref={titleRef} className={styles.title}>
                            Học tiếng Anh với EngPro
                        </h1>

                        {/* Description */}
                        <p ref={descRef} className={styles.description}>
                            Nền tảng học tiếng Anh trực tuyến toàn diện với AI Chatbot thông minh, 
                            hệ thống đánh giá năng lực và lộ trình học tập thích ứng, giúp bạn chinh phục mọi kỳ thi tiếng Anh.
                        </p>

                        {/* Buttons */}
                        <div className={styles.buttons}>
                            <button 
                                onClick={() => onNavigate?.("courses")}
                                className={styles.primaryButton}
                            >
                                Bắt đầu học miễn phí
                            </button>
                            <button className={styles.secondaryButton}>
                                Khám phá phương pháp
                            </button>
                        </div>

                        {/* Stats */}
                        <div className={styles.stats}>
                            <div className={styles.avatars}>
                                <img 
                                    src="/img/avatar1.webp" 
                                    alt="Student 1" 
                                    className={styles.avatar}
                                />
                                <img 
                                    src="/img/avatar2.webp"
                                    alt="Student 2" 
                                    className={styles.avatar}
                                />
                                <img 
                                    src="/img/avatar3.webp" 
                                    alt="Student 3" 
                                    className={styles.avatar}
                                />
                            </div>
                            <p className={styles.statsText}>
                                <span className={styles.statsHighlight}>30M+</span> Học viên trên toàn thế giới
                            </p>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className={styles.rightSection}>
                        <div ref={floatingBadgesRef} className={styles.imageContainer}>
                            <img 
                                src="/img/hero.webp" 
                                alt="Student learning online" 
                                className={styles.heroImage}
                            />
                            
                            {/* Floating Badges */}
                            <div className={`${styles.floatingBadge} ${styles.floatingTop}`}>
                                <div className={`${styles.badgeIcon} ${styles.videoIcon}`}>
                                    <Video size={20} />
                                </div>
                                Học qua video tương tác
                            </div>
                            
                            <div className={`${styles.floatingBadge} ${styles.floatingRight}`}>
                                <div className={styles.badgeIcon}>
                                    <BookOpen size={20} />
                                </div>
                                Khóa học chuẩn CEFR
                            </div>
                            
                            <div className={`${styles.floatingBadge} ${styles.floatingBottomRight}`}>
                                <div className={`${styles.badgeIcon} ${styles.capIcon}`}>
                                    <GraduationCap size={20} />
                                </div>
                                Nhận chứng chỉ hoàn thành
                            </div>
                            
                            <div className={`${styles.floatingBadge} ${styles.floatingBottom}`}>
                                <div className={styles.badgeIcon}>
                                    <Smartphone size={20} />
                                </div>
                                Học mọi lúc, mọi nơi
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
