'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

const NAV_LINKS = ['Security', 'Workflow', 'Pricing', 'Testimonials'];

export function HomeNavbar() {
  return (
    <nav className="home-navbar" id="home-nav">
      <Link 
        href="/" 
        className="home-navbar-brand"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
        onClick={(e) => {
          if (typeof window !== 'undefined' && window.location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            window.history.pushState('', document.title, window.location.pathname);
          }
        }}
      >
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
          <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" stroke="#D4AF37" strokeWidth="1.5" fill="rgba(212,175,55,0.08)" />
          <circle cx="18" cy="18" r="4" fill="#D4AF37" />
        </svg>
        <span className="home-navbar-logo">
          Suvarna<span style={{ color: 'var(--gold-primary)' }}>Loan</span>
        </span>
      </Link>

      <div className="home-navbar-links desktop-nav">
        {NAV_LINKS.map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} className="home-nav-link">
            {item}
          </a>
        ))}
      </div>

      <div className="home-navbar-actions">
        <ThemeToggle />
        <Link href="/login" className="btn btn-outline btn-sm" id="nav-login-btn">Sign In</Link>
        <Link href="/signup" className="btn btn-gold btn-sm" id="nav-signup-btn">
          <span>Get Started</span>
        </Link>
      </div>
    </nav>
  );
}

export function HomeFooter() {
  return (
    <footer className="home-footer">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
          <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" stroke="#D4AF37" strokeWidth="1.5" fill="rgba(212,175,55,0.08)" />
          <circle cx="18" cy="18" r="4" fill="#D4AF37" />
        </svg>
        <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
          Suvarna<span style={{ color: 'var(--gold-primary)' }}>Loan</span> ERP
        </span>
      </div>
      <p className="home-footer-copy">
        © {new Date().getFullYear()} SuvarnaLoan ERP. All rights reserved. · Transforming Gold Into Trust.
      </p>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {['Privacy', 'Terms', 'Support'].map((item) => (
          <a key={item} href="#" className="home-footer-link">
            {item}
          </a>
        ))}
      </div>
    </footer>
  );
}
