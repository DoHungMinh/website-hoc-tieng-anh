import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Pricing.module.css';
import { useTextReveal } from '../../../hooks/useTextReveal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type BillingPeriod = 'monthly' | 'quarterly';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number | null;
  priceLabel?: string;
  period: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'outline' | 'filled';
  highlighted?: boolean;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Cơ bản',
    description: 'Phù hợp cho người mới bắt đầu muốn trải nghiệm nền tảng học tiếng Anh.',
    price: 5000,
    period: '/tháng',
    features: [
      'Truy cập khóa học A1-A2',
      'AI Chatbot cơ bản',
      'Bài tập luyện tập',
      'Theo dõi tiến độ',
      'Hỗ trợ qua email',
    ],
    buttonText: 'Bắt đầu ngay',
    buttonVariant: 'outline',
  },
  {
    id: 'pro',
    name: 'Chuyên nghiệp',
    description: 'Lựa chọn tốt nhất cho người học nghiêm túc muốn tiến bộ nhanh chóng.',
    price: 8000,
    period: '/tháng',
    features: [
      'Truy cập tất cả khóa học A1-C1',
      'AI Chatbot không giới hạn',
      'Luyện Speaking với AI',
      'Placement Test chi tiết',
      'Dashboard phân tích',
      'Chứng chỉ hoàn thành',
      'Hỗ trợ ưu tiên 24/7',
    ],
    buttonText: 'Bắt đầu ngay',
    buttonVariant: 'filled',
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Doanh nghiệp',
    description: 'Giải pháp tùy chỉnh cho tổ chức, trường học và doanh nghiệp.',
    price: null,
    priceLabel: 'Liên hệ!',
    period: '',
    features: [
      'Tất cả tính năng Pro',
      'Quản lý nhóm học viên',
      'Báo cáo tiến độ chi tiết',
      'API tích hợp',
      'Nội dung tùy chỉnh',
      'Account Manager riêng',
    ],
    buttonText: 'Liên hệ tư vấn',
    buttonVariant: 'filled',
  },
];

/**
 * Pricing component - Displays pricing plans
 * Features monthly/quarterly toggle and 3 pricing tiers
 */
const Pricing = memo(() => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const cardsRef = useRef<HTMLDivElement>(null);

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

  // Cards animation - slide from bottom with stagger
  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll(`.${styles.card}`);
    
    gsap.set(cards, {
      y: 100,
      opacity: 0,
    });

    gsap.to(cards, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: cardsRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === cardsRef.current) {
          trigger.kill();
        }
      });
    };
  }, []);

  const handleSelectPlan = useCallback((planId: string) => {
    if (planId === 'enterprise') {
      // Contact form or email
      window.location.href = 'mailto:contact@engpro.vn?subject=Tư vấn gói Doanh nghiệp';
    } else {
      navigate('/register');
    }
  }, [navigate]);

  const getPrice = (plan: PricingPlan) => {
    if (plan.price === null) return null;
    const price = billingPeriod === 'quarterly' 
      ? Math.round(plan.price * 0.9) 
      : plan.price;
    return price;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <section className={styles.pricing}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 ref={titleRef} className={styles.title}>Chọn gói phù hợp với bạn!</h2>
          <p ref={subtitleRef} className={styles.subtitle}>
            Lựa chọn gói học phù hợp nhất với nhu cầu của bạn.
            Cần thêm hoặc bớt? Tùy chỉnh dễ dàng!
          </p>
        </div>

        {/* Billing Toggle */}
        <div className={styles.toggle}>
          <button
            className={`${styles.toggleButton} ${billingPeriod === 'monthly' ? styles.toggleActive : ''}`}
            onClick={() => setBillingPeriod('monthly')}
          >
            Hàng tháng
          </button>
          <button
            className={`${styles.toggleButton} ${billingPeriod === 'quarterly' ? styles.toggleActive : ''}`}
            onClick={() => setBillingPeriod('quarterly')}
          >
            3 tháng (tiết kiệm 10%)
          </button>
        </div>

        {/* Pricing Cards */}
        <div ref={cardsRef} className={styles.cards}>
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`${styles.card} ${plan.highlighted ? styles.cardHighlighted : ''}`}
            >
              <div className={styles.cardHeader}>
                <span className={`${styles.planName} ${plan.highlighted ? styles.planNameHighlighted : ''}`}>
                  {plan.name}
                </span>
              </div>

              <p className={styles.planDescription}>{plan.description}</p>

              <div className={styles.priceWrapper}>
                {plan.price !== null ? (
                  <>
                    <span className={styles.price}>{formatPrice(getPrice(plan)!)}đ</span>
                    <span className={styles.period}>{plan.period}</span>
                  </>
                ) : (
                  <span className={styles.priceLabel}>{plan.priceLabel}</span>
                )}
              </div>

              <ul className={styles.features}>
                {plan.features.map((feature, index) => (
                  <li key={index} className={styles.feature}>
                    <Check size={18} className={styles.checkIcon} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`${styles.button} ${plan.buttonVariant === 'filled' ? styles.buttonFilled : styles.buttonOutline}`}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

Pricing.displayName = 'Pricing';

export default Pricing;
