# 💻 Guía de Desarrollo - Mechanical Workshop

## Índice

1. [Configuración del Entorno de Desarrollo](#configuración-del-entorno)
2. [Estructura del Código](#estructura-del-código)
3. [Patrones y Prácticas](#patrones-y-prácticas)
4. [DTOs y Mapeo](#dtos-y-mapeo)
5. [Validación](#validación)
6. [Manejo de Errores](#manejo-de-errores)
7. [Testing](#testing)
8. [Contribución](#contribución)

---

## 1. Configuración del Entorno de Desarrollo

### Requisitos

- **Visual Studio 2022** (Community, Professional o Enterprise)
- **.NET 8.0 SDK**
- **MySQL Workbench** (para gestión de BD)
- **Postman** o **Insomnia** (para pruebas de API)
- **Git**

### Extensiones Recomendadas para VS Code

```json
{
  "recommendations": [
    "ms-dotnettools.csharp",
    "ms-dotnettools.csdevkit",
    "jchannon.csharpextensions",
    "kreativ-software.csharpextensions",
    "patcx.vscode-nuget-gallery",
    "formulahendry.dotnet-test-explorer",
    "formulahendry.dotnet"
  ]
}
```

### Configuración Inicial

```powershell
# 1. Clonar repositorio (si aplica)
git clone <repository-url>
cd Mechanical_workshop

# 2. Restaurar paquetes
dotnet restore

# 3. Configurar appsettings.Development.json
Copy-Item appsettings.json appsettings.Development.json
# Editar con tus configuraciones locales

# 4. Crear base de datos
dotnet ef database update

# 5. Ejecutar
dotnet run
```

### appsettings.Development.json

```json
{
  "JwtSettings": {
    "Secret": "dev-secret-key-change-in-production",
    "Issuer": "MechanicalWorkshopAPI",
    "Audience": "MechanicalWorkshopClients",
    "TokenExpirationMinutes": 120
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=JBenz_Dev;User=root;Password=root;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  }
}
```

---

## 2. Estructura del Código

### Organización de Carpetas

```
Mechanical_workshop/
│
├── Controllers/              # Endpoints de la API
│   ├── Base/                # Controladores base (si aplica)
│   └── *.cs                 # Controladores específicos
│
├── Models/                   # Entidades de dominio
│   └── *.cs                 # Clases de modelo
│
├── DTOs/                     # Data Transfer Objects
│   ├── Request/             # DTOs de entrada (opcional)
│   ├── Response/            # DTOs de salida (opcional)
│   └── *.cs                 # DTOs generales
│
├── Data/                     # Contexto y configuración de BD
│   ├── AppDbContext.cs      # DbContext principal
│   └── Configurations/      # Configuraciones de entidades (opcional)
│
├── MappingProfiles/          # Perfiles de AutoMapper
│   └── *.cs                 # Perfiles de mapeo
│
├── Services/                 # Servicios de negocio (por implementar)
│   ├── Interfaces/          # Interfaces de servicios
│   └── Implementations/     # Implementaciones de servicios
│
├── Repositories/             # Repositorios (por implementar)
│   ├── Interfaces/          # Interfaces de repositorios
│   └── Implementations/     # Implementaciones de repositorios
│
├── Validators/               # Validadores FluentValidation (por implementar)
│   └── *.cs                 # Clases de validación
│
├── Middleware/               # Middleware personalizado (por implementar)
│   └── *.cs                 # Middleware
│
├── Filters/                  # Filtros de acción (por implementar)
│   └── *.cs                 # Filtros
│
├── Extensions/               # Métodos de extensión (por implementar)
│   └── *.cs                 # Extensiones
│
├── Helpers/                  # Clases de ayuda (por implementar)
│   └── *.cs                 # Helpers
│
├── Migrations/               # Migraciones de EF Core
│   └── *.cs                 # Archivos de migración
│
└── Program.cs               # Punto de entrada
```

---

## 3. Patrones y Prácticas

### Arquitectura Actual

El proyecto actualmente implementa una **arquitectura en 3 capas simplificada**:

1. **Capa de Presentación**: Controllers
2. **Capa de Negocio**: DTOs + AutoMapper + Controllers
3. **Capa de Datos**: EF Core + DbContext

### Patrones Implementados

#### Repository Pattern (Recomendado para implementar)

```csharp
// IRepository.cs
public interface IRepository<T> where T : class
{
    Task<IEnumerable<T>> GetAllAsync();
    Task<T?> GetByIdAsync(int id);
    Task<T> CreateAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
}

// Repository.cs
public class Repository<T> : IRepository<T> where T : class
{
    private readonly AppDbContext _context;
    private readonly DbSet<T> _dbSet;

    public Repository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<T?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<T> CreateAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task UpdateAsync(T entity)
    {
        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
```

#### Unit of Work Pattern (Recomendado)

```csharp
public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<Estimate> Estimates { get; }
    // ... otros repositorios
    
    Task<int> SaveChangesAsync();
}

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    
    public IRepository<User> Users { get; }
    public IRepository<Estimate> Estimates { get; }
    
    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        Users = new Repository<User>(_context);
        Estimates = new Repository<Estimate>(_context);
    }
    
    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
    
    public void Dispose()
    {
        _context.Dispose();
    }
}
```

### Prácticas Recomendadas

#### 1. Async/Await

```csharp
// ✅ CORRECTO
public async Task<ActionResult<IEnumerable<User>>> GetUsers()
{
    var users = await _context.Users.ToListAsync();
    return Ok(users);
}

// ❌ INCORRECTO
public ActionResult<IEnumerable<User>> GetUsers()
{
    var users = _context.Users.ToList(); // Bloqueo síncrono
    return Ok(users);
}
```

#### 2. Inyección de Dependencias

```csharp
// Program.cs
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEstimateService, EstimateService>();

// Controller
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    
    public UsersController(IUserService userService)
    {
        _userService = userService;
    }
}
```

#### 3. Manejo de Transacciones

```csharp
public async Task<ActionResult> CreateEstimateWithAccount(EstimateCreateDto dto)
{
    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        // Crear estimate
        var estimate = new Estimate { /* ... */ };
        _context.Estimates.Add(estimate);
        await _context.SaveChangesAsync();
        
        // Crear account receivable
        var account = new AccountReceivable 
        { 
            EstimateId = estimate.ID,
            /* ... */
        };
        _context.AccountsReceivable.Add(account);
        await _context.SaveChangesAsync();
        
        await transaction.CommitAsync();
        return Ok();
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        return StatusCode(500, ex.Message);
    }
}
```

---

## 4. DTOs y Mapeo

### Convenciones de Naming

- **CreateDto**: Para operaciones POST
- **UpdateDto**: Para operaciones PUT
- **ReadDto**: Para operaciones GET
- **FullDto**: Para respuestas con navegación completa

### Ejemplo de DTOs

```csharp
// UserCreateDto.cs
public class UserCreateDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;
    
    [Required]
    public string Profile { get; set; } = string.Empty;
}

// UserReadDto.cs
public class UserReadDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Profile { get; set; } = string.Empty;
    // NO incluir Password
}

// UserUpdateDto.cs
public class UserUpdateDto
{
    [EmailAddress]
    public string? Email { get; set; }
    
    [StringLength(100)]
    public string? Name { get; set; }
    
    [StringLength(100)]
    public string? LastName { get; set; }
    
    public string? Profile { get; set; }
}
```

### Perfiles de AutoMapper

```csharp
// UserProfile.cs
public class UserProfile : Profile
{
    public UserProfile()
    {
        // Create
        CreateMap<UserCreateDto, User>()
            .ForMember(dest => dest.Password, opt => opt.Ignore()); // Hash separately
        
        // Read
        CreateMap<User, UserReadDto>();
        
        // Update
        CreateMap<UserUpdateDto, User>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
    }
}
```

---

## 5. Validación

### FluentValidation (Recomendado)

```csharp
// UserCreateDtoValidator.cs
public class UserCreateDtoValidator : AbstractValidator<UserCreateDto>
{
    public UserCreateDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email es requerido")
            .EmailAddress().WithMessage("Email inválido")
            .MaximumLength(100);
        
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username es requerido")
            .Length(3, 50).WithMessage("Username debe tener entre 3 y 50 caracteres")
            .Matches("^[a-zA-Z0-9_]*$").WithMessage("Username solo puede contener letras, números y guión bajo");
        
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password es requerido")
            .MinimumLength(8).WithMessage("Password debe tener al menos 8 caracteres")
            .Matches("[A-Z]").WithMessage("Password debe contener al menos una mayúscula")
            .Matches("[a-z]").WithMessage("Password debe contener al menos una minúscula")
            .Matches("[0-9]").WithMessage("Password debe contener al menos un número");
        
        RuleFor(x => x.Profile)
            .NotEmpty().WithMessage("Profile es requerido")
            .Must(x => new[] { "Admin", "User", "Technician" }.Contains(x))
            .WithMessage("Profile debe ser Admin, User o Technician");
    }
}

// Registrar en Program.cs
builder.Services.AddFluentValidation(fv => 
    fv.RegisterValidatorsFromAssemblyContaining<UserCreateDtoValidator>());
```

### Validación en Controllers

```csharp
[HttpPost]
public async Task<ActionResult> Create([FromBody] UserCreateDto dto)
{
    // FluentValidation se ejecuta automáticamente
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }
    
    // Lógica de negocio...
}
```

---

## 6. Manejo de Errores

### Exception Middleware

```csharp
// ExceptionMiddleware.cs
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = exception switch
        {
            NotFoundException => StatusCodes.Status404NotFound,
            BadRequestException => StatusCodes.Status400BadRequest,
            UnauthorizedException => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status500InternalServerError
        };

        var response = new
        {
            statusCode = context.Response.StatusCode,
            message = exception.Message,
            details = context.Response.StatusCode == 500 ? "Internal server error" : exception.Message
        };

        return context.Response.WriteAsJsonAsync(response);
    }
}

// Registrar en Program.cs
app.UseMiddleware<ExceptionMiddleware>();
```

### Excepciones Personalizadas

```csharp
// NotFoundException.cs
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

// BadRequestException.cs
public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message) { }
}

// UnauthorizedException.cs
public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message) { }
}

// Uso en Controllers
public async Task<ActionResult<User>> GetUser(int id)
{
    var user = await _context.Users.FindAsync(id);
    if (user == null)
    {
        throw new NotFoundException($"User with ID {id} not found");
    }
    return Ok(user);
}
```

---

## 7. Testing

### Estructura de Tests

```
Mechanical_workshop.Tests/
│
├── Unit/
│   ├── Controllers/
│   │   ├── UsersControllerTests.cs
│   │   └── EstimatesControllerTests.cs
│   ├── Services/
│   └── Validators/
│
├── Integration/
│   ├── API/
│   │   └── UsersApiTests.cs
│   └── Database/
│       └── DatabaseTests.cs
│
└── Helpers/
    └── TestHelpers.cs
```

### Unit Tests con xUnit

```csharp
// UsersControllerTests.cs
public class UsersControllerTests
{
    private readonly Mock<AppDbContext> _mockContext;
    private readonly Mock<IMapper> _mockMapper;
    private readonly UsersController _controller;

    public UsersControllerTests()
    {
        _mockContext = new Mock<AppDbContext>();
        _mockMapper = new Mock<IMapper>();
        _controller = new UsersController(_mockContext.Object, _mockMapper.Object, null, null);
    }

    [Fact]
    public async Task GetUsers_ReturnsOkResult_WithListOfUsers()
    {
        // Arrange
        var users = new List<User>
        {
            new User { ID = 1, Username = "user1" },
            new User { ID = 2, Username = "user2" }
        };
        
        var mockDbSet = CreateMockDbSet(users);
        _mockContext.Setup(c => c.Users).Returns(mockDbSet.Object);

        // Act
        var result = await _controller.GetUsers();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedUsers = Assert.IsAssignableFrom<IEnumerable<User>>(okResult.Value);
        Assert.Equal(2, returnedUsers.Count());
    }

    private Mock<DbSet<T>> CreateMockDbSet<T>(List<T> data) where T : class
    {
        var queryable = data.AsQueryable();
        var mockSet = new Mock<DbSet<T>>();
        
        mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
        mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());
        
        return mockSet;
    }
}
```

### Integration Tests

```csharp
// UsersApiTests.cs
public class UsersApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public UsersApiTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetUsers_ReturnsSuccessStatusCode()
    {
        // Act
        var response = await _client.GetAsync("/api/Users");

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal("application/json; charset=utf-8", 
            response.Content.Headers.ContentType?.ToString());
    }

    [Fact]
    public async Task CreateUser_WithValidData_ReturnsCreated()
    {
        // Arrange
        var newUser = new UserCreateDto
        {
            Email = "test@test.com",
            Name = "Test",
            LastName = "User",
            Username = "testuser",
            Password = "Password123!",
            Profile = "User"
        };
        
        var content = new StringContent(
            JsonSerializer.Serialize(newUser),
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await _client.PostAsync("/api/Users/register", content);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }
}
```

### Ejecutar Tests

```powershell
# Todos los tests
dotnet test

# Tests específicos
dotnet test --filter "FullyQualifiedName~UsersControllerTests"

# Con cobertura
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

---

## 8. Contribución

### Git Workflow

```bash
# 1. Crear rama para feature
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commits
git add .
git commit -m "feat: agregar funcionalidad X"

# 3. Push a repositorio
git push origin feature/nueva-funcionalidad

# 4. Crear Pull Request en GitHub/GitLab
```

### Convenciones de Commits

Seguir **Conventional Commits**:

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato de código
refactor: refactorización
test: agregar tests
chore: tareas de mantenimiento
```

### Code Review Checklist

- [ ] El código compila sin errores
- [ ] Los tests pasan
- [ ] Se agregaron tests para nueva funcionalidad
- [ ] La documentación está actualizada
- [ ] Se siguieron las convenciones de código
- [ ] No hay código comentado innecesario
- [ ] Las variables tienen nombres descriptivos
- [ ] Se manejaron excepciones apropiadamente
- [ ] Se usaron async/await correctamente

---

## Comandos Útiles

```powershell
# Crear migración
dotnet ef migrations add MigrationName

# Aplicar migración
dotnet ef database update

# Revertir migración
dotnet ef database update PreviousMigration

# Eliminar última migración
dotnet ef migrations remove

# Generar script SQL
dotnet ef migrations script

# Compilar
dotnet build

# Compilar en Release
dotnet build -c Release

# Limpiar
dotnet clean

# Restaurar paquetes
dotnet restore

# Agregar paquete
dotnet add package PackageName

# Ejecutar
dotnet run

# Watch mode (recarga automática)
dotnet watch run

# Publicar
dotnet publish -c Release -o ./publish
```

---

## Recursos Adicionales

- [ASP.NET Core Documentation](https://docs.microsoft.com/aspnet/core)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [AutoMapper](https://docs.automapper.org)
- [FluentValidation](https://docs.fluentvalidation.net)
- [xUnit](https://xunit.net/)
- [Moq](https://github.com/moq/moq4)

---

**Última actualización:** Octubre 2025
