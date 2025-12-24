import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Rating.module.css';
import { useTextReveal } from '../../../hooks/useTextReveal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  id: number;
  title: string;
  content: string;
  author: string;
  year: string;
  color: string;
}

// Vibrant colors for each card
const CARD_COLORS = ['green', 'teal', 'cyan', 'amber', 'rose', 'violet'];

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    title: 'Học tiếng Anh hiệu quả',
    content: 'EngPro đã giúp tôi cải thiện kỹ năng tiếng Anh một cách đáng kể. Các bài học được thiết kế rất khoa học và dễ hiểu.',
    author: 'Nguyễn Minh Anh',
    year: '2025',
    color: 'green',
  },
  {
    id: 2,
    title: 'AI Chatbot tuyệt vời',
    content: 'Tính năng AI Chatbot giúp tôi luyện tập speaking mọi lúc mọi nơi. Cảm giác như có một gia sư riêng 24/7 vậy.',
    author: 'Trần Văn Hoàng',
    year: '2025',
    color: 'teal',
  },
  {
    id: 3,
    title: 'Lộ trình học rõ ràng',
    content: 'Placement test giúp xác định đúng trình độ, từ đó có lộ trình học phù hợp. Tiến bộ rõ rệt sau 3 tháng.',
    author: 'Lê Thị Hương',
    year: '2025',
    color: 'cyan',
  },
  {
    id: 4,
    title: 'Giao diện thân thiện',
    content: 'Giao diện đẹp, dễ sử dụng. Theo dõi tiến độ học tập rất trực quan qua dashboard.',
    author: 'Phạm Đức Thịnh',
    year: '2025',
    color: 'amber',
  },
  {
    id: 5,
    title: 'Nội dung phong phú',
    content: 'Kho bài học từ A1 đến C1 rất đa dạng. Mỗi bài học đều có video, bài tập và quiz để củng cố kiến thức.',
    author: 'Võ Thanh Tâm',
    year: '2025',
    color: 'rose',
  },
  {
    id: 6,
    title: 'Hỗ trợ tận tình',
    content: 'Đội ngũ support rất nhiệt tình. Mọi thắc mắc đều được giải đáp nhanh chóng và chu đáo.',
    author: 'Đỗ Quỳnh Chi',
    year: '2025',
    color: 'violet',
  },
];

/**
 * Rating component - Testimonials carousel with fan-style cards
 * Displays client reviews in an interactive carousel
 */
const Rating = memo(() => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = TESTIMONIALS.length;
  const carouselRef = useRef<HTMLDivElement>(null);

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

  // Carousel animation - slide from bottom with scroll trigger
  useEffect(() => {
    if (!carouselRef.current) return;

    gsap.set(carouselRef.current, {
      y: 100,
      opacity: 0,
    });

    gsap.to(carouselRef.current, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: carouselRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === carouselRef.current) {
          trigger.kill();
        }
      });
    };
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  }, [totalSlides]);

  // Get visible cards (show 5 cards at a time with current in center)
  const getVisibleCards = () => {
    const cards = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + totalSlides) % totalSlides;
      cards.push({
        ...TESTIMONIALS[index],
        position: i,
      });
    }
    return cards;
  };

  const visibleCards = getVisibleCards();

  // Get initials from author name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <section className={styles.rating}>
      <div className={styles.container}>
        {/* Header */}
        <h2 ref={titleRef} className={styles.title}>Học viên nói gì về chúng tôi</h2>

        {/* Cards Carousel */}
        <div ref={carouselRef} className={styles.carousel}>
          <div className={styles.cardsWrapper}>
            {visibleCards.map((card) => (
              <div
                key={`${card.id}-${card.position}`}
                className={styles.card}
                data-position={card.position}
                data-color={card.color}
              >
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardContent}>{card.content}</p>
                <div className={styles.cardAuthor}>
                  <div className={styles.avatar}>
                    {getInitials(card.author)}
                  </div>
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>{card.author}</span>
                    <span className={styles.authorYear}>{card.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className={styles.navigation}>
          <button
            className={styles.navButton}
            onClick={handlePrev}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Progress Indicators */}
          <div className={styles.indicators}>
            {TESTIMONIALS.map((_, index) => (
              <span
                key={index}
                className={`${styles.indicator} ${index === currentIndex ? styles.indicatorActive : ''}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>

          <button
            className={`${styles.navButton} ${styles.navButtonNext}`}
            onClick={handleNext}
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
});

Rating.displayName = 'Rating';

export default Rating;
