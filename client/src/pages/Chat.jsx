import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messagesAPI, uploadAPI } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import MessageBubble, { DateSeparator } from '../components/MessageBubble.jsx';
import { format, isSameDay } from 'date-fns';
import toast from 'react-hot-toast';

function ConvItem({ conv, active, onClick, currentUserId }) {
  const other = conv.participants?.find(p => p._id !== currentUserId) || conv.participants?.[0];
  const lastMsg = conv.lastMessage;
  const unread = conv.unreadCount || 0;
  const photo = other?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || '?')}&background=1C3D2E&color=F7F4EF&size=80`;

  return (
    <button onClick={onClick} style={{
      display: 'flex', gap: '12px', alignItems: 'center', width: '100%', padding: '14px 16px',
      background: active ? 'rgba(28,61,46,.08)' : 'transparent',
      border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .15s',
      borderLeft: active ? '3px solid var(--color-primary)' : '3px solid transparent',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(28,61,46,.04)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <img src={photo} alt={other?.name} style={{ width: 44, height: 44, borderRadius: '6px', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: 'var(--color-available)', border: '2px solid var(--color-surface)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
          <span style={{ fontWeight: 600, fontSize: '.9rem', color: 'var(--color-text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{other?.name || 'Unknown'}</span>
          {lastMsg && <span style={{ fontSize: '.7rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>{format(new Date(lastMsg.createdAt || conv.updatedAt), 'HH:mm')}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
            {lastMsg?.content || lastMsg?.fileName || '📎 Attachment'}
          </span>
          {unread > 0 && (
            <span style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: '10px', fontSize: '.7rem', fontWeight: 700, padding: '1px 7px', flexShrink: 0 }}>{unread}</span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function Chat() {
  const { convId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  const fileInputRef = useRef(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const { data } = await messagesAPI.getConversations();
      setConversations(data.conversations || []);
    } catch {}
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Select active conversation
  useEffect(() => {
    if (!convId) { setActiveConv(null); setMessages([]); return; }
    const found = conversations.find(c => c._id === convId);
    if (found) setActiveConv(found);
    else if (convId) {
      // Load directly
      messagesAPI.getMessages(convId).then(({ data }) => {
        setMessages(data.messages || []);
      });
    }
  }, [convId, conversations]);

  // Load messages when active conv changes
  useEffect(() => {
    if (!activeConv) return;
    setLoadingMsgs(true);
    messagesAPI.getMessages(activeConv._id)
      .then(({ data }) => {
        setMessages(data.messages || []);
        socket?.emit('join_room', activeConv._id);
        socket?.emit('mark_read', { conversationId: activeConv._id });
      })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
  }, [activeConv?._id]);

  // Navigate to first conv if no convId
  useEffect(() => {
    if (!convId && conversations.length > 0) {
      navigate(`/chat/${conversations[0]._id}`, { replace: true });
    }
  }, [conversations, convId]);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (msg) => {
      if (msg.conversationId === (activeConv?._id || convId)) {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        socket.emit('mark_read', { conversationId: msg.conversationId });
      }
      loadConversations();
    });

    socket.on('user_typing', ({ userId, userName, conversationId }) => {
      if (conversationId === (activeConv?._id || convId) && userId !== user?._id) {
        setTypingUser(userName);
        setTyping(true);
      }
    });

    socket.on('user_stopped_typing', ({ conversationId }) => {
      if (conversationId === (activeConv?._id || convId)) setTyping(false);
    });

    socket.on('message_status', ({ messageId, status }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status } : m));
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
      socket.off('message_status');
    };
  }, [socket, activeConv?._id, convId, user?._id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content, fileUrl = '', fileType = '', fileName = '') => {
    if (!content.trim() && !fileUrl) return;
    const cid = activeConv?._id || convId;
    if (!cid) return;

    const optimistic = {
      _id: `temp-${Date.now()}`, conversationId: cid,
      senderId: { _id: user._id, name: user.name, profilePhoto: user.profilePhoto },
      content, fileUrl, fileType, fileName, status: 'sent',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setInput('');

    try {
      socket?.emit('send_message', { conversationId: cid, content, fileUrl, fileType, fileName });
      await messagesAPI.sendMessage(cid, { content, fileUrl, fileType, fileName });
    } catch { toast.error('Failed to send message'); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleTyping = (val) => {
    setInput(val);
    const cid = activeConv?._id || convId;
    if (!cid) return;
    socket?.emit('typing_start', { conversationId: cid, userName: user?.name });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket?.emit('typing_stop', { conversationId: cid });
    }, 1500);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadAPI.upload(file);
      await sendMessage('', data.fileUrl, data.fileType, data.fileName);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  // Group messages by date
  const groupedMessages = [];
  messages.forEach((msg, i) => {
    const prev = messages[i - 1];
    if (!prev || !isSameDay(new Date(msg.createdAt), new Date(prev.createdAt))) {
      groupedMessages.push({ type: 'separator', date: msg.createdAt, key: `sep-${i}` });
    }
    groupedMessages.push({ type: 'message', msg, key: msg._id });
  });

  const other = activeConv?.participants?.find(p => p._id !== user?._id) || activeConv?.participants?.[0];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', background: 'var(--color-bg)' }}>

      {/* Sidebar */}
      <div style={{ width: '320px', flexShrink: 0, background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Messages</h3>
          <input className="input" placeholder="Search conversations…" style={{ fontSize: '.875rem' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '.875rem' }}>
              No conversations yet.<br />Find a doctor and start chatting.
            </div>
          ) : (
            conversations.map(c => (
              <ConvItem key={c._id} conv={c} active={c._id === (activeConv?._id || convId)}
                currentUserId={user?._id}
                onClick={() => navigate(`/chat/${c._id}`)} />
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      {!convId ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', color: 'var(--color-text-muted)' }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" style={{ opacity: .25 }}>
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="var(--color-text)" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <p>Select a conversation to start</p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Chat header */}
          {other && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
              <img src={other.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(other.name || '?')}&background=1C3D2E&color=F7F4EF&size=80`}
                alt={other.name} style={{ width: 40, height: 40, borderRadius: '6px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--color-text-strong)' }}>{other.name}</div>
                <div style={{ fontSize: '.8rem', color: typing ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                  {typing ? `${typingUser} is typing…` : other.role === 'doctor' ? 'Doctor' : 'Patient'}
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate(`/video/${other._id}`)}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M1 4a1 1 0 011-1h8a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4zM11 6l4-2v8l-4-2V6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                Video call
              </button>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            {loadingMsgs ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}><div className="spinner" /></div>
            ) : groupedMessages.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '48px', color: 'var(--color-text-muted)', fontSize: '.9rem' }}>
                Start the conversation — say hello!
              </div>
            ) : (
              groupedMessages.map(item =>
                item.type === 'separator'
                  ? <DateSeparator key={item.key} date={item.date} />
                  : <MessageBubble key={item.key} message={item.msg} isMine={item.msg.senderId?._id === user?._id || item.msg.senderId === user?._id} />
              )
            )}
            {typing && (
              <div style={{ display: 'flex', gap: '4px', padding: '8px 0', alignItems: 'center' }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-text-muted)', animation: `pulse 1.2s ${i*.3}s infinite` }} />)}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <input ref={fileInputRef} type="file" onChange={handleFile} style={{ display: 'none' }} accept="image/*,.pdf,.doc,.docx" />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              style={{ padding: '9px', background: 'none', border: '1.5px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', flexShrink: 0, transition: 'border-color .15s' }}>
              {uploading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
            </button>

            <textarea
              value={input}
              onChange={e => handleTyping(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              style={{
                flex: 1, resize: 'none', border: '1.5px solid var(--color-border)',
                borderRadius: '6px', padding: '10px 14px', fontSize: '.9375rem',
                fontFamily: 'var(--font-body)', lineHeight: 1.5, outline: 'none',
                maxHeight: '120px', overflowY: 'auto',
              }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            />

            <button className="btn btn-primary" onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              style={{ padding: '10px 16px', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
