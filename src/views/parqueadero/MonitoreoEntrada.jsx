import React, { useRef, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardText,
  CButton,
  CSpinner,
  CAlert,
  CBadge,
  CFormInput,
  CFormLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCamera,
  cilBan,
  cilCloudUpload,
  cilSearch,
  cilCheckCircle,
  cilWarning,
  cilXCircle,
  cilReload,
} from '@coreui/icons'
import { useCamara } from '../../hooks/useCamara'
import { useDeteccionPlaca } from '../../hooks/useDeteccionPlaca'
import { validarImagen, infoEstado } from './monitoreo.utils'
import './monitoreo.css'

const ICONO_POR_COLOR = {
  success: cilCheckCircle,
  danger: cilXCircle,
  warning: cilWarning,
  secondary: cilWarning,
}

export default function MonitoreoEntrada() {
  const camara = useCamara()
  const { procesando, resultado, errorEnvio, detectarPlaca, reiniciar } = useDeteccionPlaca()

  const [imagenPendiente, setImagenPendiente] = useState(null) // { blob, previewUrl, origen }
  const [errorImagen, setErrorImagen] = useState(null)
  const inputArchivoRef = useRef(null)

  const limpiarPreviaAnterior = () => {
    if (imagenPendiente?.previewUrl) {
      URL.revokeObjectURL(imagenPendiente.previewUrl)
    }
  }

  const establecerImagen = (blob, origen) => {
    limpiarPreviaAnterior()
    setImagenPendiente({ blob, previewUrl: URL.createObjectURL(blob), origen })
    setErrorImagen(null)
    reiniciar()
  }

  const manejarCapturar = async () => {
    try {
      const blob = await camara.capturarFoto()
      establecerImagen(blob, 'camara')
    } catch {
      setErrorImagen('No se pudo capturar la imagen. Verifica que la cámara esté activa.')
    }
  }

  const manejarSeleccionArchivo = (evento) => {
    const archivo = evento.target.files?.[0]
    if (!archivo) return

    const error = validarImagen(archivo)
    if (error) {
      setErrorImagen(error)
      if (inputArchivoRef.current) inputArchivoRef.current.value = ''
      return
    }

    establecerImagen(archivo, 'archivo')
  }

  const manejarDetectar = () => {
    if (imagenPendiente?.blob) {
      detectarPlaca(imagenPendiente.blob)
    }
  }

  const manejarProcesarOtra = () => {
    limpiarPreviaAnterior()
    setImagenPendiente(null)
    setErrorImagen(null)
    if (inputArchivoRef.current) inputArchivoRef.current.value = ''
    reiniciar()
  }

  const info = resultado ? infoEstado(resultado.estado) : null

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div className="admin-page__heading">
          <CIcon icon={cilCamera} className="admin-page__icon" />
          <div>
            <h1 className="admin-page__title">Monitoreo de entrada</h1>
            <p className="admin-page__subtitle">
              Reconocimiento de placas en tiempo real · Cámara o imagen del dispositivo
            </p>
          </div>
        </div>
      </header>

      <div className="monitoreo-grid">
        {/* Columna izquierda: captura */}
        <CCard className="monitoreo-card">
          <CCardBody>
            <CCardText className="text-body-secondary">
              Activa la cámara o selecciona una fotografía del vehículo para detectar su placa.
            </CCardText>

            <div className="monitoreo-video-wrap">
              <video
                ref={camara.videoRef}
                className="monitoreo-video"
                autoPlay
                muted
                playsInline
              />
              {!camara.activa && (
                <div className="monitoreo-video-placeholder">
                  <CIcon icon={cilCamera} size="xxl" />
                  <span>La cámara está apagada</span>
                </div>
              )}
            </div>

            <div className="d-flex flex-wrap gap-2 mt-3">
              {!camara.activa ? (
                <CButton color="primary" onClick={camara.iniciar} disabled={camara.iniciando}>
                  {camara.iniciando ? (
                    <CSpinner size="sm" className="me-2" />
                  ) : (
                    <CIcon icon={cilCamera} className="me-2" />
                  )}
                  Activar cámara
                </CButton>
              ) : (
                <CButton color="secondary" variant="outline" onClick={camara.detener}>
                  <CIcon icon={cilBan} className="me-2" />
                  Detener cámara
                </CButton>
              )}

              <CButton
                color="primary"
                variant="outline"
                onClick={manejarCapturar}
                disabled={!camara.activa}
              >
                <CIcon icon={cilCamera} className="me-2" />
                Capturar foto
              </CButton>
            </div>

            {camara.error && (
              <CAlert color="warning" className="mt-3 mb-0">
                {camara.error}
              </CAlert>
            )}

            <hr className="my-3" />

            <div className="mb-3">
              <CFormLabel htmlFor="monitoreo-archivo">
                O selecciona una imagen JPG/PNG desde tu dispositivo
              </CFormLabel>
              <CFormInput
                id="monitoreo-archivo"
                type="file"
                accept="image/jpeg,image/png"
                ref={inputArchivoRef}
                onChange={manejarSeleccionArchivo}
              />
            </div>

            {errorImagen && (
              <CAlert color="danger" className="mb-3">
                {errorImagen}
              </CAlert>
            )}

            {imagenPendiente && (
              <div className="monitoreo-preview">
                <img src={imagenPendiente.previewUrl} alt="Imagen lista para procesar" />
                <span className="small text-body-secondary">
                  {imagenPendiente.origen === 'camara'
                    ? 'Imagen capturada desde la cámara'
                    : 'Imagen seleccionada del dispositivo'}
                </span>
              </div>
            )}

            <CButton
              color="primary"
              className="mt-3 w-100"
              onClick={manejarDetectar}
              disabled={!imagenPendiente || procesando}
            >
              {procesando ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <CIcon icon={cilSearch} className="me-2" />
                  Detectar placa
                </>
              )}
            </CButton>
          </CCardBody>
        </CCard>

        {/* Columna derecha: resultados */}
        <CCard className="monitoreo-card">
          <CCardBody>
            <h5 className="mb-3">Resultado</h5>

            {!resultado && !errorEnvio && !procesando && (
              <p className="text-body-secondary">
                Aún no se ha procesado ninguna imagen. Captura o selecciona una foto y presiona
                «Detectar placa».
              </p>
            )}

            {procesando && (
              <div className="text-center py-5">
                <CSpinner color="primary" />
                <div className="mt-2 text-body-secondary">
                  Consultando el servicio de reconocimiento...
                </div>
              </div>
            )}

            {errorEnvio && !procesando && (
              <CAlert color="danger" className="d-flex flex-column gap-2">
                <span>{errorEnvio}</span>
                {imagenPendiente && (
                  <CButton color="danger" variant="outline" size="sm" onClick={manejarDetectar}>
                    <CIcon icon={cilReload} className="me-2" />
                    Reintentar
                  </CButton>
                )}
              </CAlert>
            )}

            {resultado && !procesando && (
              <div className="monitoreo-resultado">
                <CBadge color={info.color} className="monitoreo-badge">
                  <CIcon icon={ICONO_POR_COLOR[info.color]} className="me-2" />
                  {info.titulo}
                </CBadge>

                {info.mensaje && <p className="mt-2 mb-3">{info.mensaje}</p>}

                {resultado.imagenMarcadaUrl && (
                  <div className="monitoreo-preview mb-3">
                    <img src={resultado.imagenMarcadaUrl} alt="Vehículo con placa detectada" />
                  </div>
                )}

                <div className="monitoreo-datos">
                  {resultado.placa && (
                    <div>
                      <span className="monitoreo-datos__etiqueta">Placa detectada</span>
                      <span className="monitoreo-datos__valor">{resultado.placa}</span>
                    </div>
                  )}
                  {resultado.confianza !== null && (
                    <div>
                      <span className="monitoreo-datos__etiqueta">Confianza</span>
                      <span className="monitoreo-datos__valor">
                        {resultado.confianza.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                {resultado.estado === 'encontrado' && resultado.vehiculo && (
                  <div className="monitoreo-vehiculo">
                    <div className="monitoreo-vehiculo__bloque">
                      {resultado.vehiculo.fotoUrl && (
                        <img
                          src={resultado.vehiculo.fotoUrl}
                          alt="Vehículo"
                          className="monitoreo-vehiculo__foto"
                        />
                      )}
                      <div className="monitoreo-datos">
                        <div>
                          <span className="monitoreo-datos__etiqueta">Marca</span>
                          <span className="monitoreo-datos__valor">{resultado.vehiculo.marca}</span>
                        </div>
                        <div>
                          <span className="monitoreo-datos__etiqueta">Modelo</span>
                          <span className="monitoreo-datos__valor">{resultado.vehiculo.modelo}</span>
                        </div>
                        <div>
                          <span className="monitoreo-datos__etiqueta">Año</span>
                          <span className="monitoreo-datos__valor">{resultado.vehiculo.anio}</span>
                        </div>
                        <div>
                          <span className="monitoreo-datos__etiqueta">Color / Tipo</span>
                          <span className="monitoreo-datos__valor">
                            {resultado.vehiculo.color} · {resultado.vehiculo.tipo}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="monitoreo-vehiculo__bloque">
                      {resultado.vehiculo.fotoPropietarioUrl && (
                        <img
                          src={resultado.vehiculo.fotoPropietarioUrl}
                          alt="Propietario"
                          className="monitoreo-vehiculo__foto monitoreo-vehiculo__foto--circular"
                        />
                      )}
                      <div className="monitoreo-datos">
                        <div>
                          <span className="monitoreo-datos__etiqueta">Propietario</span>
                          <span className="monitoreo-datos__valor">
                            {resultado.vehiculo.propietarioNombre}
                          </span>
                        </div>
                        <div>
                          <span className="monitoreo-datos__etiqueta">Cédula</span>
                          <span className="monitoreo-datos__valor">
                            {resultado.vehiculo.cedulaEnmascarada}
                          </span>
                        </div>
                        <div>
                          <span className="monitoreo-datos__etiqueta">Autorización</span>
                          <CBadge color={resultado.vehiculo.autorizado ? 'success' : 'secondary'}>
                            {resultado.vehiculo.autorizado ? 'Autorizado' : 'No autorizado'}
                          </CBadge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <CButton color="secondary" variant="outline" className="mt-3" onClick={manejarProcesarOtra}>
                  <CIcon icon={cilCloudUpload} className="me-2" />
                  Procesar otra imagen
                </CButton>
              </div>
            )}
          </CCardBody>
        </CCard>
      </div>
    </div>
  )
}
