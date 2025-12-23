import { memo } from 'react';
import { Handshake } from 'lucide-react';
import styles from './Partners.module.css';
import { useInfiniteCarousel } from '../../../hooks/useInfiniteCarousel';

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
  const { containerRef, pause, play } = useInfiniteCarousel<HTMLDivElement>({
    speed: 0.6,
    draggable: true,
    reversed: false,
    itemsVisible: 10, // Số lượng logo hiển thị cùng lúc (tăng = gap nhỏ hơn, giảm = gap lớn hơn)
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
          <p className={styles.subtitle}>
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
