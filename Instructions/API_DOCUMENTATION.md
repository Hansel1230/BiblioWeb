# BiblioWebApi - documentación para integración web

Documentación de la API REST para consumirla desde el proyecto web.

## 1. Configuración

### URLs locales

Según `Properties/launchSettings.json`:

```text
HTTP:  http://localhost:5003
HTTPS: https://localhost:7214
```

En los ejemplos se usa:

```javascript
const API_URL = "https://localhost:7214";
```

En desarrollo también están disponibles:

```text
Swagger UI:  https://localhost:7214/swagger
OpenAPI JSON: https://localhost:7214/swagger/v1/swagger.json
```

Si se usa HTTP, sustituir `https://localhost:7214` por `http://localhost:5003`.

### Autenticación

Los endpoints protegidos usan JWT Bearer:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Ejemplo con `fetch`:

```javascript
const response = await fetch(`${API_URL}/api/auth/me`, {
  headers: {
    Authorization: `Bearer ${sessionStorage.getItem("token")}`
  }
});
const data = await response.json();
```

Roles:

- `Administrator`: administrador.
- `Librarian`: bibliotecario.
- `Reader`: lector.
- `Student`: estudiante.

El registro público no permite crear usuarios `Administrator` ni `Librarian`; esos valores se convierten en `Student`.

## 2. Convenciones de respuesta

- Fechas: ISO 8601, por ejemplo `"2026-11-15T18:30:00Z"`.
- Operaciones de creación: normalmente `201 Created`.
- Operaciones de actualización, eliminación o cambio de estado: normalmente `204 No Content`.
- Consultas exitosas: `200 OK`.
- Sin token o token inválido: `401 Unauthorized`.
- Rol insuficiente: `403 Forbidden`.
- Recurso inexistente: `404 Not Found`.
- Datos inválidos: `400 Bad Request`.
- Reglas de negocio incumplidas: `409 Conflict` o `400 Bad Request`, según la excepción procesada.

Formato de error de la API:

```json
{
  "estado": 400,
  "codigo": "VALIDATION_ERROR",
  "mensaje": "Los datos enviados no son válidos.",
  "detalles": [
    "Email and Password are required."
  ]
}
```

## 3. Salud y metadatos

### `GET /api/health`

Público. Comprueba que la API está disponible.

Respuesta `200`:

```json
{
  "status": "ok",
  "timestamp": "2026-11-01T15:45:12.311Z"
}
```

### `GET /api/metadata`

Público. Devuelve los valores válidos para roles y estados.

Respuesta `200`:

```json
{
  "roles": ["Administrator", "Librarian", "Reader", "Student"],
  "userStatuses": ["Active", "Inactive", "Blocked"],
  "copyStatuses": ["Available", "Reserved", "OnLoan", "Maintenance", "Retired"],
  "loanStatuses": ["Active", "Returned", "Overdue", "Cancelled"],
  "reservationStatuses": ["Pending", "Approved", "Rejected", "Cancelled", "PickedUp", "Expired"],
  "fineStatuses": ["Pending", "Paid", "Waived"]
}
```

## 4. Autenticación

### `POST /api/auth/register`

Público. Crea un usuario y devuelve un JWT.

Request:

```json
{
  "nombreCompleto": "Ana Pérez",
  "correo": "ana@example.com",
  "contrasena": "ClaveSegura123!",
  "rol": "Student"
}
```

Respuesta `201`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expira": "2026-11-01T16:45:12Z"
}
```

### `POST /api/auth/login`

Público.

Request:

```json
{
  "correo": "ana@example.com",
  "contrasena": "ClaveSegura123!"
}
```

Respuesta `200`: mismo formato de `TokenResponse` mostrado en registro.

### `GET /api/auth/me`

Requiere autenticación. Devuelve el usuario del token.

Respuesta `200`:

```json
{
  "id": 1,
  "nombreCompleto": "Ana Pérez",
  "correo": "ana@example.com",
  "rol": "Student",
  "estado": "Active",
  "fechaCreacion": "2026-11-01T15:00:00Z"
}
```

### `POST /api/auth/refresh`

Requiere autenticación. Genera un token nuevo. No requiere body. Responde con `TokenResponse`.

### `POST /api/auth/logout`

Requiere autenticación. No requiere body. Responde `204`. Como el JWT es stateless, el frontend debe eliminar también el token almacenado.

### `POST /api/auth/forgot-password`

Público. No requiere body.

Respuesta `200`:

```json
{
  "message": "Si el correo existe, se enviaron instrucciones de recuperación."
}
```

### `POST /api/auth/reset-password`

Público. Actualmente no procesa campos de cambio de contraseña; no requiere body.

Respuesta `200`:

```json
{
  "message": "Solicitud recibida."
}
```

## 5. Libros

### `GET /api/books`

Público. Lista libros activos. Filtros opcionales: `title`, `author`, `category`, `isbn`.

Ejemplo:

```text
GET /api/books?title=Clean&author=Martin&category=Software&isbn=978
```

Respuesta `200`:

```json
[
  {
    "id": 1,
    "isbn": "9780132350884",
    "titulo": "Clean Code",
    "autor": "Robert C. Martin",
    "editorial": "Prentice Hall",
    "anioPublicacion": 2008,
    "descripcion": "A handbook of agile software craftsmanship.",
    "idCategoria": 2,
    "categoria": "Software",
    "totalEjemplares": 3,
    "ejemplaresDisponibles": 2
  }
]
```

### `GET /api/books/search?q={texto}`

Público. Busca usando el mismo texto en título, autor, categoría e ISBN. Responde con el mismo arreglo de libros.

### `GET /api/books/{id}`

Público. Devuelve un libro por ID. Responde con un objeto `BookResponse`.

### `GET /api/books/{id}/availability`

Público.

Respuesta `200`:

```json
{
  "id": 1,
  "title": "Clean Code",
  "totalCopies": 3,
  "availableCopies": 2,
  "reservedCopies": 0,
  "loanedCopies": 1,
  "maintenanceCopies": 0
}
```

### `POST /api/books`

Requiere rol `Administrator` o `Librarian`.

Request:

```json
{
  "isbn": "9780132350884",
  "titulo": "Clean Code",
  "autor": "Robert C. Martin",
  "idCategoria": 2,
  "editorial": "Prentice Hall",
  "anioPublicacion": 2008,
  "descripcion": "A handbook of agile software craftsmanship."
}
```

Respuesta `201`: objeto `BookResponse`.

### `PUT /api/books/{id}` o `PATCH /api/books/{id}`

Requiere rol `Administrator` o `Librarian`. Todos los campos son opcionales:

```json
{
  "isbn": "9780132350884",
  "titulo": "Clean Code - segunda edición",
  "autor": "Robert C. Martin",
  "idCategoria": 2,
  "editorial": "Prentice Hall",
  "anioPublicacion": 2008,
  "descripcion": "Descripción actualizada.",
  "estaActivo": true
}
```

Respuesta `204`.

### `DELETE /api/books/{id}`

Requiere rol `Administrator` o `Librarian`. Realiza baja lógica (`estaActivo = false`). Respuesta `204`.

## 6. Categorías y ejemplares

### `GET /api/categories`

Público.

Respuesta:

```json
[
  {
    "id": 2,
    "name": "Software"
  }
]
```

### `POST /api/categories`

Requiere rol `Administrator` o `Librarian`.

Request:

```json
{
  "nombre": "Ciencia de datos"
}
```

Respuesta `201`:

```json
{
  "id": 3,
  "name": "Ciencia de datos"
}
```

### `GET /api/books/{bookId}/copies`

Requiere autenticación. Lista ejemplares del libro.

Respuesta:

```json
[
  {
    "id": 10,
    "idLibro": 1,
    "codigoInventario": "INV-00010",
    "estado": "Available",
    "notas": "Ejemplar nuevo"
  }
]
```

### `POST /api/books/{bookId}/copies`

Requiere rol `Administrator` o `Librarian`.

Request:

```json
{
  "codigoInventario": "INV-00011",
  "notas": "Donación"
}
```

Respuesta `201`: objeto `CopyResponse`.

### `GET /api/copies/{id}`

Requiere autenticación. Responde con `CopyResponse`.

### `PATCH /api/copies/{id}/status`

Requiere rol `Administrator` o `Librarian`.

Request:

```json
{
  "estado": "Maintenance"
}
```

Respuesta `204`.

### `DELETE /api/copies/{id}`

Requiere rol `Administrator` o `Librarian`. Marca el ejemplar como `Retired`. Respuesta `204`.

## 7. Préstamos

Todos los endpoints requieren autenticación.

### `GET /api/loans`

Lista todos los préstamos. Respuesta:

```json
[
  {
    "id": 20,
    "idUsuario": 1,
    "idEjemplar": 10,
    "tituloLibro": "Clean Code",
    "fechaPrestamo": "2026-11-01T15:00:00Z",
    "fechaVencimiento": "2026-11-15T15:00:00Z",
    "fechaDevolucion": null,
    "estado": "Active",
    "renovaciones": 0
  }
]
```

### `GET /api/loans/overdue`

Lista préstamos vencidos. Responde con un arreglo de `LoanResponse`.

### `GET /api/loans/{id}`

Devuelve un préstamo. Responde con `LoanResponse`.

### `POST /api/loans`

Request:

```json
{
  "idUsuario": 1,
  "idEjemplar": 10,
  "fechaVencimiento": "2026-11-15T15:00:00Z"
}
```

Respuesta `201`: objeto `LoanResponse`.

### `PATCH /api/loans/{id}/return`

Registra la devolución. No requiere body. Respuesta `204`.

### `PATCH /api/loans/{id}/renew`

Renueva el préstamo y devuelve el `LoanResponse` actualizado. No requiere body. Se permiten como máximo dos renovaciones.

### `PATCH /api/loans/{id}/cancel`

Cancela el préstamo. No requiere body. Respuesta `204`.

### `GET /api/users/{userId}/loans`

Requiere autenticación. Lista los préstamos del usuario indicado.

## 8. Reservas

Todos los endpoints requieren autenticación; las operaciones administrativas indican el rol adicional.

### `GET /api/reservations`

Requiere `Administrator` o `Librarian`. Lista todas las reservas.

### `GET /api/reservations/pending`

Requiere `Administrator` o `Librarian`. Lista reservas con estado `Pending`.

### `GET /api/reservations/{id}`

Requiere autenticación. Devuelve una reserva.

### `POST /api/reservations`

Request:

```json
{
  "idUsuario": 1,
  "idLibro": 1
}
```

Respuesta `201`:

```json
{
  "id": 30,
  "userId": 1,
  "bookId": 1,
  "copyId": null,
  "status": "Pending",
  "createdAt": "2026-11-01T15:00:00Z",
  "approvedAt": null,
  "pickupExpiresAt": null
}
```

### `PATCH /api/reservations/{id}/approve`

Requiere `Administrator` o `Librarian`. No requiere body. Devuelve la reserva aprobada.

### `PATCH /api/reservations/{id}/reject`

Requiere `Administrator` o `Librarian`. No requiere body. Respuesta `204`.

### `PATCH /api/reservations/{id}/cancel`

Requiere autenticación. No requiere body. Respuesta `204`.

### `PATCH /api/reservations/{id}/complete`

Requiere `Administrator` o `Librarian`. No requiere body. Respuesta `204`.

### `GET /api/users/{userId}/reservations`

Requiere autenticación. Lista las reservas del usuario.

## 9. Usuarios

Todos requieren rol `Administrator` o `Librarian`.

### `GET /api/users`

Respuesta: arreglo de `UserResponse`.

### `GET /api/users/{id}`

Respuesta: `UserResponse`.

### `POST /api/users`

Request:

```json
{
  "nombreCompleto": "Carlos Gómez",
  "correo": "carlos@example.com",
  "contrasena": "ClaveSegura123!",
  "rol": "Reader"
}
```

Respuesta `201`: `UserResponse`.

### `PUT /api/users/{id}` o `PATCH /api/users/{id}`

Request parcial:

```json
{
  "nombreCompleto": "Carlos Gómez actualizado",
  "correo": "carlos.nuevo@example.com",
  "rol": "Reader",
  "estado": "Active"
}
```

Respuesta `200`: `UserResponse`.

### `PATCH /api/users/{id}/status`

Request:

```json
{
  "estado": "Blocked"
}
```

Respuesta `204`.

### `DELETE /api/users/{id}`

Realiza baja lógica cambiando el estado a `Inactive`. Respuesta `204`.

## 10. Multas y estado de cuenta

### `GET /api/fines`

Requiere `Administrator` o `Librarian`. Lista todas las multas.

### `GET /api/fines/{id}`

Requiere autenticación. Devuelve una multa.

### `POST /api/fines`

Requiere `Administrator` o `Librarian`.

Request:

```json
{
  "idUsuario": 1,
  "monto": 25.5,
  "motivo": "Entrega tardía",
  "idPrestamo": 20
}
```

Respuesta `201`:

```json
{
  "id": 5,
  "userId": 1,
  "loanId": 20,
  "amount": 25.5,
  "reason": "Entrega tardía",
  "status": "Pending",
  "createdAt": "2026-11-01T15:00:00Z",
  "settledAt": null
}
```

### `PATCH /api/fines/{id}/pay`

Requiere `Administrator` o `Librarian`. No requiere body. Cambia el estado a `Paid`. Respuesta `204`.

### `PATCH /api/fines/{id}/waive`

Requiere `Administrator` o `Librarian`. No requiere body. Cambia el estado a `Waived`. Respuesta `204`.

### `GET /api/users/{userId}/fines`

Requiere autenticación. Lista las multas del usuario.

### `GET /api/users/{userId}/account-status`

Requiere autenticación.

Respuesta:

```json
{
  "userId": 1,
  "blocked": true,
  "pendingFines": 1,
  "overdueLoans": 0
}
```

## 11. Dashboard administrativo

Todos requieren rol `Administrator` o `Librarian`.

| Método | Ruta | Respuesta |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Totales de préstamos, libros disponibles, usuarios activos y vencidos |
| `GET` | `/api/dashboard/recent-activity` | Últimos 20 préstamos |
| `GET` | `/api/dashboard/alerts` | Conteos de vencidos, reservas y multas pendientes |
| `GET` | `/api/dashboard/loans-by-status` | Arreglo `{ "status": "...", "count": 0 }` |
| `GET` | `/api/dashboard/books-availability` | Disponibilidad por libro |
| `GET` | `/api/dashboard/overdue` | Objeto `{ "count": 0 }` |

Ejemplo de `/api/dashboard/summary`:

```json
{
  "activeLoans": 12,
  "availableBooks": 85,
  "activeUsers": 42,
  "overdueLoans": 3,
  "recentActivity": [],
  "alerts": []
}
```

## 12. Endpoint de ejemplo de ASP.NET

### `GET /WeatherForecast`

Endpoint de ejemplo generado por ASP.NET Core. No forma parte del dominio bibliotecario y no requiere autenticación.

Respuesta:

```json
[
  {
    "date": "2026-11-02",
    "temperatureC": 20,
    "temperatureF": 67,
    "summary": "Warm"
  }
]
```

## 13. Recomendación para el frontend

1. Ejecutar login y guardar `token` y `expira`.
2. Enviar `Authorization: Bearer <token>` en cada endpoint protegido.
3. Si la respuesta es `401`, limpiar la sesión y redirigir al login.
4. Si la respuesta es `403`, mostrar un mensaje de permisos insuficientes.
5. Para respuestas `204`, no llamar a `response.json()`.
6. Usar `/api/metadata` para llenar selectores de roles y estados, evitando duplicar enums en el frontend.

