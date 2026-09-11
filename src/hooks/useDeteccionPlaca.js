import { useCallback, useState } from 'react'
import { validarImagen, mensajeErrorHttp, normalizarResultado } from '../views/parqueadero/monitoreo.utils'

const OCR_ENDPOINT = import.meta.env.VITE_OCR_ENDPOINT

/**
 * Hook de consumo del endpoint REST de reconocimiento de placas.
 *
 * IMPORTANTE: la URL (con su código de acceso) vive únicamente en la
 * variable de entorno VITE_OCR_ENDPOINT (.env.local en desarrollo, y un
 * secreto de GitHub Actions en producción). Nunca se escribe aquí de
 * forma literal.
 */
export function useDeteccionPlaca() {
  const [procesando, setProcesando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [errorEnvio, setErrorEnvio] = useState(null)

  const reiniciar = useCallback(() => {
    setResultado(null)
    setErrorEnvio(null)
  }, [])

  const detectarPlaca = useCallback(async (archivo) => {
    const errorValidacion = validarImagen(archivo)
    if (errorValidacion) {
      setErrorEnvio(errorValidacion)
      return { ok: false, error: errorValidacion }
    }

    if (!OCR_ENDPOINT) {
      const msg =
        'Falta configurar VITE_OCR_ENDPOINT (revisa tu archivo .env.local o el secreto de GitHub Actions).'
      setErrorEnvio(msg)
      return { ok: false, error: msg }
    }

    setProcesando(true)
    setErrorEnvio(null)
    setResultado(null)

    try {
      const response = await fetch(OCR_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': archivo.type || 'application/octet-stream',
        },
        body: archivo,
      })

      if (!response.ok) {
        const mensaje = mensajeErrorHttp(response.status)
        setErrorEnvio(mensaje)
        return { ok: false, error: mensaje, status: response.status }
      }

      const data = await response.json()
      // Se deja disponible en consola para depurar la forma exacta del
      // JSON la primera vez que se prueba contra el endpoint real.
      console.debug('[useDeteccionPlaca] respuesta del endpoint OCR:', data)

      const normalizado = normalizarResultado(data)
      setResultado(normalizado)
      return { ok: true, data: normalizado }
    } catch (err) {
      const msg =
        'No se pudo conectar con el servicio de reconocimiento. Verifica tu conexión e inténtalo de nuevo.'
      setErrorEnvio(msg)
      return { ok: false, error: msg, excepcion: err }
    } finally {
      setProcesando(false)
    }
  }, [])

  return { procesando, resultado, errorEnvio, detectarPlaca, reiniciar }
}

export default useDeteccionPlaca
