import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { ShieldAlert, Send, Bot, User, Loader2, LogOut, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserChatPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}`);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, time: new Date() }]);
    setLoading(true);

    try {
      const res = await chatAPI.send({ message: userMsg, session_id: sessionId });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.response,
        time: new Date()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.response?.data?.detail || 'Something went wrong. Please try again.',
        time: new Date(),
        isError: true
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(`session_${Date.now()}`);
    inputRef.current?.focus();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: '#09090b' }} data-testid="user-chat-page">
      {/* Top Bar */}
      <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-sm tracking-tight">HoneyPrompt</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={startNewChat} className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground" data-testid="new-chat-button">
            <Plus className="w-3.5 h-3.5" /> New Chat
          </Button>
          <div className="h-4 w-px bg-border/50" />
          <span className="text-xs text-muted-foreground hidden sm:block">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" data-testid="user-logout-button">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full px-6" data-testid="chat-empty-state">
            <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">How can I help you?</h1>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
              I'm your AI assistant. Ask me anything about cybersecurity, technology, or general topics.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {[
                'What are the latest cybersecurity threats?',
                'Explain prompt injection attacks',
                'How do honeypot systems work?',
                'Best practices for API security'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-left text-xs font-mono px-3 py-2.5 rounded-md bg-muted/30 border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
                  data-testid={`suggestion-${suggestion.slice(0, 20).replace(/\s/g, '-')}`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <ScrollArea className="h-full">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className="flex gap-3" data-testid={`chat-msg-${i}`}>
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.role === 'user'
                      ? 'bg-secondary border border-border'
                      : 'bg-primary/10 border border-primary/20'
                  }`}>
                    {msg.role === 'user'
                      ? <User className="w-4 h-4 text-muted-foreground" />
                      : <Bot className="w-4 h-4 text-primary" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold mb-1 text-muted-foreground">
                      {msg.role === 'user' ? user?.name || 'You' : 'HoneyPrompt AI'}
                    </p>
                    <div className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.isError ? 'text-destructive' : ''}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3" data-testid="chat-loading-indicator">
                  <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold mb-1 text-muted-foreground">HoneyPrompt AI</p>
                    <div className="flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-card/30 backdrop-blur-sm p-4 flex-shrink-0">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-center bg-muted/30 border border-border/50 rounded-lg px-3 focus-within:border-primary/50 transition-colors">
            <Input
              ref={inputRef}
              data-testid="user-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message HoneyPrompt..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-12 px-0"
              disabled={loading}
            />
            <Button
              type="submit"
              data-testid="user-chat-send"
              disabled={loading || !input.trim()}
              size="sm"
              className="h-8 w-8 p-0 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2 font-mono">
            HoneyPrompt AI can make mistakes. Verify important information.
          </p>
        </form>
      </div>
    </div>
  );
}
