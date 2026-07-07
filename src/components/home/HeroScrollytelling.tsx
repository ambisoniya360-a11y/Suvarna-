'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SCROLL_FRAMES = [
  { id: 1, title: 'Your Gold.', subtitle: 'Your Legacy.', desc: 'Centuries of tradition. Seconds to value.' },
  { id: 2, title: 'Precision Valuation.', subtitle: 'Real-time Gold Rates.', desc: 'Every gram. Every karat. Accounted.' },
  { id: 3, title: 'Instant Loan.', subtitle: 'Zero Paperwork.', desc: 'Sanctioned in minutes. Secured forever.' },
  { id: 4, title: 'Smart Tracking.', subtitle: 'Never Miss a Payment.', desc: 'EMI reminders. Interest calculators. Automated.' },
  { id: 5, title: 'Full ERP.', subtitle: 'One Platform.', desc: 'From valuation to closure — every step managed.' },
];

export default function HeroScrollytelling() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLDivElement[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const frameCount = 240;
  const frameObj = useRef({ frame: 1 });

  const interactiveCanvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!stickyRef.current) return;
    const rect = stickyRef.current.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    mouseRef.current.active = true;
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };


  const currentFrame = (index: number) =>
    `/video-frames/frame_${String(index).padStart(3, '0')}.jpg`;

  // Draw frame logic
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[index - 1];
    if (!img) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate aspect ratio for cover behavior
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.width;
    const imgHeight = img.height;

    const canvasRatio = canvasWidth / canvasHeight;
    const imgRatio = imgWidth / imgHeight;

    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      // Canvas is wider than image
      drawHeight = canvasWidth / imgRatio;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      // Canvas is taller than image
      drawWidth = canvasHeight * imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      
      const onImageLoadOrError = () => {
        loadedCount++;
        setLoadingProgress(Math.round((loadedCount / frameCount) * 100));
        if (loadedCount === frameCount) {
          setIsLoaded(true);
          // Small timeout to allow canvas to mount and draw first frame
          setTimeout(() => {
            drawFrame(1);
          }, 50);
        }
      };

      img.onload = onImageLoadOrError;
      img.onerror = onImageLoadOrError;
      images.push(img);
    }
    imagesRef.current = images;
  }, []);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      if (isLoaded) {
        drawFrame(Math.round(frameObj.current.frame));
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [isLoaded]);

  // GSAP animations
  useEffect(() => {
    if (!isLoaded) return;
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Single master timeline for the entire hero section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=400%',
          scrub: 0.5,
          pin: true,
          onUpdate: (self) => {
            // Draw video frames based on timeline progress
            const currentFrameIndex = Math.max(1, Math.min(frameCount, Math.round(1 + self.progress * (frameCount - 1))));
            frameObj.current.frame = currentFrameIndex;
            drawFrame(currentFrameIndex);
          },
        },
      });

      // Animate text frames sequentially in the master timeline
      framesRef.current.forEach((frame, i) => {
        // Initial setup for GSAP
        gsap.set(frame, { 
          opacity: i === 0 ? 1 : 0, 
          y: i === 0 ? 0 : 30,
          visibility: i === 0 ? 'visible' : 'hidden'
        });

        // Add to timeline
        if (i > 0) {
          // Fade in
          tl.to(frame, {
            opacity: 1,
            y: 0,
            visibility: 'visible',
            duration: 0.3,
            ease: 'power2.out',
          });
        }

        // Stay visible
        tl.to({}, { duration: 0.4 });

        // Fade out (if not last)
        if (i < SCROLL_FRAMES.length - 1) {
          tl.to(frame, {
            opacity: 0,
            y: -30,
            visibility: 'hidden',
            duration: 0.3,
            ease: 'power2.in',
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isLoaded]);

  // Handle hash navigation and scroll restoration on load/GSAP initialization
  useEffect(() => {
    if (!isLoaded) return;
    if (typeof window === 'undefined') return;

    // Refresh ScrollTrigger to calculate correct heights after layout shifts
    ScrollTrigger.refresh();

    // Check for initial hash navigation
    const hash = window.location.hash;
    if (hash) {
      const id = hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        // Use a short timeout to let the browser DOM render the pin spacer
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'auto', block: 'start' });
        }, 150);
        return () => clearTimeout(timer);
      }
    } else {
      // Force scroll to top on mount if there is no hash to prevent starting in the middle of scrollytelling
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  // Interactive constellation/particles ledger effect
  useEffect(() => {
    const canvas = interactiveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }

    const numParticles = 75;
    const particles: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.35 + 0.15,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render mouse glow
      if (mouseRef.current.active) {
        const glowGradient = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          250
        );
        glowGradient.addColorStop(0, 'rgba(212, 175, 55, 0.08)');
        glowGradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.02)');
        glowGradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, width, height);
      }

      particles.forEach((p) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Bounce
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
        ctx.fill();

        // Attraction to mouse
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            // Magnetic pull
            p.x += (dx / dist) * 0.18;
            p.y += (dy / dist) * 0.18;

            // Draw line to mouse
            const lineAlpha = (1 - dist / 180) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.strokeStyle = `rgba(245, 224, 124, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      // Draw lines between particles
      for (let i = 0; i < numParticles; i++) {
        for (let j = i + 1; j < numParticles; j++) {
          const pi = particles[i];
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.15 * Math.min(pi.alpha, pj.alpha);
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  return (
    <>
      {/* ─── LOADING OVERLAY ────────────────────────── */}
      {!isLoaded && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#050505',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          fontFamily: 'var(--font-sans)',
        }}>
          {/* Glowing Aura background */}
          <div style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'pulse-gold 3s ease-in-out infinite',
          }} />

          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            {/* Elegant Spinning Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gold-primary) 0%, var(--gold-accent) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px var(--gold-glow-strong)',
              animation: 'float 3s ease-in-out infinite',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3h12l4 6-10 13L2 9z"/>
                <path d="M11 3 8 9l3 13"/>
                <path d="M13 3l3 6-3 13"/>
                <path d="M2 9h20"/>
              </svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #F5E07C 0%, #D4AF37 50%, #C89B3C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                SuvarnaLoan ERP
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
                Initializing premium gold assets...
              </p>
            </div>

            {/* Progress Bar */}
            <div style={{
              width: '240px',
              height: '4px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '100px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.02)',
            }}>
              <div style={{
                height: '100%',
                width: `${loadingProgress}%`,
                background: 'linear-gradient(90deg, var(--gold-primary), var(--gold-light))',
                boxShadow: '0 0 10px var(--gold-glow-strong)',
                transition: 'width 0.1s ease-out',
              }} />
            </div>

            <span style={{
              fontSize: '0.875rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: 'var(--gold-primary)',
            }}>
              {loadingProgress}%
            </span>
          </div>
        </div>
      )}

      {/* ─── SCROLLYTELLING CONTAINER ────────────────── */}
      <section 
        ref={sectionRef} 
        className="hero-section" 
        id="hero"
        style={{
          height: '100vh',
          position: 'relative',
        }}
      >
        <div 
          ref={stickyRef} 
          className="hero-sticky"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          
          {/* Canvas for High-Performance Video Rendering */}
          <canvas
            ref={canvasRef}
            className="hero-canvas"
            style={{
              zIndex: 1,
              backgroundColor: '#050505',
            }}
          />

          {/* Premium cinematic dark gradient overlay for text legibility */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.8) 80%, #050505 100%)',
            zIndex: 2,
            pointerEvents: 'none',
          }} />

          {/* Gold particle grid for added depth - Deterministic to prevent hydration mismatch */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 3 }}>
            {Array.from({ length: 24 }, (_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${(i % 6) * 18 + ((i * 13) % 8)}%`,
                  top: `${Math.floor(i / 6) * 28 + 10}%`,
                  '--duration': `${3 + (i % 4)}s`,
                  '--delay': `${(i * 0.3) % 3}s`,
                  opacity: `${0.3 + (i % 3) * 0.2}`,
                } as React.CSSProperties}
              />
            ))}
          </div>

          {/* Interactive Digital Ledger Mesh Canvas */}
          <canvas
            ref={interactiveCanvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              zIndex: 4,
              pointerEvents: 'none',
            }}
          />


          {/* Scroll frames (Text Content Layers) */}
          {SCROLL_FRAMES.map((frame, i) => (
            <div
              key={frame.id}
              ref={(el) => { if (el) framesRef.current[i] = el; }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '2rem',
                opacity: i === 0 ? 1 : 0,
                transform: 'translateY(0)',
                zIndex: 10,
              }}
            >
              <div style={{ maxWidth: '800px' }}>
                {/* Frame number */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(212,175,55,0.08)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  borderRadius: '100px',
                  padding: '0.375rem 1rem',
                  marginBottom: '2rem',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold-primary)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase' }}>
                    Step {frame.id} of {SCROLL_FRAMES.length}
                  </span>
                </div>

                <h1 style={{
                  fontSize: 'clamp(3.5rem, 9.5vw, 8rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 0.95,
                  marginBottom: '1.25rem',
                  background: 'linear-gradient(135deg, #FFF5C2 0%, #E6C24A 30%, #C59A2C 60%, #856110 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'block',
                  paddingBottom: '0.05em',
                  filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.7))',
                }}>
                  {frame.title}
                </h1>

                <h2 style={{
                  fontSize: 'clamp(1.75rem, 3.8vw, 3.25rem)',
                  fontWeight: 300,
                  color: 'rgba(255, 255, 255, 0.9)',
                  letterSpacing: '-0.02em',
                  marginBottom: '1.75rem',
                  textShadow: '0 4px 18px rgba(0, 0, 0, 0.5), 0 8px 36px rgba(0, 0, 0, 0.3)',
                }}>
                  {frame.subtitle}
                </h2>

                <p style={{
                  fontSize: 'clamp(1.125rem, 2.3vw, 1.5rem)',
                  color: 'rgba(255, 255, 255, 0.75)',
                  maxWidth: '650px',
                  margin: '0 auto',
                  lineHeight: 1.6,
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)',
                }}>
                  {frame.desc}
                </p>

                {/* Final CTA on last frame */}
                {i === SCROLL_FRAMES.length - 1 && (
                  <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/login" className="btn btn-gold btn-xl" id="hero-cta-demo">
                      <span>Book Free Demo</span>
                    </Link>
                    <a href="#security" className="btn btn-outline btn-xl" id="hero-cta-features">
                      Explore Security
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Scroll indicator */}
          <div style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: 0.5,
            animation: 'float 2s ease-in-out infinite',
            zIndex: 20,
          }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--gold-primary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Scroll
            </span>
            <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--gold-primary), transparent)' }} />
          </div>
        </div>
      </section>
    </>
  );
}
