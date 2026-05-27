// frontend/lib/useSocket.js
// Real-time hook — wraps Socket.IO connection and exposes typed events

'use client';
import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return socket;
}

export function useSocket({ onVotesUpdated, onVotesReset, onSongNext, onChatMessage, onListeners } = {}) {
  const handlersRef = useRef({});

  // Keep handlers current without re-subscribing
  handlersRef.current = { onVotesUpdated, onVotesReset, onSongNext, onChatMessage, onListeners };

  useEffect(() => {
    const s = getSocket();
    s.connect();

    const handle = (event, key) =>
      s.on(event, (...args) => handlersRef.current[key]?.(...args));

    handle('votes:updated', 'onVotesUpdated');
    handle('votes:reset', 'onVotesReset');
    handle('song:next', 'onSongNext');
    handle('chat:message', 'onChatMessage');
    handle('stats:listeners', 'onListeners');

    return () => {
      s.off('votes:updated');
      s.off('votes:reset');
      s.off('song:next');
      s.off('chat:message');
      s.off('stats:listeners');
      s.disconnect();
    };
  }, []);

  const castVote = useCallback(({ songId, userId, sessionId }) => {
    getSocket().emit('vote:cast', { songId, userId, sessionId });
  }, []);

  const sendChat = useCallback(({ userId, message }) => {
    getSocket().emit('chat:send', { userId, message });
  }, []);

  return { castVote, sendChat };
}
