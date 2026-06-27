import React, { useEffect, useRef, useState, useCallback } from 'react';
import SimplePeer from 'simple-peer';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

function Btn({ onClick, title, danger, active, children }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 52, height: 52, borderRadius: '50%',
      border: 'none', cursor: 'pointer',
      background: danger ? '#C53030' : active ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.12)',
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background .15s, transform .12s',
      backdropFilter: 'blur(4px)',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >{children}</button>
  );
}

export default function VideoCallUI({ targetUserId, targetName, onClose }) {
  const { socket } = useSocket();
  const { user } = useAuth();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const [callStatus, setCallStatus] = useState('calling'); // calling | connected | ended
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sharingScreen, setSharingScreen] = useState(false);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const cleanup = useCallback(() => {
    clearInterval(timerRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (peerRef.current) peerRef.current.destroy();
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    let peer;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        peer = new SimplePeer({ initiator: true, trickle: false, stream });
        peerRef.current = peer;

        peer.on('signal', (signal) => {
          socket.emit('call_user', {
            to: targetUserId,
            from: user._id,
            signal,
            callerName: user.name,
          });
        });

        peer.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          setCallStatus('connected');
          timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
        });

        peer.on('error', () => { toast.error('Connection error'); onClose(); });
        peer.on('close', () => { setCallStatus('ended'); onClose(); });

        socket.on('call_accepted', ({ signal }) => { peer.signal(signal); });
        socket.on('call_rejected', ({ reason }) => {
          toast.error(reason || 'Call declined');
          cleanup(); onClose();
        });
        socket.on('call_ended', () => { cleanup(); onClose(); });
        socket.on('ice_candidate', ({ candidate }) => {
          try { peer.signal({ type: 'candidate', candidate }); } catch {}
        });
      } catch (err) {
        if (err.name === 'NotAllowedError') toast.error('Camera/mic permission denied');
        else toast.error('WebRTC not supported or camera unavailable');
        onClose();
      }
    };

    start();
    return () => {
      cleanup();
      socket.off('call_accepted');
      socket.off('call_rejected');
      socket.off('call_ended');
      socket.off('ice_candidate');
    };
  }, []);

  const toggleMute = () => {
    if (!streamRef.current) return;
    streamRef.current.getAudioTracks().forEach(t => { t.enabled = muted; });
    setMuted(!muted);
  };

  const toggleCamera = () => {
    if (!streamRef.current) return;
    streamRef.current.getVideoTracks().forEach(t => { t.enabled = cameraOff; });
    setCameraOff(!cameraOff);
  };

  const shareScreen = async () => {
    if (sharingScreen) {
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = camStream;
      if (localVideoRef.current) localVideoRef.current.srcObject = camStream;
      peerRef.current?.replaceTrack(
        peerRef.current.streams[0]?.getVideoTracks()[0],
        camStream.getVideoTracks()[0],
        peerRef.current.streams[0]
      );
      setSharingScreen(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
        peerRef.current?.replaceTrack(
          streamRef.current?.getVideoTracks()[0],
          screenStream.getVideoTracks()[0],
          peerRef.current.streams[0]
        );
        screenStream.getVideoTracks()[0].onended = () => setSharingScreen(false);
        setSharingScreen(true);
      } catch { toast.error('Screen share cancelled'); }
    }
  };

  const endCall = () => {
    socket?.emit('end_call', { to: targetUserId });
    cleanup();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0d1f16', zIndex: 2000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Remote video */}
      <video ref={remoteVideoRef} autoPlay playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: callStatus === 'connected' ? 1 : 0, transition: 'opacity .5s' }} />

      {/* Calling overlay */}
      {callStatus === 'calling' && (
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff' }}>
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(targetName || 'D')}&background=1C3D2E&color=F7F4EF&size=200`}
            alt="" style={{ width: 96, height: 96, borderRadius: '50%', margin: '0 auto 16px', border: '3px solid rgba(184,150,78,.6)', animation: 'pulse 2s infinite' }}
          />
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', marginBottom: '8px' }}>{targetName}</div>
          <div style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.7)', letterSpacing: '.05em' }}>Calling…</div>
          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '4px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', animation: `pulse 1.2s ${i * 0.3}s infinite` }} />
            ))}
          </div>
        </div>
      )}

      {/* Timer */}
      {callStatus === 'connected' && (
        <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: '.875rem', background: 'rgba(0,0,0,.4)', padding: '4px 14px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
          {formatTime(elapsed)}
        </div>
      )}

      {/* Name tag */}
      {callStatus === 'connected' && (
        <div style={{ position: 'absolute', bottom: 100, left: 24, color: '#fff', fontSize: '.875rem', background: 'rgba(0,0,0,.4)', padding: '4px 12px', borderRadius: '6px' }}>
          {targetName}
        </div>
      )}

      {/* Local video */}
      <video ref={localVideoRef} autoPlay playsInline muted
        style={{ position: 'absolute', bottom: 90, right: 20, width: 160, height: 110, objectFit: 'cover', borderRadius: '8px', border: '2px solid rgba(255,255,255,.3)', zIndex: 3, background: '#1a2e20' }} />

      {/* Controls bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px',
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px',
        background: 'linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 100%)',
        zIndex: 4,
      }}>
        <Btn onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'} active={muted}>
          {muted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M1 1l22 22M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6M17 16.95A7 7 0 015 12v-2M12 19v3M8 23h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" /><path d="M5 12a7 7 0 0014 0M12 19v3M8 23h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          )}
        </Btn>

        <Btn onClick={toggleCamera} title={cameraOff ? 'Turn on camera' : 'Turn off camera'} active={cameraOff}>
          {cameraOff ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M1 1l22 22M17 17H3a2 2 0 01-2-2V7a2 2 0 012-2h3M23 7l-6 4 6 4V7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M23 7l-6 4 6 4V7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" /></svg>
          )}
        </Btn>

        <Btn onClick={shareScreen} title={sharingScreen ? 'Stop sharing' : 'Share screen'} active={sharingScreen}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </Btn>

        <Btn onClick={endCall} title="End call" danger>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Btn>
      </div>
    </div>
  );
}
