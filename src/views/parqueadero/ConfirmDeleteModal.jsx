import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CSpinner,
  CAlert,
} from '@coreui/react'

/**
 * Modal de confirmación previo a eliminar un vehículo/propietario.
 * No ejecuta ninguna eliminación por sí solo: siempre requiere que el
 * usuario confirme explícitamente con el botón "Eliminar".
 */
export default function ConfirmDeleteModal({
  visible,
  vehiculo,
  eliminando,
  error,
  onClose,
  onConfirmar,
}) {
  return (
    <CModal visible={visible} onClose={eliminando ? undefined : onClose} alignment="center">
      <CModalHeader>
        <CModalTitle>Confirmar eliminación</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {error && (
          <CAlert color="danger" className="py-2">
            {error}
          </CAlert>
        )}
        {vehiculo && (
          <p className="mb-0">
            ¿Seguro que deseas eliminar el vehículo <strong>{vehiculo.placa}</strong> (
            {vehiculo.marca} {vehiculo.modelo}) registrado a nombre de{' '}
            <strong>{vehiculo.propietario_nombre}</strong>? Esta acción no se puede deshacer.
          </p>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" onClick={onClose} disabled={eliminando}>
          Cancelar
        </CButton>
        <CButton color="danger" onClick={onConfirmar} disabled={eliminando}>
          {eliminando && <CSpinner size="sm" className="me-2" />}
          Eliminar
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
