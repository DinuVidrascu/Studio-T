import React from "react";
import { Settings } from "lucide-react";
import { C, SERIF } from "../../utils/constants";

export default function MobileHeader({ view, setView, user }) {
  const titles = { dashboard: 'Acasa', gantt: 'Timeline', calendar: 'Calendar', projects: 'Proiecte', team: 'Echipa', settings: 'Setări', reports: 'Rapoarte' };
  return (
    <div className="glass-panel" style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 18px 10px', position: 'sticky', top: 0, zIndex: 100 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/LOGO_ts_studio.svg" alt="Logo" style={{ width: 30, height: 30, borderRadius: 6, objectFit: 'contain', flexShrink: 0 }} />
        <span style={{ fontWeight: 600, fontSize: 19, color: C.ink, fontFamily: SERIF }}>
          {titles[view] || 'Studio'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setView('settings')} style={{ background: 'transparent', border: 'none', color: view === 'settings' ? C.primary : C.ink, padding: 4, display: 'flex', cursor: 'pointer' }}>
          <Settings size={22} strokeWidth={2} />
        </button>
        {user?.photoURL ? (
          <img src={user.photoURL} alt="Avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ 
            width: 32, height: 32, borderRadius: '50%', background: C.ink,
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: 12, fontWeight: 600, color: C.paper
          }}>
            {user ? user.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'TL'}
          </div>
        )}
      </div>
    </div>
  );
}
