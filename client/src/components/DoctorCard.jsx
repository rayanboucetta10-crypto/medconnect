import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { messagesAPI } from '../api/index.js';
import StarRating from './StarRating.jsx';
import AvailabilityBadge from './AvailabilityBadge.jsx';
import toast from 'react-hot-toast';

export default function DoctorCard({ doctor }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const doc = doctor.user || {};
  const name = doc.name || 'Unknown Doctor';
  const photo = doc.profilePhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1C3D2E&color=F7F4EF&size=200`;

  const handleMessage = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const { data } = await messagesAPI.findOrCreate(doctor.userId);
      navigate(`/chat/${data.conversation._id}`);
    } catch { toast.error('Could not open conversation'); }
  };

  const handleVideoCall = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    navigate(`/video/${doctor.userId}`);
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '20px', gap: '14px', transition: 'box-shadow .18s, transform .18s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(28,61,46,.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.transform = 'translateY(0)'; }}>

      {/* Header */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <img src={photo} alt={name} className="avatar avatar-lg"
          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=B8964E&color=F7F4EF&size=200`; }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/doctors/${doctor.userId}`}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '2px', color: 'var(--color-text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name}
            </h3>
          </Link>
          <div style={{ fontSize: '.875rem', color: 'var(--color-accent)', fontWeight: 500, marginBottom: '6px' }}>{doctor.specialty}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <AvailabilityBadge available={doctor.isAvailableNow} />
            <span style={{ fontSize: '.75rem', color: 'var(--color-text-muted)' }}>{doctor.city}</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '12px', background: 'var(--color-bg)', borderRadius: '6px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-strong)', fontFamily: 'var(--font-heading)' }}>{(doctor.rating || 0).toFixed(1)}</div>
          <StarRating rating={Math.round(doctor.rating || 0)} size={11} />
          <div style={{ fontSize: '.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>rating</div>
        </div>
        <div style={{ textAlign: 'center', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-strong)', fontFamily: 'var(--font-heading)' }}>{doctor.yearsOfExperience}y</div>
          <div style={{ fontSize: '.7rem', color: 'var(--color-text-muted)' }}>experience</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-strong)', fontFamily: 'var(--font-heading)' }}>{(doctor.totalConsultations || 0).toLocaleString()}</div>
          <div style={{ fontSize: '.7rem', color: 'var(--color-text-muted)' }}>consults</div>
        </div>
      </div>

      {/* Languages */}
      {doctor.languages?.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {doctor.languages.map(l => (
            <span key={l} style={{ fontSize: '.75rem', padding: '2px 8px', background: 'var(--color-surface-alt)', borderRadius: '4px', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>{l}</span>
          ))}
        </div>
      )}

      {/* Price */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8125rem', color: 'var(--color-text-muted)' }}>
        <span>Message <strong style={{ color: 'var(--color-text-strong)' }}>${doctor.consultationPriceMessage}</strong></span>
        <span>Video <strong style={{ color: 'var(--color-text-strong)' }}>${doctor.consultationPriceVideo}</strong></span>
      </div>

      {/* CTAs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button className="btn btn-secondary btn-sm" onClick={handleMessage} style={{ width: '100%' }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M14 1H2a1 1 0 00-1 1v9a1 1 0 001 1h4l2 3 2-3h4a1 1 0 001-1V2a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
          Message
        </button>
        <button className="btn btn-primary btn-sm" onClick={handleVideoCall} style={{ width: '100%' }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M1 4a1 1 0 011-1h8a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4zM11 6l4-2v8l-4-2V6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
          Video Call
        </button>
      </div>
    </div>
  );
}
