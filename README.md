# Shopix

A full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js). Features 300+ products across 35 categories with complete user and admin flows.

## Tech Stack

**Frontend:** React 19, Tailwind CSS 4, React Router 7, Axios, Fuse.js  
**Backend:** Node.js, Express 5, Mongoose 9, JWT, Multer, Helmet  
**DevOps:** Docker (multi-stage), Docker Compose, GitHub Actions CI/CD  
**Database:** MongoDB

## Features

**Shopping**
- Browse 35 product categories with images and icons
- Fuzzy search with typo tolerance (powered by Fuse.js)
- Product detail pages with reviews and star ratings
- Shopping cart with stock-aware quantity limits
- Multi-step checkout (Shipping → Payment → Review → Place Order)
- Order tracking with payment and delivery status

**Admin Panel**
- Dashboard with revenue, orders, products, and user stats
- Product management — create, edit, delete with image upload
- Order management — view all orders, mark as paid/delivered
- User management — toggle admin roles, delete users

**Security**
- Passwords hashed with bcrypt (never stored in plain text)
- JWT authentication with server-side token validation on app load
- Helmet HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
- JSON body size limit to prevent large-payload DoS
- Server-side price calculation — prices fetched from DB, never trusted from client
- Stock validation and auto-decrement on order placement
- Rate limiting on login/register (10 attempts per 15 min)
- Regex-escaped search queries to prevent ReDoS
- Authorization checks — users can only access their own orders
- CORS restricted to frontend origin
- Auto-logout on expired tokens (401 interceptor)

**Error Handling**
- React Error Boundary for graceful crash recovery
- Global Express error handler (Mongoose, JWT, and validation errors)
- Safe localStorage parsing to prevent corrupted data crashes
- Consistent API response format across all endpoints

**DevOps**
- Multi-stage Docker build (build frontend → production server image)
- Docker Compose with MongoDB auth, health checks, and internal networking
- 3-job GitHub Actions CI/CD: Lint & Build → Security Audit → Docker Build
- npm dependency caching and Docker layer caching (Buildx + GHA cache)
- Health check endpoint (`/api/health`) for container orchestration

## API Endpoints (17)

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public (rate-limited) |
| POST | `/api/auth/login` | Public (rate-limited) |
| GET | `/api/auth/profile` | Private |
| GET | `/api/auth/users` | Admin |
| PUT | `/api/auth/users/:id` | Admin |
| DELETE | `/api/auth/users/:id` | Admin |

### Products
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/products` | Public |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Admin |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |
| POST | `/api/products/:id/reviews` | Private |

### Orders
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/orders` | Private |
| GET | `/api/orders` | Admin |
| GET | `/api/orders/myorders` | Private |
| GET | `/api/orders/:id` | Private (owner/admin) |
| PUT | `/api/orders/:id/pay` | Private (owner/admin) |
| PUT | `/api/orders/:id/deliver` | Admin |

### Upload
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/upload` | Admin (max 5MB, jpg/png/gif/webp) |

## Project Structure

```
client/src/
├── components/        Reusable UI (Header, ProductCard, ErrorBoundary, PrivateRoute)
│   ├── home/          HomePage sub-components (SearchBar, CategoryGrid, ProductGrid)
│   └── ui/            Generic UI (Alert, LoadingSpinner, LoadingWrapper)
├── context/           Global state (AuthContext, CartContext)
├── hooks/             Custom hooks (useProducts, useOrders, useUsers, useFetch)
├── pages/             Route pages (Home, Login, Cart, Checkout, Order, Profile, 404)
│   └── admin/         Admin pages (Dashboard, Products, Orders, Users)
├── services/          API call layer (auth, product, order services)
└── utils/             Helpers (axios instance, safeParse, catchAsync, constants)

server/
├── config/            Database connection + centralized config
├── controllers/       Business logic (auth, products, orders)
├── middleware/        Auth middleware (protect, admin) + global error handler
├── models/           Mongoose schemas (User, Product, Order)
├── routes/           Route definitions with middleware chains
├── utils/            Helpers (generateToken, catchAsync, response, escapeRegex)
└── scripts/          Database seed scripts (300+ products)
```

## Database Models

**User** — name, email (validated), password (bcrypt hashed, hidden from queries), isAdmin

**Product** — name, image, brand, category, description, price, countInStock, rating, numReviews, reviews (embedded subdocuments with user, rating 1-5, comment)

**Order** — user, orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice (10%), shippingPrice (free over ₹5000), totalPrice, isPaid, isDelivered

## Getting Started

```bash
# Install all dependencies
npm install && npm run install-all

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and JWT secret

# Seed the database (optional — adds 300+ products)
cd server && node scripts/seedIndianProducts.js && cd ..

# Start both client and server
npm run dev
```

Frontend runs on `http://localhost:3000`  
Backend runs on `http://localhost:5000`

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/ecommerce
JWT_SECRET=<your-secret>
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start both client and server |
| `npm run server` | Start backend only (nodemon) |
| `npm run client` | Start frontend only (vite) |
| `npm run build` | Build React frontend for production |
| `npm run install-all` | Install all dependencies |
| `docker compose up --build` | Build and run with Docker Compose |
| `docker compose down` | Stop all containers |
