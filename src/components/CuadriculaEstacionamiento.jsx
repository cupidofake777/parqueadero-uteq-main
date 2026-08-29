import React from 'react';
import EspacioCard from './EspacioCard';

export default function CuadriculaEstacionamiento({ espacios }) {
  // Qué mostrar si la base de datos aún está vacía
  if (espacios.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px', 
        color: '#94a3b8', 
        backgroundColor: '#1e293b', 
        borderRadius: '12px',
        border: '1px dashed #475569'
      }}>
        <h3 style={{ color: '#cbd5e1' }}>Aún no hay sensores registrados</h3>
        <p>Haz clic en el botón azul "Generar 80 Espacios" para poblar la base de datos.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(4, 1fr)', 
      gap: '15px',
      padding: '25px',
      backgroundColor: '#1e293b', // Fondo oscuro a juego
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
    }}>
      {espacios.map(espacio => (
        <EspacioCard key={espacio.id} espacio={espacio} />
      ))}
    </div>
  );
}