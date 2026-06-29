import React from "react";
import { Plus } from "lucide-react";
import { C, SANS } from "../../utils/constants";

export default function AddBtn({ onClick, label, isMobile }) {
  return (
    <button onClick={onClick} style={{ 
      display: 'flex', alignItems: 'center', gap: 6, background: C.ink, border: 'none', color: C.paper,
      padding: isMobile ? '8px 13px' : '10px 17px', borderRadius: 11, fontSize: isMobile ? 12 : 13, 
      fontWeight: 600, cursor: 'pointer', boxShadow: C.shadowSoft, fontFamily: SANS 
    }}>
      <Plus size={15} strokeWidth={2.4} /> {label}
    </button>
  );
}
