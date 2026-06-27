import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorsAPI, messagesAPI, consultationsAPI, reviewsAPI } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from '../components/StarRating.jsx';
import AvailabilityBadge from '../components/AvailabilityBadge.jsx';
import toast from 'react-hot-toast';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

function ReviewModal({ doctorId, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    setLoading(true);
    try {
      await reviewsAPI.create({ doctorId, rating, comment });
      toast.success('Review submitted!');
      onSubmit();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error submitting review');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '4px' }}>Leave a review</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '.875rem' }}>Your experience helps other patients.</p>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ marginBottom: '8px', fontWeight: 500, fontSize: '.875rem' }}>Your rating</div>
            <StarRating rating={rating} size={28} interactive onRate={setRating} />
          </div>
          <textarea className="input" rows={4} value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Describe your experience (optional)…"
            style={{ resize: 'vertical', lineHeight: 1.6 }} />
        </div>
        <div style={{ padding: '16px 24px', display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Submit review'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BookModal({ doctor, profile, onClose }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState('video');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!date) { toast.error('Please select a date'); return; }
    setLoading(true);
    try {
      await consultationsAPI.create({
        doctorId: doctor.userId || doctor._id,
        type,
        scheduledAt: new Date(date).toISOString(),
        notes,
      });
      toast.success('Consultation requested! The doctor will confirm shortly.');
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  const price = type === 'video' ? profile?.consultationPriceVideo : profile?.consultationPriceMessage;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
          <h3>Book a consultation</h3>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group">
            <label className="form-label">Consultation type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
              {[['video', 'Video Call'], ['message', 'Message']].map(([val, label]) => (
                <button key={val} onClick={() => setType(val)} style={{
                  padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '.9rem',
                  border: type === val ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  background: type === val ? 'rgba(28,61,46,.06)' : 'var(--color-surface)',
                  color: type === val ? 'var(--color-primary)' : 'var(--color-text)',
                  transition: 'all .15s',
                }}>{label}</button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred date & time</label>
            <input type="datetime-local" className="input" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Notes for the doctor <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span></label>
            <textarea className="input" rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Describe your symptoms or reason for consultation…" style={{ resize: 'vertical' }} />
          </div>

          <div style={{ background: 'var(--color-bg)', borderRadius: '6px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500 }}>Consultation fee</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary)' }}>${price}</span>
          </div>
        </div>
        <div style={{ padding: '16px 24px', display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleBook} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Confirm booking'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isPatient } = useAuth();
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const load = async () => {
    try {
      const { data: d } = await doctorsAPI.getById(id);
      setData(d);
      setReviews(d.reviews || []);
    } catch { navigate('/doctors'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleMessage = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const { data: c } = await messagesAPI.findOrCreate(id);
      navigate(`/chat/${c.conversation._id}`);
    } catch { toast.error('Could not open chat'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner spinner-lg" />
    </div>
  );
  if (!data) return null;

  const { doctor, reviews: revList } = data;
  const profile = doctor;
  const user = doctor.user || {};
  const name = user.name || 'Doctor';
  const photo = user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1C3D2E&color=F7F4EF&size=200`;

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '64px' }}>
      {/* Header band */}
      <div style={{ background: 'var(--color-primary)', padding: '48px 0 32px' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
            <img src={photo} alt={name} style={{ width: 110, height: 110, borderRadius: '8px', objectFit: 'cover', border: '3px solid rgba(255,255,255,.2)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '10px' }}>
                <AvailabilityBadge available={profile.isAvailableNow} />
              </div>
              <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '6px' }}>{name}</h1>
              <div style={{ color: 'var(--color-accent)', fontWeight: 500, fontSize: '1.05rem', marginBottom: '10px' }}>{profile.specialty}</div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <StarRating rating={Math.round(profile.rating || 0)} size={14} />
                  <span style={{ color: 'rgba(255,255,255,.8)', fontSize: '.875rem' }}>{(profile.rating || 0).toFixed(1)} ({revList?.length || reviews.length} reviews)</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,.6)', fontSize: '.875rem' }}>{profile.yearsOfExperience} years exp.</span>
                <span style={{ color: 'rgba(255,255,255,.6)', fontSize: '.875rem' }}>{profile.totalConsultations?.toLocaleString()} consultations</span>
                <span style={{ color: 'rgba(255,255,255,.6)', fontSize: '.875rem' }}>{user.city || profile.city}</span>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
              <button className="btn btn-accent" onClick={() => { if (!isAuthenticated) { navigate('/login'); return; } setShowBook(true); }}>
                Book Consultation
              </button>
              <button className="btn btn-secondary" onClick={handleMessage}
                style={{ background: 'rgba(255,255,255,.1)', borderColor: 'rgba(255,255,255,.3)', color: '#fff' }}>
                Send Message
              </button>
              <button className="btn btn-secondary" onClick={() => navigate(`/video/${id}`)}
                style={{ background: 'rgba(255,255,255,.1)', borderColor: 'rgba(255,255,255,.3)', color: '#fff' }}>
                Start Video Call
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'flex-start' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Bio */}
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ marginBottom: '14px' }}>About</h3>
              <p style={{ lineHeight: 1.8, color: 'var(--color-text)' }}>{profile.bio || 'No bio available.'}</p>

              {profile.languages?.length > 0 && (
                <div style={{ marginTop: '18px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '.875rem', fontWeight: 500, marginRight: '4px' }}>Languages:</span>
                  {profile.languages.map(l => (
                    <span key={l} className="badge badge-appointment">{l}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Education */}
            {profile.education?.length > 0 && (
              <div className="card" style={{ padding: '28px' }}>
                <h3 style={{ marginBottom: '16px' }}>Education</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {profile.education.map((e, i) => (
                    <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)', marginTop: '6px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-strong)' }}>{e.degree}</div>
                        <div style={{ fontSize: '.875rem', color: 'var(--color-text-muted)' }}>{e.institution} {e.year && `· ${e.year}`}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hospital affiliations */}
            {profile.hospitalAffiliations?.length > 0 && (
              <div className="card" style={{ padding: '28px' }}>
                <h3 style={{ marginBottom: '16px' }}>Hospital Affiliations</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {profile.hospitalAffiliations.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 22V12h6v10" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinejoin="round" /></svg>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '.9375rem' }}>{h.name}</div>
                        <div style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)' }}>{h.city}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Patient Reviews</h3>
                {isPatient && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowReview(true)}>Write a review</button>
                )}
              </div>

              {reviews.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '.9rem' }}>No reviews yet. Be the first to share your experience.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {reviews.map(r => (
                    <div key={r._id} style={{ paddingBottom: '18px', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <img
                          src={r.patientId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.patientId?.name || 'P')}&background=4A5568&color=fff&size=80`}
                          alt="" style={{ width: 36, height: 36, borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 600, fontSize: '.9375rem' }}>{r.patientId?.name || 'Patient'}</span>
                            <StarRating rating={r.rating} size={13} />
                          </div>
                          {r.comment && <p style={{ fontSize: '.9rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{r.comment}</p>}
                          <div style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                            {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '80px' }}>

            {/* Pricing */}
            <div className="card" style={{ padding: '24px' }}>
              <h4 style={{ marginBottom: '16px' }}>Consultation Fees</h4>
              {[
                { label: 'Message', price: profile.consultationPriceMessage, icon: '💬' },
                { label: 'Video Call', price: profile.consultationPriceVideo, icon: '📹' },
              ].map(({ label, price, icon }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)' }}>per session</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>${price}</div>
                </div>
              ))}
              <button className="btn btn-primary w-full" style={{ marginTop: '16px' }}
                onClick={() => { if (!isAuthenticated) { navigate('/login'); return; } setShowBook(true); }}>
                Book Consultation
              </button>
            </div>

            {/* Weekly schedule */}
            <div className="card" style={{ padding: '24px' }}>
              <h4 style={{ marginBottom: '16px' }}>Weekly Schedule</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {DAYS.map(day => {
                  const slot = profile.schedule?.[day];
                  return (
                    <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                      <span style={{ fontSize: '.875rem', textTransform: 'capitalize', fontWeight: 500, color: 'var(--color-text-strong)' }}>{day}</span>
                      {slot?.available ? (
                        <span style={{ fontSize: '.8125rem', color: 'var(--color-available)', fontWeight: 500 }}>
                          {slot.start} – {slot.end}
                        </span>
                      ) : (
                        <span style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)' }}>Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBook && <BookModal doctor={doctor} profile={profile} onClose={() => setShowBook(false)} />}
      {showReview && <ReviewModal doctorId={id} onClose={() => setShowReview(false)} onSubmit={load} />}
    </div>
  );
}
