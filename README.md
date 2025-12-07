# MedTracker - Medicine Inventory Management System

A full-stack web application built with .NET 8 Minimal API and React, featuring Azure AD authentication, CRUD operations for medicine management, and a responsive UI.

## 🚀 Features

### ✅ Implemented Requirements

1. **Single Sign-On (SSO) Authentication**
   - Azure AD integration supporting both personal and work/school Microsoft accounts
   - OAuth 2.0 / OpenID Connect flow
   - JWT token validation
   - User information stored in database (name, email, provider, login history)

2. **Database Management**
   - MS SQL Server with Entity Framework Core
   - Medicines table with comprehensive fields (ID, Name, Company, Price, Expiry Date, Stock, Created Date)
   - Users table (AppUsers) and LoginHistory tracking
   - Database migrations included

3. **Post-Login Dashboard**
   - User profile display with name, email, and provider information
   - Navigation menu (Dashboard, Medicines List, Add Medicine, About)
   - Secure logout functionality

4. **Medicine List Screen**
   - Paginated listing with server-side pagination
   - Sortable columns (Name, Company, Price, Expiry Date, Stock)
   - Search/filter functionality
   - Edit and Delete actions for each medicine
   - Responsive table design

5. **CRUD Operations**
   - Create new medicine entries with validation
   - Edit existing medicines
   - Delete medicines with confirmation
   - Real-time data persistence and UI updates

6. **Modern Frontend**
   - React 18 with Vite
   - Tailwind CSS for responsive design
   - React Router for navigation
   - Protected routes with authentication
   - Axios for API communication

7. **Additional Features**
   - Global error handling middleware
   - CORS configuration for development
   - Secure API endpoints with [Authorize] attribute
   - Search and filter on multiple fields
   - Clean, professional UI/UX

## 🛠️ Tech Stack

### Backend
- **.NET 8** - Minimal API
- **Entity Framework Core 8** - ORM
- **MS SQL Server** - Database (Docker)
- **Microsoft.AspNetCore.Authentication.JwtBearer** - JWT validation
- **Swashbuckle** - API documentation

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **@azure/msal-browser** - Microsoft Authentication Library
- **Tailwind CSS** - Utility-first CSS framework

## 📋 Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) and npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for SQL Server)
- Azure AD account (personal Microsoft account or work/school account)

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd MediaTrackerProject
```

### 2. Azure AD Configuration

#### Step 1: Register Backend API Application

1. Go to [Azure Portal](https://portal.azure.com) → **Azure Active Directory** → **App registrations**
2. Click **"New registration"**
   - Name: `MedTracker-API`
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: Leave blank
3. Click **Register**
4. Copy the **Application (client) ID** (e.g., `dc676787ee-xxxxxxxxxxxxxxxx`)

#### Step 2: Expose API Scope

1. In **MedTracker-API** app, go to **Expose an API**
2. Click **"Add a scope"**
   - Application ID URI: Click "Set" and accept default
3. Create scope:
   - Scope name: `access_as_user`
   - Who can consent: **Admins and users**
   - Display names and descriptions: `Access MedTracker API`
   - State: **Enabled**
4. Copy the full scope (e.g., `api://dc676787ee-xxxxxxxxxxxxxxxx/access_as_user`)

#### Step 3: Register Frontend Application

1. Create another **App registration**
   - Name: `MedTracker-SPA`
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: Platform: **Single-page application (SPA)**, URI: `http://localhost:5173`
2. Copy the **Application (client) ID** (e.g., `dc676787ee-xxxxxxxxxxxxxxxx`)

#### Step 4: Configure API Permissions

1. In **MedTracker-SPA** app, go to **API permissions**
2. Click **"Add a permission"** → **My APIs** → Select **MedTracker-API**
3. Check `access_as_user` scope
4. Click **Add permissions**

### 3. Database Setup

```bash
# Start SQL Server using Docker
cd MedTrackerAPI
docker-compose up -d

# Verify SQL Server is running
docker ps
```

### 4. Backend Configuration

1. Update `MedTrackerAPI/MedTracker.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=MedTrackerDb;User Id=sa;Password=YourStrong@Pass123;Encrypt=False;TrustServerCertificate=True"
  },
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "TenantId": "common",
    "ClientId": "YOUR_BACKEND_CLIENT_ID"
  },
  "AllowedHosts": "*"
}
```

2. Run database migrations:

```bash
cd MedTrackerAPI/MedTracker.API
dotnet ef database update
```

3. Start the backend:

```bash
dotnet run
# Backend will run on http://localhost:5037
```

### 5. Frontend Configuration

1. Update `MediaTrackerUI/medtracker-frontend/src/authConfig.js`:

```javascript
export const msalConfig = {
  auth: {
    clientId: "YOUR_FRONTEND_CLIENT_ID",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "http://localhost:5173",
  },
};

export const apiConfig = {
  apiBaseUrl: "http://localhost:5037",
  apiScope: "api://YOUR_BACKEND_CLIENT_ID/access_as_user"
};

export const loginRequest = {
  scopes: [
    "openid", 
    "profile", 
    "email"
  ]
};

export const apiRequest = {
  scopes: ["api://YOUR_BACKEND_CLIENT_ID/access_as_user"]
};
```

2. Install dependencies and start the frontend:

```bash
cd MediaTrackerUI/medtracker-frontend
npm install
npm run dev
# Frontend will run on http://localhost:5173
```

## 🎮 Running the Application

1. **Start SQL Server**: `docker start sqledge` (if not already running)
2. **Start Backend**: `cd MedTrackerAPI/MedTracker.API && dotnet run`
3. **Start Frontend**: `cd MediaTrackerUI/medtracker-frontend && npm run dev`
4. **Open Browser**: Navigate to `http://localhost:5173`
5. **Login**: Click "Login" and sign in with your Microsoft account (personal or work)

## 📱 Application Screenshots & Features

### Authentication Flow
- **Login Page**: Clean interface with Microsoft SSO
- **Supports**: Personal accounts (@outlook.com, @hotmail.com) and Work/School accounts
- **Token Type**: Uses ID tokens for personal accounts, Access tokens for work accounts with API scope

### Dashboard
- User profile information display
- Recent login timestamp
- Quick navigation to all features

### Medicine Management
- **List View**: Paginated table with sorting
- **Search**: Filter by name, company, or stock level
- **Add New**: Form with validation
- **Edit**: Pre-filled form for updates
- **Delete**: Confirmation before removal

## 🔒 Security Features

- JWT Bearer token authentication
- Token validation with Azure AD v2.0 endpoints
- Protected API endpoints with `[Authorize]` attribute
- CORS policy for development environment
- Secure password handling (database uses SA account in Docker)
- Error handling middleware for sensitive data protection

## 📊 Database Schema

### AppUsers Table
```sql
- Id (PK, int)
- SubjectId (string) - User's unique identifier from Azure AD
- DisplayName (string)
- Email (string)
- Provider (string) - "Microsoft Personal" or tenant info
- CreatedOn (datetime)
- LastLoginOn (datetime)
```

### Medicines Table
```sql
- MedicineId (PK, int)
- Name (string)
- Company (string)
- Price (decimal)
- ExpiryDate (datetime)
- Stock (int)
- CreatedOn (datetime)
- AppUserId (FK, int) - References AppUsers
```

### LoginHistory Table
```sql
- Id (PK, int)
- AppUserId (FK, int)
- LoggedInAt (datetime)
- IpAddress (string)
- UserAgent (string)
```

## 🧪 API Endpoints

### Authentication
- `GET /api/auth/me` - Get current authenticated user

### Medicines
- `GET /api/medicines?page=1&pageSize=10&sortBy=name&sortOrder=asc&search=aspirin` - Get paginated medicines
- `GET /api/medicines/{id}` - Get medicine by ID
- `POST /api/medicines` - Create new medicine
- `PUT /api/medicines/{id}` - Update medicine
- `DELETE /api/medicines/{id}` - Delete medicine

## 🐛 Troubleshooting

### Common Issues

1. **401 Unauthorized Error**
   - Ensure Azure AD app registrations are configured correctly
   - Verify client IDs match in configuration files
   - Check that API permissions are granted in Azure Portal

2. **Database Connection Failed**
   - Ensure Docker is running and SQL Server container is started
   - Verify connection string in `appsettings.json`
   - Check that migrations have been applied

3. **CORS Errors**
   - Verify frontend URL is in CORS policy (Program.cs)
   - Ensure both frontend and backend are running

4. **Port Already in Use**
   - Frontend: Vite will automatically use next available port (5174, 5175, etc.)
   - Backend: Change port in `launchSettings.json`

## 🔧 AI Tools & Resources Used

- **GitHub Copilot** - Code completion and suggestions
- **ChatGPT** - Architecture decisions and debugging assistance
- **Microsoft Learn** - Azure AD and .NET 8 documentation
- **Stack Overflow** - Community solutions for specific issues
- **Tailwind CSS Documentation** - UI styling reference

## 📝 Project Structure

```
MediaTrackerProject/
├── MedTrackerAPI/
│   ├── MedTracker.API/
│   │   ├── Data/
│   │   │   └── AppDbContext.cs
│   │   ├── Models/
│   │   │   ├── AppUser.cs
│   │   │   ├── Medicine.cs
│   │   │   └── LoginHistory.cs
│   │   ├── Dtos/
│   │   │   ├── MedicineDtos.cs
│   │   │   ├── PagedResult.cs
│   │   │   └── UserDto.cs
│   │   ├── Middleware/
│   │   │   └── ErrorHandlingMiddleware.cs
│   │   ├── Migrations/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   ├── compose.yaml
│   └── MedTracker.sln
└── MediaTrackerUI/
    └── medtracker-frontend/
        ├── src/
        │   ├── api/
        │   │   └── axios.js
        │   ├── components/
        │   │   ├── Layout.jsx
        │   │   └── ProtectedRoute.jsx
        │   ├── pages/
        │   │   ├── Login.jsx
        │   │   ├── Dashboard.jsx
        │   │   ├── MedicinesList.jsx
        │   │   ├── MedicineForm.jsx
        │   │   └── About.jsx
        │   ├── authConfig.js
        │   ├── msalInstance.js
        │   ├── App.jsx
        │   └── main.jsx
        ├── package.json
        └── vite.config.js
```

## 🚀 Future Enhancements

- [ ] Deploy to Azure App Service / Vercel
- [ ] Add email notifications for low stock
- [ ] Implement role-based access control (Admin/User)

## 👤 Author

Kartik Khanna
- Email: kartikkhanna2000@gmail.com

## 🙏 Acknowledgments

- Microsoft Azure AD team for comprehensive documentation
- .NET community for excellent resources
- React and Vite teams for modern development tools
