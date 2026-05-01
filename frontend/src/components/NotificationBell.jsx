import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, MessageCircle, ShieldCheck, DollarSign, AlertTriangle, Sparkles, ShoppingBag, CheckCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notifications as notifApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const POLL_MS = 30_000; // 30 s

const TYPE_META = {
  message:     { icon: MessageCircle,  color: 'text-accent',       bg: 'bg-accent/15' },
  escrow:      { icon: ShieldCheck,    color: 'text-blue-400',     bg: 'bg-blue-400/15' },
  release:     { icon: DollarSign,     color: 'text-green-400',    bg: 'bg-green-400/15' },
  dispute:     { icon: AlertTriangle,  color: 'text-red-400',      bg: 'bg-red-400/15' },
  match:       { icon: Sparkles,       color: 'text-yellow-400',   bg: 'bg-yellow-400/15' },
  transaction: { icon: ShoppingBag,    color: 'text-accent',       bg: 'bg-accent/15' },
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)          return 'just now';
  if (diff < 3600)        return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)       return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7)   return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [items,        setItems]        = useState([]);
  const [unread,       setUnread]       = useState(0);
  const [open,         setOpen]         = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [markingAll,   setMarkingAll]   = useState(false);

  const panelRef = useRef(null);
  const bellRef  = useRef(null);

  // ── Fetch ───────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notifApi.getAll();
      setItems(data.notifications || []);
      setUnread(data.unreadCount  || 0);
    } catch (_) {}
  }, [isAuthenticated]);

  // Initial load + polling
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_MS);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Re-fetch when panel is opened so it's always fresh
  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));
    }
  }, [open, fetchNotifications]);

  // ── Click outside → close ────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        bellRef.current  && !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ── Actions ──────────────────────────��─────────────────────────��─
  const handleClick = async (notif) => {
    // optimistic read
    if (!notif.read) {
      setItems((prev) => prev.map((n) => n._id === notif._id ? { ...n, read: true } : n));
      setUnread((c) => Math.max(0, c - 1));
      notifApi.markRead(notif._id).catch(() => {});
    }
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await notifApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch (_) {}
    finally { setMarkingAll(false); }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      {/* ── Bell button ──────────────────────────────────────────── */}
      <button
        ref={bellRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative p-2.5 text-text-secondary hover:text-accent transition-colors rounded-xl hover:bg-surface-elevated"
      >
        <Bell size={19} strokeWidth={2.5} className={open ? 'text-accent' : ''} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ────────────────────────��──────────────── */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50
            glass-card border border-border-color shadow-2xl rounded-2xl
            overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-color">
            <h3 className="font-black text-sm tracking-tight">Notifications</h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  disabled={markingAll}
                  className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent transition-colors font-semibold disabled:opacity-50"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface-elevated"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading && items.length === 0 && (
              <div className="px-4 py-8 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-9 h-9 skeleton rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 skeleton rounded-full" />
                      <div className="h-2.5 w-full skeleton rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="px-4 py-10 text-center">
                <Bell size={32} className="mx-auto mb-2 text-text-secondary/30" />
                <p className="text-sm font-semibold text-text-secondary">No notifications yet</p>
                <p className="text-xs text-text-secondary/60 mt-1">We'll alert you when something happens</p>
              </div>
            )}

            {items.map((notif) => {
              const meta = TYPE_META[notif.type] || TYPE_META.transaction;
              const Icon = meta.icon;
              return (
                <button
                  key={notif._id}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors
                    hover:bg-surface-elevated border-b border-border-color/50 last:border-0
                    ${notif.read ? 'opacity-60' : ''}`}
                >
                  {/* Icon */}
                  <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                    <Icon size={16} className={meta.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${notif.read ? 'font-normal text-text-secondary' : 'font-bold text-text-primary'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.body}
                    </p>
                    <p className="text-[10px] text-text-secondary/60 mt-1 font-medium">
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border-color bg-surface/50 text-center">
              <p className="text-[10px] text-text-secondary/60 font-medium">
                Showing last {items.length} notification{items.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
