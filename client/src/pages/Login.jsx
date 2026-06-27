import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const fillDemo = (email) => setForm({ email, password: 'Password123!' });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="var(--color-primary)" />
              <path d="M14 6v16M6 14h16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--color-primary)' }}>
              Med<span style={{ color: 'var(--color-accent)' }}>Connect</span>
            </span>
          </Link>
          <h2 style={{ marginBottom: '8px' }}>Sign in</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '.9375rem' }}>Access your MedConnect account</p>
        </div>

        {/* Demo credentials */}
        <div style={{ background: 'rgba(28,61,46,.06)', border: '1px solid rgba(28,61,46,.15)', borderRadius: '6px', padding: '14px', marginBottom: '24px' }}>
          <div style={{ fontSize: '.8125rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '10px' }}>Demo accounts (password: Password123!)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              ['rayan@patient.com', 'Patient'],
              ['amina.bensalah@medconnect.app', 'Dr. Amina (Cardiologist)'],
              ['james.harrington@medconnect.app', 'Dr. James (Psychiatrist)'],
            ].map(([email, label]) => (
              <button key={email} onClick={() => fillDemo(email)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '.8125rem', color: 'var(--color-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                <span>{label}</span>
                <span style={{ color: 'var(--color-accent)', fontWeight: 500 }}>Use →</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {error && (
              <div style={{ background: 'rgba(197,48,48,.08)', border: '1px solid rgba(197,48,48,.25)', borderRadius: '6px', padding: '10px 14px', fontSize: '.875rem', color: 'var(--color-error)' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="you@example.com" autoComplete="email" />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="input" type="password" value={form.password} onChange={e => set('password', e.target.value)} required placeholder="••••••••" autoComplete="current-password" />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ height: '46px', fontSize: '1rem', marginTop: '4px' }}>
              {loading ? <span className="spinner" /> : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '.9rem', color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
