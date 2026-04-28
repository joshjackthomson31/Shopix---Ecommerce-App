# Shopix - MERN E-Commerce Platform

Full-stack e-commerce application built for the Indian market. Features 321 products across 35 categories with INR pricing.

## Features

- **Product Catalog** - Browse, search, and filter products by category
- **User Authentication** - Register, login with JWT-based sessions
- **Shopping Cart** - Add/remove items, quantity management, persistent cart
- **Checkout & Orders** - Place orders with shipping address, order history
- **Admin Dashboard** - Product CRUD, order management
- **Image Uploads** - Product image handling via Multer

## Tech Stack

**Frontend:** React 19 + Vite 8 + Tailwind CSS 4 + React Router 7  
**Backend:** Express 5 + Mongoose 9 + JWT + Multer  
**Database:** MongoDB

## Quick Start

```bash
# Install dependencies
npm install && npm run install-all

# Configure environment
cp server/.env.example server/.env  # Edit with your values

# Run development servers
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Environment Variables

```env
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/shopix
JWT_SECRET=<your-secret>
PORT=5000
```

## Project Structure

```
├── client/src/
│   ├── components/       # UI components
│   ├── pages/            # Route pages
│   │   ├── admin/        # Admin dashboard
│   │   ├── HomePage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── OrderPage.jsx
│   │   └── ProductDetailPage.jsx
│   ├── services/         # API layer
│   ├── context/          # React context (auth, cart)
│   └── hooks/            # Custom hooks
│
├── server/
│   ├── controllers/      # Request handlers
│   ├── models/           # Mongoose schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/           # API routes
│   ├── middleware/       # Auth, error handling
│   ├── utils/            # Helpers
│   └── config/           # DB connection
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/profile` | Get user profile (protected) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all (supports query params) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create (admin) |
| PUT | `/api/products/:id` | Update (admin) |
| DELETE | `/api/products/:id` | Delete (admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | Get user orders |
| GET | `/api/orders/:id` | Get single order |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload product image |

## Scripts

```bash
npm run dev          # Run both servers (concurrently)
npm run server       # Backend only (nodemon)
npm run client       # Frontend only (vite)
npm run install-all  # Install all dependencies
```

## Data Models

**User**
```javascript
{ name, email, password, isAdmin }
```

**Product**
```javascript
{ name, description, price, category, imageUrl, stock, rating }
```

**Order**
```javascript
{ user, items[], totalAmount, status, shippingAddress }
```

## Auth Flow

1. User registers/logs in → Server returns JWT
2. Client stores JWT in localStorage
3. Protected requests include `Authorization: Bearer <token>`
4. Middleware verifies token, attaches `req.user`

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.x | UI library |
| express | 5.x | Web framework |
| mongoose | 9.x | MongoDB ODM |
| jsonwebtoken | 9.x | Auth tokens |
| bcryptjs | 3.x | Password hashing |
| multer | 2.x | File uploads |
| axios | 1.x | HTTP client |
| react-router-dom | 7.x | Client routing |

## Notes

- ES Modules enabled (`"type": "module"`)
- Prices in INR (₹)
- Static files served from `/uploads`
- CORS enabled for cross-origin requests
