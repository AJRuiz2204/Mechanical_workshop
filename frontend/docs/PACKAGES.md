# 📦 Gestión de Paquetes y Dependencias

## Índice
- [Resumen de Dependencias](#resumen-de-dependencias)
- [Dependencias de Producción](#dependencias-de-producción)
- [Dependencias de Desarrollo](#dependencias-de-desarrollo)
- [Gestión con Yarn](#gestión-con-yarn)
- [Actualización de Paquetes](#actualización-de-paquetes)
- [Resolución de Conflictos](#resolución-de-conflictos)

---

## Resumen de Dependencias

### Estadísticas Generales

```
Total de Dependencias: 24
├── Producción: 13
└── Desarrollo: 11

Tamaño aproximado: ~300 MB (node_modules)
Tiempo de instalación: ~2-5 minutos
```

### Gestor de Paquetes: Yarn 4.3.1

**¿Por qué Yarn?**
- Instalaciones más rápidas que npm
- Resolución de dependencias más confiable
- Lockfile más estable (`yarn.lock`)
- Mejor manejo de monorepos
- Workspaces nativos

---

## Dependencias de Producción

### Core React (3 paquetes)

#### 1. react ^18.3.1
- **Descripción**: Librería principal de React
- **Propósito**: Construcción de interfaces de usuario con componentes
- **Tamaño**: ~300 KB
- **Licencia**: MIT

```javascript
import React, { useState, useEffect } from 'react';
```

#### 2. react-dom ^18.3.1
- **Descripción**: Renderizador de React para el DOM
- **Propósito**: Montaje y actualización de componentes en el navegador
- **Tamaño**: ~130 KB

```javascript
import ReactDOM from 'react-dom/client';
```

#### 3. react-router-dom ^7.1.1
- **Descripción**: Enrutamiento para aplicaciones React
- **Propósito**: Navegación entre páginas sin recargar
- **Características**:
  - Rutas protegidas
  - Navegación programática
  - Parámetros de URL
  - Layouts anidados

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
```

**Uso en el Proyecto**:
```javascript
<Routes>
  <Route path="/" element={<Login />} />
  <Route path="/home" element={
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  } />
</Routes>
```

---

### UI/UX Libraries (3 paquetes)

#### 4. antd ^5.24.9
- **Descripción**: Librería de componentes UI empresariales
- **Propósito**: Componentes pre-diseñados de alta calidad
- **Tamaño**: ~1.2 MB (tree-shakeable)
- **Componentes Usados**:
  - Table (tablas de datos)
  - Modal (diálogos)
  - Form (formularios)
  - Select, DatePicker (inputs)
  - Button, Dropdown (controles)
  - Notification, Message (alertas)

```javascript
import { Table, Modal, Form, Button } from 'antd';
```

#### 5. react-bootstrap ^2.10.6
- **Descripción**: Bootstrap components para React
- **Propósito**: Sistema de grid y componentes responsivos
- **Tamaño**: ~400 KB

```javascript
import { Container, Row, Col, Card } from 'react-bootstrap';
```

#### 6. bootstrap ^5.3.3
- **Descripción**: Framework CSS
- **Propósito**: Estilos base y utilidades CSS
- **Tamaño**: ~200 KB (CSS + JS)

```javascript
import 'bootstrap/dist/css/bootstrap.min.css';
```

---

### HTTP & API (1 paquete)

#### 7. axios ^1.7.9
- **Descripción**: Cliente HTTP basado en promesas
- **Propósito**: Comunicación con el backend API
- **Ventajas**:
  - Interceptores de request/response
  - Transformación automática de JSON
  - Timeout configurable
  - Cancelación de requests
  - Protección CSRF

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5121/api',
});

// Interceptor para agregar token
api.interceptors.request.use(config => {
  const token = getToken();
  if(token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Alternativas NO usadas**:
- fetch (nativo): Requiere más boilerplate
- superagent: Menos popular
- ky: Más moderno pero menos adoptado

---

### Generación de Documentos (3 paquetes)

#### 8. @react-pdf/renderer ^4.1.6
- **Descripción**: Creación de PDFs con sintaxis React
- **Propósito**: Generar cotizaciones, recibos y reportes en PDF
- **Tamaño**: ~500 KB
- **Características**:
  - Componentes tipo React
  - Styling con CSS-in-JS
  - Soporte para imágenes
  - Tablas y layouts complejos

```javascript
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const EstimatePDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>Cotización #{data.estimateNumber}</Text>
      </View>
      <View style={styles.table}>
        {data.items.map(item => (
          <View key={item.id} style={styles.row}>
            <Text>{item.description}</Text>
            <Text>${item.total}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
```

#### 9. exceljs ^4.4.0
- **Descripción**: Lectura, manipulación y escritura de archivos Excel
- **Propósito**: Exportar listas de vehículos y reportes a Excel
- **Formatos**: .xlsx, .xls
- **Características**:
  - Estilos de celdas
  - Fórmulas
  - Múltiples hojas
  - Gráficos

```javascript
import ExcelJS from 'exceljs';

const generateExcel = async (vehicles) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Vehículos');
  
  worksheet.columns = [
    { header: 'VIN', key: 'vin', width: 20 },
    { header: 'Marca', key: 'make', width: 15 },
    { header: 'Modelo', key: 'model', width: 15 },
  ];
  
  vehicles.forEach(vehicle => {
    worksheet.addRow(vehicle);
  });
  
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};
```

#### 10. file-saver ^2.0.5
- **Descripción**: Guardar archivos en el navegador
- **Propósito**: Descargar PDFs y Excel generados
- **Compatibilidad**: Todos los navegadores modernos

```javascript
import { saveAs } from 'file-saver';

saveAs(blob, 'cotizacion.pdf');
```

---

### Utilidades (3 paquetes)

#### 11. dayjs ^1.11.13
- **Descripción**: Librería ligera para manejo de fechas
- **Propósito**: Formateo y manipulación de fechas
- **Tamaño**: ~2 KB (vs. ~230 KB de Moment.js)
- **Por qué Day.js vs Moment.js**: Más ligero y moderno

```javascript
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');
const formatted = dayjs().format('DD/MM/YYYY HH:mm');
const isAfter = dayjs(date1).isAfter(date2);
```

#### 12. react-toastify ^9.1.1
- **Descripción**: Notificaciones toast para React
- **Propósito**: Mostrar mensajes de éxito, error, info
- **Características**:
  - Personalizable
  - Animaciones suaves
  - Queue de notificaciones
  - Posicionamiento flexible

```javascript
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// En el componente raíz
<ToastContainer 
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
/>

// En cualquier componente
toast.success('Operación exitosa');
toast.error('Error al guardar');
toast.info('Información importante');
toast.warning('Advertencia');
```

#### 13. emailjs-com ^3.2.0
- **Descripción**: Servicio de envío de emails desde el frontend
- **Propósito**: Recuperación de contraseña vía email
- **Limitaciones**: 300 emails/mes (plan gratuito)

```javascript
import emailjs from 'emailjs-com';

const sendEmail = async (toEmail, code) => {
  await emailjs.send(
    'service_id',
    'template_id',
    { to_email: toEmail, verification_code: code },
    'public_key'
  );
};
```

---

## Dependencias de Desarrollo

### Herramientas de Build (2 paquetes)

#### 1. vite ^6.0.1
- **Descripción**: Build tool y dev server de próxima generación
- **Propósito**: Desarrollo rápido y builds optimizados
- **Ventajas**:
  - Hot Module Replacement (HMR) instantáneo
  - Builds 10-100x más rápidos que Webpack
  - Soporte nativo de ESM
  - Optimización automática
- **Configuración**: `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

#### 2. @vitejs/plugin-react ^4.3.4
- **Descripción**: Plugin de Vite para React
- **Propósito**: Fast Refresh, JSX transform
- **Características**:
  - Babel integration
  - Fast Refresh automático
  - JSX/TSX support

---

### ESLint Ecosystem (6 paquetes)

#### 3. eslint ^9.15.0
- **Descripción**: Linter para JavaScript/JSX
- **Propósito**: Detectar errores y enforcar estilo de código
- **Reglas**: Sintaxis, mejores prácticas, bugs potenciales

#### 4. @eslint/js ^9.15.0
- **Descripción**: Configuración base de ESLint
- **Propósito**: Reglas recomendadas de JavaScript

#### 5. eslint-plugin-react ^7.37.2
- **Descripción**: Reglas ESLint específicas para React
- **Propósito**: Detectar antipatrones en React

#### 6. eslint-plugin-react-hooks ^5.0.0
- **Descripción**: Reglas para React Hooks
- **Propósito**: Validar reglas de hooks

#### 7. eslint-plugin-react-refresh ^0.4.14
- **Descripción**: Validar compatibilidad con Fast Refresh
- **Propósito**: Asegurar que componentes soporten HMR

#### 8. globals ^15.12.0
- **Descripción**: Variables globales para ESLint
- **Propósito**: Definir variables del navegador, Node.js, etc.

**Configuración ESLint** (`eslint.config.js`):
```javascript
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: { react },
    rules: {
      'react/prop-types': 'warn',
      'no-unused-vars': 'warn',
    },
  },
]
```

---

### TypeScript (2 paquetes)

#### 9. @types/react ^18.3.12
- **Descripción**: Tipos TypeScript para React
- **Propósito**: IntelliSense y type checking en componentes TS

#### 10. @types/react-dom ^18.3.1
- **Descripción**: Tipos TypeScript para React DOM
- **Propósito**: Type checking para react-dom

**Nota**: El proyecto es principalmente JavaScript, pero algunos componentes usan TypeScript (ProtectedRoute, ErrorBoundary).

---

## Gestión con Yarn

### Comandos Básicos

```powershell
# Instalar todas las dependencias
yarn install

# Agregar dependencia de producción
yarn add nombre-paquete

# Agregar dependencia de desarrollo
yarn add -D nombre-paquete

# Remover dependencia
yarn remove nombre-paquete

# Actualizar dependencia específica
yarn upgrade nombre-paquete

# Actualizar todas las dependencias
yarn upgrade

# Ver dependencias desactualizadas
yarn outdated
```

### Yarn.lock

**¿Qué es?**
- Archivo que bloquea las versiones exactas de todas las dependencias
- Asegura instalaciones consistentes entre diferentes máquinas
- **NO** debe modificarse manualmente
- **SÍ** debe estar en control de versiones (Git)

```yaml
# Ejemplo de entrada en yarn.lock
"axios@^1.7.9":
  version "1.7.9"
  resolved "https://registry.yarnpkg.com/axios/-/axios-1.7.9.tgz"
  integrity sha512-xxx...xxx
  dependencies:
    follow-redirects "^1.15.6"
    form-data "^4.0.0"
    proxy-from-env "^1.1.0"
```

### Scripts de Package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

**Uso**:
```powershell
yarn dev      # Ejecuta "vite"
yarn build    # Ejecuta "vite build"
yarn lint     # Ejecuta "eslint ."
```

---

## Actualización de Paquetes

### Estrategia de Actualización

#### 1. Actualizaciones de Seguridad (ALTA PRIORIDAD)

```powershell
# Ver vulnerabilidades
yarn audit

# Corregir automáticamente
yarn audit fix
```

#### 2. Actualizaciones de Parches (x.y.Z)

**Cuándo**: Cada 2-4 semanas  
**Riesgo**: Bajo  
**Cambios**: Bug fixes

```powershell
# Actualizar parches
yarn upgrade --patch
```

#### 3. Actualizaciones Menores (x.Y.z)

**Cuándo**: Cada 2-3 meses  
**Riesgo**: Medio  
**Cambios**: Nuevas features, depreciaciones

```powershell
# Actualizar menores
yarn upgrade --minor
```

#### 4. Actualizaciones Mayores (X.y.z)

**Cuándo**: Cada 6-12 meses  
**Riesgo**: Alto  
**Cambios**: Breaking changes

```powershell
# Actualizar una por una
yarn upgrade react@latest react-dom@latest
yarn upgrade axios@latest

# Probar exhaustivamente después de cada actualización
yarn build
yarn lint
```

### Proceso de Actualización Segura

```powershell
# 1. Crear branch
git checkout -b update-dependencies

# 2. Ver qué está desactualizado
yarn outdated

# 3. Actualizar dependencias
yarn upgrade

# 4. Probar la aplicación
yarn dev
# Probar manualmente todas las funcionalidades

# 5. Build de producción
yarn build

# 6. Correr linter
yarn lint

# 7. Si todo funciona, commit
git add package.json yarn.lock
git commit -m "chore: update dependencies"

# 8. Merge a main
git checkout main
git merge update-dependencies
```

---

## Resolución de Conflictos

### Problema 1: Dependencias con Versiones Conflictivas

**Síntoma**:
```
warning "antd > rc-menu@9.x.x" has incorrect peer dependency "react@>=16.9.0"
```

**Solución**:
```powershell
# Ver árbol de dependencias
yarn why antd

# Forzar resolución específica en package.json
{
  "resolutions": {
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}
```

### Problema 2: Caché Corrupta

**Síntoma**:
```
error An unexpected error occurred: "EINTEGRITY"
```

**Solución**:
```powershell
# Limpiar caché
yarn cache clean

# Eliminar node_modules y lockfile
rm -r node_modules
rm yarn.lock

# Reinstalar
yarn install
```

### Problema 3: Dependencias Duplicadas

**Síntoma**:
- Tamaño del bundle muy grande
- Dos versiones de la misma librería

**Solución**:
```powershell
# Ver duplicados
yarn dedupe

# Forzar deduplicación
yarn install --force
```

---

## Optimización del Bundle

### Análisis del Tamaño

```powershell
# Instalar plugin de análisis
yarn add -D rollup-plugin-visualizer

# Agregar a vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ],
});

# Build y ver análisis
yarn build
# Se abrirá stats.html con visualización
```

### Code Splitting Manual

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['antd', 'react-bootstrap'],
          'vendor-pdf': ['@react-pdf/renderer'],
          'vendor-excel': ['exceljs'],
        },
      },
    },
  },
});
```

### Tree Shaking

```javascript
// ✅ Correcto - permite tree shaking
import { Button, Modal } from 'antd';

// ❌ Incorrecto - importa toda la librería
import antd from 'antd';
```

---

## Gestión de Versiones

### Semantic Versioning (SemVer)

```
MAJOR.MINOR.PATCH
  5  . 24  . 9

MAJOR: Breaking changes (incompatible)
MINOR: Nuevas features (compatible)
PATCH: Bug fixes (compatible)
```

### Símbolos de Versión en package.json

```json
{
  "dependencies": {
    "axios": "^1.7.9",      // Permite 1.x.x (no 2.0.0)
    "react": "~18.3.1",     // Permite 18.3.x (no 18.4.0)
    "antd": "5.24.9"        // Versión exacta
  }
}
```

- `^` (caret): Actualizaciones menores y parches
- `~` (tilde): Solo parches
- Sin símbolo: Versión exacta

---

## Mejores Prácticas

### 1. Mantener Lockfile en Git

```powershell
# ✅ Hacer
git add yarn.lock
git commit -m "chore: update dependencies"

# ❌ NO hacer
echo "yarn.lock" >> .gitignore
```

### 2. Revisar Licencias

```powershell
# Instalar checker
yarn add -D license-checker

# Verificar licencias
yarn license-checker --summary
```

### 3. Mantener Dependencias Actualizadas

- Revisar actualizaciones semanalmente
- Leer changelogs antes de actualizar
- Probar exhaustivamente después de actualizar
- No actualizar todo de golpe

### 4. Minimizar Dependencias

- Evaluar si realmente necesitas una librería
- Preferir utilidades nativas cuando sea posible
- Considerar el tamaño del bundle

```javascript
// ❌ Instalar lodash completo (70 KB)
import _ from 'lodash';

// ✅ Importar función específica (1 KB)
import debounce from 'lodash/debounce';

// ✅✅ Implementar tu propia utilidad simple
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
```

---

## Checklist de Mantenimiento

- [ ] Actualizar dependencias mensualmente
- [ ] Revisar vulnerabilidades semanalmente (`yarn audit`)
- [ ] Limpiar dependencias no usadas
- [ ] Mantener `yarn.lock` en control de versiones
- [ ] Documentar cambios en CHANGELOG.md
- [ ] Probar aplicación después de actualizar
- [ ] Revisar tamaño del bundle regularmente
- [ ] Mantener Node.js actualizado

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0  
