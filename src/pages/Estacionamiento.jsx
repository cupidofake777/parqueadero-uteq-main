import React, { useState } from 'react';
import MapaEstacionamiento from '../components/MapaEstacionamiento';
import { useEspacios } from '../hooks/useEspacios';
import ResumenEstacionamiento from '../components/ResumenEstacionamiento';
import CuadriculaEstacionamiento from '../components/CuadriculaEstacionamiento';
import { inicializarParqueadero, iniciarSimulacion } from '../services/simulador';
import { LayoutDashboard, Play, RefreshCw, Filter } from 'lucide-react';

export default function Estacionamiento() {
  const { espacios, loading } = useEspacios();
  const [filtroColumna, setFiltroColumna] = useState('todas');

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', color: '#38bdf8' }}>
      <h2>Conectando con los sensores...</h2>
    </div>
  );

  const espaciosFiltrados = filtroColumna === 'todas' 
    ? espacios 
    : espacios.filter(e => e.columna === parseInt(filtroColumna));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '30px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Cabecera del Dashboard */}
        <header style={{ borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LayoutDashboard size={28} color="#38bdf8" />
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>Smart Parking UTEQ</h1>
            </div>
            <p style={{ margin: '5px 0 0 38px', color: '#94a3b8', fontSize: '14px' }}>Sistema de Telemetría IoT en Tiempo Real</p>
          </div>

          {/* Botones de Control Integrados */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={inicializarParqueadero} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <RefreshCw size={16} color="#94a3b8" />
              Generar Cuadrícula
            </button>
            <button onClick={iniciarSimulacion} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)' }}>
              <Play size={16} fill="currentColor" />
              Iniciar Simulación
            </button>
          </div>
        </header>
        
        <ResumenEstacionamiento espacios={espacios} />

        {/* Barra de Filtros */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', backgroundColor: '#1e293b', padding: '15px 20px', borderRadius: '10px', border: '1px solid #334155' }}>
          <Filter size={18} color="#94a3b8" />
          <label style={{ color: '#cbd5e1', fontWeight: '500' }}>Filtro de visualización:</label>
          <select 
            value={filtroColumna} 
            onChange={(e) => setFiltroColumna(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#f8fafc', border: '1px solid #475569', outline: 'none', cursor: 'pointer' }}
          >
            <option value="todas">Mostrar todas las columnas</option>
            <option value="1">Zona 1 (Columna 1)</option>
            <option value="2">Zona 2 (Columna 2)</option>
            <option value="3">Zona 3 (Columna 3)</option>
            <option value="4">Zona 4 (Columna 4)</option>
          </select>
        </div>

        {/* 👇 AQUÍ ESTÁ LA LÍNEA QUE FALTABA 👇 */}
        <CuadriculaEstacionamiento espacios={espaciosFiltrados} />

        {/* Mapa al final */}
        <MapaEstacionamiento />
        
      </div>
    </div>
  );
}