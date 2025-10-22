# 🚀 Guía de Inicio Rápido - Mechanical Workshop

## ⚡ Inicio en 5 Minutos

### 1. Pre-requisitos
```powershell
# Verificar .NET 8.0
dotnet --version
# Debe mostrar: 8.0.x

# Verificar MySQL
mysql --version
```

### 2. Configuración
```powershell
# Clonar/navegar al proyecto
cd c:\Users\ajrui\Desktop\proyectos\Mechanical_workshop\Mechanical_workshop

# Restaurar paquetes
dotnet restore

# Configurar base de datos en appsettings.json
# Cambiar: Server, Database, User, Password
```

### 3. Base de Datos
```powershell
# Aplicar migraciones
dotnet ef database update
```

### 4. Ejecutar
```powershell
# Iniciar aplicación
dotnet run

# Abrir navegador en:
# https://localhost:7000/swagger
```

---

## 📋 Resumen Ejecutivo del Sistema

### ¿Qué es Mechanical Workshop?

**Sistema completo de gestión para talleres mecánicos** que permite:
- Registrar clientes y vehículos
- Crear diagnósticos técnicos
- Generar presupuestos detallados
- Gestionar cuentas por cobrar
- Generar reportes de ventas
- Configurar impuestos y tarifas

### Tecnologías Principales

```
Backend:      ASP.NET Core 8.0 Web API
ORM:          Entity Framework Core 8.0
Base de Datos: MySQL 8.0 / MariaDB 10.5+
Seguridad:    JWT + BCrypt
Documentación: Swagger/OpenAPI
```

### Características Destacadas

✅ **Autenticación JWT** - Seguridad robusta  
✅ **API RESTful** - Estándares de la industria  
✅ **Documentación Swagger** - API autodocumentada  
✅ **Arquitectura escalable** - Fácil de mantener  
✅ **Base de datos relacional** - Integridad referencial  

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────┐
│           Frontend (Cliente)                │
│     (Web App / Mobile App / Desktop)        │
└──────────────────┬──────────────────────────┘
                   │ HTTPS/REST
                   ▼
┌─────────────────────────────────────────────┐
│         ASP.NET Core 8.0 Web API            │
│  ┌────────────────────────────────────┐     │
│  │        Controllers Layer           │     │
│  │  (Endpoints REST + Validación)     │     │
│  └──────────────┬─────────────────────┘     │
│                 │                            │
│  ┌──────────────▼─────────────────────┐     │
│  │        Business Logic Layer        │     │
│  │   (DTOs + AutoMapper + Services)   │     │
│  └──────────────┬─────────────────────┘     │
│                 │                            │
│  ┌──────────────▼─────────────────────┐     │
│  │      Data Access Layer (EF Core)   │     │
│  │  (DbContext + Repositories)        │     │
│  └──────────────┬─────────────────────┘     │
└─────────────────┼─────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         MySQL Database (JBenz)              │
│  ┌──────────────────────────────────┐       │
│  │ 17 Tablas (Users, Vehicles, etc) │       │
│  └──────────────────────────────────┘       │
└─────────────────────────────────────────────┘
```

---

## 📊 Flujo de Trabajo Típico

### Escenario: Cliente trae vehículo para reparación

```
1. REGISTRO DE CLIENTE Y VEHÍCULO
   POST /api/UserWorkshops          → Crear/Obtener taller
   POST /api/VehicleDiagnostic      → Registrar vehículo
   
2. DIAGNÓSTICO INICIAL
   POST /api/Diagnostics            → Crear diagnóstico básico
   POST /api/Notes                  → Agregar notas
   
3. DIAGNÓSTICO TÉCNICO DETALLADO
   POST /api/TechnicianDiagnostics  → Diagnóstico del técnico
   
4. GENERAR PRESUPUESTO
   POST /api/Estimates              → Crear presupuesto con:
                                       - Partes
                                       - Mano de obra
                                       - Tarifas planas
   
5. AUTORIZACIÓN DEL CLIENTE
   PATCH /api/Estimates/{id}/status → Actualizar a "Authorized"
   
6. CREAR CUENTA POR COBRAR
   POST /api/AccountReceivable      → Generar factura
   
7. REGISTRAR PAGOS
   POST /api/AccountReceivable/{id}/payment → Registrar pago(s)
   
8. REPORTES
   POST /api/SalesReports/generate  → Generar reporte de ventas
```

---

## 🔐 Seguridad

### Flujo de Autenticación

```
1. Usuario se registra:
   POST /api/Users/register
   → Contraseña hasheada con BCrypt
   → Usuario guardado en BD

2. Usuario hace login:
   POST /api/Users/login
   → Verifica credenciales
   → Genera JWT token
   → Retorna token + datos de usuario

3. Usar token en todas las peticiones:
   Authorization: Bearer {token}
   
4. Token expira en 60 minutos (configurable)
```

### Mejores Prácticas Implementadas

✅ Contraseñas hasheadas con BCrypt  
✅ Tokens JWT con expiración  
✅ HTTPS obligatorio en producción  
✅ CORS configurado para dominios específicos  
✅ Validación de datos en DTOs  
✅ SQL Injection prevenida (EF Core parametrizado)  

---

## 📁 Estructura de Archivos Clave

```
Mechanical_workshop/
│
├── Program.cs                    ⭐ PUNTO DE ENTRADA
│   • Configuración de servicios
│   • Middleware pipeline
│   • JWT, CORS, EF Core
│
├── appsettings.json             🔧 CONFIGURACIÓN
│   • Connection strings
│   • JWT settings
│   • Logging
│
├── Controllers/                 🎮 ENDPOINTS API
│   ├── UserController.cs        → Autenticación y usuarios
│   ├── EstimatesController.cs   → Presupuestos
│   ├── DiagnosticsController.cs → Diagnósticos
│   └── ...
│
├── Models/                      🗃️ ENTIDADES
│   ├── User.cs                  → Modelo de usuario
│   ├── Estimate.cs              → Modelo de presupuesto
│   └── ...
│
├── DTOs/                        📦 DATA TRANSFER OBJECTS
│   ├── UserCreateDto.cs
│   ├── EstimateFullDto.cs
│   └── ...
│
├── Data/                        💾 BASE DE DATOS
│   └── AppDbContext.cs          → Contexto EF Core
│
├── MappingProfiles/             🔄 AUTOMAPPER
│   ├── UserProfile.cs
│   └── ...
│
└── Migrations/                  📋 MIGRACIONES EF
    └── *.cs
```

---

## 🎯 Endpoints Principales

### Autenticación
```http
POST   /api/Users/register       # Registrar usuario
POST   /api/Users/login          # Login (obtener JWT)
POST   /api/Users/forgot-password # Recuperar contraseña
```

### Talleres y Vehículos
```http
GET    /api/UserWorkshops        # Listar talleres
POST   /api/UserWorkshops        # Crear taller
GET    /api/VehicleDiagnostic    # Listar vehículos
POST   /api/VehicleDiagnostic    # Registrar vehículo
```

### Diagnósticos
```http
GET    /api/Diagnostics          # Listar diagnósticos
POST   /api/Diagnostics          # Crear diagnóstico
POST   /api/TechnicianDiagnostics # Diagnóstico técnico
```

### Presupuestos
```http
GET    /api/Estimates            # Listar presupuestos
POST   /api/Estimates            # Crear presupuesto
PUT    /api/Estimates/{id}       # Actualizar presupuesto
PATCH  /api/Estimates/{id}/status # Cambiar estado
```

### Cuentas por Cobrar
```http
GET    /api/AccountReceivable    # Listar cuentas
POST   /api/AccountReceivable    # Crear cuenta
POST   /api/AccountReceivable/{id}/payment # Registrar pago
```

### Reportes
```http
POST   /api/SalesReports/generate # Generar reporte
GET    /api/SalesReports         # Listar reportes
```

---

## 🔧 Configuraciones Importantes

### appsettings.json

```json
{
  "JwtSettings": {
    "Secret": "TU-CLAVE-SECRETA-BASE64",
    "Issuer": "MechanicalWorkshopAPI",
    "Audience": "MechanicalWorkshopClients",
    "TokenExpirationMinutes": 60
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=JBenz;User=root;Password=password;"
  }
}
```

### CORS (Program.cs)

```csharp
builder.Services.AddCors(options => 
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("https://app2.j-benz.com", "http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});
```

---

## 📚 Documentación Completa

### Archivos de Documentación

1. **README.md** - Introducción y visión general
2. **API_DOCUMENTATION.md** - Todos los endpoints detallados
3. **DEPLOYMENT_GUIDE.md** - Guía de despliegue (IIS, Linux, Azure, Docker)
4. **DATABASE_SCHEMA.md** - Esquema completo de base de datos
5. **DEVELOPMENT_GUIDE.md** - Guía para desarrolladores
6. **PACKAGE_MANAGEMENT.md** - Gestión de paquetes NuGet
7. **QUICK_START.md** - Esta guía

### Ubicación

```
Mechanical_workshop/
├── README.md
└── DOCUMENTATION/
    ├── API_DOCUMENTATION.md
    ├── DEPLOYMENT_GUIDE.md
    ├── DATABASE_SCHEMA.md
    ├── DEVELOPMENT_GUIDE.md
    ├── PACKAGE_MANAGEMENT.md
    └── QUICK_START.md
```

---

## 🛠️ Comandos Esenciales

### Desarrollo
```powershell
# Restaurar paquetes
dotnet restore

# Compilar
dotnet build

# Ejecutar
dotnet run

# Ejecutar con recarga automática
dotnet watch run

# Abrir Swagger
start https://localhost:7000/swagger
```

### Base de Datos
```powershell
# Crear migración
dotnet ef migrations add NombreMigracion

# Aplicar migraciones
dotnet ef database update

# Revertir migración
dotnet ef database update MigracionAnterior

# Eliminar última migración
dotnet ef migrations remove
```

### Publicación
```powershell
# Publicar para producción
dotnet publish -c Release -o ./publish

# Publicar para IIS
dotnet publish -c Release -o C:\inetpub\MechanicalWorkshop
```

---

## 🧪 Pruebas con Postman/cURL

### Registrar Usuario
```bash
curl -X POST https://localhost:7000/api/Users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "name": "Test",
    "lastName": "User",
    "username": "testuser",
    "password": "Password123!",
    "profile": "Admin"
  }'
```

### Login
```bash
curl -X POST https://localhost:7000/api/Users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Password123!"
  }'
```

### Usar Token
```bash
curl -X GET https://localhost:7000/api/Users \
  -H "Authorization: Bearer {TOKEN_OBTENIDO}"
```

---

## ⚠️ Problemas Comunes y Soluciones

### Error: "Unable to connect to MySQL"
```powershell
# Verificar que MySQL está corriendo
Get-Service MySQL*

# Iniciar MySQL
Start-Service MySQL80
```

### Error: "Migrations pending"
```powershell
# Aplicar migraciones
dotnet ef database update
```

### Error: "401 Unauthorized"
```
Solución: Verificar que el token JWT está en el header:
Authorization: Bearer {token}
```

### Error: "CORS policy"
```csharp
// Verificar en Program.cs que el origen está permitido
policy.WithOrigins("http://localhost:5173")
```

---

## 📞 Soporte y Recursos

### Documentación Externa

- [ASP.NET Core Docs](https://docs.microsoft.com/aspnet/core)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [JWT.io](https://jwt.io/) - Decodificar tokens
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

### Herramientas Recomendadas

- **Visual Studio 2022** - IDE principal
- **VS Code** - Editor ligero
- **MySQL Workbench** - Gestión de BD
- **Postman** - Pruebas de API
- **Git** - Control de versiones
- **Docker Desktop** - Containerización

---

## 🎓 Próximos Pasos

### Para Comenzar a Desarrollar

1. ✅ Leer **README.md** para entender el sistema
2. ✅ Seguir esta **QUICK_START.md** para configurar
3. ✅ Revisar **API_DOCUMENTATION.md** para conocer endpoints
4. ✅ Leer **DEVELOPMENT_GUIDE.md** para buenas prácticas
5. ✅ Explorar el código en Visual Studio

### Para Desplegar en Producción

1. ✅ Leer **DEPLOYMENT_GUIDE.md**
2. ✅ Configurar servidor (IIS/Linux/Azure)
3. ✅ Configurar certificado SSL
4. ✅ Configurar backups automáticos
5. ✅ Configurar monitoreo

### Para Contribuir

1. ✅ Fork del repositorio
2. ✅ Crear rama de feature
3. ✅ Hacer commits descriptivos
4. ✅ Crear Pull Request
5. ✅ Esperar code review

---

## ✨ Características Futuras (Roadmap)

- [ ] Autenticación con OAuth2 (Google, Facebook)
- [ ] Sistema de notificaciones por email/SMS
- [ ] Generación de PDFs para presupuestos
- [ ] Dashboard con gráficos
- [ ] App móvil (Flutter/React Native)
- [ ] Sistema de inventario de partes
- [ ] Integración con pasarelas de pago
- [ ] Multi-tenancy (múltiples talleres independientes)
- [ ] Sistema de citas online
- [ ] Chat interno entre técnicos

---

## 📈 Estadísticas del Proyecto

```
Lenguaje Principal:  C# (.NET 8.0)
Líneas de Código:    ~15,000
Controladores:       13
Modelos:             17
DTOs:                25+
Endpoints:           80+
Paquetes NuGet:      14
Versión:             1.0.0
Fecha Release:       Mayo 2025
```

---

## 🙏 Créditos

Desarrollado para la gestión eficiente de talleres mecánicos.

**Stack:**
- Backend: ASP.NET Core 8.0
- Database: MySQL 8.0
- ORM: Entity Framework Core
- Authentication: JWT + BCrypt
- Documentation: Swagger/OpenAPI

---

## 📄 Licencia

Copyright © 2025 - Mechanical Workshop System  
Todos los derechos reservados.

---

**¿Listo para comenzar?** 🚀

```powershell
cd Mechanical_workshop
dotnet restore
dotnet ef database update
dotnet run
```

¡Abre tu navegador en https://localhost:7000/swagger y comienza a explorar la API!

---

**Documentación actualizada:** Octubre 2025
