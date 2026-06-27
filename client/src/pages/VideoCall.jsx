import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { doctorsAPI } from '../api/index.js';
import VideoCallUI from '../components/VideoCallUI.jsx';
import toast from 'react-hot-toast';

// Incoming call overlay — shown to call recipient
function IncomingCallScreen({ call, onAccept, onReject }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0d1f16', zIndex: 3000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px',
    }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(call.callerName || 'C')}&background=1C3D2E&color=F7F4EF&size=200`}
          alt="" style={{ width: 96, height: 96, borderRadius: '50%', margin: '0 auto 20px', border: '3px solid rgba(184,150,78,.5)' }} />
        <h2 style={{ color: '#fff', marginBottom: '8px' }}>{call.callerName || 'Someone'}</h2>
        <p style={{ color: 'rgba(255,255,255,.6)' }}>Incoming video call…</p>
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '10px' }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent)', animation: `pulse 1.2s ${i*.3}s infinite` }} />)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        <button onClick={onReject} style={{ width: 64, height: 64, borderRadius: '50%', background: '#C53030', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.92 1.22h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button onClick={onAccept} style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-success)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.92 1.22h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.8rem' }}>← Decline &nbsp;&nbsp;&nbsp; Accept →</p>
    </div>
  );
}

export default function VideoCall() {
  const { targetId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, incomingCall, dismissCall } = useSocket();
  const [targetName, setTargetName] = useState('');
  const [callActive, setCallActive] = useState(false);
  const [acceptedCall, setAcceptedCall] = useState(null);

  // Check WebRTC support
  const webRTCSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  useEffect(() => {
    if (!targetId) return;
    // Try to get doctor info
    doctorsAPI.getById(targetId)
      .then(({ data }) => setTargetName(data.doctor?.user?.name || 'Doctor'))
      .catch(() => setTargetName('Doctor'));
  }, [targetId]);

  useEffect(() => {
    if (targetId && webRTCSupported) {
      setCallActive(true);
    }
  }, [targetId]);

  const handleAcceptIncoming = () => {
    if (!socket || !incomingCall) return;
    // Signal back acceptance — VideoCallUI handles the peer answer
    setAcceptedCall(incomingCall);
    dismissCall();
  };

  const handleRejectIncoming = () => {
    if (!socket || !incomingCall) return;
    socket.emit('reject_call', { to: incomingCall.from });
    toast('Call declined');
    dismissCall();
    navigate(-1);
  };

  if (!webRTCSupported) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '16px', padding: '24px', textAlign: 'center' }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-text-muted)' }}>
          <path d="M1 1l22 22M17 17H3a2 2 0 01-2-2V7a2 2 0 012-2h3M23 7l-6 4 6 4V7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2>Video calls not supported</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px' }}>
          Your browser doesn't support WebRTC video calls. Please try Chrome, Firefox, or Edge, and ensure you're on a secure (HTTPS) connection.
        </p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  // Incoming call screen (for recipient)
  if (incomingCall && !callActive) {
    return <IncomingCallScreen call={incomingCall} onAccept={handleAcceptIncoming} onReject={handleRejectIncoming} />;
  }

  // Active call (initiator)
  if (callActive && targetId) {
    return (
      <VideoCallUI
        targetUserId={targetId}
        targetName={targetName}
        onClose={() => navigate(-1)}
      />
    );
  }

  // Accepted incoming call
  if (acceptedCall) {
    return (
      <VideoCallUI
        targetUserId={acceptedCall.from}
        targetName={acceptedCall.callerName}
        onClose={() => { setAcceptedCall(null); navigate(-1); }}
        isReceiver
        incomingSignal={acceptedCall.signal}
        callerSocketId={acceptedCall.callerSocketId}
      />
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="spinner spinner-lg" />
    </div>
  );
}
