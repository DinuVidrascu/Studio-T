import React from "react";
import { STATUS_META, SANS } from "../../utils/constants";

export default function Badge({ status }) {
  const m = STATUS_META[status] || STATUS_META.active;
  return (
    <span style={{ 
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: m.soft, color: m.color, whiteSpace: 'nowrap', fontFamily: SANS 
    }}>
      {m.label}
    </span>
  );
}
