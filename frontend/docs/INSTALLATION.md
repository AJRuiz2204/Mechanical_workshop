# 🚀 Guía de Instalación y Configuración

## Tabla de Contenidos
- [Requisitos Previos](#requisitos-previos)
- [Instalación desde Cero](#instalación-desde-cero)
- [Configuración del Entorno](#configuración-del-entorno)
- [Configuración de Servicios Externos](#configuración-de-servicios-externos)
- [Verificación de la Instalación](#verificación-de-la-instalación)
- [Solución de Problemas](#solución-de-problemas)

---

## Requisitos Previos

### Software Requerido

#### 1. Node.js
- **Versión Mínima**: 18.0.0 o superior
- **Recomendada**: 20.x LTS

**Instalación en Windows**:
```powershell
# Descargar desde https://nodejs.org/
# O usando Chocolatey:
choco install nodejs-lts

# Verificar instalación
node --version
npm --version
```

#### 2. Yarn
- **Versión**: 4.3.1 o superior

**Instalación**:
```powershell
# Habilitar Corepack (incluido con Node.js 16.10+)
corepack enable

# Instalar Yarn
corepack prepare yarn@4.3.1 --activate

# Verificar instalación
yarn --version
```

#### 3. Git
- **Versión Mínima**: 2.x

**Instalación en Windows**:
```powershell
# Descargar desde https://git-scm.com/
# O usando Chocolatey:
choco install git

# Verificar instalación
git --version
```

### Software Opcional pero Recomendado

#### Visual Studio Code
- **Extensiones Recomendadas**:
  - ESLint
  - Prettier
  - ES7+ React/Redux/React-Native snippets
  - Auto Rename Tag
  - Path Intellisense
  - GitLens

**Instalación**:
```powershell
choco install vscode
```

---

## Instalación desde Cero

### Paso 1: Clonar el Repositorio

```powershell
# Navegar al directorio deseado
cd C:\Users\ajrui\Desktop\proyectos

# Clonar el repositorio
git clone <repository-url> Mechanical_workshop

# Navegar al directorio del frontend
cd Mechanical_workshop\frontend
```

### Paso 2: Instalar Dependencias

```powershell
# Limpiar caché (opcional, recomendado si hay problemas)
yarn cache clean

# Instalar todas las dependencias
yarn install

# Este proceso puede tomar 5-10 minutos dependiendo de la conexión
```

**Salida Esperada**:
```
➤ YN0000: ┌ Resolution step
➤ YN0000: └ Completed in 2s 345ms
➤ YN0000: ┌ Fetch step
➤ YN0000: └ Completed in 45s 678ms
➤ YN0000: ┌ Link step
➤ YN0000: └ Completed in 3s 456ms
➤ YN0000: Done with warnings in 51s 479ms
```

### Paso 3: Verificar package.json

Asegurarse que `package.json` contenga todas las dependencias:

```json
{
  "dependencies": {
    "@react-pdf/renderer": "^4.1.6",
    "antd": "^5.24.9",
    "axios": "^1.7.9",
    "bootstrap": "^5.3.3",
    "dayjs": "^1.11.13",
    "emailjs-com": "^3.2.0",
    "exceljs": "^4.4.0",
    "file-saver": "^2.0.5",
    "react": "^18.3.1",
    "react-bootstrap": "^2.10.6",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.1.1",
    "react-toastify": "^9.1.1"
  }
}
```

---

## Configuración del Entorno

### Paso 1: Crear Archivo de Variables de Entorno

```powershell
# Crear archivo .env en la raíz del proyecto frontend
New-Item -Path .env -ItemType File
```

### Paso 2: Configurar Variables de Entorno

Editar `.env` con el siguiente contenido:

```env
# API Configuration
VITE_API_URL=http://localhost:5121/api
VITE_API_TIMEOUT=30000

# EmailJS Configuration (para recuperación de contraseña)
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here

# Application Configuration
VITE_APP_NAME=Sistema de Taller Mecánico
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_PDF_EXPORT=true
VITE_ENABLE_EXCEL_EXPORT=true
```

### Paso 3: Configurar API Base URL

En `src/services/api.js`, verificar la configuración:

```javascript
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5121/api",
    timeout: import.meta.env.VITE_API_TIMEOUT || 30000,
});
```

---

## Configuración de Servicios Externos

### EmailJS (Recuperación de Contraseña)

#### Paso 1: Crear Cuenta en EmailJS

1. Visitar https://www.emailjs.com/
2. Crear cuenta gratuita
3. Verificar email

#### Paso 2: Configurar Servicio de Email

1. En el dashboard, ir a **Email Services**
2. Click en **Add New Service**
3. Seleccionar proveedor (Gmail, Outlook, etc.)
4. Seguir instrucciones de conexión
5. Copiar el **Service ID**

#### Paso 3: Crear Plantilla de Email

1. Ir a **Email Templates**
2. Click en **Create New Template**
3. Usar el siguiente template:

```html
Asunto: Código de Recuperación de Contraseña

Hola,

Has solicitado restablecer tu contraseña.

Tu código de verificación es: {{verification_code}}

Este código expirará en 15 minutos.

Si no solicitaste este cambio, ignora este mensaje.

Saludos,
Sistema de Taller Mecánico
```

4. Variables a usar:
   - `to_email` - Email del destinatario
   - `verification_code` - Código de verificación

5. Copiar el **Template ID**

#### Paso 4: Obtener Public Key

1. En el dashboard, ir a **Account**
2. Ir a **API Keys**
3. Copiar el **Public Key**

#### Paso 5: Actualizar Configuración

**Opción A**: Usar variables de entorno (recomendado)

Actualizar `.env`:
```env
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxx
```

Actualizar `src/services/UserLoginServices.js`:
```javascript
const result = await emailjs.send(
  import.meta.env.VITE_EMAILJS_SERVICE_ID,
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  templateParams,
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY
);
```

**Opción B**: Hardcodear valores (no recomendado para producción)

```javascript
const result = await emailjs.send(
  "service_abc123",    // Tu Service ID
  "template_xyz789",   // Tu Template ID
  templateParams,
  "user_1234567890"    // Tu Public Key
);
```

---

## Verificación de la Instalación

### Paso 1: Iniciar Servidor de Desarrollo

```powershell
# Iniciar en modo desarrollo
yarn dev
```

**Salida Esperada**:
```
  VITE v6.0.1  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Paso 2: Verificar en el Navegador

1. Abrir http://localhost:5173/
2. Debe mostrar la página de login
3. Verificar consola del navegador (F12) - no debe haber errores

### Paso 3: Verificar Conexión a API

```powershell
# Verificar que el backend esté corriendo
Test-NetConnection -ComputerName localhost -Port 5121
```

Si el backend no está corriendo, verás errores de conexión en la consola del navegador.

### Paso 4: Test de Login

1. Intentar login con credenciales de prueba
2. Verificar que se genere token JWT
3. Verificar redirección exitosa

### Paso 5: Verificar Build de Producción

```powershell
# Crear build de producción
yarn build

# La carpeta dist/ debe ser creada
ls dist
```

**Estructura esperada de dist/**:
```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [otros archivos]
├── index.html
└── web.config
```

---

## Configuración Avanzada

### Configurar ESLint

Editar `eslint.config.js`:

```javascript
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
```

### Configurar Vite

Editar `vite.config.js` para configuración avanzada:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [react()],
  
  // Configuración de resolución de módulos
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@context': path.resolve(__dirname, './src/Context'),
      '@images': path.resolve(__dirname, './src/images'),
    },
  },
  
  // Configuración del servidor de desarrollo
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5121',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // Configuración de build
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['antd', 'react-bootstrap', 'bootstrap'],
          'vendor-utils': ['axios', 'dayjs', 'file-saver'],
          'vendor-pdf': ['@react-pdf/renderer'],
          'vendor-excel': ['exceljs'],
        },
      },
    },
  },
  
  // Configuración de optimización
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'antd',
    ],
  },
});
```

### Configurar Scripts Personalizados

Agregar a `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "build:staging": "vite build --mode staging",
    "build:prod": "vite build --mode production",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,css}\"",
    "clean": "rimraf dist node_modules",
    "reinstall": "yarn clean && yarn install"
  }
}
```

---

## Configuración para Diferentes Entornos

### Desarrollo (.env.development)

```env
VITE_API_URL=http://localhost:5121/api
VITE_ENABLE_LOGGING=true
VITE_ENABLE_DEBUG=true
```

### Staging (.env.staging)

```env
VITE_API_URL=https://api-staging.j-benz.com
VITE_ENABLE_LOGGING=true
VITE_ENABLE_DEBUG=false
```

### Producción (.env.production)

```env
VITE_API_URL=https://api.j-benz.com
VITE_ENABLE_LOGGING=false
VITE_ENABLE_DEBUG=false
```

### Uso:

```powershell
# Build para desarrollo
yarn build:dev

# Build para staging
yarn build:staging

# Build para producción
yarn build:prod
```

---

## Solución de Problemas

### Problema 1: Error al instalar dependencias

**Síntoma**:
```
error An unexpected error occurred: "EACCES: permission denied"
```

**Solución**:
```powershell
# Ejecutar PowerShell como Administrador
# Limpiar caché
yarn cache clean

# Reinstalar
rm -r node_modules
rm yarn.lock
yarn install
```

### Problema 2: Puerto 5173 en uso

**Síntoma**:
```
Port 5173 is in use
```

**Solución**:
```powershell
# Encontrar proceso usando el puerto
netstat -ano | findstr :5173

# Matar proceso (reemplazar PID)
taskkill /PID <PID> /F

# O cambiar puerto en vite.config.js
server: {
  port: 3000
}
```

### Problema 3: Error de CORS

**Síntoma**:
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solución**:
Configurar proxy en `vite.config.js`:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5121',
      changeOrigin: true,
    }
  }
}
```

### Problema 4: Módulos no encontrados

**Síntoma**:
```
Error: Cannot find module 'axios'
```

**Solución**:
```powershell
# Verificar que el módulo esté en package.json
cat package.json | Select-String "axios"

# Reinstalar dependencias
yarn install

# Si persiste, instalar específicamente
yarn add axios
```

### Problema 5: Build falla con error de memoria

**Síntoma**:
```
FATAL ERROR: Reached heap limit Allocation failed
```

**Solución**:
```powershell
# Aumentar memoria disponible para Node
$env:NODE_OPTIONS="--max-old-space-size=4096"
yarn build
```

### Problema 6: EmailJS no funciona

**Solución**:
1. Verificar credenciales en `.env`
2. Verificar que las variables estén usando `import.meta.env`
3. Verificar límites de EmailJS (300 emails/mes en plan gratuito)
4. Verificar plantilla en dashboard de EmailJS
5. Verificar consola del navegador para errores específicos

---

## Comandos Útiles

### Gestión de Dependencias

```powershell
# Ver dependencias instaladas
yarn list

# Ver versiones desactualizadas
yarn outdated

# Actualizar todas las dependencias
yarn upgrade

# Actualizar dependencia específica
yarn upgrade axios

# Agregar dependencia
yarn add nombre-paquete

# Agregar dependencia de desarrollo
yarn add -D nombre-paquete

# Remover dependencia
yarn remove nombre-paquete
```

### Gestión de Proyecto

```powershell
# Ver información del proyecto
yarn info

# Limpiar caché
yarn cache clean

# Verificar integridad
yarn check

# Ejecutar script personalizado
yarn <nombre-script>
```

### Git

```powershell
# Ver estado
git status

# Crear commit
git add .
git commit -m "Mensaje"

# Push
git push origin main

# Pull
git pull origin main
```

---

## Checklist de Instalación

- [ ] Node.js 18+ instalado
- [ ] Yarn 4.3.1+ instalado
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`yarn install`)
- [ ] Archivo `.env` creado y configurado
- [ ] EmailJS configurado (si se usa)
- [ ] Backend API corriendo
- [ ] `yarn dev` ejecuta sin errores
- [ ] Login funciona correctamente
- [ ] `yarn build` crea dist/ correctamente
- [ ] No hay errores en la consola del navegador

---

## Próximos Pasos

Después de completar la instalación:

1. Leer [DOCUMENTATION.md](../DOCUMENTATION.md) para entender el sistema
2. Revisar [API_REFERENCE.md](./API_REFERENCE.md) para conocer los endpoints
3. Configurar el backend si aún no está listo
4. Crear usuario de prueba en el sistema
5. Explorar los diferentes módulos

---

**Última actualización**: Octubre 2025  
**Autor**: Equipo de Desarrollo  
