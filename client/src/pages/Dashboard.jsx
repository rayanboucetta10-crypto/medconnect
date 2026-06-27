import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { consultationsAPI, messagesAPI, authAPI, doctorsAPI } from '../api/index.js';
import StarRating from '../components/StarRating.jsx';
import toast from 'react-hot-toast';
import { format, isPast, isFuture } from 'date-fns';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

function StatCard({ label, value, sub, icon }) {
  return (
    <div className="card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: '8px', background: 'rgba(28,61,46,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-strong)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontWeight: 600, fontSize: '.875rem', marginTop: '4px' }}>{label}</div>
        {sub && <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)' }}>{sub}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { pending: ['#B7791F', '#FEF3C7', 'Pending'], confirmed: ['#276749', '#D1FAE5', 'Confirmed'], completed: ['#4A5568', '#EDF2F7', 'Completed'], cancelled: ['#C53030', '#FED7D7', 'Cancelled'] };
  const [col, bg, label] = map[status] || map.pending;
  return <span style={{ background: bg, color: col, fontSize: '.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' }}>{label}</span>;
}

// ── Patient Dashboard ──────────────────────────────────────────
function PatientDashboard({ user }) {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    Promise.all([
      consultationsAPI.getMine(),
      messagesAPI.getConversations(),
    ]).then(([c, m]) => {
      setConsultations(c.data.consultations || []);
      setConversations(m.data.conversations || []);
    }).finally(() => setLoading(false));
  }, []);

  const upcoming = consultations.filter(c => ['pending','confirmed'].includes(c.status) && isFuture(new Date(c.scheduledAt)));
  const past = consultations.filter(c => c.status === 'completed' || isPast(new Date(c.scheduledAt)));
  const unread = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><div className="spinner spinner-lg" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>Welcome back, {user.name?.split(' ')[0]}</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Here's your health overview</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/doctors')}>
          Find a Doctor
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <StatCard label="Upcoming" value={upcoming.length} sub="consultations" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="var(--color-primary)" strokeWidth="1.8" /><path d="M16 2v4M8 2v4M3 10h18" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" /></svg>} />
        <StatCard label="Past consults" value={past.length} sub="completed" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinejoin="round" /></svg>} />
        <StatCard label="Messages" value={conversations.length} sub={unread > 0 ? `${unread} unread` : 'inbox'} icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinejoin="round" /></svg>} />
        <StatCard label="City" value={user.city || '—'} sub="your location" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="var(--color-primary)" strokeWidth="1.8" /><circle cx="12" cy="10" r="3" stroke="var(--color-primary)" strokeWidth="1.8" /></svg>} />
      </div>

      {/* Consultations */}
      <div className="card">
        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--color-border)' }}>
          {[['upcoming','Upcoming'], ['past','Past'], ['all','All']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '.9rem',
              color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: '-1px', transition: 'all .15s',
            }}>{l}</button>
          ))}
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(tab === 'upcoming' ? upcoming : tab === 'past' ? past : consultations).map(c => {
            const doc = c.doctorId;
            return (
              <div key={c._id} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '14px', background: 'var(--color-bg)', borderRadius: '6px' }}>
                <img src={doc?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc?.name || 'D')}&background=1C3D2E&color=F7F4EF&size=80`}
                  alt="" style={{ width: 44, height: 44, borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '.9375rem', color: 'var(--color-text-strong)' }}>{doc?.name || 'Doctor'}</div>
                  <div style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {c.type === 'video' ? 'Video call' : 'Message'} · {c.scheduledAt ? format(new Date(c.scheduledAt), 'MMM d, yyyy HH:mm') : 'Not scheduled'}
                  </div>
                  {c.notes && <div style={{ fontSize: '.8rem', color: 'var(--color-text)', marginTop: '4px', fontStyle: 'italic' }}>{c.notes.slice(0, 80)}{c.notes.length > 80 ? '…' : ''}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <StatusBadge status={c.status} />
                  {c.type === 'video' && ['confirmed','pending'].includes(c.status) && (
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/video/${doc?._id}`)}>Join</button>
                  )}
                </div>
              </div>
            );
          })}
          {tab === 'upcoming' && upcoming.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', fontSize: '.9rem' }}>
              No upcoming consultations. <Link to="/doctors" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Find a doctor →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent conversations */}
      {conversations.length > 0 && (
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem' }}>Recent Messages</h3>
            <Link to="/chat" style={{ color: 'var(--color-primary)', fontSize: '.875rem', fontWeight: 500 }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {conversations.slice(0, 4).map(c => {
              const other = c.participants?.find(p => p._id !== user._id);
              return (
                <div key={c._id} onClick={() => navigate(`/chat/${c._id}`)}
                  style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', padding: '10px', borderRadius: '6px', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <img src={other?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || '?')}&background=1C3D2E&color=F7F4EF&size=80`}
                    alt="" style={{ width: 38, height: 38, borderRadius: '5px', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{other?.name}</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {c.lastMessage?.content || 'Start chatting…'}
                    </div>
                  </div>
                  {c.unreadCount > 0 && <span style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: '10px', fontSize: '.7rem', fontWeight: 700, padding: '1px 7px' }}>{c.unreadCount}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Doctor Dashboard ───────────────────────────────────────────
function DoctorDashboard({ user, profile }) {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editSchedule, setEditSchedule] = useState(false);
  const [schedule, setSchedule] = useState({});
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [tab, setTab] = useState('requests');

  useEffect(() => {
    Promise.all([
      consultationsAPI.getMine(),
      messagesAPI.getConversations(),
    ]).then(([c, m]) => {
      setConsultations(c.data.consultations || []);
      setConversations(m.data.conversations || []);
      setSchedule(profile?.schedule || {});
    }).finally(() => setLoading(false));
  }, []);

  const pending = consultations.filter(c => c.status === 'pending');
  const today = consultations.filter(c => {
    if (!c.scheduledAt) return false;
    const d = new Date(c.scheduledAt);
    const now = new Date();
    return d.toDateString() === now.toDateString() && ['confirmed','pending'].includes(c.status);
  });
  const totalEarnings = consultations.filter(c => c.status === 'completed').reduce((s, c) => s + (c.price || 0), 0);

  const handleStatusUpdate = async (id, status) => {
    try {
      await consultationsAPI.update(id, { status });
      setConsultations(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      toast.success(`Consultation ${status}`);
    } catch { toast.error('Update failed'); }
  };

  const saveSchedule = async () => {
    setSavingSchedule(true);
    try {
      await doctorsAPI.update(user._id, { schedule });
      toast.success('Schedule updated');
      setEditSchedule(false);
    } catch { toast.error('Failed to save'); }
    finally { setSavingSchedule(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><div className="spinner spinner-lg" /></div>;

  const shown = tab === 'requests' ? pending : tab === 'today' ? today : consultations;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>Dr. {user.name?.split(' ').slice(1).join(' ') || user.name}</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>{profile?.specialty} · {profile?.city}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to={`/doctors/${user._id}`} className="btn btn-ghost btn-sm">View Profile</Link>
          <button className="btn btn-primary btn-sm" onClick={() => setEditSchedule(true)}>Edit Schedule</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <StatCard label="New requests" value={pending.length} sub="awaiting response" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>} />
        <StatCard label="Today" value={today.length} sub="appointments" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="var(--color-primary)" strokeWidth="1.8" /><path d="M16 2v4M8 2v4M3 10h18" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" /></svg>} />
        <StatCard label="Rating" value={(profile?.rating || 0).toFixed(1)} sub={`${profile?.totalConsultations || 0} total`} icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinejoin="round" /></svg>} />
        <StatCard label="Earnings" value={`$${totalEarnings.toLocaleString()}`} sub="completed consults" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><line x1="12" y1="1" x2="12" y2="23" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" /></svg>} />
      </div>

      {/* Consultations */}
      <div className="card">
        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--color-border)' }}>
          {[['requests',`Requests (${pending.length})`], ['today',`Today (${today.length})`], ['all','All']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '.9rem',
              color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: '-1px', transition: 'all .15s',
            }}>{l}</button>
          ))}
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {shown.map(c => {
            const pat = c.patientId;
            return (
              <div key={c._id} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '14px', background: 'var(--color-bg)', borderRadius: '6px' }}>
                <img src={pat?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(pat?.name || 'P')}&background=4A5568&color=fff&size=80`}
                  alt="" style={{ width: 44, height: 44, borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '.9375rem' }}>{pat?.name || 'Patient'}</div>
                  <div style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {c.type === 'video' ? 'Video call' : 'Message'} · {c.scheduledAt ? format(new Date(c.scheduledAt), 'MMM d HH:mm') : 'TBD'} · ${c.price}
                  </div>
                  {c.notes && <div style={{ fontSize: '.8rem', color: 'var(--color-text)', marginTop: '4px' }}>{c.notes.slice(0, 100)}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  <StatusBadge status={c.status} />
                  {c.status === 'pending' && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(c._id, 'confirmed')}>Confirm</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleStatusUpdate(c._id, 'cancelled')}>Decline</button>
                    </>
                  )}
                  {c.status === 'confirmed' && c.type === 'video' && (
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/video/${pat?._id}`)}>Start Call</button>
                  )}
                  {c.status === 'confirmed' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => handleStatusUpdate(c._id, 'completed')}>Complete</button>
                  )}
                </div>
              </div>
            );
          })}
          {shown.length === 0 && (
            <p style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', fontSize: '.9rem' }}>No consultations in this view.</p>
          )}
        </div>
      </div>

      {/* Schedule editor modal */}
      {editSchedule && (
        <div className="modal-overlay" onClick={() => setEditSchedule(false)}>
          <div className="modal" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
              <h3>Edit Weekly Schedule</h3>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
              {DAYS.map(day => {
                const slot = schedule[day] || { available: false, start: '09:00', end: '17:00' };
                return (
                  <div key={day} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr 80px', gap: '10px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textTransform: 'capitalize', fontWeight: 500, fontSize: '.9rem' }}>
                      <input type="checkbox" checked={slot.available || false}
                        onChange={e => setSchedule(s => ({ ...s, [day]: { ...slot, available: e.target.checked } }))}
                        style={{ accentColor: 'var(--color-primary)' }} />
                      {day}
                    </label>
                    <input type="time" className="input" value={slot.start || '09:00'} disabled={!slot.available}
                      onChange={e => setSchedule(s => ({ ...s, [day]: { ...slot, start: e.target.value } }))}
                      style={{ fontSize: '.85rem', opacity: slot.available ? 1 : .4 }} />
                    <input type="time" className="input" value={slot.end || '17:00'} disabled={!slot.available}
                      onChange={e => setSchedule(s => ({ ...s, [day]: { ...slot, end: e.target.value } }))}
                      style={{ fontSize: '.85rem', opacity: slot.available ? 1 : .4 }} />
                    <span style={{ fontSize: '.75rem', color: slot.available ? 'var(--color-available)' : 'var(--color-text-muted)', fontWeight: 500 }}>
                      {slot.available ? 'Open' : 'Closed'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)' }}>
              <button className="btn btn-ghost" onClick={() => setEditSchedule(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveSchedule} disabled={savingSchedule}>
                {savingSchedule ? <span className="spinner" /> : 'Save Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function Dashboard() {
  const { user, profile, loading, isDoctor } = useAuth();
  const navigate = useNavigate();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner spinner-lg" />
    </div>
  );

  if (!user) { navigate('/login'); return null; }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', padding: '36px 0 64px' }}>
      <div className="container">
        {isDoctor
          ? <DoctorDashboard user={user} profile={profile} />
          : <PatientDashboard user={user} />
        }
      </div>
    </div>
  );
}
