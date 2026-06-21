'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Users, Wallet, CreditCard, Gem, Scale,
  GitBranch, UserCheck, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, Shield, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from '@/app/login/actions';

const navItems = [
  { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/loans', label: 'Loans', icon: Wallet },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/gold-items', label: 'Gold Items', icon: Gem },
  { href: '/dashboard/valuation', label: 'Valuation', icon: Scale },
  { href: '/dashboard/branches', label: 'Branches', icon: GitBranch },
  { href: '/dashboard/employees', label: 'Employees', icon: UserCheck },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  userRole?: string;
  userName?: string;
  shopName?: string;
}

export default function Sidebar({ userRole, userName = 'User', shopName = 'SuvarnaLoan' }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const renderSidebarContent = () => (
    <>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <polygon
                points="18,2 34,10 34,26 18,34 2,26 2,10"
                stroke="#D4AF37"
                strokeWidth="1.5"
                fill="rgba(212,175,55,0.1)"
              />
              <circle cx="18" cy="18" r="4" fill="#D4AF37" />
            </svg>
          </div>
          {!collapsed && (
            <div className="sidebar-brand">
              <span className="sidebar-brand-text">
                Suvarna<span style={{ color: 'var(--gold-primary)' }}>Loan</span>
              </span>
              <span className="sidebar-brand-sub">ERP Platform</span>
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
          id="sidebar-collapse-btn"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Shop info */}
      {!collapsed && (
        <div className="sidebar-shop-info">
          <div className="shop-badge">
            <span className="shop-badge-label">
              Active Shop
            </span>
            <span className="shop-badge-name">
              {shopName}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
            className={cn('nav-item', isActive(href) && 'active')}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="nav-icon" aria-hidden="true" />
            {!collapsed && <span className="nav-label">{label}</span>}
            {!collapsed && isActive(href) && (
              <span className="nav-active-dot" aria-hidden="true" />
            )}
          </Link>
        ))}

        {/* Admin link (Super Admin only) */}
        {userRole === 'Super Admin' && (
          <>
            <div className="nav-divider" />
            <Link
              href="/admin"
              id="nav-admin"
              className={cn('nav-item', isActive('/admin') && 'active')}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? 'Admin Panel' : undefined}
            >
              <Shield size={18} className="nav-icon" />
              {!collapsed && <span className="nav-label">Admin Panel</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div
            className="avatar-placeholder avatar-sm"
            style={{ fontSize: '0.75rem' }}
            aria-hidden="true"
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{userName}</span>
              <span className="sidebar-user-role">{userRole ?? 'Staff'}</span>
            </div>
          )}
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className={cn('nav-item', 'logout-btn')}
            title="Sign out"
            id="logout-btn"
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile toggle button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        id="mobile-menu-btn"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop Sidebar */}
      <aside
        className={cn('dashboard-sidebar', collapsed && 'collapsed')}
        role="complementary"
        aria-label="Sidebar navigation"
      >
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn('dashboard-sidebar mobile-sidebar', mobileOpen && 'open')}
        role="complementary"
      >
        {renderSidebarContent()}
      </aside>
    </>
  );
}
