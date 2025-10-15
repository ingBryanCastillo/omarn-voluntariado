import React, { useState } from 'react';
import { login, saveSession } from '../services/authService';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50
};
const cardStyle = {
  background: '#1f2937',
  color: '#fff',
  padding: 20,
  borderRadius: 12,
  width: 360
};

export default function LoginModal({ open, onClose, onLogged }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const response = await login(email, password);
      if (response.token) {
        saveSession(response.token);
        onLogged?.();
        onClose?.();
      }
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Iniciar sesión</h3>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            required
            style={{ width: '100%', padding: 8, margin: '6px 0', borderRadius: 8, border: 'none' }}
          />
          <label>Contraseña</label>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            required
            style={{ width: '100%', padding: 8, margin: '6px 0', borderRadius: 8, border: 'none' }}
          />
          {msg && <div style={{ color: '#fda4af', marginTop: 6 }}>{msg}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 8, borderRadius: 8 }}>Cancelar</button>
            <button type="submit" style={{ flex: 1, padding: 8, borderRadius: 8 }}>Entrar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
