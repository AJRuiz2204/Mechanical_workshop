# 📡 Referencia Completa de API

## Índice
- [Configuración Base](#configuración-base)
- [Autenticación](#autenticación)
- [Modelos de Datos (DTOs)](#modelos-de-datos-dtos)
- [Endpoints Detallados](#endpoints-detallados)
- [Códigos de Estado HTTP](#códigos-de-estado-http)
- [Manejo de Errores](#manejo-de-errores)

---

## Configuración Base

### URL Base

```javascript
// Desarrollo
baseURL: "http://localhost:5121/api"

// Producción
baseURL: "https://api2.j-benz.com"
```

### Headers por Defecto

```javascript
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer {token}"  // Para endpoints protegidos
}
```

---

## Autenticación

### POST /Users/login

Autentica un usuario y devuelve un token JWT.

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response Success (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John",
    "lastName": "Doe",
    "role": "Manager",
    "workshopId": 1
  }
}
```

**Response Error (401)**:
```json
{
  "message": "Credenciales inválidas",
  "errors": []
}
```

**Ejemplo de Uso**:
```javascript
const loginUser = async (credentials) => {
  try {
    const response = await api.post('/Users/login', credentials);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

---

## Modelos de Datos (DTOs)

### UserDto

```typescript
interface UserDto {
  id?: number;
  email: string;
  password?: string;  // Solo en creación
  name: string;
  lastName: string;
  role: "Manager" | "Technician";
  workshopId: number;
  phoneNumber?: string;
  isActive: boolean;
}
```

### VehicleReadDto

```typescript
interface VehicleReadDto {
  id: number;
  vin: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  licensePlate?: string;
  mileage?: number;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  status: "Recibido" | "EnDiagnostico" | "EnReparacion" | "Completado";
  receptionDate: string;  // ISO 8601
  notes?: string;
}
```

### DiagnosticDto

```typescript
interface DiagnosticDto {
  id?: number;
  vehicleId: number;
  technicianId?: number;
  technicianName?: string;
  diagnosticDate: string;  // ISO 8601
  description: string;
  findings: string;
  recommendations?: string;
  status: "Pendiente" | "EnProceso" | "Completado";
  estimatedCost?: number;
  estimatedHours?: number;
}
```

### TechnicianDiagnosticDto

```typescript
interface TechnicianDiagnosticDto {
  id?: number;
  diagnosticId: number;
  vehicleId: number;
  technicianId: number;
  inspectionDate: string;
  problemDescription: string;
  diagnosis: string;
  requiredParts: Array<{
    partName: string;
    partNumber?: string;
    quantity: number;
    estimatedCost?: number;
  }>;
  laborHours: number;
  laborCost: number;
  totalEstimatedCost: number;
  priority: "Baja" | "Media" | "Alta" | "Urgente";
  status: "Pendiente" | "Aprobado" | "EnProceso" | "Completado";
  notes?: string;
}
```

### EstimateDto

```typescript
interface EstimateDto {
  id?: number;
  vehicleId: number;
  technicianDiagnosticId?: number;
  estimateNumber: string;
  estimateDate: string;
  expirationDate?: string;
  status: "Borrador" | "Enviado" | "Aprobado" | "Rechazado" | "Completado";
  items: EstimateItemDto[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate?: number;
  discountAmount?: number;
  total: number;
  notes?: string;
  termsAndConditions?: string;
}
```

### EstimateItemDto

```typescript
interface EstimateItemDto {
  id?: number;
  estimateId?: number;
  itemType: "Part" | "Labor" | "Service";
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  partNumber?: string;
  notes?: string;
}
```

### AccountReceivableDto

```typescript
interface AccountReceivableDto {
  id?: number;
  estimateId: number;
  customerId?: number;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  dueDate?: string;
  status: "Pendiente" | "Parcial" | "Pagado" | "Vencido";
  notes?: string;
}
```

### PaymentDto

```typescript
interface PaymentDto {
  id?: number;
  accountReceivableId: number;
  paymentDate: string;
  amount: number;
  paymentMethod: "Efectivo" | "Tarjeta" | "Transferencia" | "Cheque";
  referenceNumber?: string;
  notes?: string;
}
```

### WorkshopSettingsDto

```typescript
interface WorkshopSettingsDto {
  id?: number;
  workshopName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  taxId: string;
  logo?: string;  // Base64 o URL
  currency: string;
  timezone: string;
}
```

---

## Endpoints Detallados

### Módulo: Usuarios

#### GET /Users
Lista todos los usuarios del sistema.

**Autorización**: Manager

**Response (200)**:
```json
[
  {
    "id": 1,
    "email": "manager@workshop.com",
    "name": "John",
    "lastName": "Doe",
    "role": "Manager",
    "workshopId": 1,
    "phoneNumber": "555-0100",
    "isActive": true
  }
]
```

#### POST /Users
Crea un nuevo usuario.

**Autorización**: Manager

**Request Body**:
```json
{
  "email": "newuser@workshop.com",
  "password": "SecurePass123!",
  "name": "Jane",
  "lastName": "Smith",
  "role": "Technician",
  "workshopId": 1,
  "phoneNumber": "555-0101"
}
```

**Response (201)**:
```json
{
  "id": 2,
  "email": "newuser@workshop.com",
  "name": "Jane",
  "lastName": "Smith",
  "role": "Technician",
  "workshopId": 1,
  "phoneNumber": "555-0101",
  "isActive": true
}
```

#### PUT /Users/{id}
Actualiza un usuario existente.

**Autorización**: Manager

**Request Body**:
```json
{
  "email": "updated@workshop.com",
  "name": "Jane",
  "lastName": "Smith",
  "role": "Manager",
  "phoneNumber": "555-0102",
  "isActive": true
}
```

#### DELETE /Users/{id}
Elimina un usuario (soft delete).

**Autorización**: Manager

**Response (204)**: No Content

---

### Módulo: Vehículos

#### GET /UserWorkshops/vehicles
Lista todos los vehículos.

**Autorización**: Manager, Technician

**Query Parameters**:
- `status` (opcional): Filtrar por estado
- `page` (opcional): Número de página (paginación)
- `pageSize` (opcional): Elementos por página

**Response (200)**:
```json
[
  {
    "id": 1,
    "vin": "1HGBH41JXMN109186",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "color": "Blanco",
    "licensePlate": "ABC-123",
    "mileage": 45000,
    "ownerName": "Carlos Pérez",
    "ownerPhone": "555-1234",
    "ownerEmail": "carlos@email.com",
    "status": "EnDiagnostico",
    "receptionDate": "2024-10-15T10:30:00Z",
    "notes": "Cliente reporta ruido en el motor"
  }
]
```

#### GET /UserWorkshops/vehicle/{id}
Obtiene un vehículo específico por ID.

**Autorización**: Manager, Technician

**Response (200)**:
```json
{
  "id": 1,
  "vin": "1HGBH41JXMN109186",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "color": "Blanco",
  "licensePlate": "ABC-123",
  "mileage": 45000,
  "ownerName": "Carlos Pérez",
  "ownerPhone": "555-1234",
  "ownerEmail": "carlos@email.com",
  "status": "EnDiagnostico",
  "receptionDate": "2024-10-15T10:30:00Z",
  "diagnostics": [...],
  "estimates": [...]
}
```

#### POST /UserWorkshops
Crea un nuevo registro de vehículo.

**Autorización**: Manager

**Request Body**:
```json
{
  "vin": "1HGBH41JXMN109186",
  "make": "Honda",
  "model": "Accord",
  "year": 2019,
  "color": "Negro",
  "licensePlate": "XYZ-789",
  "mileage": 60000,
  "ownerName": "María García",
  "ownerPhone": "555-5678",
  "ownerEmail": "maria@email.com",
  "status": "Recibido",
  "receptionDate": "2024-10-17T09:00:00Z",
  "notes": "Mantenimiento preventivo programado"
}
```

#### GET /UserWorkshops/searchVehicles
Busca vehículos por múltiples criterios.

**Query Parameters**:
- `searchTerm`: Término de búsqueda
- `searchBy`: Campos a buscar (vin,make,model,ownerName)

**Ejemplo**:
```
GET /UserWorkshops/searchVehicles?searchTerm=Toyota&searchBy=vin,make,model,ownerName
```

---

### Módulo: Diagnósticos

#### POST /Diagnostics
Crea un nuevo diagnóstico (Manager).

**Request Body**:
```json
{
  "vehicleId": 1,
  "technicianId": 2,
  "diagnosticDate": "2024-10-17T10:00:00Z",
  "description": "Diagnóstico inicial del vehículo",
  "findings": "Revisión general requerida",
  "recommendations": "Inspección técnica detallada",
  "status": "Pendiente"
}
```

**Response (201)**:
```json
{
  "id": 1,
  "vehicleId": 1,
  "technicianId": 2,
  "technicianName": "Juan Técnico",
  "diagnosticDate": "2024-10-17T10:00:00Z",
  "description": "Diagnóstico inicial del vehículo",
  "findings": "Revisión general requerida",
  "recommendations": "Inspección técnica detallada",
  "status": "Pendiente",
  "createdAt": "2024-10-17T10:00:00Z"
}
```

#### GET /Diagnostics/byTechnician
Obtiene diagnósticos asignados a un técnico específico.

**Query Parameters**:
- `name`: Nombre del técnico
- `lastName`: Apellido del técnico

**Ejemplo**:
```
GET /Diagnostics/byTechnician?name=Juan&lastName=Técnico
```

---

### Módulo: Diagnósticos Técnicos

#### POST /TechnicianDiagnostics
Crea un diagnóstico técnico detallado.

**Request Body**:
```json
{
  "diagnosticId": 1,
  "vehicleId": 1,
  "technicianId": 2,
  "inspectionDate": "2024-10-17T14:00:00Z",
  "problemDescription": "Motor presenta ruido irregular al acelerar",
  "diagnosis": "Rodamientos del cigüeñal desgastados",
  "requiredParts": [
    {
      "partName": "Kit de rodamientos",
      "partNumber": "KB-1234",
      "quantity": 1,
      "estimatedCost": 250.00
    },
    {
      "partName": "Aceite de motor sintético",
      "partNumber": "OIL-5W30",
      "quantity": 5,
      "estimatedCost": 45.00
    }
  ],
  "laborHours": 8,
  "laborCost": 600.00,
  "totalEstimatedCost": 895.00,
  "priority": "Alta",
  "status": "Pendiente",
  "notes": "Se requiere aprobación del cliente antes de proceder"
}
```

#### GET /TechnicianDiagnostics/vehicle/{vehicleId}
Obtiene todos los diagnósticos técnicos de un vehículo.

---

### Módulo: Cotizaciones

#### POST /Estimates
Crea una nueva cotización.

**Request Body**:
```json
{
  "vehicleId": 1,
  "technicianDiagnosticId": 1,
  "estimateNumber": "EST-2024-001",
  "estimateDate": "2024-10-17T15:00:00Z",
  "expirationDate": "2024-11-17T15:00:00Z",
  "status": "Enviado",
  "items": [
    {
      "itemType": "Part",
      "description": "Kit de rodamientos del cigüeñal",
      "quantity": 1,
      "unitPrice": 250.00,
      "subtotal": 250.00,
      "taxRate": 0.16,
      "taxAmount": 40.00,
      "total": 290.00,
      "partNumber": "KB-1234"
    },
    {
      "itemType": "Labor",
      "description": "Reemplazo de rodamientos y mantenimiento",
      "quantity": 8,
      "unitPrice": 75.00,
      "subtotal": 600.00,
      "taxRate": 0.16,
      "taxAmount": 96.00,
      "total": 696.00
    }
  ],
  "subtotal": 850.00,
  "taxRate": 0.16,
  "taxAmount": 136.00,
  "discountRate": 0.05,
  "discountAmount": 42.50,
  "total": 943.50,
  "notes": "Precio válido por 30 días",
  "termsAndConditions": "50% adelanto requerido"
}
```

#### GET /EstimateWithAccountReceivable
Obtiene cotizaciones con información de cuentas por cobrar.

**Response (200)**:
```json
[
  {
    "estimate": {
      "id": 1,
      "estimateNumber": "EST-2024-001",
      "vehicleId": 1,
      "vehicle": {...},
      "total": 943.50,
      "status": "Aprobado"
    },
    "accountReceivable": {
      "id": 1,
      "totalAmount": 943.50,
      "paidAmount": 471.75,
      "balanceDue": 471.75,
      "status": "Parcial"
    }
  }
]
```

---

### Módulo: Cuentas por Cobrar

#### POST /AccountReceivable/Payment
Registra un nuevo pago.

**Request Body**:
```json
{
  "accountReceivableId": 1,
  "paymentDate": "2024-10-17T16:00:00Z",
  "amount": 471.75,
  "paymentMethod": "Transferencia",
  "referenceNumber": "TRF-20241017-001",
  "notes": "Pago del 50% restante"
}
```

**Response (201)**:
```json
{
  "id": 2,
  "accountReceivableId": 1,
  "paymentDate": "2024-10-17T16:00:00Z",
  "amount": 471.75,
  "paymentMethod": "Transferencia",
  "referenceNumber": "TRF-20241017-001",
  "notes": "Pago del 50% restante",
  "createdAt": "2024-10-17T16:00:00Z"
}
```

#### GET /AccountReceivable/Payment/Client/{customerId}
Obtiene el historial de pagos de un cliente.

---

### Módulo: Reportes

#### GET /SalesReports/date-range
Genera reporte de ventas por rango de fechas.

**Query Parameters**:
- `startDate`: Fecha inicio (ISO 8601)
- `endDate`: Fecha fin (ISO 8601)

**Ejemplo**:
```
GET /SalesReports/date-range?startDate=2024-10-01T00:00:00Z&endDate=2024-10-31T23:59:59Z
```

**Response (200)**:
```json
{
  "period": {
    "startDate": "2024-10-01T00:00:00Z",
    "endDate": "2024-10-31T23:59:59Z"
  },
  "summary": {
    "totalSales": 15780.50,
    "totalInvoices": 12,
    "averageTicket": 1315.04,
    "totalPaid": 12450.00,
    "totalPending": 3330.50
  },
  "salesByCategory": {
    "Parts": 6500.00,
    "Labor": 7800.00,
    "Services": 1480.50
  },
  "salesByStatus": {
    "Completado": 10,
    "EnProceso": 2
  },
  "topServices": [
    {
      "description": "Mantenimiento preventivo",
      "count": 5,
      "total": 4500.00
    }
  ]
}
```

---

### Módulo: Configuración

#### GET /WorkshopSettings
Obtiene la configuración del taller.

**Response (200)**:
```json
{
  "id": 1,
  "workshopName": "Taller Mecánico J-Benz",
  "address": "Calle Principal 123",
  "city": "Ciudad",
  "state": "Estado",
  "zipCode": "12345",
  "country": "México",
  "phone": "+52 555-1234",
  "email": "contacto@j-benz.com",
  "website": "https://j-benz.com",
  "taxId": "RFC123456789",
  "logo": "data:image/png;base64,...",
  "currency": "MXN",
  "timezone": "America/Mexico_City"
}
```

#### PUT /LaborTaxMarkupSettings/{id}
Actualiza configuración de impuestos y markup.

**Request Body**:
```json
{
  "taxRate": 0.16,
  "laborRate": 75.00,
  "partsMarkup": 0.30,
  "discountMaxPercentage": 0.15
}
```

---

## Códigos de Estado HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Solicitud exitosa (GET, PUT) |
| 201 | Created | Recurso creado exitosamente (POST) |
| 204 | No Content | Eliminación exitosa (DELETE) |
| 400 | Bad Request | Datos inválidos en la solicitud |
| 401 | Unauthorized | Token inválido o ausente |
| 403 | Forbidden | Usuario no tiene permisos |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: email duplicado) |
| 422 | Unprocessable Entity | Validación falló |
| 500 | Internal Server Error | Error del servidor |

---

## Manejo de Errores

### Formato Estándar de Error

```json
{
  "message": "Descripción del error",
  "errors": {
    "field1": ["Error en campo 1"],
    "field2": ["Error en campo 2"]
  },
  "statusCode": 400,
  "timestamp": "2024-10-17T10:00:00Z"
}
```

### Ejemplos de Errores

#### Error de Validación (400)
```json
{
  "message": "Errores de validación",
  "errors": {
    "email": ["El email es requerido", "Formato de email inválido"],
    "password": ["La contraseña debe tener al menos 8 caracteres"]
  },
  "statusCode": 400
}
```

#### Error de Autenticación (401)
```json
{
  "message": "Token inválido o expirado",
  "statusCode": 401
}
```

#### Error de Autorización (403)
```json
{
  "message": "No tienes permisos para realizar esta acción",
  "requiredRole": "Manager",
  "userRole": "Technician",
  "statusCode": 403
}
```

#### Recurso No Encontrado (404)
```json
{
  "message": "Vehículo no encontrado",
  "resourceType": "Vehicle",
  "resourceId": 999,
  "statusCode": 404
}
```

---

## Best Practices

### 1. Paginación

Para endpoints que devuelven listas grandes, usar paginación:

```
GET /UserWorkshops/vehicles?page=1&pageSize=20
```

### 2. Filtrado y Búsqueda

Usar query parameters para filtrar:

```
GET /Diagnostics?status=Completado&technicianId=2&dateFrom=2024-10-01
```

### 3. Ordenamiento

```
GET /Estimates?sortBy=estimateDate&sortOrder=desc
```

### 4. Incluir Relaciones

```
GET /Estimates/{id}?include=vehicle,technician,items
```

### 5. Manejo de Fechas

Todas las fechas deben estar en formato ISO 8601 UTC:

```
2024-10-17T14:30:00Z
```

---

**Última actualización**: Octubre 2025  
**Versión de API**: 1.0  
