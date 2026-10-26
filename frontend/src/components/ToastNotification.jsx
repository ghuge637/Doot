import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastNotification({ toast, onDismiss }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 18px',
      background: 'rgba(15, 17, 26, 0.95)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${isSuccess ? 'var(--emerald-border)' : isError ? 'var(--rose-border)' : 'var(--border-subtle)'}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 0, 0, 0.4)',
      color: 'var(--text-primary)',
      fontSize: '13px',
      fontWeight: '500',
      maxWidth: '420px',
      animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {isSuccess && <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0 }} />}
      {isError && <AlertCircle size={18} color="#f87171" style={{ flexShrink: 0 }} />}
      {!isSuccess && !isError && <Info size={18} color="var(--accent-brand)" style={{ flexShrink: 0 }} />}

      <span style={{ flex: 1, lineHeight: '1.4' }}>{toast.message}</span>

      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-tertiary)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
