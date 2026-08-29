# Smart Parking UTEQ

Aplicación web del parqueadero inteligente de la UTEQ. El repositorio contiene
dos módulos independientes construidos sobre la misma base de React + Vite:

1. **Simulador IoT** (`/estacionamiento`): monitoreo en tiempo real de 80
   espacios de estacionamiento sobre **Firebase Realtime Database**.
2. **Panel de administración** (`/parqueadero/vehiculos`): CRUD completo de
   vehículos y propietarios sobre **Supabase**, construido con **CoreUI**.
   Es el módulo desarrollado en la práctica *"Panel de Administración del
   Smart Parking UTEQ"*.

![Panel de administración de vehículos](docs/screenshot-panel-vehiculos.png)



## Tecnologías utilizadas

| Módulo                | Tecnologías |
|------------------------|-------------|
| Simulador IoT           | React, Vite, Firebase Realtime Database, Leaflet / React-Leaflet, Lucide React |
| Panel de administración | React, Vite, React Router, **CoreUI (@coreui/react)**, **Supabase (@supabase/supabase-js)** |

## Estructura del proyecto (nuevas carpetas/archivos de esta práctica)

```
src/
├─ assets/
│  └─ Logo.jsx                     # Logo institucional (SVG)
├─ layout/
│  ├─ AdminLayout.jsx              # Sidebar + header CoreUI del panel admin
│  ├─ admin-layout.css             # Estilos responsivos del layout admin
│  └─ nav.jsx                      # Ítem de menú "Vehículos y propietarios"
├─ lib/
│  └─ supabase.js                  # Cliente de Supabase (createClient)
├─ hooks/
│  └─ useVehiculos.js              # Listado, búsqueda, paginación y CRUD
├─ views/
│  └─ parqueadero/
│     ├─ ListaVehiculos.jsx        # Vista principal (tabla, búsqueda, paginación)
│     ├─ VehiculoFormModal.jsx     # Modal de alta/edición con validaciones
│     ├─ ConfirmDeleteModal.jsx    # Modal de confirmación de borrado
│     └─ vehiculo.utils.js         # Validaciones y normalización de datos
supabase_parqueadero_uteq.sql      # Script SQL (tablas, datos, RLS)
.env.example                       # Plantilla de variables de entorno
```

## Requisitos previos

- Node.js 18+
- Una cuenta y proyecto en [Supabase](https://supabase.com)

## Configuración de Supabase

1. Crea un proyecto en Supabase (o usa uno existente).
2. Abre el **SQL Editor** del proyecto y ejecuta el contenido completo de
   [`supabase_parqueadero_uteq.sql`](./supabase_parqueadero_uteq.sql). El
   script:
   - Crea las tablas `vehiculos`, `puestos` y `registros_estacionamiento`.
   - Carga los 38 vehículos/propietarios de ejemplo.
   - Habilita **Row Level Security (RLS)** en las tres tablas.
   - Otorga al panel de administración permisos de `select`, `insert`,
     `update` y `delete` sobre `vehiculos`, con políticas que validan el
     formato de placa, cédula y año también a nivel de base de datos.
3. Verifica en **Table Editor -> vehiculos -> RLS** que las políticas
   `Panel admin: lectura total de vehiculos`, `Panel admin: crear vehiculos`,
   `Panel admin: editar vehiculos` y `Panel admin: eliminar vehiculos`
   quedaron creadas.

> **Nota de seguridad (alcance académico):** esta práctica no incluye
> autenticación de usuarios, por lo que el CRUD queda habilitado también
> para el rol `anon` (clave pública). En un entorno productivo real estas
> operaciones deben protegerse con Supabase Auth y políticas que verifiquen
> el rol/usuario autenticado, nunca dejarlas abiertas a `anon`.

## Variables de entorno

1. Copia `.env.example` como `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Completa `.env.local` con los datos de tu proyecto (Supabase ->
   *Project Settings -> API*):
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_anon_key_publica
   ```

**CRÍTICO:** usa siempre la clave pública **anon / publishable**. Nunca
coloques la `service_role key` (clave secreta) en una variable que empiece
con `VITE_`, ya que quedaría expuesta en el navegador. `.env.local` está
excluido del control de versiones (ver `.gitignore`, patrón `*.local`) —
no lo subas a GitHub.

## Instalación y ejecución

```bash
git clone https://github.com/cupidofake777/parqueadero-uteq
cd parqueadero-uteq
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173` (o el puerto que
indique Vite en consola).

- `http://localhost:5173/estacionamiento` — simulador IoT (Firebase).
- `http://localhost:5173/parqueadero/vehiculos` — panel de administración
  de vehículos y propietarios (Supabase).

## Verificar el CRUD contra Supabase antes de tomar capturas

Incluí `scripts/test-crud.mjs`, un script de Node independiente de la app
que inserta un vehículo de prueba (placa `ZZZ-9999`), lo edita, intenta
insertar uno con placa inválida (debe ser rechazado) y finalmente lo
elimina, dejando la base tal como estaba. Sirve para confirmar en segundos
que las políticas RLS quedaron bien configuradas, sin necesidad de abrir el
navegador:

```bash
npm run test:crud
# equivale a: node --env-file=.env.local scripts/test-crud.mjs
```

Si ves `RESULTADO: todas las pruebas pasaron correctamente.`, el CRUD está
listo para probarse desde la interfaz y tomar las capturas del PDF.

## Uso del panel de administración de vehículos

- **Listar:** al entrar a `/parqueadero/vehiculos` se cargan los vehículos
  y propietarios en una tabla paginada (10 registros por página).
- **Buscar:** el campo de búsqueda filtra en Supabase por placa, marca,
  modelo, nombre del propietario o correo institucional.
- **Agregar:** botón "Agregar vehículo" abre un formulario modal con
  validaciones (placa con formato ecuatoriano `AAA-9999`, cédula de 10
  dígitos con verificación del dígito verificador, año entre 1990 y 2035,
  correo institucional `@uteq.edu.ec`, URLs de foto obligatorias, etc.).
- **Editar:** el ícono de lápiz en cada fila abre el mismo formulario
  precargado con los datos actuales; al guardar, la tabla se actualiza
  automáticamente.
- **Eliminar:** el ícono de papelera solicita confirmación antes de borrar
  el registro; los botones quedan deshabilitados mientras la operación
  está en curso.
- Durante cualquier operación se muestran indicadores de carga
  (`CSpinner`), mensajes de éxito/error (toasts y alertas de CoreUI) y los
  botones se deshabilitan para evitar envíos duplicados.

## Simulador IoT (práctica anterior)

1. En el Dashboard (`/estacionamiento`), clic en **"Generar Cuadrícula"**
   para inicializar los 80 espacios en Firebase.
2. Clic en **"Iniciar Simulación"** para arrancar la telemetría simulada
   (actualiza distancias y estados cada 5 segundos).

*Nota: la configuración de Firebase del simulador ya está integrada en el
código (`src/services/firebase.js`) para facilitar la revisión.*

## Scripts disponibles

| Script            | Descripción                          |
|--------------------|---------------------------------------|
| `npm run dev`       | Servidor de desarrollo (Vite)         |
| `npm run build`     | Build de producción                   |
| `npm run preview`   | Sirve el build de producción          |
| `npm run lint`      | Linter (oxlint)                       |

## Autor

- **Ricardo Santiago Loor de la Cruz** — Estudiante de Ingeniería en
  Telemática — UTEQ
