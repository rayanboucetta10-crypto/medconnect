import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorsAPI } from '../api/index.js';
import HeartbeatDivider from '../components/HeartbeatDivider.jsx';
import DoctorCard from '../components/DoctorCard.jsx';

const CITIES = ['Casablanca', 'Paris', 'London', 'New York', 'Dubai'];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState({ doctors: 0, consultations: 0, cities: 0 });
  const inputRef = useRef(null);

  useEffect(() => {
    doctorsAPI.list({ page: 1, limit: 3, sort: 'rating' })
      .then(({ data }) => {
        setFeatured(data.doctors || []);
        setStats({ doctors: data.total || 15, consultations: 24800, cities: CITIES.length });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    const filtered = CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()));
    setSuggestions(filtered);
  }, [query]);

  const handleSearch = (city) => {
    navigate(`/doctors?city=${encodeURIComponent(city || query)}`);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSearch(query);
  };

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ background: 'var(--color-primary)', color: '#fff', padding: '80px 0 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center', paddingBottom: '72px' }}>

            {/* Left: text block */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(184,150,78,.18)', border: '1px solid rgba(184,150,78,.35)', borderRadius: '20px', padding: '4px 14px', marginBottom: '24px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '.8125rem', color: 'var(--color-accent)', fontWeight: 500 }}>Doctors online now</span>
              </div>

              <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 4vw, 2.8rem)', lineHeight: 1.1, marginBottom: '20px', fontWeight: 700 }}>
                Find a doctor<br />
                <span style={{ color: 'var(--color-accent)' }}>in your city.</span><br />
                Consult from<br />wherever you are.
              </h1>

              <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.75)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '420px' }}>
                Real doctors, real consultations — by message or video call.
                No waiting rooms. No referrals needed.
              </p>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '32px' }}>
                {[
                  { val: stats.doctors + '+', label: 'Specialists' },
                  { val: stats.consultations.toLocaleString() + '+', label: 'Consultations' },
                  { val: stats.cities, label: 'Cities' },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.55)', marginTop: '4px' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: city search panel */}
            <div className="card" style={{ padding: '32px', background: 'rgba(247,244,239,.04)', border: '1px solid rgba(255,255,255,.1)', backdropFilter: 'blur(8px)' }}>
              <h3 style={{ color: '#fff', marginBottom: '8px' }}>Search by city</h3>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.875rem', marginBottom: '20px' }}>Type a city to find available doctors</p>

              <div style={{ position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', zIndex: 1 }}>
                    <circle cx="11" cy="11" r="8" stroke="rgba(255,255,255,.5)" strokeWidth="1.8" />
                    <path d="M21 21l-4.35-4.35" stroke="rgba(255,255,255,.5)" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <input
                    ref={inputRef}
                    className="input"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKey}
                    onFocus={() => setShowSugg(true)}
                    onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                    placeholder="e.g. Casablanca, Paris, London…"
                    style={{ paddingLeft: '42px', background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.2)', color: '#fff', fontSize: '1.05rem', height: '52px' }}
                  />
                </div>

                {showSugg && suggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '6px', marginTop: '4px', zIndex: 50, overflow: 'hidden', boxShadow: 'var(--shadow-modal)' }}>
                    {suggestions.map(city => (
                      <button key={city}
                        onMouseDown={() => handleSearch(city)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--color-text-strong)', fontSize: '.9375rem', transition: 'background .12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="var(--color-accent)" strokeWidth="1.8" /><circle cx="12" cy="10" r="3" stroke="var(--color-accent)" strokeWidth="1.8" /></svg>
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn btn-accent" onClick={() => handleSearch(query)}
                style={{ width: '100%', marginTop: '14px', height: '48px', fontSize: '1rem', fontWeight: 600 }}>
                Find Doctors
              </button>

              {/* Quick city chips */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.45)', marginBottom: '10px', letterSpacing: '.04em', textTransform: 'uppercase' }}>Quick select</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {CITIES.map(city => (
                    <button key={city}
                      onClick={() => handleSearch(city)}
                      style={{ padding: '5px 12px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: '20px', color: 'rgba(255,255,255,.8)', fontSize: '.8125rem', cursor: 'pointer', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.16)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Heartbeat divider ─────────────────────────────────── */}
      <HeartbeatDivider />

      {/* ── Featured doctors ──────────────────────────────────── */}
      <section style={{ padding: '64px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h2 style={{ marginBottom: '8px' }}>Highest-rated doctors</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>Trusted by thousands of patients across 5 cities</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/doctors')}>
              View all →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {featured.map(d => <DoctorCard key={d._id} doctor={d} />)}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section style={{ background: 'var(--color-primary)', padding: '72px 0' }}>
        <div className="container">
          <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '48px' }}>How MedConnect works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              { n: '01', title: 'Search your city', body: 'Type your city and browse verified doctors by specialty, language, and availability — no account needed.' },
              { n: '02', title: 'Choose how to connect', body: 'Send a message or book a video consultation. Prices are clear and upfront.' },
              { n: '03', title: 'Consult from anywhere', body: 'Chat in real time or join a secure video call. Receive notes and follow-up care recommendations.' },
            ].map(({ n, title, body }) => (
              <div key={n} style={{ textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(184,150,78,.2)', border: '1.5px solid rgba(184,150,78,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--color-accent)', fontWeight: 700 }}>{n}</div>
                <h3 style={{ color: '#fff', marginBottom: '10px', fontSize: '1.15rem' }}>{title}</h3>
                <p style={{ color: 'rgba(255,255,255,.65)', lineHeight: 1.7, fontSize: '.9375rem' }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '32px 0', background: 'var(--color-surface)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>
            Med<span style={{ color: 'var(--color-accent)' }}>Connect</span>
          </div>
          <p style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)' }}>© 2026 MedConnect — Medical consultations reimagined</p>
        </div>
      </footer>
    </div>
  );
}
