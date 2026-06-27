import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doctorsAPI } from '../api/index.js';
import DoctorCard from '../components/DoctorCard.jsx';
import FilterSidebar from '../components/FilterSidebar.jsx';

export default function DoctorList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [cityInput, setCityInput] = useState(searchParams.get('city') || '');

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    specialty: searchParams.get('specialty') || '',
    lang: '',
    availability: '',
    minRating: '',
    sort: 'rating',
  });

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await doctorsAPI.list(params);
      setDoctors(data.doctors || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const applyCity = () => {
    setFilters(f => ({ ...f, city: cityInput }));
    setPage(1);
  };

  const handleFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ city: '', specialty: '', lang: '', availability: '', minRating: '', sort: 'rating' });
    setCityInput('');
    setPage(1);
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Top search bar */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '20px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '480px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="var(--color-text-muted)" strokeWidth="1.8" />
                <circle cx="12" cy="10" r="3" stroke="var(--color-text-muted)" strokeWidth="1.8" />
              </svg>
              <input className="input" value={cityInput} onChange={e => setCityInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyCity()}
                placeholder="City name…" style={{ paddingLeft: '38px' }} />
            </div>
            <button className="btn btn-primary" onClick={applyCity}>Search</button>
            <span style={{ fontSize: '.875rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
              {loading ? 'Loading…' : `${total} doctor${total !== 1 ? 's' : ''} found`}
            </span>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '28px', paddingBottom: '48px' }}>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
          <FilterSidebar filters={filters} onChange={handleFilters} onReset={resetFilters} />

          {/* Main content */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
                <div className="spinner spinner-lg" />
                <p style={{ color: 'var(--color-text-muted)' }}>Finding doctors…</p>
              </div>
            ) : doctors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 20px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 16px', opacity: .3 }}>
                  <circle cx="12" cy="12" r="10" stroke="var(--color-text)" strokeWidth="1.5" />
                  <path d="M8 15s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01" stroke="var(--color-text)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <h3 style={{ marginBottom: '8px' }}>No doctors found</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>Try adjusting your filters or searching a different city.</p>
                <button className="btn btn-secondary" onClick={resetFilters}>Clear filters</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {doctors.map(d => <DoctorCard key={d._id} doctor={d} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '36px' }}>
                    <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)} style={{
                          width: 36, height: 36, borderRadius: '6px',
                          background: p === page ? 'var(--color-primary)' : 'var(--color-surface)',
                          color: p === page ? '#fff' : 'var(--color-text)',
                          cursor: 'pointer', fontWeight: p === page ? 600 : 400,
                          border: p === page ? 'none' : '1px solid var(--color-border)',
                          transition: 'all .15s',
                        }}>{p}</button>
                      ))}
                    </div>
                    <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
