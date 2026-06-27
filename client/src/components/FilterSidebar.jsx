import React from 'react';

const SPECIALTIES = [
  'Cardiology','Neurology','Dermatology','Psychiatry','Pediatrics',
  'Orthopedics','Gynecology & Obstetrics','Oncology','Endocrinology',
  'Gastroenterology','Ophthalmology','General Practice','Internal Medicine',
  'Rheumatology','Pulmonology',
];
const LANGUAGES = ['English','French','Arabic','Spanish','Mandarin','Urdu','Yoruba','Darija'];

export default function FilterSidebar({ filters, onChange, onReset }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <aside style={{ width: '240px', flexShrink: 0 }}>
      <div className="card" style={{ padding: '20px', position: 'sticky', top: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Filters</h4>
          <button onClick={onReset} style={{ background: 'none', border: 'none', fontSize: '.8rem', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 500 }}>
            Clear all
          </button>
        </div>

        {/* Specialty */}
        <div className="form-group" style={{ marginBottom: '18px' }}>
          <label className="form-label">Specialty</label>
          <select className="input select" value={filters.specialty || ''} onChange={e => set('specialty', e.target.value)}>
            <option value="">All specialties</option>
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Language */}
        <div className="form-group" style={{ marginBottom: '18px' }}>
          <label className="form-label">Language</label>
          <select className="input select" value={filters.lang || ''} onChange={e => set('lang', e.target.value)}>
            <option value="">Any language</option>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Availability */}
        <div className="form-group" style={{ marginBottom: '18px' }}>
          <label className="form-label">Availability</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            {[['', 'Any time'], ['now', 'Available Now']].map(([val, label]) => (
              <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '.875rem' }}>
                <input type="radio" name="availability" value={val} checked={(filters.availability || '') === val}
                  onChange={() => set('availability', val)}
                  style={{ accentColor: 'var(--color-primary)' }} />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Min rating */}
        <div className="form-group" style={{ marginBottom: '18px' }}>
          <label className="form-label">Minimum Rating</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            {[['', 'Any'], ['4', '4+ ★'], ['4.5', '4.5+ ★'], ['4.8', '4.8+ ★']].map(([val, label]) => (
              <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '.875rem' }}>
                <input type="radio" name="minRating" value={val} checked={(filters.minRating || '') === val}
                  onChange={() => set('minRating', val)}
                  style={{ accentColor: 'var(--color-primary)' }} />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="form-group">
          <label className="form-label">Sort by</label>
          <select className="input select" value={filters.sort || 'rating'} onChange={e => set('sort', e.target.value)}>
            <option value="rating">Highest rated</option>
            <option value="experience">Most experienced</option>
            <option value="price">Lowest price</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
