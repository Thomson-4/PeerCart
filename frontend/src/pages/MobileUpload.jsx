import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, CheckCircle2, AlertCircle, Loader } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MobileUpload() {
  const { token } = useParams();
  const fileRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | done | error
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setStatus('uploading');
    setErrorMsg('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${BASE_URL}/api/upload/mobile/${token}`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <p style={{ color: '#a78bfa', fontWeight: 900, fontSize: 28, letterSpacing: '-0.03em', margin: 0 }}>
          Peer<span style={{ color: '#f0f0f0' }}>Cart</span>
        </p>
        <p style={{ color: '#666', fontSize: 13, margin: '4px 0 0' }}>Photo Upload</p>
      </div>

      {status === 'idle' && (
        <>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              width: '100%',
              maxWidth: 360,
              padding: '20px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              border: 'none',
              borderRadius: 16,
              color: 'white',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <Camera size={22} /> Take Photo
          </button>
          <p style={{ color: '#555', fontSize: 13, marginTop: 16, textAlign: 'center' }}>
            Point your camera at the item you're listing
          </p>
        </>
      )}

      {status === 'uploading' && (
        <div style={{ textAlign: 'center' }}>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              style={{ width: '100%', maxWidth: 360, borderRadius: 16, marginBottom: 20, objectFit: 'cover', maxHeight: 300 }}
            />
          )}
          <Loader size={32} color="#a78bfa" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#888', marginTop: 12 }}>Uploading photo…</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {status === 'done' && (
        <div style={{ textAlign: 'center' }}>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Uploaded"
              style={{ width: '100%', maxWidth: 360, borderRadius: 16, marginBottom: 20, objectFit: 'cover', maxHeight: 300 }}
            />
          )}
          <CheckCircle2 size={48} color="#22c55e" />
          <p style={{ color: '#22c55e', fontWeight: 800, fontSize: 20, margin: '12px 0 6px' }}>Photo uploaded!</p>
          <p style={{ color: '#666', fontSize: 14 }}>You can close this tab. Your photo is now on your laptop.</p>
        </div>
      )}

      {status === 'error' && (
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={48} color="#ef4444" />
          <p style={{ color: '#ef4444', fontWeight: 700, fontSize: 18, margin: '12px 0 6px' }}>Upload failed</p>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>{errorMsg}</p>
          <button
            onClick={() => { setStatus('idle'); setPreviewUrl(null); }}
            style={{ padding: '12px 28px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, color: '#aaa', cursor: 'pointer', fontSize: 14 }}
          >
            Try again
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
    </div>
  );
}
