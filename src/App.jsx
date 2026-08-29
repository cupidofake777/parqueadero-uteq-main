import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Estacionamiento from './pages/Estacionamiento';
import TopNav from './layout/TopNav';
// import Inicio from './pages/Inicio';
// import DetalleEspacio from './pages/DetalleEspacio';

// Importación diferida (lazy) del panel de administración: React solo
// descarga este código (y los estilos de CoreUI) cuando el usuario
// navega a /parqueadero/vehiculos, sin afectar el simulador Firebase.
const AdminLayout = React.lazy(() => import('./layout/AdminLayout'));
const ListaVehiculos = React.lazy(() => import('./views/parqueadero/ListaVehiculos'));

function CargandoPanel() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#475569',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      Cargando panel de administración...
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TopNav />

      <Routes>
        {/* <Route path="/" element={<Inicio />} /> */}
        <Route path="/estacionamiento" element={<Estacionamiento />} />
        {/* <Route path="/espacios/:id" element={<DetalleEspacio />} /> */}

        {/* Panel de administración CoreUI + Supabase (CRUD de vehículos) */}
        <Route
          path="/parqueadero/vehiculos"
          element={
            <Suspense fallback={<CargandoPanel />}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<CargandoPanel />}>
                <ListaVehiculos />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<Estacionamiento />} /> {/* Redirección temporal */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
