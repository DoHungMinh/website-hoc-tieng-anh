import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TextRevealConfig {
    type?: 'words' | 'lines' | 'words,lines';
    duration?: number;
    stagger?: number;
    ease?: string;
    autoStart?: boolean;
    delay?: number;
    scrollTrigger?: ScrollTrigger.Vars;
}

interface TextRevealReturn {
    ref: React.RefObject<HTMLElement>;
    replay: (timeScale?: number) => void;
    pause: () => void;
    resume: () => void;
    reset: () => void;
    timeline: gsap.core.Timeline | null;
}

/**
 * Custom hook for text reveal animations using GSAP (free version)
 * Mimics SplitText behavior with mask effect on lines
 */
export function useTextReveal(config: TextRevealConfig = {}): TextRevealReturn {
    const {
        type = 'words,lines',
        duration = 0.6,
        stagger = 0.1,
        ease = 'expo.out',
        autoStart = true,
        delay = 0,
        scrollTrigger,
    } = config;

    const ref = useRef<HTMLElement>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);
    const originalHTMLRef = useRef<string>('');
    const isInitializedRef = useRef(false);

    // Split text into words
    const splitWords = useCallback((text: string): string[] => {
        return text.split(/\s+/).filter(word => word.length > 0);
    }, []);

    // Measure and split into lines based on element width
    const splitIntoLines = useCallback((element: HTMLElement, words: string[]): string[][] => {
        const lines: string[][] = [];
        let currentLine: string[] = [];
        
        // Create temp container matching element styles
        const computedStyle = window.getComputedStyle(element);
        const temp = document.createElement('span');
        temp.style.cssText = `
            position: absolute;
            visibility: hidden;
            white-space: nowrap;
            font-family: ${computedStyle.fontFamily};
            font-size: ${computedStyle.fontSize};
            font-weight: ${computedStyle.fontWeight};
            letter-spacing: ${computedStyle.letterSpacing};
        `;
        document.body.appendChild(temp);

        const maxWidth = element.offsetWidth;

        words.forEach(word => {
            const testText = [...currentLine, word].join(' ');
            temp.textContent = testText;
            
            if (temp.offsetWidth > maxWidth && currentLine.length > 0) {
                lines.push([...currentLine]);
                currentLine = [word];
            } else {
                currentLine.push(word);
            }
        });

        if (currentLine.length > 0) {
            lines.push(currentLine);
        }

        document.body.removeChild(temp);
        return lines;
    }, []);

    // Create masked line HTML structure
    const createMaskedLines = useCallback((lines: string[][]): string => {
        return lines.map(lineWords => {
            const lineContent = lineWords.join(' ');
            // Outer div: overflow hidden (mask), Inner div: the animated element
            return `<div class="line" style="overflow:hidden;"><div class="line-inner" style="display:block;will-change:transform;">${lineContent}</div></div>`;
        }).join('');
    }, []);

    // Create word spans
    const createWordSpans = useCallback((text: string): string => {
        const words = splitWords(text);
        return words.map(word => {
            return `<span style="display:inline-block;overflow:hidden;"><span class="word" style="display:inline-block;will-change:transform;">${word}</span></span>`;
        }).join(' ');
    }, [splitWords]);

    // Main animation function
    const animate = useCallback(() => {
        const element = ref.current;
        if (!element) return;

        // Kill existing timeline
        if (timelineRef.current) {
            timelineRef.current.kill();
        }

        // Get animated elements based on type
        let targets: NodeListOf<Element>;
        if (type === 'words,lines' || type === 'lines') {
            targets = element.querySelectorAll('.line-inner');
        } else {
            targets = element.querySelectorAll('.word');
        }
        
        if (targets.length === 0) return;

        // Create timeline
        const tl = gsap.timeline({ 
            paused: true, 
            delay,
            scrollTrigger: scrollTrigger ? {
                trigger: element,
                ...scrollTrigger,
            } : undefined,
        });

        // Animate from below with opacity
        tl.from(targets, {
            yPercent: 100,
            duration,
            stagger,
            ease,
        });

        timelineRef.current = tl;

        if (autoStart) {
            tl.play();
        }
    }, [autoStart, delay, duration, ease, stagger, type]);

    // Initialize - split text and setup DOM
    const init = useCallback(() => {
        const element = ref.current;
        if (!element || isInitializedRef.current) return;

        // Store original HTML
        originalHTMLRef.current = element.innerHTML;
        const text = element.textContent || '';

        // Set initial opacity to 0
        gsap.set(element, { opacity: 0 });

        let html = '';

        if (type === 'words,lines' || type === 'lines') {
            // Split into lines with masking
            const words = splitWords(text);
            const lines = splitIntoLines(element, words);
            html = createMaskedLines(lines);
        } else {
            // Split into words only
            html = createWordSpans(text);
        }

        element.innerHTML = html;
        isInitializedRef.current = true;

        // Set opacity to 1 and start animation
        gsap.set(element, { opacity: 1 });
        animate();
    }, [type, splitWords, splitIntoLines, createMaskedLines, createWordSpans, animate]);

    // Control methods
    const replay = useCallback((timeScale = 1) => {
        if (timelineRef.current) {
            timelineRef.current.timeScale(timeScale).play(0);
        }
    }, []);

    const pause = useCallback(() => {
        if (timelineRef.current) {
            timelineRef.current.pause();
        }
    }, []);

    const resume = useCallback(() => {
        if (timelineRef.current) {
            timelineRef.current.resume();
        }
    }, []);

    const reset = useCallback(() => {
        const element = ref.current;
        if (element && originalHTMLRef.current) {
            element.innerHTML = originalHTMLRef.current;
            gsap.set(element, { opacity: 1 });
        }
        if (timelineRef.current) {
            timelineRef.current.kill();
            timelineRef.current = null;
        }
        isInitializedRef.current = false;
    }, []);

    // Effect to initialize on mount
    useEffect(() => {
        // Wait for fonts to load before measuring
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                requestAnimationFrame(() => {
                    init();
                });
            });
        } else {
            requestAnimationFrame(() => {
                init();
            });
        }

        return () => {
            if (timelineRef.current) {
                timelineRef.current.kill();
            }
        };
    }, [init]);

    return {
        ref: ref as React.RefObject<HTMLElement>,
        replay,
        pause,
        resume,
        reset,
        timeline: timelineRef.current,
    };
}

export default useTextReveal;
