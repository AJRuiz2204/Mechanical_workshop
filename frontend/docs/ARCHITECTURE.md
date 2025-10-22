# 🏛️ Arquitectura del Sistema

## Índice
- [Visión General](#visión-general)
- [Arquitectura de Componentes](#arquitectura-de-componentes)
- [Flujos de Datos](#flujos-de-datos)
- [Patrones de Diseño](#patrones-de-diseño)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Diagramas del Sistema](#diagramas-del-sistema)

---

## Visión General

### Arquitectura General del Sistema

```
┌──────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                    (React + Vite SPA)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              PRESENTATION LAYER                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │    │
│  │  │  Login   │  │   Home   │  │   Reports    │    │    │
│  │  │Component │  │Dashboard │  │  Component   │    │    │
│  │  └──────────┘  └──────────┘  └──────────────┘    │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │               BUSINESS LOGIC LAYER                  │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │    │
│  │  │  Context │  │  Custom  │  │   Services   │    │    │
│  │  │   API    │  │  Hooks   │  │   (API)      │    │    │
│  │  └──────────┘  └──────────┘  └──────────────┘    │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │              DATA ACCESS LAYER                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │    │
│  │  │  Axios   │  │   JWT    │  │ LocalStorage │    │    │
│  │  │Instance  │  │  Handler │  │    Cache     │    │    │
│  │  └──────────┘  └──────────┘  └──────────────┘    │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                          ↕ HTTP/HTTPS
┌──────────────────────────────────────────────────────────────┐
│                         BACKEND API                          │
│                    (ASP.NET Core REST API)                   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              API CONTROLLERS                        │    │
│  │  Users | Vehicles | Diagnostics | Estimates        │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │              BUSINESS LOGIC                         │    │
│  │  Services | Validators | Business Rules            │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │              DATA ACCESS                            │    │
│  │  Entity Framework Core | Repository Pattern        │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                          ↕
┌──────────────────────────────────────────────────────────────┐
│                      SQL SERVER DATABASE                     │
│  Tables: Users, Vehicles, Diagnostics, Estimates, etc.      │
└──────────────────────────────────────────────────────────────┘
```

---

## Arquitectura de Componentes

### Jerarquía de Componentes

```
App.jsx (Root)
│
├─ AuthProvider (Context)
│  │
│  ├─ ToastContainer (Notifications)
│  │
│  └─ BrowserRouter
│     │
│     ├─ Login
│     │  └─ LoginForm
│     │
│     ├─ ForgotPassword
│     │  ├─ RequestCodeForm
│     │  ├─ VerifyCodeForm
│     │  └─ ChangePasswordForm
│     │
│     └─ ProtectedRoute
│        │
│        ├─ MainLayout
│        │  ├─ Header
│        │  ├─ Sidebar
│        │  └─ Outlet (Content)
│        │
│        ├─ Home (Dashboard)
│        │  ├─ StatsCards
│        │  ├─ RecentVehicles
│        │  └─ QuickActions
│        │
│        ├─ VehicleReception
│        │  ├─ VehicleForm
│        │  ├─ OwnerForm
│        │  └─ NotesSection
│        │
│        ├─ VehicleList
│        │  ├─ SearchBar
│        │  ├─ FilterPanel
│        │  ├─ VehicleTable
│        │  │  └─ VehicleRow
│        │  │     ├─ EditButton
│        │  │     └─ DeleteButton
│        │  └─ Pagination
│        │
│        ├─ Diagnostic
│        │  ├─ DiagnosticForm
│        │  ├─ TechnicianSelector
│        │  └─ VehicleInfo
│        │
│        ├─ TechnicianDiagnostic
│        │  ├─ ProblemDescription
│        │  ├─ PartsTable
│        │  │  └─ AddPartModal
│        │  ├─ LaborEstimation
│        │  └─ SaveButton
│        │
│        ├─ Estimate
│        │  ├─ EstimateHeader
│        │  ├─ ItemsTable
│        │  │  ├─ AddItemModal
│        │  │  └─ EditCell
│        │  ├─ TotalsSection
│        │  └─ EstimateActions
│        │     ├─ SaveButton
│        │     ├─ PDFModal
│        │     └─ SendEmail
│        │
│        ├─ AccountsReceivable
│        │  ├─ AccountsList
│        │  ├─ PaymentModal
│        │  └─ PaymentHistory
│        │
│        ├─ Reports
│        │  ├─ DateRangePicker
│        │  ├─ ReportFilters
│        │  ├─ SalesReportTable
│        │  └─ PDFViewer
│        │
│        └─ Settings
│           ├─ WorkshopSettingsForm
│           └─ LaborTaxMarkupSettings
```

### Tipos de Componentes

#### 1. Page Components (Rutas)
```
components/
├── login/Login.jsx
├── Home/index.jsx
├── Home/VehicleReception/VehicleReception.jsx
├── Home/Estimate/Estimate.jsx
└── ...
```

**Características**:
- Componentes de nivel superior
- Corresponden a rutas
- Gestionan estado complejo
- Orquestan componentes hijos

#### 2. Layout Components
```
components/
└── Layout/MainLayout.jsx
```

**Características**:
- Estructura común (header, sidebar, footer)
- Outlet para contenido dinámico
- Navegación

#### 3. Feature Components
```
components/
├── Home/Diagnostic/Diagnostic.jsx
├── Home/Estimate/EstimateList.jsx
└── Home/Accounting/PaymentList.jsx
```

**Características**:
- Funcionalidad específica
- Estado local complejo
- Múltiples operaciones CRUD

#### 4. Common Components
```
components/
└── common/
    └── ConfirmationDialog.jsx
```

**Características**:
- Reutilizables
- Props bien definidas
- Sin dependencias de dominio

#### 5. Utility Components
```
components/
├── ProtectedRoute/ProtectedRouteComponent.tsx
├── ProtectedRoute/ErrorBoundary.tsx
└── NotesSection/NotesSection.jsx
```

---

## Flujos de Datos

### 1. Flujo de Autenticación

```
Usuario ingresa credenciales
         ↓
LoginForm valida localmente
         ↓
UserLoginServices.loginUser()
         ↓
Axios POST /Users/login
         ↓
Backend valida y genera JWT
         ↓
Token y user data regresan
         ↓
AuthContext.login(userData)
         ↓
localStorage.setItem('token', token)
localStorage.setItem('user', JSON.stringify(user))
         ↓
Axios interceptor agrega token a headers
         ↓
Navigate to /home
         ↓
ProtectedRoute valida user
         ↓
Render Home Dashboard
```

### 2. Flujo de Creación de Cotización

```
Usuario navega a /estimate
         ↓
EstimateList muestra cotizaciones existentes
         ↓
Usuario click "Nueva Cotización"
         ↓
Navigate to /estimate/new
         ↓
Estimate Component carga:
  - Vehículos (getVehicles)
  - Diagnósticos (getDiagnostics)
         ↓
Usuario selecciona vehículo
         ↓
Usuario agrega ítems (partes, labor)
         ↓
Cálculos automáticos:
  - Subtotal = Σ(item.subtotal)
  - Tax = subtotal * taxRate
  - Total = subtotal + tax - discount
         ↓
Usuario click "Guardar"
         ↓
EstimateService.createEstimate(data)
         ↓
Axios POST /Estimates
         ↓
Backend valida y guarda
         ↓
Response con ID de cotización
         ↓
toast.success("Cotización creada")
         ↓
Navigate to /estimate-list
```

### 3. Flujo de Generación de PDF

```
Usuario en EstimateList
         ↓
Click "Ver PDF" en cotización
         ↓
PDFModal se abre
         ↓
EstimatePDF Component renderiza:
  - Datos del taller (WorkshopSettings)
  - Datos del vehículo
  - Items de cotización
  - Totales
         ↓
@react-pdf/renderer genera documento
         ↓
Usuario click "Descargar"
         ↓
pdf(EstimatePDF).toBlob()
         ↓
file-saver.saveAs(blob, filename)
         ↓
Archivo descarga al dispositivo
```

### 4. Flujo de Datos en Tiempo Real

```javascript
// Componente monta
useEffect(() => {
  fetchData();
}, []);

// Usuario realiza acción (create/update/delete)
handleAction()
  ↓
Service API call
  ↓
Backend procesa
  ↓
Response exitosa
  ↓
fetchData() // Re-fetch para actualizar vista
  ↓
setData(newData) // Actualiza estado
  ↓
Component re-render con datos actualizados
```

---

## Patrones de Diseño

### 1. Service Layer Pattern

**Ubicación**: `src/services/`

**Propósito**: Separar lógica de llamadas API de componentes UI

```javascript
// ❌ Malo - API call directamente en componente
const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  
  useEffect(() => {
    axios.get('http://localhost:5121/api/vehicles')
      .then(res => setVehicles(res.data))
      .catch(err => console.error(err));
  }, []);
};

// ✅ Bueno - Usar service layer
// services/VehicleService.js
export const getVehicles = async () => {
  try {
    const response = await api.get('/UserWorkshops/vehicles');
    return response.data;
  } catch (error) {
    console.error("Error in getVehicles:", error);
    throw error;
  }
};

// Component
const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await getVehicles();
        setVehicles(data);
      } catch (error) {
        toast.error('Error al cargar vehículos');
      }
    };
    fetchVehicles();
  }, []);
};
```

### 2. Context API Pattern

**Ubicación**: `src/Context/AuthContext.jsx`

**Propósito**: Estado global de autenticación

```javascript
// Context Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

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

// Uso en componentes
const SomeComponent = () => {
  const { user, logout } = useContext(AuthContext);
  
  return (
    <div>
      <p>Bienvenido, {user.name}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
};
```

### 3. Protected Route Pattern

**Ubicación**: `src/components/ProtectedRoute/`

**Propósito**: Proteger rutas por autenticación y roles

```typescript
const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requiredRoles 
}: ProtectedRouteProps) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### 4. Error Boundary Pattern

**Ubicación**: `src/components/ProtectedRoute/ErrorBoundary.tsx`

**Propósito**: Capturar errores de renderizado

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### 5. Custom Hooks Pattern

**Ejemplo**: Hook para fetch de datos

```javascript
// hooks/useFetch.js
const useFetch = (serviceFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceFunc();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

// Uso
const VehicleList = () => {
  const { data: vehicles, loading, error, refetch } = useFetch(getVehicles);
  
  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  
  return <Table data={vehicles} onRefresh={refetch} />;
};
```

### 6. Axios Interceptor Pattern

**Ubicación**: `src/services/api.js`

**Propósito**: Agregar token JWT automáticamente

```javascript
// Request Interceptor
api.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Estructura de Carpetas

### Organización por Características (Feature-Based)

```
src/
├── components/
│   ├── common/              # Componentes reutilizables
│   │   └── ConfirmationDialog.jsx
│   │
│   ├── login/               # Feature: Login
│   │   ├── Login.jsx
│   │   └── Login.css
│   │
│   ├── ForgotPassword/      # Feature: Recuperar contraseña
│   │   ├── ForgotPassword.jsx
│   │   ├── ChangePassword.jsx
│   │   └── ForgotPassword.css
│   │
│   ├── Home/                # Feature: Dashboard y módulos principales
│   │   ├── index.jsx
│   │   │
│   │   ├── VehicleReception/     # Sub-feature: Recepción
│   │   │   ├── VehicleReception.jsx
│   │   │   └── VehicleListModal/
│   │   │
│   │   ├── VehicleList/          # Sub-feature: Lista
│   │   │   ├── VehicleList.jsx
│   │   │   └── UserWorkshopEditModal.jsx
│   │   │
│   │   ├── Diagnostic/           # Sub-feature: Diagnósticos
│   │   │   ├── Diagnostic.jsx
│   │   │   ├── DiagnosticList.jsx
│   │   │   ├── TechnicianDiagnostic.jsx
│   │   │   ├── TechnicianDiagnosticList.jsx
│   │   │   └── xlsx/
│   │   │
│   │   ├── Estimate/             # Sub-feature: Cotizaciones
│   │   │   ├── Estimate.jsx
│   │   │   ├── EstimateList.jsx
│   │   │   ├── EstimatePDF.jsx
│   │   │   ├── PDFModalContent.jsx
│   │   │   ├── Editcell/
│   │   │   ├── EstimateActions/
│   │   │   ├── hooks/
│   │   │   ├── Modals/
│   │   │   └── styles/
│   │   │
│   │   ├── Accounting/           # Sub-feature: Contabilidad
│   │   │   ├── AccountsReceivableView.jsx
│   │   │   ├── PaymentList.jsx
│   │   │   ├── AccountPaymentModal.jsx
│   │   │   ├── ClientPaymentPDF.jsx
│   │   │   └── styles/
│   │   │
│   │   ├── Reports/              # Sub-feature: Reportes
│   │   │   ├── SalesReportsListView.jsx
│   │   │   ├── SalesReportPDF.jsx
│   │   │   └── SalesReportPDFViewer.jsx
│   │   │
│   │   ├── Settings/             # Sub-feature: Configuración
│   │   │   ├── Settings.jsx
│   │   │   ├── WorkshopSettingsForm.jsx
│   │   │   └── LaborTaxMarkupSettingsForm.jsx
│   │   │
│   │   └── RegisterUser/         # Sub-feature: Usuarios
│   │       └── RegisterUser.jsx
│   │
│   ├── Layout/              # Layout components
│   │   └── MainLayout.jsx
│   │
│   ├── ProtectedRoute/      # Seguridad
│   │   ├── ProtectedRouteComponent.tsx
│   │   ├── ManagerProtectedRoute.jsx
│   │   └── ErrorBoundary.tsx
│   │
│   ├── NotesSection/        # Módulo de notas
│   │   ├── NotesSection.jsx
│   │   └── NotesSection.css
│   │
│   └── Unauthorized/        # Página de error 403
│       └── Unauthorized.jsx
│
├── Context/                 # Context API
│   └── AuthContext.jsx
│
├── services/                # API Services (Data Access)
│   ├── api.js                    # Configuración Axios
│   ├── jwt.js                    # JWT utilities
│   ├── UserLoginServices.js      # Auth services
│   ├── userService.js            # User CRUD
│   ├── VehicleService.js         # Vehicle operations
│   ├── UserWorkshopService.js    # Workshop management
│   ├── DiagnosticService.js      # Diagnostics
│   ├── TechnicianDiagnosticService.js
│   ├── EstimateService.js        # Estimates
│   ├── EstimateServiceXslx.js    # Excel export
│   ├── accountReceivableService.js # Accounting
│   ├── salesReportService.js     # Reports
│   ├── NotesService.js           # Notes
│   ├── technicianService.js      # Technicians
│   ├── workshopSettingsService.js # Settings
│   ├── laborTaxMarkupSettingsService.js
│   └── notificationService.jsx   # Notifications
│
├── images/                  # Static assets
│   └── HomeImages/
│
├── App.jsx                  # Root component con rutas
└── main.jsx                 # Entry point
```

### Principios de Organización

1. **Co-location**: Archivos relacionados juntos
2. **Feature-based**: Organizado por funcionalidad, no por tipo
3. **Flat cuando sea posible**: Evitar anidamiento excesivo
4. **Separación de concerns**: Services separados de UI

---

## Diagramas del Sistema

### Diagrama de Secuencia: Login

```
Usuario     LoginForm    UserLoginService    API Backend    Database
  |            |                |                 |             |
  |--ingresa-->|                |                 |             |
  |credentials |                |                 |             |
  |            |                |                 |             |
  |            |--valida        |                 |             |
  |            |  localmente    |                 |             |
  |            |                |                 |             |
  |            |--loginUser()-->|                 |             |
  |            |                |                 |             |
  |            |                |--POST /login--->|             |
  |            |                |   {email,pwd}   |             |
  |            |                |                 |             |
  |            |                |                 |--SELECT---->|
  |            |                |                 |   user      |
  |            |                |                 |<--user------|
  |            |                |                 |   data      |
  |            |                |                 |             |
  |            |                |                 |--hash       |
  |            |                |                 |  compare    |
  |            |                |                 |             |
  |            |                |                 |--generate   |
  |            |                |                 |  JWT        |
  |            |                |                 |             |
  |            |                |<--{token,user}--|             |
  |            |<--{token,user}--|                |             |
  |            |                |                 |             |
  |            |--save to       |                 |             |
  |            |  localStorage  |                 |             |
  |            |                |                 |             |
  |            |--navigate      |                 |             |
  |<--redirect |  to /home      |                 |             |
  | to home    |                |                 |             |
```

### Diagrama de Componentes: Estimate Module

```
┌─────────────────────────────────────────────────────────┐
│                    EstimateList                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  - Lista todas las cotizaciones                   │ │
│  │  - Filtros y búsqueda                             │ │
│  │  - Botones de acción                              │ │
│  └───────────────────────────────────────────────────┘ │
│    │                                                     │
│    │ onClick "Nueva Cotización"                         │
│    ↓                                                     │
│  ┌───────────────────────────────────────────────────┐ │
│  │                  Estimate                          │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │          EstimateHeader                     │  │ │
│  │  │  - Número de cotización                     │  │ │
│  │  │  - Fecha                                    │  │ │
│  │  │  - Selector de vehículo                    │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  │                     ↓                              │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │           ItemsTable                        │  │ │
│  │  │  ┌──────────────────────────────────────┐  │  │ │
│  │  │  │       AddItemModal                   │  │  │ │
│  │  │  │  - Tipo (Parte/Labor/Servicio)      │  │  │ │
│  │  │  │  - Descripción, cantidad, precio    │  │  │ │
│  │  │  └──────────────────────────────────────┘  │  │ │
│  │  │                                             │  │ │
│  │  │  ┌──────────────────────────────────────┐  │  │ │
│  │  │  │         EditCell                     │  │  │ │
│  │  │  │  - Edición inline de celdas         │  │  │ │
│  │  │  └──────────────────────────────────────┘  │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  │                     ↓                              │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │         TotalsSection                       │  │ │
│  │  │  - Subtotal                                 │  │ │
│  │  │  - IVA (cálculo automático)                 │  │ │
│  │  │  - Descuento                                │  │ │
│  │  │  - Total                                    │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  │                     ↓                              │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │        EstimateActions                      │  │ │
│  │  │  ┌────────────┐  ┌─────────┐  ┌─────────┐  │  │ │
│  │  │  │ Save       │  │ PDF     │  │ Email   │  │  │ │
│  │  │  │ Button     │  │ Modal   │  │ Button  │  │  │ │
│  │  │  └────────────┘  └─────────┘  └─────────┘  │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Uses
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 EstimateService                         │
│  - getEstimates()                                       │
│  - getEstimateById(id)                                  │
│  - createEstimate(data)                                 │
│  - updateEstimate(id, data)                             │
│  - deleteEstimate(id)                                   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP
                          ↓
┌─────────────────────────────────────────────────────────┐
│               Backend API /Estimates                    │
└─────────────────────────────────────────────────────────┘
```

### Diagrama de Estado: Vehicle Status

```
┌─────────────┐
│  Recibido   │ ← Estado inicial al registrar vehículo
└─────────────┘
      │
      │ Manager crea diagnóstico
      ↓
┌─────────────────┐
│ En Diagnóstico  │ ← Técnico asignado
└─────────────────┘
      │
      │ Técnico completa diagnóstico
      │ Manager crea cotización
      ↓
┌─────────────────┐
│ En Reparación   │ ← Cotización aprobada
└─────────────────┘
      │
      │ Trabajo terminado
      │ Pago completado
      ↓
┌─────────────┐
│ Completado  │ ← Vehículo listo para entrega
└─────────────┘
      │
      │ Vehículo entregado
      ↓
┌─────────────┐
│  Entregado  │ ← Estado final
└─────────────┘
```

---

## Consideraciones de Performance

### 1. Code Splitting

```javascript
// Lazy loading de componentes
const Estimate = lazy(() => import('./components/Home/Estimate/Estimate'));
const Reports = lazy(() => import('./components/Home/Reports/SalesReportsListView'));

// Uso con Suspense
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/estimate" element={<Estimate />} />
    <Route path="/reports" element={<Reports />} />
  </Routes>
</Suspense>
```

### 2. Memoization

```javascript
// Componentes puros
const VehicleRow = memo(({ vehicle, onEdit, onDelete }) => {
  return (
    <tr>
      <td>{vehicle.vin}</td>
      <td>{vehicle.make}</td>
      {/* ... */}
    </tr>
  );
});

// Callbacks memoizados
const handleEdit = useCallback((id) => {
  navigate(`/edit/${id}`);
}, [navigate]);

// Valores calculados
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.total, 0);
}, [items]);
```

### 3. Optimización de Re-renders

```javascript
// ❌ Malo - crea nueva función en cada render
<Button onClick={() => handleClick(id)}>Click</Button>

// ✅ Bueno - función estable
const handleClickWithId = useCallback(() => {
  handleClick(id);
}, [id, handleClick]);

<Button onClick={handleClickWithId}>Click</Button>
```

---

## Seguridad

### 1. Validación de Input

```javascript
// Validación en el cliente
const validateVehicleForm = (data) => {
  const errors = {};
  
  if (!data.vin || data.vin.length !== 17) {
    errors.vin = 'VIN debe tener 17 caracteres';
  }
  
  if (!data.year || data.year < 1900 || data.year > new Date().getFullYear() + 1) {
    errors.year = 'Año inválido';
  }
  
  return errors;
};
```

### 2. Sanitización de Datos

```javascript
// Escapar HTML
const sanitizeHTML = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};
```

### 3. Protección CSRF

```javascript
// Token CSRF en headers
api.interceptors.request.use(config => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }
  return config;
});
```

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0  
