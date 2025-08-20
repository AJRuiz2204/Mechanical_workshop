# Mechanical Workshop Application

Always reference these instructions first and only fallback to search or bash commands when you encounter unexpected information that does not match the information provided here.

## Project Structure

This is a full-stack web application for a mechanical workshop management system with:
- **Backend**: .NET Core 8 Web API with Entity Framework Core and MySQL
- **Frontend**: React application with Vite build tool
- **Database**: MySQL with Entity Framework Core migrations

## Working Effectively

### Initial Setup and Dependencies
1. **Install Required Tools**:
   - .NET 8 SDK: `dotnet --version` should show 8.0.x
   - Node.js (tested with v20.19.4): `node --version` 
   - npm (tested with 10.8.2): `npm --version`
   - Install EF Core tools globally: `dotnet tool install --global dotnet-ef`

2. **Backend Setup** (Path: `/Mechanical_workshop/`):
   ```bash
   cd Mechanical_workshop
   dotnet restore    # Takes ~1-25 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
   dotnet build      # Takes ~8-15 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
   ```

3. **Frontend Setup** (Path: `/frontend/`):
   ```bash
   cd frontend
   npm install       # Takes ~7-40 seconds. NEVER CANCEL. Set timeout to 90+ seconds.
   npm run build     # Takes ~19-25 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
   ```

### Building and Running

#### Backend (.NET API)
- **Build**: `cd Mechanical_workshop && dotnet build`
  - NEVER CANCEL: Build takes 8-15 seconds. Set timeout to 60+ seconds.
  - Expect 21 warnings about nullable reference types (these are safe to ignore)
- **Run**: `cd Mechanical_workshop && dotnet run`
  - API runs on `http://localhost:5000` by default
  - Swagger UI available at `http://localhost:5000/swagger/index.html`
  - **Database Required**: MySQL connection required for full functionality
  - Default connection: `Server=localhost;Database=JBenz;User=root;Password=12345678;`
  - **Without DB**: API starts successfully but endpoints return 500 errors

#### Frontend (React + Vite)
- **Build**: `cd frontend && npm run build` 
  - NEVER CANCEL: Build takes 19-25 seconds. Set timeout to 60+ seconds.
  - Creates optimized production build in `/frontend/dist/`
- **Development**: `cd frontend && npm run dev`
  - Runs on `http://localhost:5173` by default  
  - Hot reload enabled for development
- **Lint**: `cd frontend && npm run lint`
  - Uses ESLint configuration, runs clean with no issues

### Database Setup

**IMPORTANT**: Database connection is required for the backend to work properly.

1. **MySQL Setup** (if not available):
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install -y mysql-server
   sudo mysql_secure_installation
   ```

2. **Create Database**:
   ```sql
   mysql -u root -p
   CREATE DATABASE JBenz;
   CREATE USER 'root'@'localhost' IDENTIFIED BY '12345678';
   GRANT ALL PRIVILEGES ON JBenz.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. **Run Migrations**:
   ```bash
   cd Mechanical_workshop
   dotnet ef database update
   ```
   - **Note**: May fail without MySQL connection, but this is expected during setup

## Validation Scenarios

After making changes, ALWAYS validate with these scenarios:

### Backend Validation
1. **Build and Start**: `cd Mechanical_workshop && dotnet build && dotnet run`
2. **Check Swagger**: Navigate to `http://localhost:5000/swagger/index.html` (should load successfully)
3. **Test API Response**: `curl http://localhost:5000/api/Users/login -X POST` (expect 500 without DB)
4. **Key Endpoints Available**: `/api/Users/login`, `/api/Users/register`, `/api/Users/profile`
5. **Database Connection**: If MySQL is available, test actual user registration/login flows

### Frontend Validation  
1. **Build Successfully**: `cd frontend && npm run build` (must complete without errors)
2. **Start Dev Server**: `cd frontend && npm run dev` (starts on port 5173)
3. **Access Application**: Navigate to `http://localhost:5173`
4. **Test UI Components**: 
   - Login page loads with JBenz branding and logo
   - Shows "WELCOME!" heading with username/password fields
   - Login button is present and clickable
   - Version number (v1.4.9) displays in footer
5. **Test Build Output**: Check `frontend/dist/` contains built assets

### Integration Testing
1. **Start Both Applications**: 
   - Terminal 1: `cd Mechanical_workshop && dotnet run` 
   - Terminal 2: `cd frontend && npm run dev`
2. **Verify Services**: Backend on :5000, Frontend on :5173, Swagger on :5000/swagger
3. **Test CORS**: Frontend should be able to communicate with backend API
4. **Authentication Flow**: Test login/registration (requires database connection)
5. **Workshop Features**: Access vehicle estimates, diagnostics (main application features)

## Development Workflow

### Before Making Changes
- Always run `cd Mechanical_workshop && dotnet build` to ensure backend builds
- Always run `cd frontend && npm run lint` to check code quality
- Always run `cd frontend && npm run build` to ensure frontend builds

### After Making Changes
- **Backend Changes**: 
  1. `dotnet build` (must succeed)
  2. Start application and verify Swagger loads
  3. Test affected API endpoints if possible
- **Frontend Changes**:
  1. `npm run lint` (must pass with no errors)  
  2. `npm run build` (must succeed)
  3. `npm run dev` and test UI changes manually

## Key Project Areas

### Backend (`/Mechanical_workshop/`)
- **Controllers/**: API endpoints for Users, Estimates, Diagnostics, Vehicles
- **Models/**: Entity models for database
- **DTOs/**: Data transfer objects for API contracts  
- **Profiles/**: AutoMapper configuration for object mapping
- **Data/**: Entity Framework DbContext configuration
- **Program.cs**: Application startup and middleware configuration

### Frontend (`/frontend/`)
- **src/components/**: React components organized by feature
- **src/components/Home/**: Main application features (Estimates, Reports, etc.)
- **src/components/Auth/**: Authentication components (Login, Register)
- **package.json**: Uses Vite for build tooling, not Create React App
- **vite.config.js**: Vite configuration

## Important Notes

- **Path Correction**: The README shows `cd backend` but the actual path is `cd Mechanical_workshop`
- **Build Tool**: Frontend uses Vite, not Create React App (`npm run dev`, not `npm start`)
- **Package Manager**: Both npm and yarn work, but npm is used in validation
- **Database**: MySQL connection in `appsettings.json` must be configured for full functionality
- **CORS**: Backend allows `http://localhost:5173` and `https://app2.j-benz.com`
- **No Tests**: No existing test projects found in the codebase
- **Warnings**: 21 nullable reference warnings in backend are expected and safe to ignore

## Common Commands Reference

```bash
# Backend (from /Mechanical_workshop/)
dotnet restore              # ~1-25 seconds
dotnet build               # ~8-15 seconds  
dotnet run                 # Starts on :5000
dotnet ef database update  # Run migrations (requires MySQL)

# Frontend (from /frontend/)
npm install                # ~7-40 seconds
npm run build             # ~19-25 seconds
npm run dev               # Starts on :5173
npm run lint              # Check code quality
npm run preview           # Preview production build

# Full Stack Development
# Terminal 1: cd Mechanical_workshop && dotnet run
# Terminal 2: cd frontend && npm run dev
# Access: Frontend at :5173, API at :5000, Swagger at :5000/swagger
```

## Troubleshooting

- **Backend won't start**: Check MySQL connection in `appsettings.json`
- **Frontend build fails**: Run `npm install` first
- **EF migrations fail**: Ensure MySQL is running and database exists
- **CORS errors**: Verify backend allows frontend origin (localhost:5173)
- **API 500 errors**: Usually database connection issues

NEVER CANCEL long-running commands. All build and install operations complete within 60 seconds.