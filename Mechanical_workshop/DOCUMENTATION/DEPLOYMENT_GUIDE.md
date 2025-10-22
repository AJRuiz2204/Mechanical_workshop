# 🚀 Guía de Despliegue - Mechanical Workshop

## Índice

1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Despliegue Local](#despliegue-local)
3. [Despliegue en IIS (Windows Server)](#despliegue-en-iis)
4. [Despliegue en Linux con Nginx](#despliegue-en-linux-nginx)
5. [Despliegue en Azure App Service](#despliegue-en-azure)
6. [Despliegue con Docker](#despliegue-con-docker)
7. [Configuración de Base de Datos](#configuración-de-base-de-datos)
8. [Variables de Entorno](#variables-de-entorno)
9. [Seguridad y SSL](#seguridad-y-ssl)
10. [Monitoreo y Logs](#monitoreo-y-logs)
11. [Backup y Recuperación](#backup-y-recuperación)
12. [Troubleshooting](#troubleshooting)

---

## 1. Requisitos del Sistema

### Desarrollo
- **.NET 8.0 SDK** o superior
- **Visual Studio 2022** / **VS Code**
- **MySQL 8.0** / **MariaDB 10.5+**
- **Git** (opcional)

### Producción
- **.NET 8.0 Runtime** (ASP.NET Core)
- **Windows Server 2019+** / **Linux (Ubuntu 20.04+, CentOS 8+)**
- **MySQL 8.0** / **MariaDB 10.5+**
- **IIS 10+** (Windows) / **Nginx 1.18+** (Linux)
- Mínimo **2GB RAM**, **2 CPU cores**
- Espacio en disco: **10GB+**

---

## 2. Despliegue Local

### 2.1 Instalación Inicial

```powershell
# 1. Navegar al directorio del proyecto
cd c:\Users\ajrui\Desktop\proyectos\Mechanical_workshop\Mechanical_workshop

# 2. Restaurar dependencias
dotnet restore

# 3. Compilar el proyecto
dotnet build --configuration Release

# 4. Configurar base de datos
# Editar appsettings.json con tus credenciales de MySQL

# 5. Aplicar migraciones
dotnet ef database update

# 6. Ejecutar la aplicación
dotnet run --urls="https://localhost:7000;http://localhost:5000"
```

### 2.2 Verificación

```powershell
# Verificar que el servidor está corriendo
curl https://localhost:7000/swagger

# O abrir en navegador:
# https://localhost:7000/swagger
```

---

## 3. Despliegue en IIS (Windows Server)

### 3.1 Requisitos Previos

1. **Instalar .NET 8.0 Hosting Bundle**
   - Descargar de: https://dotnet.microsoft.com/download/dotnet/8.0
   - Ejecutar: `dotnet-hosting-8.0.x-win.exe`
   - Reiniciar IIS: `iisreset`

2. **Verificar instalación**
   ```powershell
   dotnet --info
   ```

### 3.2 Publicar la Aplicación

```powershell
# En el directorio del proyecto
dotnet publish -c Release -o C:\inetpub\MechanicalWorkshop
```

### 3.3 Configurar IIS

#### Paso 1: Crear Application Pool

1. Abrir **IIS Manager**
2. Click derecho en **Application Pools** → **Add Application Pool**
3. Configurar:
   - **Name:** MechanicalWorkshopPool
   - **.NET CLR Version:** No Managed Code
   - **Managed Pipeline Mode:** Integrated
4. Click **OK**

#### Paso 2: Configurar Application Pool Avanzado

1. Click derecho en **MechanicalWorkshopPool** → **Advanced Settings**
2. Configurar:
   - **Identity:** ApplicationPoolIdentity
   - **Start Mode:** AlwaysRunning
   - **Idle Timeout:** 0 (para evitar que se detenga)

#### Paso 3: Crear Sitio Web

1. Click derecho en **Sites** → **Add Website**
2. Configurar:
   - **Site Name:** MechanicalWorkshop
   - **Application Pool:** MechanicalWorkshopPool
   - **Physical Path:** C:\inetpub\MechanicalWorkshop
   - **Binding:**
     - Type: https
     - Port: 443
     - Host name: app2.j-benz.com
     - SSL Certificate: (seleccionar certificado)
3. Click **OK**

#### Paso 4: Configurar Permisos

```powershell
# Dar permisos al Application Pool Identity
icacls "C:\inetpub\MechanicalWorkshop" /grant "IIS AppPool\MechanicalWorkshopPool:(OI)(CI)F" /T
```

### 3.4 Configurar web.config

Crear/editar `C:\inetpub\MechanicalWorkshop\web.config`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <handlers>
        <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
      </handlers>
      <aspNetCore processPath="dotnet" 
                  arguments=".\Mechanical_workshop.dll" 
                  stdoutLogEnabled="true" 
                  stdoutLogFile=".\logs\stdout" 
                  hostingModel="inprocess">
        <environmentVariables>
          <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Production" />
        </environmentVariables>
      </aspNetCore>
      <httpErrors errorMode="Detailed" />
      <security>
        <requestFiltering>
          <requestLimits maxAllowedContentLength="104857600" />
        </requestFiltering>
      </security>
    </system.webServer>
  </location>
</configuration>
```

### 3.5 Crear Directorio de Logs

```powershell
New-Item -Path "C:\inetpub\MechanicalWorkshop\logs" -ItemType Directory
```

### 3.6 Reiniciar IIS

```powershell
iisreset
```

### 3.7 Verificar Despliegue

```powershell
# Test local
curl http://localhost/api/Users

# Test remoto
curl https://app2.j-benz.com/api/Users
```

---

## 4. Despliegue en Linux con Nginx

### 4.1 Instalar Dependencias

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nginx mysql-server

# Instalar .NET 8.0
wget https://dot.net/v1/dotnet-install.sh
chmod +x dotnet-install.sh
sudo ./dotnet-install.sh --channel 8.0 --install-dir /usr/share/dotnet

# Agregar a PATH
echo 'export PATH=$PATH:/usr/share/dotnet' >> ~/.bashrc
source ~/.bashrc

# Verificar
dotnet --version
```

### 4.2 Publicar Aplicación

```bash
# En máquina de desarrollo
dotnet publish -c Release -o ./publish

# Copiar a servidor (usando SCP)
scp -r ./publish/* user@server:/var/www/mechanical-workshop/
```

### 4.3 Crear Usuario del Sistema

```bash
sudo useradd -r -s /bin/false mechanicalworkshop
sudo chown -R mechanicalworkshop:mechanicalworkshop /var/www/mechanical-workshop
sudo chmod -R 755 /var/www/mechanical-workshop
```

### 4.4 Crear Servicio Systemd

Crear `/etc/systemd/system/mechanical-workshop.service`:

```ini
[Unit]
Description=Mechanical Workshop API
After=network.target

[Service]
Type=notify
User=mechanicalworkshop
Group=mechanicalworkshop
WorkingDirectory=/var/www/mechanical-workshop
ExecStart=/usr/share/dotnet/dotnet /var/www/mechanical-workshop/Mechanical_workshop.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=mechanical-workshop
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

### 4.5 Iniciar Servicio

```bash
# Recargar configuración
sudo systemctl daemon-reload

# Habilitar inicio automático
sudo systemctl enable mechanical-workshop.service

# Iniciar servicio
sudo systemctl start mechanical-workshop.service

# Verificar estado
sudo systemctl status mechanical-workshop.service

# Ver logs
sudo journalctl -u mechanical-workshop.service -f
```

### 4.6 Configurar Nginx

Crear `/etc/nginx/sites-available/mechanical-workshop`:

```nginx
server {
    listen 80;
    server_name app2.j-benz.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app2.j-benz.com;

    ssl_certificate /etc/ssl/certs/mechanical-workshop.crt;
    ssl_certificate_key /etc/ssl/private/mechanical-workshop.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }
}
```

### 4.7 Habilitar Sitio

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/mechanical-workshop /etc/nginx/sites-enabled/

# Test configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 4.8 Configurar Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## 5. Despliegue en Azure App Service

### 5.1 Requisitos Previos

- Cuenta de Azure activa
- Azure CLI instalado

```powershell
# Instalar Azure CLI
winget install -e --id Microsoft.AzureCLI

# Login
az login
```

### 5.2 Crear Recursos en Azure

```bash
# Variables
$resourceGroup = "MechanicalWorkshop-RG"
$location = "eastus"
$appServicePlan = "MechanicalWorkshop-Plan"
$appName = "mechanical-workshop-api"
$mysqlServer = "mechanical-workshop-db"

# Crear Resource Group
az group create --name $resourceGroup --location $location

# Crear App Service Plan
az appservice plan create `
  --name $appServicePlan `
  --resource-group $resourceGroup `
  --sku B2 `
  --is-linux

# Crear Web App
az webapp create `
  --name $appName `
  --resource-group $resourceGroup `
  --plan $appServicePlan `
  --runtime "DOTNET|8.0"

# Crear MySQL Server (Azure Database for MySQL)
az mysql flexible-server create `
  --name $mysqlServer `
  --resource-group $resourceGroup `
  --location $location `
  --admin-user myadmin `
  --admin-password "YourPassword123!" `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --storage-size 32
```

### 5.3 Configurar Variables de Entorno

```bash
# Configurar connection string
az webapp config connection-string set `
  --name $appName `
  --resource-group $resourceGroup `
  --connection-string-type MySql `
  --settings DefaultConnection="Server=$mysqlServer.mysql.database.azure.com;Database=JBenz;User=myadmin;Password=YourPassword123!;"

# Configurar App Settings
az webapp config appsettings set `
  --name $appName `
  --resource-group $resourceGroup `
  --settings `
    ASPNETCORE_ENVIRONMENT="Production" `
    JwtSettings__Secret="iUCLcALYsTb6/Ddv/ulhhr+752ZbFkyFZGvRgQAZpoI=" `
    JwtSettings__Issuer="MechanicalWorkshopAPI" `
    JwtSettings__Audience="MechanicalWorkshopClients"
```

### 5.4 Publicar desde Visual Studio

1. Click derecho en el proyecto → **Publish**
2. Seleccionar **Azure**
3. Seleccionar **Azure App Service (Windows/Linux)**
4. Login con cuenta de Azure
5. Seleccionar el App Service creado
6. Click **Publish**

### 5.5 Publicar desde CLI

```powershell
# Publicar aplicación
dotnet publish -c Release -o ./publish

# Comprimir
Compress-Archive -Path ./publish/* -DestinationPath ./app.zip

# Desplegar
az webapp deployment source config-zip `
  --name $appName `
  --resource-group $resourceGroup `
  --src ./app.zip
```

### 5.6 Configurar Dominio Personalizado

```bash
# Agregar dominio personalizado
az webapp config hostname add `
  --webapp-name $appName `
  --resource-group $resourceGroup `
  --hostname app2.j-benz.com

# Habilitar SSL
az webapp config ssl bind `
  --name $appName `
  --resource-group $resourceGroup `
  --certificate-thumbprint <thumbprint> `
  --ssl-type SNI
```

---

## 6. Despliegue con Docker

### 6.1 Crear Dockerfile

Crear `Dockerfile` en la raíz del proyecto:

```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Mechanical_workshop.csproj", "./"]
RUN dotnet restore "Mechanical_workshop.csproj"

COPY . .
RUN dotnet build "Mechanical_workshop.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Mechanical_workshop.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 80
EXPOSE 443

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Mechanical_workshop.dll"]
```

### 6.2 Crear docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mechanical-workshop-api
    ports:
      - "5000:80"
      - "5001:443"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=db;Database=JBenz;User=root;Password=rootpassword;
      - JwtSettings__Secret=iUCLcALYsTb6/Ddv/ulhhr+752ZbFkyFZGvRgQAZpoI=
      - JwtSettings__Issuer=MechanicalWorkshopAPI
      - JwtSettings__Audience=MechanicalWorkshopClients
    depends_on:
      - db
    networks:
      - mechanical-network

  db:
    image: mysql:8.0
    container_name: mechanical-workshop-db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: JBenz
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - mechanical-network

networks:
  mechanical-network:
    driver: bridge

volumes:
  mysql-data:
```

### 6.3 Construir y Ejecutar

```powershell
# Construir imagen
docker-compose build

# Iniciar contenedores
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

### 6.4 Aplicar Migraciones en Docker

```powershell
# Acceder al contenedor
docker exec -it mechanical-workshop-api bash

# Aplicar migraciones
dotnet ef database update

# Salir
exit
```

---

## 7. Configuración de Base de Datos

### 7.1 Instalación MySQL (Windows)

```powershell
# Descargar MySQL Installer desde mysql.com
# Durante instalación, configurar:
# - Root password
# - Puerto: 3306
# - Crear base de datos: JBenz
```

### 7.2 Instalación MySQL (Linux)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# Configurar seguridad
sudo mysql_secure_installation

# Login
sudo mysql -u root -p

# Crear base de datos
CREATE DATABASE JBenz;
CREATE USER 'mechanicaluser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON JBenz.* TO 'mechanicaluser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 7.3 Aplicar Migraciones

```powershell
# Desde directorio del proyecto
dotnet ef database update

# O crear nueva migración
dotnet ef migrations add MigrationName
dotnet ef database update
```

### 7.4 Conexión Remota MySQL

```sql
-- Permitir conexiones remotas
-- Editar /etc/mysql/mysql.conf.d/mysqld.cnf
-- bind-address = 0.0.0.0

-- Crear usuario remoto
CREATE USER 'remoteuser'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON JBenz.* TO 'remoteuser'@'%';
FLUSH PRIVILEGES;
```

```bash
# Reiniciar MySQL
sudo systemctl restart mysql
```

---

## 8. Variables de Entorno

### 8.1 appsettings.Production.json

Crear `appsettings.Production.json`:

```json
{
  "JwtSettings": {
    "Secret": "${JWT_SECRET}",
    "Issuer": "MechanicalWorkshopAPI",
    "Audience": "MechanicalWorkshopClients",
    "TokenExpirationMinutes": 60
  },
  "ConnectionStrings": {
    "DefaultConnection": "${CONNECTION_STRING}"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Error"
    }
  }
}
```

### 8.2 Variables de Entorno (Windows)

```powershell
# Configurar variables de entorno del sistema
[System.Environment]::SetEnvironmentVariable('JWT_SECRET', 'tu-clave-secreta', 'Machine')
[System.Environment]::SetEnvironmentVariable('CONNECTION_STRING', 'Server=...', 'Machine')
```

### 8.3 Variables de Entorno (Linux)

```bash
# Agregar a /etc/environment
sudo nano /etc/environment

# Agregar:
JWT_SECRET="tu-clave-secreta"
CONNECTION_STRING="Server=..."

# Recargar
source /etc/environment
```

---

## 9. Seguridad y SSL

### 9.1 Obtener Certificado SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d app2.j-benz.com

# Renovación automática
sudo certbot renew --dry-run
```

### 9.2 Configurar HTTPS en Kestrel

En `appsettings.Production.json`:

```json
{
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://localhost:5000"
      },
      "Https": {
        "Url": "https://localhost:5001",
        "Certificate": {
          "Path": "/path/to/certificate.pfx",
          "Password": "certificate-password"
        }
      }
    }
  }
}
```

### 9.3 Configurar CORS en Producción

En `Program.cs`:

```csharp
builder.Services.AddCors(options => 
{
    options.AddPolicy("ProductionCorsPolicy", policy =>
    {
        policy.WithOrigins("https://app2.j-benz.com", "https://www.app2.j-benz.com")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// En app
app.UseCors("ProductionCorsPolicy");
```

---

## 10. Monitoreo y Logs

### 10.1 Configurar Logging

En `appsettings.Production.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    },
    "File": {
      "Path": "logs/app-.log",
      "RollingInterval": "Day",
      "RetainedFileCountLimit": 30
    }
  }
}
```

### 10.2 Ver Logs (IIS)

```powershell
# Logs de aplicación
Get-Content C:\inetpub\MechanicalWorkshop\logs\stdout*.log -Tail 50 -Wait

# Logs de Windows Event Viewer
Get-EventLog -LogName Application -Source "ASP.NET Core" -Newest 50
```

### 10.3 Ver Logs (Linux)

```bash
# Logs del servicio
sudo journalctl -u mechanical-workshop.service -f

# Logs de aplicación
tail -f /var/www/mechanical-workshop/logs/app-*.log

# Logs de Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### 10.4 Monitoreo con Application Insights (Azure)

```csharp
// Agregar paquete
// dotnet add package Microsoft.ApplicationInsights.AspNetCore

// En Program.cs
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
});
```

---

## 11. Backup y Recuperación

### 11.1 Backup de Base de Datos

```bash
# MySQL Backup
mysqldump -u root -p JBenz > backup_$(date +%Y%m%d).sql

# Restaurar
mysql -u root -p JBenz < backup_20250117.sql
```

### 11.2 Script de Backup Automático (Linux)

Crear `/usr/local/bin/backup-mechanical-workshop.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups/mechanical-workshop"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="JBenz"
DB_USER="root"
DB_PASS="password"

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Backup de base de datos
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup de archivos de aplicación
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/mechanical-workshop

# Eliminar backups antiguos (más de 30 días)
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completado: $DATE"
```

```bash
# Dar permisos
sudo chmod +x /usr/local/bin/backup-mechanical-workshop.sh

# Agregar a crontab (diario a las 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-mechanical-workshop.sh >> /var/log/mechanical-backup.log 2>&1
```

---

## 12. Troubleshooting

### 12.1 Problemas Comunes

#### Error: "Unable to connect to MySQL"

```bash
# Verificar que MySQL está corriendo
sudo systemctl status mysql

# Verificar firewall
sudo ufw status

# Test de conexión
mysql -h localhost -u root -p
```

#### Error: "HTTP 502 Bad Gateway"

```bash
# Verificar que la aplicación está corriendo
sudo systemctl status mechanical-workshop.service

# Verificar logs
sudo journalctl -u mechanical-workshop.service -n 100

# Reiniciar servicio
sudo systemctl restart mechanical-workshop.service
```

#### Error: "JWT Bearer token is invalid"

- Verificar que el `JwtSettings:Secret` es el mismo en todas las instancias
- Verificar que el token no ha expirado
- Verificar que el `Issuer` y `Audience` coinciden

### 12.2 Comandos de Diagnóstico

```powershell
# Verificar versión de .NET
dotnet --version

# Verificar proceso corriendo
Get-Process dotnet

# Verificar puertos en uso
netstat -ano | findstr :5000

# Test de conectividad
Test-NetConnection -ComputerName localhost -Port 5000
```

```bash
# Linux
dotnet --version
ps aux | grep dotnet
netstat -tlnp | grep :5000
curl http://localhost:5000/api/Users
```

### 12.3 Reinicio Rápido

**Windows (IIS):**
```powershell
iisreset
```

**Linux:**
```bash
sudo systemctl restart mechanical-workshop.service
sudo systemctl restart nginx
```

**Docker:**
```powershell
docker-compose restart
```

---

## Checklist de Despliegue

- [ ] .NET 8.0 Runtime instalado
- [ ] MySQL configurado y corriendo
- [ ] Migraciones aplicadas
- [ ] Variables de entorno configuradas
- [ ] Certificado SSL instalado
- [ ] CORS configurado para dominio de producción
- [ ] Firewall configurado
- [ ] Backup automático configurado
- [ ] Logs configurados y monitoreados
- [ ] Prueba de endpoints principales
- [ ] Documentación actualizada

---

## Recursos Adicionales

- [Documentación oficial de ASP.NET Core](https://docs.microsoft.com/aspnet/core)
- [Guía de despliegue de .NET en Linux](https://docs.microsoft.com/dotnet/core/install/linux)
- [IIS Hosting](https://docs.microsoft.com/aspnet/core/host-and-deploy/iis)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/)
- [Docker Hub - .NET](https://hub.docker.com/_/microsoft-dotnet)

---

**Última actualización:** Octubre 2025
