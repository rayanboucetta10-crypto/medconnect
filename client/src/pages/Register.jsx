import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const SPECIALTIES = ['Cardiology','Neurology','Dermatology','Psychiatry','Pediatrics','Orthopedics','Gynecology & Obstetrics','Oncology','Endocrinology','Gastroenterology','Ophthalmology','General Practice','Internal Medicine','Rheumatology','Pulmonology'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '', dateOfBirth: '', specialty: '', bio: '', yearsOfExperience: '' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register({ ...form, role, yearsOfExperience: parseInt(form.yearsOfExperience) || 0 });
      toast.success('Account created! Welcome to MedConnect.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
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
          <h2 style={{ marginBottom: '8px' }}>Create your account</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Join MedConnect as a patient or doctor</p>
        </div>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {[['patient', 'I\'m a Patient', '🏥'], ['doctor', 'I\'m a Doctor', '👨‍⚕️']].map(([r, label, icon]) => (
            <button key={r} onClick={() => setRole(r)} style={{
              padding: '16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500,
              border: role === r ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
              background: role === r ? 'rgba(28,61,46,.06)' : 'var(--color-surface)',
              color: role === r ? 'var(--color-primary)' : 'var(--color-text)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              transition: 'all .15s',
            }}>
              <span style={{ fontSize: '1.4rem' }}>{icon}</span>
              <span style={{ fontSize: '.9rem' }}>{label}</span>
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ background: 'rgba(197,48,48,.08)', border: '1px solid rgba(197,48,48,.25)', borderRadius: '6px', padding: '10px 14px', fontSize: '.875rem', color: 'var(--color-error)' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Full name *</label>
                <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Your full name" />
              </div>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input className="input" value={form.city} onChange={e => set('city', e.target.value)} required placeholder="Your city" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email address *</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="you@example.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="input" type="password" value={form.password} onChange={e => set('password', e.target.value)} required placeholder="At least 8 characters" />
            </div>

            {role === 'patient' && (
              <div className="form-group">
                <label className="form-label">Date of birth</label>
                <input className="input" type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
              </div>
            )}

            {role === 'doctor' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Specialty *</label>
                    <select className="input select" value={form.specialty} onChange={e => set('specialty', e.target.value)} required>
                      <option value="">Select specialty</option>
                      {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Years of experience</label>
                    <input className="input" type="number" min="0" max="60" value={form.yearsOfExperience} onChange={e => set('yearsOfExperience', e.target.value)} placeholder="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Professional bio</label>
                  <textarea className="input" rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Brief description of your practice and expertise…" style={{ resize: 'vertical' }} />
                </div>
              </>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ height: '48px', fontSize: '1rem', marginTop: '6px' }}>
              {loading ? <span className="spinner" /> : `Create ${role === 'doctor' ? 'doctor' : 'patient'} account`}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '.9rem', color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
