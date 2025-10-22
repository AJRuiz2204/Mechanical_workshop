# 📡 Documentación Completa de API - Mechanical Workshop

## Índice

1. [Autenticación y Usuarios](#autenticación-y-usuarios)
2. [Talleres (Workshops)](#talleres-workshops)
3. [Vehículos](#vehículos)
4. [Diagnósticos](#diagnósticos)
5. [Diagnósticos Técnicos](#diagnósticos-técnicos)
6. [Presupuestos (Estimates)](#presupuestos-estimates)
7. [Cuentas por Cobrar](#cuentas-por-cobrar)
8. [Reportes de Ventas](#reportes-de-ventas)
9. [Configuración del Taller](#configuración-del-taller)
10. [Notas](#notas)

---

## Base URL

```
Desarrollo: https://localhost:7000/api
Producción: https://app2.j-benz.com/api
```

## Autenticación

La API utiliza **JWT Bearer Token** para autenticación.

### Header requerido:
```http
Authorization: Bearer {token}
```

---

## 1. Autenticación y Usuarios

### 1.1 Registro de Usuario

**Endpoint:** `POST /api/Users/register`

**Descripción:** Crea un nuevo usuario en el sistema.

**Body (JSON):**
```json
{
  "email": "usuario@ejemplo.com",
  "name": "Juan",
  "lastName": "Pérez",
  "username": "juanperez",
  "password": "Password123!",
  "profile": "Admin"
}
```

**Response 201 (Created):**
```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "name": "Juan",
  "lastName": "Pérez",
  "username": "juanperez",
  "profile": "Admin"
}
```

**Errores:**
- `400`: Username o email ya existen
- `500`: Error del servidor

---

### 1.2 Login

**Endpoint:** `POST /api/Users/login`

**Descripción:** Autentica usuario y devuelve JWT token.

**Body (JSON):**
```json
{
  "username": "juanperez",
  "password": "Password123!"
}
```

**Response 200 (OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "juanperez",
    "email": "usuario@ejemplo.com",
    "name": "Juan",
    "lastName": "Pérez",
    "profile": "Admin"
  }
}
```

**Errores:**
- `401`: Usuario no encontrado o contraseña incorrecta

---

### 1.3 Obtener Todos los Usuarios

**Endpoint:** `GET /api/Users`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "username": "juanperez",
    "email": "usuario@ejemplo.com",
    "name": "Juan",
    "lastName": "Pérez",
    "profile": "Admin"
  },
  {
    "id": 2,
    "username": "maria",
    "email": "maria@ejemplo.com",
    "name": "María",
    "lastName": "González",
    "profile": "User"
  }
]
```

---

### 1.4 Obtener Usuario por ID

**Endpoint:** `GET /api/Users/{id}`

**Autenticación:** Requerida

**Parámetros:**
- `id` (int): ID del usuario

**Response 200 (OK):**
```json
{
  "id": 1,
  "username": "juanperez",
  "email": "usuario@ejemplo.com",
  "name": "Juan",
  "lastName": "Pérez",
  "profile": "Admin"
}
```

**Errores:**
- `404`: Usuario no encontrado

---

### 1.5 Actualizar Usuario

**Endpoint:** `PUT /api/Users/{id}`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "email": "nuevoemail@ejemplo.com",
  "name": "Juan Carlos",
  "lastName": "Pérez García",
  "profile": "Admin"
}
```

**Response 200 (OK):**
```json
{
  "id": 1,
  "email": "nuevoemail@ejemplo.com",
  "name": "Juan Carlos",
  "lastName": "Pérez García",
  "username": "juanperez",
  "profile": "Admin"
}
```

---

### 1.6 Eliminar Usuario

**Endpoint:** `DELETE /api/Users/{id}`

**Autenticación:** Requerida

**Response 204 (No Content)**

**Errores:**
- `404`: Usuario no encontrado

---

### 1.7 Cambiar Contraseña

**Endpoint:** `POST /api/Users/change-password`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "userId": 1,
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

**Response 200 (OK):**
```json
{
  "message": "Password changed successfully."
}
```

---

### 1.8 Recuperar Contraseña

**Endpoint:** `POST /api/Users/forgot-password`

**Body (JSON):**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response 200 (OK):**
```json
{
  "message": "Reset code sent to email.",
  "resetCode": "123456"
}
```

---

### 1.9 Verificar Código de Recuperación

**Endpoint:** `POST /api/Users/verify-code`

**Body (JSON):**
```json
{
  "email": "usuario@ejemplo.com",
  "code": "123456",
  "newPassword": "NewPassword789!"
}
```

**Response 200 (OK):**
```json
{
  "message": "Password reset successfully."
}
```

---

## 2. Talleres (Workshops)

### 2.1 Obtener Todos los Talleres

**Endpoint:** `GET /api/UserWorkshops`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "workshopName": "Taller Central",
    "ownerName": "Carlos Martínez",
    "phoneNumber": "+1234567890",
    "email": "taller@ejemplo.com",
    "address": "Calle Principal 123",
    "userId": 1
  }
]
```

---

### 2.2 Obtener Taller por ID

**Endpoint:** `GET /api/UserWorkshops/{id}`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
{
  "id": 1,
  "workshopName": "Taller Central",
  "ownerName": "Carlos Martínez",
  "phoneNumber": "+1234567890",
  "email": "taller@ejemplo.com",
  "address": "Calle Principal 123",
  "city": "Ciudad de México",
  "state": "CDMX",
  "zipCode": "12345",
  "userId": 1,
  "vehicles": []
}
```

---

### 2.3 Crear Taller

**Endpoint:** `POST /api/UserWorkshops`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "workshopName": "Nuevo Taller",
  "ownerName": "Pedro López",
  "phoneNumber": "+1234567890",
  "email": "nuevo@taller.com",
  "address": "Av. Reforma 456",
  "city": "Guadalajara",
  "state": "Jalisco",
  "zipCode": "44100",
  "userId": 1
}
```

**Response 201 (Created):**
```json
{
  "id": 2,
  "workshopName": "Nuevo Taller",
  "ownerName": "Pedro López",
  "phoneNumber": "+1234567890",
  "email": "nuevo@taller.com",
  "address": "Av. Reforma 456",
  "userId": 1
}
```

---

### 2.4 Actualizar Taller

**Endpoint:** `PUT /api/UserWorkshops/{id}`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "workshopName": "Taller Actualizado",
  "ownerName": "Pedro López García",
  "phoneNumber": "+1234567890",
  "email": "actualizado@taller.com",
  "address": "Av. Reforma 789"
}
```

**Response 200 (OK):**
```json
{
  "id": 2,
  "workshopName": "Taller Actualizado",
  "ownerName": "Pedro López García",
  "phoneNumber": "+1234567890",
  "email": "actualizado@taller.com"
}
```

---

### 2.5 Eliminar Taller

**Endpoint:** `DELETE /api/UserWorkshops/{id}`

**Autenticación:** Requerida

**Response 204 (No Content)**

---

### 2.6 Obtener Talleres por Usuario

**Endpoint:** `GET /api/UserWorkshops/user/{userId}`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "workshopName": "Taller Central",
    "ownerName": "Carlos Martínez",
    "userId": 1
  },
  {
    "id": 2,
    "workshopName": "Taller Sur",
    "ownerName": "Carlos Martínez",
    "userId": 1
  }
]
```

---

## 3. Vehículos

### 3.1 Obtener Todos los Vehículos

**Endpoint:** `GET /api/VehicleDiagnostic`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "plateNumber": "ABC-123",
    "vin": "1HGBH41JXMN109186",
    "color": "Blanco",
    "userWorkshopId": 1,
    "ownerName": "Juan Pérez",
    "ownerPhone": "+1234567890",
    "ownerEmail": "juan@ejemplo.com"
  }
]
```

---

### 3.2 Crear Vehículo

**Endpoint:** `POST /api/VehicleDiagnostic`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "brand": "Honda",
  "model": "Civic",
  "year": 2021,
  "plateNumber": "XYZ-789",
  "vin": "2HGFC2F59NH123456",
  "color": "Negro",
  "userWorkshopId": 1,
  "ownerName": "María López",
  "ownerPhone": "+9876543210",
  "ownerEmail": "maria@ejemplo.com"
}
```

**Response 201 (Created):**
```json
{
  "id": 2,
  "brand": "Honda",
  "model": "Civic",
  "year": 2021,
  "plateNumber": "XYZ-789",
  "vin": "2HGFC2F59NH123456",
  "color": "Negro",
  "userWorkshopId": 1
}
```

---

### 3.3 Buscar Vehículos

**Endpoint:** `GET /api/VehicleDiagnostic/search`

**Autenticación:** Requerida

**Query Parameters:**
- `plateNumber` (opcional): Número de placa
- `vin` (opcional): Número VIN
- `ownerName` (opcional): Nombre del propietario

**Ejemplo:**
```
GET /api/VehicleDiagnostic/search?plateNumber=ABC-123
```

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "plateNumber": "ABC-123",
    "ownerName": "Juan Pérez"
  }
]
```

---

### 3.4 Obtener Vehículo por ID

**Endpoint:** `GET /api/VehicleDiagnostic/{id}`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
{
  "id": 1,
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "plateNumber": "ABC-123",
  "vin": "1HGBH41JXMN109186",
  "color": "Blanco",
  "userWorkshopId": 1,
  "ownerName": "Juan Pérez",
  "ownerPhone": "+1234567890",
  "ownerEmail": "juan@ejemplo.com",
  "diagnostics": []
}
```

---

### 3.5 Actualizar Vehículo

**Endpoint:** `PUT /api/VehicleDiagnostic/{id}`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "brand": "Toyota",
  "model": "Corolla LE",
  "year": 2020,
  "plateNumber": "ABC-123",
  "vin": "1HGBH41JXMN109186",
  "color": "Blanco Perla",
  "ownerName": "Juan Carlos Pérez",
  "ownerPhone": "+1234567890",
  "ownerEmail": "juancarlos@ejemplo.com"
}
```

**Response 200 (OK)**

---

### 3.6 Eliminar Vehículo

**Endpoint:** `DELETE /api/VehicleDiagnostic/{id}`

**Autenticación:** Requerida

**Response 204 (No Content)**

---

## 4. Diagnósticos

### 4.1 Obtener Todos los Diagnósticos

**Endpoint:** `GET /api/Diagnostics`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "vehicleId": 1,
    "dateReceived": "2025-01-15T10:00:00Z",
    "mileage": 45000,
    "symptoms": "Motor hace ruido extraño",
    "status": "InProgress",
    "vehicle": {
      "id": 1,
      "brand": "Toyota",
      "model": "Corolla",
      "plateNumber": "ABC-123"
    }
  }
]
```

---

### 4.2 Crear Diagnóstico

**Endpoint:** `POST /api/Diagnostics`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "vehicleId": 1,
  "mileage": 45000,
  "symptoms": "Motor hace ruido extraño al acelerar",
  "status": "Pending"
}
```

**Response 201 (Created):**
```json
{
  "id": 1,
  "vehicleId": 1,
  "dateReceived": "2025-01-15T10:00:00Z",
  "mileage": 45000,
  "symptoms": "Motor hace ruido extraño al acelerar",
  "status": "Pending"
}
```

---

### 4.3 Obtener Diagnóstico por ID

**Endpoint:** `GET /api/Diagnostics/{id}`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
{
  "id": 1,
  "vehicleId": 1,
  "dateReceived": "2025-01-15T10:00:00Z",
  "mileage": 45000,
  "symptoms": "Motor hace ruido extraño",
  "status": "InProgress",
  "vehicle": {
    "id": 1,
    "brand": "Toyota",
    "model": "Corolla",
    "plateNumber": "ABC-123",
    "ownerName": "Juan Pérez"
  },
  "technicianDiagnostics": [],
  "notes": []
}
```

---

### 4.4 Actualizar Diagnóstico

**Endpoint:** `PUT /api/Diagnostics/{id}`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "mileage": 45500,
  "symptoms": "Motor hace ruido extraño al acelerar y vibra",
  "status": "Completed"
}
```

**Response 200 (OK)**

---

### 4.5 Eliminar Diagnóstico

**Endpoint:** `DELETE /api/Diagnostics/{id}`

**Autenticación:** Requerida

**Response 204 (No Content)**

---

### 4.6 Obtener Diagnósticos por Vehículo

**Endpoint:** `GET /api/Diagnostics/vehicle/{vehicleId}`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "vehicleId": 1,
    "dateReceived": "2025-01-15T10:00:00Z",
    "mileage": 45000,
    "status": "Completed"
  },
  {
    "id": 2,
    "vehicleId": 1,
    "dateReceived": "2025-02-20T14:30:00Z",
    "mileage": 46200,
    "status": "InProgress"
  }
]
```

---

## 5. Diagnósticos Técnicos

### 5.1 Crear Diagnóstico Técnico

**Endpoint:** `POST /api/TechnicianDiagnostics`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "diagnosticId": 1,
  "technicianName": "Carlos Ramírez",
  "extendedDiagnostic": "Se detectó falla en el tensor de la banda de distribución. Requiere reemplazo urgente.",
  "recommendations": "Cambiar banda de distribución completa y tensor"
}
```

**Response 201 (Created):**
```json
{
  "id": 1,
  "diagnosticId": 1,
  "technicianName": "Carlos Ramírez",
  "extendedDiagnostic": "Se detectó falla en el tensor de la banda de distribución.",
  "recommendations": "Cambiar banda de distribución completa y tensor",
  "dateCreated": "2025-01-15T11:30:00Z"
}
```

---

### 5.2 Obtener Diagnóstico Técnico por ID

**Endpoint:** `GET /api/TechnicianDiagnostics/{id}`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
{
  "id": 1,
  "diagnosticId": 1,
  "technicianName": "Carlos Ramírez",
  "extendedDiagnostic": "Se detectó falla en el tensor de la banda de distribución.",
  "recommendations": "Cambiar banda de distribución completa y tensor",
  "dateCreated": "2025-01-15T11:30:00Z",
  "diagnostic": {
    "id": 1,
    "vehicleId": 1,
    "symptoms": "Motor hace ruido extraño"
  }
}
```

---

### 5.3 Obtener por Diagnóstico

**Endpoint:** `GET /api/TechnicianDiagnostics/diagnostic/{diagnosticId}`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "technicianName": "Carlos Ramírez",
    "extendedDiagnostic": "Falla en tensor",
    "dateCreated": "2025-01-15T11:30:00Z"
  }
]
```

---

### 5.4 Actualizar Diagnóstico Técnico

**Endpoint:** `PUT /api/TechnicianDiagnostics/{id}`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "technicianName": "Carlos Ramírez Jr.",
  "extendedDiagnostic": "Actualización: También se detectó desgaste en poleas",
  "recommendations": "Cambiar banda completa, tensor y poleas"
}
```

**Response 200 (OK)**

---

### 5.5 Eliminar Diagnóstico Técnico

**Endpoint:** `DELETE /api/TechnicianDiagnostics/{id}`

**Autenticación:** Requerida

**Response 204 (No Content)**

---

## 6. Presupuestos (Estimates)

### 6.1 Obtener Todos los Presupuestos

**Endpoint:** `GET /api/Estimates`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "vehicleId": 1,
    "userWorkshopId": 1,
    "date": "2025-01-16T00:00:00Z",
    "subtotal": 5000.00,
    "tax": 800.00,
    "total": 5800.00,
    "authorizationStatus": "InReview",
    "vehicle": {
      "brand": "Toyota",
      "model": "Corolla",
      "plateNumber": "ABC-123"
    },
    "parts": [],
    "labors": [],
    "flatFees": []
  }
]
```

---

### 6.2 Crear Presupuesto

**Endpoint:** `POST /api/Estimates`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "vehicleId": 1,
  "userWorkshopId": 1,
  "customerNote": "Cliente solicita trabajo urgente",
  "technicianDiagnosticId": 1,
  "mileage": 45000,
  "extendedDiagnostic": "Diagnóstico adicional del mecánico",
  "parts": [
    {
      "description": "Banda de distribución",
      "quantity": 1,
      "unitPrice": 1500.00,
      "total": 1500.00
    },
    {
      "description": "Tensor",
      "quantity": 1,
      "unitPrice": 800.00,
      "total": 800.00
    }
  ],
  "labors": [
    {
      "description": "Cambio de banda de distribución",
      "hours": 3,
      "hourlyRate": 500.00,
      "total": 1500.00
    }
  ],
  "flatFees": [
    {
      "description": "Diagnóstico computarizado",
      "amount": 300.00
    }
  ],
  "authorizationStatus": "InReview"
}
```

**Response 201 (Created):**
```json
{
  "id": 1,
  "vehicleId": 1,
  "userWorkshopId": 1,
  "date": "2025-01-16T10:00:00Z",
  "customerNote": "Cliente solicita trabajo urgente",
  "subtotal": 4100.00,
  "tax": 656.00,
  "total": 4756.00,
  "authorizationStatus": "InReview",
  "createdAt": "2025-01-16T10:00:00Z"
}
```

---

### 6.3 Obtener Presupuesto por ID

**Endpoint:** `GET /api/Estimates/{id}`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
{
  "id": 1,
  "vehicleId": 1,
  "userWorkshopId": 1,
  "date": "2025-01-16T00:00:00Z",
  "customerNote": "Cliente solicita trabajo urgente",
  "subtotal": 4100.00,
  "tax": 656.00,
  "total": 4756.00,
  "authorizationStatus": "InReview",
  "mileage": 45000,
  "extendedDiagnostic": "Diagnóstico adicional del mecánico",
  "vehicle": {
    "id": 1,
    "brand": "Toyota",
    "model": "Corolla",
    "plateNumber": "ABC-123",
    "ownerName": "Juan Pérez",
    "ownerPhone": "+1234567890"
  },
  "userWorkshop": {
    "id": 1,
    "workshopName": "Taller Central",
    "ownerName": "Carlos Martínez"
  },
  "parts": [
    {
      "id": 1,
      "description": "Banda de distribución",
      "quantity": 1,
      "unitPrice": 1500.00,
      "total": 1500.00
    }
  ],
  "labors": [
    {
      "id": 1,
      "description": "Cambio de banda",
      "hours": 3,
      "hourlyRate": 500.00,
      "total": 1500.00
    }
  ],
  "flatFees": [
    {
      "id": 1,
      "description": "Diagnóstico",
      "amount": 300.00
    }
  ]
}
```

---

### 6.4 Actualizar Presupuesto

**Endpoint:** `PUT /api/Estimates/{id}`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "customerNote": "Cliente autoriza el trabajo",
  "authorizationStatus": "Authorized",
  "parts": [
    {
      "id": 1,
      "description": "Banda de distribución premium",
      "quantity": 1,
      "unitPrice": 1800.00,
      "total": 1800.00
    }
  ],
  "labors": [
    {
      "id": 1,
      "description": "Cambio de banda de distribución",
      "hours": 3.5,
      "hourlyRate": 500.00,
      "total": 1750.00
    }
  ],
  "flatFees": []
}
```

**Response 200 (OK)**

---

### 6.5 Eliminar Presupuesto

**Endpoint:** `DELETE /api/Estimates/{id}`

**Autenticación:** Requerida

**Response 204 (No Content)**

---

### 6.6 Obtener Presupuestos por Vehículo

**Endpoint:** `GET /api/Estimates/vehicle/{vehicleId}`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "date": "2025-01-16T00:00:00Z",
    "total": 4756.00,
    "authorizationStatus": "Authorized"
  },
  {
    "id": 2,
    "date": "2025-02-20T00:00:00Z",
    "total": 2300.00,
    "authorizationStatus": "InReview"
  }
]
```

---

### 6.7 Obtener Presupuestos por Taller

**Endpoint:** `GET /api/Estimates/workshop/{workshopId}`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "vehicleId": 1,
    "date": "2025-01-16T00:00:00Z",
    "total": 4756.00,
    "authorizationStatus": "Authorized",
    "vehicle": {
      "brand": "Toyota",
      "plateNumber": "ABC-123"
    }
  }
]
```

---

### 6.8 Actualizar Estado de Autorización

**Endpoint:** `PATCH /api/Estimates/{id}/status`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "authorizationStatus": "Authorized"
}
```

**Valores permitidos:**
- `InReview` - En revisión
- `Authorized` - Autorizado
- `Rejected` - Rechazado
- `Completed` - Completado

**Response 200 (OK):**
```json
{
  "id": 1,
  "authorizationStatus": "Authorized",
  "message": "Status updated successfully"
}
```

---

### 6.9 Resumen de Presupuestos

**Endpoint:** `GET /api/EstimatesSummary`

**Autenticación:** Requerida

**Query Parameters:**
- `startDate` (opcional): Fecha inicio (formato: YYYY-MM-DD)
- `endDate` (opcional): Fecha fin
- `workshopId` (opcional): Filtrar por taller

**Ejemplo:**
```
GET /api/EstimatesSummary?startDate=2025-01-01&endDate=2025-01-31&workshopId=1
```

**Response 200 (OK):**
```json
{
  "totalEstimates": 15,
  "totalAmount": 85430.00,
  "averageAmount": 5695.33,
  "byStatus": {
    "inReview": 5,
    "authorized": 8,
    "rejected": 1,
    "completed": 1
  },
  "byMonth": [
    {
      "month": "2025-01",
      "count": 10,
      "total": 52300.00
    },
    {
      "month": "2025-02",
      "count": 5,
      "total": 33130.00
    }
  ]
}
```

---

## 7. Cuentas por Cobrar

### 7.1 Obtener Todas las Cuentas por Cobrar

**Endpoint:** `GET /api/AccountReceivable`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "customerId": 1,
    "estimateId": 1,
    "totalAmount": 4756.00,
    "amountPaid": 2000.00,
    "balance": 2756.00,
    "dueDate": "2025-02-15T00:00:00Z",
    "status": "Partial",
    "customer": {
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com"
    },
    "payments": []
  }
]
```

---

### 7.2 Crear Cuenta por Cobrar

**Endpoint:** `POST /api/AccountReceivable`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "customerId": 1,
  "estimateId": 1,
  "totalAmount": 4756.00,
  "dueDate": "2025-02-15T00:00:00Z"
}
```

**Response 201 (Created):**
```json
{
  "id": 1,
  "customerId": 1,
  "estimateId": 1,
  "totalAmount": 4756.00,
  "amountPaid": 0.00,
  "balance": 4756.00,
  "dueDate": "2025-02-15T00:00:00Z",
  "status": "Pending",
  "createdAt": "2025-01-16T10:00:00Z"
}
```

---

### 7.3 Registrar Pago

**Endpoint:** `POST /api/AccountReceivable/{id}/payment`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "amount": 2000.00,
  "paymentMethod": "CreditCard",
  "notes": "Pago inicial"
}
```

**Métodos de pago permitidos:**
- `Cash` - Efectivo
- `CreditCard` - Tarjeta de crédito
- `DebitCard` - Tarjeta de débito
- `BankTransfer` - Transferencia bancaria
- `Check` - Cheque

**Response 200 (OK):**
```json
{
  "paymentId": 1,
  "accountReceivableId": 1,
  "amount": 2000.00,
  "paymentMethod": "CreditCard",
  "paymentDate": "2025-01-17T14:30:00Z",
  "notes": "Pago inicial",
  "newBalance": 2756.00
}
```

---

### 7.4 Obtener Cuenta por Cobrar con Pagos

**Endpoint:** `GET /api/AccountReceivable/{id}`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
{
  "id": 1,
  "customerId": 1,
  "estimateId": 1,
  "totalAmount": 4756.00,
  "amountPaid": 2000.00,
  "balance": 2756.00,
  "dueDate": "2025-02-15T00:00:00Z",
  "status": "Partial",
  "createdAt": "2025-01-16T10:00:00Z",
  "customer": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "phone": "+1234567890"
  },
  "estimate": {
    "id": 1,
    "vehicle": {
      "brand": "Toyota",
      "model": "Corolla",
      "plateNumber": "ABC-123"
    }
  },
  "payments": [
    {
      "id": 1,
      "amount": 2000.00,
      "paymentMethod": "CreditCard",
      "paymentDate": "2025-01-17T14:30:00Z",
      "notes": "Pago inicial"
    }
  ]
}
```

---

### 7.5 Obtener Cuentas Pendientes

**Endpoint:** `GET /api/AccountReceivable/pending`

**Autenticación:** Requerida

**Query Parameters:**
- `overdue` (opcional): true/false - Solo vencidas

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "customerId": 1,
    "customerName": "Juan Pérez",
    "totalAmount": 4756.00,
    "balance": 2756.00,
    "dueDate": "2025-02-15T00:00:00Z",
    "daysOverdue": 0,
    "status": "Partial"
  }
]
```

---

### 7.6 Obtener por Cliente

**Endpoint:** `GET /api/AccountReceivable/customer/{customerId}`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "totalAmount": 4756.00,
    "balance": 2756.00,
    "dueDate": "2025-02-15T00:00:00Z",
    "status": "Partial"
  },
  {
    "id": 2,
    "totalAmount": 3200.00,
    "balance": 3200.00,
    "dueDate": "2025-03-01T00:00:00Z",
    "status": "Pending"
  }
]
```

---

### 7.7 Crear Cuenta desde Presupuesto

**Endpoint:** `POST /api/EstimateWithAccountReceivable`

**Autenticación:** Requerida

**Descripción:** Crea un presupuesto y automáticamente genera una cuenta por cobrar asociada.

**Body (JSON):**
```json
{
  "estimate": {
    "vehicleId": 1,
    "userWorkshopId": 1,
    "customerNote": "Trabajo urgente",
    "parts": [...],
    "labors": [...],
    "flatFees": [...]
  },
  "customerId": 1,
  "dueDate": "2025-02-28T00:00:00Z"
}
```

**Response 201 (Created):**
```json
{
  "estimateId": 1,
  "accountReceivableId": 1,
  "totalAmount": 4756.00,
  "dueDate": "2025-02-28T00:00:00Z",
  "message": "Estimate and Account Receivable created successfully"
}
```

---

## 8. Reportes de Ventas

### 8.1 Generar Reporte de Ventas

**Endpoint:** `POST /api/SalesReports/generate`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-01-31T23:59:59Z",
  "workshopId": 1
}
```

**Response 200 (OK):**
```json
{
  "id": 1,
  "reportDate": "2025-02-01T10:00:00Z",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-01-31T23:59:59Z",
  "workshopId": 1,
  "totalSales": 85430.00,
  "totalEstimates": 15,
  "averageSale": 5695.33,
  "details": [
    {
      "id": 1,
      "estimateId": 1,
      "vehiclePlate": "ABC-123",
      "customerName": "Juan Pérez",
      "amount": 4756.00,
      "date": "2025-01-16T00:00:00Z"
    }
  ]
}
```

---

### 8.2 Obtener Todos los Reportes

**Endpoint:** `GET /api/SalesReports`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "reportDate": "2025-02-01T10:00:00Z",
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-01-31T23:59:59Z",
    "workshopId": 1,
    "totalSales": 85430.00,
    "totalEstimates": 15
  }
]
```

---

### 8.3 Obtener Reporte por ID

**Endpoint:** `GET /api/SalesReports/{id}`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
{
  "id": 1,
  "reportDate": "2025-02-01T10:00:00Z",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-01-31T23:59:59Z",
  "workshopId": 1,
  "workshopName": "Taller Central",
  "totalSales": 85430.00,
  "totalEstimates": 15,
  "averageSale": 5695.33,
  "totalParts": 45200.00,
  "totalLabor": 32100.00,
  "totalFlatFees": 8130.00,
  "details": [...]
}
```

---

### 8.4 Obtener por Taller

**Endpoint:** `GET /api/SalesReports/workshop/{workshopId}`

**Autenticación:** Requerida

**Query Parameters:**
- `year` (opcional): Filtrar por año
- `month` (opcional): Filtrar por mes (1-12)

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "reportDate": "2025-02-01T10:00:00Z",
    "totalSales": 85430.00,
    "totalEstimates": 15
  }
]
```

---

### 8.5 Estadísticas de Ventas

**Endpoint:** `GET /api/SalesReports/statistics`

**Autenticación:** Requerida

**Query Parameters:**
- `workshopId` (opcional): Filtrar por taller
- `year` (requerido): Año
- `month` (opcional): Mes

**Ejemplo:**
```
GET /api/SalesReports/statistics?workshopId=1&year=2025&month=1
```

**Response 200 (OK):**
```json
{
  "period": "2025-01",
  "workshopId": 1,
  "totalSales": 85430.00,
  "totalEstimates": 15,
  "completedEstimates": 12,
  "averageSale": 5695.33,
  "topServices": [
    {
      "service": "Cambio de banda de distribución",
      "count": 5,
      "revenue": 22500.00
    }
  ],
  "salesByDay": [
    {
      "day": "2025-01-15",
      "count": 2,
      "total": 8500.00
    }
  ],
  "partsVsLabor": {
    "parts": 45200.00,
    "labor": 32100.00,
    "flatFees": 8130.00
  }
}
```

---

## 9. Configuración del Taller

### 9.1 Obtener Configuración

**Endpoint:** `GET /api/WorkshopSettings/{workshopId}`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
{
  "id": 1,
  "workshopId": 1,
  "taxRate": 16.0,
  "currency": "MXN",
  "invoicePrefix": "FAC",
  "nextInvoiceNumber": 1001,
  "termsAndConditions": "Términos y condiciones del taller..."
}
```

---

### 9.2 Crear/Actualizar Configuración

**Endpoint:** `POST /api/WorkshopSettings`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "workshopId": 1,
  "taxRate": 16.0,
  "currency": "MXN",
  "invoicePrefix": "FAC",
  "nextInvoiceNumber": 1001,
  "termsAndConditions": "Garantía de 30 días en todas las reparaciones..."
}
```

**Response 200 (OK):**
```json
{
  "id": 1,
  "workshopId": 1,
  "taxRate": 16.0,
  "currency": "MXN",
  "message": "Settings saved successfully"
}
```

---

### 9.3 Configuración de Mano de Obra, Impuestos y Markup

**Endpoint:** `GET /api/LaborTaxMarkupSettings/{workshopId}`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
{
  "id": 1,
  "workshopId": 1,
  "laborRate": 500.00,
  "taxRate": 16.0,
  "partsMarkup": 25.0,
  "laborMarkup": 15.0
}
```

---

### 9.4 Actualizar Configuración Labor/Tax/Markup

**Endpoint:** `PUT /api/LaborTaxMarkupSettings/{workshopId}`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "laborRate": 550.00,
  "taxRate": 16.0,
  "partsMarkup": 30.0,
  "laborMarkup": 20.0
}
```

**Response 200 (OK):**
```json
{
  "id": 1,
  "workshopId": 1,
  "laborRate": 550.00,
  "taxRate": 16.0,
  "partsMarkup": 30.0,
  "laborMarkup": 20.0,
  "message": "Settings updated successfully"
}
```

---

## 10. Notas

### 10.1 Crear Nota

**Endpoint:** `POST /api/Notes`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "diagnosticId": 1,
  "content": "Cliente solicita llamada antes de proceder con reparaciones adicionales",
  "author": "Carlos Martínez"
}
```

**Response 201 (Created):**
```json
{
  "id": 1,
  "diagnosticId": 1,
  "content": "Cliente solicita llamada antes de proceder con reparaciones adicionales",
  "author": "Carlos Martínez",
  "createdAt": "2025-01-16T15:30:00Z"
}
```

---

### 10.2 Obtener Notas por Diagnóstico

**Endpoint:** `GET /api/Notes/diagnostic/{diagnosticId}`

**Autenticación:** Requerida

**Response 200 (OK):**
```json
[
  {
    "id": 1,
    "content": "Cliente solicita llamada",
    "author": "Carlos Martínez",
    "createdAt": "2025-01-16T15:30:00Z"
  },
  {
    "id": 2,
    "content": "Contactado - Autoriza continuar",
    "author": "Pedro López",
    "createdAt": "2025-01-16T16:45:00Z"
  }
]
```

---

### 10.3 Actualizar Nota

**Endpoint:** `PUT /api/Notes/{id}`

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "content": "Cliente solicita llamada urgente antes de cualquier reparación"
}
```

**Response 200 (OK)**

---

### 10.4 Eliminar Nota

**Endpoint:** `DELETE /api/Notes/{id}`

**Autenticación:** Requerida

**Response 204 (No Content)**

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 204 | No Content - Eliminación exitosa |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## Manejo de Errores

Todas las respuestas de error siguen este formato:

```json
{
  "message": "Descripción del error",
  "details": "Información adicional (opcional)"
}
```

**Ejemplo:**
```json
{
  "message": "Estimate with ID 999 not found."
}
```

---

## Rate Limiting

_(Por implementar)_

La API puede implementar límites de tasa:
- 100 solicitudes por minuto por IP
- 1000 solicitudes por hora por usuario autenticado

---

## Versionado

Versión actual: **v1**

La API está disponible en: `/api/[controller]`

---

## Testing con Swagger

Acceder a: `https://localhost:7000/swagger`

Swagger UI proporciona:
- Documentación interactiva
- Pruebas de endpoints
- Esquemas de modelos
- Autenticación integrada

---

## Ejemplos de Flujos Completos

### Flujo 1: Registro y Login

```bash
# 1. Registrar usuario
POST /api/Users/register
{
  "email": "usuario@ejemplo.com",
  "name": "Juan",
  "lastName": "Pérez",
  "username": "juanperez",
  "password": "Password123!",
  "profile": "Admin"
}

# 2. Login
POST /api/Users/login
{
  "username": "juanperez",
  "password": "Password123!"
}

# Respuesta:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}

# 3. Usar token en todas las solicitudes
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Flujo 2: Crear Presupuesto Completo

```bash
# 1. Crear vehículo
POST /api/VehicleDiagnostic
{
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "plateNumber": "ABC-123",
  "userWorkshopId": 1,
  "ownerName": "Cliente Ejemplo"
}

# 2. Crear diagnóstico
POST /api/Diagnostics
{
  "vehicleId": 1,
  "mileage": 45000,
  "symptoms": "Motor hace ruido"
}

# 3. Crear diagnóstico técnico
POST /api/TechnicianDiagnostics
{
  "diagnosticId": 1,
  "technicianName": "Carlos",
  "extendedDiagnostic": "Falla en tensor"
}

# 4. Crear presupuesto
POST /api/Estimates
{
  "vehicleId": 1,
  "userWorkshopId": 1,
  "technicianDiagnosticId": 1,
  "parts": [...],
  "labors": [...],
  "flatFees": [...]
}

# 5. Crear cuenta por cobrar
POST /api/AccountReceivable
{
  "customerId": 1,
  "estimateId": 1,
  "totalAmount": 4756.00,
  "dueDate": "2025-02-28"
}
```

---

## Notas Adicionales

- Todas las fechas están en formato **ISO 8601** (UTC)
- Los montos monetarios son decimales con 2 decimales
- Los tokens JWT expiran en 60 minutos (configurable)
- Las contraseñas se hashean con BCrypt
- Se recomienda usar HTTPS en producción

---

**Documentación actualizada:** Octubre 2025
