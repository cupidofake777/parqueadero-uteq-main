import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';

export default function EspacioCard({ espacio }) {
  const navigate = useNavigate();

  if (!espacio || !espacio.estado) return null;

  const { id, columna, numero, estado, distanciaDetectada } = espacio;
  const isLibre = estado === 'libre';
  
  // Estilos dinámicos
  const borderColor = isLibre ? '#10b981' : '#f43f5e';
  const bgColor = isLibre ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.1)';
  const borderStyle = isLibre ? 'dashed' : 'solid';

  return (
    <div 
      onClick={() => navigate(`/espacios/${id}`)}
      style={{
        backgroundColor: bgColor,
        border: `2px ${borderStyle} ${borderColor}`,
        borderRadius: '8px',
        padding: '16px 10px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '140px',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 15px -3px rgba(0,0,0,0.3)`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>C{columna}-N{numero}</span>
        <span style={{ fontSize: '11px', color: borderColor, fontWeight: '700', backgroundColor: isLibre ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
          {estado}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isLibre ? (
          <span style={{ color: '#10b981', opacity: 0.5, fontSize: '14px', letterSpacing: '2px' }}>LIBRE</span>
        ) : (
          <Car size={40} color="#f43f5e" fill="#f43f5e" strokeWidth={1.5} />
        )}
      </div>

      <div style={{ width: '100%', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
        <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Sensor: <strong>{distanciaDetectada} cm</strong></span>
      </div>
    </div>
  );
}