import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

interface CaptchaProps {
  onSolutionChange: (solution: string) => void;
  className?: string;
  canvasClassName?: string;
  refreshButtonClassName?: string;
  width?: number;
  height?: number;
}

export interface CaptchaRef {
  refresh: () => void;
  getSolution: () => string;
}

const Captcha = forwardRef<CaptchaRef, CaptchaProps>(({
  onSolutionChange,
  className,
  canvasClassName,
  refreshButtonClassName,
  width = 200,
  height = 50
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const solutionRef = useRef<string>('');

  const generateRandomString = useCallback((): string => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  const drawCaptcha = useCallback((text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f3f4f6');
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Add noise rectangles
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 120)}, ${Math.floor(
        Math.random() * 120
      )}, ${Math.floor(Math.random() * 120)}, ${Math.random() * 0.12 + 0.02})`;
      ctx.fillRect(
        Math.random() * width, 
        Math.random() * height, 
        Math.random() * 30, 
        Math.random() * 10
      );
    }

    // Draw text with varying rotation and position
    const charSpacing = width / (text.length + 1);
    for (let i = 0; i < text.length; i++) {
      const fontSize = 24 + Math.floor(Math.random() * 10);
      ctx.font = `${fontSize}px "Arial", sans-serif`;
      ctx.textBaseline = 'middle';
      const x = charSpacing * (i + 1) + (Math.random() * 6 - 3);
      const y = height / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() * 30 - 15) * (Math.PI / 180);
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = `rgba(${50 + Math.floor(Math.random() * 120)}, ${50 +
        Math.floor(Math.random() * 120)}, ${50 + Math.floor(Math.random() * 120)}, 0.9)`;
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    // Draw interfering lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${40 + Math.floor(Math.random() * 160)}, ${40 +
        Math.floor(Math.random() * 160)}, ${40 + Math.floor(Math.random() * 160)}, ${0.25 +
        Math.random() * 0.35})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.quadraticCurveTo(
        Math.random() * width, 
        Math.random() * height, 
        Math.random() * width, 
        Math.random() * height
      );
      ctx.stroke();
    }

    // Add dots noise
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(
        Math.random() * 200
      )}, ${Math.floor(Math.random() * 200)}, ${Math.random() * 0.6})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * width, 
        Math.random() * height, 
        Math.random() * 1.6, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
    }
  }, [width, height]);

  const generateCaptcha = useCallback(() => {
    const solution = generateRandomString();
    solutionRef.current = solution;
    onSolutionChange(solution);
    drawCaptcha(solution);
  }, [generateRandomString, onSolutionChange, drawCaptcha]);

  const handleRefresh = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    generateCaptcha();
  }, [generateCaptcha]);

  useImperativeHandle(ref, () => ({
    refresh: () => generateCaptcha(),
    getSolution: () => solutionRef.current
  }), [generateCaptcha]);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  return (
    <div className={`d-flex align-items-center gap-2 ${className || ''}`}>
      <canvas
        ref={canvasRef}
        className={`border ${canvasClassName || ''}`}
        style={{ cursor: 'pointer' }}
        onClick={handleRefresh}
        title="Click to refresh captcha"
      />
      <button
        type="button"
        className={`btn btn-outline-secondary btn-sm ${refreshButtonClassName || ''}`}
        onClick={handleRefresh}
        title="Refresh captcha"
        aria-label="Refresh captcha"
      >
        <i className="bi bi-arrow-clockwise" />
      </button>
    </div>
  );
});

Captcha.displayName = 'Captcha';

export default Captcha;
