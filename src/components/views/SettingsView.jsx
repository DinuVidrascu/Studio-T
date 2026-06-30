import React, { useState } from "react";
import { Settings, User, Bell, Shield, Moon, Sun, MonitorSmartphone, UploadCloud, Download, AlertTriangle } from "lucide-react";
import { C, SERIF, SANS } from "../../utils/constants";
import Card from "../common/Card";
import FField from "../common/FField";

function SettingsView({ theme, setTheme, isMobile }) {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Fake state for form
  const [profile, setProfile] = useState({ name: 'Manager Studio', email: 'manager@studio.com', role: 'Admin' });
  const [notifs, setNotifs] = useState({ push: true, email: false, updates: true });

  const TABS = [
    { id: 'profile', icon: User, label: 'Profilul meu' },
    { id: 'appearance', icon: MonitorSmartphone, label: 'Aspect' },
    { id: 'notifications', icon: Bell, label: 'Notificări' },
    { id: 'data', icon: Shield, label: 'Date și Securitate' },
  ];

  return (
    <div className="fade-in-view">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:isMobile?16:24 }}>
        <div>
          <h1 style={{ margin:0, fontSize:isMobile?22:28, fontWeight:600, color:C.ink, fontFamily:SERIF, letterSpacing:'-0.5px' }}>Setări</h1>
          {!isMobile && <p style={{ margin:'6px 0 0', color:C.inkSoft, fontSize:14, fontFamily:SANS }}>Gestionează profilul tău și preferințele aplicației</p>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 24 }}>
        
        {/* Settings Navigation */}
        <div style={{ width: isMobile ? '100%' : 240, flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', overflowX: 'auto', gap: 8, paddingBottom: isMobile ? 8 : 0 }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12,
                background: activeTab === tab.id ? C.panel : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left', flexShrink: 0,
                color: activeTab === tab.id ? C.primary : C.inkSoft,
                boxShadow: activeTab === tab.id ? C.shadowSoft : 'none',
                transition: 'all 0.2s', fontWeight: activeTab === tab.id ? 600 : 500, fontFamily: SANS
              }}>
                <tab.icon size={18} />
                <span style={{ fontSize: 13.5 }}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div style={{ flex: 1 }}>
          <Card style={{ padding: isMobile ? 20 : 32 }}>
            
            {activeTab === 'profile' && (
              <div className="fade-in-view">
                <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 18, color: C.ink, fontFamily: SERIF, fontWeight: 600 }}>Informații Profil</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, fontSize: 28, fontFamily: SERIF, fontWeight: 600 }}>
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <button style={{ background: C.primary, color: C.paper, border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 12, fontFamily: SANS, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <UploadCloud size={14} /> Încarcă fotografie
                    </button>
                    <span style={{ fontSize: 11, color: C.inkFaint, fontFamily: SANS }}>Recomandat: 256x256px, max 2MB.</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                  <FField label="Nume Complet">
                    <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid ' + C.line, background: C.panelAlt, color: C.ink, fontFamily: SANS, outline: 'none' }} />
                  </FField>
                  <FField label="Adresă Email">
                    <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid ' + C.line, background: C.panelAlt, color: C.ink, fontFamily: SANS, outline: 'none' }} />
                  </FField>
                  <FField label="Rol">
                    <input type="text" value={profile.role} disabled style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid ' + C.line, background: C.lineSoft, color: C.inkSoft, fontFamily: SANS, outline: 'none', cursor: 'not-allowed' }} />
                  </FField>
                </div>
                
                <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
                  <button style={{ background: C.ink, color: C.paper, border: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: SANS }}>
                    Salvează modificările
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="fade-in-view">
                <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 18, color: C.ink, fontFamily: SERIF, fontWeight: 600 }}>Aspect și Temă</h2>
                
                <div style={{ marginBottom: 32 }}>
                  <p style={{ margin: '0 0 16px', fontSize: 13, color: C.inkSoft, fontFamily: SANS }}>Alege cum dorești să fie afișată interfața Studio.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                    <div onClick={() => setTheme('light')} style={{ 
                      padding: 20, borderRadius: 12, border: `2px solid ${theme === 'light' ? C.primary : C.line}`, 
                      background: '#F3EFE6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' 
                    }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#221F19', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Sun size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#221F19', fontFamily: SANS }}>Luminos</div>
                        <div style={{ fontSize: 11, color: '#6E695C', fontFamily: SANS }}>Aspect clar și luminos</div>
                      </div>
                    </div>
                    
                    <div onClick={() => setTheme('dark')} style={{ 
                      padding: 20, borderRadius: 12, border: `2px solid ${theme === 'dark' ? C.primary : '#333333'}`, 
                      background: '#121212', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' 
                    }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5F5F5', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                        <Moon size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#F5F5F5', fontFamily: SANS }}>Întunecat</div>
                        <div style={{ fontSize: 11, color: '#B3B3B3', fontFamily: SANS }}>Relaxant pentru ochi</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="fade-in-view">
                <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 18, color: C.ink, fontFamily: SERIF, fontWeight: 600 }}>Preferințe Notificări</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { id: 'push', title: 'Notificări în aplicație', desc: 'Alerte vizuale și mesaje tip pop-up în Studio.' },
                    { id: 'email', title: 'Alerte pe Email', desc: 'Primești rezumate zilnice și alerte pentru deadline-uri depășite.' },
                    { id: 'updates', title: 'Actualizări proiecte', desc: 'Fii notificat când un proiect la care ești alocat își schimbă stadiul.' },
                  ].map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, border: '1px solid ' + C.lineSoft, background: C.panelAlt }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: C.ink, fontFamily: SANS, marginBottom: 4 }}>{item.title}</div>
                        <div style={{ fontSize: 11.5, color: C.inkSoft, fontFamily: SANS }}>{item.desc}</div>
                      </div>
                      <div 
                        onClick={() => setNotifs({ ...notifs, [item.id]: !notifs[item.id] })}
                        style={{ 
                          width: 44, height: 24, borderRadius: 12, background: notifs[item.id] ? C.primary : C.line, 
                          position: 'relative', cursor: 'pointer', transition: 'background 0.3s' 
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2,
                          left: notifs[item.id] ? 22 : 2, transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="fade-in-view">
                <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 18, color: C.ink, fontFamily: SERIF, fontWeight: 600 }}>Date și Securitate</h2>
                
                <div style={{ padding: 20, borderRadius: 12, border: '1px solid ' + C.lineSoft, background: C.panelAlt, marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary }}>
                      <Download size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: C.ink, fontFamily: SANS }}>Exportă Baza de Date</div>
                      <div style={{ fontSize: 11.5, color: C.inkSoft, fontFamily: SANS }}>Descarcă o arhivă completă (JSON/CSV) cu toate proiectele și setările.</div>
                    </div>
                  </div>
                  <button style={{ background: C.panel, color: C.ink, border: '1px solid ' + C.line, padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 12, fontFamily: SANS, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                    Generează Export
                  </button>
                </div>

                <div style={{ padding: 20, borderRadius: 12, border: '1px solid ' + C.coral + '44', background: C.coralSoft, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.coral }}>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: C.coral, fontFamily: SANS }}>Zonă de Pericol</div>
                      <div style={{ fontSize: 11.5, color: C.inkSoft, fontFamily: SANS }}>Aceste acțiuni sunt ireversibile și pot duce la pierderea datelor.</div>
                    </div>
                  </div>
                  <button style={{ background: C.coral, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 12, fontFamily: SANS, cursor: 'pointer', marginTop: 12 }}>
                    Șterge toate datele
                  </button>
                </div>
              </div>
            )}

          </Card>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SettingsView);
