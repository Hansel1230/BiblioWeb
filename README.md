# BiblioWeb

Sistema web de gestión y consulta bibliotecaria desarrollado para la asignatura
**Desarrollo de Aplicaciones Web II** de UNICDA.

## Descripción

BiblioWeb permite consultar el catálogo de libros, verificar la disponibilidad
de ejemplares y gestionar reservas y préstamos bibliotecarios. La aplicación
busca reducir la dependencia de registros físicos y facilitar el acceso remoto
al catálogo de la biblioteca.

La solución se desarrolla como una SPA (Single Page Application) responsive,
accesible desde computadoras, tabletas y smartphones.

## Objetivo general

Desarrollar una aplicación web para la consulta en línea del catálogo de libros
y la automatización de reservas y préstamos bibliotecarios.

## Objetivos específicos

- Ofrecer un catálogo público con búsqueda por título, autor, categoría e ISBN.
- Permitir el registro e inicio de sesión de lectores y estudiantes.
- Mostrar en tiempo real el estado de cada ejemplar.
- Permitir reservas en línea a usuarios autenticados.
- Centralizar la gestión de usuarios, libros, préstamos, devoluciones y renovaciones.
- Proporcionar herramientas para que el administrador o bibliotecario gestione reservas y entregas pendientes.

## Alcance del repositorio

Este repositorio contiene únicamente el **frontend** de BiblioWeb. El equipo
backend desarrolla una API REST independiente con C# y .NET Web API, además de
la persistencia en SQL Server.

El frontend será responsable de:

- Renderizar la interfaz y los flujos de usuario.
- Consumir los endpoints REST del backend .NET.
- Validar formularios y mostrar mensajes de error.
- Gestionar navegación, sesión y permisos de interfaz.
- Presentar estados de carga, disponibilidad y resultados vacíos.

La lógica de negocio definitiva, autenticación del servidor y persistencia de
datos pertenecen a la API .NET.

## Usuarios del sistema

| Usuario | Capacidades |
| --- | --- |
| Administrador / Bibliotecario | Gestionar el catálogo, registrar ejemplares, procesar préstamos y devoluciones, y administrar sanciones o reportes. |
| Lector / Estudiante | Consultar el catálogo, solicitar reservas, renovar plazos y revisar el historial de préstamos. |
| Invitado | Buscar y consultar el catálogo sin reservar ni solicitar préstamos. |

## Requisitos funcionales

| Código | Requisito | Descripción |
| --- | --- | --- |
| RF-01 | Registro y gestión de usuarios | Permitir a lectores y estudiantes registrarse e iniciar sesión de forma segura. |
| RF-02 | Búsqueda y filtros | Buscar por título, autor, categoría e ISBN. |
| RF-03 | Consulta de disponibilidad | Mostrar el estado actualizado del ejemplar: disponible, reservado, en préstamo o en mantenimiento. |
| RF-04 | Reserva de libros | Permitir a lectores registrados solicitar reservas de ejemplares disponibles. |
| RF-05 | Préstamos y devoluciones | Registrar préstamos físicos, devoluciones y renovaciones de plazo. |
| RF-06 | Panel administrativo | Gestionar reservas, catálogo, ejemplares y usuarios. |
| RF-07 | Sanciones y multas | Mostrar y gestionar sanciones generadas por retrasos en las devoluciones. |

## Requisitos no funcionales

- **RNF-01 Seguridad:** autenticación y autorización basada en roles, con comunicación HTTPS. La gestión de credenciales corresponde al backend.
- **RNF-02 Acceso multiplataforma:** interfaz responsive para smartphones, tabletas y computadoras.
- **RNF-03 Disponibilidad y rendimiento:** consultas y reservas disponibles mediante una API REST optimizada.
- **RNF-04 Mantenibilidad:** código modular y limpio, separado por features, con una integración desacoplada de la API.

## Reglas de negocio

- **RN-01 Límite de reservas activas:** un usuario no puede superar el número máximo de préstamos o reservas permitidas simultáneamente.
- **RN-02 Bloqueo por sanción:** un usuario con multas pendientes o entregas atrasadas no puede realizar nuevas reservas hasta regularizar su estado.
- **RN-03 Expiración de reservas:** una reserva aprobada que no sea retirada en el plazo establecido se cancela automáticamente y el ejemplar vuelve a estar disponible.
- **RN-04 Disponibilidad unitaria:** no se puede prestar ni reservar un ejemplar en préstamo, en mantenimiento o ya reservado.

La API .NET es la autoridad final para aplicar estas reglas. El frontend debe
reflejar sus respuestas y prevenir acciones inválidas en la interfaz cuando
disponga de la información necesaria.

## Casos de uso principales

- **CU-01 Registrarse:** el usuario crea una cuenta de lector.
- **CU-02 Buscar libro:** un invitado o usuario registrado filtra el catálogo.
- **CU-03 Solicitar reserva:** un lector autenticado reserva un ejemplar disponible.
- **CU-04 Procesar préstamo:** el bibliotecario valida la reserva y registra la entrega.
- **CU-05 Registrar devolución:** el bibliotecario registra el retorno y la sanción, si corresponde.

## Stack tecnológico

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query para consultas, caché e invalidación de datos
- Zustand para estado global de cliente cuando sea necesario
- React Hook Form + Zod para formularios y validaciones
- CSS modular por componentes y variables de diseño
- Vitest + Testing Library para pruebas
- Oxlint para análisis estático

## Arquitectura del frontend

El proyecto utiliza una arquitectura modular por funcionalidades (feature-first):

```text
src/
  app/
    layouts/                 # Estructuras comunes de la aplicación
    routes/                  # Configuración de rutas
    providers/               # Proveedores globales
  features/
    auth/                    # Registro, login y sesión
    books/                   # Catálogo, búsqueda y disponibilidad
    users/                   # Gestión de usuarios
    loans/                   # Préstamos y devoluciones
    reservations/            # Reservas de libros
    reservations/            # Reservas en línea
    dashboard/               # Indicadores y panel administrativo
  components/                # Componentes reutilizables de interfaz
    ui/
    forms/
    tables/
    charts/
  hooks/                     # Hooks reutilizables
  lib/
    api/                     # Cliente HTTP y endpoints .NET
    auth/                    # Utilidades de sesión
    utils/                   # Utilidades compartidas
  types/                     # Tipos alineados con los DTOs de la API
  styles/                    # Estilos globales y tema
  tests/                     # Configuración y pruebas
```

Las páginas no deben contener lógica de negocio compleja. Las llamadas a la
API deben centralizarse en `src/lib/api` y en los servicios de cada feature.

### Estado actual de la integración

El frontend utiliza TanStack Query para consultar e invalidar datos remotos.
Las páginas de dashboard y préstamos consumen servicios por feature:

```text
src/
  features/
    dashboard/
      hooks/useDashboard.ts
      services/dashboard-service.ts
    loans/
      hooks/useLoans.ts
      services/loans-service.ts
  lib/
    api/
      client.ts
      config.ts
      endpoints.ts
```

El cliente HTTP centralizado incluye credenciales de sesión, métodos `GET`,
`POST`, `PATCH` y `DELETE`, y errores con código HTTP para que la interfaz
pueda tratar de forma distinta los casos de autenticación, permisos y
recursos no encontrados.

Mientras se completa el contrato de la API .NET, dashboard y préstamos pueden
usar un adaptador mock explícito. El modo mock no debe utilizarse en
producción y no sustituye la autorización ni la persistencia del backend.

## Alcance del Sprint 3

El Sprint 3 incorpora los flujos principales del dominio:

- `/catalog` es público y permite consultar libros sin autenticarse.
- `/register` permite registrar lectores mediante `POST /auth/register`.
- Los lectores pueden solicitar reservas mediante `POST /reservations`.
- El modelo contempla ISBN, ejemplares, estados de ejemplar, reservas,
  sanciones futuras y préstamos relacionados con entidades.
- Las consultas de catálogo y reservas utilizan TanStack Query.

El backend debe validar siempre disponibilidad, límites de reserva, sanciones,
roles y duplicidad de reservas. El frontend solo refleja y previene acciones
cuando cuenta con la información necesaria.

## Alcance del Sprint 4

El Sprint 4 incorpora controles de calidad y preparación para entrega:

- `AppErrorBoundary` evita pantallas blancas ante errores de renderizado y
  ofrece una acción de recuperación.
- Los formularios exponen errores mediante `aria-invalid`,
  `aria-describedby` y `role="alert"`.
- Las tablas tienen caption accesible y permiten desplazamiento horizontal en
  pantallas pequeñas.
- Los elementos interactivos muestran un foco visible para navegación con
  teclado.
- Vitest y Testing Library cubren la sesión y el comportamiento del
  `AppErrorBoundary`.
- GitHub Actions ejecuta lint, pruebas y build en cada pull request hacia
  `main` y en pushes a `main`.

Rutas principales:

| Ruta | Acceso |
| --- | --- |
| `/catalog` | Público |
| `/register` | Público |
| `/login` | Público |
| `/dashboard` | Administrador o lector |
| `/books` | Administrador o lector |
| `/loans` | Administrador o lector |
| `/users` | Administrador |

Contrato esperado para el registro:

```json
{
  "name": "Nombre del lector",
  "email": "lector@biblioweb.com",
  "password": "contraseña segura"
}
```

Contrato esperado para una reserva:

```json
{
  "bookId": 1
}
```

## Integración con la API .NET

Configura la URL base mediante una variable de entorno:

```env
VITE_API_BASE_URL=https://localhost:7000/api
VITE_DATA_SOURCE=api
```

Valores permitidos para `VITE_DATA_SOURCE`:

- `api`: utiliza los endpoints configurados de la API .NET.
- `mock`: utiliza datos locales únicamente durante el desarrollo del frontend.
  Actualmente aplica a dashboard y préstamos. Nunca debe utilizarse en
  producción.

Si `VITE_DATA_SOURCE` no se define, se utiliza `api`. Si el modo API no tiene
`VITE_API_BASE_URL`, la aplicación muestra un error explícito en lugar de
conectarse a un dominio ficticio.

No se deben incluir tokens, contraseñas ni credenciales reales en el repositorio.
El contrato de datos del frontend debe mantenerse alineado con los DTOs que
entregue el equipo backend.

## Instalación y ejecución

Requisitos:

- Node.js LTS
- npm

Instalar dependencias:

```bash
npm install
```

Iniciar el entorno de desarrollo:

```bash
npm run dev
```

Validar el proyecto para producción:

```bash
npm run build
```

Ejecutar el análisis estático:

```bash
npm run lint
```

El build y el lint se ejecutan con:

```bash
npm run build
npm run lint
```

Ejecutar las pruebas:

```bash
npm test
```

Ejecutar las pruebas en modo watch:

```bash
npm run test:watch
```

Generar cobertura:

```bash
npm run test:coverage
```

La integración continua se define en `.github/workflows/ci.yml` y requiere
que `npm ci`, `npm run lint`, `npm test` y `npm run build` finalicen
correctamente.

La autenticación requiere la API configurada. El frontend no almacena
contraseñas ni utiliza credenciales demo.

## Documentación del proyecto

Los documentos académicos que definen el alcance se encuentran en:

- `Instructions/Propuesta_Proyecto_Biblioweb.pdf`
- `Instructions/Entregable 2 — Levantamiento de Requerimientos.pdf`

## Equipo

- Hansel De Los Santos Ramírez — 2025-0010
- Jarol Saul Espaillat Cruz — 2025-0004

## Asignatura

Desarrollo de Aplicaciones Web II — Ingeniería de Software

Docente: Roberto de Jesús Pichardo B.
