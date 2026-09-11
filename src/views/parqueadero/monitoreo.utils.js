// Validaciones y utilidades de la vista "Monitoreo de entrada".

export const TIPOS_IMAGEN_PERMITIDOS = ['image/jpeg', 'image/png']
export const TAMANIO_MAXIMO_BYTES = 4 * 1024 * 1024 // 4 MiB (límite del endpoint OCR)

/**
 * Valida un archivo/Blob de imagen antes de enviarlo al endpoint OCR.
 * Devuelve un mensaje de error en español, o null si es válido.
 */
export function validarImagen(archivo) {
  if (!archivo) return 'Selecciona o captura una imagen primero.'

  if (!TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
    return 'Formato no admitido. Usa una imagen JPG o PNG.'
  }

  if (archivo.size > TAMANIO_MAXIMO_BYTES) {
    return 'La imagen supera el tamaño máximo permitido (4 MiB).'
  }

  if (archivo.size === 0) {
    return 'La imagen está vacía o dañada.'
  }

  return null
}

// Mensajes para los códigos de error HTTP documentados por el endpoint.
export const MENSAJES_ERROR_HTTP = {
  400: 'La imagen está vacía, no es válida o tiene dimensiones no permitidas.',
  413: 'La imagen supera el tamaño máximo permitido (4 MiB).',
  415: 'Formato de imagen no admitido. Usa JPG o PNG.',
  502: 'Falló el servicio de reconocimiento (OCR) o la consulta a Supabase. Intenta nuevamente.',
  504: 'Se agotó el tiempo de espera del servicio. Intenta nuevamente.',
}

export function mensajeErrorHttp(status) {
  return (
    MENSAJES_ERROR_HTTP[status] ||
    `Ocurrió un error al comunicarse con el servicio de reconocimiento (código ${status}).`
  )
}

// Descripción visual por cada valor posible de "estado" en la respuesta.
export const ESTADOS_RESULTADO = {
  encontrado: {
    color: 'success',
    titulo: 'Vehículo encontrado',
  },
  no_registrado: {
    color: 'danger',
    titulo: 'VEHÍCULO NO REGISTRADO',
    mensaje: 'No se autoriza el ingreso: la placa no existe en la base de datos de Supabase.',
  },
  sin_placa: {
    color: 'warning',
    titulo: 'No se detectó ninguna placa',
    mensaje: 'Intenta capturar la imagen más de cerca, con mejor luz y sin obstrucciones.',
  },
  baja_confianza: {
    color: 'warning',
    titulo: 'Confianza de reconocimiento baja',
    mensaje: 'La imagen no es lo suficientemente clara. Vuelve a capturarla o selecciona otra.',
  },
  multiples_placas: {
    color: 'warning',
    titulo: 'Se detectaron múltiples placas',
    mensaje: 'Captura un solo vehículo a la vez para poder identificarlo correctamente.',
  },
}

export function infoEstado(estado) {
  return (
    ESTADOS_RESULTADO[estado] || {
      color: 'secondary',
      titulo: estado ? `Estado no reconocido: ${estado}` : 'Respuesta inesperada del servicio',
      mensaje: 'El servicio devolvió un estado que esta vista todavía no contempla.',
    }
  )
}

/**
 * Lee un valor de un objeto probando varias claves posibles, sin romper
 * si el endpoint usa un nombre de campo ligeramente distinto al esperado.
 */
function leer(obj, claves) {
  if (!obj) return undefined
  for (const clave of claves) {
    if (obj[clave] !== undefined && obj[clave] !== null) return obj[clave]
  }
  return undefined
}

/**
 * Normaliza la respuesta del endpoint OCR a una forma estable para la UI,
 * tolerando pequeñas variaciones en los nombres de campo (placa/confianza
 * a veces vienen en el nivel raíz, a veces dentro de "vehiculo").
 */
export function normalizarResultado(data) {
  const vehiculo = data?.vehiculo || null

  const placa = leer(data, ['placa', 'placa_detectada', 'plate']) ?? leer(vehiculo, ['placa'])
  const confianzaRaw = leer(data, ['confianza', 'confidence', 'ocr_confianza'])
  const confianza =
    typeof confianzaRaw === 'number'
      ? confianzaRaw <= 1
        ? confianzaRaw * 100
        : confianzaRaw
      : null

  const imagenMarcadaObj = data?.imagen_marcada || null
  const imagenMarcadaUrl =
    imagenMarcadaObj?.base64 && imagenMarcadaObj?.mime_type
      ? `data:${imagenMarcadaObj.mime_type};base64,${imagenMarcadaObj.base64}`
      : null

  return {
    estado: data?.estado ?? null,
    vehiculoEncontrado: Boolean(data?.vehiculo_encontrado),
    placa: placa ?? null,
    confianza,
    imagenMarcadaUrl,
    vehiculo: vehiculo
      ? {
          marca: leer(vehiculo, ['marca']) ?? '—',
          modelo: leer(vehiculo, ['modelo']) ?? '—',
          anio: leer(vehiculo, ['anio', 'año']) ?? '—',
          color: leer(vehiculo, ['color']) ?? '—',
          tipo: leer(vehiculo, ['tipo']) ?? '—',
          fotoUrl: leer(vehiculo, ['foto_url']) ?? null,
          fotoPropietarioUrl: leer(vehiculo, ['foto_propietario_url']) ?? null,
          propietarioNombre:
            leer(vehiculo, ['propietario_nombre', 'nombre_propietario', 'propietario']) ?? '—',
          cedulaEnmascarada:
            leer(vehiculo, ['cedula_enmascarada', 'cedula']) ?? '—',
          autorizado: Boolean(leer(vehiculo, ['autorizado'])),
        }
      : null,
    crudo: data,
  }
}
