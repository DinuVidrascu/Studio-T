import React from "react";

export default function Skeleton({ width = '100%', height = 20, borderRadius = 8, style = {} }) {
  return (
    <div 
      className="skeleton" 
      style={{
        width,
        height,
        borderRadius,
        flexShrink: 0,
        ...style
      }} 
    />
  );
}
