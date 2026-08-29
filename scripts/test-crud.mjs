// Script de verificación del CRUD de `vehiculos` contra Supabase real.
// No forma parte de la app (no se importa desde src/); es una utilidad de
// desarrollo para confirmar, antes de tomar las capturas del PDF, que las
// políticas RLS del panel de administración permiten select/insert/update/
// delete. Inserta un registro de prueba (placa ZZZ-9999) y lo elimina al
// final, dejando la base tal como estaba.
//
// Uso (Node 20.6+ / 22+, que soportan --env-file):
//   node --env-file=.env.local scripts/test-crud.mjs
// o, atajo ya configurado en package.json:
//   npm run test:crud
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error(
    'Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.\n' +
      'Ejecuta este script con: node --env-file=.env.local scripts/test-crud.mjs',
  )
  process.exit(1)
}

const supabase = createClient(url, key)

const paso = (n, msg) => console.log(`\n[${n}] ${msg}`)
const ok = (msg) => console.log(`  OK: ${msg}`)
const fail = (msg) => console.log(`  FALLO: ${msg}`)

let huboFallos = false

async function main() {
  // 1. SELECT: conteo total (esperado 38 tras ejecutar el script SQL)
  paso(1, 'SELECT count total de vehiculos')
  {
    const { count, error } = await supabase
      .from('vehiculos')
      .select('id', { count: 'exact', head: true })
    if (error) {
      fail(`SELECT count -> ${error.code} ${error.message}`)
      huboFallos = true
    } else {
      ok(`total de vehiculos = ${count}`)
    }
  }

  // 2. SELECT: columnas completas de un registro (incluye cedula_propietario,
  // que en el panel admin sí debe ser legible para poder editar).
  paso(2, 'SELECT de un registro con columnas completas (incluye cedula_propietario)')
  {
    const { data, error } = await supabase
      .from('vehiculos')
      .select(
        'id, placa, marca, modelo, anio, color, tipo, cedula_propietario, cedula_enmascarada, propietario_nombre, correo_institucional, autorizado',
      )
      .limit(1)
    if (error) {
      fail(`SELECT columnas completas -> ${error.code} ${error.message}`)
      huboFallos = true
    } else if (!data?.length) {
      fail('SELECT no devolvió filas (¿la tabla está vacía?)')
      huboFallos = true
    } else {
      ok(`fila de ejemplo: ${JSON.stringify(data[0])}`)
    }
  }

  // 3. INSERT: crear un vehiculo/propietario de prueba
  paso(3, 'INSERT de un registro de prueba (placa ZZZ-9999)')
  const payloadInsert = {
    placa: 'ZZZ-9999',
    marca: 'PruebaMarca',
    modelo: 'PruebaModelo',
    anio: 2024,
    color: 'Blanco',
    tipo: 'AUTOMOVIL',
    foto_url: 'https://example.com/foto.jpg',
    foto_fuente_url: 'https://example.com/fuente.jpg',
    foto_propietario_url: 'https://example.com/propietario.jpg',
    cedula_propietario: '9999999999',
    propietario_nombre: 'PRUEBA CRUD SCRIPT (borrar automáticamente)',
    correo_institucional: 'prueba.crud@uteq.edu.ec',
    correo_microsoft: null,
    autorizado: true,
  }
  let idCreado = null
  {
    const { data, error } = await supabase
      .from('vehiculos')
      .insert(payloadInsert)
      .select('id, placa')
      .single()
    if (error) {
      fail(`INSERT -> ${error.code} ${error.message}`)
      huboFallos = true
    } else {
      idCreado = data.id
      ok(`registro creado con id=${idCreado}, placa=${data.placa}`)
    }
  }

  if (idCreado) {
    // 4. UPDATE: modificar el registro recién creado
    paso(4, `UPDATE del registro id=${idCreado} (cambiar color y año)`)
    {
      const { data, error } = await supabase
        .from('vehiculos')
        .update({ color: 'Negro', anio: 2025 })
        .eq('id', idCreado)
        .select('id, color, anio')
        .single()
      if (error) {
        fail(`UPDATE -> ${error.code} ${error.message}`)
        huboFallos = true
      } else {
        ok(`registro actualizado: color=${data.color}, anio=${data.anio}`)
      }
    }

    // 5. Verificar que un INSERT con datos inválidos es rechazado por los checks/RLS
    paso(5, 'INSERT con placa inválida (debe ser rechazado)')
    {
      const { error } = await supabase.from('vehiculos').insert({
        ...payloadInsert,
        placa: 'INVALIDA',
        cedula_propietario: '9999999998',
      })
      if (error) {
        ok(`rechazado correctamente -> ${error.code} ${error.message}`)
      } else {
        fail('se insertó un registro con placa inválida (no debería haber pasado)')
        huboFallos = true
      }
    }

    // 6. DELETE: eliminar el registro de prueba (dejar la base limpia)
    paso(6, `DELETE del registro id=${idCreado}`)
    {
      const { error } = await supabase.from('vehiculos').delete().eq('id', idCreado)
      if (error) {
        fail(`DELETE -> ${error.code} ${error.message}`)
        huboFallos = true
      } else {
        ok('registro de prueba eliminado')
      }
    }

    // 7. Confirmar que ya no existe
    paso(7, 'Verificar que el registro de prueba ya no existe')
    {
      const { data, error } = await supabase
        .from('vehiculos')
        .select('id')
        .eq('id', idCreado)
        .maybeSingle()
      if (error) {
        fail(`SELECT de verificación -> ${error.code} ${error.message}`)
        huboFallos = true
      } else if (data) {
        fail('el registro de prueba todavía existe (no se eliminó realmente)')
        huboFallos = true
      } else {
        ok('confirmado: el registro de prueba ya no existe')
      }
    }
  } else {
    console.log('\nSe omiten los pasos 4-7 porque el INSERT del paso 3 falló.')
  }

  console.log('\n' + (huboFallos ? 'RESULTADO: hubo fallos, revisar arriba.' : 'RESULTADO: todas las pruebas pasaron correctamente.'))
  process.exit(huboFallos ? 1 : 0)
}

main().catch((e) => {
  console.error('Error inesperado:', e)
  process.exit(1)
})
