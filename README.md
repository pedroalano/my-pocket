# My Pocket - Personal Finance Management

A full-stack personal finance application built as a monorepo with **NestJS** backend, **Next.js** frontend, and shared packages.

---

## 🏗️ Monorepo Structure

This project uses **Turborepo** with npm workspaces for efficient builds and development.

```
my-pocket/
├── apps/
│   ├── api/           # NestJS backend API
│   └── web/           # Next.js frontend
├── packages/
│   └── shared/        # Shared types and utilities
├── prisma/            # Database schema and migrations
├── docker/            # Dockerfiles for each app
├── turbo.json         # Turborepo configuration
└── package.json       # Root workspace configuration
```

---

## 🚀 Tech Stack

### Backend (apps/api)

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + Passport
- **Validation:** class-validator & class-transformer
- **Testing:** Jest

### Frontend (apps/web)

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Bundler:** Turbopack

### Shared (packages/shared)

- Shared TypeScript types
- API response interfaces
- Common utilities

---

## 📋 Prerequisites

- **Node.js** 18+ (tested with v22)
- **PostgreSQL** 16+
- **npm** 10+

---

## ⚙️ Environment Setup

Create a `.env` file in the root directory:

```env
# Runtime
NODE_ENV=development
PORT=3001

# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/my_pocket_db?schema=public"

# JWT Authentication (secret must be >= 32 chars)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION=3600
```

For the frontend, create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

### 2. Setup Database

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate:dev

# (Optional) Seed the database
npm run db:seed
```

### 3. Development

```bash
# Start all apps in development mode
npm run dev

# Or start individually
npm run dev:api    # Backend only (port 3001)
npm run dev:web    # Frontend only (port 3000)
```

### 4. Build

```bash
# Build all apps
npm run build

# Build specific app
npm run build --filter=@my-pocket/api
npm run build --filter=@my-pocket/web
```

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests (backend)
npm run test:e2e --filter=@my-pocket/api
```

---

## 🐳 Docker

### Development

```bash
# Start all services (postgres, api, web)
docker-compose up -d
```

### Production Build

```bash
# Build and run production containers
docker-compose -f docker-compose.yml up --build
```

**Services:**

- `postgres` - PostgreSQL database (port 5432)
- `api` - NestJS backend (port 3001)
- `web` - Next.js frontend (port 3000)

---

## 📦 Available Scripts

| Script                   | Description                        |
| ------------------------ | ---------------------------------- |
| `npm run dev`            | Start all apps in development mode |
| `npm run build`          | Build all apps                     |
| `npm run lint`           | Lint all apps                      |
| `npm run test`           | Run all tests                      |
| `npm run db:generate`    | Generate Prisma client             |
| `npm run db:migrate:dev` | Run database migrations            |
| `npm run db:studio`      | Open Prisma Studio                 |

---

## 📖 API Documentation

Once the API is running, visit:

- Swagger UI: http://localhost:3001/api

---

## 📋 API Features

- ✅ User registration and authentication with JWT
- ✅ Protected routes with authentication guards
- ✅ Categories, Transactions, and Budgets management
- ✅ Budget analytics and spending tracking
- ✅ Dashboard with financial analytics
- ✅ Strict per-user data isolation
- ✅ Comprehensive validation using DTOs
- ✅ Global exception handling
- ✅ Interactive API documentation (Swagger/OpenAPI)

---

## 🔧 Project Configuration

### Turborepo Tasks

Tasks are defined in `turbo.json`:

- `build` - Builds apps with dependency graph
- `dev` - Runs development servers (no cache)
- `lint` - Runs linting
- `test` - Runs tests

### TypeScript

- `tsconfig.base.json` - Shared compiler options
- Each app extends the base configuration

---

## 🔨 Troubleshooting

### New routes returning 404 in Docker

If you add a new route file (e.g., `apps/web/src/app/newpage/page.tsx`) and it returns 404:

1. **Clear Next.js cache:**

   ```bash
   cd apps/web && npm run clean
   ```

2. **Restart the web container:**

   ```bash
   docker compose -f docker-compose.dev.yml restart web
   ```

3. **Or rebuild from scratch:**
   ```bash
   docker compose -f docker-compose.dev.yml up web --build
   ```

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run test`
4. Submit a pull request

---

## 📄 License

This project is for study and personal use.
