import React from 'react';
import Link from 'next/link';

export default function Navigation() {
  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="logo-icon"></div>
        <h2>Suvarna<span className="text-gold">Loan</span></h2>
      </div>
      
      <nav className="nav-links">
        <Link href="/" className="nav-item active">
          <span className="icon">⊞</span>
          Overview
        </Link>
        <Link href="/customers" className="nav-item">
          <span className="icon">👥</span>
          Customers
        </Link>
        <Link href="/loans" className="nav-item">
          <span className="icon">💎</span>
          Gold Loans
        </Link>
        <Link href="/reports" className="nav-item">
          <span className="icon">📈</span>
          Reports
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar"></div>
          <div className="user-info">
            <span className="name">Shop Owner</span>
            <span className="role text-gold">Premium Tier</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
