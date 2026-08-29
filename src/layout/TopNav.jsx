import React from 'react'
import { NavLink } from 'react-router-dom'
import Logo from '../assets/Logo'
import _navVehiculos from './nav'
import './top-nav.css'

// Barra de navegación compartida por todo el sistema (simulador +
// panel de administración), para que ambos módulos se sientan parte
// de la misma aplicación en lugar de dos interfaces distintas pegadas
// con cinta adhesiva.
const LINKS = [
  { to: '/estacionamiento', label: 'Dashboard' },
  // El enlace al panel de vehículos viene de layout/nav.js: es la misma
  // fuente que usaría un _nav.jsx de CoreUI, solo que aquí alimenta la
  // barra superior en vez de un sidebar.
  ..._navVehiculos.map((item) => ({ to: item.to, label: item.name })),
]

export default function TopNav() {
  return (
    <header className="app-topnav">
      <div className="app-topnav__inner">
        <NavLink to="/estacionamiento" className="app-topnav__brand" aria-label="Smart Parking UTEQ">
          <Logo width={168} height={33} />
        </NavLink>
        <nav className="app-topnav__links" aria-label="Navegación principal">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                'app-topnav__link' + (isActive ? ' app-topnav__link--active' : '')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
