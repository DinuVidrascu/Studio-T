import React from "react";
import { C, SANS } from "../../utils/constants";

export default function FField({ label, children }) {
  return (
    <div>
      <label style={{ 
        display: 'block', fontSize: 11, color: C.inkSoft, marginBottom: 6, 
        fontWeight: 500, fontFamily: SANS 
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}
