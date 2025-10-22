# 🗄️ Esquema de Base de Datos - Mechanical Workshop

## Índice

1. [Descripción General](#descripción-general)
2. [Diagrama de Entidad-Relación](#diagrama-de-entidad-relación)
3. [Tablas del Sistema](#tablas-del-sistema)
4. [Relaciones](#relaciones)
5. [Índices y Constraints](#índices-y-constraints)
6. [Procedimientos y Funciones](#procedimientos-y-funciones)
7. [Scripts SQL](#scripts-sql)

---

## 1. Descripción General

El sistema utiliza **MySQL 8.0** / **MariaDB 10.5+** como motor de base de datos. La base de datos se llama **JBenz** y contiene 17 tablas principales que gestionan toda la información del taller mecánico.

### Características de la Base de Datos

- **Motor:** InnoDB (transaccional)
- **Charset:** utf8mb4
- **Collation:** utf8mb4_unicode_ci
- **Foreign Keys:** Habilitadas con cascada
- **Timestamps:** Automáticos (CreatedAt, UpdatedAt)

---

## 2. Diagrama de Entidad-Relación

```
┌─────────────┐
│    Users    │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────▼──────────┐
│  UserWorkshops  │
└──────┬──────────┘
       │ 1
       │
       │ N
┌──────▼──────┐        ┌────────────────────┐
│  Vehicles   │───────▶│  Diagnostics       │
└─────────────┘   1:N  └──────┬─────────────┘
                              │ 1
                              │
                    ┌─────────┼──────────┐
                    │         │          │
                    │ N       │ N        │ N
         ┌──────────▼──┐  ┌───▼────┐  ┌─▼────┐
         │ Technician  │  │ Notes  │  │Estimates│
         │ Diagnostics │  └────────┘  └──┬──────┘
         └─────────────┘                  │ 1
                                          │
                    ┌─────────────────────┼────────────┐
                    │                     │            │
                    │ N                   │ N          │ N
         ┌──────────▼──────┐   ┌─────────▼───┐  ┌────▼─────────┐
         │ EstimateParts   │   │EstimateLabor│  │EstimateFlatFee│
         └─────────────────┘   └─────────────┘  └──────────────┘

┌──────────────────┐       ┌────────────────────┐
│   Estimates      │──────▶│ AccountReceivable  │
└──────────────────┘ 1:1   └──────┬─────────────┘
                                  │ 1
                                  │
                                  │ N
                           ┌──────▼──────┐
                           │  Payments   │
                           └─────────────┘

┌──────────────────┐       ┌────────────────────┐
│  SalesReports    │──────▶│SalesReportDetails  │
└──────────────────┘ 1:N   └────────────────────┘

┌──────────────────────┐   ┌──────────────────────┐
│  WorkshopSettings    │   │LaborTaxMarkupSettings│
└──────────────────────┘   └──────────────────────┘
```

---

## 3. Tablas del Sistema

### 3.1 Users (Usuarios)

Almacena la información de los usuarios del sistema.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| ID | INT | PK, AUTO_INCREMENT | Identificador único |
| Email | VARCHAR(100) | NOT NULL, UNIQUE | Correo electrónico |
| Name | VARCHAR(100) | NOT NULL | Nombre |
| LastName | VARCHAR(100) | NOT NULL | Apellido |
| Username | VARCHAR(50) | NOT NULL, UNIQUE | Usuario para login |
| Password | VARCHAR(255) | NOT NULL | Hash de contraseña (BCrypt) |
| Profile | VARCHAR(50) | NOT NULL | Perfil (Admin, User, etc.) |
| ResetCode | VARCHAR(10) | NULL | Código de recuperación |
| ResetCodeExpiry | DATETIME | NULL | Expiración del código |

**Índices:**
- PRIMARY KEY (ID)
- UNIQUE KEY (Email)
- UNIQUE KEY (Username)

**SQL de Creación:**
```sql
CREATE TABLE Users (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Name VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Profile VARCHAR(50) NOT NULL,
    ResetCode VARCHAR(10) NULL,
    ResetCodeExpiry DATETIME NULL,
    INDEX idx_username (Username),
    INDEX idx_email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.2 UserWorkshops (Talleres)

Almacena información de los talleres de los usuarios.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| ID | INT | PK, AUTO_INCREMENT | Identificador único |
| UserID | INT | FK → Users(ID) | Usuario propietario |
| WorkshopName | VARCHAR(200) | NOT NULL | Nombre del taller |
| OwnerName | VARCHAR(200) | NOT NULL | Nombre del dueño |
| PhoneNumber | VARCHAR(20) | NOT NULL | Teléfono |
| Email | VARCHAR(100) | NOT NULL | Email del taller |
| Address | VARCHAR(300) | NOT NULL | Dirección |
| City | VARCHAR(100) | NULL | Ciudad |
| State | VARCHAR(100) | NULL | Estado/Provincia |
| ZipCode | VARCHAR(20) | NULL | Código postal |
| CreatedAt | DATETIME | DEFAULT NOW() | Fecha de creación |

**SQL de Creación:**
```sql
CREATE TABLE UserWorkshops (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    WorkshopName VARCHAR(200) NOT NULL,
    OwnerName VARCHAR(200) NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Address VARCHAR(300) NOT NULL,
    City VARCHAR(100) NULL,
    State VARCHAR(100) NULL,
    ZipCode VARCHAR(20) NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE,
    INDEX idx_userid (UserID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.3 Vehicles (Vehículos)

Almacena información de vehículos de clientes.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| ID | INT | PK, AUTO_INCREMENT | Identificador único |
| UserWorkshopID | INT | FK → UserWorkshops(ID) | Taller asociado |
| Brand | VARCHAR(100) | NOT NULL | Marca |
| Model | VARCHAR(100) | NOT NULL | Modelo |
| Year | INT | NOT NULL | Año |
| PlateNumber | VARCHAR(20) | NOT NULL, UNIQUE | Número de placa |
| VIN | VARCHAR(17) | NOT NULL, UNIQUE | VIN |
| Color | VARCHAR(50) | NOT NULL | Color |
| OwnerName | VARCHAR(200) | NOT NULL | Propietario |
| OwnerPhone | VARCHAR(20) | NOT NULL | Teléfono del propietario |
| OwnerEmail | VARCHAR(100) | NULL | Email del propietario |
| CreatedAt | DATETIME | DEFAULT NOW() | Fecha de registro |

**SQL de Creación:**
```sql
CREATE TABLE Vehicles (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    UserWorkshopID INT NOT NULL,
    Brand VARCHAR(100) NOT NULL,
    Model VARCHAR(100) NOT NULL,
    Year INT NOT NULL,
    PlateNumber VARCHAR(20) NOT NULL UNIQUE,
    VIN VARCHAR(17) NOT NULL UNIQUE,
    Color VARCHAR(50) NOT NULL,
    OwnerName VARCHAR(200) NOT NULL,
    OwnerPhone VARCHAR(20) NOT NULL,
    OwnerEmail VARCHAR(100) NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserWorkshopID) REFERENCES UserWorkshops(ID) ON DELETE CASCADE,
    INDEX idx_workshop (UserWorkshopID),
    INDEX idx_plate (PlateNumber),
    INDEX idx_vin (VIN)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.4 Diagnostics (Diagnósticos)

Almacena diagnósticos iniciales de vehículos.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| ID | INT | PK, AUTO_INCREMENT | Identificador único |
| VehicleID | INT | FK → Vehicles(ID) | Vehículo diagnosticado |
| DateReceived | DATETIME | DEFAULT NOW() | Fecha de recepción |
| Mileage | INT | NULL | Kilometraje |
| Symptoms | TEXT | NOT NULL | Síntomas reportados |
| Status | VARCHAR(50) | NOT NULL | Estado (Pending, InProgress, Completed) |
| CreatedAt | DATETIME | DEFAULT NOW() | Fecha de creación |

**SQL de Creación:**
```sql
CREATE TABLE Diagnostics (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    VehicleID INT NOT NULL,
    DateReceived DATETIME DEFAULT CURRENT_TIMESTAMP,
    Mileage INT NULL,
    Symptoms TEXT NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (VehicleID) REFERENCES Vehicles(ID) ON DELETE CASCADE,
    INDEX idx_vehicle (VehicleID),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.5 TechnicianDiagnostics (Diagnósticos Técnicos)

Diagnósticos detallados realizados por técnicos.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| ID | INT | PK, AUTO_INCREMENT | Identificador único |
| DiagnosticID | INT | FK → Diagnostics(ID) | Diagnóstico asociado |
| TechnicianName | VARCHAR(200) | NOT NULL | Nombre del técnico |
| ExtendedDiagnostic | TEXT | NOT NULL | Diagnóstico extendido |
| Recommendations | TEXT | NULL | Recomendaciones |
| DateCreated | DATETIME | DEFAULT NOW() | Fecha de creación |

**SQL de Creación:**
```sql
CREATE TABLE TechnicianDiagnostics (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    DiagnosticID INT NOT NULL,
    TechnicianName VARCHAR(200) NOT NULL,
    ExtendedDiagnostic TEXT NOT NULL,
    Recommendations TEXT NULL,
    DateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (DiagnosticID) REFERENCES Diagnostics(ID) ON DELETE CASCADE,
    INDEX idx_diagnostic (DiagnosticID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.6 Notes (Notas)

Notas asociadas a diagnósticos.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| ID | INT | PK, AUTO_INCREMENT | Identificador único |
| DiagnosticID | INT | FK → Diagnostics(ID) | Diagnóstico asociado |
| Content | TEXT | NOT NULL | Contenido de la nota |
| Author | VARCHAR(200) | NOT NULL | Autor |
| CreatedAt | DATETIME | DEFAULT NOW() | Fecha de creación |

**SQL de Creación:**
```sql
CREATE TABLE Notes (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    DiagnosticID INT NOT NULL,
    Content TEXT NOT NULL,
    Author VARCHAR(200) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (DiagnosticID) REFERENCES Diagnostics(ID) ON DELETE CASCADE,
    INDEX idx_diagnostic (DiagnosticID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.7 Estimates (Presupuestos)

Presupuestos generados para reparaciones.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| ID | INT | PK, AUTO_INCREMENT | Identificador único |
| VehicleID | INT | FK → Vehicles(ID) | Vehículo |
| UserWorkshopID | INT | FK → UserWorkshops(ID) | Taller |
| TechnicianDiagnosticID | INT | FK → TechnicianDiagnostics(ID), NULL | Diagnóstico técnico |
| Date | DATETIME | DEFAULT NOW() | Fecha del presupuesto |
| Mileage | INT | NULL | Kilometraje |
| CustomerNote | VARCHAR(500) | NULL | Nota del cliente |
| ExtendedDiagnostic | TEXT | NULL | Diagnóstico extendido |
| Subtotal | DECIMAL(10,2) | NOT NULL | Subtotal |
| Tax | DECIMAL(10,2) | NOT NULL | Impuestos |
| Total | DECIMAL(10,2) | NOT NULL | Total |
| AuthorizationStatus | VARCHAR(20) | NOT NULL | Estado (InReview, Authorized, Rejected) |
| CreatedAt | DATETIME | DEFAULT NOW() | Fecha de creación |

**SQL de Creación:**
```sql
CREATE TABLE Estimates (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    VehicleID INT NOT NULL,
    UserWorkshopID INT NOT NULL,
    TechnicianDiagnosticID INT NULL,
    Date DATETIME DEFAULT CURRENT_TIMESTAMP,
    Mileage INT NULL,
    CustomerNote VARCHAR(500) NULL,
    ExtendedDiagnostic TEXT NULL,
    Subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    AuthorizationStatus VARCHAR(20) NOT NULL DEFAULT 'InReview',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (VehicleID) REFERENCES Vehicles(ID) ON DELETE CASCADE,
    FOREIGN KEY (UserWorkshopID) REFERENCES UserWorkshops(ID) ON DELETE CASCADE,
    FOREIGN KEY (TechnicianDiagnosticID) REFERENCES TechnicianDiagnostics(ID) ON DELETE SET NULL,
    INDEX idx_vehicle (VehicleID),
    INDEX idx_workshop (UserWorkshopID),
    INDEX idx_status (AuthorizationStatus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.8 EstimateParts (Partes del Presupuesto)

Partes incluidas en presupuestos.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| ID | INT | PK, AUTO_INCREMENT | Identificador único |
| EstimateID | INT | FK → Estimates(ID) | Presupuesto |
| Description | VARCHAR(300) | NOT NULL | Descripción |
| Quantity | INT | NOT NULL | Cantidad |
| UnitPrice | DECIMAL(10,2) | NOT NULL | Precio unitario |
| Total | DECIMAL(10,2) | NOT NULL | Total |

**SQL de Creación:**
```sql
CREATE TABLE EstimateParts (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    EstimateID INT NOT NULL,
    Description VARCHAR(300) NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    UnitPrice DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (EstimateID) REFERENCES Estimates(ID) ON DELETE CASCADE,
    INDEX idx_estimate (EstimateID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.9 EstimateLabors (Mano de Obra)

Mano de obra incluida en presupuestos.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| ID | INT | PK, AUTO_INCREMENT | Identificador único |
| EstimateID | INT | FK → Estimates(ID) | Presupuesto |
| Description | VARCHAR(300) | NOT NULL | Descripción |
| Hours | DECIMAL(5,2) | NOT NULL | Horas |
| HourlyRate | DECIMAL(10,2) | NOT NULL | Tarifa por hora |
| Total | DECIMAL(10,2) | NOT NULL | Total |

**SQL de Creación:**
```sql
CREATE TABLE EstimateLabors (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    EstimateID INT NOT NULL,
    Description VARCHAR(300) NOT NULL,
    Hours DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    HourlyRate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (EstimateID) REFERENCES Estimates(ID) ON DELETE CASCADE,
    INDEX idx_estimate (EstimateID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.10 EstimateFlatFees (Tarifas Planas)

Tarifas planas en presupuestos.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| ID | INT | PK, AUTO_INCREMENT | Identificador único |
| EstimateID | INT | FK → Estimates(ID) | Presupuesto |
| Description | VARCHAR(300) | NOT NULL | Descripción |
| Amount | DECIMAL(10,2) | NOT NULL | Monto |

**SQL de Creación:**
```sql
CREATE TABLE EstimateFlatFees (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    EstimateID INT NOT NULL,
    Description VARCHAR(300) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (EstimateID) REFERENCES Estimates(ID) ON DELETE CASCADE,
    INDEX idx_estimate (EstimateID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.11 AccountsReceivable (Cuentas por Cobrar)

Gestión de cuentas por cobrar.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| ID | INT | PK, AUTO_INCREMENT | Identificador único |
| CustomerID | INT | FK → Users(ID) | Cliente |
| EstimateID | INT | FK → Estimates(ID), UNIQUE | Presupuesto (relación 1:1) |
| TotalAmount | DECIMAL(10,2) | NOT NULL | Monto total |
| AmountPaid | DECIMAL(10,2) | DEFAULT 0.00 | Monto pagado |
| Balance | DECIMAL(10,2) | NOT NULL | Saldo pendiente |
| DueDate | DATETIME | NOT NULL | Fecha de vencimiento |
| Status | VARCHAR(20) | NOT NULL | Estado (Pending, Partial, Paid, Overdue) |
| CreatedAt | DATETIME | DEFAULT NOW() | Fecha de creación |

**SQL de Creación:**
```sql
CREATE TABLE AccountsReceivable (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT NOT NULL,
    EstimateID INT NOT NULL UNIQUE,
    TotalAmount DECIMAL(10,2) NOT NULL,
    AmountPaid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Balance DECIMAL(10,2) NOT NULL,
    DueDate DATETIME NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES Users(ID) ON DELETE RESTRICT,
    FOREIGN KEY (EstimateID) REFERENCES Estimates(ID) ON DELETE CASCADE,
    INDEX idx_customer (CustomerID),
    INDEX idx_status (Status),
    INDEX idx_duedate (DueDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.12 Payments (Pagos)

Registros de pagos realizados.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| ID | INT | PK, AUTO_INCREMENT | Identificador único |
| AccountReceivableID | INT | FK → AccountsReceivable(ID) | Cuenta por cobrar |
| Amount | DECIMAL(10,2) | NOT NULL | Monto pagado |
| PaymentMethod | VARCHAR(50) | NOT NULL | Método (Cash, CreditCard, etc.) |
| PaymentDate | DATETIME | DEFAULT NOW() | Fecha del pago |
| Notes | VARCHAR(500) | NULL | Notas |
| CreatedAt | DATETIME | DEFAULT NOW() | Fecha de creación |

**SQL de Creación:**
```sql
CREATE TABLE Payments (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    AccountReceivableID INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentMethod VARCHAR(50) NOT NULL,
    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Notes VARCHAR(500) NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AccountReceivableID) REFERENCES AccountsReceivable(ID) ON DELETE CASCADE,
    INDEX idx_account (AccountReceivableID),
    INDEX idx_date (PaymentDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.13 SalesReports (Reportes de Ventas)

Reportes consolidados de ventas.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| ID | INT | PK, AUTO_INCREMENT | Identificador único |
| WorkshopID | INT | FK → UserWorkshops(ID) | Taller |
| ReportDate | DATETIME | DEFAULT NOW() | Fecha del reporte |
| StartDate | DATETIME | NOT NULL | Fecha inicio |
| EndDate | DATETIME | NOT NULL | Fecha fin |
| TotalSales | DECIMAL(12,2) | NOT NULL | Total de ventas |
| TotalEstimates | INT | NOT NULL | Total de presupuestos |
| AverageSale | DECIMAL(10,2) | NULL | Venta promedio |
| CreatedAt | DATETIME | DEFAULT NOW() | Fecha de creación |

**SQL de Creación:**
```sql
CREATE TABLE SalesReports (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    WorkshopID INT NOT NULL,
    ReportDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    StartDate DATETIME NOT NULL,
    EndDate DATETIME NOT NULL,
    TotalSales DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    TotalEstimates INT NOT NULL DEFAULT 0,
    AverageSale DECIMAL(10,2) NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (WorkshopID) REFERENCES UserWorkshops(ID) ON DELETE CASCADE,
    INDEX idx_workshop (WorkshopID),
    INDEX idx_dates (StartDate, EndDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.14 SalesReportDetails (Detalles de Reportes)

Detalles de reportes de ventas.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| ID | INT | PK, AUTO_INCREMENT | Identificador único |
| SalesReportID | INT | FK → SalesReports(ID) | Reporte de ventas |
| EstimateID | INT | FK → Estimates(ID) | Presupuesto |
| VehiclePlate | VARCHAR(20) | NOT NULL | Placa del vehículo |
| CustomerName | VARCHAR(200) | NOT NULL | Nombre del cliente |
| Amount | DECIMAL(10,2) | NOT NULL | Monto |
| Date | DATETIME | NOT NULL | Fecha |

**SQL de Creación:**
```sql
CREATE TABLE SalesReportDetails (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    SalesReportID INT NOT NULL,
    EstimateID INT NOT NULL,
    VehiclePlate VARCHAR(20) NOT NULL,
    CustomerName VARCHAR(200) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    Date DATETIME NOT NULL,
    FOREIGN KEY (SalesReportID) REFERENCES SalesReports(ID) ON DELETE CASCADE,
    FOREIGN KEY (EstimateID) REFERENCES Estimates(ID) ON DELETE CASCADE,
    INDEX idx_report (SalesReportID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.15 WorkshopSettings (Configuración del Taller)

Configuraciones generales del taller.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| ID | INT | PK, AUTO_INCREMENT | Identificador único |
| WorkshopID | INT | FK → UserWorkshops(ID), UNIQUE | Taller |
| TaxRate | DECIMAL(5,2) | NOT NULL | Tasa de impuesto (%) |
| Currency | VARCHAR(10) | NOT NULL | Moneda (MXN, USD, etc.) |
| InvoicePrefix | VARCHAR(10) | NULL | Prefijo de factura |
| NextInvoiceNumber | INT | DEFAULT 1 | Siguiente número de factura |
| TermsAndConditions | TEXT | NULL | Términos y condiciones |
| CreatedAt | DATETIME | DEFAULT NOW() | Fecha de creación |
| UpdatedAt | DATETIME | ON UPDATE NOW() | Última actualización |

**SQL de Creación:**
```sql
CREATE TABLE WorkshopSettings (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    WorkshopID INT NOT NULL UNIQUE,
    TaxRate DECIMAL(5,2) NOT NULL DEFAULT 16.00,
    Currency VARCHAR(10) NOT NULL DEFAULT 'MXN',
    InvoicePrefix VARCHAR(10) NULL,
    NextInvoiceNumber INT NOT NULL DEFAULT 1,
    TermsAndConditions TEXT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (WorkshopID) REFERENCES UserWorkshops(ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.16 LaborTaxMarkupSettings (Configuración Labor/Tax/Markup)

Configuraciones de tarifas, impuestos y markup.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| ID | INT | PK, AUTO_INCREMENT | Identificador único |
| WorkshopID | INT | FK → UserWorkshops(ID), UNIQUE | Taller |
| LaborRate | DECIMAL(10,2) | NOT NULL | Tarifa por hora |
| TaxRate | DECIMAL(5,2) | NOT NULL | Tasa de impuesto (%) |
| PartsMarkup | DECIMAL(5,2) | NOT NULL | Markup de partes (%) |
| LaborMarkup | DECIMAL(5,2) | NOT NULL | Markup de mano de obra (%) |
| CreatedAt | DATETIME | DEFAULT NOW() | Fecha de creación |
| UpdatedAt | DATETIME | ON UPDATE NOW() | Última actualización |

**SQL de Creación:**
```sql
CREATE TABLE LaborTaxMarkupSettings (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    WorkshopID INT NOT NULL UNIQUE,
    LaborRate DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    TaxRate DECIMAL(5,2) NOT NULL DEFAULT 16.00,
    PartsMarkup DECIMAL(5,2) NOT NULL DEFAULT 25.00,
    LaborMarkup DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (WorkshopID) REFERENCES UserWorkshops(ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3.17 Reports (Reportes Generales)

_(Tabla auxiliar para reportes - puede estar vacía o en desuso)_

---

## 4. Relaciones

### Relaciones Principales

1. **Users → UserWorkshops** (1:N)
   - Un usuario puede tener múltiples talleres
   - ON DELETE CASCADE

2. **UserWorkshops → Vehicles** (1:N)
   - Un taller puede tener múltiples vehículos
   - ON DELETE CASCADE

3. **Vehicles → Diagnostics** (1:N)
   - Un vehículo puede tener múltiples diagnósticos
   - ON DELETE CASCADE

4. **Diagnostics → TechnicianDiagnostics** (1:N)
   - Un diagnóstico puede tener múltiples diagnósticos técnicos
   - ON DELETE CASCADE

5. **Diagnostics → Notes** (1:N)
   - Un diagnóstico puede tener múltiples notas
   - ON DELETE CASCADE

6. **TechnicianDiagnostics → Estimates** (1:N, opcional)
   - Un diagnóstico técnico puede estar en múltiples presupuestos
   - ON DELETE SET NULL

7. **Vehicles → Estimates** (1:N)
   - Un vehículo puede tener múltiples presupuestos
   - ON DELETE CASCADE

8. **UserWorkshops → Estimates** (1:N)
   - Un taller genera múltiples presupuestos
   - ON DELETE CASCADE

9. **Estimates → EstimateParts/Labors/FlatFees** (1:N)
   - Un presupuesto tiene múltiples líneas de detalle
   - ON DELETE CASCADE

10. **Estimates → AccountsReceivable** (1:1)
    - Un presupuesto puede generar una cuenta por cobrar
    - ON DELETE CASCADE

11. **AccountsReceivable → Payments** (1:N)
    - Una cuenta por cobrar puede tener múltiples pagos
    - ON DELETE CASCADE

12. **UserWorkshops → SalesReports** (1:N)
    - Un taller genera múltiples reportes de ventas
    - ON DELETE CASCADE

13. **SalesReports → SalesReportDetails** (1:N)
    - Un reporte contiene múltiples detalles
    - ON DELETE CASCADE

---

## 5. Índices y Constraints

### Índices de Rendimiento

```sql
-- Índices en Users
CREATE INDEX idx_users_username ON Users(Username);
CREATE INDEX idx_users_email ON Users(Email);

-- Índices en Vehicles
CREATE INDEX idx_vehicles_plate ON Vehicles(PlateNumber);
CREATE INDEX idx_vehicles_vin ON Vehicles(VIN);
CREATE INDEX idx_vehicles_workshop ON Vehicles(UserWorkshopID);

-- Índices en Diagnostics
CREATE INDEX idx_diagnostics_vehicle ON Diagnostics(VehicleID);
CREATE INDEX idx_diagnostics_status ON Diagnostics(Status);

-- Índices en Estimates
CREATE INDEX idx_estimates_vehicle ON Estimates(VehicleID);
CREATE INDEX idx_estimates_workshop ON Estimates(UserWorkshopID);
CREATE INDEX idx_estimates_status ON Estimates(AuthorizationStatus);
CREATE INDEX idx_estimates_date ON Estimates(Date);

-- Índices en AccountsReceivable
CREATE INDEX idx_ar_customer ON AccountsReceivable(CustomerID);
CREATE INDEX idx_ar_status ON AccountsReceivable(Status);
CREATE INDEX idx_ar_duedate ON AccountsReceivable(DueDate);

-- Índices en Payments
CREATE INDEX idx_payments_account ON Payments(AccountReceivableID);
CREATE INDEX idx_payments_date ON Payments(PaymentDate);
```

---

## 6. Procedimientos y Funciones

### Procedimiento: Actualizar Balance de Cuenta por Cobrar

```sql
DELIMITER $$

CREATE PROCEDURE UpdateAccountReceivableBalance(IN p_AccountReceivableID INT)
BEGIN
    DECLARE v_TotalPaid DECIMAL(10,2);
    DECLARE v_TotalAmount DECIMAL(10,2);
    DECLARE v_NewBalance DECIMAL(10,2);
    DECLARE v_NewStatus VARCHAR(20);
    
    -- Calcular total pagado
    SELECT COALESCE(SUM(Amount), 0) INTO v_TotalPaid
    FROM Payments
    WHERE AccountReceivableID = p_AccountReceivableID;
    
    -- Obtener total de la cuenta
    SELECT TotalAmount INTO v_TotalAmount
    FROM AccountsReceivable
    WHERE ID = p_AccountReceivableID;
    
    -- Calcular nuevo balance
    SET v_NewBalance = v_TotalAmount - v_TotalPaid;
    
    -- Determinar nuevo estado
    IF v_NewBalance = 0 THEN
        SET v_NewStatus = 'Paid';
    ELSEIF v_TotalPaid > 0 THEN
        SET v_NewStatus = 'Partial';
    ELSE
        -- Verificar si está vencida
        IF (SELECT DueDate FROM AccountsReceivable WHERE ID = p_AccountReceivableID) < NOW() THEN
            SET v_NewStatus = 'Overdue';
        ELSE
            SET v_NewStatus = 'Pending';
        END IF;
    END IF;
    
    -- Actualizar cuenta
    UPDATE AccountsReceivable
    SET AmountPaid = v_TotalPaid,
        Balance = v_NewBalance,
        Status = v_NewStatus
    WHERE ID = p_AccountReceivableID;
END$$

DELIMITER ;
```

### Función: Calcular Total de Presupuesto

```sql
DELIMITER $$

CREATE FUNCTION CalculateEstimateTotal(p_EstimateID INT) 
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE v_PartsTotal DECIMAL(10,2);
    DECLARE v_LaborTotal DECIMAL(10,2);
    DECLARE v_FlatFeesTotal DECIMAL(10,2);
    DECLARE v_Subtotal DECIMAL(10,2);
    
    -- Calcular total de partes
    SELECT COALESCE(SUM(Total), 0) INTO v_PartsTotal
    FROM EstimateParts
    WHERE EstimateID = p_EstimateID;
    
    -- Calcular total de mano de obra
    SELECT COALESCE(SUM(Total), 0) INTO v_LaborTotal
    FROM EstimateLabors
    WHERE EstimateID = p_EstimateID;
    
    -- Calcular total de tarifas planas
    SELECT COALESCE(SUM(Amount), 0) INTO v_FlatFeesTotal
    FROM EstimateFlatFees
    WHERE EstimateID = p_EstimateID;
    
    SET v_Subtotal = v_PartsTotal + v_LaborTotal + v_FlatFeesTotal;
    
    RETURN v_Subtotal;
END$$

DELIMITER ;
```

---

## 7. Scripts SQL

### Script Completo de Creación

Ver archivo: [create_database.sql](./create_database.sql)

### Script de Datos de Prueba

Ver archivo: [seed_data.sql](./seed_data.sql)

### Queries Útiles

#### Obtener Presupuestos con Detalles

```sql
SELECT 
    e.ID AS EstimateID,
    e.Date,
    v.PlateNumber,
    v.Brand,
    v.Model,
    v.OwnerName,
    e.Subtotal,
    e.Tax,
    e.Total,
    e.AuthorizationStatus,
    (SELECT COUNT(*) FROM EstimateParts WHERE EstimateID = e.ID) AS PartsCount,
    (SELECT COUNT(*) FROM EstimateLabors WHERE EstimateID = e.ID) AS LaborsCount,
    (SELECT COUNT(*) FROM EstimateFlatFees WHERE EstimateID = e.ID) AS FlatFeesCount
FROM Estimates e
INNER JOIN Vehicles v ON e.VehicleID = v.ID
ORDER BY e.Date DESC;
```

#### Cuentas Vencidas

```sql
SELECT 
    ar.ID,
    u.Name AS CustomerName,
    ar.TotalAmount,
    ar.AmountPaid,
    ar.Balance,
    ar.DueDate,
    DATEDIFF(NOW(), ar.DueDate) AS DaysOverdue
FROM AccountsReceivable ar
INNER JOIN Users u ON ar.CustomerID = u.ID
WHERE ar.Status IN ('Pending', 'Partial', 'Overdue')
    AND ar.DueDate < NOW()
ORDER BY ar.DueDate ASC;
```

#### Reporte de Ventas por Mes

```sql
SELECT 
    DATE_FORMAT(e.Date, '%Y-%m') AS Month,
    COUNT(*) AS TotalEstimates,
    SUM(e.Total) AS TotalSales,
    AVG(e.Total) AS AverageSale
FROM Estimates e
WHERE e.AuthorizationStatus = 'Authorized'
    AND e.Date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(e.Date, '%Y-%m')
ORDER BY Month DESC;
```

#### Vehículos con Más Diagnósticos

```sql
SELECT 
    v.ID,
    v.PlateNumber,
    v.Brand,
    v.Model,
    v.OwnerName,
    COUNT(d.ID) AS DiagnosticsCount,
    MAX(d.DateReceived) AS LastDiagnostic
FROM Vehicles v
INNER JOIN Diagnostics d ON v.ID = d.VehicleID
GROUP BY v.ID, v.PlateNumber, v.Brand, v.Model, v.OwnerName
ORDER BY DiagnosticsCount DESC
LIMIT 10;
```

---

## Mantenimiento de Base de Datos

### Backup Regular

```bash
# Backup completo
mysqldump -u root -p JBenz > backup_$(date +%Y%m%d).sql

# Backup solo estructura
mysqldump -u root -p --no-data JBenz > schema_backup.sql

# Backup solo datos
mysqldump -u root -p --no-create-info JBenz > data_backup.sql
```

### Optimización

```sql
-- Analizar tablas
ANALYZE TABLE Users, UserWorkshops, Vehicles, Diagnostics, Estimates;

-- Optimizar tablas
OPTIMIZE TABLE Estimates, AccountsReceivable, Payments;

-- Verificar integridad
CHECK TABLE Estimates, AccountsReceivable;
```

---

**Última actualización:** Octubre 2025
