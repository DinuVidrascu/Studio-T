import React from "react";
import { LayoutGrid, GanttChartSquare, CalendarDays, Layers, Users, BarChart3, Moon, Sun, Settings, LogOut } from "lucide-react";
import { C, SERIF, SANS } from "../../utils/constants";
import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebase";

const NAV = [
  { id: 'dashboard', Icon: LayoutGrid,       label: 'Acasa'    },
  { id: 'gantt',     Icon: GanttChartSquare, label: 'Timeline' },
  { id: 'calendar',  Icon: CalendarDays,     label: 'Calendar' },
  { id: 'projects',  Icon: Layers,           label: 'Proiecte' },
  { id: 'team',      Icon: Users,            label: 'Echipa'   },
  { id: 'reports',   Icon: BarChart3,        label: 'Rapoarte' },
  { id: 'settings',  Icon: Settings,         label: 'Setări'   },
];

export default function Sidebar({ view, setView, unreadCount = 0, theme, setTheme, user, userRole = 'user' }) {
  const hasCritical = unreadCount > 0;

  const filteredNav = NAV.filter(item => {
    if (userRole !== 'admin') {
      return !['reports', 'settings'].includes(item.id);
    }
    return true;
  });

  return (
    <div className="glass-panel" style={{
      width: 230, minWidth: 230, display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0, flexShrink: 0, padding: '0 14px', zIndex: 10, borderRight: '1px solid ' + C.lineSoft
    }}>
      {/* Logo */}
      <div style={{ padding: '26px 10px 22px', display: 'flex', alignItems: 'center', gap: 11 }}>
        <img src="/LOGO_ts_studio.svg" alt="Logo" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'contain', flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 16, color: C.ink, fontFamily: SERIF }}>Studio</div>
          <div style={{ fontSize: 11, color: C.inkSoft }}>management design</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: 8 }}>
        {filteredNav.map(({ id, Icon, label }) => {
          const active = view === id;
          return (
            <button key={id} onClick={() => setView(id)} style={{
              display: 'flex', alignItems: 'center', gap: 11, width: '100%',
              padding: '11px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
              marginBottom: 3, textAlign: 'left',
              background: active ? C.panel : 'transparent',
              boxShadow: active ? C.shadowSoft : 'none',
              color: active ? C.ink : C.inkSoft,
              fontWeight: active ? 600 : 500,
              fontSize: 14, fontFamily: SANS, transition: 'all 0.15s',
              position: 'relative'
            }}>
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} color={active ? C.primary : C.inkSoft} />
              {label}
              {/* Notification badge on Dashboard */}
              {id === 'dashboard' && hasCritical && (
                <span style={{
                  marginLeft: 'auto',
                  minWidth: 18, height: 18, borderRadius: 9,
                  background: C.coral, color: '#fff',
                  fontSize: 10, fontWeight: 700, fontFamily: SANS,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 5px', lineHeight: 1,
                  animation: 'pulse 2s infinite'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile & Controls */}
      <div style={{
        padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 12,
        borderTop: '1px solid ' + C.line, marginBottom: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Avatar" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: C.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, color: C.paper, flexShrink: 0
            }}>{user ? user.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'TL'}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
              {user ? user.displayName : 'Lider Echipă'}
              {user && (
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4, background: userRole === 'admin' ? C.coralSoft : C.lineSoft, color: userRole === 'admin' ? C.coral : C.inkSoft }}>
                  {userRole}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: C.inkSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user ? user.email : 'Designer'}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Schimbă tema"
            style={{
              background: 'transparent', border: 'none', color: C.inkSoft, cursor: 'pointer',
              padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s', flex: 1
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.panel}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          {user && (
            <button 
              onClick={() => signOut(auth)}
              title="Deconectare"
              style={{
                background: 'transparent', border: 'none', color: C.coral, cursor: 'pointer',
                padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s', flex: 1
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.coralSoft}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
