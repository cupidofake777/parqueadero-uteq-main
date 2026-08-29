import React, { useEffect, useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CFormCheck,
  CFormLabel,
  CFormFeedback,
  CButton,
  CSpinner,
  CRow,
  CCol,
  CAlert,
} from '@coreui/react'
import { TIPOS_VEHICULO, VEHICULO_VACIO, validarVehiculo, normalizarVehiculo } from './vehiculo.utils'

/**
 * Modal de alta/edición de un vehículo y su propietario.
 *
 * - modo === 'crear'  -> formulario vacío, inserta un registro nuevo.
 * - modo === 'editar' -> formulario precargado con `vehiculoInicial`,
 *   guarda los cambios sobre el mismo id.
 */
export default function VehiculoFormModal({
  visible,
  modo,
  vehiculoInicial,
  guardando,
  onClose,
  onGuardar,
}) {
  const [valores, setValores] = useState(VEHICULO_VACIO)
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState(null)
  const [intentoEnviar, setIntentoEnviar] = useState(false)

  useEffect(() => {
    if (!visible) return
    setErrores({})
    setErrorServidor(null)
    setIntentoEnviar(false)
    setValores(
      modo === 'editar' && vehiculoInicial
        ? {
            placa: vehiculoInicial.placa ?? '',
            marca: vehiculoInicial.marca ?? '',
            modelo: vehiculoInicial.modelo ?? '',
            anio: vehiculoInicial.anio ?? new Date().getFullYear(),
            color: vehiculoInicial.color ?? '',
            tipo: vehiculoInicial.tipo ?? 'AUTOMOVIL',
            foto_url: vehiculoInicial.foto_url ?? '',
            foto_fuente_url: vehiculoInicial.foto_fuente_url ?? '',
            foto_propietario_url: vehiculoInicial.foto_propietario_url ?? '',
            cedula_propietario: vehiculoInicial.cedula_propietario ?? '',
            propietario_nombre: vehiculoInicial.propietario_nombre ?? '',
            correo_institucional: vehiculoInicial.correo_institucional ?? '',
            correo_microsoft: vehiculoInicial.correo_microsoft ?? '',
            autorizado: vehiculoInicial.autorizado ?? true,
          }
        : VEHICULO_VACIO,
    )
  }, [visible, modo, vehiculoInicial])

  const actualizarCampo = (campo) => (event) => {
    const valor = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setValores((actual) => ({ ...actual, [campo]: valor }))
  }

  const cerrar = () => {
    if (guardando) return
    onClose()
  }

  const manejarEnvio = async (event) => {
    event.preventDefault()
    setIntentoEnviar(true)
    setErrorServidor(null)

    const erroresValidacion = validarVehiculo(valores)
    setErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) {
      return
    }

    const payload = normalizarVehiculo(valores)
    const resultado = await onGuardar(payload)

    if (!resultado?.ok) {
      setErrorServidor(resultado?.error || 'No se pudo guardar el registro.')
    }
  }

  const invalido = (campo) => intentoEnviar && Boolean(errores[campo])

  return (
    <CModal visible={visible} onClose={cerrar} backdrop="static" size="lg" alignment="center">
      <CForm noValidate onSubmit={manejarEnvio}>
        <CModalHeader>
          <CModalTitle>
            {modo === 'editar' ? 'Editar vehículo y propietario' : 'Agregar vehículo y propietario'}
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          {errorServidor && (
            <CAlert color="danger" className="py-2">
              {errorServidor}
            </CAlert>
          )}

          <h6 className="text-body-secondary text-uppercase small mb-3">Datos del vehículo</h6>
          <CRow className="g-3 mb-4">
            <CCol md={4}>
              <CFormLabel htmlFor="placa">Placa *</CFormLabel>
              <CFormInput
                id="placa"
                placeholder="AAA-1234"
                value={valores.placa}
                onChange={actualizarCampo('placa')}
                invalid={invalido('placa')}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.placa}</CFormFeedback>
            </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="marca">Marca *</CFormLabel>
              <CFormInput
                id="marca"
                value={valores.marca}
                onChange={actualizarCampo('marca')}
                invalid={invalido('marca')}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.marca}</CFormFeedback>
            </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="modelo">Modelo *</CFormLabel>
              <CFormInput
                id="modelo"
                value={valores.modelo}
                onChange={actualizarCampo('modelo')}
                invalid={invalido('modelo')}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.modelo}</CFormFeedback>
            </CCol>

            <CCol md={3}>
              <CFormLabel htmlFor="anio">Año *</CFormLabel>
              <CFormInput
                id="anio"
                type="number"
                min={1990}
                max={2035}
                value={valores.anio}
                onChange={actualizarCampo('anio')}
                invalid={invalido('anio')}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.anio}</CFormFeedback>
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="color">Color *</CFormLabel>
              <CFormInput
                id="color"
                value={valores.color}
                onChange={actualizarCampo('color')}
                invalid={invalido('color')}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.color}</CFormFeedback>
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="tipo">Tipo *</CFormLabel>
              <CFormSelect
                id="tipo"
                value={valores.tipo}
                onChange={actualizarCampo('tipo')}
                invalid={invalido('tipo')}
                disabled={guardando}
              >
                {TIPOS_VEHICULO.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </CFormSelect>
              <CFormFeedback invalid>{errores.tipo}</CFormFeedback>
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="autorizado">Estado</CFormLabel>
              <div className="pt-2">
                <CFormCheck
                  id="autorizado"
                  label="Autorizado para ingresar"
                  checked={Boolean(valores.autorizado)}
                  onChange={actualizarCampo('autorizado')}
                  disabled={guardando}
                />
              </div>
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="foto_url">URL foto del vehículo *</CFormLabel>
              <CFormInput
                id="foto_url"
                placeholder="https://..."
                value={valores.foto_url}
                onChange={actualizarCampo('foto_url')}
                invalid={invalido('foto_url')}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.foto_url}</CFormFeedback>
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="foto_fuente_url">URL fuente de la foto *</CFormLabel>
              <CFormInput
                id="foto_fuente_url"
                placeholder="https://commons.wikimedia.org/..."
                value={valores.foto_fuente_url}
                onChange={actualizarCampo('foto_fuente_url')}
                invalid={invalido('foto_fuente_url')}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.foto_fuente_url}</CFormFeedback>
            </CCol>
          </CRow>

          <h6 className="text-body-secondary text-uppercase small mb-3">Datos del propietario</h6>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel htmlFor="propietario_nombre">Nombre completo *</CFormLabel>
              <CFormInput
                id="propietario_nombre"
                value={valores.propietario_nombre}
                onChange={actualizarCampo('propietario_nombre')}
                invalid={invalido('propietario_nombre')}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.propietario_nombre}</CFormFeedback>
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="cedula_propietario">Cédula *</CFormLabel>
              <CFormInput
                id="cedula_propietario"
                placeholder="10 dígitos"
                maxLength={10}
                value={valores.cedula_propietario}
                onChange={actualizarCampo('cedula_propietario')}
                invalid={invalido('cedula_propietario')}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.cedula_propietario}</CFormFeedback>
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="correo_institucional">Correo institucional *</CFormLabel>
              <CFormInput
                id="correo_institucional"
                placeholder="usuario@uteq.edu.ec"
                value={valores.correo_institucional}
                onChange={actualizarCampo('correo_institucional')}
                invalid={invalido('correo_institucional')}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.correo_institucional}</CFormFeedback>
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="correo_microsoft">Correo Microsoft (opcional)</CFormLabel>
              <CFormInput
                id="correo_microsoft"
                placeholder="usuario@msuteq.edu.ec"
                value={valores.correo_microsoft}
                onChange={actualizarCampo('correo_microsoft')}
                invalid={invalido('correo_microsoft')}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.correo_microsoft}</CFormFeedback>
            </CCol>
            <CCol md={12}>
              <CFormLabel htmlFor="foto_propietario_url">URL foto del propietario *</CFormLabel>
              <CFormInput
                id="foto_propietario_url"
                placeholder="https://..."
                value={valores.foto_propietario_url}
                onChange={actualizarCampo('foto_propietario_url')}
                invalid={invalido('foto_propietario_url')}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.foto_propietario_url}</CFormFeedback>
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={cerrar} disabled={guardando}>
            Cancelar
          </CButton>
          <CButton color="success" type="submit" disabled={guardando}>
            {guardando && <CSpinner size="sm" className="me-2" />}
            {modo === 'editar' ? 'Guardar cambios' : 'Registrar vehículo'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}
