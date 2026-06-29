import React from "react";
import { C } from "../../utils/constants";

export default function Card({ children, style = {}, onClick, ...rest }) {
  return (
    <div onClick={onClick} className={`hover-lift ${rest.className || ''}`} style={{ 
      background: C.panel, borderRadius: 16, boxShadow: C.shadowSoft,
      cursor: onClick ? 'pointer' : 'default', ...style 
    }} {...rest}>
      {children}
    </div>
  );
}
