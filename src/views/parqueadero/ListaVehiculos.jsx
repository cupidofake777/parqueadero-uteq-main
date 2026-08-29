import React, { useRef, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardText,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CButton,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CBadge,
  CAvatar,
  CToaster,
  CToast,
  CToastBody,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilPlus, cilPencil, cilTrash, cilReload, cilCarAlt } from '@coreui/icons'
import { useVehiculos } from '../../hooks/useVehiculos'
import VehiculoFormModal from './VehiculoFormModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'

let toastId = 0

export default function ListaVehiculos() {
  const {
    vehiculos,
    total,
    pagina,
    totalPaginas,
    pageSize,
    cargando,
    errorCarga,
    cambiarBusqueda,
    irAPagina,
    recargar,
    guardando,
    eliminandoId,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo,
  } = useVehiculos()

  const [terminoInput, setTerminoInput] = useState('')
  const debounceRef = useRef(null)

  const [modalForm, setModalForm] = useState({ visible: false, modo: 'crear', vehiculo: null })
  const [modalDelete, setModalDelete] = useState({ visible: false, vehiculo: null, error: null })
  const [toasts, setToasts] = useState([])

  const lanzarToast = (color, mensaje) => {
    const id = ++toastId
    setToasts((actual) => [...actual, { id, color, mensaje }])
    setTimeout(() => {
      setToasts((actual) => actual.filter((t) => t.id !== id))
    }, 4500)
  }

  const manejarBusqueda = (event) => {
    const valor = event.target.value
    setTerminoInput(valor)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => cambiarBusqueda(valor), 350)
  }

  const abrirCrear = () => setModalForm({ visible: true, modo: 'crear', vehiculo: null })
  const abrirEditar = (vehiculo) => setModalForm({ visible: true, modo: 'editar', vehiculo })
  const cerrarForm = () => setModalForm((actual) => ({ ...actual, visible: false }))

  const guardarVehiculo = async (payload) => {
    const resultado =
      modalForm.modo === 'editar'
        ? await actualizarVehiculo(modalForm.vehiculo.id, payload)
        : await crearVehiculo(payload)

    if (resultado.ok) {
      lanzarToast(
        'success',
        modalForm.modo === 'editar'
          ? `Se actualizó el vehículo ${payload.placa}.`
          : `Se registró el vehículo ${payload.placa}.`,
      )
      cerrarForm()
      await recargar()
    }
    return resultado
  }

  const abrirEliminar = (vehiculo) => setModalDelete({ visible: true, vehiculo, error: null })
  const cerrarEliminar = () => setModalDelete({ visible: false, vehiculo: null, error: null })

  const confirmarEliminar = async () => {
    const resultado = await eliminarVehiculo(modalDelete.vehiculo.id)
    if (resultado.ok) {
      lanzarToast('success', `Se eliminó el vehículo ${modalDelete.vehiculo.placa}.`)
      cerrarEliminar()
      await recargar()
    } else {
      setModalDelete((actual) => ({ ...actual, error: resultado.error }))
    }
  }

  const desde = total === 0 ? 0 : (pagina - 1) * pageSize + 1
  const hasta = Math.min(pagina * pageSize, total)

  const paginasVisibles = []
  for (let p = 1; p <= totalPaginas; p += 1) {
    if (p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1) {
      paginasVisibles.push(p)
    } else if (paginasVisibles[paginasVisibles.length - 1] !== '…') {
      paginasVisibles.push('…')
    }
  }

  return (
    <div className="admin-page">
      <CToaster placement="top-end">
        {toasts.map((t) => (
          <CToast key={t.id} autohide visible color={t.color} className="text-white align-items-center">
            <div className="d-flex">
              <CToastBody>{t.mensaje}</CToastBody>
            </div>
          </CToast>
        ))}
      </CToaster>

      <header className="admin-page__header">
        <div className="admin-page__heading">
          <CIcon icon={cilCarAlt} className="admin-page__icon" />
          <div>
            <h1 className="admin-page__title">Vehículos y propietarios</h1>
            <p className="admin-page__subtitle">
              Panel de administración · CRUD sobre Supabase
            </p>
          </div>
        </div>
        <CButton color="primary" onClick={abrirCrear}>
          <CIcon icon={cilPlus} className="me-2" />
          Agregar vehículo
        </CButton>
      </header>

      <CCard className="mb-4">
        <CCardBody>
          <CCardText className="text-body-secondary">
            Administra los vehículos y propietarios autorizados a ingresar al parqueadero de la UTEQ.
          </CCardText>

          <div className="d-flex flex-wrap gap-2 mb-3">
            <CInputGroup style={{ maxWidth: 420 }}>
              <CInputGroupText>
                <CIcon icon={cilSearch} />
              </CInputGroupText>
              <CFormInput
                placeholder="Buscar por placa, marca, propietario o correo..."
                value={terminoInput}
                onChange={manejarBusqueda}
                aria-label="Buscar vehículos"
              />
            </CInputGroup>
            <CButton color="secondary" variant="outline" onClick={recargar} disabled={cargando}>
              <CIcon icon={cilReload} className="me-2" />
              Actualizar
            </CButton>
          </div>

          {errorCarga && (
            <CAlert color="danger" className="d-flex justify-content-between align-items-center">
              <span>{errorCarga}</span>
              <CButton color="danger" variant="outline" size="sm" onClick={recargar}>
                Reintentar
              </CButton>
            </CAlert>
          )}

          <div className="table-responsive">
            <CTable hover align="middle" className="mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Vehículo</CTableHeaderCell>
                  <CTableHeaderCell>Placa</CTableHeaderCell>
                  <CTableHeaderCell className="d-none d-md-table-cell">Año</CTableHeaderCell>
                  <CTableHeaderCell className="d-none d-md-table-cell">Color / Tipo</CTableHeaderCell>
                  <CTableHeaderCell>Propietario</CTableHeaderCell>
                  <CTableHeaderCell className="d-none d-lg-table-cell">Cédula</CTableHeaderCell>
                  <CTableHeaderCell className="d-none d-lg-table-cell">Correo institucional</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {cargando && (
                  <CTableRow>
                    <CTableDataCell colSpan={9} className="text-center py-5">
                      <CSpinner color="success" />
                      <div className="mt-2 text-body-secondary">Cargando vehículos...</div>
                    </CTableDataCell>
                  </CTableRow>
                )}

                {!cargando && !errorCarga && vehiculos.length === 0 && (
                  <CTableRow>
                    <CTableDataCell colSpan={9} className="text-center py-5 text-body-secondary">
                      No se encontraron vehículos para tu búsqueda.
                    </CTableDataCell>
                  </CTableRow>
                )}

                {!cargando &&
                  vehiculos.map((v) => (
                    <CTableRow key={v.id}>
                      <CTableDataCell>
                        <div className="d-flex align-items-center gap-2">
                          <CAvatar src={v.foto_url} size="md" />
                          <div>
                            <div className="fw-semibold">
                              {v.marca} {v.modelo}
                            </div>
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="dark" shape="rounded-pill">
                          {v.placa}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="d-none d-md-table-cell">{v.anio}</CTableDataCell>
                      <CTableDataCell className="d-none d-md-table-cell">
                        {v.color} · {v.tipo}
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex align-items-center gap-2">
                          <CAvatar src={v.foto_propietario_url} size="md" shape="rounded-circle" />
                          <div>
                            <div className="fw-semibold">{v.propietario_nombre}</div>
                            <div className="small text-body-secondary d-lg-none">
                              {v.correo_institucional}
                            </div>
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="d-none d-lg-table-cell">
                        {v.cedula_enmascarada}
                      </CTableDataCell>
                      <CTableDataCell className="d-none d-lg-table-cell">
                        {v.correo_institucional}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={v.autorizado ? 'success' : 'secondary'}>
                          {v.autorizado ? 'Autorizado' : 'No autorizado'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        <CTooltip content="Editar">
                          <CButton
                            color="primary"
                            variant="ghost"
                            size="sm"
                            className="me-1"
                            onClick={() => abrirEditar(v)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                        </CTooltip>
                        <CTooltip content="Eliminar">
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirEliminar(v)}
                            disabled={eliminandoId === v.id}
                          >
                            {eliminandoId === v.id ? <CSpinner size="sm" /> : <CIcon icon={cilTrash} />}
                          </CButton>
                        </CTooltip>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
              </CTableBody>
            </CTable>
          </div>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
            <div className="small text-body-secondary">
              {total > 0
                ? `Mostrando ${desde}-${hasta} de ${total} vehículos`
                : 'Sin resultados'}
            </div>
            <CPagination aria-label="Paginación de vehículos">
              <CPaginationItem
                disabled={pagina <= 1}
                onClick={() => irAPagina(pagina - 1)}
                style={{ cursor: pagina <= 1 ? 'default' : 'pointer' }}
              >
                Anterior
              </CPaginationItem>
              {paginasVisibles.map((p, idx) =>
                p === '…' ? (
                  <CPaginationItem key={`ellipsis-${idx}`} disabled>
                    …
                  </CPaginationItem>
                ) : (
                  <CPaginationItem
                    key={p}
                    active={p === pagina}
                    onClick={() => irAPagina(p)}
                    style={{ cursor: 'pointer' }}
                  >
                    {p}
                  </CPaginationItem>
                ),
              )}
              <CPaginationItem
                disabled={pagina >= totalPaginas}
                onClick={() => irAPagina(pagina + 1)}
                style={{ cursor: pagina >= totalPaginas ? 'default' : 'pointer' }}
              >
                Siguiente
              </CPaginationItem>
            </CPagination>
          </div>
        </CCardBody>
      </CCard>

      <VehiculoFormModal
        visible={modalForm.visible}
        modo={modalForm.modo}
        vehiculoInicial={modalForm.vehiculo}
        guardando={guardando}
        onClose={cerrarForm}
        onGuardar={guardarVehiculo}
      />

      <ConfirmDeleteModal
        visible={modalDelete.visible}
        vehiculo={modalDelete.vehiculo}
        eliminando={eliminandoId === modalDelete.vehiculo?.id}
        error={modalDelete.error}
        onClose={cerrarEliminar}
        onConfirmar={confirmarEliminar}
      />
    </div>
  )
}
