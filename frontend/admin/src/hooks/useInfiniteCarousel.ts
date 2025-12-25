import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';

// Register GSAP plugin
gsap.registerPlugin(Draggable);

interface InfiniteCarouselConfig {
  speed?: number;
  paddingRight?: number;
  reversed?: boolean;
  paused?: boolean;
  draggable?: boolean;
  snap?: number | false;
  repeat?: number;
  itemsVisible?: number; // Number of items visible at once (controls gap)
}

interface CarouselTimeline extends gsap.core.Timeline {
  next: (vars?: gsap.TweenVars) => gsap.core.Tween;
  previous: (vars?: gsap.TweenVars) => gsap.core.Tween;
  current: () => number;
  toIndex: (index: number, vars?: gsap.TweenVars) => gsap.core.Tween;
  updateIndex: () => number;
  times: number[];
}

/**
 * Custom hook for infinite horizontal carousel using GSAP
 * Based on GSAP horizontalLoop helper
 */
export const useInfiniteCarousel = <T extends HTMLElement>(
  config: InfiniteCarouselConfig = {}
) => {
  const containerRef = useRef<T>(null);
  const loopRef = useRef<CarouselTimeline | null>(null);

  const horizontalLoop = useCallback(
    (items: HTMLElement[], loopConfig: InfiniteCarouselConfig): CarouselTimeline => {
      const tl = gsap.timeline({
        repeat: loopConfig.repeat ?? -1,
        paused: loopConfig.paused,
        defaults: { ease: 'none' },
        onReverseComplete: () => { tl.totalTime(tl.rawTime() + tl.duration() * 100); },
      }) as CarouselTimeline;

      const length = items.length;
      const startX = items[0].offsetLeft;
      const times: number[] = [];
      const widths: number[] = [];
      const xPercents: number[] = [];
      let curIndex = 0;
      const pixelsPerSecond = (loopConfig.speed || 1) * 100;
      const snapFn =
        loopConfig.snap === false
          ? (v: number) => v
          : gsap.utils.snap(loopConfig.snap || 1);

      const populateWidths = () => {
        items.forEach((el, i) => {
          widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px') as string);
          xPercents[i] = snapFn(
            (parseFloat(gsap.getProperty(el, 'x', 'px') as string) / widths[i]) * 100 +
            (gsap.getProperty(el, 'xPercent') as number)
          );
        });
      };

      const getTotalWidth = () =>
        items[length - 1].offsetLeft +
        (xPercents[length - 1] / 100) * widths[length - 1] -
        startX +
        items[length - 1].offsetWidth *
        (gsap.getProperty(items[length - 1], 'scaleX') as number) +
        (loopConfig.paddingRight || 0);

      populateWidths();

      gsap.set(items, {
        xPercent: (i) => xPercents[i],
      });
      gsap.set(items, { x: 0 });

      const totalWidth = getTotalWidth();

      for (let i = 0; i < length; i++) {
        const item = items[i];
        const curX = (xPercents[i] / 100) * widths[i];
        const distanceToStart = item.offsetLeft + curX - startX;
        const distanceToLoop =
          distanceToStart + widths[i] * (gsap.getProperty(item, 'scaleX') as number);

        tl.to(
          item,
          {
            xPercent: snapFn(((curX - distanceToLoop) / widths[i]) * 100),
            duration: distanceToLoop / pixelsPerSecond,
          },
          0
        )
          .fromTo(
            item,
            {
              xPercent: snapFn(((curX - distanceToLoop + totalWidth) / widths[i]) * 100),
            },
            {
              xPercent: xPercents[i],
              duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
              immediateRender: false,
            },
            distanceToLoop / pixelsPerSecond
          )
          .add('label' + i, distanceToStart / pixelsPerSecond);

        times[i] = distanceToStart / pixelsPerSecond;
      }

      function toIndex(index: number, vars: gsap.TweenVars = {}) {
        if (Math.abs(index - curIndex) > length / 2) {
          index += index > curIndex ? -length : length;
        }
        const newIndex = gsap.utils.wrap(0, length, index);
        let time = times[newIndex];
        if (time > tl.time() !== index > curIndex) {
          vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
          time += tl.duration() * (index > curIndex ? 1 : -1);
        }
        curIndex = newIndex;
        vars.overwrite = true;
        return tl.tweenTo(time, vars);
      }

      tl.next = (vars) => toIndex(curIndex + 1, vars);
      tl.previous = (vars) => toIndex(curIndex - 1, vars);
      tl.current = () => curIndex;
      tl.toIndex = (index, vars) => toIndex(index, vars);
      tl.updateIndex = () => (curIndex = Math.round(tl.progress() * (items.length - 1)));
      tl.times = times;

      tl.progress(1, true).progress(0, true);

      if (loopConfig.reversed) {
        tl.vars.onReverseComplete?.();
        tl.reverse();
      }

      // Draggable functionality
      if (loopConfig.draggable && typeof Draggable === 'function') {
        const proxy = document.createElement('div');
        const wrap = gsap.utils.wrap(0, 1);
        let ratio: number;
        let startProgress: number;
        let draggable: Draggable;
        let dragSnap: number;
        let roundFactor: number;
        let currentTotalWidth = totalWidth;

        const align = () => {
          if (loopRef.current) {
            loopRef.current.progress(
              wrap(startProgress + (draggable.startX - draggable.x) * ratio)
            );
          }
        };

        const syncIndex = () => { tl.updateIndex(); };

        draggable = Draggable.create(proxy, {
          trigger: containerRef.current,
          type: 'x',
          onPress() {
            if (loopRef.current) {
              startProgress = loopRef.current.progress();
              loopRef.current.progress(0);
              populateWidths();
              currentTotalWidth = getTotalWidth();
              ratio = 1 / currentTotalWidth;
              dragSnap = currentTotalWidth / items.length;
              roundFactor = Math.pow(10, ((dragSnap + '').split('.')[1] || '').length);
              loopRef.current.progress(startProgress);
            }
          },
          onDrag: align,
          onThrowUpdate: align,
          inertia: false,
          snap: (value) => {
            const n = Math.round(parseFloat(String(value)) / dragSnap) * dragSnap * roundFactor;
            return (n - (n % 1)) / roundFactor;
          },
          onRelease: syncIndex,
          onThrowComplete: () => {
            gsap.set(proxy, { x: 0 });
            syncIndex();
          },
        })[0];
      }

      return tl;
    },
    []
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const items = gsap.utils.toArray<HTMLElement>(
      containerRef.current.querySelectorAll('.carousel-item')
    );

    if (items.length === 0) return;

    // Calculate item width based on container
    const containerWidth = containerRef.current.offsetWidth;
    const itemsVisible = config.itemsVisible ?? 5; // Default show 5 items
    const itemWidth = containerWidth / itemsVisible;

    gsap.set(items, {
      x: (i) => i * itemWidth,
    });

    // paddingRight creates gap between last and first item when looping
    const paddingRight = config.paddingRight ?? itemWidth;

    loopRef.current = horizontalLoop(items, {
      speed: config.speed ?? 0.5,
      paused: config.paused ?? false,
      draggable: config.draggable ?? true,
      repeat: config.repeat ?? -1,
      reversed: config.reversed ?? false,
      paddingRight: paddingRight,
      snap: config.snap ?? 1,
    });

    return () => {
      if (loopRef.current) {
        loopRef.current.kill();
        loopRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horizontalLoop]);

  const pause = useCallback(() => {
    loopRef.current?.pause();
  }, []);

  const play = useCallback(() => {
    loopRef.current?.play();
  }, []);

  const next = useCallback(() => {
    loopRef.current?.next();
  }, []);

  const previous = useCallback(() => {
    loopRef.current?.previous();
  }, []);

  return {
    containerRef,
    pause,
    play,
    next,
    previous,
  };
};

export default useInfiniteCarousel;
