import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Send, Plus, MessageSquare, Trash2, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Chat = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      fetchMessages(currentSessionId);
    }
  }, [currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async () => {
    try {
      const res = await api.get('/chat/sessions');
      setSessions(res.data.data);
      if (res.data.data.length > 0 && !currentSessionId) {
        setCurrentSessionId(res.data.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      const res = await api.get(`/chat/sessions/${sessionId}`);
      setMessages(res.data.data);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  };

  const createNewSession = async () => {
    try {
      const res = await api.post('/chat/sessions', { title: 'New Conversation' });
      setSessions([res.data.data, ...sessions]);
      setCurrentSessionId(res.data.data.id);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create session', error);
    }
  };

  const deleteSession = async (id) => {
    try {
      await api.delete(`/chat/sessions/${id}`);
      setSessions(sessions.filter(s => s.id !== id));
      if (currentSessionId === id) {
        setCurrentSessionId(sessions.length > 1 ? sessions.find(s => s.id !== id).id : null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete session', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    let sessionId = currentSessionId;
    
    // Create session if none exists
    if (!sessionId) {
      try {
        const res = await api.post('/chat/sessions', { title: input.substring(0, 30) + '...' });
        sessionId = res.data.data.id;
        setSessions([res.data.data, ...sessions]);
        setCurrentSessionId(sessionId);
      } catch (error) {
        console.error('Failed to create session', error);
        return;
      }
    }

    const userMsg = { role: 'user', message: input };
    setMessages([...messages, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { sessionId, message: userMsg.message });
      setMessages(prev => [...prev, res.data.data]);
    } catch (error) {
      console.error('Failed to send message', error);
      setMessages(prev => [...prev, { role: 'assistant', message: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] -m-4 md:-m-8 bg-white dark:bg-gray-900 border-t md:border dark:border-gray-700 md:rounded-lg overflow-hidden">
      {/* Chat Sidebar */}
      <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col hidden sm:flex">
        <div className="p-4 border-b dark:border-gray-700">
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer group ${
                currentSessionId === session.id
                  ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100'
                  : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              onClick={() => setCurrentSessionId(session.id)}
            >
              <div className="flex items-center overflow-hidden">
                <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{session.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 focus:outline-none"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 relative">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <p>Start a conversation about stocks, crypto, or forex!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.message}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.message
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-500 dark:text-gray-400">FinAdvisor is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center text-center">
          <AlertCircle className="h-3 w-3 mr-1 inline" />
          Market data may change rapidly. This information is for educational purposes and is not personalized financial advice.
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-700">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about AAPL, BTC, or USD/EUR..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
