import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

// Hoja de estilos de CoreUI cargada solo cuando se entra al panel de
// administración (esta vista se importa de forma diferida desde
// App.jsx), para no afectar el resto del simulador con clases globales
// de Bootstrap/CoreUI.
import '@coreui/coreui/dist/css/coreui.min.css'
import './admin-layout.css'

export default function AdminLayout() {
  // El tema oscuro de CoreUI se activa con el atributo data-coreui-theme.
  // Se aplica en <html> (no solo en este contenedor) porque los CModal /
  // CToaster de CoreUI se "teletransportan" (portal) a document.body, por
  // fuera del árbol de este componente; si el atributo solo estuviera en
  // el div local, los modales se verían en tema claro.
  useEffect(() => {
    document.documentElement.setAttribute('data-coreui-theme', 'dark')
    return () => document.documentElement.removeAttribute('data-coreui-theme')
  }, [])

  return (
    <div className="admin-shell">
      <Outlet />
    </div>
  )
}
