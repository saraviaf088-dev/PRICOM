import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        let Icon = CheckCircle2;
        let iconColor = 'var(--color-success)';
        if (toast.type === 'warning') {
          Icon = AlertCircle;
          iconColor = 'var(--color-warning)';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'var(--color-celeste)';
        }

        return (
          <div key={toast.id} className="toast-item">
            <Icon size={20} color={iconColor} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button 
              onClick={() => removeToast(toast.id)} 
              style={{ color: 'var(--text-muted)', padding: '2px' }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
