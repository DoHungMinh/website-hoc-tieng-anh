import { memo, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Download, Mic, MessageCircle, BookOpen, Brain, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Features.module.css';
import { useTextReveal } from '../../hooks/useTextReveal';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

interface FeaturesProps {
  onNavigate?: (page: string) => void;
}

type CardColor = 'green' | 'yellow' | 'blue' | 'pink' | 'purple' | 'orange';

interface Feature {
  icon: typeof Download;
  title: string;
  description: string;
  buttonText: string;
  color: CardColor;
  action?: string;
}

const FEATURES: Feature[] = [
  {
    icon: Download,
    title: 'Bài học có sẵn',
    description: 'Học tiếng Anh mọi lúc mọi nơi với các bài học được thiết kế bài bản. Không cần lịch trình cố định - truy cập ngay các bài giảng chuyên sâu.',
    buttonText: 'Xem bài học',
    color: 'green',
    action: 'courses',
  },
  {
    icon: Mic,
    title: 'Điều khiển bằng giọng nói',
    description: 'Công nghệ AI nhận diện giọng nói giúp bạn học phát âm chuẩn. Điều khiển website chỉ bằng giọng nói của bạn.',
    buttonText: 'Thử ngay',
    color: 'yellow',
    action: 'practice',
  },
  {
    icon: MessageCircle,
    title: 'Chat AI thông minh',
    description: 'Nói chuyện, đặt câu hỏi và nhận phản hồi ngay lập tức từ AI Tutor. Kết nối với mentor mọi lúc.',
    buttonText: 'Tham gia',
    color: 'blue',
  },
  {
    icon: BookOpen,
    title: 'Khóa học đa dạng',
    description: 'Từ vựng, ngữ pháp, thành ngữ - tất cả trong một. Lộ trình học được cá nhân hóa theo trình độ của bạn.',
    buttonText: 'Khám phá',
    color: 'pink',
    action: 'courses',
  },
  {
    icon: Brain,
    title: 'Luyện thi IELTS',
    description: 'Đề thi IELTS Reading & Listening mô phỏng thực tế. Chấm điểm tự động với phân tích chi tiết.',
    buttonText: 'Luyện thi',
    color: 'purple',
    action: 'practice',
  },
  {
    icon: Target,
    title: 'Theo dõi tiến độ',
    description: 'Dashboard thông minh theo dõi mọi bước tiến của bạn. Streak học tập và thành tích được cập nhật liên tục.',
    buttonText: 'Xem ngay',
    color: 'orange',
    action: 'dashboard',
  },
];

const getColorClass = (color: CardColor, type: 'card' | 'iconBox' | 'circle') => {
  const colorMap = {
    card: {
      green: styles.cardGreen,
      yellow: styles.cardYellow,
      blue: styles.cardBlue,
      pink: styles.cardPink,
      purple: styles.cardPurple,
      orange: styles.cardOrange,
    },
    iconBox: {
      green: styles.iconBoxGreen,
      yellow: styles.iconBoxYellow,
      blue: styles.iconBoxBlue,
      pink: styles.iconBoxPink,
      purple: styles.iconBoxPurple,
      orange: styles.iconBoxOrange,
    },
    circle: {
      green: styles.circleGreen,
      yellow: styles.circleYellow,
      blue: styles.circleBlue,
      pink: styles.circlePink,
      purple: styles.circlePurple,
      orange: styles.circleOrange,
    },
  };
  return colorMap[type][color];
};

/**
 * Features section with horizontal swiper carousel
 * Displays special features for the platform
 */
const Features = memo<FeaturesProps>(({ onNavigate }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const { ref: titleLine1Ref } = useTextReveal({
    type: 'words',
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

  const { ref: titleLine2Ref } = useTextReveal({
    type: 'words',
    duration: 0.8,
    stagger: 0.08,
    ease: 'expo.out',
    autoStart: false,
    delay: 0.15,
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

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex);
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }, []);

  const handleButtonClick = useCallback((action?: string) => {
    if (action && onNavigate) {
      onNavigate(action);
    }
  }, [onNavigate]);

  const handlePrev = useCallback(() => {
    swiperInstance?.slidePrev();
  }, [swiperInstance]);

  const handleNext = useCallback(() => {
    swiperInstance?.slideNext();
  }, [swiperInstance]);

  return (
    <section id="features" className={styles.features}>
      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>
              <span ref={titleLine1Ref} className={styles.titleLine}>Tính năng</span>
              <span ref={titleLine2Ref} className={styles.titleLine}>đặc biệt cho bạn</span>
            </h2>
            
            <p ref={subtitleRef} className={styles.subtitle}>
              Chúng tôi kết hợp công nghệ thông minh và thực hành thực tế để hành trình học tiếng Anh của bạn trở nên mượt mà hơn bao giờ hết.
            </p>

            {/* Navigation Arrows */}
            <div className={styles.navigation}>
              <button
                type="button"
                className={styles.navButton}
                onClick={handlePrev}
                disabled={isBeginning}
                aria-label="Previous slide"
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                className={styles.navButton}
                onClick={handleNext}
                disabled={isEnd}
                aria-label="Next slide"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>

        {/* Swiper Carousel */}
        <div className={styles.sliderWrapper}>
          <Swiper
            modules={[Navigation]}
            spaceBetween={24}
            slidesPerView="auto"
            centeredSlides={false}
            onSwiper={setSwiperInstance}
            onSlideChange={handleSlideChange}
            className={styles.swiperContainer}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 16 },
              640: { slidesPerView: 1.5, spaceBetween: 20 },
              768: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 2.5, spaceBetween: 24 },
              1280: { slidesPerView: 3, spaceBetween: 24 },
            }}
          >
            {FEATURES.map((feature, index) => (
              <SwiperSlide key={index} style={{ width: 'auto' }}>
                <div className={`${styles.card} ${getColorClass(feature.color, 'card')}`}>
                  {/* Decorative shapes */}
                  <div className={styles.decorations}>
                    <div className={`${styles.circle1} ${getColorClass(feature.color, 'circle')}`} />
                    <div className={`${styles.circle2} ${getColorClass(feature.color, 'circle')}`} />
                  </div>

                  {/* Icon */}
                  <div className={`${styles.iconBox} ${getColorClass(feature.color, 'iconBox')}`}>
                    <feature.icon />
                  </div>

                  {/* Content */}
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{feature.title}</h3>
                    <p className={styles.cardDescription}>{feature.description}</p>
                    <button
                      className={styles.cardButton}
                      onClick={() => handleButtonClick(feature.action)}
                    >
                      {feature.buttonText}
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
});

Features.displayName = 'Features';

export default Features;