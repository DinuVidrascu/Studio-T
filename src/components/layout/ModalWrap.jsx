import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { C } from "../../utils/constants";

export default function ModalWrap({ children, onClose, isMobile }) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalStyle; };
  }, []);

  const modalContent = (
    <div className="modal-backdrop" style={{ 
      position: 'fixed', inset: 0, display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', 
      zIndex: 500
    }} onClick={onClose}>
      <div className={isMobile ? "modal-content-mobile" : "modal-content"} style={{ 
        background: C.panel, borderRadius: isMobile ? '22px 22px 0 0' : '20px',
        padding: isMobile ? '10px 20px 34px' : '28px', width: isMobile ? '100%' : '440px', maxWidth: '100%',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(34,31,25,0.2)',
        boxSizing: 'border-box'
      }} onClick={e => e.stopPropagation()}>
        {isMobile && <div style={{ width: 40, height: 4, borderRadius: 2, background: C.line, margin: '8px auto 18px' }} />}
        {children}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
