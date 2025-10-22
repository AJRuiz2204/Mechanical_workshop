# 🚗 Sistema de Gestión de Taller Mecánico

Sistema web completo para la gestión integral de talleres mecánicos, desarrollado con React + Vite.

## 🌟 Características Principales

- **Gestión de Vehículos**: Registro, seguimiento y administración de vehículos
- **Diagnósticos Técnicos**: Sistema completo de diagnóstico para técnicos y gerentes
- **Cotizaciones**: Creación, edición y aprobación de presupuestos con cálculo automático
- **Cuentas por Cobrar**: Control financiero de pagos y facturación
- **Reportes PDF y Excel**: Generación profesional de documentos
- **Multi-usuario**: Sistema de roles (Gerente, Técnico)
- **Recuperación de Contraseña**: Sistema de recuperación vía email
- **Configuración Personalizada**: Ajustes del taller y parámetros fiscales

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18.0.0
- Yarn >= 4.3.1
- Backend API corriendo en `http://localhost:5121`

### Instalación

```powershell
# Clonar el repositorio
git clone <repository-url>
cd frontend

# Instalar dependencias
yarn install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar servidor de desarrollo
yarn dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📚 Documentación

### Documentación Principal

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Documentación completa del sistema
  - Descripción general
  - Stack tecnológico
  - Guía de instalación
  - Módulos y funcionalidades
  - Endpoints de API
  - Autenticación y roles
  - Generación de reportes

### Documentación Técnica

- **[docs/INSTALLATION.md](./docs/INSTALLATION.md)** - Guía detallada de instalación
  - Requisitos del sistema
  - Instalación paso a paso
  - Configuración de servicios externos (EmailJS)
  - Solución de problemas
  - Comandos útiles

- **[docs/API_REFERENCE.md](./docs/API_REFERENCE.md)** - Referencia completa de API
  - Todos los endpoints documentados
  - Modelos de datos (DTOs)
  - Ejemplos de request/response
  - Códigos de estado HTTP
  - Manejo de errores

- **[docs/PACKAGES.md](./docs/PACKAGES.md)** - Gestión de paquetes
  - Todas las dependencias explicadas
  - Propósito de cada librería
  - Gestión con Yarn
  - Actualización de paquetes
  - Optimización del bundle

- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Arquitectura del sistema
  - Diagramas del sistema
  - Flujos de datos
  - Patrones de diseño utilizados
  - Estructura de componentes
  - Consideraciones de performance

## 🛠️ Stack Tecnológico

### Core
- **React** 18.3.1 - Librería de UI
- **Vite** 6.0.1 - Build tool
- **React Router** 7.1.1 - Enrutamiento

### UI/UX
- **Ant Design** 5.24.9 - Componentes UI
- **React Bootstrap** 2.10.6 - Bootstrap para React
- **React Toastify** 9.1.1 - Notificaciones

### Comunicación
- **Axios** 1.7.9 - Cliente HTTP
- **EmailJS** 3.2.0 - Envío de emails

### Documentos
- **@react-pdf/renderer** 4.1.6 - Generación de PDFs
- **ExcelJS** 4.4.0 - Generación de Excel
- **File Saver** 2.0.5 - Descarga de archivos

### Utilidades
- **Day.js** 1.11.13 - Manejo de fechas

## 📦 Scripts Disponibles

```powershell
# Desarrollo
yarn dev          # Inicia servidor de desarrollo en puerto 5173

# Build
yarn build        # Crea build de producción en carpeta dist/
yarn preview      # Preview del build de producción

# Linting
yarn lint         # Ejecuta ESLint para detectar errores
```

## 🏗️ Estructura del Proyecto

```
frontend/
├── docs/                    # Documentación técnica adicional
├── public/                  # Archivos públicos estáticos
├── src/
│   ├── components/         # Componentes React organizados por features
│   │   ├── common/        # Componentes reutilizables
│   │   ├── login/         # Módulo de autenticación
│   │   ├── Home/          # Módulos principales del sistema
│   │   ├── Layout/        # Layouts y estructura
│   │   └── ProtectedRoute/ # Rutas protegidas
│   ├── Context/           # Context API (AuthContext)
│   ├── services/          # Servicios de API
│   ├── images/            # Recursos de imagen
│   ├── App.jsx            # Componente raíz con rutas
│   └── main.jsx           # Punto de entrada
├── .env                    # Variables de entorno (no en repo)
├── .env.example           # Ejemplo de variables de entorno
├── package.json           # Dependencias y scripts
├── vite.config.js         # Configuración de Vite
└── README.md              # Este archivo
```

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para autenticación:

1. Usuario ingresa credenciales
2. Backend valida y genera token JWT
3. Token se almacena en localStorage
4. Todas las peticiones incluyen token en headers
5. Rutas protegidas validan token y rol

### Roles Disponibles

- **Manager**: Acceso completo al sistema
- **Technician**: Acceso limitado a diagnósticos asignados

## 📊 Módulos del Sistema

### 1. Gestión de Vehículos
- Registro de vehículos y propietarios
- Búsqueda y filtrado
- Historial completo
- Estados del vehículo

### 2. Diagnósticos
- Diagnóstico inicial (Manager)
- Diagnóstico técnico detallado (Technician)
- Asignación de técnicos
- Lista de partes necesarias

### 3. Cotizaciones
- Creación de presupuestos
- Cálculo automático de totales
- Generación de PDF
- Estados: Borrador, Enviado, Aprobado

### 4. Cuentas por Cobrar
- Control de pagos
- Registro de pagos parciales/totales
- Historial de pagos
- Generación de recibos

### 5. Reportes
- Reportes de ventas
- Exportación a PDF y Excel
- Filtros por fecha, cliente, técnico

### 6. Configuración
- Datos del taller
- Configuración de impuestos
- Markup de mano de obra

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz:

```env
# API Configuration
VITE_API_URL=http://localhost:5121/api

# EmailJS (para recuperación de contraseña)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

## 🚀 Despliegue

### Build de Producción

```powershell
# Crear build
yarn build

# La carpeta dist/ contendrá los archivos para despliegue
```

### Despliegue en IIS

1. Ejecutar `yarn build`
2. Copiar contenido de `dist/` a directorio IIS
3. Configurar sitio en IIS Manager
4. El archivo `web.config` ya está incluido para manejo de rutas

### Despliegue en Azure/Netlify/Vercel

1. Conectar repositorio
2. Configurar build command: `yarn build`
3. Configurar publish directory: `dist`
4. Configurar variables de entorno

## 🐛 Solución de Problemas

### Error de CORS
Verificar que el backend tenga CORS habilitado para el origen del frontend.

### Token Expirado
El sistema redirige automáticamente a login cuando el token expira.

### Errores de Build
```powershell
# Limpiar e reinstalar
rm -rf node_modules
rm yarn.lock
yarn install
yarn build
```

Ver más soluciones en [docs/INSTALLATION.md](./docs/INSTALLATION.md#solución-de-problemas)

## 📞 Soporte

Para reportar issues o solicitar funcionalidades, contactar al equipo de desarrollo.

## 📄 Licencia

Este proyecto es privado y confidencial.

---

## 🔗 Enlaces Útiles

- [Documentación de React](https://react.dev/)
- [Documentación de Vite](https://vitejs.dev/)
- [Ant Design Components](https://ant.design/components/overview/)
- [React Router](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)

---

**Versión**: 1.0.0  
**Última actualización**: Octubre 2025  

## 👥 Equipo de Desarrollo

Desarrollado con ❤️ para talleres mecánicos modernos.
