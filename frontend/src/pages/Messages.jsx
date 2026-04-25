import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MessageCircle, ArrowLeft, Send, Loader, Package,
  ChevronRight, Inbox, HandCoins, X, CheckCircle2,
  AlertTriangle, IndianRupee,
} from 'lucide-react';
import { chat as chatApi, transactions as txApi } from '../services/api';
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

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ── Conversation list item ─────────────────────────────────────── */
function ConvItem({ conv, isActive, onSelect, myId }) {
  const listing = conv.listing || {};
  const need    = conv.need    || {};
  const subject = listing.title || need.title || 'Conversation';
  const img     = listing.images?.[0] || FALLBACK_IMG;
  const other   = (conv.participants || []).find((p) => p._id !== myId) || {};

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
        <img src={img} alt={subject} className="w-12 h-12 rounded-xl object-cover border border-border-color" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-text-primary truncate">{subject}</p>
        <p className="text-[11px] text-text-secondary truncate mt-0.5">
          {other.name || 'User'} · {conv.listing ? (listing.type === 'rent' ? 'Rent' : 'Sale') : 'Need'}
        </p>
        {conv.lastMessage && (
          <p className="text-[11px] text-text-secondary/70 truncate mt-0.5 italic">{conv.lastMessage}</p>
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
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isMine
          ? 'bg-accent text-white rounded-br-md'
          : 'bg-surface-elevated border border-border-color text-text-primary rounded-bl-md'
      }`}>
        {msg.content}
        <div className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-text-secondary'}`}>
          {timeAgo(msg.createdAt)}
          {isMine && msg.readAt && <span className="ml-1">· seen</span>}
        </div>
      </div>
    </div>
  );
}

/* ── Make Offer / Pay Modal ─────────────────────────────────────── */
function OfferModal({ listing, onClose, onPay, paying }) {
  const price   = listing?.price || 0;
  const deposit = listing?.type === 'rent' && listing?.rentalDeposit ? listing.rentalDeposit : 0;
  const total   = price + deposit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bento-panel p-6 max-w-sm w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
          <X size={18} />
        </button>
        <h3 className="text-lg font-black mb-1">Confirm Purchase</h3>
        <p className="text-text-secondary text-sm mb-5">
          Pay via Razorpay. Money is held in escrow and released to the seller only after you confirm receipt.
        </p>

        {listing?.images?.[0] && (
          <div className="flex items-center gap-3 rounded-xl bg-surface-elevated border border-border-color p-3 mb-5">
            <img src={listing.images[0]} className="w-12 h-12 rounded-xl object-cover" alt={listing.title} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-text-primary truncate">{listing.title}</p>
              <p className="text-xs text-text-secondary">{listing.type === 'rent' ? 'Rental' : 'Purchase'}</p>
            </div>
          </div>
        )}

        <div className="space-y-2 mb-5 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Item price</span>
            <span className="font-bold">{rupees(price)}</span>
          </div>
          {deposit > 0 && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Deposit (refundable)</span>
              <span className="font-bold">{rupees(deposit)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border-color pt-2 font-black text-base">
            <span>Total</span>
            <span className="text-accent">{rupees(total)}</span>
          </div>
        </div>

        <button
          onClick={onPay}
          disabled={paying}
          className="w-full py-3.5 cta-gradient text-white font-extrabold rounded-xl flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform disabled:opacity-60"
        >
          {paying
            ? <><Loader size={16} className="animate-spin" /> Processing…</>
            : <><IndianRupee size={16} /> Pay Now with Razorpay</>
          }
        </button>
        <p className="text-center text-xs text-text-secondary mt-3">
          🔒 Escrow protected — money released only after you confirm receipt
        </p>
      </div>
    </div>
  );
}

/* ── Chat View ───────────────────────────────────────────────────── */
function ChatView({ convId, userId, onBack }) {
  const [conv,       setConv]      = useState(null);
  const [messages,   setMessages]  = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [sending,    setSending]   = useState(false);
  const [input,      setInput]     = useState('');
  const [showOffer,  setShowOffer] = useState(false);
  const [paying,     setPaying]    = useState(false);
  const [paySuccess, setPaySuccess] = useState(null);
  const [payError,   setPayError]  = useState('');
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const data = await chatApi.getMessages(convId);
      setMessages(data.messages || []);
    } catch (_) {}
  }, [convId]);

  useEffect(() => {
    setLoading(true);
    chatApi.getMessages(convId)
      .then((d) => setMessages(d.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    pollRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [convId, loadMessages]);

  useEffect(() => {
    chatApi.getConversations()
      .then((d) => {
        const found = (d.conversations || []).find((c) => c._id === convId);
        if (found) setConv(found);
      })
      .catch(() => {});
  }, [convId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMsg = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');
    try {
      const data = await chatApi.sendMessage(convId, text);
      setMessages((prev) => [...prev, data.message]);
    } catch (_) {
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handlePay = async () => {
    const listing = conv?.listing;
    if (!listing?._id) return;
    setPayError('');
    setPaying(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Could not load payment gateway. Check your internet.');

      const data = await txApi.initiate({ listingId: listing._id, type: listing.type || 'buy' });
      const { payment, transaction } = data;

      await chatApi.sendMessage(convId, `💳 Payment initiated for "${listing.title}" — ${rupees(payment.amount)}`);
      setShowOffer(false);

      const options = {
        key:         payment.razorpayKeyId,
        amount:      payment.amount,
        currency:    payment.currency,
        order_id:    payment.orderId,
        name:        'PeerCart Campus',
        description: listing.title,
        image:       listing.images?.[0] || '',
        theme:       { color: '#7c3aed' },
        handler: async (response) => {
          try {
            await txApi.verifyPayment({
              razorpayOrderId:   payment.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              transactionId:     transaction._id,
            });
            await chatApi.sendMessage(convId, `✅ Payment confirmed! Arrange a meetup to collect your item.`);
            setPaySuccess(transaction._id);
            const d = await chatApi.getMessages(convId);
            setMessages(d.messages || []);
          } catch (_) {
            setPayError('Payment received but verification failed — contact support.');
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setPayError(`Payment failed: ${resp.error.description}`);
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      setPayError(err.message || 'Payment could not be started');
      setPaying(false);
    }
  };

  const listing        = conv?.listing || {};
  const need           = conv?.need    || {};
  const subject        = listing.title || need.title || 'Conversation';
  const other          = (conv?.participants || []).find((p) => p._id !== userId) || {};
  const isListingChat  = !!conv?.listing?._id;

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-border-color mb-3 shrink-0">
        <button onClick={onBack} className="text-text-secondary hover:text-text-primary lg:hidden">
          <ArrowLeft size={20} />
        </button>
        <img src={listing.images?.[0] || FALLBACK_IMG} alt={subject} className="w-10 h-10 rounded-xl object-cover border border-border-color" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-text-primary truncate text-sm">{subject}</p>
          <p className="text-xs text-text-secondary">with {other.name || 'User'}</p>
        </div>
        {isListingChat && listing._id && (
          <Link to={`/listing/${listing._id}`} className="text-xs font-bold text-accent hover:underline flex items-center gap-1 shrink-0">
            <Package size={12} /> View
          </Link>
        )}
      </div>

      {/* Context bar */}
      <div className="flex items-center gap-3 rounded-xl bg-surface-elevated border border-border-color px-3 py-2 mb-3 shrink-0">
        <Package size={14} className="text-accent shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-text-primary truncate">{subject}</p>
          {listing.price > 0 && (
            <p className="text-xs text-text-secondary">{listing.type === 'rent' ? 'Rent' : 'Sale'} · {rupees(listing.price)}</p>
          )}
          {need.maxBudget > 0 && (
            <p className="text-xs text-text-secondary">Budget up to {rupees(need.maxBudget)}</p>
          )}
        </div>
        {isListingChat && listing.status === 'active' && (
          <button
            onClick={() => setShowOffer(true)}
            disabled={paying}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-accent/15 border border-accent/30 text-accent hover:bg-accent/25 transition-colors shrink-0"
          >
            {paying ? <Loader size={12} className="animate-spin" /> : <HandCoins size={12} />}
            Make Offer
          </button>
        )}
      </div>

      {/* Banners */}
      {paySuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 mb-3 shrink-0">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-400">Payment successful! 🎉</p>
            <p className="text-xs text-text-secondary">Arrange a meetup with the seller to collect your item.</p>
          </div>
        </div>
      )}
      {payError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 mb-3 shrink-0">
          <AlertTriangle size={14} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-400">{payError}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {loading && <div className="flex items-center justify-center h-full"><Loader size={24} className="animate-spin text-accent" /></div>}
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
        <button type="submit" disabled={!input.trim() || sending} className="px-4 py-2.5 cta-gradient text-white rounded-xl font-bold disabled:opacity-40 flex items-center gap-1.5">
          {sending ? <Loader size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>

      {showOffer && (
        <OfferModal listing={listing} onClose={() => setShowOffer(false)} onPay={handlePay} paying={paying} />
      )}
    </div>
  );
}

/* ── Main Messages Page ─────────────────────────────────────────── */
export default function Messages() {
  const { convId }    = useParams();
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeConv,    setActiveConv]    = useState(convId || null);

  useEffect(() => {
    setLoading(true);
    chatApi.getConversations()
      .then((data) => setConversations(data.conversations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (convId) setActiveConv(convId); }, [convId]);

  const selectConv = (id) => { setActiveConv(id); navigate(`/messages/${id}`, { replace: true }); };
  const goBack     = ()   => { setActiveConv(null); navigate('/messages', { replace: true }); };

  return (
    <div className="w-full animate-in fade-in duration-500 h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <MessageCircle size={22} className="text-accent" /> Messages
        </h1>
        <p className="text-text-secondary text-sm mt-1">Chat with buyers and sellers on campus.</p>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Conversation list */}
        <div className={`w-full lg:w-80 shrink-0 flex flex-col ${activeConv ? 'hidden lg:flex' : 'flex'}`}>
          <div className="bento-panel flex-1 overflow-y-auto p-3 space-y-1">
            {loading && <div className="flex items-center justify-center h-32"><Loader size={20} className="animate-spin text-accent" /></div>}
            {!loading && conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
                <Inbox size={36} className="text-text-secondary/40" />
                <div>
                  <p className="font-bold text-text-primary">No conversations yet</p>
                  <p className="text-sm text-text-secondary mt-1">Tap <strong>"I want to buy this"</strong> on any listing.</p>
                </div>
                <Link to="/feed" className="text-sm font-bold text-accent hover:underline">Browse listings →</Link>
              </div>
            )}
            {conversations.map((conv) => (
              <ConvItem key={conv._id} conv={conv} isActive={activeConv === conv._id} myId={user?.id} onSelect={selectConv} />
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className={`flex-1 min-w-0 bento-panel p-4 ${activeConv ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
          {activeConv
            ? <ChatView key={activeConv} convId={activeConv} userId={user?.id} onBack={goBack} />
            : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <MessageCircle size={40} className="text-text-secondary/30" />
                <p className="text-text-secondary font-medium">Select a conversation to start chatting</p>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}
