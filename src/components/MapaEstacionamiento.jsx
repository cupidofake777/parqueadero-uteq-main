import React from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Importante para que el mapa no se vea roto
import { MapPin } from 'lucide-react';

// Coordenadas extraídas del Bounding box general
const limitesParqueadero = [
  [-1.0122617572453996, -79.4682858877737],
  [-1.0125032549290254, -79.4682998912032],
  [-1.0125709715003960, -79.46748620024898],
  [-1.0123403901396444, -79.46746240847104]
];

// Centro aproximado para enfocar la cámara del mapa
const centro = [-1.012416, -79.467884]; 

export default function MapaEstacionamiento() {
  return (
    <div style={{ 
      marginTop: '40px', 
      backgroundColor: '#1e293b', 
      padding: '25px', 
      borderRadius: '12px', 
      border: '1px solid #334155',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <MapPin color="#38bdf8" size={24} />
        <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '22px' }}>Ubicación Geográfica del Parqueadero</h2>
      </div>
      
      {/* Contenedor del mapa */}
      <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #475569' }}>
        <MapContainer center={centro} zoom={18} style={{ height: '100%', width: '100%', zIndex: 1 }}>
          
          {/* Capa base en modo oscuro (Dark Matter) para combinar con el dashboard */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {/* Polígono que dibuja el área exacta del estacionamiento */}
          <Polygon 
            positions={limitesParqueadero} 
            pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.3, weight: 2 }}
          >
            <Popup>
              <strong>Parqueadero Inteligente UTEQ</strong><br/>
              Área aprox: 2405.74 m²
            </Popup>
          </Polygon>
        </MapContainer>
      </div>
    </div>
  );
}