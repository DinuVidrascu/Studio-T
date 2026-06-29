import React, { useState, useEffect, useRef } from "react";
import { Bell, Clock, AlertTriangle, Edit3, CheckSquare, Target, XCircle } from "lucide-react";
import { C, SERIF, SANS } from "../../utils/constants";
import { fmtDate } from "../../utils/helpers";

const TYPE_CONFIG = {
  deadline:   { Icon: Clock,          label: 'Deadline aproape', color: C.amber },
  overdue:    { Icon: XCircle,        label: 'Deadline depășit', color: C.coral },
  milestone:  { Icon: Target,         label: 'Milestone depășit',color: C.coral },
  task:       { Icon: CheckSquare,    label: 'Task depășit',     color: C.amber },
  allocation: { Icon: AlertTriangle,  label: 'Supraalocare',     color: C.amber },
  update:     { Icon: Edit3,          label: 'Actualizare',      color: C.primary },
  calendar:   { Icon: Clock,          label: 'Calendar',         color: C.primary },
};

const AUTO_CLOSE_MS = 10000;

export default function NotificationsBell({ notifications, setNotifications, isMobile }) {
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const autoCloseRef = useRef(null);
  const intervalRef = useRef(null);
  const hasAutoOpened = useRef(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => !n.read && (n.severity === 'critical' || n.type === 'overdue')).length;

  // Auto-open for 10s if there are unread notifications
  useEffect(() => {
    if (hasAutoOpened.current || unreadCount === 0) return;
    hasAutoOpened.current = true;

    setOpen(true);
    setCountdown(100);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / AUTO_CLOSE_MS) * 100);
      setCountdown(remaining);
    }, 50);

    autoCloseRef.current = setTimeout(() => {
      setOpen(false);
      setCountdown(0);
      clearInterval(intervalRef.current);
    }, AUTO_CLOSE_MS);

    return () => {
      clearTimeout(autoCloseRef.current);
      clearInterval(intervalRef.current);
    };
  }, [unreadCount]);

  const cancelAutoClose = () => {
    clearTimeout(autoCloseRef.current);
    clearInterval(intervalRef.current);
    setCountdown(0);
  };

  const handleBellClick = () => {
    cancelAutoClose();
    setOpen(prev => !prev);
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markAsRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const clearAll = () => { setNotifications([]); setOpen(false); };

  const sortedNotifs = notifications.slice().sort((a, b) => {
    const aScore = (a.severity === 'critical' || a.type === 'overdue') ? 1 : 0;
    const bScore = (b.severity === 'critical' || b.type === 'overdue') ? 1 : 0;
    if (bScore !== aScore) return bScore - aScore;
    return b.time - a.time;
  });

  const bellColor = criticalCount > 0 ? C.coral : unreadCount > 0 ? C.amber : C.ink;
  const badgeBg   = criticalCount > 0 ? C.coral : C.amber;
  const secondsLeft = Math.ceil(countdown / 10);

  return (
    <div style={{ position: 'fixed', top: isMobile ? 18 : 28, right: isMobile ? 64 : 40, zIndex: 200 }}>
      <button
        onClick={handleBellClick}
        style={{
          width: 40, height: 40, borderRadius: '50%', background: C.panel, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          boxShadow: C.shadowSoft, position: 'relative', transition: 'all 0.15s',
          outline: countdown > 0 ? `2px solid ${C.amber}60` : 'none',
        }}
      >
        <Bell size={18} color={bellColor} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: -2, right: -2,
            minWidth: 17, height: 17, borderRadius: 9,
            background: badgeBg, border: '2px solid ' + C.panel,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: '#fff', fontFamily: SANS, padding: '0 3px',
            animation: criticalCount > 0 ? 'pulse 2s infinite' : 'none'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => { cancelAutoClose(); setOpen(false); }} />
          <div
            onClick={cancelAutoClose}
            style={{
              position: 'absolute', top: 48, right: 0,
              width: isMobile ? 300 : 360,
              background: C.panel, borderRadius: 16,
              boxShadow: '0 8px 40px rgba(34,31,25,0.14)',
              zIndex: 200, overflow: 'hidden',
              border: '1px solid ' + C.lineSoft,
              animation: 'scaleUpModal 0.2s cubic-bezier(0.34,1.56,0.64,1)'
            }}>

            {/* Countdown progress bar */}
            {countdown > 0 && (
              <div style={{ height: 3, background: C.lineSoft, position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, height: '100%',
                  width: countdown + '%',
                  background: `linear-gradient(90deg, ${C.amber}, ${C.primary})`,
                  transition: 'width 0.05s linear',
                }} />
              </div>
            )}

            {/* Header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid ' + C.lineSoft, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: C.ink, fontFamily: SERIF }}>Notificări</span>
                {unreadCount > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.coral, background: C.coralSoft, borderRadius: 8, padding: '2px 7px', fontFamily: SANS }}>
                    {unreadCount} noi
                  </span>
                )}
                {countdown > 0 && (
                  <span style={{ fontSize: 10, color: C.inkFaint, fontFamily: SANS }}>· {secondsLeft}s</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'transparent', border: 'none', color: C.primary, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: SANS }}>
                    Citește toate
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAll} style={{ background: 'transparent', border: 'none', color: C.inkFaint, fontSize: 11, cursor: 'pointer', fontFamily: SANS }}>
                    Șterge tot
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {sortedNotifs.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center' }}>
                  <Bell size={28} color={C.lineSoft} />
                  <div style={{ color: C.inkFaint, fontSize: 13, fontFamily: SANS, marginTop: 10 }}>Nicio notificare</div>
                </div>
              ) : (
                sortedNotifs.map(n => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.update;
                  const { Icon } = cfg;
                  const isCritical = n.severity === 'critical' || n.type === 'overdue';
                  return (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      style={{
                        padding: '11px 16px', display: 'flex', gap: 11, alignItems: 'flex-start',
                        borderBottom: '1px solid ' + C.lineSoft, cursor: 'pointer',
                        background: n.read ? 'transparent' : isCritical ? C.coral + '08' : C.amber + '08',
                        transition: 'background 0.2s',
                        borderLeft: n.read ? 'none' : `3px solid ${isCritical ? C.coral : C.amber}`,
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: isCritical ? C.coralSoft : cfg.color + '18',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1
                      }}>
                        <Icon size={13} color={isCritical ? C.coral : cfg.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: isCritical ? C.coral : cfg.color, fontFamily: SANS, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 2 }}>
                          {cfg.label}
                        </div>
                        <div style={{ fontSize: 12.5, color: C.ink, fontWeight: n.read ? 400 : 600, fontFamily: SANS, lineHeight: 1.4 }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: 10, color: C.inkFaint, marginTop: 4, fontFamily: SANS }}>
                          {new Date(n.time).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })} • {fmtDate(new Date(n.time).toISOString().split('T')[0])}
                        </div>
                      </div>
                      {!n.read && (
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: isCritical ? C.coral : C.amber, flexShrink: 0, marginTop: 8 }} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
