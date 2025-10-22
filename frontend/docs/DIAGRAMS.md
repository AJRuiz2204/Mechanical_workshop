# 📊 Diagramas y Flujos del Sistema

Este documento contiene diagramas visuales detallados del sistema para facilitar la comprensión de la arquitectura y flujos de trabajo.

---

## 📋 Tabla de Contenidos

1. [Diagrama de Casos de Uso](#diagrama-de-casos-de-uso)
2. [Flujo de Usuario Completo](#flujo-de-usuario-completo)
3. [Diagrama de Base de Datos](#diagrama-de-base-de-datos)
4. [Flujo de Autenticación Detallado](#flujo-de-autenticación-detallado)
5. [Flujo de Cotización Completo](#flujo-de-cotización-completo)
6. [Flujo de Pago](#flujo-de-pago)
7. [Diagrama de Despliegue](#diagrama-de-despliegue)

---

## 1. Diagrama de Casos de Uso

```
┌─────────────────────────────────────────────────────────────────┐
│                   SISTEMA DE TALLER MECÁNICO                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────┐                                                │
│  │   GERENTE  │                                                │
│  │ (Manager)  │                                                │
│  └─────┬──────┘                                                │
│        │                                                        │
│        ├──► Gestionar Usuarios                                 │
│        │    └─ Crear, Editar, Eliminar usuarios                │
│        │                                                        │
│        ├──► Recibir Vehículos                                  │
│        │    └─ Registrar vehículo y propietario                │
│        │                                                        │
│        ├──► Crear Diagnóstico Inicial                          │
│        │    └─ Asignar técnico                                 │
│        │                                                        │
│        ├──► Gestionar Cotizaciones                             │
│        │    ├─ Crear cotización                                │
│        │    ├─ Editar cotización                               │
│        │    ├─ Aprobar/Rechazar                                │
│        │    └─ Generar PDF                                     │
│        │                                                        │
│        ├──► Gestionar Cuentas por Cobrar                       │
│        │    ├─ Ver cuentas pendientes                          │
│        │    ├─ Registrar pagos                                 │
│        │    └─ Generar recibos                                 │
│        │                                                        │
│        ├──► Ver Reportes                                       │
│        │    ├─ Reporte de ventas                               │
│        │    ├─ Reporte por período                             │
│        │    └─ Exportar a PDF/Excel                            │
│        │                                                        │
│        └──► Configurar Sistema                                 │
│             ├─ Datos del taller                                │
│             ├─ Impuestos y markup                              │
│             └─ Usuarios y roles                                │
│                                                                 │
│  ┌────────────┐                                                │
│  │  TÉCNICO   │                                                │
│  │(Technician)│                                                │
│  └─────┬──────┘                                                │
│        │                                                        │
│        ├──► Ver Diagnósticos Asignados                         │
│        │    └─ Lista de vehículos asignados                    │
│        │                                                        │
│        ├──► Crear Diagnóstico Técnico                          │
│        │    ├─ Describir problemas                             │
│        │    ├─ Listar partes necesarias                        │
│        │    ├─ Estimar horas de labor                          │
│        │    └─ Calcular costo total                            │
│        │                                                        │
│        ├──► Actualizar Estado de Diagnóstico                   │
│        │    └─ Marcar como completado                          │
│        │                                                        │
│        └──► Ver Cotizaciones Relacionadas                      │
│             └─ Ver cotizaciones de sus diagnósticos            │
│                                                                 │
│  ┌────────────┐                                                │
│  │   AMBOS    │                                                │
│  │   ROLES    │                                                │
│  └─────┬──────┘                                                │
│        │                                                        │
│        ├──► Iniciar Sesión                                     │
│        │    └─ Autenticación con email/password                │
│        │                                                        │
│        ├──► Recuperar Contraseña                               │
│        │    ├─ Solicitar código                                │
│        │    ├─ Verificar código                                │
│        │    └─ Cambiar contraseña                              │
│        │                                                        │
│        ├──► Ver Lista de Vehículos                             │
│        │    ├─ Buscar vehículos                                │
│        │    ├─ Filtrar por estado                              │
│        │    └─ Ver detalles                                    │
│        │                                                        │
│        ├──► Agregar Notas                                      │
│        │    └─ Comentarios en vehículos/diagnósticos           │
│        │                                                        │
│        └──► Cerrar Sesión                                      │
│             └─ Invalidar sesión actual                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Flujo de Usuario Completo

### Journey del Cliente (Propietario del Vehículo)

```
1. RECEPCIÓN
   Cliente llega al taller con vehículo
            ↓
   Gerente registra vehículo en sistema
   - Datos del vehículo (VIN, marca, modelo)
   - Datos del propietario
   - Descripción del problema
   - Estado: "Recibido"
            ↓
            
2. DIAGNÓSTICO INICIAL
   Gerente crea diagnóstico inicial
   - Asigna técnico
   - Descripción general
   - Estado: "En Diagnóstico"
            ↓
   Técnico recibe notificación
            ↓
            
3. DIAGNÓSTICO TÉCNICO
   Técnico inspecciona vehículo
   - Identifica problemas específicos
   - Lista partes necesarias
   - Estima horas de trabajo
   - Calcula costos
   - Guarda diagnóstico técnico
            ↓
            
4. COTIZACIÓN
   Gerente crea cotización basada en diagnóstico
   - Agrega ítems (partes, labor)
   - Calcula totales con impuestos
   - Genera PDF
   - Envía a cliente por email/WhatsApp
            ↓
   Cliente revisa cotización
            ↓
   
5A. COTIZACIÓN APROBADA
    Cliente acepta cotización
            ↓
    Gerente marca como "Aprobado"
    Estado del vehículo: "En Reparación"
            ↓
    Técnico realiza reparación
            ↓
    Estado: "Completado"
            ↓
    
6. PAGO Y ENTREGA
   Gerente registra pago
   - Pago total o parcial
   - Método de pago
   - Genera recibo
            ↓
   Si pago completo:
   - Estado de cuenta: "Pagado"
   - Entrega vehículo a cliente
            ↓
   Estado final: "Entregado"
   
5B. COTIZACIÓN RECHAZADA
    Cliente rechaza cotización
            ↓
    Gerente marca como "Rechazado"
            ↓
    Opcional: Ajustar cotización y reenviar
            ↓
    Si cliente no acepta: Devolver vehículo
```

---

## 3. Diagrama de Base de Datos (Inferido)

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ PK  UserId      │
│     Email       │
│     Password    │──┐
│     Name        │  │
│     LastName    │  │
│     Role        │  │
│     WorkshopId  │  │
│     IsActive    │  │
└─────────────────┘  │
                     │
┌─────────────────┐  │
│  Workshops      │  │
├─────────────────┤  │
│ PK WorkshopId   │◄─┘
│    Name         │
│    Address      │
│    Phone        │
│    Email        │
│    TaxId        │
└─────────────────┘
                     
┌─────────────────┐
│   Vehicles      │
├─────────────────┤
│ PK VehicleId    │──┐
│    VIN          │  │
│    Make         │  │
│    Model        │  │
│    Year         │  │
│    OwnerName    │  │
│    OwnerPhone   │  │
│    Status       │  │
│    WorkshopId   │  │
└─────────────────┘  │
                     │
┌─────────────────┐  │
│  Diagnostics    │  │
├─────────────────┤  │
│ PK DiagnosticId │  │
│ FK VehicleId    │◄─┤
│ FK TechnicianId │  │
│    Date         │  │
│    Description  │  │
│    Findings     │  │
│    Status       │  │
└─────────────────┘  │
        │            │
        │            │
        ↓            │
┌──────────────────────┐
│TechnicianDiagnostics │
├──────────────────────┤
│ PK TechDiagId        │
│ FK DiagnosticId      │
│ FK VehicleId         │◄┘
│ FK TechnicianId      │
│    ProblemDesc       │
│    Diagnosis         │
│    RequiredParts (JSON)│
│    LaborHours        │
│    TotalCost         │
│    Status            │
└──────────────────────┘
        │
        │
        ↓
┌─────────────────┐
│   Estimates     │
├─────────────────┤
│ PK EstimateId   │──┐
│ FK VehicleId    │  │
│ FK TechDiagId   │  │
│    EstimateNum  │  │
│    Date         │  │
│    Status       │  │
│    Subtotal     │  │
│    Tax          │  │
│    Total        │  │
└─────────────────┘  │
        │            │
        │            │
        ↓            │
┌─────────────────┐  │
│ EstimateItems   │  │
├─────────────────┤  │
│ PK ItemId       │  │
│ FK EstimateId   │◄─┘
│    Type         │
│    Description  │
│    Quantity     │
│    UnitPrice    │
│    Total        │
└─────────────────┘
        
        │
        │
        ↓
┌──────────────────────┐
│ AccountsReceivable   │
├──────────────────────┤
│ PK AccountId         │
│ FK EstimateId        │──┐
│    CustomerName      │  │
│    TotalAmount       │  │
│    PaidAmount        │  │
│    BalanceDue        │  │
│    Status            │  │
└──────────────────────┘  │
                          │
                          │
┌─────────────────┐       │
│   Payments      │       │
├─────────────────┤       │
│ PK PaymentId    │       │
│ FK AccountId    │◄──────┘
│    Date         │
│    Amount       │
│    Method       │
│    Reference    │
└─────────────────┘

┌─────────────────┐
│     Notes       │
├─────────────────┤
│ PK NoteId       │
│ FK VehicleId    │
│ FK UserId       │
│    Content      │
│    CreatedAt    │
└─────────────────┘

┌──────────────────┐
│ WorkshopSettings │
├──────────────────┤
│ PK SettingId     │
│ FK WorkshopId    │
│    Name          │
│    Address       │
│    Phone         │
│    TaxId         │
│    Logo          │
└──────────────────┘

┌──────────────────────┐
│LaborTaxMarkupSettings│
├──────────────────────┤
│ PK SettingId         │
│ FK WorkshopId        │
│    TaxRate           │
│    LaborRate         │
│    PartsMarkup       │
└──────────────────────┘
```

---

## 4. Flujo de Autenticación Detallado

```
┌──────────┐
│ Usuario  │
│ ingresa  │
│ email/pwd│
└────┬─────┘
     │
     ↓
┌─────────────────────────────┐
│  Validación Client-Side     │
│  - Email válido?            │
│  - Password no vacío?       │
└────┬────────────────────────┘
     │
     ↓ [Válido]
┌─────────────────────────────┐
│ POST /api/Users/login       │
│ { email, password }         │
└────┬────────────────────────┘
     │
     ↓
┌─────────────────────────────┐
│   Backend API Handler       │
│   1. Buscar usuario         │
│   2. Verificar contraseña   │
│   3. Generar JWT            │
└────┬────────────────────────┘
     │
     ├──► [Error] Usuario no existe
     │            └─► 404 Not Found
     │
     ├──► [Error] Contraseña incorrecta
     │            └─► 401 Unauthorized
     │
     ↓ [Success]
┌─────────────────────────────┐
│ Response 200 OK             │
│ {                           │
│   token: "JWT...",          │
│   user: {                   │
│     id, email, name,        │
│     lastName, role          │
│   }                         │
│ }                           │
└────┬────────────────────────┘
     │
     ↓
┌─────────────────────────────┐
│ Frontend recibe respuesta   │
│ 1. Guardar token            │
│    localStorage.setItem()   │
│ 2. Guardar user data        │
│    AuthContext.login()      │
└────┬────────────────────────┘
     │
     ↓
┌─────────────────────────────┐
│ Configurar Axios            │
│ Agregar token a headers:    │
│ Authorization: Bearer <JWT> │
└────┬────────────────────────┘
     │
     ↓
┌─────────────────────────────┐
│ Navigate("/home")           │
│ Redirección al dashboard    │
└────┬────────────────────────┘
     │
     ↓
┌─────────────────────────────┐
│ ProtectedRoute verifica:    │
│ - Token existe?             │
│ - Token válido?             │
│ - Rol correcto?             │
└────┬────────────────────────┘
     │
     ├──► [No autenticado]
     │    └─► Redirect("/login")
     │
     ├──► [Rol incorrecto]
     │    └─► Redirect("/unauthorized")
     │
     ↓ [Autorizado]
┌─────────────────────────────┐
│ Render Dashboard/Home       │
└─────────────────────────────┘
```

---

## 5. Flujo de Cotización Completo

```
INICIO
  │
  ↓
┌────────────────────────────────┐
│ Gerente navega a /estimates    │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ EstimateList carga cotizaciones│
│ GET /api/Estimates             │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Click "Nueva Cotización"       │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Navigate to /estimate/new      │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Estimate Component inicializa  │
│ Carga datos necesarios:        │
│ - GET /api/Vehicles            │
│ - GET /api/TechDiagnostics     │
│ - GET /api/WorkshopSettings    │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Usuario selecciona vehículo    │
│ (Dropdown con búsqueda)        │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Auto-carga diagnóstico técnico │
│ Si existe diagnóstico          │
│ - Pre-llena items de partes    │
│ - Pre-llena labor              │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Usuario agrega/edita items     │
│ Click "Agregar Item"           │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Modal de Agregar Item          │
│ - Seleccionar tipo             │
│   • Parte                      │
│   • Labor                      │
│   • Servicio                   │
│ - Ingresar descripción         │
│ - Ingresar cantidad            │
│ - Ingresar precio unitario     │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Cálculos automáticos:          │
│ subtotal = qty × unitPrice     │
│ tax = subtotal × taxRate       │
│ total = subtotal + tax         │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Item agregado a tabla          │
│ Recalcular totales generales   │
└───────────┬────────────────────┘
            │
            ↓ [Repetir para más items]
            │
            ↓
┌────────────────────────────────┐
│ Totales Finales:               │
│ Subtotal = Σ(item.subtotal)    │
│ IVA = subtotal × 0.16          │
│ Descuento = subtotal × %       │
│ Total = subtotal + IVA - desc  │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Usuario click "Guardar"        │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Validación de datos:           │
│ - Vehículo seleccionado?       │
│ - Al menos un item?            │
│ - Todos los precios válidos?   │
└───────────┬────────────────────┘
            │
            ├──► [Error] Mostrar mensaje
            │            toast.error()
            │
            ↓ [Válido]
┌────────────────────────────────┐
│ POST /api/Estimates            │
│ {                              │
│   vehicleId,                   │
│   estimateNumber,              │
│   items: [...],                │
│   subtotal, tax, total         │
│ }                              │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Backend valida y guarda        │
│ - Guarda Estimate              │
│ - Guarda EstimateItems         │
│ - Crea AccountReceivable       │
│ - Retorna ID generado          │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Response 201 Created           │
│ { id, estimateNumber, ... }    │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ toast.success()                │
│ "Cotización creada exitosamente"│
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Navigate("/estimates")         │
│ Volver a lista de cotizaciones │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ EstimateList se recarga        │
│ Nueva cotización aparece       │
└────────────────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Acciones disponibles:          │
│ - Ver PDF                      │
│ - Editar                       │
│ - Eliminar                     │
│ - Cambiar estado               │
└────────────────────────────────┘
            │
            ↓ [Ver PDF]
┌────────────────────────────────┐
│ Abrir PDFModal                 │
│ - EstimatePDF renderiza        │
│ - Preview en pantalla          │
│ - Opción de descargar          │
└────────────────────────────────┘
            │
            ↓
          FIN
```

---

## 6. Flujo de Pago

```
INICIO - Gerente en AccountsReceivable View
  │
  ↓
┌────────────────────────────────┐
│ Lista de cuentas pendientes    │
│ GET /api/AccountReceivable     │
│ Muestra:                       │
│ - Cliente                      │
│ - Total                        │
│ - Pagado                       │
│ - Balance pendiente            │
│ - Estado                       │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Usuario click "Registrar Pago" │
│ en una cuenta                  │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Modal de Registro de Pago      │
│ Pre-llena:                     │
│ - Información del cliente      │
│ - Balance pendiente            │
│ - Historial de pagos previos   │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Usuario ingresa datos:         │
│ - Monto a pagar                │
│ - Método de pago               │
│   • Efectivo                   │
│   • Tarjeta                    │
│   • Transferencia              │
│   • Cheque                     │
│ - Número de referencia (opt)   │
│ - Notas (opt)                  │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Validación:                    │
│ - Monto > 0?                   │
│ - Monto <= balance?            │
│ - Método seleccionado?         │
└───────────┬────────────────────┘
            │
            ├──► [Error] Mostrar mensaje
            │
            ↓ [Válido]
┌────────────────────────────────┐
│ Usuario click "Confirmar Pago" │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ POST /api/AccountReceivable/   │
│      Payment                   │
│ {                              │
│   accountReceivableId,         │
│   amount,                      │
│   paymentMethod,               │
│   referenceNumber,             │
│   notes                        │
│ }                              │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Backend procesa:               │
│ 1. Crear Payment record        │
│ 2. Actualizar AccountReceivable│
│    - paidAmount += amount      │
│    - balanceDue -= amount      │
│ 3. Si balanceDue = 0:          │
│    - status = "Pagado"         │
│ 4. Si 0 < balanceDue < total:  │
│    - status = "Parcial"        │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Response 201 Created           │
│ { paymentId, ... }             │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ toast.success()                │
│ "Pago registrado exitosamente" │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Cerrar modal                   │
│ Recargar lista de cuentas      │
│ Estado actualizado              │
└───────────┬────────────────────┘
            │
            ↓
┌────────────────────────────────┐
│ Opciones disponibles:          │
│ - Ver recibo de pago (PDF)     │
│ - Ver historial de pagos       │
│ - Registrar otro pago          │
└────────────────────────────────┘
            │
            ↓ [Ver Recibo]
┌────────────────────────────────┐
│ Generar PDF de recibo          │
│ Incluye:                       │
│ - Datos del taller             │
│ - Datos del cliente            │
│ - Monto pagado                 │
│ - Método de pago               │
│ - Balance restante             │
│ - Firma/Sello                  │
└────────────────────────────────┘
            │
            ↓
          FIN
```

---

## 7. Diagrama de Despliegue

```
┌────────────────────────────────────────────────────────────┐
│                      CLIENTE (Navegador)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   Chrome     │  │   Firefox    │  │   Edge/Safari  │  │
│  └──────────────┘  └──────────────┘  └────────────────┘  │
│                   React SPA (JavaScript)                   │
└────────────────────┬───────────────────────────────────────┘
                     │ HTTPS
                     │
                     ↓
┌────────────────────────────────────────────────────────────┐
│                    CDN / WEB SERVER                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              IIS / Nginx / Apache                    │ │
│  │  Sirve:                                              │ │
│  │  - index.html                                        │ │
│  │  - assets/*.js (bundled React app)                  │ │
│  │  - assets/*.css (estilos)                           │ │
│  │  - images/                                           │ │
│  │  - web.config (redirect rules)                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Ubicación:                                                │
│  - Desarrollo: http://localhost:5173                       │
│  - IIS: C:\inetpub\wwwroot\workshop                        │
│  - Azure: Static Web App                                   │
└────────────────────┬───────────────────────────────────────┘
                     │ HTTPS/API Calls
                     │
                     ↓
┌────────────────────────────────────────────────────────────┐
│                    BACKEND API SERVER                      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              ASP.NET Core Web API                    │ │
│  │  Puerto: 5121                                        │ │
│  │  Endpoints:                                          │ │
│  │  - /api/Users/*                                      │ │
│  │  - /api/Vehicles/*                                   │ │
│  │  - /api/Diagnostics/*                                │ │
│  │  - /api/Estimates/*                                  │ │
│  │  - /api/AccountReceivable/*                          │ │
│  │  - /api/Reports/*                                    │ │
│  │  ...                                                 │ │
│  │                                                      │ │
│  │  Middleware:                                         │ │
│  │  - Authentication (JWT)                              │ │
│  │  - CORS                                              │ │
│  │  - Error Handling                                    │ │
│  │  - Logging                                           │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Ubicación:                                                │
│  - Desarrollo: http://localhost:5121                       │
│  - Producción: https://api.j-benz.com                      │
│  - Azure: App Service                                      │
└────────────────────┬───────────────────────────────────────┘
                     │ SQL Connection
                     │ (Entity Framework Core)
                     │
                     ↓
┌────────────────────────────────────────────────────────────┐
│                    DATABASE SERVER                         │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Microsoft SQL Server                    │ │
│  │  Database: WorkshopDB                                │ │
│  │  Tables:                                             │ │
│  │  - Users                                             │ │
│  │  - Workshops                                         │ │
│  │  - Vehicles                                          │ │
│  │  - Diagnostics                                       │ │
│  │  - TechnicianDiagnostics                             │ │
│  │  - Estimates                                         │ │
│  │  - EstimateItems                                     │ │
│  │  - AccountsReceivable                                │ │
│  │  - Payments                                          │ │
│  │  - Notes                                             │ │
│  │  - WorkshopSettings                                  │ │
│  │  ...                                                 │ │
│  │                                                      │ │
│  │  Features:                                           │ │
│  │  - Backups automáticos                               │ │
│  │  - Replicación (opcional)                            │ │
│  │  - Logs de transacciones                             │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Ubicación:                                                │
│  - Desarrollo: localhost\SQLEXPRESS                        │
│  - Producción: Azure SQL Database                          │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                   SERVICIOS EXTERNOS                       │
├────────────────────────────────────────────────────────────┤
│  EmailJS (https://api.emailjs.com)                         │
│  - Envío de emails de recuperación de contraseña           │
│  - Envío de cotizaciones por email (opcional)              │
└────────────────────────────────────────────────────────────┘
```

### Arquitectura de Producción Recomendada

```
Internet
   │
   ↓
[Load Balancer / Azure Front Door]
   │
   ├──► [Web Server 1] ─┐
   │                     │
   └──► [Web Server 2] ─┤
                        │
                        ↓
                   [API Gateway]
                        │
                        ├──► [API Server 1] ─┐
                        │                     │
                        └──► [API Server 2] ─┤
                                             │
                                             ↓
                                    [Database Cluster]
                                    Primary ←→ Secondary
                                             │
                                             ↓
                                      [Backup Storage]
```

---

## 🔒 Diagrama de Seguridad

```
┌─────────────────────────────────────────────────────────┐
│                    CAPAS DE SEGURIDAD                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. HTTPS / TLS                                         │
│     └─ Cifrado en tránsito                              │
│                                                         │
│  2. JWT Authentication                                  │
│     ├─ Token con expiración                             │
│     ├─ Firma digital (HMAC)                             │
│     └─ Payload: { userId, role, exp }                   │
│                                                         │
│  3. Role-Based Access Control (RBAC)                    │
│     ├─ Manager: Full access                             │
│     └─ Technician: Limited access                       │
│                                                         │
│  4. CORS Policy                                         │
│     └─ Allow only frontend domain                       │
│                                                         │
│  5. Input Validation                                    │
│     ├─ Frontend validation (UI)                         │
│     └─ Backend validation (API)                         │
│                                                         │
│  6. SQL Injection Protection                            │
│     └─ Entity Framework (parametrized queries)          │
│                                                         │
│  7. XSS Protection                                      │
│     ├─ React auto-escapes                               │
│     └─ Content Security Policy headers                  │
│                                                         │
│  8. Password Security                                   │
│     ├─ Bcrypt hashing                                   │
│     └─ Minimum complexity requirements                  │
│                                                         │
│  9. Rate Limiting                                       │
│     └─ Prevenir ataques de fuerza bruta                 │
│                                                         │
│  10. Logging & Monitoring                               │
│      ├─ Audit logs                                      │
│      └─ Anomaly detection                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0  
