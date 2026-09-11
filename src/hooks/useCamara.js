import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hook de manejo de cámara para la vista de Monitoreo de entrada.
 *
 * Expone un <video> (via `videoRef`) que muestra la vista previa en vivo,
 * y funciones para iniciar/detener la cámara y capturar un fotograma como
 * Blob JPEG (listo para enviarse tal cual al endpoint OCR).
 *
 * Usa `facingMode: { ideal: 'environment' }` para preferir la cámara
 * trasera en dispositivos móviles cuando esté disponible, sin fallar en
 * equipos de escritorio que solo tienen una cámara frontal/webcam.
 */
export function useCamara() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [activa, setActiva] = useState(false)
  const [iniciando, setIniciando] = useState(false)
  const [error, setError] = useState(null)

  const detener = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setActiva(false)
  }, [])

  const iniciar = useCallback(async () => {
    setError(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Este navegador no permite acceder a la cámara (getUserMedia no disponible).')
      return
    }

    setIniciando(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setActiva(true)
    } catch (err) {
      if (err?.name === 'NotAllowedError') {
        setError('Permiso de cámara denegado. Habilítalo en la configuración del navegador.')
      } else if (err?.name === 'NotFoundError') {
        setError('No se encontró ninguna cámara disponible en este dispositivo.')
      } else if (err?.name === 'NotReadableError') {
        setError('La cámara está siendo usada por otra aplicación.')
      } else {
        setError('No se pudo iniciar la cámara. Verifica los permisos e inténtalo de nuevo.')
      }
    } finally {
      setIniciando(false)
    }
  }, [])

  /** Captura el fotograma actual del <video> como Blob JPEG. */
  const capturarFoto = useCallback(() => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current
      if (!video || !streamRef.current) {
        reject(new Error('La cámara no está activa.'))
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const contexto = canvas.getContext('2d')
      contexto.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('No se pudo generar la imagen capturada.'))
        },
        'image/jpeg',
        0.92,
      )
    })
  }, [])

  // Libera la cámara automáticamente al desmontar el componente (por
  // ejemplo, al navegar a otra vista del panel).
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return { videoRef, activa, iniciando, error, iniciar, detener, capturarFoto }
}

export default useCamara
