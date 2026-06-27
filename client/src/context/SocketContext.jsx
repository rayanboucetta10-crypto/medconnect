import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    // Connect socket (with or without auth — browsing users too)
    const sock = io('http://localhost:5000', {
      withCredentials: true,
      auth: { token: token || '' },
      transports: ['websocket', 'polling'],
    });

    sock.on('connect', () => {
      socketRef.current = sock;
      setSocket(sock);
    });

    sock.on('user_online', ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    sock.on('user_offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    sock.on('incoming_call', (data) => {
      setIncomingCall(data);
    });

    sock.on('notification', ({ type, message, conversationId }) => {
      if (type === 'new_message' && message) {
        const senderName = message.senderId?.name || 'Someone';
        toast(
          (t) => (
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem' }}>
              <strong>{senderName}</strong>: {message.content?.slice(0, 60) || '📎 File'}
            </span>
          ),
          {
            icon: '💬',
            duration: 4000,
            style: { borderRadius: '6px' },
          }
        );
      }
      if (type === 'consultation_confirmed') {
        toast.success('Consultation confirmed!');
      }
    });

    return () => {
      sock.disconnect();
      setSocket(null);
    };
  }, [token]);

  const dismissCall = () => setIncomingCall(null);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, incomingCall, dismissCall }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
