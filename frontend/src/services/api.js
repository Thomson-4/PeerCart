const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('pc_token');

const req = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.message || 'Request failed'), { status: res.status });
  return data;
};

const qs = (params) => {
  const str = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  ).toString();
  return str ? `?${str}` : '';
};

export const auth = {
  // Phone OTP (Level 0)
  sendOtp:        (phone)        => req('/api/auth/send-otp',          { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOtp:      (phone, otp)   => req('/api/auth/verify-otp',        { method: 'POST', body: JSON.stringify({ phone, otp }) }),
  // College email OTP (Level 1 — domain validated at send time)
  sendEmailOtp:   (email, mode = 'login', name) => req('/api/auth/send-email-otp', { method: 'POST', body: JSON.stringify({ email, mode, ...(name && { name }) }) }),
  verifyEmailOtp: (email, otp)   => req('/api/auth/verify-email-otp',  { method: 'POST', body: JSON.stringify({ email, otp }) }),
  // Session & email verification
  me:             ()             => req('/api/auth/me'),
  verifyEmail:    (email)        => req('/api/auth/verify-email',       { method: 'POST', body: JSON.stringify({ email }) }),
  confirmEmail:   (token)        => req(`/api/auth/confirm-email/${token}`),
  // Password-based auth
  signup: (name, email, phone, password, confirmPassword) =>
    req('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, phone, password, confirmPassword }) }),
  signin: (identifier, password) =>
    req('/api/auth/signin', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
};

export const listings = {
  getAll:     (params = {}) => req(`/api/listings${qs(params)}`),
  getMine:    ()            => req('/api/listings?mine=true'),
  getOne:     (id)          => req(`/api/listings/${id}`),
  create:     (body)        => req('/api/listings',              { method: 'POST',  body: JSON.stringify(body) }),
  update:     (id, body)    => req(`/api/listings/${id}`,        { method: 'PUT',   body: JSON.stringify(body) }),
  markStatus: (id, status)  => req(`/api/listings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  remove:     (id)          => req(`/api/listings/${id}`,        { method: 'DELETE' }),
};

export const needs = {
  getAll: (params = {}) => req(`/api/needs${qs(params)}`),
  create: (body)        => req('/api/needs', { method: 'POST', body: JSON.stringify(body) }),
  remove: (id)          => req(`/api/needs/${id}`, { method: 'DELETE' }),
};

export const transactions = {
  initiate:       (body)               => req('/api/transactions/initiate',        { method: 'POST', body: JSON.stringify(body) }),
  verifyPayment:  (body)               => req('/api/transactions/verify-payment',  { method: 'POST', body: JSON.stringify(body) }),
  confirmReceipt: (id)                 => req(`/api/transactions/${id}/confirm-receipt`, { method: 'POST' }),
  raiseDispute:   (id, reason)         => req(`/api/transactions/${id}/raise-dispute`,   { method: 'POST', body: JSON.stringify({ reason }) }),
  myTransactions: (params = {})        => req(`/api/transactions/my${qs(params)}`),
};

export const reviews = {
  create: (transactionId, rating, comment) =>
    req('/api/reviews', { method: 'POST', body: JSON.stringify({ transactionId, rating, comment }) }),
};

export const chat = {
  getOrCreate:    (params)                   => req('/api/chat/conversations',          { method: 'POST', body: JSON.stringify(params) }),
  getConversations: ()                       => req('/api/chat/conversations'),
  getMessages:    (convId, params = {})      => req(`/api/chat/conversations/${convId}/messages${qs(params)}`),
  sendMessage:    (convId, content)          => req(`/api/chat/conversations/${convId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  unreadCount:    ()                         => req('/api/chat/unread-count'),
};

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const upload = {
  createSession: ()        => req('/api/upload/session', { method: 'POST' }),
  pollSession:   (token)   => req(`/api/upload/session/${token}`),
  uploadImage: (file) => {
    const token = localStorage.getItem('pc_token');
    const fd = new FormData();
    fd.append('image', file);
    return fetch(`${BASE_URL}/api/upload/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Upload failed');
      return d;
    });
  },
};
