import { memo, useState, useEffect } from 'react';
import { Handshake } from 'lucide-react';
import styles from './Partners.module.css';
import { useInfiniteCarousel } from '../../../hooks/useInfiniteCarousel';
import { useTextReveal } from '../../../hooks/useTextReveal';

const PARTNERS = [
  { id: 1, name: 'Partner 1', logo: '/img/partner1.webp' },
  { id: 2, name: 'Partner 2', logo: '/img/partner2.svg' },
  { id: 3, name: 'Partner 3', logo: '/img/partner3.svg' },
  { id: 4, name: 'Partner 4', logo: '/img/partner4.png' },
  { id: 5, name: 'Partner 5', logo: '/img/partner5.svg' },
  { id: 6, name: 'Partner 6', logo: '/img/partner6.png' },
  { id: 7, name: 'Partner 7', logo: '/img/partner7.svg' },
  { id: 8, name: 'Partner 8', logo: '/img/partner8.svg' },
  { id: 9, name: 'Partner 9', logo: '/img/partner9.svg' }
];

/**
 * Partners section component
 * Displays trusted partner logos with infinite carousel animation
 */
const Partners = memo(() => {
  // Responsive itemsVisible configuration
  const [itemsVisible, setItemsVisible] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setItemsVisible(3);
      } else if (width < 768) {
        setItemsVisible(4);
      } else if (width < 1024) {
        setItemsVisible(5);
      } else {
        setItemsVisible(6);
      }
    };

    // Initial check
    handleResize();

    // Add debounce to prevent excessive updates
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 200);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const { containerRef, pause, play } = useInfiniteCarousel<HTMLDivElement>({
    speed: 0.6,
    draggable: true,
    reversed: false,
    itemsVisible: itemsVisible,
  });

  const { ref: subtitleRef } = useTextReveal<HTMLParagraphElement>({
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

  return (
    <section className={styles.partners}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <Handshake size={18} />
            <span>ĐỐI TÁC TIN CẬY</span>
          </div>
          <p ref={subtitleRef} className={styles.subtitle}>
            EngPro được tin dùng bởi các trường học và tổ chức giáo dục hàng đầu,
            cùng cam kết mang đến trải nghiệm học tập hiệu quả và thú vị.
          </p>
        </div>

        {/* Partner Logos - Infinite Carousel */}
        <div
          ref={containerRef}
          className={styles.logos}
          onMouseEnter={pause}
          onMouseLeave={play}
        >
          {PARTNERS.map((partner) => (
            <div key={partner.id} className={`${styles.logoItem} carousel-item`}>
              <img
                src={partner.logo}
                alt={partner.name}
                className={styles.logo}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

Partners.displayName = 'Partners';

export default Partners;
