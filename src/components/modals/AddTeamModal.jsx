import React, { useState } from "react";
import { X } from "lucide-react";
import { C, SERIF, SANS, PALETTE } from "../../utils/constants";
import ModalWrap from "../layout/ModalWrap";
import FField from "../common/FField";

const inputStyle = { 
  width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid ' + C.line, 
  background: C.panelAlt, color: C.ink, fontSize: 13.5, outline: 'none', 
  boxSizing: 'border-box', fontFamily: SANS 
};

export default function AddTeamModal({ member, onAdd, onEdit, onClose, isMobile }) {
  const [name, setName] = useState(member ? member.name : '');
  const [role, setRole] = useState(member ? member.role : '');
  const [initials, setInitials] = useState(member ? member.initials : '');
  const [color, setColor] = useState(member ? member.color : PALETTE[0]);

  const handleSubmit = e => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;
    const data = {
      name, role, initials: initials.trim() || name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      color
    };
    if (member) {
      onEdit({ ...member, ...data });
    } else {
      onAdd({ id: 't_' + Date.now(), ...data });
    }
  };

  return (
    <ModalWrap onClose={onClose} isMobile={isMobile}>
      <div style={{ display:'flex',justifyContent: 'space-between',alignItems:'center',marginBottom:18 }}>
        <h2 style={{ margin:0,fontSize:18,fontFamily:SERIF,color:C.ink }}>{member ? 'Editeaza membru' : 'Membru nou'}</h2>
        <button onClick={onClose} style={{ 
          background:C.lineSoft,border:'none',color:C.inkSoft,width:28,height:28,
          borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' 
        }}>
          <X size={14}/>
        </button>
      </div>
      <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:14 }}>
        <FField label="Nume Complet">
          <input type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="Ex. Dumitru Vicol" style={inputStyle} />
        </FField>
        <FField label="Rol / Specializare">
          <input type="text" value={role} onChange={e=>setRole(e.target.value)} required placeholder="Ex. UI/UX Designer" style={inputStyle} />
        </FField>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
          <FField label="Initiale (Ex. DV)">
            <input type="text" maxLength="2" value={initials} onChange={e=>setInitials(e.target.value)} placeholder="Auto" style={inputStyle} />
          </FField>
          <FField label="Culoare Avatar">
            <div style={{ display: 'flex', gap: 6, paddingTop: 6 }}>
              {PALETTE.map(c => (
                <button type="button" key={c} onClick={() => setColor(c)} style={{
                  width: 22, height: 22, borderRadius: '50%', background: c, 
                  border: color === c ? '2px solid ' + C.ink : 'none', cursor: 'pointer'
                }} />
              ))}
            </div>
          </FField>
        </div>
        <button type="submit" style={{ 
          background:C.ink,color:C.paper,border:'none',padding:'12px',borderRadius:10,
          fontSize:13.5,fontWeight:600,cursor:'pointer',marginTop:8, fontFamily:SANS 
        }}>
          {member ? 'Salveaza' : 'Adauga membru'}
        </button>
      </form>
    </ModalWrap>
  );
}
