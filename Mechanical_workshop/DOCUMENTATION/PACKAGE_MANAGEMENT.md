# 📦 Gestión de Paquetes - Mechanical Workshop

## Índice

1. [Paquetes NuGet Instalados](#paquetes-nuget-instalados)
2. [Detalles de Paquetes](#detalles-de-paquetes)
3. [Instalación de Paquetes](#instalación-de-paquetes)
4. [Actualización de Paquetes](#actualización-de-paquetes)
5. [Gestión de Vulnerabilidades](#gestión-de-vulnerabilidades)

---

## 1. Paquetes NuGet Instalados

### Resumen

El proyecto utiliza **14 paquetes NuGet** principales:

| Paquete | Versión | Categoría |
|---------|---------|-----------|
| Microsoft.EntityFrameworkCore | 8.0.2 | ORM |
| Microsoft.EntityFrameworkCore.Design | 8.0.2 | ORM - Herramientas |
| Microsoft.EntityFrameworkCore.Tools | 8.0.2 | ORM - Migraciones |
| Microsoft.EntityFrameworkCore.Relational | 8.0.2 | ORM - Soporte Relacional |
| Pomelo.EntityFrameworkCore.MySql | 8.0.2 | Provider MySQL |
| Microsoft.AspNetCore.Authentication.JwtBearer | 8.0.1 | Seguridad |
| BCrypt.Net-Next | 4.0.3 | Seguridad - Hash |
| AutoMapper.Extensions.Microsoft.DependencyInjection | 12.0.1 | Mapeo de Objetos |
| Swashbuckle.AspNetCore | 7.2.0 | Documentación API |
| FluentValidation.AspNetCore | 11.3.0 | Validación |
| Microsoft.AspNetCore.JsonPatch | 9.0.0 | PATCH Operations |
| Microsoft.AspNetCore.Mvc.NewtonsoftJson | 8.0.0 | Serialización JSON |

---

## 2. Detalles de Paquetes

### 2.1 Entity Framework Core (8.0.2)

**Propósito:** ORM (Object-Relational Mapper) para acceso a base de datos.

**Paquetes Relacionados:**
- `Microsoft.EntityFrameworkCore` - Core del ORM
- `Microsoft.EntityFrameworkCore.Design` - Herramientas de diseño para migraciones
- `Microsoft.EntityFrameworkCore.Tools` - Comandos CLI para migraciones
- `Microsoft.EntityFrameworkCore.Relational` - Soporte para bases de datos relacionales

**Funcionalidades:**
- Mapeo objeto-relacional
- LINQ to SQL
- Change tracking
- Migraciones de base de datos
- Lazy loading / Eager loading

**Uso en el Proyecto:**
```csharp
// Data/AppDbContext.cs
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    
    public DbSet<User> Users { get; set; }
    public DbSet<Estimate> Estimates { get; set; }
    // ...
}

// Program.cs
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
```

**Comandos Útiles:**
```powershell
# Crear migración
dotnet ef migrations add MigrationName

# Aplicar migraciones
dotnet ef database update

# Generar script SQL
dotnet ef migrations script
```

---

### 2.2 Pomelo.EntityFrameworkCore.MySql (8.0.2)

**Propósito:** Provider de MySQL/MariaDB para Entity Framework Core.

**Características:**
- Alto rendimiento
- Soporte completo de MySQL 8.0
- Compatible con MariaDB 10.5+
- Soporte de tipos de datos específicos de MySQL

**Configuración:**
```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString, 
        ServerVersion.AutoDetect(connectionString),
        mySqlOptions => 
        {
            mySqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        }
    ));
```

**Alternativas:**
- `MySql.Data.EntityFrameworkCore` (Oracle oficial)
- `MySql.EntityFrameworkCore` (Oracle)

**Justificación de Elección:**
Pomelo es más rápido y tiene mejor soporte de comunidad.

---

### 2.3 Microsoft.AspNetCore.Authentication.JwtBearer (8.0.1)

**Propósito:** Autenticación basada en JWT (JSON Web Tokens).

**Funcionalidades:**
- Validación de tokens JWT
- Configuración de políticas de autenticación
- Integración con ASP.NET Core Identity

**Configuración:**
```csharp
// Program.cs
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"];
var key = Encoding.UTF8.GetBytes(secretKey);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });
```

**Generación de Token:**
```csharp
private string GenerateJwtToken(User user)
{
    var tokenHandler = new JwtSecurityTokenHandler();
    var key = Encoding.UTF8.GetBytes(_config["JwtSettings:Secret"]);
    
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.ID.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Profile)
        }),
        Expires = DateTime.UtcNow.AddMinutes(
            int.Parse(_config["JwtSettings:TokenExpirationMinutes"])),
        Issuer = _config["JwtSettings:Issuer"],
        Audience = _config["JwtSettings:Audience"],
        SigningCredentials = new SigningCredentials(
            new SymmetricSecurityKey(key), 
            SecurityAlgorithms.HmacSha256Signature)
    };
    
    var token = tokenHandler.CreateToken(tokenDescriptor);
    return tokenHandler.WriteToken(token);
}
```

---

### 2.4 BCrypt.Net-Next (4.0.3)

**Propósito:** Hashing seguro de contraseñas con bcrypt.

**Características:**
- Algoritmo bcrypt (Blowfish)
- Salt automático
- Cost factor ajustable
- Resistente a ataques de fuerza bruta

**Uso:**
```csharp
// Hash de contraseña al registrar
var user = new User
{
    Username = dto.Username,
    Password = BCrypt.Net.BCrypt.HashPassword(dto.Password)
};

// Verificación al login
if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
{
    return Unauthorized("Incorrect password");
}
```

**Configuración de Cost Factor:**
```csharp
// Mayor cost = más seguro pero más lento (default: 11)
var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
```

**Alternativas:**
- `System.Security.Cryptography` (PBKDF2)
- `Argon2` (más moderno, recomendado para nuevos proyectos)

---

### 2.5 AutoMapper (12.0.1)

**Propósito:** Mapeo automático entre objetos (DTOs ↔ Entities).

**Instalación:**
```powershell
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
```

**Configuración:**
```csharp
// Program.cs
builder.Services.AddAutoMapper(typeof(Program));

// O especificar assemblies
builder.Services.AddAutoMapper(
    typeof(UserProfile).Assembly,
    typeof(EstimateProfile).Assembly);
```

**Creación de Perfiles:**
```csharp
// MappingProfiles/UserProfile.cs
public class UserProfile : Profile
{
    public UserProfile()
    {
        // Mapeo básico
        CreateMap<User, UserReadDto>();
        
        // Mapeo con transformación
        CreateMap<UserCreateDto, User>()
            .ForMember(dest => dest.Password, opt => opt.Ignore());
        
        // Mapeo condicional
        CreateMap<UserUpdateDto, User>()
            .ForAllMembers(opts => opts.Condition(
                (src, dest, srcMember) => srcMember != null));
        
        // Mapeo inverso
        CreateMap<User, UserReadDto>().ReverseMap();
        
        // Mapeo con proyección
        CreateMap<Estimate, EstimateFullDto>()
            .ForMember(dest => dest.VehicleBrand, 
                opt => opt.MapFrom(src => src.Vehicle.Brand));
    }
}
```

**Uso en Controllers:**
```csharp
public class UsersController : ControllerBase
{
    private readonly IMapper _mapper;
    
    public UsersController(IMapper mapper)
    {
        _mapper = mapper;
    }
    
    [HttpGet]
    public async Task<ActionResult> GetUsers()
    {
        var users = await _context.Users.ToListAsync();
        var usersDto = _mapper.Map<IEnumerable<UserReadDto>>(users);
        return Ok(usersDto);
    }
    
    [HttpPost]
    public async Task<ActionResult> Create(UserCreateDto dto)
    {
        var user = _mapper.Map<User>(dto);
        // ...
    }
}
```

---

### 2.6 Swashbuckle.AspNetCore (7.2.0)

**Propósito:** Generación automática de documentación Swagger/OpenAPI.

**Características:**
- UI interactiva para probar endpoints
- Generación de esquemas de modelos
- Soporte de autenticación JWT
- Anotaciones XML para documentación

**Configuración:**
```csharp
// Program.cs
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Mechanical Workshop API",
        Version = "v1",
        Description = "API para gestión de talleres mecánicos",
        Contact = new OpenApiContact
        {
            Name = "Soporte Técnico",
            Email = "soporte@j-benz.com"
        }
    });
    
    // Configurar autenticación JWT en Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
    
    // Incluir comentarios XML
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath);
});

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
        options.RoutePrefix = "swagger"; // Acceso en /swagger
    });
}
```

**Habilitar Comentarios XML:**
```xml
<!-- Mechanical_workshop.csproj -->
<PropertyGroup>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <NoWarn>$(NoWarn);1591</NoWarn>
</PropertyGroup>
```

**Uso en Controllers:**
```csharp
/// <summary>
/// Obtiene todos los usuarios del sistema
/// </summary>
/// <returns>Lista de usuarios</returns>
/// <response code="200">Usuarios obtenidos exitosamente</response>
/// <response code="401">No autorizado</response>
[HttpGet]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public async Task<ActionResult<IEnumerable<UserReadDto>>> GetUsers()
{
    // ...
}
```

---

### 2.7 FluentValidation.AspNetCore (11.3.0)

**Propósito:** Validación declarativa y fluida de modelos.

**Características:**
- Sintaxis fluida y legible
- Validaciones complejas
- Mensajes personalizados
- Validaciones asíncronas

**Instalación:**
```powershell
dotnet add package FluentValidation.AspNetCore
```

**Configuración:**
```csharp
// Program.cs
builder.Services.AddFluentValidation(fv =>
{
    fv.RegisterValidatorsFromAssemblyContaining<Program>();
    fv.DisableDataAnnotationsValidation = false; // Mantener [Required], etc.
});
```

**Crear Validador:**
```csharp
// Validators/UserCreateDtoValidator.cs
public class UserCreateDtoValidator : AbstractValidator<UserCreateDto>
{
    private readonly AppDbContext _context;
    
    public UserCreateDtoValidator(AppDbContext context)
    {
        _context = context;
        
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email es requerido")
            .EmailAddress().WithMessage("Email inválido")
            .MaximumLength(100)
            .MustAsync(BeUniqueEmail).WithMessage("Email ya está en uso");
        
        RuleFor(x => x.Username)
            .NotEmpty()
            .Length(3, 50)
            .Matches("^[a-zA-Z0-9_]*$")
            .WithMessage("Username solo puede contener letras, números y guión bajo")
            .MustAsync(BeUniqueUsername).WithMessage("Username ya existe");
        
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Debe contener al menos una mayúscula")
            .Matches("[a-z]").WithMessage("Debe contener al menos una minúscula")
            .Matches("[0-9]").WithMessage("Debe contener al menos un número")
            .Matches("[^a-zA-Z0-9]").WithMessage("Debe contener al menos un carácter especial");
    }
    
    private async Task<bool> BeUniqueEmail(string email, CancellationToken cancellationToken)
    {
        return !await _context.Users.AnyAsync(u => u.Email == email, cancellationToken);
    }
    
    private async Task<bool> BeUniqueUsername(string username, CancellationToken cancellationToken)
    {
        return !await _context.Users.AnyAsync(u => u.Username == username, cancellationToken);
    }
}
```

---

### 2.8 Microsoft.AspNetCore.JsonPatch (9.0.0)

**Propósito:** Soporte para operaciones PATCH parciales.

**Uso:**
```csharp
// Controller
[HttpPatch("{id}")]
public async Task<IActionResult> PatchUser(int id, [FromBody] JsonPatchDocument<User> patchDoc)
{
    if (patchDoc == null)
    {
        return BadRequest();
    }
    
    var user = await _context.Users.FindAsync(id);
    if (user == null)
    {
        return NotFound();
    }
    
    patchDoc.ApplyTo(user, ModelState);
    
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }
    
    await _context.SaveChangesAsync();
    return NoContent();
}

// Request JSON
// PATCH /api/users/1
{
  "op": "replace",
  "path": "/email",
  "value": "newemail@example.com"
}
```

---

### 2.9 Microsoft.AspNetCore.Mvc.NewtonsoftJson (8.0.0)

**Propósito:** Usar Newtonsoft.Json (Json.NET) en lugar del serializador predeterminado.

**Razones para usarlo:**
- Soporte de JsonPatch
- Mayor flexibilidad en serialización
- Manejo de referencias circulares
- Compatibilidad con proyectos legacy

**Configuración:**
```csharp
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
        options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
        options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
        options.SerializerSettings.DateFormatString = "yyyy-MM-ddTHH:mm:ss";
    });
```

---

## 3. Instalación de Paquetes

### Instalar Paquete Individual

```powershell
dotnet add package NombrePaquete

# Con versión específica
dotnet add package NombrePaquete --version 8.0.2

# En proyecto específico
dotnet add .\Mechanical_workshop.csproj package NombrePaquete
```

### Instalar Todos los Paquetes del Proyecto

```powershell
# Desde el directorio del proyecto
dotnet restore

# Desde el directorio de la solución
dotnet restore Mechanical_workshop.sln
```

### Desinstalar Paquete

```powershell
dotnet remove package NombrePaquete
```

---

## 4. Actualización de Paquetes

### Listar Paquetes Desactualizados

```powershell
dotnet list package --outdated
```

### Actualizar Paquete Específico

```powershell
dotnet add package NombrePaquete --version 8.0.3
```

### Actualizar Todos los Paquetes

```powershell
# Instalar herramienta global
dotnet tool install -g dotnet-outdated-tool

# Actualizar todos
dotnet outdated --upgrade
```

### Actualización Recomendada de EF Core

Cuando actualizas EF Core, actualiza **todos** estos paquetes a la misma versión:

```powershell
dotnet add package Microsoft.EntityFrameworkCore --version 8.0.3
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.3
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.3
dotnet add package Microsoft.EntityFrameworkCore.Relational --version 8.0.3
dotnet add package Pomelo.EntityFrameworkCore.MySql --version 8.0.3
```

---

## 5. Gestión de Vulnerabilidades

### Auditoría de Seguridad

```powershell
# Listar vulnerabilidades conocidas
dotnet list package --vulnerable

# Con detalles
dotnet list package --vulnerable --include-transitive
```

### Actualizar Paquetes Vulnerables

```powershell
# Ver paquetes con vulnerabilidades
dotnet list package --vulnerable

# Actualizar a versión segura
dotnet add package PaqueteVulnerable --version VersionSegura
```

### Configurar Warnings como Errores

```xml
<!-- Mechanical_workshop.csproj -->
<PropertyGroup>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <WarningsAsErrors>NU1901;NU1902;NU1903;NU1904</WarningsAsErrors>
</PropertyGroup>
```

---

## Archivo .csproj Completo

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <NoWarn>$(NoWarn);1591</NoWarn>
  </PropertyGroup>

  <ItemGroup>
    <!-- Entity Framework Core -->
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.2" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.2">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.EntityFrameworkCore.Relational" Version="8.0.2" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.2">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Pomelo.EntityFrameworkCore.MySql" Version="8.0.2" />
    
    <!-- Seguridad -->
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.1" />
    <PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
    
    <!-- Mapeo y Validación -->
    <PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.0.1" />
    <PackageReference Include="FluentValidation.AspNetCore" Version="11.3.0" />
    
    <!-- JSON y PATCH -->
    <PackageReference Include="Microsoft.AspNetCore.JsonPatch" Version="9.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.Mvc.NewtonsoftJson" Version="8.0.0" />
    
    <!-- Documentación -->
    <PackageReference Include="Swashbuckle.AspNetCore" Version="7.2.0" />
  </ItemGroup>

</Project>
```

---

## Comandos de Gestión Rápida

```powershell
# Limpiar y restaurar
dotnet clean; dotnet restore

# Ver todos los paquetes
dotnet list package

# Ver paquetes con versiones
dotnet list package --include-transitive

# Verificar referencias
dotnet list reference

# Auditoría completa
dotnet list package --vulnerable --include-transitive
```

---

**Última actualización:** Octubre 2025
