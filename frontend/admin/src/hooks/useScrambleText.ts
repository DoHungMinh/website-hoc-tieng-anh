import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface ScrambleTextConfig {
    chars?: string;
    duration?: number;
    revealDelay?: number;
    delay?: number;
}

interface ScrambleTextReturn {
    ref: React.RefObject<HTMLElement>;
    replay: () => void;
}

const CHAR_SETS: Record<string, string> = {
    upperAndLowerCase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    all: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
};

/**
 * Custom hook for scramble text animation using GSAP (free version)
 */
export function useScrambleText(config: ScrambleTextConfig = {}): ScrambleTextReturn {
    const {
        chars = 'upperAndLowerCase',
        duration = 2,
        revealDelay = 0.3,
        delay = 0,
    } = config;

    const ref = useRef<HTMLElement>(null);
    const originalHTMLRef = useRef<string>('');
    const originalTextRef = useRef<string>('');
    const tweenRef = useRef<gsap.core.Tween | null>(null);
    const initializedRef = useRef(false);

    const getCharSet = (): string => {
        return CHAR_SETS[chars] || chars;
    };

    const getRandomChar = (charSet: string): string => {
        return charSet[Math.floor(Math.random() * charSet.length)];
    };

    const scrambleText = (text: string, charSet: string): string => {
        return text.split('').map(char => {
            if (char === ' ') return ' ';
            return getRandomChar(charSet);
        }).join('');
    };

    const runAnimation = (targetText: string, originalHTML: string) => {
        const element = ref.current;
        if (!element) return;

        const charSet = getCharSet();
        const textLength = targetText.length;

        // Kill existing
        if (tweenRef.current) {
            tweenRef.current.kill();
        }

        // Set scrambled text first
        element.textContent = scrambleText(targetText, charSet);

        const obj = { progress: 0 };

        tweenRef.current = gsap.to(obj, {
            progress: 1,
            duration,
            delay,
            ease: 'none',
            onUpdate: () => {
                const progress = obj.progress;
                let result = '';
                
                for (let i = 0; i < textLength; i++) {
                    const charProgress = (progress - (i / textLength) * revealDelay) / (1 - revealDelay);
                    
                    if (charProgress >= 1) {
                        result += targetText[i];
                    } else {
                        result += getRandomChar(charSet);
                    }
                }
                
                element.textContent = result;
            },
            onComplete: () => {
                // Restore original HTML with styling
                if (element) {
                    element.innerHTML = originalHTML;
                }
            }
        });
    };

    const replay = () => {
        runAnimation(originalTextRef.current, originalHTMLRef.current);
    };

    useEffect(() => {
        const element = ref.current;
        if (!element || initializedRef.current) return;

        initializedRef.current = true;

        // Store original - must capture before any modification
        const originalHTML = element.innerHTML;
        const originalText = element.textContent || '';
        
        originalHTMLRef.current = originalHTML;
        originalTextRef.current = originalText;

        // Run animation with captured values
        runAnimation(originalText, originalHTML);

        return () => {
            if (tweenRef.current) {
                tweenRef.current.kill();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        ref: ref as React.RefObject<HTMLElement>,
        replay,
    };
}

export default useScrambleText;
