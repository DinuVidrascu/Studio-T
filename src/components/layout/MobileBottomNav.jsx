import React from "react";
import { LayoutGrid, GanttChartSquare, CalendarDays, Layers, Users, BarChart3 } from "lucide-react";
import { C, SANS } from "../../utils/constants";

const NAV = [
  { id: 'dashboard', Icon: LayoutGrid,         label: 'Acasa'     },
  { id: 'gantt',     Icon: GanttChartSquare,   label: 'Timeline'  },
  { id: 'calendar',  Icon: CalendarDays,       label: 'Calendar'  },
  { id: 'projects',  Icon: Layers,             label: 'Proiecte'  },
  { id: 'team',      Icon: Users,              label: 'Echipa'    },
  { id: 'reports',   Icon: BarChart3,          label: 'Rapoarte'  },
];

export default function MobileBottomNav({ view, setView }) {
  return (
    <div className="glass-panel" style={{ 
      position: 'fixed', bottom: 0, left: 0, right: 0, 
      borderTop: '1px solid ' + C.line, display: 'flex', zIndex: 200, height: 62, 
      boxShadow: '0 -2px 16px rgba(0,0,0,0.05)' 
    }}>
      {NAV.map(({ id, Icon, label }) => {
        const active = view === id;
        return (
          <button key={id} onClick={() => setView(id)} style={{ 
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none',
            color: active ? C.primary : C.inkFaint, cursor: 'pointer', gap: 3, padding: '6px 0' 
          }}>
            <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
            <span style={{ fontSize: 9.5, fontWeight: active ? 600 : 500, fontFamily: SANS }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
