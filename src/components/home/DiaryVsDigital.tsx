'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  X, Check, Shield, Database, Lock, Clock, Cloud, Zap, 
  Play, BookOpen, AlertTriangle, Users, Star, ArrowRight, Sparkles 
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function DiaryVsDigital() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);
  const vsBadgeRef = useRef<HTMLDivElement>(null);
  
  // Stats counter refs
  const stat1Ref = useRef<HTMLDivElement>(null);
  const stat2Ref = useRef<HTMLDivElement>(null);
  const stat3Ref = useRef<HTMLDivElement>(null);
  const stat4Ref = useRef<HTMLDivElement>(null);

  // States to hold animated values for counters
  const [stat1Val, setStat1Val] = useState(0);
  const [stat2Val, setStat2Val] = useState(0);
  const [stat4Val, setStat4Val] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // 1. Headline reveal and strikethrough trigger
      gsap.fromTo('.diary-strike-line', 
        { width: '0%' },
        {
          width: '100%',
          duration: 0.8,
          delay: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
          }
        }
      );

      // 2. Left card (Red Card) entrance & scroll-triggered slight shake
      gsap.fromTo(leftCardRef.current,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: leftCardRef.current,
            start: 'top 80%',
          }
        }
      );

      // Shake animation trigger when scrolling
      gsap.to(leftCardRef.current, {
        x: '+=4',
        yoyo: true,
        repeat: 5,
        duration: 0.1,
        ease: 'power1.inOut',
        scrollTrigger: {
          trigger: leftCardRef.current,
          start: 'top 60%',
          toggleActions: 'play none none none'
        }
      });

      // 3. Right card (Green Card) entrance & pulse glow
      gsap.fromTo(rightCardRef.current,
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: rightCardRef.current,
            start: 'top 80%',
          }
        }
      );

      // 4. Rotating VS Badge animation on scroll
      gsap.fromTo(vsBadgeRef.current,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 360,
          duration: 1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: vsBadgeRef.current,
            start: 'top 80%',
          }
        }
      );

      // 5. Staggered feature bullets appearance
      gsap.fromTo('.diary-bullet',
        { opacity: 0, x: -10 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.05,
          duration: 0.4,
          scrollTrigger: {
            trigger: leftCardRef.current,
            start: 'top 70%',
          }
        }
      );

      gsap.fromTo('.erp-bullet',
        { opacity: 0, x: 10 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.05,
          duration: 0.4,
          scrollTrigger: {
            trigger: rightCardRef.current,
            start: 'top 70%',
          }
        }
      );

      // 6. Stats Counter Animations
      const statsTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.stats-row-container',
          start: 'top 85%',
        }
      });

      // Stat 1: 80% Time Saved
      const counter1 = { val: 0 };
      statsTl.to(counter1, {
        val: 80,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => setStat1Val(Math.round(counter1.val))
      }, 0);

      // Stat 2: 99.9% Data Security
      const counter2 = { val: 0 };
      statsTl.to(counter2, {
        val: 99.9,
        duration: 1.8,
        ease: 'power3.out',
        onUpdate: () => setStat2Val(Number(counter2.val.toFixed(1)))
      }, 0);

      // Stat 4: 5X Faster
      const counter4 = { val: 0 };
      statsTl.to(counter4, {
        val: 5,
        duration: 1.2,
        ease: 'back.out(1.5)',
        onUpdate: () => setStat4Val(Math.round(counter4.val))
      }, 0);

      // Fade up stats cards
      statsTl.fromTo('.stat-box-card',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' },
        0
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      style={{
        background: 'radial-gradient(circle at top center, rgba(16,185,129,0.05) 0%, rgba(212,175,55,0.02) 40%, #050505 100%)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '7rem 2rem',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Floating Top Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(16, 185, 129, 0.06)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '100px',
          padding: '0.375rem 1.25rem',
          marginBottom: '2rem',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)',
          animation: 'pulse-gold 3s ease-in-out infinite'
        }}>
          <Zap size={14} style={{ color: '#10B981' }} />
          <span style={{ fontSize: '0.75rem', color: '#10B981', letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase' }}>
            Upgrade Your Gold Loan Business
          </span>
        </div>

        {/* Heading */}
        <h2 
          ref={titleRef}
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.75rem)',
            fontWeight: 900,
            textAlign: 'center',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            color: '#F8F8F8',
            maxWidth: '1000px'
          }}
        >
          Why Manage Gold Loans in a{' '}
          <span style={{ position: 'relative', display: 'inline-block', color: 'rgba(255, 77, 79, 0.9)' }}>
            Diary
            <span 
              className="diary-strike-line" 
              style={{
                position: 'absolute',
                left: '-5%',
                right: '-5%',
                top: '55%',
                height: '4px',
                background: '#FF4D4F',
                borderRadius: '2px',
                display: 'block'
              }}
            />
          </span>{' '}
          When You Can Run Everything{' '}
          <span style={{
            background: 'linear-gradient(135deg, #10B981 30%, #34D399 70%, #A7F3D0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Digitally?
          </span>
        </h2>

        {/* Subheading */}
        <p style={{
          fontSize: 'clamp(1rem, 1.8vw, 1.125rem)',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          maxWidth: '750px',
          lineHeight: 1.6,
          marginBottom: '4.5rem'
        }}>
          SuvarnaLoan ERP helps jewellery and gold loan businesses automate customer records, interest calculations, receipts, reports, and loan tracking.
        </p>

        {/* Comparison Grid Area */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          alignItems: 'center',
          gap: '2rem',
          width: '100%',
          position: 'relative',
          marginBottom: '5rem'
        }} className="desktop-grid-columns">

          {/* LEFT CARD: Traditional Diary Method */}
          <div 
            ref={leftCardRef}
            style={{
              background: 'rgba(255, 77, 79, 0.02)',
              border: '1px solid rgba(255, 77, 79, 0.12)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              boxShadow: 'inset 0 1px 1px rgba(255,77,79,0.02), 0 10px 30px rgba(0,0,0,0.2)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '620px',
              transition: 'all 0.3s ease'
            }}
            className="hover-card-diary"
          >
            <div>
              {/* Header */}
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: 52, height: 52,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 77, 79, 0.08)',
                  border: '1px solid rgba(255, 77, 79, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <BookOpen size={24} style={{ color: '#FF4D4F' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FF4D4F', margin: 0 }}>Traditional Diary Method</h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Manual Work • High Risk • Time Consuming</span>
                </div>
              </div>

              {/* Bullet Features list */}
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '2rem', padding: 0 }}>
                {[
                  'Customer details written manually',
                  'Gold information in physical diary',
                  'Interest calculated by hand',
                  'Difficult to find old records',
                  'Risk of losing customer data',
                  'No business analytics',
                  'No automated reminders',
                  'No cloud backup',
                  'Human calculation errors',
                  'Slow daily operations'
                ].map((feature, index) => (
                  <li 
                    key={index}
                    className="diary-bullet"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255, 77, 79, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <X size={12} style={{ color: '#FF4D4F' }} />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Diary Graphic Asset inside card */}
            <div style={{
              position: 'absolute',
              right: '1.5rem',
              bottom: '5.5rem',
              width: '130px',
              height: '110px',
              opacity: 0.12,
              pointerEvents: 'none'
            }}>
              {/* Isometric Diary Vector */}
              <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                <path d="M10 20 L50 10 L90 20 L90 70 L50 60 L10 70 Z" fill="#FF4D4F" stroke="#ffffff" strokeWidth="1"/>
                <line x1="50" y1="10" x2="50" y2="60" stroke="#ffffff" strokeWidth="1.5"/>
                <path d="M15 25 L45 18 M15 35 L45 28 M15 45 L45 38 M15 55 L45 48" stroke="#ffffff" strokeWidth="1"/>
                <path d="M85 25 L55 18 M85 35 L55 28 M85 45 L55 38 M85 55 L55 48" stroke="#ffffff" strokeWidth="1"/>
              </svg>
            </div>

            {/* Bottom Button */}
            <div style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(255, 77, 79, 0.12) 0%, rgba(255, 77, 79, 0.05) 100%)',
              border: '1px solid rgba(255, 77, 79, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.875rem',
              textAlign: 'center',
              color: '#FF4D4F',
              fontSize: '0.9rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <AlertTriangle size={16} />
              <span>Outdated & Risky</span>
            </div>
          </div>

          {/* CENTER DIVISION: VS Badge */}
          <div 
            ref={vsBadgeRef}
            className="vs-divider-container"
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF4D4F 0%, #F59E0B 50%, #10B981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.35)',
              zIndex: 10,
              justifySelf: 'center',
              border: '4px solid #050505',
              position: 'relative'
            }}
          >
            {/* Rotating glow ring */}
            <div style={{
              position: 'absolute',
              inset: -4,
              border: '1px dashed rgba(255,255,255,0.4)',
              borderRadius: '50%',
              animation: 'spin 12s linear infinite'
            }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 950, color: '#ffffff', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>VS</span>
          </div>

          {/* RIGHT CARD: SuvarnaLoan ERP */}
          <div 
            ref={rightCardRef}
            style={{
              background: 'rgba(16, 185, 129, 0.03)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              boxShadow: 'inset 0 1px 1px rgba(16,185,129,0.02), 0 15px 45px rgba(16,185,129,0.05)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '620px',
              transition: 'all 0.3s ease'
            }}
            className="hover-card-erp"
          >
            {/* Preferred Badge */}
            <div style={{
              position: 'absolute',
              top: '-14px',
              right: '2.5rem',
              background: 'linear-gradient(90deg, #10B981, #059669)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '100px',
              padding: '0.25rem 1rem',
              fontSize: '0.6875rem',
              fontWeight: 800,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
            }}>
              <Star size={10} fill="#fff" />
              <span>Most Preferred by Modern Jewellers</span>
            </div>

            <div>
              {/* Header */}
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: 52, height: 52,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Database size={24} style={{ color: '#10B981' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10B981', margin: 0 }}>SuvarnaLoan ERP</h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Fast • Secure • Automated</span>
                </div>
              </div>

              {/* Bullet Features list */}
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '2rem', padding: 0 }}>
                {[
                  'Customer + Gold Photo Storage',
                  'Instant Customer Search',
                  'Automatic Interest Calculation',
                  'Loan Due Tracking',
                  'Auto Receipt Generation',
                  'WhatsApp & SMS Reminders',
                  'Daily Business Reports',
                  'Secure Cloud Backup',
                  'Multi-Device Access',
                  'Real-Time Dashboard'
                ].map((feature, index) => (
                  <li 
                    key={index}
                    className="erp-bullet"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={12} style={{ color: '#10B981' }} />
                    </div>
                    <span style={{ color: '#F8F8F8', fontWeight: 500 }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dashboard Mockup Graphics inside Card */}
            <div style={{
              position: 'absolute',
              right: '1.5rem',
              bottom: '5.5rem',
              width: '180px',
              height: '110px',
              opacity: 0.18,
              pointerEvents: 'none'
            }} className="tablet-hide">
              {/* CSS dashboard mockup */}
              <div style={{
                width: '100%',
                height: '100%',
                background: '#0a0a0a',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
              }}>
                <div style={{ display: 'flex', gap: '3px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '3px' }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#FF4D4F' }} />
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#10B981' }} />
                </div>
                <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                  <div style={{ width: '25%', background: 'rgba(255,255,255,0.02)', borderRadius: '3px' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }} />
                    <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
                      <div style={{ flex: 1, background: 'rgba(16,185,129,0.08)', borderRadius: '2px' }} />
                      <div style={{ flex: 1, background: 'rgba(212,175,55,0.05)', borderRadius: '2px' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.875rem',
              textAlign: 'center',
              color: '#10B981',
              fontSize: '0.9rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.08)'
            }}>
              <Shield size={16} />
              <span>Smart & Secure</span>
            </div>
          </div>
        </div>

        {/* RESULTS SECTION BELOW (4 Stats Cards) */}
        {/* RESULTS SECTION BELOW (4 Stats Cards) */}
        <div 
          className="stats-row-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            width: '100%',
            marginBottom: '3rem'
          }}
        >
          {/* Card 1: 80% Time Saved */}
          <div 
            className="stat-box-card"
            style={{
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Clock size={20} style={{ color: '#10B981' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.875rem', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                {stat1Val}%
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginTop: '0.125rem' }}>Time Saved</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Every Single Day</span>
            </div>
          </div>

          {/* Card 2: 99.9% Data Security */}
          <div 
            className="stat-box-card"
            style={{
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.06)',
              border: '1px solid rgba(59, 130, 246, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Lock size={20} style={{ color: '#3B82F6' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.875rem', fontWeight: 900, color: '#3B82F6', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                {stat2Val}%
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginTop: '0.125rem' }}>Data Security</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Secure Cloud Backup</span>
            </div>
          </div>

          {/* Card 3: 24/7 Cloud Access */}
          <div 
            className="stat-box-card"
            style={{
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(167, 139, 250, 0.06)',
              border: '1px solid rgba(167, 139, 250, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Cloud size={20} style={{ color: '#A78BFA' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.875rem', fontWeight: 900, color: '#A78BFA', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                24/7
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginTop: '0.125rem' }}>Cloud Access</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Anytime, Anywhere</span>
            </div>
          </div>

          {/* Card 4: 5X Faster Operations */}
          <div 
            className="stat-box-card"
            style={{
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.06)',
              border: '1px solid rgba(245, 158, 11, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Zap size={20} style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.875rem', fontWeight: 900, color: '#F59E0B', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                {stat4Val}X
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginTop: '0.125rem' }}>Faster Operations</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Boost Business Growth</span>
            </div>
          </div>
        </div>

        {/* TRUST BANNER SECTION */}
        <div style={{
          textAlign: 'center',
          width: '100%',
          borderTop: '1px dashed rgba(255,255,255,0.06)',
          paddingTop: '2rem',
          marginBottom: '2.5rem'
        }}>
          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--text-tertiary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: '2rem'
          }}>
            • Trusted by Jewellery & Gold Loan Businesses Across Maharashtra •
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}>
            {[
              { label: '1000+ Businesses', icon: Users },
              { label: 'Highly Secure', icon: Lock },
              { label: 'RBI Compliant', icon: Shield },
              { label: 'Cloud Based', icon: Cloud },
              { label: 'Made for Jewellers', icon: Sparkles }
            ].map((badge, idx) => {
              const IconComp = badge.icon;
              return (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.015)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '100px',
                    padding: '0.5rem 1.25rem',
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500
                  }}
                >
                  <IconComp size={14} style={{ color: 'var(--gold-primary)' }} />
                  <span>{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* FINAL REDIRECT / SIGNUP CTA BANNER */}
        <div style={{
          width: '100%',
          background: 'linear-gradient(135deg, #002e1c 0%, #00120b 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-xl)',
          padding: '4rem 3rem',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(16, 185, 129, 0.05)',
          flexWrap: 'wrap',
          gap: '2.5rem'
        }} className="cta-banner-container">

          {/* Left Decorative Gold Rings Vector */}
          <div className="decor-jewelry" style={{
            position: 'absolute',
            left: '-2rem',
            bottom: '-2rem',
            width: '180px',
            height: '180px',
            opacity: 0.15,
            pointerEvents: 'none'
          }}>
            {/* Overlapping Rings SVG */}
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
              <circle cx="45" cy="55" r="30" stroke="var(--gold-primary)" strokeWidth="6"/>
              <circle cx="65" cy="45" r="30" stroke="var(--gold-accent)" strokeWidth="6"/>
            </svg>
          </div>

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '650px' }}>
            <h3 style={{
              fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: '#ffffff',
              marginBottom: '0.75rem'
            }}>
              Ready to Digitize Your Gold Loan Business?
            </h3>
            <p style={{
              fontSize: '1rem',
              color: '#A7F3D0',
              lineHeight: 1.5,
              margin: 0
            }}>
              Join modern jewellers who are saving hours every day with SuvarnaLoan ERP.
            </p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '1.25rem' }}>
              ✓ No Credit Card Required &bull; Cancel Anytime
            </p>
          </div>

          <div className="cta-right-buttons" style={{
            display: 'flex',
            gap: '1rem',
            zIndex: 2,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <a 
              href="/signup" 
              className="btn btn-gold btn-xl"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
                color: '#000000',
                border: 'none',
                fontWeight: 800,
                boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
                height: '52px',
                padding: '0 2rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>Book Free Demo</span>
              <ArrowRight size={16} />
            </a>

            <a 
              href="#workflow" 
              className="btn btn-outline btn-xl"
              style={{
                borderColor: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                height: '52px',
                padding: '0 2rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Play size={16} fill="#fff" />
              <span>Watch Live Demo</span>
            </a>
          </div>

          {/* Right Decorative Gold Necklace Vector */}
          <div className="decor-jewelry" style={{
            position: 'absolute',
            right: '-1.5rem',
            top: '-1.5rem',
            width: '160px',
            height: '160px',
            opacity: 0.15,
            pointerEvents: 'none'
          }}>
            {/* Abstract Necklace SVG */}
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
              <path d="M20,20 Q50,70 80,20" stroke="var(--gold-primary)" strokeWidth="4" fill="none"/>
              <path d="M30,20 Q50,60 70,20" stroke="var(--gold-accent)" strokeWidth="2" fill="none"/>
              <circle cx="50" cy="52" r="6" fill="var(--gold-primary)"/>
              <circle cx="39" cy="44" r="4" fill="var(--gold-accent)"/>
              <circle cx="61" cy="44" r="4" fill="var(--gold-accent)"/>
            </svg>
          </div>

        </div>

      </div>
    </section>
  );
}
