import React, { useEffect, useState } from 'react';
import { CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { C, SANS } from '../../utils/constants';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setVisible(true), 10);
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? XCircle : Info;
  const iconColor = type === 'success' ? C.sage : type === 'error' ? C.coral : C.primary;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      background: C.panel,
      boxShadow: C.shadow,
      border: '1px solid ' + C.lineSoft,
      borderRadius: 12,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      zIndex: 9999,
      fontFamily: SANS,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      pointerEvents: visible ? 'auto' : 'none'
    }}>
      <Icon size={20} color={iconColor} />
      <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} style={{
        background: 'transparent', border: 'none', color: C.inkFaint, cursor: 'pointer',
        padding: 4, display: 'flex', marginLeft: 8
      }}>
        <X size={14} />
      </button>
    </div>
  );
}
