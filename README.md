# Personal Finance API

A secure backend API for personal finance management built with NestJS, featuring JWT authentication, Prisma ORM, and PostgreSQL.

---

## 🚀 Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + Passport
- **Validation:** class-validator & class-transformer
- **Testing:** Jest
- **Security:** bcrypt password hashing

---

## 📦 Project Status

✅ **Core Features Implemented**

- ✅ User registration and authentication with JWT
- ✅ Protected routes with authentication guards
- ✅ PostgreSQL database with Prisma ORM
- ✅ Categories, Transactions, and Budgets management
- ✅ Budget analytics and spending tracking
- ✅ Dashboard with financial analytics and reports
- ✅ Strict per-user data isolation (userId derived from JWT)
- ✅ Comprehensive validation using DTOs
- ✅ Global exception handling
- ✅ Interactive API documentation (Swagger/OpenAPI)
- ✅ 80+ unit tests with good coverage
- ❌ Refresh tokens (out of scope)
- ❌ Role-based authorization (future)

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ (tested with v22)
- **PostgreSQL** 12+
- **npm** or **yarn**

---

## ⚙️ Environment Setup

Create a `.env` file in the root directory (you can copy from `.env.example`):

```env
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/my_pocket_db?schema=public"

# Application Port (optional, defaults to 3000)
PORT=3000

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION=3600  # Token expiration in seconds (3600 = 1 hour)
```

### Testing Environment

For running e2e tests, create a `.env.test` file:

```env
DATABASE_URL="postgresql://postgres:@localhost:5432/bd_my_pocket_test?schema=public"
PORT=3001
JWT_SECRET="test-super-secret-jwt-key-for-e2e-tests"
JWT_EXPIRATION=3600
NODE_ENV=test
```

---

## 🚀 Getting Started from Zero

Follow these steps to set up the project locally:

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd my-pocket-backend-nestjs

# Install dependencies
npm install
```

### 2. Setup PostgreSQL Database

```bash
# Create development database
createdb my_pocket_db

# Create test database (optional, for e2e tests)
createdb bd_my_pocket_test
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your database credentials
# Update DATABASE_URL with your PostgreSQL user/password
# Set a strong JWT_SECRET
```

### 4. Run Database Migrations

```bash
# Create all tables and schema
npm run db:migrate:dev

# Generate Prisma client (usually auto-generated after migration)
npm run db:generate
```

### 5. Seed Database (Optional)

```bash
# Create demo user and categories
npm run db:seed
```

### 6. Start Development Server

```bash
# Start server with hot-reload
npm run start:dev
```

The server will start on `http://localhost:3000`.

### 7. Verify Installation

- **Health check:** `GET http://localhost:3000/health`
- **API documentation:** `http://localhost:3000/docs`

---

## 📚 API Documentation

Once the server is running, visit the **interactive Swagger documentation**:

```
http://localhost:3000/docs
```

This provides:

- Complete API reference with request/response schemas
- Ability to test endpoints directly in the browser
- Authentication support (click "Authorize" to add your JWT token)
- Request/response examples for all endpoints

---

## 📂 Project Structure

```
src/
├── main.ts                        # Application entry point, Swagger setup
├── app.module.ts                  # Root module, imports all features
├── app.controller.ts              # Root controller
├── app.service.ts                 # Root service
├── common/
│   └── filters/
│       └── http-exception.filter.ts  # Global exception handler
└── modules/
    ├── auths/                     # Authentication & Authorization
    │   ├── auths.controller.ts    # POST /auths/register, /login
    │   ├── auths.service.ts       # Bcrypt, JWT token generation
    │   ├── jwt.strategy.ts        # Passport JWT validation
    │   ├── jwt-auth.guard.ts      # Route protection guard
    │   └── dto/                   # Register, Login DTOs
    │
    ├── categories/                # Category management
    │   ├── categories.controller.ts
    │   ├── categories.service.ts
    │   └── dto/                   # Category DTOs
    │
    ├── transactions/              # Transaction management
    │   ├── transactions.controller.ts
    │   ├── transactions.service.ts
    │   └── dto/                   # Transaction DTOs
    │
    ├── budgets/                   # Budget management & Analytics
    │   ├── budget.controller.ts
    │   ├── budget.service.ts
    │   └── dto/                   # Budget DTOs
    │
    ├── dashboard/                 # Financial analytics & Reports
    │   ├── dashboard.controller.ts
    │   ├── dashboard.service.ts
    │   └── dto/                   # Dashboard query DTOs
    │
    ├── health/                    # Health check
    │   ├── health.controller.ts
    │   └── health.module.ts
    │
    └── shared/                    # Shared services
        ├── prisma.service.ts      # Database connection
        └── shared.module.ts

prisma/
├── schema.prisma                  # Database schema (User, Category, Transaction, Budget)
├── seed.ts                        # Demo data seeder
└── migrations/                    # Migration history
```

---

## 🏗️ Architecture

The project follows **NestJS modular architecture** with clean separation of concerns:

- **Modular Design:** Each business domain (Auth, Categories, Transactions, Budgets) is isolated in its own module
- **Dependency Injection:** Services are injectable and shared across modules
- **Authentication Layer:**
  - JWT strategy with Passport integration
  - `JwtAuthGuard` for route protection
  - User context extraction from JWT tokens
- **Database Layer:**
  - Prisma ORM for type-safe database access
  - PostgreSQL for data persistence
  - Cascading deletes for data integrity
- **Module Dependencies:**
  - All resource modules (Categories, Transactions, Budgets) are protected with `JwtAuthGuard`
  - `BudgetModule` imports `CategoriesModule`
  - Each module exports its service for use by dependent modules
- **Global Features:**
  - Validation pipe with DTO transformation and whitelist enforcement
  - Custom exception filter for standardized error responses

---

## ✨ Features

### Authentication Module

- **User Registration:**
  - Email/password registration with validation
  - Bcrypt password hashing (10 salt rounds)
  - Automatic JWT token generation on signup
  - Email uniqueness validation
- **User Login:**
  - Credential validation with bcrypt comparison
  - JWT token generation on successful login
  - Generic error messages to prevent account enumeration
- **JWT Authentication:**
  - Bearer token validation
  - User context attached to requests
  - 401 responses for invalid/missing tokens

### Categories Module

- Full CRUD operations for category management
- Category types: INCOME, EXPENSE
- User-scoped categories (users can only access their own)
- Validated DTOs with required fields
- Unique constraint: name + type per user

### Transactions Module

- Complete transaction lifecycle management
- User-scoped transactions
- Automatic category validation
- Tracks amount, description, category, date, and type
- Integration with Categories module

### Budgets Module (Advanced)

- Full CRUD operations for budget management
- User-scoped budgets
- **Budget Analytics:**
  - Calculate spent amount from transactions
  - Calculate remaining budget
  - Track budget utilization percentage
- **Budget Details Endpoint:** Returns budget with category info, related transactions, and spending metrics
- **Category Budget Overview:** Get all budgets for a specific category
- **Validation:**
  - Month validation (1-12)
  - Duplicate prevention (same category/period per user)
  - Category existence validation

### Dashboard Module (Analytics)

- **Monthly Summary:** Aggregated income and expense overview for a specific month/year
- **Budget vs Actual:** Compare budgeted amounts to actual spending by category
- **Category Breakdown:** Detailed spending analysis per category with percentages
- **Top Expenses:** Retrieve top N expense transactions for a period
- **Query Parameters:** All endpoints support month, year, and optional limit filters
- **Data Aggregation:** Real-time calculations from transactions and budgets
- **User-scoped Analytics:** All metrics filtered by authenticated user

### Database Schema

- **User:** Authentication and ownership
- **Category:** User-owned expense/income categories
- **Transaction:** Financial transactions linked to categories and users
- **Budget:** Monthly budgets with analytics
- **Relationships:** Cascading deletes for data integrity

### Global Features

- DTOs with class-validator decorators
- Automatic payload transformation and validation
- Standardized error responses
- Health check endpoint for monitoring

---

## 🔌 API Endpoints

### Authentication (Public)

- `POST /auths/register` - Register a new user
- `POST /auths/login` - Login and receive JWT token

### Categories (Protected)

- `GET /categories` - Get all user categories
- `GET /categories/:id` - Get category by ID
- `POST /categories` - Create a new category
- `PUT /categories/:id` - Update a category
- `DELETE /categories/:id` - Delete a category

### Transactions (Protected)

- `GET /transactions` - Get all user transactions
- `GET /transactions/:id` - Get transaction by ID
- `POST /transactions` - Create a new transaction
- `PUT /transactions/:id` - Update a transaction
- `DELETE /transactions/:id` - Delete a transaction

### Budgets (Protected)

- `GET /budgets` - Get all user budgets
- `GET /budgets/:id` - Get budget by ID
- `GET /budgets/:id/details` - Get budget with full details (category, transactions, metrics)
- `GET /budgets/category/:categoryId` - Get all budgets for a category
- `POST /budgets` - Create a new budget
- `PUT /budgets/:id` - Update a budget
- `DELETE /budgets/:id` - Delete a budget

### Dashboard (Protected)

- `GET /dashboard/monthly-summary?month=2&year=2026` - Monthly income/expense summary
- `GET /dashboard/budget-vs-actual?month=2&year=2026` - Budget vs actual spending by category
- `GET /dashboard/category-breakdown?month=2&year=2026` - Spending breakdown by category with percentages
- `GET /dashboard/top-expenses?month=2&year=2026&limit=10` - Top expense transactions for the period

### Health (Public)

- `GET /health` - Health check endpoint

**Authentication:** Protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Flow

### Registration Flow

1. Client sends `POST /auths/register` with `{ name, email, password }`
2. Email validated (must be valid format and unique)
3. Password validated (minimum 6 characters)
4. Password hashed with bcrypt (10 salt rounds)
5. User created in database
6. JWT token generated with payload `{ userId, email }`
7. Token returned to client (expires in 1 hour by default)

### Login Flow

1. Client sends `POST /auths/login` with `{ email, password }`
2. User looked up by email
3. Password compared with bcrypt
4. If invalid credentials, generic error returned (prevents account enumeration)
5. JWT token generated and returned to client

### Protected Route Authentication

1. Client includes `Authorization: Bearer <token>` header in request
2. `JwtAuthGuard` intercepts the request
3. `JwtStrategy` validates token signature using `JWT_SECRET`
4. User loaded from database to ensure account still exists
5. User object attached to request as `req.user` with `{ userId, email, name }`
6. Controller accesses `req.user.userId` for data isolation
7. If token is invalid/expired, 401 Unauthorized response returned

---

## 🔌 Example API Usage

### Registration

```bash
curl -X POST http://localhost:3000/auths/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secret123"
  }'
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

```bash
curl -X POST http://localhost:3000/auths/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secret123"
  }'
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Create Category (Protected)

```bash
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Groceries",
    "type": "EXPENSE"
  }'
```

### Create Transaction (Protected)

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 99.99,
    "type": "EXPENSE",
    "categoryId": "uuid-of-category",
    "date": "2026-02-26T10:00:00.000Z",
    "description": "Weekly grocery shopping"
  }'
```

---

## 🔑 Seed Data

After running `npm run db:seed`, the following demo data is available:

### Demo User Credentials

- **Email:** `demo@example.com`
- **Password:** `password123`

### Pre-seeded Categories

**Income Categories:**

- Salary
- Freelance
- Investments

**Expense Categories:**

- Food
- Transport
- Housing
- Entertainment
- Healthcare
- Utilities
- Shopping
- Education

---

## 💾 Database Commands

```bash
# Development
npm run db:migrate:dev       # Create and apply new migration
npm run db:generate          # Regenerate Prisma client
npm run db:push              # Push schema changes without creating migration
npm run db:studio            # Open Prisma Studio (database GUI)
npm run db:seed              # Seed database with demo data

# Testing
npm run db:migrate:test      # Run migrations on test database

# Production
npm run db:migrate:deploy    # Apply pending migrations (production)
```

---

## 🔧 Troubleshooting

### Database Connection Error

**Problem:** `Can't reach database server`

**Solution:**

- Ensure PostgreSQL is running: `sudo service postgresql status`
- Verify DATABASE_URL in `.env` has correct credentials
- Check database exists: `psql -l`

### JWT_SECRET Not Defined

**Problem:** `JWT_SECRET is not defined`

**Solution:**

- Ensure `.env` file exists in project root
- Add `JWT_SECRET="your-secret-key"` to `.env`
- Restart the development server

### Port Already in Use

**Problem:** `Port 3000 is already in use`

**Solution:**

- Change PORT in `.env` to another value (e.g., 3001)
- Or kill the process using port 3000: `lsof -ti:3000 | xargs kill`

### Prisma Client Not Generated

**Problem:** `Cannot find module '@prisma/client'`

**Solution:**

```bash
npm run db:generate
```

### Migration Errors

**Problem:** Migration fails or schema out of sync

**Solution:**

```bash
# Reset database (WARNING: deletes all data)
npm run db:push -- --force-reset

# Or create a new migration
npm run db:migrate:dev
```

---

## 🧪 Testing

The project includes **80+ unit tests** covering all services:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov
```

**Test Coverage:**

- CategoriesService: 6 tests
- TransactionsService: 20+ tests
- BudgetService: 40+ tests (includes complex analytics and validation)
- AuthsService: Unit tests for registration and login
- E2E tests: Basic integration test

---

## 🎯 What's Next

- [ ] **Refresh tokens** for better security
- [ ] **Role-based authorization** (admin/user roles)
- [ ] **Logging system** (Winston or similar)
- [ ] **Docker** containerization
- [ ] **CI/CD** pipeline
- [ ] **Rate limiting** and security headers
- [ ] **Email verification** for new users
- [ ] **Password reset** functionality
- [ ] **Transaction filters** (date range, category, type)
- [ ] **Pagination** for list endpoints

---

## 📄 License

This project is for study and personal use.
