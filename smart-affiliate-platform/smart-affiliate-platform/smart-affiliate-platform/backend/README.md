# DIS-CYRA - Backend

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### 3. Start MongoDB
Ensure MongoDB is running on `localhost:27017` or update `MONGO_URI` in `.env`

### 4. Initialize Admin User
```bash
# Create admin account (one-time setup)
node scripts/initAdmin.js
```

### 5. Run Server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Universal login (admin + user)
- `POST /api/auth/forgot-password` - Request OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Add product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `POST /api/products/:id/click` - Track affiliate click
- `GET /api/products/admin/stats` - Product statistics (admin only)

### Notify Me System
- `POST /api/requests` - Submit notify request (user)
- `GET /api/requests/user/my-requests` - Get user requests (user)
- `DELETE /api/requests/:id` - Cancel request (user)
- `GET /api/requests/admin/all` - All requests (admin)
- `GET /api/requests/admin/stats` - Request statistics (admin)

## Key Features

### Universal Authentication
- Admin login requires password (bcrypt verified)
- User login is passwordless (auto-register)
- JWT token-based authorization

### Strategy Pattern
- **AmazonStrategy**: Uses PA-API for auto price updates
- **NonApiStrategy**: Manual data entry for Flipkart, Myntra, etc.
- **MeeshoStrategy**: Link-only redirection

### Notify Me System
- Natural Language Processing for user queries
- Automatic category/tag/price extraction
- Email notifications on product match
- Request fulfillment tracking

### Background Jobs
- Amazon price updates (daily cron at midnight)
- Product freshness management (daily cron at 1 AM)

## Architecture

```
Backend/
├── controllers/      # Business logic
├── models/          # MongoDB schemas
├── routes/          # API endpoints
├── middleware/      # Auth & validation
├── strategies/      # Strategy pattern
├── utils/           # Helpers
├── jobs/            # Cron tasks
└── server.js        # Entry point
```

## Security

- JWT authentication
- bcryptjs password hashing
- OTP-based password reset
- Admin email verification
- CORS enabled
