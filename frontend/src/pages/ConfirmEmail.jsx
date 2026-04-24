import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader } from 'lucide-react';
import { auth as authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ConfirmEmail() {
  const { token }    = useParams();
  const { refreshUser, isAuthenticated } = useAuth();
  const navigate     = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirm = async () => {
      try {
        const data = await authApi.confirmEmail(token);
        setMessage(data.message || 'Email verified! Trust Level upgraded to 1.');
        setStatus('success');
        // Refresh auth context so trust level updates everywhere
        if (isAuthenticated) await refreshUser();
        setTimeout(() => navigate('/profile'), 3000);
      } catch (err) {
        setMessage(err.message || 'Verification link is invalid or has expired.');
        setStatus('error');
      }
    };
    confirm();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center animate-in fade-in zoom-in-95 duration-500">
        {status === 'loading' && (
          <div className="glass-card gradient-stroke p-10 flex flex-col items-center gap-4">
            <Loader size={40} className="animate-spin text-accent" />
            <p className="font-semibold text-text-secondary">Verifying your email…</p>
          </div>
        )}

        {status === 'success' && (
          <div className="glass-card gradient-stroke p-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-green-400" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Email Verified!</h1>
            <p className="text-text-secondary">{message}</p>
            <div className="trust-badge mt-2">Trust Level 1 Unlocked</div>
            <p className="text-sm text-text-secondary">Redirecting to your profile…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="glass-card gradient-stroke p-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-400/10 border border-red-400/20 flex items-center justify-center">
              <XCircle size={36} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Link Expired</h1>
            <p className="text-text-secondary">{message}</p>
            <button
              onClick={() => navigate('/profile')}
              className="mt-2 px-6 py-3 bg-accent text-white font-bold rounded-xl hover:-translate-y-0.5 transition-transform"
            >
              Back to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
