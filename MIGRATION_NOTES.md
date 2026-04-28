# MIGRATION NOTES — Angular (old-code) → React (frontend actual)

## 1) Mapa de pantallas y rutas detectadas en Angular

Rutas en `old-code/frontend/iml-gestion-interna-app/src/app/app.routes.ts`:

- `auth/sign-in` (layout anónimo)
- `` (home)
- `home` (home)
- `personal` (listado de funcionarios)
- `personal/:id` (detalle/edición de funcionario)
- `**` → redirect a home

### Equivalencia propuesta en React (UI mock)

- `/login` (simulado, sin auth real)
- `/` y `/dashboard` (dashboard)
- `/funcionarios` (listado)
- `/funcionarios/:id` (detalle con tabs)
- `/contratos` (nuevo módulo UI mock)
- `/asistencias` (UI mock)
- `/documentacion` (UI mock)
- `/reportes` (UI mock + export simulado)
- `/configuracion` (placeholder prolijo)

## 2) Componentes principales y reutilizables detectados en Angular

### Layout y navegación

- `AuthenticatedLayoutComponent`
- `AnonymousLayoutComponent`
- `NavbarComponent`

### Auth

- `SignInComponent`

### Employee (núcleo funcional)

- `EmployeeListComponent`
- `EmployeeDetailComponent`
- `EmployeeFormComponent`
- `CreateEmployeeDialogComponent`
- `EmployeeService`

### Utilidades UI/validación

- `DocumentFormatPipe`
- `document.validators.ts`
- `document.utils.ts`

## 3) Modelos/entidades detectadas

### Entidad principal

- `Employee`
- `EmployeePreviousJob`
- `CreateEmployeeDto`
- `UpdateEmployeeDto`

### Catálogos/enums del dominio RRHH

- `Gender`
- `CivilStatus`
- `EducationStatus`
- `EmployeeStatus`
- `WorkRegime`
- `WorkPosition`
- `WorkArea`

### Auth

- `AuthUser`

## 4) Flujos clave de usuario identificados

1. **Login** (con Supabase Auth)
2. **Ver dashboard/home**
3. **Listar funcionarios** con:
   - búsqueda incremental
   - filtros por estado, área y cargo
   - ordenamiento y paginación
4. **Alta de funcionario** (dialog + formulario extenso)
5. **Ver detalle de funcionario**
6. **Editar funcionario** (modo edición con formulario)
7. **Eliminar funcionario** (confirmación)

## 5) Dependencias de Supabase en Angular

### Auth

- `auth.signInWithPassword`
- `auth.signOut`
- `auth.getSession`
- `auth.getUser`
- `onAuthStateChange`

### Datos RRHH

- tabla `employees`
- tabla `employee_previous_jobs`
- select/insert/update/delete con relaciones

### Configuración

- cliente Supabase creado con `environment.supabase.url` y `publishableKey`

## 6) Estrategia de simulación UI en React (sin backend)

### Lo que NO se migra

- no Flask
- no DB
- no Supabase
- no auth real
- no endpoints

### Lo que sí se implementa

- **Mocks tipados** en `src/mocks/*.ts`
- **Servicios mock** en `src/services/` devolviendo `Promise`
- Estado en memoria de sesión de app (runtime)
- feedback visual (toasts): “Guardado (simulado)”, “Eliminado (simulado)”, etc.
- rutas principales equivalentes y placeholders de módulos extra

## 7) Gap funcional Angular → React UI mock

Angular viejo tiene foco en `Personal`. No hay módulos completos para contratos/reportes/documentación/asistencias.

Para cumplir el objetivo de maqueta funcional RRHH:

- se conserva fidelidad del módulo **Funcionarios** (campos y flujos principales)
- se agregan módulos **Contratos, Asistencias, Documentación, Reportes, Configuración** en modo UI mock consistente
- se mantiene UX moderna y accesible con Fluent UI 2

## 8) Criterios de fidelidad aplicados

- Campos principales del formulario de funcionario preservados/equivalentes
- Filtros y búsqueda incremental preservados
- Listado, detalle y edición de funcionario preservados
- Dependencias de Supabase reemplazadas por servicio mock con `Promise`
- Mensajería de éxito/error simulada con toasts
