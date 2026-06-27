import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function IncomingCallBanner() {
  const { socket, incomingCall, dismissCall } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!incomingCall) return null;

  const accept = () => {
    dismissCall();
    navigate(`/video/incoming`);
  };

  const reject = () => {
    socket?.emit('reject_call', { to: incomingCall.from });
    toast('Call declined');
    dismissCall();
  };

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 900,
      background: 'var(--color-primary)', color: '#fff',
      borderRadius: '10px', padding: '16px 20px',
      boxShadow: 'var(--shadow-modal)',
      display: 'flex', gap: '16px', alignItems: 'center',
      animation: 'slideIn .3s ease',
      minWidth: '280px',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '.9375rem', marginBottom: '3px' }}>
          {incomingCall.callerName || 'Someone'}
        </div>
        <div style={{ fontSize: '.8125rem', color: 'rgba(255,255,255,.7)' }}>Incoming video call…</div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={reject} style={{ width: 40, height: 40, borderRadius: '50%', background: '#C53030', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015 12 19.79 19.79 0 011.93 3.36 2 2 0 013.92 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button onClick={accept} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-success)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015 12 19.79 19.79 0 011.93 3.36 2 2 0 013.92 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}
