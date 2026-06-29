import React from "react";
import { C, SANS } from "../../utils/constants";

export default function SectionTitle({ children, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.ink, fontFamily: SANS }}>{children}</h2>
      {count !== undefined && <span style={{ fontSize: 12, color: C.inkFaint }}>{count}</span>}
    </div>
  );
}
