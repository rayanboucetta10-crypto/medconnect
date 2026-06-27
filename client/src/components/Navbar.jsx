import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAuthenticated, isDoctor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '64px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="var(--color-primary)" />
            <path d="M14 6v16M6 14h16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700, fontSize: '1.2rem',
            color: 'var(--color-primary)',
            letterSpacing: '-0.02em',
          }}>
            Med<span style={{ color: 'var(--color-accent)' }}>Connect</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <Link to="/doctors" style={{
            fontSize: '0.9375rem', fontWeight: 500,
            color: isActive('/doctors') ? 'var(--color-primary)' : 'var(--color-text)',
            borderBottom: isActive('/doctors') ? '2px solid var(--color-accent)' : '2px solid transparent',
            paddingBottom: '2px', transition: 'all 0.15s',
          }}>
            Find Doctors
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={{
                fontSize: '0.9375rem', fontWeight: 500,
                color: isActive('/dashboard') ? 'var(--color-primary)' : 'var(--color-text)',
                borderBottom: isActive('/dashboard') ? '2px solid var(--color-accent)' : '2px solid transparent',
                paddingBottom: '2px', transition: 'all 0.15s',
              }}>
                Dashboard
              </Link>
              <Link to="/chat" style={{
                fontSize: '0.9375rem', fontWeight: 500,
                color: isActive('/chat') ? 'var(--color-primary)' : 'var(--color-text)',
                borderBottom: isActive('/chat') ? '2px solid var(--color-accent)' : '2px solid transparent',
                paddingBottom: '2px', transition: 'all 0.15s',
              }}>
                Messages
              </Link>

              {/* User menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'none', border: '1.5px solid var(--color-border)',
                    borderRadius: '6px', padding: '6px 10px', cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <img
                    src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=1C3D2E&color=F7F4EF`}
                    alt={user?.name}
                    style={{ width: 28, height: 28, borderRadius: '4px', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-strong)' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>

                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px', boxShadow: 'var(--shadow-modal)',
                    minWidth: '180px', zIndex: 200,
                    overflow: 'hidden',
                  }}
                    onBlur={() => setMenuOpen(false)}
                  >
                    <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Signed in as</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-strong)', marginTop: '2px' }}>{user?.name}</div>
                    </div>
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{
                      display: 'block', padding: '10px 14px',
                      fontSize: '0.875rem', color: 'var(--color-text)',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--color-surface-alt)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      Dashboard
                    </Link>
                    {isDoctor && (
                      <Link to={`/doctors/${user?._id}/edit`} onClick={() => setMenuOpen(false)} style={{
                        display: 'block', padding: '10px 14px',
                        fontSize: '0.875rem', color: 'var(--color-text)',
                        transition: 'background 0.15s',
                      }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--color-surface-alt)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        Edit Profile
                      </Link>
                    )}
                    <button onClick={() => { setMenuOpen(false); handleLogout(); }} style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 14px', background: 'none', border: 'none',
                      fontSize: '0.875rem', color: 'var(--color-error)',
                      cursor: 'pointer', transition: 'background 0.15s',
                      borderTop: '1px solid var(--color-border)',
                    }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--color-surface-alt)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
