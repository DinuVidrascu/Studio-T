import React from "react";
import { C } from "../../utils/constants";

export default function Bar({ value, color, h = 6 }) {
  return (
    <div style={{ height: h, borderRadius: h / 2, background: C.lineSoft }}>
      <div style={{ 
        height: '100%', borderRadius: h / 2, background: color, 
        width: Math.max(0, Math.min(100, value)) + '%', transition: 'width 0.4s ease' 
      }} />
    </div>
  );
}
