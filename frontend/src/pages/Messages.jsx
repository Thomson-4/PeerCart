import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MessageCircle, ArrowLeft, Send, Loader, ShieldCheck,
  Package, Clock, ChevronRight, Inbox,
} from 'lucide-react';
import { chat as chatApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=100';

const rupees = (p) => p != null ? `₹${(p / 100).toLocaleString('en-IN')}` : '';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/* ── Conversation list item ──────────────────────────────────────── */
function ConvItem({ conv, isActive, onSelect }) {
  const listing = conv.listing || {};
  const other   = (conv.participants || []).find((p) => p._id !== conv._myId) || {};
  const img     = listing.images?.[0] || FALLBACK_IMG;

  return (
    <button
      onClick={() => onSelect(conv._id)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
        isActive
          ? 'bg-accent/15 border border-accent/30'
          : 'hover:bg-surface-elevated border border-transparent'
      }`}
    >
      <div className="relative shrink-0">
        <img src={img} alt={listing.title} className="w-12 h-12 rounded-xl object-cover border border-border-color" />
        {conv._unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-white text-[9px] font-extrabold flex items-center justify-center">
            {conv._unread > 9 ? '9+' : conv._unread}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-text-primary truncate">{listing.title || 'Listing'}</p>
        <p className="text-[11px] text-text-secondary truncate mt-0.5">
          {other.name || 'User'} · {listing.type === 'rent' ? 'Rent' : 'Sell'}
        </p>
        {conv.lastMessage && (
          <p className="text-[11px] text-text-secondary/70 truncate mt-0.5 italic">
            {conv.lastMessage}
          </p>
        )}
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1">
        <span className="text-[10px] text-text-secondary">{timeAgo(conv.lastMessageAt || conv.createdAt)}</span>
        <ChevronRight size={12} className="text-text-secondary/40" />
      </div>
    </button>
  );
}

/* ── Chat bubble ─────────────────────────────────────────────────── */
function Bubble({ msg, isMine }) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
      {!isMine && (
        <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-black text-xs mr-2 shrink-0 mt-auto">
          {(msg.sender?.name || 'U')[0].toUpperCase()}
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isMine
            ? 'bg-accent text-white rounded-br-md'
            : 'bg-surface-elevated border border-border-color text-text-primary rounded-bl-md'
        }`}
      >
        {msg.content}
        <div className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-text-secondary'}`}>
          {timeAgo(msg.createdAt)}
          {isMine && msg.readAt && <span className="ml-1">· seen</span>}
        </div>
      </div>
    </div>
  );
}

/* ── Chat View ───────────────────────────────────────────────────── */
function ChatView({ convId, userId, onBack }) {
  const [conv,      setConv]     = useState(null);
  const [messages,  setMessages] = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [sending,   setSending]  = useState(false);
  const [input,     setInput]    = useState('');
  const bottomRef    = useRef(null);
  const scrollRef    = useRef(null);
  const pollRef      = useRef(null);
  const lastCountRef = useRef(0);

  // Only scroll if user is already near the bottom (within 120px)
  const scrollToBottomIfNear = useCallback((force = false) => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (force || distanceFromBottom < 120) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const data = await chatApi.getMessages(convId);
      const msgs = data.messages || [];
      const isNew = msgs.length > lastCountRef.current;
      lastCountRef.current = msgs.length;
      setMessages(msgs);
      if (isNew) scrollToBottomIfNear();
    } catch (_) {}
  }, [convId, scrollToBottomIfNear]);

  useEffect(() => {
    setLoading(true);
    lastCountRef.current = 0;
    chatApi.getMessages(convId)
      .then((data) => {
        const msgs = data.messages || [];
        lastCountRef.current = msgs.length;
        setMessages(msgs);
        // Force scroll to bottom on first load
        setTimeout(() => scrollToBottomIfNear(true), 50);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    pollRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [convId, loadMessages, scrollToBottomIfNear]);

  const sendMsg = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');
    try {
      const data = await chatApi.sendMessage(convId, text);
      setMessages((prev) => {
        lastCountRef.current = prev.length + 1;
        return [...prev, data.message];
      });
      // Always scroll after you send your own message
      setTimeout(() => scrollToBottomIfNear(true), 50);
    } catch (_) {
      setInput(text); // restore on failure
    } finally {
      setSending(false);
    }
  };

  // Get listing info from first message sender context via conversations endpoint
  useEffect(() => {
    chatApi.getConversations()
      .then((data) => {
        const found = (data.conversations || []).find((c) => c._id === convId);
        if (found) setConv(found);
      })
      .catch(() => {});
  }, [convId]);

  const listing = conv?.listing || {};
  const other   = (conv?.participants || []).find((p) => p._id !== userId) || {};

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border-color mb-3 shrink-0">
        <button onClick={onBack} className="text-text-secondary hover:text-text-primary transition-colors lg:hidden">
          <ArrowLeft size={20} />
        </button>
        <img
          src={listing.images?.[0] || FALLBACK_IMG}
          alt={listing.title}
          className="w-10 h-10 rounded-xl object-cover border border-border-color"
        />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-text-primary truncate text-sm">{listing.title || 'Listing'}</p>
          <p className="text-xs text-text-secondary">with {other.name || 'User'}</p>
        </div>
        {listing._id && (
          <Link
            to={`/listing/${listing._id}`}
            className="text-xs font-bold text-accent hover:underline flex items-center gap-1 shrink-0"
          >
            <Package size={12} /> View listing
          </Link>
        )}
      </div>

      {/* Listing mini-card */}
      {listing.title && (
        <div className="flex items-center gap-3 rounded-xl bg-surface-elevated border border-border-color px-3 py-2 mb-3 shrink-0">
          <Package size={14} className="text-accent shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-text-primary truncate">{listing.title}</p>
            <p className="text-xs text-text-secondary">
              {listing.type === 'rent' ? 'Rent' : 'Sale'} · {listing.price ? rupees(listing.price) : ''}
            </p>
          </div>
          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
            listing.status === 'active'
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-red-400/15 text-red-400'
          }`}>
            {listing.status || 'active'}
          </span>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 pr-1">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <Loader size={24} className="animate-spin text-accent" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <MessageCircle size={32} className="text-text-secondary/40" />
            <p className="text-sm text-text-secondary">No messages yet. Say hi!</p>
          </div>
        )}
        {messages.map((msg) => (
          <Bubble key={msg._id} msg={msg} isMine={msg.sender?._id === userId || msg.sender === userId} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMsg} className="flex gap-2 mt-3 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="input-base flex-1 rounded-xl py-2.5 text-sm"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="px-4 py-2.5 cta-gradient text-white rounded-xl font-bold transition-opacity disabled:opacity-40 flex items-center gap-1.5"
        >
          {sending ? <Loader size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>
    </div>
  );
}

/* ── Main Messages Page ──────────────────────────────────────────── */
export default function Messages() {
  const { convId }    = useParams();
  const navigate      = useNavigate();
  const { user }      = useAuth();

  const [conversations, setConversations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeConv,    setActiveConv]    = useState(convId || null);

  // Attach user id to each conversation for "other participant" lookup
  const enrichConvs = (convs) =>
    convs.map((c) => ({ ...c, _myId: user?.id }));

  useEffect(() => {
    setLoading(true);
    chatApi.getConversations()
      .then((data) => setConversations(enrichConvs(data.conversations || [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  // When URL param changes (e.g. navigated from listing), update activeConv
  useEffect(() => {
    if (convId) setActiveConv(convId);
  }, [convId]);

  const selectConv = (id) => {
    setActiveConv(id);
    navigate(`/messages/${id}`, { replace: true });
  };

  const goBack = () => {
    setActiveConv(null);
    navigate('/messages', { replace: true });
  };

  return (
    <div className="w-full animate-in fade-in duration-500 h-[calc(100vh-120px)] flex flex-col">

      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <MessageCircle size={22} className="text-accent" /> Messages
        </h1>
        <p className="text-text-secondary text-sm mt-1">Chat with buyers and sellers on campus.</p>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">

        {/* ── Conversation list ──── */}
        <div className={`
          w-full lg:w-80 shrink-0 flex flex-col gap-2
          ${activeConv ? 'hidden lg:flex' : 'flex'}
        `}>
          <div className="bento-panel flex-1 overflow-y-auto p-3 space-y-1">
            {loading && (
              <div className="flex items-center justify-center h-32">
                <Loader size={20} className="animate-spin text-accent" />
              </div>
            )}
            {!loading && conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
                <Inbox size={36} className="text-text-secondary/40" />
                <div>
                  <p className="font-bold text-text-primary">No conversations yet</p>
                  <p className="text-sm text-text-secondary mt-1">
                    Find something you like and tap <strong>"I want to buy this"</strong>.
                  </p>
                </div>
                <Link to="/feed" className="text-sm font-bold text-accent hover:underline">
                  Browse listings →
                </Link>
              </div>
            )}
            {conversations.map((conv) => (
              <ConvItem
                key={conv._id}
                conv={conv}
                isActive={activeConv === conv._id}
                onSelect={selectConv}
              />
            ))}
          </div>
        </div>

        {/* ── Chat view ──────────── */}
        <div className={`
          flex-1 min-w-0 bento-panel p-4
          ${activeConv ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}
        `}>
          {activeConv ? (
            <ChatView
              key={activeConv}
              convId={activeConv}
              userId={user?.id}
              onBack={goBack}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <MessageCircle size={40} className="text-text-secondary/30" />
              <p className="text-text-secondary font-medium">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
