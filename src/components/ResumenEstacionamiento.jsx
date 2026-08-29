import React from 'react';
import { Car, CheckCircle2, AlertCircle, Activity } from 'lucide-react';

export default function ResumenEstacionamiento({ espacios }) {
  const total = espacios.length;
  const libres = espacios.filter(e => e.estado === 'libre').length;
  const ocupados = espacios.filter(e => e.estado === 'ocupado').length;
  const porcentajeDisponible = total > 0 ? ((libres / total) * 100).toFixed(1) : 0;

  const CardItem = ({ title, value, icon, color, bgColor }) => (
    // 👇 Aquí está el cambio: minWidth pasó de '220px' a '180px' 👇
    <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', flex: '1', display: 'flex', alignItems: 'center', gap: '15px', minWidth: '180px' }}>
      <div style={{ backgroundColor: bgColor, padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: '26px', fontWeight: '700', color: color }}>{value}</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
      <CardItem title="Total Espacios" value={total} color="#f8fafc" bgColor="rgba(56, 189, 248, 0.1)" icon={<Car color="#38bdf8" size={24} />} />
      <CardItem title="Espacios Libres" value={libres} color="#10b981" bgColor="rgba(16, 185, 129, 0.1)" icon={<CheckCircle2 color="#10b981" size={24} />} />
      <CardItem title="Ocupados" value={ocupados} color="#f43f5e" bgColor="rgba(244, 63, 94, 0.1)" icon={<AlertCircle color="#f43f5e" size={24} />} />
      <CardItem title="Disponibilidad" value={`${porcentajeDisponible}%`} color="#a855f7" bgColor="rgba(168, 85, 247, 0.1)" icon={<Activity color="#a855f7" size={24} />} />
    </div>
  );
}