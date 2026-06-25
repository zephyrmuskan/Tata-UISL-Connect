# Tata UISL Customer Connection Portal

An enterprise-grade, full-stack Utility Connection Portal built for **Tata UISL** (Jamshedpur Utilities and Services Company - JUSCO). This application streamlines utility registration requests (electricity, water, waste management) for customers and provides verification and approval dashboards for back-office administrators.

---

## 🚀 Technology Stack

### 💻 Frontend
- **React.js 19** (TypeScript, Vite)
- **Tailwind CSS v3** (Custom JUSCO corporate theme styling)
- **Framer Motion** (Smooth fluid slide & scale animations)
- **Lucide React** (Consistent icon library)
- **React Hook Form** (Robust client-side form validations)
- **React Toastify** (Dynamic action feedback alerts)

### ⚙️ C# Production Backend
- **ASP.NET Core 8.0 Web API**
- **Clean Architecture Principles** (Split into API, Infrastructure, and Core Core layers)
- **Entity Framework Core 8** (Code-first database mappings)
- **JWT Bearer Cryptography** (Secure stateless authentication)
- **AutoMapper & Fluent Validation** (Data transfer mapping and requests validation)

### 🐍 Python Test Backend
- **Flask & Flask-CORS** (Serves as a mock server matching the C# API schema for seamless frontend testing in lightweight/non-.NET SDK environments)

### 🗄️ Relational Database
- **Microsoft SQL Server** (Relational tables, seeding values, and cascaded indexes)

---

## 🎨 Design & Layout Enhancements
- **Corporate Branding**: Configured official TATA logos and emblem graphics processed with alpha transparency, allowing elements to blend cleanly on dark, light, or blue brand panels.
- **Collapsible Sidebar**: A smooth side-nav collapsing from `256px` to `64px` on desktop, hiding labels and displaying hover tooltips. It converts to a mobile overlay drawer with responsive touch backdrops on tablet/phone screens. Toggled using the header hamburger menu (`☰`), with state persistence stored across browser sessions.
- **Top Header Navbar**: Includes a mock search bar, theme toggler, notification alerts bell, and a profile avatar context dropdown (Profile, Change Password, and Logout links).
- **Modals & Slide-Overs**:
  - **Notifications Slide Drawer**: Toggles a right-hand notifications list panel.
  - **Helpline support Modal**: Displays JUSCO helpline numbers, email addresses, and interactive troubleshooting FAQs.
  - **Change Password Overlay**: Handles password update forms with inputs matching rule validations.

---

## 📂 Directory Layout

```
Tata/
├── backend/
│   ├── TataUisl.Core/            # Core Domain entities, interfaces, and DTOs
│   ├── TataUisl.Infrastructure/  # EF Core DbContext, repository, and services implementations
│   ├── TataUisl.Api/             # ASP.NET Core controllers and configurations
│   ├── TataUisl.sln              # Visual Studio Solution wrapper
│   ├── app.py                    # Python Flask Mock API Server
│   └── schema.sql                # SQL Server Database schema definitions
└── frontend/
    ├── public/                   # Processed transparent TATA logo assets & favicon
    ├── src/
    │   ├── components/           # Shell Layout.tsx and TataLogo.tsx
    │   ├── pages/                # Portals pages (Landing, Login, Register, Profile, Dashboards, Audits)
    │   └── services/             # Axios API client interface and LocalStorage mock fallback
    ├── package.json              # Client dependencies config
    └── tailwind.config.js        # Theme styling configuration
```

---

## ⚙️ Local Setup Instructions

### 1. Database Configuration (SQL Server)
Open **SQL Server Management Studio (SSMS)** or Azure Data Studio, connect to your database instance, and execute the raw script:
```bash
backend/schema.sql
```
This initializes the relational tables and seeds default test roles, connection settings, and an administrator account (`admin@tatauisl.com` / password: `Admin@123`).

### 2. Running the API Services
You can run either the production C# backend or the Python mock API server (both run on port `5000`):

#### Option A: Running Python Mock API
If your local terminal environment lacks the .NET Core SDK, run the Python mock server:
```powershell
cd backend
pip install flask flask-cors
python app.py
```

#### Option B: Compiling the ASP.NET Core API
Ensure you have the **.NET 8 SDK** installed, then execute:
```powershell
cd backend
dotnet restore
dotnet build
dotnet run --project TataUisl.Api
```

### 3. Launching the Frontend Client
Open a separate terminal window and execute:
```powershell
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

## 🔐 Credentials & Roles testing

### Customer Role
1. Click **Register** on the landing page, enter details, and verify using OTP `123456`.
2. Login to fill connection applications, upload mock documents (up to 10MB), and print connection receipts.

### Administrator Role
1. Go to the login screen and toggle the **Officer Access** switch.
2. Sign in with the pre-filled seed credentials:
   - **Email**: `admin@tatauisl.com`
   - **Password**: `Admin@123`
3. View analytics charts, assign inspecting officers to applications, approve/reject individual documents with reason remarks, and inspect audit logs.
