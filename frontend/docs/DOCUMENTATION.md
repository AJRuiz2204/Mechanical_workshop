# 📚 Sistema de Gestión de Taller Mecánico - Documentación Completa

## 📖 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Requisitos del Sistema](#requisitos-del-sistema)
5. [Guía de Instalación](#guía-de-instalación)
6. [Estructura del Proyecto](#estructura-del-proyecto)
7. [Módulos y Funcionalidades](#módulos-y-funcionalidades)
8. [API y Endpoints](#api-y-endpoints)
9. [Autenticación y Autorización](#autenticación-y-autorización)
10. [Gestión de Estado](#gestión-de-estado)
11. [Generación de Reportes](#generación-de-reportes)
12. [Guía de Desarrollo](#guía-de-desarrollo)
13. [Guía de Despliegue](#guía-de-despliegue)
14. [Troubleshooting](#troubleshooting)

---

## 🎯 Descripción General

Sistema web completo para la gestión integral de talleres mecánicos que permite:

- **Gestión de Clientes y Vehículos**: Registro y seguimiento de clientes y sus vehículos
- **Diagnósticos Técnicos**: Sistema de diagnóstico para técnicos y gerentes
- **Cotizaciones**: Creación, edición y gestión de presupuestos
- **Cuentas por Cobrar**: Control financiero de pagos y deudas
- **Reportes y Análisis**: Generación de reportes en PDF y Excel
- **Multi-usuario**: Sistema con roles (Gerente, Técnico)
- **Configuración de Taller**: Personalización de datos del negocio

---

## 🏗️ Arquitectura del Sistema

### Arquitectura Frontend

```
┌─────────────────────────────────────────────────────────────┐
│                      CAPA DE PRESENTACIÓN                    │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   React     │  │  React Router│  │  Ant Design +    │   │
│  │  Components │  │     (SPA)    │  │  React Bootstrap │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│                      CAPA DE LÓGICA                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │   Context   │  │   Services   │  │     Hooks        │    │
│  │  (AuthCtx)  │  │   (API Call) │  │   (Custom)       │    │
│  └─────────────┘  └──────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│                    CAPA DE COMUNICACIÓN                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │    Axios    │  │     JWT      │  │  Interceptors    │    │
│  │   (HTTP)    │  │    Auth      │  │   (Auth Token)   │    │
│  └─────────────┘  └──────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Backend API    │
                    │  (ASP.NET Core)  │
                    └──────────────────┘
```

### Flujo de Datos

```
Usuario → Componente React → Service Layer → Axios → API Backend
                                                          │
                                                          ▼
Usuario ← Componente React ← Service Layer ← Response ← Database
```

---

## 💻 Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18.3.1 | Librería principal para UI |
| **Vite** | 6.0.1 | Herramienta de build y desarrollo |
| **React Router DOM** | 7.1.1 | Enrutamiento y navegación |
| **Axios** | 1.7.9 | Cliente HTTP para llamadas API |
| **Ant Design** | 5.24.9 | Librería de componentes UI |
| **React Bootstrap** | 2.10.6 | Componentes Bootstrap para React |
| **React PDF Renderer** | 4.1.6 | Generación de documentos PDF |
| **ExcelJS** | 4.4.0 | Generación de archivos Excel |
| **Day.js** | 1.11.13 | Manipulación de fechas |
| **React Toastify** | 9.1.1 | Notificaciones toast |
| **EmailJS** | 3.2.0 | Envío de emails (recuperación contraseña) |

### Herramientas de Desarrollo

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| **ESLint** | 9.15.0 | Linter para código JavaScript/React |
| **TypeScript** | - | Tipos para componentes específicos |
| **Yarn** | 4.3.1 | Gestor de paquetes |

### Backend (Inferido)

- **ASP.NET Core** (API REST)
- **SQL Server** (Base de datos)
- **JWT** (Autenticación)

---

## ⚙️ Requisitos del Sistema

### Requisitos Mínimos

- **Node.js**: >= 18.0.0
- **Yarn**: >= 4.3.1 (o npm >= 9.0.0)
- **Navegadores**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- **RAM**: 4GB mínimo
- **Espacio en disco**: 500MB para dependencias

### Requisitos Backend

- **API Backend**: El sistema requiere conexión a la API en `http://localhost:5121/api`
- **Base de datos**: SQL Server configurado y accesible

---

## 🚀 Guía de Instalación

### 1. Clonar el Repositorio

```powershell
git clone <repository-url>
cd frontend
```

### 2. Instalar Dependencias

```powershell
# Usando Yarn (recomendado)
yarn install

# O usando npm
npm install
```

### 3. Configuración de Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:5121/api
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### 4. Configurar EmailJS

Para la funcionalidad de recuperación de contraseña:

1. Crear cuenta en [EmailJS](https://www.emailjs.com/)
2. Configurar un servicio de email
3. Crear plantilla de email
4. Actualizar las credenciales en `src/services/UserLoginServices.js`:

```javascript
// Líneas 88-90
const result = await emailjs.send(
  "YOUR_SERVICE_ID",    // Reemplazar
  "YOUR_TEMPLATE_ID",   // Reemplazar
  templateParams,
  "YOUR_PUBLIC_KEY"     // Reemplazar
);
```

### 5. Iniciar el Servidor de Desarrollo

```powershell
# Modo desarrollo
yarn dev

# O con npm
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 6. Build para Producción

```powershell
# Crear build de producción
yarn build

# Preview del build
yarn preview
```

---

## 📁 Estructura del Proyecto

```
frontend/
├── public/                      # Archivos públicos estáticos
├── src/
│   ├── App.jsx                 # Componente raíz con rutas
│   ├── main.jsx                # Punto de entrada de la aplicación
│   │
│   ├── components/             # Componentes React
│   │   ├── common/            # Componentes reutilizables
│   │   │   └── ConfirmationDialog.jsx
│   │   │
│   │   ├── ForgotPassword/    # Módulo recuperación contraseña
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ChangePassword.jsx
│   │   │   └── ForgotPassword.css
│   │   │
│   │   ├── login/             # Módulo de inicio de sesión
│   │   │   ├── Login.jsx
│   │   │   └── Login.css
│   │   │
│   │   ├── Home/              # Módulos principales del sistema
│   │   │   ├── index.jsx      # Dashboard principal
│   │   │   │
│   │   │   ├── Accounting/    # Módulo de contabilidad
│   │   │   │   ├── AccountsReceivableView.jsx
│   │   │   │   ├── PaymentList.jsx
│   │   │   │   ├── AccountPaymentModal.jsx
│   │   │   │   ├── ClientPaymentPDF.jsx
│   │   │   │   └── styles/
│   │   │   │
│   │   │   ├── Diagnostic/    # Módulo de diagnósticos
│   │   │   │   ├── Diagnostic.jsx
│   │   │   │   ├── DiagnosticList.jsx
│   │   │   │   ├── TechnicianDiagnostic.jsx
│   │   │   │   ├── TechnicianDiagnosticList.jsx
│   │   │   │   └── xlsx/
│   │   │   │
│   │   │   ├── Estimate/      # Módulo de cotizaciones
│   │   │   │   ├── Estimate.jsx
│   │   │   │   ├── EstimateList.jsx
│   │   │   │   ├── EstimatePDF.jsx
│   │   │   │   ├── PDFModalContent.jsx
│   │   │   │   ├── Editcell/
│   │   │   │   ├── EstimateActions/
│   │   │   │   ├── hooks/
│   │   │   │   ├── Modals/
│   │   │   │   └── styles/
│   │   │   │
│   │   │   ├── RegisterUser/  # Registro de usuarios
│   │   │   │   └── RegisterUser.jsx
│   │   │   │
│   │   │   ├── Reports/       # Módulo de reportes
│   │   │   │   ├── SalesReportsListView.jsx
│   │   │   │   ├── SalesReportPDF.jsx
│   │   │   │   ├── SalesReportPDFViewer.jsx
│   │   │   │   └── SalesReportAllPreviewView.jsx
│   │   │   │
│   │   │   ├── Settings/      # Configuraciones del taller
│   │   │   │   ├── Settings.jsx
│   │   │   │   ├── WorkshopSettingsForm.jsx
│   │   │   │   ├── WorkshopSettingsPreview.jsx
│   │   │   │   └── LaborTaxMarkupSettingsForm.jsx
│   │   │   │
│   │   │   ├── VehicleList/   # Lista de vehículos
│   │   │   │   ├── VehicleList.jsx
│   │   │   │   └── UserWorkshopEditModal.jsx
│   │   │   │
│   │   │   └── VehicleReception/ # Recepción de vehículos
│   │   │       ├── VehicleReception.jsx
│   │   │       └── VehicleListModal/
│   │   │
│   │   ├── Layout/            # Componentes de layout
│   │   │   └── MainLayout.jsx
│   │   │
│   │   ├── ProtectedRoute/    # Protección de rutas
│   │   │   ├── ProtectedRouteComponent.tsx
│   │   │   ├── ManagerProtectedRoute.jsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   ├── NotesSection/      # Módulo de notas
│   │   │   ├── NotesSection.jsx
│   │   │   └── NotesSection.css
│   │   │
│   │   ├── Unauthorized/      # Página de acceso no autorizado
│   │   │   └── Unauthorized.jsx
│   │   │
│   │   └── logout/           # Módulo de cierre de sesión
│   │       └── Logout.jsx
│   │
│   ├── Context/              # Context API de React
│   │   └── AuthContext.jsx   # Contexto de autenticación
│   │
│   ├── services/             # Capa de servicios (API)
│   │   ├── api.js           # Configuración de Axios
│   │   ├── jwt.js           # Manejo de tokens JWT
│   │   ├── UserLoginServices.js
│   │   ├── userService.js
│   │   ├── VehicleService.js
│   │   ├── UserWorkshopService.js
│   │   ├── DiagnosticService.js
│   │   ├── TechnicianDiagnosticService.js
│   │   ├── EstimateService.js
│   │   ├── EstimateServiceXslx.js
│   │   ├── accountReceivableService.js
│   │   ├── salesReportService.js
│   │   ├── NotesService.js
│   │   ├── technicianService.js
│   │   ├── workshopSettingsService.js
│   │   ├── laborTaxMarkupSettingsService.js
│   │   └── notificationService.jsx
│   │
│   └── images/              # Recursos de imagen
│       └── HomeImages/
│
├── eslint.config.js        # Configuración de ESLint
├── vite.config.js          # Configuración de Vite
├── package.json            # Dependencias y scripts
├── web.config              # Configuración IIS (para despliegue)
├── index.html              # HTML principal
└── README.md               # Documentación básica
```

---

## 🔧 Módulos y Funcionalidades

### 1. Autenticación y Usuarios

#### Login
- Inicio de sesión con email y contraseña
- Validación de credenciales
- Almacenamiento de token JWT
- Redirección según rol de usuario

#### Recuperación de Contraseña
- Solicitud de código de verificación
- Envío de código por email (EmailJS)
- Verificación de código
- Cambio de contraseña

#### Gestión de Usuarios
- Registro de nuevos usuarios
- Asignación de roles (Manager, Technician)
- Gestión de permisos

### 2. Gestión de Vehículos

#### Recepción de Vehículos
- Registro de vehículos nuevos
- Información del propietario
- Datos técnicos del vehículo (VIN, marca, modelo, año)
- Estado del vehículo al ingreso

#### Lista de Vehículos
- Visualización de todos los vehículos
- Búsqueda y filtrado
- Edición de información
- Eliminación de registros
- Exportación a Excel

### 3. Diagnósticos

#### Diagnóstico del Gerente
- Creación de diagnóstico inicial
- Asignación de técnico
- Estado del diagnóstico
- Observaciones generales

#### Diagnóstico del Técnico
- Visualización de diagnósticos asignados
- Registro detallado de fallas
- Recomendaciones de reparación
- Lista de partes necesarias
- Estimación de tiempo de trabajo

### 4. Cotizaciones (Estimates)

#### Creación de Cotizaciones
- Selección de vehículo
- Agregar líneas de cotización:
  - Partes/Refacciones
  - Mano de obra
  - Servicios
- Cálculo automático de:
  - Subtotales
  - Impuestos
  - Descuentos
  - Total

#### Gestión de Cotizaciones
- Lista de todas las cotizaciones
- Búsqueda y filtrado
- Edición de cotizaciones existentes
- Eliminación de cotizaciones
- Estados: Pendiente, Aprobado, Rechazado

#### Generación de PDF
- Vista previa de cotización
- Descarga de PDF profesional
- Envío por email al cliente

### 5. Cuentas por Cobrar

#### Visualización de Cuentas
- Lista de todas las cuentas pendientes
- Filtrado por cliente
- Estado de pago
- Monto pendiente vs pagado

#### Registro de Pagos
- Registro de pagos parciales o totales
- Método de pago
- Fecha de pago
- Generación de recibo

#### Reportes de Pagos
- Historial de pagos por cliente
- PDF de recibos de pago
- Resumen de cobros

### 6. Reportes y Análisis

#### Reportes de Ventas
- Reporte de ventas por período
- Análisis de servicios más solicitados
- Ingresos totales
- Exportación a PDF y Excel

#### Reportes Personalizados
- Filtros por fecha
- Filtros por cliente
- Filtros por técnico
- Filtros por estado

### 7. Configuración del Taller

#### Datos del Taller
- Nombre del taller
- Dirección
- Teléfono y email
- Logo
- Información fiscal

#### Configuración de Impuestos
- Configuración de IVA
- Markup de mano de obra
- Configuración de descuentos

### 8. Notas y Comentarios

- Sistema de notas por vehículo
- Comentarios en diagnósticos
- Observaciones en cotizaciones
- Historial de comunicación

---

## 🔌 API y Endpoints

### Base URL

```
Base URL: http://localhost:5121/api
Producción: https://api2.j-benz.com
```

### Autenticación

Todos los endpoints (excepto login y forgot-password) requieren autenticación JWT mediante header:

```
Authorization: Bearer <token>
```

### Endpoints por Módulo

#### 1. Usuarios y Autenticación

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| POST | `/Users/login` | Iniciar sesión | `{ email, password }` |
| POST | `/Users/forgot-password` | Solicitar recuperación | `{ email }` |
| POST | `/Users/verify-code` | Verificar código | `{ Email, Code }` |
| POST | `/Users/change-password` | Cambiar contraseña | `{ Email, NewPassword }` |
| GET | `/Users` | Listar usuarios | - |
| POST | `/Users` | Crear usuario | UserDto |
| PUT | `/Users/{id}` | Actualizar usuario | UserDto |
| DELETE | `/Users/{id}` | Eliminar usuario | - |

#### 2. Vehículos y Talleres

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/UserWorkshops` | Listar talleres | - |
| GET | `/UserWorkshops/{id}` | Obtener taller | - |
| POST | `/UserWorkshops` | Crear taller | UserWorkshopDto |
| PUT | `/UserWorkshops/{id}` | Actualizar taller | UserWorkshopDto |
| DELETE | `/UserWorkshops/{id}` | Eliminar taller | - |
| GET | `/UserWorkshops/vehicles` | Listar vehículos | - |
| GET | `/UserWorkshops/vehicle/{id}` | Obtener vehículo | - |
| DELETE | `/UserWorkshops/vehicle/{vin}` | Eliminar vehículo | - |
| GET | `/UserWorkshops/searchVehicles` | Buscar vehículos | `?searchTerm=&searchBy=` |

#### 3. Diagnósticos

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/Diagnostics` | Listar diagnósticos | - |
| GET | `/Diagnostics/{id}` | Obtener diagnóstico | - |
| POST | `/Diagnostics` | Crear diagnóstico | DiagnosticDto |
| PUT | `/Diagnostics/{id}` | Actualizar diagnóstico | DiagnosticDto |
| DELETE | `/Diagnostics/{id}` | Eliminar diagnóstico | - |
| GET | `/Diagnostics/byTechnician` | Diagnósticos por técnico | `?name=&lastName=` |

#### 4. Diagnósticos Técnicos

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/TechnicianDiagnostics` | Listar diagnósticos técnicos | - |
| GET | `/TechnicianDiagnostics/{id}` | Obtener diagnóstico técnico | - |
| POST | `/TechnicianDiagnostics` | Crear diagnóstico técnico | TechnicianDiagnosticDto |
| PUT | `/TechnicianDiagnostics/{id}` | Actualizar diagnóstico | TechnicianDiagnosticDto |
| DELETE | `/TechnicianDiagnostics/{id}` | Eliminar diagnóstico | - |
| GET | `/TechnicianDiagnostics/vehicle/{vehicleId}` | Por vehículo | - |

#### 5. Cotizaciones (Estimates)

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/Estimates` | Listar cotizaciones | - |
| GET | `/Estimates/{id}` | Obtener cotización | - |
| POST | `/Estimates` | Crear cotización | EstimateDto |
| PUT | `/Estimates/{id}` | Actualizar cotización | EstimateDto |
| DELETE | `/Estimates/{id}` | Eliminar cotización | - |
| GET | `/EstimateWithAccountReceivable` | Cotizaciones con cuentas | - |
| GET | `/VehicleDiagnostic` | Vehículos con diagnósticos | - |

#### 6. Cuentas por Cobrar

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/AccountReceivable` | Listar cuentas | - |
| GET | `/AccountReceivable/{id}` | Obtener cuenta | - |
| POST | `/AccountReceivable` | Crear cuenta | AccountReceivableDto |
| PUT | `/AccountReceivable/{id}` | Actualizar cuenta | AccountReceivableDto |
| DELETE | `/AccountReceivable/{id}` | Eliminar cuenta | - |
| GET | `/AccountReceivable/Payment` | Listar pagos | - |
| POST | `/AccountReceivable/Payment` | Crear pago | PaymentDto |
| GET | `/AccountReceivable/Payment/{accountId}` | Pagos por cuenta | - |
| GET | `/AccountReceivable/Payment/Client/{customerId}` | Pagos por cliente | - |

#### 7. Reportes de Ventas

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/SalesReports` | Listar reportes | - |
| GET | `/SalesReports/{id}` | Obtener reporte | - |
| POST | `/SalesReports` | Crear reporte | SalesReportDto |
| GET | `/SalesReports/date-range` | Reporte por período | `?startDate=&endDate=` |

#### 8. Configuración

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/WorkshopSettings` | Obtener configuración | - |
| POST | `/WorkshopSettings` | Crear configuración | WorkshopSettingsDto |
| PUT | `/WorkshopSettings/{id}` | Actualizar configuración | WorkshopSettingsDto |
| GET | `/LaborTaxMarkupSettings` | Obtener config impuestos | - |
| POST | `/LaborTaxMarkupSettings` | Crear config impuestos | LaborTaxMarkupDto |
| PUT | `/LaborTaxMarkupSettings/{id}` | Actualizar config | LaborTaxMarkupDto |

#### 9. Notas

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/Notes` | Listar notas | - |
| GET | `/Notes/{id}` | Obtener nota | - |
| POST | `/Notes` | Crear nota | NoteDto |
| PUT | `/Notes/{id}` | Actualizar nota | NoteDto |
| DELETE | `/Notes/{id}` | Eliminar nota | - |

#### 10. Técnicos

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| GET | `/Technicians` | Listar técnicos | - |
| GET | `/Technicians/{id}` | Obtener técnico | - |
| POST | `/Technicians` | Crear técnico | TechnicianDto |
| PUT | `/Technicians/{id}` | Actualizar técnico | TechnicianDto |
| DELETE | `/Technicians/{id}` | Eliminar técnico | - |

---

## 🔐 Autenticación y Autorización

### Sistema de Autenticación

El sistema utiliza **JWT (JSON Web Tokens)** para autenticación.

#### Flujo de Autenticación

```
1. Usuario ingresa credenciales
   ↓
2. Frontend envía POST /Users/login
   ↓
3. Backend valida y genera JWT
   ↓
4. Token se almacena en localStorage
   ↓
5. Interceptor de Axios agrega token a headers
   ↓
6. Todas las peticiones incluyen: Authorization: Bearer <token>
```

### Implementación en el Frontend

#### jwt.js - Manejo de Tokens

```javascript
// Almacenar token
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Obtener token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Eliminar token
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Decodificar token
export const decodeToken = (token) => {
  try {
    return jwt_decode(token);
  } catch (error) {
    return null;
  }
};
```

#### Interceptor de Axios

```javascript
// src/services/api.js
api.interceptors.request.use(config => {
    const token = getToken();
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));
```

### Sistema de Roles

#### Roles Disponibles

1. **Manager (Gerente)**
   - Acceso completo al sistema
   - Gestión de usuarios
   - Configuración del taller
   - Todos los módulos

2. **Technician (Técnico)**
   - Acceso a diagnósticos asignados
   - Creación de diagnósticos técnicos
   - Vista de cotizaciones relacionadas
   - Acceso limitado

#### Protected Routes

```jsx
// Ruta protegida solo para Manager
<Route
  path="/vehicle-reception/:id"
  element={
    <ProtectedRoute requiredRole="Manager">
      <VehicleReception />
    </ProtectedRoute>
  }
/>

// Ruta para Manager y Technician
<Route
  path="/technicianDiagnostic/:id"
  element={
    <ProtectedRoute requiredRoles={["Technician", "Manager"]}>
      <TechnicianDiagnostic />
    </ProtectedRoute>
  }
/>
```

#### Componente ProtectedRoute

```typescript
// ProtectedRouteComponent.tsx
const ProtectedRoute = ({ children, requiredRole, requiredRoles }) => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};
```

### AuthContext

```jsx
// Context/AuthContext.jsx
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 📊 Gestión de Estado

### Estrategia de Estado

El proyecto utiliza múltiples estrategias para gestión de estado:

1. **Context API**: Para autenticación global
2. **useState**: Para estado local de componentes
3. **useEffect**: Para efectos secundarios y sincronización
4. **LocalStorage**: Para persistencia de datos

### Patrones Utilizados

#### 1. Estado Local con Hooks

```jsx
const [vehicles, setVehicles] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

#### 2. Context para Estado Global

```jsx
// Uso del AuthContext
const { user, login, logout } = useContext(AuthContext);
```

#### 3. Persistencia en LocalStorage

```javascript
// Almacenar
localStorage.setItem('user', JSON.stringify(userData));
localStorage.setItem('token', token);

// Recuperar
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

// Eliminar
localStorage.removeItem('user');
localStorage.removeItem('token');
```

---

## 📄 Generación de Reportes

### Librería: @react-pdf/renderer

El sistema genera documentos PDF profesionales utilizando React PDF Renderer.

### Tipos de Reportes

#### 1. Cotización PDF (EstimatePDF.jsx)

```jsx
<Document>
  <Page size="A4" style={styles.page}>
    {/* Header con logo y datos del taller */}
    <View style={styles.header}>
      <Text>Nombre del Taller</Text>
      <Text>Cotización #{estimateId}</Text>
    </View>
    
    {/* Información del cliente */}
    <View style={styles.clientInfo}>
      <Text>Cliente: {clientName}</Text>
      <Text>Vehículo: {vehicleInfo}</Text>
    </View>
    
    {/* Tabla de ítems */}
    <View style={styles.table}>
      {items.map(item => (
        <View style={styles.row}>
          <Text>{item.description}</Text>
          <Text>{item.quantity}</Text>
          <Text>{item.price}</Text>
        </View>
      ))}
    </View>
    
    {/* Totales */}
    <View style={styles.totals}>
      <Text>Subtotal: ${subtotal}</Text>
      <Text>IVA: ${tax}</Text>
      <Text>Total: ${total}</Text>
    </View>
  </Page>
</Document>
```

#### 2. Recibo de Pago PDF (ClientPaymentPDF.jsx)

- Información del pago
- Detalles del cliente
- Monto pagado
- Método de pago
- Balance pendiente

#### 3. Reporte de Ventas PDF (SalesReportPDF.jsx)

- Período del reporte
- Resumen de ventas
- Gráficos y estadísticas
- Desglose por categoría

### Generación de Excel

#### Librería: ExcelJS

```javascript
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const generateExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Vehículos');
  
  // Configurar columnas
  worksheet.columns = [
    { header: 'VIN', key: 'vin', width: 20 },
    { header: 'Marca', key: 'make', width: 15 },
    { header: 'Modelo', key: 'model', width: 15 },
    { header: 'Año', key: 'year', width: 10 },
  ];
  
  // Agregar datos
  data.forEach(vehicle => {
    worksheet.addRow(vehicle);
  });
  
  // Generar archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  saveAs(blob, 'vehiculos.xlsx');
};
```

---

## 🛠️ Guía de Desarrollo

### Estructura de un Componente

```jsx
import React, { useState, useEffect } from 'react';
import { serviceName } from '../../services/serviceName';
import { toast } from 'react-toastify';
import './ComponentName.css';

const ComponentName = () => {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Efectos
  useEffect(() => {
    fetchData();
  }, []);
  
  // Funciones
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await serviceName.getData();
      setData(result);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Render
  return (
    <div className="component-container">
      {loading ? <Spinner /> : <DataTable data={data} />}
    </div>
  );
};

export default ComponentName;
```

### Crear un Nuevo Servicio

```javascript
// src/services/newService.js
import api from './api';

const BASE_URL = '/NewResource';

export const getAll = async () => {
  try {
    const response = await api.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error in getAll:", error);
    throw error;
  }
};

export const getById = async (id) => {
  try {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error in getById:", error);
    throw error;
  }
};

export const create = async (data) => {
  try {
    const response = await api.post(BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error in create:", error);
    throw error;
  }
};

export const update = async (id, data) => {
  try {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error in update:", error);
    throw error;
  }
};

export const remove = async (id) => {
  try {
    await api.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error("Error in remove:", error);
    throw error;
  }
};
```

### Agregar una Nueva Ruta

```jsx
// En App.jsx
<Route
  path="/new-route"
  element={
    <ProtectedRoute requiredRole="Manager">
      <NewComponent />
    </ProtectedRoute>
  }
/>
```

### Mejores Prácticas

1. **Manejo de Errores**
```javascript
try {
  const result = await apiCall();
  toast.success('Operación exitosa');
} catch (error) {
  console.error('Error:', error);
  toast.error(error.response?.data?.message || 'Error inesperado');
}
```

2. **Validación de Formularios**
```javascript
const validateForm = () => {
  if (!formData.field1) {
    toast.error('Campo requerido');
    return false;
  }
  return true;
};
```

3. **Loading States**
```javascript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await performAction();
  } finally {
    setLoading(false);
  }
};
```

4. **Cleanup en useEffect**
```javascript
useEffect(() => {
  let isMounted = true;
  
  const fetchData = async () => {
    const data = await getData();
    if (isMounted) {
      setData(data);
    }
  };
  
  fetchData();
  
  return () => {
    isMounted = false;
  };
}, []);
```

---

## 🚀 Guía de Despliegue

### Despliegue en IIS (Windows)

#### 1. Build de Producción

```powershell
yarn build
```

Esto genera la carpeta `dist/` con los archivos estáticos.

#### 2. Configuración de IIS

El archivo `web.config` ya está incluido:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

#### 3. Pasos en IIS

1. Abrir IIS Manager
2. Crear nuevo sitio web
3. Apuntar al directorio `dist/`
4. Configurar puerto (ej: 8080)
5. Iniciar el sitio

### Despliegue en Azure

#### 1. Azure Static Web Apps

```powershell
# Instalar Azure CLI
az login

# Crear Static Web App
az staticwebapp create \
  --name mechanical-workshop \
  --resource-group workshop-rg \
  --location "East US" \
  --source ./dist
```

#### 2. Configuración de API Backend

Actualizar la URL base en `src/services/api.js`:

```javascript
const api = axios.create({
    baseURL: "https://api-production.j-benz.com/api",
});
```

### Despliegue con Docker

```dockerfile
# Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Variables de Entorno en Producción

Crear archivo `.env.production`:

```env
VITE_API_URL=https://api-production.j-benz.com/api
VITE_EMAILJS_SERVICE_ID=production_service_id
VITE_EMAILJS_TEMPLATE_ID=production_template_id
VITE_EMAILJS_PUBLIC_KEY=production_public_key
```

---

## 🐛 Troubleshooting

### Problemas Comunes y Soluciones

#### 1. Error de CORS

**Síntoma**: Error de CORS al hacer peticiones a la API

**Solución**:
```javascript
// En el backend (ASP.NET Core Startup.cs)
services.AddCors(options => {
    options.AddPolicy("AllowFrontend", builder => {
        builder.WithOrigins("http://localhost:5173")
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});
```

#### 2. Token Expirado

**Síntoma**: Usuario es deslogueado automáticamente

**Solución**:
```javascript
// Agregar interceptor para renovar token
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### 3. Errores de Build

**Síntoma**: `yarn build` falla

**Solución**:
```powershell
# Limpiar caché y reinstalar
rm -rf node_modules
rm yarn.lock
yarn install
yarn build
```

#### 4. PDFs No Se Generan

**Síntoma**: Error al generar PDFs

**Solución**:
```javascript
// Verificar importaciones
import { Document, Page, Text, View } from '@react-pdf/renderer';

// Verificar que todos los componentes estén cerrados
<Document>
  <Page>
    <View>
      <Text>Contenido</Text>
    </View>
  </Page>
</Document>
```

#### 5. Rutas No Funcionan en Producción

**Síntoma**: 404 al recargar página en producción

**Solución**: Asegurarse que `web.config` esté en la raíz de `dist/`

#### 6. EmailJS No Envía Emails

**Síntoma**: Recuperación de contraseña no funciona

**Solución**:
1. Verificar credenciales en `UserLoginServices.js`
2. Verificar configuración de plantilla en EmailJS
3. Verificar límites de envío de EmailJS

---

## 📚 Referencias Adicionales

### Documentación de Dependencias

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Ant Design](https://ant.design/)
- [React Bootstrap](https://react-bootstrap.github.io/)
- [React PDF](https://react-pdf.org/)
- [ExcelJS](https://github.com/exceljs/exceljs)
- [EmailJS](https://www.emailjs.com/docs/)

### Scripts Disponibles

```powershell
# Desarrollo
yarn dev          # Inicia servidor de desarrollo

# Build
yarn build        # Crea build de producción
yarn preview      # Preview del build

# Linting
yarn lint         # Ejecuta ESLint
```

### Comandos Útiles

```powershell
# Ver versión de Node
node --version

# Ver versión de Yarn
yarn --version

# Actualizar dependencias
yarn upgrade

# Agregar nueva dependencia
yarn add nombre-paquete

# Agregar dependencia de desarrollo
yarn add -D nombre-paquete

# Remover dependencia
yarn remove nombre-paquete
```

---

## 👥 Soporte y Contacto

Para reportar issues o solicitar nuevas funcionalidades, contactar al equipo de desarrollo.

---

**Versión de Documentación**: 1.0.0  
**Última Actualización**: Octubre 2025  
**Autor**: Sistema de Gestión de Taller Mecánico  

---

