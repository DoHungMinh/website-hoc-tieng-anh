import React, { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  isActive: boolean;
  color?: string;
  barCount?: number;
  className?: string;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isActive,
  color = '#3B82F6',
  barCount = 5,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const barsRef = useRef<number[]>(Array(barCount).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barCount;
      const maxHeight = canvas.height;

      barsRef.current = barsRef.current.map((height) => {
        if (isActive) {
          // Random movement when active
          const targetHeight = Math.random() * maxHeight;
          return height + (targetHeight - height) * 0.2;
        } else {
          // Smooth decay to zero when inactive
          return height * 0.9;
        }
      });

      // Draw bars
      barsRef.current.forEach((height, index) => {
        const x = index * barWidth + barWidth * 0.2;
        const width = barWidth * 0.6;
        const y = (maxHeight - height) / 2;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, color, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={60}
      className={`${className}`}
      style={{ display: 'block' }}
    />
  );
};
