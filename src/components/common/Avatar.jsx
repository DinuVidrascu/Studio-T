import React from "react";
import { C, SANS } from "../../utils/constants";

export default function Avatar({ p, size = 32 }) {
  if (p && p.photoURL) {
    return (
      <img src={p.photoURL} alt={p.name || "Avatar"} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    );
  }
  return (
    <div style={{ 
      width: size, height: size, borderRadius: '50%', background: (p && p.color) || C.primary,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 600, color: '#fff', flexShrink: 0, 
      letterSpacing: '-0.3px', fontFamily: SANS 
    }}>
      {p ? p.initials : 'TL'}
    </div>
  );
}
