import React from 'react'
import { CNavItem } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCarAlt } from '@coreui/icons'

// Regla estricta de la práctica: solo debe existir esta opción funcional
// en el menú lateral del panel de administración. No agregar opciones
// fantasma para sensores, reportes u otras vistas que no se implementaron.
const _nav = [
  {
    component: CNavItem,
    name: 'Vehículos y propietarios',
    to: '/parqueadero/vehiculos',
    icon: <CIcon icon={cilCarAlt} customClassName="nav-icon" />,
  },
]

export default _nav
