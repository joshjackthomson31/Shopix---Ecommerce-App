# Shopix — Interview Guide

Use this document to explain your project to interviewers clearly and confidently.

---

## 1. The One-Liner

> "Shopix is a full-stack e-commerce web application built with the MERN stack — MongoDB, Express, React, and Node.js — where users can browse products, add them to a cart, checkout, and make payments. It also has a complete admin panel for managing products, orders, and users."

---

## 2. Why I Built This

- To learn full-stack development end-to-end — from database design to frontend UI
- To understand real-world patterns like authentication, authorization, API design, and state management
- To build something complete and functional, not just a tutorial follow-along

---

## 3. Tech Stack

| Layer | Technology | Why I Chose It |
|---|---|---|
| **Frontend** | React 19 | Component-based UI, huge ecosystem, industry standard |
| **Styling** | Tailwind CSS 4 | Utility-first CSS — fast to build, easy to maintain |
| **Routing** | React Router 7 | Client-side routing with protected routes |
| **HTTP Client** | Axios | Interceptors for auth tokens and error handling |
| **Search** | Fuse.js | Client-side fuzzy search — works without hitting the server |
| **Backend** | Node.js + Express 5 | Non-blocking I/O, lightweight, great for REST APIs |
| **Database** | MongoDB + Mongoose | Flexible schema for products with varying attributes |
| **Auth** | JWT (JSON Web Tokens) | Stateless authentication — no server-side sessions needed |
| **Password Hashing** | bcrypt | Industry-standard one-way hashing with salt |
| **File Upload** | Multer | Handles multipart form data for image uploads |
| **Rate Limiting** | express-rate-limit | Prevents brute-force attacks on login/register |
| **Security Headers** | Helmet | Sets CSP, HSTS, X-Frame-Options, and other HTTP security headers |
| **DevOps** | Docker, GitHub Actions | Multi-stage Docker build, 3-job CI/CD pipeline |
| **Dev Tools** | Vite, Nodemon, Concurrently | Fast builds, auto-reload, run client + server together |

---

## 4. Project Structure

```
Shopix/
├── client/                    # React frontend
│   └── src/
│       ├── components/        # Reusable UI components
│       │   ├── home/          # HomePage sub-components (SearchBar, CategoryGrid, ProductGrid)
│       │   ├── ui/            # Generic UI (Alert, LoadingSpinner, LoadingWrapper)
│       │   ├── Header.jsx     # Responsive nav bar with hamburger menu
│       │   ├── PrivateRoute.jsx   # Route guards for auth/admin
│       │   ├── ErrorBoundary.jsx  # Catches rendering crashes gracefully
│       │   └── ProductCard.jsx
│       ├── context/           # React Context for global state
│       │   ├── AuthContext.jsx    # Login, register, logout, token validation
│       │   └── CartContext.jsx    # Cart items, totals, stock-capped quantities
│       ├── hooks/             # Custom React hooks
│       │   ├── useFetch.js        # Generic data-fetching hook
│       │   ├── useProducts.js     # Product CRUD operations
│       │   ├── useOrders.js       # Order management
│       │   └── useUsers.js        # User management (admin)
│       ├── pages/             # Full page components
│       │   ├── HomePage.jsx       # Category browsing + fuzzy search
│       │   ├── LoginPage.jsx      # Login with redirect support
│       │   ├── RegisterPage.jsx   # Registration with redirect support
│       │   ├── ProductDetailPage.jsx  # Product info + reviews
│       │   ├── CartPage.jsx       # Shopping cart
│       │   ├── CheckoutPage.jsx   # Multi-step checkout
│       │   ├── OrderPage.jsx      # Order details + Pay Now
│       │   ├── ProfilePage.jsx    # User profile + order history
│       │   ├── NotFoundPage.jsx   # 404 page
│       │   └── admin/             # Admin pages (Dashboard, Products, Orders, Users)
│       ├── services/          # API call functions
│       └── utils/             # Utilities (api client, safeParse, constants, etc.)
│
├── server/                    # Express backend
│   ├── config/                # DB connection + centralized config
│   ├── controllers/           # Business logic (auth, products, orders)
│   ├── middleware/            # Auth middleware + error handler
│   ├── models/               # Mongoose schemas (User, Product, Order)
│   ├── routes/               # API route definitions
│   ├── utils/                # Helpers (token generation, catchAsync, response, escapeRegex)
│   ├── scripts/              # Database seed scripts (300+ products)
│   ├── uploads/              # Uploaded product images
│   └── server.js             # Entry point
```

**Total: 75 files** (47 client + 28 server)

---

## 5. Features

### User-Facing Features
- Browse products by **35 categories** with images and icons
- **Fuzzy search** — typos and partial matches still find products (powered by Fuse.js)
- **Debounced search** — waits 300ms before searching to avoid unnecessary work
- Product detail page with images, description, stock status, and reviews
- **Shopping cart** with quantity controls (capped at available stock)
- **Multi-step checkout** — Shipping → Payment → Review → Place Order
- **Order tracking** — view order status, payment status, delivery status
- **Pay Now** button to simulate payment
- User profile page with order history
- **Scroll position memory** — go back from a product page and you're exactly where you left off
- Responsive design — works on mobile with a hamburger menu

### Admin Features
- **Dashboard** — overview with total orders, products, users, and revenue
- **Product management** — create, edit, delete products with image upload
- **Order management** — view all orders, mark as paid/delivered
- **User management** — view all users, toggle admin role, delete users
- Cascading filters — filter products by category, then by brand within that category

### Security Features
- Passwords hashed with **bcrypt** (never stored in plain text)
- **JWT authentication** with token validation on app load
- **Route protection** — Private routes for logged-in users, Admin routes for admins only
- **Server-side price calculation** — prices come from the database, never trusted from the client
- **Stock validation** — server checks if enough stock exists before creating an order
- **Rate limiting** — login/register limited to 10 attempts per 15 minutes per IP
- **CORS restriction** — only the frontend origin can call the API
- **Regex escaping** — user search input is sanitized before database queries (prevents ReDoS)
- **Authorization checks** — users can only view/pay their own orders
- Auto-logout on expired token (401 interceptor)

---

## 6. How the App Works (Data Flow)

### Authentication Flow
```
User fills login form
    → Frontend sends POST /api/auth/login with email + password
    → Server finds user in MongoDB, compares password with bcrypt
    → If valid: server creates a JWT token, sends back user data + token
    → Frontend stores user + token in localStorage
    → Axios interceptor attaches token to every future API request
    → On app reload: AuthContext reads localStorage, then validates token
      by calling GET /api/auth/profile — if token expired, auto-clears session
```

### Order Flow (Most Complex)
```
User adds items to cart (quantities capped at stock)
    → Cart stored in localStorage via CartContext
    → User clicks "Checkout" → redirected to login if not authenticated
    → After login, redirected back to /checkout (redirect param preserved)
    → User fills shipping address → selects payment method → reviews order
    → Frontend sends only { product IDs + quantities } to server
    → Server:
        1. Fetches each product from DB (gets real prices)
        2. Validates stock availability for each item
        3. Calculates itemsPrice, tax (10%), shipping (free over ₹5000), total
        4. Creates the order
        5. Decrements countInStock for each product
    → User sees order confirmation → clicks "Pay Now"
    → Server verifies user owns the order before allowing payment
    → Order status updates to "Paid"
```

### Search Flow
```
User types in search bar
    → Input is debounced (300ms delay)
    → Fuse.js searches all products client-side (fuzzy matching)
    → Results appear instantly without any server call
    → If searching within a category, Fuse.js filters only that category's products
```

---

## 7. API Endpoints (17 Total)

### Auth (6 endpoints)
| Method | Endpoint | Access | What It Does |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create a new user account |
| POST | `/api/auth/login` | Public | Login and get JWT token |
| GET | `/api/auth/profile` | Private | Get logged-in user's profile |
| GET | `/api/auth/users` | Admin | Get all users |
| PUT | `/api/auth/users/:id` | Admin | Update a user (toggle admin) |
| DELETE | `/api/auth/users/:id` | Admin | Delete a user |

### Products (6 endpoints)
| Method | Endpoint | Access | What It Does |
|---|---|---|---|
| GET | `/api/products` | Public | Get all products (search, filter, pagination) |
| GET | `/api/products/:id` | Public | Get a single product |
| POST | `/api/products` | Admin | Create a new product |
| PUT | `/api/products/:id` | Admin | Update a product |
| DELETE | `/api/products/:id` | Admin | Delete a product |
| POST | `/api/products/:id/reviews` | Private | Add a review to a product |

### Orders (6 endpoints)
| Method | Endpoint | Access | What It Does |
|---|---|---|---|
| POST | `/api/orders` | Private | Place a new order |
| GET | `/api/orders` | Admin | Get all orders (with pagination) |
| GET | `/api/orders/myorders` | Private | Get my orders |
| GET | `/api/orders/:id` | Private | Get order details (owner or admin only) |
| PUT | `/api/orders/:id/pay` | Private | Mark order as paid (owner or admin only) |
| PUT | `/api/orders/:id/deliver` | Admin | Mark order as delivered |

### Upload (1 endpoint)
| Method | Endpoint | Access | What It Does |
|---|---|---|---|
| POST | `/api/upload` | Admin | Upload a product image (max 5MB, jpg/png/gif/webp) |

---

## 8. Database Design

### User
| Field | Type | Notes |
|---|---|---|
| name | String | Required |
| email | String | Required, unique, lowercase, validated with regex |
| password | String | Required, min 6 chars, hashed with bcrypt, hidden from queries (`select: false`) |
| isAdmin | Boolean | Default: false |
| timestamps | | createdAt, updatedAt auto-generated |

### Product
| Field | Type | Notes |
|---|---|---|
| user | ObjectId → User | Which admin created this product |
| name | String | Required, trimmed |
| image | String | URL or uploaded file path |
| brand | String | Required |
| category | String | Required |
| description | String | Required |
| price | Number | Required |
| countInStock | Number | Required, decremented when order is placed |
| rating | Number | Average of all review ratings (auto-calculated) |
| numReviews | Number | Count of reviews (auto-calculated) |
| reviews | [Review] | Embedded subdocuments (user, name, rating 1-5, comment) |

### Order
| Field | Type | Notes |
|---|---|---|
| user | ObjectId → User | Who placed the order |
| orderItems | [Item] | Each has: name, qty, image, price, product ID |
| shippingAddress | Object | address, city, postalCode, country |
| paymentMethod | String | PayPal / Stripe / COD |
| itemsPrice | Number | Calculated server-side |
| taxPrice | Number | 10% of itemsPrice |
| shippingPrice | Number | Free if itemsPrice > ₹5000, else ₹99 |
| totalPrice | Number | itemsPrice + taxPrice + shippingPrice |
| isPaid | Boolean | Default: false |
| isDelivered | Boolean | Default: false |

---

## 9. Architecture Patterns I Used

### Backend Patterns

**MVC (Model-View-Controller)**
- **Models** — Mongoose schemas define data structure and validation
- **Controllers** — Business logic (what happens when an endpoint is hit)
- **Routes** — Map URLs to controllers (thin layer, no logic here)

**Middleware Chain**
```
Request → CORS → JSON Parser → Route → Auth Middleware → Controller → Response
                                                              ↓ (if error)
                                                      Error Handler Middleware
```

**catchAsync Wrapper**
Instead of writing try-catch in every controller, I created a `catchAsync` utility that wraps async functions and forwards errors to the global error handler automatically.

**Consistent API Responses**
Every endpoint returns the same shape:
```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "Error description" }
```
This is done via `sendSuccess()` and `sendError()` utilities.

### Frontend Patterns

**Context + Custom Hooks**
- `AuthContext` — manages login state, token validation, logout
- `CartContext` — manages cart items, quantities, price calculations
- Custom hooks (`useProducts`, `useOrders`, `useUsers`) — wrap API calls with loading/error state

**Services Layer**
API calls are not made directly in components. Instead:
```
Component → Custom Hook → Service → Axios Instance → Server
```
This keeps components clean and API logic reusable.

**Component Composition**
- HomePage was split into SearchBar, CategoryGrid, and ProductGrid
- PrivateRoute and AdminRoute wrap pages that need protection
- ErrorBoundary wraps the entire app to catch rendering crashes

---

## 10. Key Design Decisions (Why I Did Things This Way)

### "Why server-side price calculation?"
> A malicious user could modify prices in the browser and send fake totals. My server ignores all client-sent prices — it fetches real prices from the database, calculates tax and shipping itself, and creates the order with trusted values.

### "Why Fuse.js for search instead of server-side search?"
> For a catalog of 300 products, client-side fuzzy search is instant — no network round trip. The user types "iphne" (misspelled) and still finds "iPhone" because Fuse.js does approximate matching. Server-side regex search is also available for larger datasets.

### "Why localStorage for auth instead of cookies?"
> For a learning project, localStorage is simpler to implement. In production, I'd use httpOnly cookies with a refresh token rotation to prevent XSS attacks. I'm aware of the tradeoff.

### "Why JWT instead of sessions?"
> JWT is stateless — the server doesn't need to store session data. The token contains the user ID, and the server verifies it on each request. This makes the API easily scalable since any server instance can validate the token.

### "Why embedded reviews instead of a separate collection?"
> Reviews are always accessed with their product. Embedding them avoids an extra database query. This is the right approach when the relationship is one-to-few (a product has a manageable number of reviews).

### "Why Context API instead of Redux?"
> The app has only two pieces of global state — auth and cart. Context API handles this well without the boilerplate of Redux. I'd consider Redux or Zustand for a larger app with more complex state.

### "Why no real payment gateway?"
> The focus of this project is on the full-stack architecture — authentication, authorization, database design, API design, and state management. The backend endpoint for payment processing is fully structured and ready for a real Stripe or Razorpay integration.

---

## 11. Error Handling Strategy

### Server Side
- **Global error handler** catches all errors in one place
- Automatically handles specific Mongoose errors:
  - `CastError` → "Invalid ID format"
  - `11000 (duplicate key)` → "email already exists"
  - `ValidationError` → human-readable field messages
- JWT errors: `JsonWebTokenError` → "Invalid token", `TokenExpiredError` → "Token expired"
- Stack traces are only shown in development mode

### Client Side
- **ErrorBoundary** — wraps the entire app, catches rendering crashes, shows a friendly "Something went wrong" page instead of a white screen
- **401 Interceptor** — if any API call returns 401 (expired token), automatically clears the session and redirects to login
- **safeParse utility** — wraps `JSON.parse` for localStorage reads. If data is corrupted, it returns a fallback value instead of crashing the app
- **catchAsync wrapper** — every API call returns `{ success, data }` or `{ success, error }` — no uncaught promise rejections

---

## 12. Security Measures (What I'd Say in an Interview)

| What I Implemented | Why It Matters |
|---|---|
| bcrypt password hashing (salt rounds: 10) | Even if the database is compromised, passwords can't be read |
| `password: select: false` in schema | Password is never included in database query results by default |
| Helmet HTTP security headers | Sets Content-Security-Policy, HSTS, X-Frame-Options, etc. out of the box |
| JSON body size limit (10kb) | Prevents large-payload Denial of Service attacks |
| Server-side price calculation | Users can't manipulate prices by editing the browser |
| Stock validation before order creation | Prevents ordering more than what's available |
| JWT token validation on app load | Stale tokens from previous sessions are detected and cleared |
| Rate limiting on login/register (10 per 15 min) | Prevents brute-force password guessing |
| CORS restricted to frontend origin | Other websites can't call my API |
| Regex escaping on search input | Prevents ReDoS (Regular Expression Denial of Service) attacks |
| Authorization checks on order endpoints | Users can only view and pay for their own orders |
| Admin-only routes with middleware chain | `protect` → `admin` — two layers of verification |

---

## 13. What I'd Improve With More Time

These are things I consciously chose not to build, but I know how I would:

| Improvement | How I'd Do It |
|---|---|
| **Real payment integration** | Stripe or Razorpay SDK — the backend endpoint structure is already ready |
| **Token refresh mechanism** | Short-lived access tokens (15 min) + long-lived refresh tokens in httpOnly cookies |
| **Unit and integration tests** | Jest for backend controllers, React Testing Library for frontend components |
| **Database indexes** | Add indexes on `Product.category`, `Product.name`, and `Order.user` for faster queries |
| **Email verification** | Send a verification link on registration using Nodemailer + token |
| **Stock rollback on abandoned orders** | Return stock if an order isn't paid within 30 minutes (using a cron job or TTL) |
| **Client-side pagination for admin** | The server already supports `page` and `limit` params — I'd wire up a pagination component |
| **Profile editing** | Add a form to update name/email/password using the existing auth endpoints |

---

## 14. Common Interview Questions & Answers

**Q: Walk me through what happens when a user places an order.**
> The frontend sends only product IDs and quantities — no prices. The server fetches each product from MongoDB to get the real price, validates that enough stock exists, calculates the totals (items + 10% tax + shipping), creates the order, and decrements the stock for each product. This prevents price manipulation from the client side.

**Q: How does authentication work in your app?**
> When a user logs in, the server verifies their password with bcrypt, then creates a JWT token containing the user's ID. This token is sent back and stored in localStorage. An Axios request interceptor attaches this token to every API request. On the server, a `protect` middleware verifies the token and attaches the user to the request. When the app loads, it validates the stored token by calling the profile endpoint — if the token is expired, it auto-clears the session.

**Q: How do you handle errors?**
> On the server, I have a global error handler middleware that catches all errors and returns consistent JSON responses. It handles specific Mongoose errors (invalid IDs, duplicate emails, validation failures) and JWT errors. On the client, I have an ErrorBoundary component that catches React rendering crashes, a 401 interceptor that handles expired tokens, and a safeParse utility that prevents crashes from corrupted localStorage data.

**Q: Why didn't you use Redux?**
> The app only has two pieces of global state — authentication and cart. React Context API handles this cleanly without the extra boilerplate of Redux (actions, reducers, store setup). For a larger app with complex state interactions, I'd consider Redux Toolkit or Zustand.

**Q: How is your app secured?**
> Multiple layers: passwords are hashed with bcrypt, JWT tokens authenticate requests, route-level middleware separates public/private/admin access, the server calculates all prices from the database (never trusting the client), search inputs are regex-escaped to prevent ReDoS, CORS is restricted to the frontend origin, and login attempts are rate-limited to prevent brute force.

**Q: What's the difference between authentication and authorization in your app?**
> Authentication is "who are you?" — handled by the `protect` middleware which verifies the JWT token. Authorization is "what are you allowed to do?" — handled by the `admin` middleware (checks `isAdmin` flag) and ownership checks (e.g., users can only pay for their own orders, which returns 403 if someone else tries).

**Q: How does the search work?**
> I use Fuse.js for client-side fuzzy search. All products are loaded once, then Fuse.js builds an index and searches against name, brand, category, and description with weighted scoring. The search input is debounced by 300ms to avoid excessive processing. For the server-side, I also support regex search with keyword and category query parameters — and I escape the user input before using it in MongoDB regex queries to prevent ReDoS attacks.

**Q: What happens if two users try to buy the last item at the same time?**
> Currently, there's a potential race condition — both could pass the stock check before either order decrements the stock. I'm aware of this. In production, I'd solve it using MongoDB transactions or an atomic `findOneAndUpdate` with a `{ countInStock: { $gte: qty } }` condition, so only one order succeeds and the other gets a "not enough stock" error.

**Q: Why MongoDB instead of PostgreSQL?**
> For an e-commerce app, MongoDB's flexible schema works well because different product categories can have different attributes. The embedded reviews pattern avoids joins for common queries. For a project with complex relational data (like banking), I'd choose PostgreSQL.

**Q: How would you deploy this?**
> I've already set this up. The project has a multi-stage Dockerfile — Stage 1 builds the React frontend, Stage 2 sets up the production Node.js server with only production dependencies and copies the built frontend. Docker Compose orchestrates the app container and a MongoDB container with authentication enabled, health checks, and automatic restarts. I have a 3-job CI/CD pipeline in GitHub Actions: Job 1 lints and builds the frontend, Job 2 runs `npm audit` for security vulnerabilities, and Job 3 builds the Docker image using Buildx with GitHub Actions cache for faster builds. The Docker job only runs on `main` branch pushes after both lint and security jobs pass.

**Q: Walk me through your CI/CD pipeline.**
> It has three parallel-then-sequential jobs. The `build` job installs dependencies with npm caching, runs ESLint on the frontend, and builds the React production bundle — this catches syntax errors and build failures early. The `security` job runs `npm audit` on both client and server dependencies to flag known CVEs. These two run in parallel. The `docker` job depends on both — it only runs on pushes to main (not PRs). It uses Docker Buildx with GitHub Actions cache (`cache-from: type=gha`) to avoid rebuilding unchanged layers, then builds and tags the image with both the commit SHA and `latest`.

**Q: Explain your Docker setup.**
> The Dockerfile uses a multi-stage build to keep the production image small. Stage 1 uses `node:20-alpine` to install frontend dependencies and run `vite build`. Stage 2 starts fresh — installs only server production dependencies (`npm ci --omit=dev`), copies the server code and the built React `dist` folder from Stage 1. The final image doesn't have any dev dependencies, source maps, or build tools. Docker Compose adds MongoDB with authentication enabled (`MONGO_INITDB_ROOT_USERNAME/PASSWORD`), health checks on both services so the app container waits until MongoDB is ready, and `restart: unless-stopped` for resilience. MongoDB's port is not exposed to the host — only the app container can reach it through Docker's internal network.

---

## 15. Quick Numbers to Remember

| Metric | Value |
|---|---|
| Total files | 75 (47 client + 28 server) |
| API endpoints | 17 |
| Product categories | 35 |
| Seed products | 300+ |
| Database models | 3 (User, Product, Order) |
| React pages | 13 |
| Custom hooks | 4 |
| Context providers | 2 |
| Auth levels | 3 (Public, Private, Admin) |
