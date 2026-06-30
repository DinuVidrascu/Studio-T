import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function DraggableProjectCard({ id, children, isKanban }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { id }
  });

  const style = {
    opacity: isDragging ? 0.3 : 1,
    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.18, 0.67, 0.6, 1.22)',
    zIndex: isDragging ? 999 : 1,
    cursor: isKanban ? 'grab' : 'default',
    marginBottom: isKanban ? 16 : 0,
    position: 'relative',
    touchAction: isKanban ? 'none' : 'auto'
  };

  return (
    <div ref={setNodeRef} style={style} {...(isKanban ? listeners : {})} {...(isKanban ? attributes : {})}>
      {children}
    </div>
  );
}
