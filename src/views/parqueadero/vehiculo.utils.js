export const TIPOS_VEHICULO = ['AUTOMOVIL', 'CAMIONETA', 'SUV', 'MOTOCICLETA']

export const VEHICULO_VACIO = {
  placa: '',
  marca: '',
  modelo: '',
  anio: new Date().getFullYear(),
  color: '',
  tipo: 'AUTOMOVIL',
  foto_url: '',
  foto_fuente_url: '',
  foto_propietario_url: '',
  cedula_propietario: '',
  propietario_nombre: '',
  correo_institucional: '',
  correo_microsoft: '',
  autorizado: true,
}

const PLACA_REGEX = /^[A-Z]{3}-[0-9]{4}$/
const CEDULA_REGEX = /^[0-9]{10}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_REGEX = /^https?:\/\/[^\s]+$/i
const ANIO_MIN = 1990
const ANIO_MAX = 2035

/**
 * Valida el dígito verificador de una cédula ecuatoriana (algoritmo
 * módulo 10, coeficientes alternados 2-1). Devuelve true/false.
 * Se aplica solo cuando ya se validó el formato de 10 dígitos.
 */
export function cedulaEcuatorianaValida(cedula) {
  if (!CEDULA_REGEX.test(cedula)) return false

  const provincia = Number(cedula.slice(0, 2))
  if (provincia < 1 || provincia > 24) return false

  const tercerDigito = Number(cedula[2])
  if (tercerDigito > 6) return false

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
  const digitoVerificador = Number(cedula[9])

  const suma = coeficientes.reduce((acc, coef, i) => {
    let producto = Number(cedula[i]) * coef
    if (producto >= 10) producto -= 9
    return acc + producto
  }, 0)

  const decenaSuperior = Math.ceil(suma / 10) * 10
  const resultado = decenaSuperior - suma === 10 ? 0 : decenaSuperior - suma

  return resultado === digitoVerificador
}

/**
 * Valida el formulario completo de vehículo + propietario.
 * Devuelve un objeto { campo: mensaje } solo con los campos inválidos.
 */
export function validarVehiculo(valores) {
  const errores = {}

  const placa = (valores.placa || '').trim().toUpperCase()
  if (!placa) {
    errores.placa = 'La placa es obligatoria.'
  } else if (!PLACA_REGEX.test(placa)) {
    errores.placa = 'Formato inválido. Usa AAA-9999 (3 letras, guion, 4 números).'
  }

  if (!valores.marca?.trim()) errores.marca = 'La marca es obligatoria.'
  if (!valores.modelo?.trim()) errores.modelo = 'El modelo es obligatorio.'
  if (!valores.color?.trim()) errores.color = 'El color es obligatorio.'

  const anio = Number(valores.anio)
  if (!valores.anio && valores.anio !== 0) {
    errores.anio = 'El año es obligatorio.'
  } else if (!Number.isInteger(anio) || anio < ANIO_MIN || anio > ANIO_MAX) {
    errores.anio = `El año debe estar entre ${ANIO_MIN} y ${ANIO_MAX}.`
  }

  if (!TIPOS_VEHICULO.includes(valores.tipo)) {
    errores.tipo = 'Selecciona un tipo de vehículo válido.'
  }

  if (!valores.foto_url?.trim()) {
    errores.foto_url = 'La URL de la foto del vehículo es obligatoria.'
  } else if (!URL_REGEX.test(valores.foto_url.trim())) {
    errores.foto_url = 'Debe ser una URL válida (http/https).'
  }

  if (!valores.foto_fuente_url?.trim()) {
    errores.foto_fuente_url = 'La URL de la fuente de la foto es obligatoria.'
  } else if (!URL_REGEX.test(valores.foto_fuente_url.trim())) {
    errores.foto_fuente_url = 'Debe ser una URL válida (http/https).'
  }

  if (!valores.foto_propietario_url?.trim()) {
    errores.foto_propietario_url = 'La URL de la foto del propietario es obligatoria.'
  } else if (!URL_REGEX.test(valores.foto_propietario_url.trim())) {
    errores.foto_propietario_url = 'Debe ser una URL válida (http/https).'
  }

  const cedula = (valores.cedula_propietario || '').trim()
  if (!cedula) {
    errores.cedula_propietario = 'La cédula del propietario es obligatoria.'
  } else if (!CEDULA_REGEX.test(cedula)) {
    errores.cedula_propietario = 'La cédula debe tener exactamente 10 dígitos.'
  } else if (!cedulaEcuatorianaValida(cedula)) {
    errores.cedula_propietario = 'La cédula no es válida (dígito verificador incorrecto).'
  }

  if (!valores.propietario_nombre?.trim()) {
    errores.propietario_nombre = 'El nombre del propietario es obligatorio.'
  }

  const correo = (valores.correo_institucional || '').trim()
  if (!correo) {
    errores.correo_institucional = 'El correo institucional es obligatorio.'
  } else if (!EMAIL_REGEX.test(correo)) {
    errores.correo_institucional = 'Ingresa un correo electrónico válido.'
  } else if (!correo.toLowerCase().endsWith('@uteq.edu.ec')) {
    errores.correo_institucional = 'El correo institucional debe terminar en @uteq.edu.ec.'
  }

  const correoMs = (valores.correo_microsoft || '').trim()
  if (correoMs && !EMAIL_REGEX.test(correoMs)) {
    errores.correo_microsoft = 'Ingresa un correo electrónico válido (o déjalo vacío).'
  }

  return errores
}

/**
 * Normaliza los valores del formulario al payload que espera la tabla
 * `vehiculos` en Supabase (mayúsculas en placa, año numérico, etc.).
 */
export function normalizarVehiculo(valores) {
  return {
    placa: valores.placa.trim().toUpperCase(),
    marca: valores.marca.trim(),
    modelo: valores.modelo.trim(),
    anio: Number(valores.anio),
    color: valores.color.trim(),
    tipo: valores.tipo,
    foto_url: valores.foto_url.trim(),
    foto_fuente_url: valores.foto_fuente_url.trim(),
    foto_propietario_url: valores.foto_propietario_url.trim(),
    cedula_propietario: valores.cedula_propietario.trim(),
    propietario_nombre: valores.propietario_nombre.trim().toUpperCase(),
    correo_institucional: valores.correo_institucional.trim().toLowerCase(),
    correo_microsoft: valores.correo_microsoft?.trim()
      ? valores.correo_microsoft.trim().toLowerCase()
      : null,
    autorizado: Boolean(valores.autorizado),
  }
}
