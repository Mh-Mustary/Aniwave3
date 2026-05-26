// frontend/components/radio/LiveChat.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';

export default function LiveChat({ user, sendChat }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    api.getChatHistory().then(setMessages).catch(() => {});
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text || !user) return;
    // Optimistic update
    setMessages((m) => [
      ...m,
      { id: Date.now(), message: text, user: { username: user.username }, self: true },
    ]);
    sendChat({ userId: user.id, message: text });
    setInput('');
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col">
      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        💬 Live chat
      </h3>

      <div className="flex-1 space-y-2 overflow-y-auto max-h-48 mb-3 pr-1">
        {messages.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No messages yet. Say hi! 🌸</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.self ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-gray-400 mb-0.5 px-1">{m.user?.username}</span>
            <div
              className={`text-xs px-3 py-1.5 rounded-2xl max-w-[85%] leading-relaxed ${
                m.self
                  ? 'bg-purple-100 text-purple-900 rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {m.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mt-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={user ? 'Say something...' : 'Log in to chat'}
          disabled={!user}
          maxLength={200}
          className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-pink-300 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={!user || !input.trim()}
          className="text-xs px-3 py-2 rounded-lg bg-pink-50 text-pink-700 border border-pink-200 font-medium hover:bg-pink-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
