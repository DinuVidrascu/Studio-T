import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { C, SANS, STATUS_META } from "../../utils/constants";
import EmptyState from "../common/EmptyState";
import { Inbox } from "lucide-react";

export default function DroppableColumn({ id, children, projectCount, onAdd }) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { id }
  });

  return (
    <div 
      ref={setNodeRef}
      style={{ 
        background: isOver ? C.primarySoft : C.panelAlt, 
        borderRadius: 16, padding: 14, minHeight: '60vh', 
        border: '1px solid ' + (isOver ? C.primary : C.lineSoft),
        boxShadow: isOver ? `0 0 0 2px ${C.primarySoft}` : 'inset 0 4px 10px rgba(34,31,25,0.02)',
        transition: 'background 0.2s, border 0.2s, box-shadow 0.2s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_META[id].color }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: SANS }}>{STATUS_META[id].label}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.inkFaint, background: C.lineSoft, padding: '2px 8px', borderRadius: 12 }}>
          {projectCount}
        </span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {children}
        {projectCount === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <EmptyState 
              icon={Inbox} 
              title="Gol" 
              description="Trage un proiect aici" 
              compact={true} 
              actionLabel="Crează"
              onAction={onAdd}
            />
          </div>
        )}
      </div>
    </div>
  );
}
