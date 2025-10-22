# 🔧 Sistema de Gestión de Taller Mecánico (Mechanical Workshop)

## 📋 Descripción General

Sistema completo de gestión para talleres mecánicos desarrollado con ASP.NET Core 8.0 y Entity Framework Core. Proporciona funcionalidades para gestionar diagnósticos, presupuestos, cuentas por cobrar, clientes, vehículos y reportes de ventas.

## 🎯 Características Principales

- ✅ **Gestión de Usuarios y Autenticación**: Sistema de registro, login con JWT
- ✅ **Gestión de Talleres**: Administración de talleres y sus clientes
- ✅ **Gestión de Vehículos**: Registro y seguimiento de vehículos
- ✅ **Diagnósticos Técnicos**: Sistema completo de diagnósticos vehiculares
- ✅ **Presupuestos**: Creación y gestión de estimados con partes, mano de obra y tarifas planas
- ✅ **Cuentas por Cobrar**: Sistema de facturación y pagos
- ✅ **Reportes de Ventas**: Análisis y estadísticas de ventas
- ✅ **Configuración del Taller**: Ajustes de impuestos, markup y tarifas laborales
- ✅ **Sistema de Notas**: Anotaciones para diagnósticos

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

```
┌─────────────────────────────────────────┐
│         ASP.NET Core 8.0 Web API        │
├─────────────────────────────────────────┤
│    Controllers (RESTful Endpoints)      │
├─────────────────────────────────────────┤
│    DTOs (Data Transfer Objects)         │
├─────────────────────────────────────────┤
│    AutoMapper (Object Mapping)          │
├─────────────────────────────────────────┤
│    Entity Framework Core 8.0            │
├─────────────────────────────────────────┤
│         MySQL Database (MariaDB)        │
└─────────────────────────────────────────┘
```

### Patrón de Arquitectura

El sistema implementa una **arquitectura en capas**:

1. **Capa de Presentación** (Controllers)
2. **Capa de Negocio** (DTOs + Mapping)
3. **Capa de Acceso a Datos** (EF Core + DbContext)
4. **Capa de Persistencia** (MySQL)

## 📦 Tecnologías y Paquetes

### Framework Principal
- **ASP.NET Core**: 8.0
- **Entity Framework Core**: 8.0.2

### Paquetes NuGet Instalados

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `Microsoft.EntityFrameworkCore` | 8.0.2 | ORM principal |
| `Microsoft.EntityFrameworkCore.Design` | 8.0.2 | Herramientas de diseño |
| `Microsoft.EntityFrameworkCore.Tools` | 8.0.2 | Migraciones |
| `Microsoft.EntityFrameworkCore.Relational` | 8.0.2 | Soporte relacional |
| `Pomelo.EntityFrameworkCore.MySql` | 8.0.2 | Provider MySQL |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | 8.0.1 | Autenticación JWT |
| `BCrypt.Net-Next` | 4.0.3 | Hash de contraseñas |
| `AutoMapper.Extensions.Microsoft.DependencyInjection` | 12.0.1 | Mapeo automático |
| `Swashbuckle.AspNetCore` | 7.2.0 | Documentación Swagger |
| `FluentValidation.AspNetCore` | 11.3.0 | Validación de modelos |
| `Microsoft.AspNetCore.JsonPatch` | 9.0.0 | Soporte PATCH |
| `Microsoft.AspNetCore.Mvc.NewtonsoftJson` | 8.0.0 | Serialización JSON |

## 🗂️ Estructura del Proyecto

```
Mechanical_workshop/
│
├── Controllers/                    # Controladores API
│   ├── UserController.cs          # Gestión de usuarios
│   ├── EstimatesController.cs     # Gestión de presupuestos
│   ├── DiagnosticsController.cs   # Diagnósticos
│   ├── AccountReceivableController.cs
│   ├── SalesReportsController.cs
│   ├── TechnicianController.cs
│   ├── VehicleDiagnosticController.cs
│   ├── WorkshopSettingsController.cs
│   └── ...
│
├── Models/                         # Modelos de dominio
│   ├── User.cs
│   ├── Estimate.cs
│   ├── Vehicle.cs
│   ├── Diagnostic.cs
│   ├── AccountReceivable.cs
│   └── ...
│
├── DTOs/                           # Objetos de transferencia
│   ├── UserCreateDto.cs
│   ├── EstimateCreateDto.cs
│   └── ...
│
├── Data/                           # Contexto de base de datos
│   └── AppDbContext.cs
│
├── MappingProfiles/                # Perfiles de AutoMapper
│   ├── UserWorkshopProfile.cs
│   ├── DiagnosticProfile.cs
│   └── ...
│
├── Migrations/                     # Migraciones EF Core
│
├── Properties/                     # Configuración del proyecto
│
├── appsettings.json               # Configuración
├── Program.cs                     # Punto de entrada
└── Mechanical_workshop.csproj     # Archivo de proyecto
```

## 🔐 Seguridad

### Autenticación y Autorización

- **JWT (JSON Web Tokens)**: Autenticación basada en tokens
- **BCrypt**: Hash de contraseñas con salt
- **CORS**: Configurado para dominios específicos
- **HTTPS**: Redirección automática

### Configuración JWT

```json
{
  "JwtSettings": {
    "Secret": "clave-secreta-base64",
    "Issuer": "MechanicalWorkshopAPI",
    "Audience": "MechanicalWorkshopClients",
    "TokenExpirationMinutes": 60
  }
}
```

## 🗄️ Base de Datos

### Motor
- **MySQL** / **MariaDB**
- Compatible con Pomelo.EntityFrameworkCore.MySql

### Esquema Principal

#### Tablas Principales

1. **Users**: Usuarios del sistema
2. **UserWorkshops**: Talleres de usuarios
3. **Vehicles**: Vehículos registrados
4. **Diagnostics**: Diagnósticos técnicos
5. **TechnicianDiagnostics**: Diagnósticos detallados por técnico
6. **Estimates**: Presupuestos
7. **EstimateParts**: Partes del presupuesto
8. **EstimateLabors**: Mano de obra
9. **EstimateFlatFees**: Tarifas planas
10. **AccountsReceivable**: Cuentas por cobrar
11. **Payments**: Pagos
12. **SalesReports**: Reportes de ventas
13. **Notes**: Notas

### Relaciones Clave

```
User (1) ──────── (N) UserWorkshop
                        │
                        │ (1)
                        │
                       (N)
                    Vehicle
                        │
                        │ (1)
                        │
                       (N)
                   Diagnostic ←────── (N) TechnicianDiagnostic
                        │
                        │ (1)
                        │
                       (N)
                    Estimate ──────── (1:1) AccountReceivable
                        │
                        ├── (N) EstimateParts
                        ├── (N) EstimateLabors
                        └── (N) EstimateFlatFees
```

## 🚀 Instalación y Configuración

### Requisitos Previos

- **.NET 8.0 SDK** o superior
- **MySQL 8.0** o **MariaDB 10.5+**
- **Visual Studio 2022** o **VS Code** con extensión C#
- **Git** (opcional)

### Pasos de Instalación

#### 1. Clonar o descargar el proyecto

```bash
cd c:\Users\ajrui\Desktop\proyectos\Mechanical_workshop\Mechanical_workshop
```

#### 2. Restaurar paquetes NuGet

```powershell
dotnet restore
```

#### 3. Configurar la base de datos

Editar `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=JBenz;User=root;Password=TU_PASSWORD;"
  }
}
```

#### 4. Aplicar migraciones

```powershell
dotnet ef database update
```

Si no existen migraciones, crearlas:

```powershell
dotnet ef migrations add InitialCreate
dotnet ef database update
```

#### 5. Ejecutar el proyecto

```powershell
dotnet run
```

El servidor estará disponible en:
- **HTTPS**: https://localhost:7000 (o puerto configurado)
- **HTTP**: http://localhost:5000

#### 6. Acceder a Swagger

Navegar a: `https://localhost:7000/swagger`

## 📚 Documentación de API

Ver archivos adicionales:
- [API_DOCUMENTATION.md](./DOCUMENTATION/API_DOCUMENTATION.md) - Endpoints detallados
- [DEPLOYMENT_GUIDE.md](./DOCUMENTATION/DEPLOYMENT_GUIDE.md) - Guía de despliegue
- [DATABASE_SCHEMA.md](./DOCUMENTATION/DATABASE_SCHEMA.md) - Esquema de BD

## 🔧 Configuración Avanzada

### Variables de Entorno

Puedes usar variables de entorno en lugar de `appsettings.json`:

```powershell
$env:ConnectionStrings__DefaultConnection = "Server=...;Database=...;"
$env:JwtSettings__Secret = "tu-clave-secreta"
```

### CORS

Los orígenes permitidos están en `Program.cs`:

```csharp
policy.WithOrigins("https://app2.j-benz.com", "http://localhost:5173")
```

## 📊 Monitoreo y Logs

El sistema utiliza `ILogger` integrado de ASP.NET Core:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

## 🧪 Testing

_(Sección para implementar)_

```powershell
dotnet test
```

## 🚢 Despliegue

Ver [DEPLOYMENT_GUIDE.md](./DOCUMENTATION/DEPLOYMENT_GUIDE.md) para:
- Despliegue en IIS
- Despliegue en Azure
- Despliegue en Linux con Nginx
- Docker containerization

## 📝 Licencia

Copyright © 2025 - Sistema de Gestión de Taller Mecánico

## 👥 Contacto y Soporte

Para soporte técnico o consultas:
- Email: soporte@j-benz.com
- Web: https://app2.j-benz.com

## 📅 Historial de Versiones

- **v1.0.0** (Mayo 2025): Release inicial
  - Gestión completa de usuarios
  - Sistema de diagnósticos
  - Presupuestos y estimados
  - Cuentas por cobrar
  - Reportes de ventas

---

**Desarrollado con ❤️ para talleres mecánicos**
