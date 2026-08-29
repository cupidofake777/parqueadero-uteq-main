import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowRight } from 'lucide-react';

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '20px', textAlign: 'center' }}>
      <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
        <LayoutDashboard size={60} color="#38bdf8" />
      </div>
      <h1 style={{ fontSize: '48px', margin: '0 0 20px 0' }}>Smart Parking UTEQ</h1>
      <p style={{ maxWidth: '600px', fontSize: '18px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '40px' }}>
        Plataforma web de simulación IoT para el monitoreo en tiempo real del estado de ocupación de 80 espacios de estacionamiento. Desarrollado con React y sincronizado mediante Firebase Realtime Database.
      </p>
      <button 
        onClick={() => navigate('/estacionamiento')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 30px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Ingresar al Monitor <ArrowRight size={20} />
      </button>
    </div>
  );
}