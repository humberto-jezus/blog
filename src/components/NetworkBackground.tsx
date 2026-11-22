import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  z: number;
  baseY: number;
  y: number;
  px: number;
  py: number;
  scale: number;
}

const NetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let time = 0;

    const points: Point[] = [];
    const cols = 35;
    const rows = 25;
    const spacing = 120;

    // Generate irregular grid for the network terrain
    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < cols; x++) {
        points.push({
          x: (x - cols / 2) * spacing + (Math.random() - 0.5) * spacing * 0.8,
          z: z * spacing + (Math.random() - 0.5) * spacing * 0.8,
          baseY: 180,
          y: 0,
          px: 0,
          py: 0,
          scale: 0
        });
      }
    }

    // Stars configuration
    const stars: {x: number, y: number, size: number, speed: number}[] = [];
    for(let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 1.5,
            speed: Math.random() * 0.2 + 0.05
        });
    }

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Background Gradient (Deep dark blue)
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#010510'); 
      bgGradient.addColorStop(0.4, '#020a1c');
      bgGradient.addColorStop(1, '#051838');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Lens flares / Glows (Subtle bokeh effects)
      const drawGlow = (x: number, y: number, r: number, color: string) => {
          const g = ctx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, color);
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
      };
      drawGlow(width * 0.1, height * 0.9, width * 0.5, 'rgba(12, 65, 135, 0.4)');
      drawGlow(width * 0.9, height * 0.8, width * 0.4, 'rgba(10, 50, 100, 0.3)');
      drawGlow(width * 0.05, height * 0.1, 250, 'rgba(255, 255, 255, 0.015)');
      drawGlow(width * 0.95, height * 0.15, 300, 'rgba(255, 255, 255, 0.015)');

      // 3. Stars (Drifting upwards)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      stars.forEach(star => {
          star.y -= star.speed;
          if (star.y < 0) {
              star.y = height;
              star.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
      });

      // 4. Update and Project Points
      const focalLength = 400;
      const cameraZ = -200;
      const cameraY = -250; 

      const activePoints: Point[] = [];

      points.forEach(p => {
        const distance = Math.sqrt(p.x*p.x + p.z*p.z);
        p.y = p.baseY + Math.sin(p.x * 0.005 + time) * Math.cos(p.z * 0.005 + time) * 120 
                      + Math.sin(distance * 0.002 - time) * 60;

        const dz = p.z - cameraZ;
        if (dz > 0) {
          p.scale = focalLength / dz;
          p.px = width / 2 + p.x * p.scale;
          p.py = height / 2 + (p.y - cameraY) * p.scale + height * 0.15;
          activePoints.push(p);
        }
      });

      // 5. Draw Network Lines
      ctx.lineWidth = 1.0;
      for (let i = 0; i < activePoints.length; i++) {
        const p1 = activePoints[i];
        // Fade out in the distance
        const opacity1 = Math.max(0, Math.min(1, 1 - (p1.z - 200) / 2500));
        if (opacity1 <= 0.05) continue;

        for (let j = i + 1; j < activePoints.length; j++) {
          const p2 = activePoints[j];
          
          // Check 3D distance for connections
          const dx = p1.x - p2.x;
          const dz = p1.z - p2.z;
          const distSq = dx*dx + dz*dz;

          if (distSq < spacing * spacing * 2.5) {
            const opacity2 = Math.max(0, Math.min(1, 1 - (p2.z - 200) / 2500));
            const lineOpacity = Math.min(opacity1, opacity2) * 0.4;
            
            if (lineOpacity > 0) {
              ctx.strokeStyle = `rgba(0, 190, 255, ${lineOpacity})`;
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.stroke();
            }
          }
        }
      }

      // 6. Draw Nodes
      activePoints.forEach(p => {
        const opacity = Math.max(0, Math.min(1, 1 - (p.z - 200) / 2500));
        if (opacity <= 0.05) return;

        const size = Math.max(0.5, 3.0 * p.scale);

        ctx.beginPath();
        ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 230, 255, ${opacity})`;
        
        if (p.scale > 0.5) {
            ctx.shadowBlur = 12 * p.scale;
            ctx.shadowColor = '#00e5ff';
        } else {
            ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      time += 0.005;
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw(); // <--- FIX: Actually start the animation loop!

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
    />
  );
};

export default NetworkBackground;
