# Proyecto Taller

Bienvenido al **Proyecto Taller**. Este proyecto está construido utilizando **.NET Core 8** para el backend, **React JS** para el frontend, y **MySQL** como base de datos. A continuación, encontrarás las instrucciones para configurar y ejecutar el proyecto.

## Índice

- [Proyecto Taller](#proyecto-taller)
  - [Índice](#índice)
  - [Prerrequisitos](#prerrequisitos)
    - [.NET SDK 8](#net-sdk-8)
      - [**En Linux**](#en-linux)
      - [**En Windows**](#en-windows)
    - [Node.js y npm](#nodejs-y-npm)
      - [**En Linux**](#en-linux-1)
      - [**En Windows**](#en-windows-1)
    - [MySQL](#mysql)
      - [**En Linux (Ubuntu)**](#en-linux-ubuntu)
      - [**En Windows**](#en-windows-2)
    - [Pomelo.EntityFrameworkCore.MySql](#pomeloentityframeworkcoremysql)
      - [**En Linux y Windows**](#en-linux-y-windows)
  - [Configuración del Proyecto](#configuración-del-proyecto)
    - [Clonar el Repositorio](#clonar-el-repositorio)
    - [Configurar la Base de Datos](#configurar-la-base-de-datos)
    - [Instalar Dependencias](#instalar-dependencias)
      - [**Backend (.NET Core 8)**](#backend-net-core-8)
      - [**Frontend (React JS)**](#frontend-react-js)
  - [Ejecutar la Aplicación](#ejecutar-la-aplicación)
    - [Backend (.NET Core 8)](#backend-net-core-8-1)
    - [Frontend (React JS)](#frontend-react-js-1)
  - [Buenas Prácticas](#buenas-prácticas)
  - [Recursos Adicionales](#recursos-adicionales)

## Prerrequisitos

### .NET SDK 8

#### **En Linux**

Sigue estos pasos para instalar el SDK de .NET 8 en una distribución basada en **Ubuntu**. Si usas otra distribución, consulta la [documentación oficial de .NET](https://learn.microsoft.com/es-es/dotnet/).

1. **Actualizar el Índice de Paquetes**

    ```bash
    sudo apt update
    sudo apt upgrade -y
    ```

2. **Instalar Dependencias Necesarias**

    ```bash
    sudo apt install -y wget apt-transport-https software-properties-common
    ```

3. **Importar la Clave Pública de Microsoft**

    ```bash
    wget https://packages.microsoft.com/config/ubuntu/24.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
    sudo dpkg -i packages-microsoft-prod.deb
    rm packages-microsoft-prod.deb
    ```

    _Nota:_ Reemplaza `24.04` con tu versión específica de Ubuntu si es necesario.

4. **Instalar el SDK de .NET 8**

    ```bash
    sudo apt update
    sudo apt install -y dotnet-sdk-8.0
    ```

5. **Verificar la Instalación**

    ```bash
    dotnet --version
    ```

    Deberías ver una versión similar a `8.0.x`.

#### **En Windows**

1. **Descargar el Instalador**

    Ve a la [página de descargas de .NET](https://dotnet.microsoft.com/download/dotnet/8.0) y descarga el instalador del SDK de .NET 8 para Windows.

2. **Ejecutar el Instalador**

    Ejecuta el archivo descargado y sigue las instrucciones del instalador.

3. **Verificar la Instalación**

    Abre una **PowerShell** o **Símbolo del sistema** y ejecuta:

    ```powershell
    dotnet --version
    ```

    Deberías ver una versión similar a `8.0.x`.

### Node.js y npm

#### **En Linux**

1. **Instalar nvm (Node Version Manager)**

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
    source ~/.bashrc
    ```

2. **Instalar la Última Versión LTS de Node.js**

    ```bash
    nvm install --lts
    ```

3. **Verificar la Instalación**

    ```bash
    node --version
    npm --version
    ```

#### **En Windows**

1. **Descargar el Instalador**

    Ve a la [página de descargas de Node.js](https://nodejs.org/en/download/) y descarga el instalador de la versión **LTS** para Windows.

2. **Ejecutar el Instalador**

    Ejecuta el archivo descargado y sigue las instrucciones del instalador.

3. **Verificar la Instalación**

    Abre una **PowerShell** o **Símbolo del sistema** y ejecuta:

    ```powershell
    node --version
    npm --version
    ```

### MySQL

#### **En Linux (Ubuntu)**

1. **Actualizar el Índice de Paquetes**

    ```bash
    sudo apt update
    ```

2. **Instalar MySQL Server**

    ```bash
    sudo apt install -y mysql-server
    ```

3. **Configurar la Instalación de MySQL**

    Ejecuta el script de seguridad para asegurar la instalación:

    ```bash
    sudo mysql_secure_installation
    ```

    Sigue las instrucciones para establecer una contraseña de root y configurar las opciones de seguridad.

4. **Verificar el Servicio de MySQL**

    ```bash
    sudo systemctl status mysql
    ```

#### **En Windows**

1. **Descargar el Instalador**

    Ve a la [página de descargas de MySQL](https://dev.mysql.com/downloads/installer/) y descarga el **MySQL Installer** para Windows.

2. **Ejecutar el Instalador**

    Ejecuta el archivo descargado y sigue las instrucciones del asistente de instalación. Durante la instalación, podrás configurar la contraseña del usuario `root` y crear usuarios adicionales.

3. **Verificar la Instalación**

    Abre una **PowerShell** o **Símbolo del sistema** y ejecuta:

    ```powershell
    mysql -u root -p
    ```

    Ingresa la contraseña configurada para verificar que puedes acceder al servidor MySQL.

### Pomelo.EntityFrameworkCore.MySql

#### **En Linux y Windows**

Pomelo es un proveedor de MySQL para **Entity Framework Core**. Para instalarlo, sigue estos pasos:

1. **Navegar al Directorio del Proyecto Backend**

    ```bash
    cd backend
    ```

2. **Agregar el Paquete NuGet de Pomelo**

    ```bash
    dotnet add package Pomelo.EntityFrameworkCore.MySql
    ```

3. **Verificar la Instalación**

    Abre el archivo `.csproj` del proyecto backend y verifica que el paquete `Pomelo.EntityFrameworkCore.MySql` esté listado como una dependencia.

    ```xml
    <ItemGroup>
      <PackageReference Include="Pomelo.EntityFrameworkCore.MySql" Version="8.0.0" />
    </ItemGroup>
    ```

## Configuración del Proyecto

### Clonar el Repositorio

1. **Clonar el Repositorio desde GitHub**

    ```bash
    git clone https://github.com/tu_usuario/tu_repositorio.git
    cd tu_repositorio
    ```

    _Reemplaza `tu_usuario` y `tu_repositorio` con tu nombre de usuario y el nombre de tu repositorio._

### Configurar la Base de Datos

1. **Crear la Base de Datos en MySQL**

    Abre una terminal y accede a MySQL:

    ```bash
    mysql -u root -p
    ```

    Luego, crea la base de datos:

    ```sql
    CREATE DATABASE mi_basededatos;
    CREATE USER 'usuario'@'localhost' IDENTIFIED BY 'contraseña';
    GRANT ALL PRIVILEGES ON mi_basededatos.* TO 'usuario'@'localhost';
    FLUSH PRIVILEGES;
    EXIT;
    ```

    _Reemplaza `mi_basededatos`, `usuario` y `contraseña` con los valores que prefieras._

2. **Configurar la Cadena de Conexión**

    Abre el archivo `appsettings.json` en el directorio `backend` y configura la cadena de conexión:

    ```json
    {
      "ConnectionStrings": {
        "DefaultConnection": "Server=localhost;Database=mi_basededatos;User=usuario;Password=contraseña;"
      }
      // Otros ajustes
    }
    ```

### Instalar Dependencias

#### **Backend (.NET Core 8)**

1. **Navegar al Directorio del Backend**

    ```bash
    cd backend
    ```

2. **Restaurar Dependencias**

    ```bash
    dotnet restore
    ```

3. **Aplicar Migraciones y Crear la Base de Datos**

    ```bash
    dotnet ef migrations add InitialCreate
    dotnet ef database update
    ```

    _Nota:_ Asegúrate de que la cadena de conexión en `appsettings.json` es correcta antes de ejecutar estos comandos.

#### **Frontend (React JS)**

1. **Navegar al Directorio del Frontend**

    ```bash
    cd frontend
    ```

2. **Instalar Dependencias con npm**

    ```bash
    npm install
    ```

    _O si prefieres usar yarn:_

    ```bash
    yarn install
    ```

## Ejecutar la Aplicación

### Backend (.NET Core 8)

1. **Navegar al Directorio del Backend**

    ```bash
    cd backend
    ```

2. **Ejecutar la Aplicación**

    ```bash
    dotnet run
    ```

3. **Acceder a la API**

    La aplicación debería estar corriendo en `http://localhost:5000` (puede variar). Puedes verificar accediendo a `http://localhost:5000/api/usuarios` (ajusta según tus controladores).

### Frontend (React JS)

1. **Navegar al Directorio del Frontend**

    ```bash
    cd frontend
    ```

2. **Ejecutar la Aplicación React**

    ```bash
    npm start
    ```

    _O si usas yarn:_

    ```bash
    yarn start
    ```

3. **Acceder al Frontend**

    Abre tu navegador y ve a `http://localhost:3000` para ver la aplicación React en funcionamiento.

## Buenas Prácticas

- **.gitignore:** Asegúrate de que el archivo `.gitignore` esté correctamente configurado para evitar que se suban archivos innecesarios al repositorio. Un ejemplo básico puede incluir:

    ```gitignore
    # Node modules
    node_modules/

    # Logs
    *.log

    # Build directories
    /dist
    /build

    # Visual Studio Code
    .vscode/

    # .NET
    bin/
    obj/

    # Sistema operativo
    .DS_Store
    Thumbs.db
    ```

- **Ramas Git:** Utiliza ramas para desarrollar nuevas funcionalidades y mantener el código limpio. Por ejemplo, crea una rama `feature/nueva-funcionalidad` para desarrollar una nueva característica y luego haz un pull request a la rama `main`.

- **Documentación:** Mantén la documentación actualizada para facilitar la colaboración y el mantenimiento del proyecto.

- **Seguridad:** No olvides proteger las credenciales sensibles. Utiliza variables de entorno para almacenar información sensible como cadenas de conexión.

## Recursos Adicionales

- [Documentación Oficial de .NET](https://docs.microsoft.com/es-es/dotnet/)
- [Documentación de React](https://reactjs.org/docs/getting-started.html)
- [Documentación de MySQL](https://dev.mysql.com/doc/)
- [Pomelo.EntityFrameworkCore.MySql en GitHub](https://github.com/PomeloFoundation/Pomelo.EntityFrameworkCore.MySql)
- [GitHub Guides](https://guides.github.com/)

---

¡Gracias por utilizar este proyecto! Si tienes alguna pregunta o encuentras algún problema, no dudes en abrir un **issue** o contactar al mantenedor del proyecto.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
