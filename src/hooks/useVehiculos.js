import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

export const PAGE_SIZE = 10

const COLUMNAS_VEHICULO = `
  id,
  placa,
  marca,
  modelo,
  anio,
  color,
  tipo,
  foto_url,
  foto_fuente_url,
  foto_propietario_url,
  cedula_propietario,
  cedula_enmascarada,
  propietario_nombre,
  correo_institucional,
  correo_microsoft,
  autorizado,
  created_at
`

/**
 * Traduce los errores más comunes de Postgres/Supabase (constraints,
 * RLS) a un mensaje entendible para mostrar en la interfaz.
 */
function mensajeDeError(error) {
  if (!error) return 'Ocurrió un error inesperado.'

  if (error.code === '23505') {
    if (String(error.message).includes('placa')) {
      return 'Ya existe un vehículo registrado con esa placa.'
    }
    if (String(error.message).includes('cedula')) {
      return 'Ya existe un propietario registrado con esa cédula.'
    }
    return 'Ya existe un registro con ese dato único (placa o cédula duplicada).'
  }

  if (error.code === '23514') {
    return 'Uno de los datos no cumple el formato requerido (placa, cédula o año).'
  }

  if (error.code === '42501' || String(error.message || '').includes('row-level security')) {
    return 'No tienes permisos para realizar esta operación (revisa las políticas RLS en Supabase).'
  }

  return error.message || 'Ocurrió un error al comunicarse con Supabase.'
}

/**
 * Hook de datos del panel de administración de vehículos.
 * Aísla la lógica de consulta/mutación (Supabase) de la vista CoreUI,
 * y expone estados de carga y error independientes para el listado y
 * para las operaciones de escritura (crear/editar/eliminar).
 */
export function useVehiculos() {
  const [pagina, setPagina] = useState(1)
  const [busqueda, setBusqueda] = useState('')

  const [vehiculos, setVehiculos] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)

  const [guardando, setGuardando] = useState(false)
  const [eliminandoId, setEliminandoId] = useState(null)

  const totalPaginas = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  )

  const cargarVehiculos = useCallback(async () => {
    setCargando(true)
    setErrorCarga(null)

    const desde = (pagina - 1) * PAGE_SIZE
    const hasta = desde + PAGE_SIZE - 1

    let query = supabase
      .from('vehiculos')
      .select(COLUMNAS_VEHICULO, { count: 'exact' })

    const termino = busqueda.trim()
    if (termino) {
      const like = `%${termino.replace(/[%_]/g, '\\$&')}%`
      query = query.or(
        [
          `placa.ilike.${like}`,
          `marca.ilike.${like}`,
          `modelo.ilike.${like}`,
          `propietario_nombre.ilike.${like}`,
          `correo_institucional.ilike.${like}`,
        ].join(','),
      )
    }

    query = query.order('propietario_nombre', { ascending: true }).range(desde, hasta)

    const { data, error, count } = await query

    if (error) {
      setErrorCarga(mensajeDeError(error))
      setVehiculos([])
      setTotal(0)
    } else {
      setVehiculos(data ?? [])
      setTotal(count ?? 0)
    }

    setCargando(false)
  }, [pagina, busqueda])

  useEffect(() => {
    cargarVehiculos()
  }, [cargarVehiculos])

  // Si una búsqueda deja la página actual fuera de rango, regresamos a la 1.
  useEffect(() => {
    setPagina(1)
  }, [busqueda])

  const cambiarBusqueda = useCallback((valor) => {
    setBusqueda(valor)
  }, [])

  const irAPagina = useCallback(
    (nuevaPagina) => {
      setPagina((actual) => {
        const clamped = Math.min(Math.max(1, nuevaPagina), totalPaginas)
        return clamped === actual ? actual : clamped
      })
    },
    [totalPaginas],
  )

  const crearVehiculo = useCallback(async (payload) => {
    setGuardando(true)
    const { data, error } = await supabase
      .from('vehiculos')
      .insert(payload)
      .select(COLUMNAS_VEHICULO)
      .single()
    setGuardando(false)

    if (error) {
      return { ok: false, error: mensajeDeError(error) }
    }
    return { ok: true, data }
  }, [])

  const actualizarVehiculo = useCallback(async (id, payload) => {
    setGuardando(true)
    const { data, error } = await supabase
      .from('vehiculos')
      .update(payload)
      .eq('id', id)
      .select(COLUMNAS_VEHICULO)
      .single()
    setGuardando(false)

    if (error) {
      return { ok: false, error: mensajeDeError(error) }
    }
    return { ok: true, data }
  }, [])

  const eliminarVehiculo = useCallback(async (id) => {
    setEliminandoId(id)
    const { error } = await supabase.from('vehiculos').delete().eq('id', id)
    setEliminandoId(null)

    if (error) {
      return { ok: false, error: mensajeDeError(error) }
    }
    return { ok: true }
  }, [])

  return {
    // listado
    vehiculos,
    total,
    pagina,
    totalPaginas,
    pageSize: PAGE_SIZE,
    cargando,
    errorCarga,
    busqueda,
    cambiarBusqueda,
    irAPagina,
    recargar: cargarVehiculos,
    // mutaciones
    guardando,
    eliminandoId,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo,
  }
}

export default useVehiculos
