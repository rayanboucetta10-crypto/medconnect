import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';

export function DateSeparator({ date }) {
  const d = new Date(date);
  let label = format(d, 'MMMM d, yyyy');
  if (isToday(d)) label = 'Today';
  else if (isYesterday(d)) label = 'Yesterday';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      <span style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
    </div>
  );
}

function StatusTick({ status }) {
  if (status === 'read') {
    return (
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" title="Read">
        <path d="M1 5l3 3 5-7" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 5l3 3 5-7" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === 'delivered') {
    return (
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" title="Delivered">
        <path d="M1 5l3 3 5-7" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 5l3 3 5-7" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" title="Sent">
      <path d="M1 5l3 3 5-5" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MessageBubble({ message, isMine }) {
  const time = format(new Date(message.createdAt), 'HH:mm');
  const hasFile = !!message.fileUrl;
  const isImage = message.fileType === 'image';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isMine ? 'flex-end' : 'flex-start',
      marginBottom: '4px',
      animation: 'fadeIn .2s ease',
    }}>
      {!isMine && (
        <img
          src={message.senderId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.senderId?.name || 'D')}&background=1C3D2E&color=F7F4EF&size=80`}
          alt="" style={{ width: 28, height: 28, borderRadius: '4px', objectFit: 'cover', marginRight: '8px', alignSelf: 'flex-end', flexShrink: 0 }}
        />
      )}

      <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
        <div style={{
          background: isMine ? 'var(--color-primary)' : 'var(--color-surface)',
          color: isMine ? '#fff' : 'var(--color-text-strong)',
          border: isMine ? 'none' : '1px solid var(--color-border)',
          borderRadius: isMine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
          padding: hasFile && isImage ? '6px' : '10px 14px',
          fontSize: '.9375rem',
          lineHeight: 1.5,
          wordBreak: 'break-word',
          boxShadow: isMine ? '0 1px 4px rgba(28,61,46,.2)' : 'var(--shadow-card)',
        }}>
          {hasFile && isImage && (
            <img src={message.fileUrl} alt={message.fileName || 'image'}
              style={{ maxWidth: '240px', borderRadius: '6px', display: 'block', cursor: 'pointer' }}
              onClick={() => window.open(message.fileUrl, '_blank')} />
          )}
          {hasFile && !isImage && (
            <a href={message.fileUrl} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isMine ? '#fff' : 'var(--color-primary)', textDecoration: 'underline' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 1h6l4 4v10H2V1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M10 1v4h4" stroke="currentColor" strokeWidth="1.5" /></svg>
              {message.fileName || 'File'}
            </a>
          )}
          {message.content && <span>{message.content}</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
          <span style={{ fontSize: '.7rem', color: 'var(--color-text-muted)' }}>{time}</span>
          {isMine && <StatusTick status={message.status} />}
        </div>
      </div>
    </div>
  );
}
