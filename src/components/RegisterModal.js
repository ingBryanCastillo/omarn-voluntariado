import React, { useState } from 'react';
import { registerUser } from '../services/authService';

const overlay = {
  position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
  display:'flex', alignItems:'center', justifyContent:'center', zIndex:50
};
const card = { background:'#1f2937', color:'#fff', padding:20, borderRadius:12, width:380 };

export default function RegisterModal({ open, onClose }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await registerUser({ nombre, email, password });
      setMsg('Usuario creado. ¡Ahora inicia sesión!');
    } catch (err) {
      const txt = err?.response?.data?.mensaje || 'Error al registrar';
      setMsg(txt);
    }
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e)=>e.stopPropagation()}>
        <h3 style={{marginTop:0}}>Crear usuario</h3>
        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input value={nombre} onChange={e=>setNombre(e.target.value)} required
                 style={{width:'100%', padding:8, margin:'6px 0', borderRadius:8, border:'none'}}/>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required
                 style={{width:'100%', padding:8, margin:'6px 0', borderRadius:8, border:'none'}}/>
          <label>Contraseña</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required
                 style={{width:'100%', padding:8, margin:'6px 0', borderRadius:8, border:'none'}}/>
          {msg && <div style={{color:'#a7f3d0', marginTop:6}}>{msg}</div>}
          <div style={{display:'flex', gap:8, marginTop:12}}>
            <button type="button" onClick={onClose} style={{flex:1, padding:8, borderRadius:8}}>Cerrar</button>
            <button type="submit" style={{flex:1, padding:8, borderRadius:8}}>Registrar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
