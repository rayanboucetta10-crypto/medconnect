import React from 'react';

export default function AvailabilityBadge({ available }) {
  return (
    <span className={`badge ${available ? 'badge-available' : 'badge-appointment'}`}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: available ? 'var(--color-available)' : 'var(--color-warning)',
        display: 'inline-block',
        animation: available ? 'pulse 2s infinite' : 'none',
      }} />
      {available ? 'Available Now' : 'By Appointment'}
    </span>
  );
}
