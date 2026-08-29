import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  // Falla rápido y con un mensaje claro en consola en lugar de dejar que
  // cada petición a Supabase falle de forma silenciosa/confusa.
  // eslint-disable-next-line no-console
  console.error(
    'Faltan las variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
      'Copia .env.example como .env.local y completa tus credenciales de Supabase.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)
