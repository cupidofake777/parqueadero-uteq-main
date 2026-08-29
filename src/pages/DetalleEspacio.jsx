import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHistorialEspacio } from '../hooks/useHistorialEspacio';
import { ArrowLeft, MapPin, Activity, Clock, Box } from 'lucide-react';

export default function DetalleEspacio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { espacio, historial, loading } = useHistorialEspacio(id);

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', color: '#38bdf8' }}>Cargando detalles del sensor...</div>;
  if (!espacio) return <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>Espacio no encontrado</div>;

  const isLibre = espacio.estado === 'libre';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '30px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Cabecera y Botón de Regreso */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}>
          <ArrowLeft size={18} />
          Volver al Dashboard
        </button>

        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#38bdf8' }}>Detalle del Sensor: {id}</h1>
            <p style={{ margin: '5px 0 0 0', color: '#94a3b8' }}>Columna {espacio.columna} | Número {espacio.numero}</p>
          </div>
          <div style={{ backgroundColor: isLibre ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', border: `1px solid ${isLibre ? '#10b981' : '#f43f5e'}`, padding: '10px 20px', borderRadius: '8px', color: isLibre ? '#10b981' : '#f43f5e', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Estado Actual: {espacio.estado}
          </div>
        </header>

        {/* Tarjetas de Información del Espacio */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#94a3b8' }}><Activity size={20} /> <h3 style={{ margin: 0 }}>Telemetría Actual</h3></div>
            <p style={{ margin: '0 0 10px 0', fontSize: '15px' }}>Distancia detectada: <strong style={{ color: '#f8fafc', fontSize: '20px' }}>{espacio.distanciaDetectada} cm</strong></p>
            <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>Última actualización: {new Date(espacio.fechaHora).toLocaleString('es-EC')}</p>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#94a3b8' }}><MapPin size={20} /> <h3 style={{ margin: 0 }}>Ubicación Geográfica</h3></div>
            <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>Latitud: <span style={{ color: '#cbd5e1' }}>{espacio.ubicacion.latitud}</span></p>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Longitud: <span style={{ color: '#cbd5e1' }}>{espacio.ubicacion.longitud}</span></p>
            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
              <Box size={14} style={{ marginTop: '2px' }} />
              <span>Bounding Box: <br/>N: {espacio.ubicacion.boundingBox.norte} | S: {espacio.ubicacion.boundingBox.sur}</span>
            </div>
          </div>
        </div>

        {/* Tabla de Historial */}
        <h2 style={{ fontSize: '20px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={20} color="#38bdf8" /> Registro Histórico</h2>
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155' }}>
              <tr>
                <th style={{ padding: '15px', color: '#94a3b8', fontWeight: '500' }}>Fecha y Hora</th>
                <th style={{ padding: '15px', color: '#94a3b8', fontWeight: '500' }}>Distancia (cm)</th>
                <th style={{ padding: '15px', color: '#94a3b8', fontWeight: '500' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((registro, index) => (
                <tr key={index} style={{ borderBottom: index !== historial.length - 1 ? '1px solid #334155' : 'none' }}>
                  <td style={{ padding: '15px', fontSize: '14px' }}>{new Date(registro.fechaHora).toLocaleString('es-EC')}</td>
                  <td style={{ padding: '15px', fontSize: '14px' }}>{registro.distanciaDetectada}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ backgroundColor: registro.estado === 'libre' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', color: registro.estado === 'libre' ? '#10b981' : '#f43f5e', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {registro.estado}
                    </span>
                  </td>
                </tr>
              ))}
              {historial.length === 0 && (
                <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No hay registros en el historial todavía.</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}