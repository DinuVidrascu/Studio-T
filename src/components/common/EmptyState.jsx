import React from "react";
import { FolderOpen } from "lucide-react";
import { C, SERIF, SANS } from "../../utils/constants";

export default function EmptyState({ 
  icon: Icon = FolderOpen, 
  title = "Niciun rezultat", 
  description, 
  actionLabel, 
  onAction,
  compact = false
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: compact ? '24px 16px' : '48px 24px', 
      textAlign: 'center',
      background: compact ? 'transparent' : C.panelAlt,
      border: compact ? '1px dashed ' + C.line : '1px dashed ' + C.lineSoft,
      borderRadius: 16,
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: compact ? 48 : 64, height: compact ? 48 : 64, borderRadius: '50%', 
        background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: compact ? 12 : 16, color: C.primary
      }}>
        <Icon size={compact ? 24 : 32} strokeWidth={1.5} opacity={0.8} />
      </div>
      
      <h3 style={{ 
        margin: '0 0 6px', fontSize: compact ? 14 : 16, fontWeight: 600, 
        color: C.ink, fontFamily: SERIF 
      }}>
        {title}
      </h3>
      
      {description && (
        <p style={{ 
          margin: 0, fontSize: compact ? 12 : 13.5, color: C.inkSoft, 
          fontFamily: SANS, maxWidth: 300, lineHeight: 1.4
        }}>
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button onClick={onAction} style={{
          marginTop: compact ? 16 : 24, background: C.ink, color: C.paper, border: 'none',
          padding: compact ? '6px 14px' : '8px 18px', borderRadius: 10,
          fontWeight: 600, fontSize: compact ? 11.5 : 13, fontFamily: SANS, cursor: 'pointer',
          transition: 'transform 0.2s, background 0.2s',
          boxShadow: C.shadowSoft
        }} className="hover-lift">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
