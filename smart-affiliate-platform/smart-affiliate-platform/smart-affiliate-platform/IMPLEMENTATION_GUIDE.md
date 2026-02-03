# 📋 DIS-CYRA - Complete Implementation Guide

## 🎯 Project Overview

**DIS-CYRA** is a production-ready MERN stack application that aggregates affiliate products from multiple e-commerce platforms with intelligent notification features.

### Project Statistics
- **46 Files Created**
- **Backend**: 18 files (controllers, models, routes, strategies, jobs, utilities)
- **Frontend**: 14 files (components, pages, context, utilities)
- **Configuration**: 14 files (package.json, config files, documentation)

---

## 📦 Backend Architecture (Node.js + Express + MongoDB)

### Core Components

#### 1. **Authentication System** (`authController.js`)

**Universal Login Endpoint**
```javascript
POST /api/auth/login
{
  email: string,
  password?: string (required only for admin)
}
```

**Flow Logic**:
- If email === ADMIN_EMAIL → Require password + bcrypt verification → Issue admin JWT
- Else → Passwordless login → Auto-register if not exists → Issue user JWT

**Additional Endpoints**:
- `POST /api/auth/forgot-password` - Generate 6-digit OTP (10-min expiry)
- `POST /api/auth/reset-password` - Verify OTP and reset password
- `GET /api/auth/me` - Get current authenticated user
- `PUT /api/auth/profile` - Update user preferences

#### 2. **Product Management** (`productController.js`)

**Features**:
- Add products with automatic strategy detection
- Retrieve products with advanced filtering (category, price, platform, search)
- Update product details and trigger notifications
- Delete products
- Track affiliate clicks
- Generate platform statistics

**Product Schema**:
```javascript
{
  title: String,
  description: String,
  category: String (indexed),
  tags: [String],
  price: Number,
  originalPrice: Number,
  discount: Number,
  platform: Enum (AMAZON, FLIPKART, MYNTRA, MEESHO, OTHER),
  affiliateLink: String,
  imageUrl: String,
  asin: String (Amazon-specific),
  strategy: Enum (AMAZON_API, MANUAL, LINK_ONLY),
  freshness: Enum (FRESH, STALE, ARCHIVED),
  views: Number (incremented on access),
  clicks: Number (incremented on affiliate click),
  conversions: Number,
  lastUpdated: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **Strategy Pattern** (`strategies/`)

**Purpose**: Handle platform-specific product data fetching and storage

**AmazonStrategy.js**
```javascript
// Uses PA-API for real-time data
// Fetches: title, price, originalPrice, discount, imageUrl, description
// Stores ASIN for daily price updates
// Strategy type: AMAZON_API
```

**NonApiStrategy.js**
```javascript
// Manual data entry by admin
// Supports Flipkart, Myntra, other platforms
// Requires admin to provide all details
// Strategy type: MANUAL
```

**MeeshoStrategy.js**
```javascript
// Link-only strategy
// Stores affiliate link for redirection only
// No price tracking
// Strategy type: LINK_ONLY
```

**StrategyResolver.js**
```javascript
// Detects platform from affiliate URL
// Returns appropriate strategy instance
// Usage: StrategyResolver.getStrategy(affiliateLink)
```

#### 4. **Notify Me System** (`userRequestController.js`)

**User Request Flow**:
1. User submits natural language query: "I want a laptop under ₹50,000 from Amazon"
2. NLP Parser extracts:
   - Category: "Laptops"
   - Tags: ["laptop", "affordable"]
   - maxPrice: 50000
   - Platforms: ["AMAZON"]
3. System finds existing matching products
4. Sends email notifications to user
5. Stores request for future product matches

**UserRequest Schema**:
```javascript
{
  userId: ObjectId (ref: User),
  userEmail: String,
  naturalLanguageQuery: String,
  parsedTags: {
    category: String (indexed),
    tags: [String],
    maxPrice: Number,
    minPrice: Number,
    platforms: [String]
  },
  matchedProducts: [ObjectId],
  isFulfilled: Boolean,
  notificationsSent: [{ productId, sentAt }],
  status: Enum (ACTIVE, FULFILLED, EXPIRED, CANCELLED),
  expiresAt: Date (30 days default),
  createdAt: Date,
  updatedAt: Date
}
```

**Automatic Notification Logic**:
When admin adds/updates a product:
1. Find unfulfilled UserRequests matching category
2. Validate price constraints (min/max)
3. Validate platform constraints
4. Send email with product details
5. Update notification tracking
6. Mark as fulfilled after 3 notifications

#### 5. **Background Jobs** (`jobs/`)

**amazonPriceUpdater.js**
- **Schedule**: Daily at midnight (0 0 * * *)
- **Action**: Fetches latest prices from Amazon PA-API
- **Updates**: All products with platform="AMAZON" and strategy="AMAZON_API"

**priceFreshnessManager.js**
- **Schedule**: Daily at 1 AM (0 1 * * *)
- **Actions**:
  - Mark as STALE if lastUpdated > 30 days
  - Archive if lastUpdated > 60 days
  - Maintains data freshness status

#### 6. **Utilities**

**mailer.js**
```javascript
// sendOTPEmail(email, otp)
// sendProductNotification(userEmail, product)
// sendWelcomeEmail(email, userName)
// Uses Nodemailer + Gmail SMTP
```

**tokenUtils.js**
```javascript
// generateToken(user) - Creates JWT with 7-day expiry
// verifyToken(token) - Validates JWT
```

**detectPlatform.js**
```javascript
// detectPlatform(url) - Returns AMAZON|FLIPKART|MYNTRA|MEESHO|OTHER
// extractAsin(url) - Extracts ASIN from Amazon URL
// getStrategy(platform) - Returns strategy type
```

**nlpParser.js**
```javascript
// parseNLPQuery(query) - Parses natural language into structured data
// Extracts: category, tags, minPrice, maxPrice, platforms
// Returns: { category, tags, maxPrice, minPrice, platforms }
```

#### 7. **Middleware** (`middleware/authMiddleware.js`)

```javascript
// authMiddleware - Verifies JWT and attaches user to request
// adminOnly - Checks if user.role === "admin"
// userOnly - Checks if user.role === "user"
```

---

## ⚛️ Frontend Architecture (React + Tailwind CSS)

### Core Components

#### 1. **AuthContext.js** - Global State Management

```javascript
// useAuth() hook provides:
{
  user,              // Current user object
  token,             // JWT token
  loading,           // Initial load state
  isLoggedIn,        // Boolean
  isAdmin,           // Boolean
  login(email, password),
  logout(),
  forgotPassword(email),
  resetPassword(email, otp, newPassword),
  updateProfile(data)
}
```

#### 2. **Pages**

**HomePage.js**
- Hero section with features
- Feature cards (Curated Selection, Notify Me, Best Prices)
- CTA buttons to browse/notify

**LoginPage.js**
- Email input
- Conditional password input (for admin)
- Admin toggle checkbox
- Error/success messages

**ProductsPage.js**
- Search bar with real-time filtering
- Category filter
- Price range filters (min/max)
- Platform selector
- Responsive product grid
- Pagination
- "Buy Now" CTA with affiliate tracking

**NotifyMePage.js**
- Textarea for natural language query
- Displays existing requests with status
- Cancel request functionality
- Shows matched product count

**ProfilePage.js**
- Name and phone fields
- Category preferences (checkboxes)
- Max price budget
- Account information display

**AdminDashboard.js**
- Total products, views, clicks statistics
- Platform-wise breakdown (count, avg price, views)
- Request status breakdown
- Top requested categories
- Quick action buttons

#### 3. **Reusable Components**

**Navbar.js**
- Logo/Brand
- Navigation links (conditional by role)
- Logout button
- Responsive mobile menu

**ProtectedRoute.js**
- Checks authentication status
- Enforces admin-only routes
- Shows loading spinner
- Redirects to login if needed

#### 4. **Utilities**

**api.js** - Axios Configuration
```javascript
// Base URL: http://localhost:5000/api
// Interceptors:
// - Request: Adds JWT token to Authorization header
// - Response: Handles 401 errors, clears token, redirects to login
```

#### 5. **Styling**

**Tailwind CSS Configuration**
- Custom color palette (primary: green, secondary: blue)
- Responsive breakpoints (mobile-first)
- Custom utilities in index.css

**Custom CSS Classes**
- `.btn-primary`, `.btn-secondary`, `.btn-danger` - Button variants
- `.card` - Card component with shadow/hover
- `.input-field` - Form input styling
- `.badge`, `.badge-primary`, `.badge-secondary`, `.badge-success` - Badge variants
- `.container` - Max-width container with padding

---

## 🔐 Authentication Flow

### Sequence Diagram

```
User Browser                Backend               Database
    │                           │                     │
    ├─ POST /api/auth/login ──→ │                     │
    │ (email, password?)        │                     │
    │                           ├─ Check admin email  │
    │                           │                     │
    │                    ┌──────┴─ Yes ──────────┐   │
    │                    │ Hash verify password   │───┼─→ [Fetch User]
    │                    │ Generate admin JWT     │   │
    │                    │ Send back token        │   │
    │                    └──────┬────────────────┘   │
    │                           │                     │
    │  ← JWT + User Object ──── │                     │
    │                           │                     │
    │                    ┌──────┴─ No ───────────┐   │
    │                    │ Check if user exists  │───┼─→ [Fetch User]
    │                    │ If not, auto-register │───┼─→ [Create User]
    │                    │ Generate user JWT     │   │
    │                    │ Send welcome email    │   │
    │                    └──────┬────────────────┘   │
    │                           │                     │
    │  ← JWT + User Object ──── │                     │
    │                           │                     │
```

### JWT Token Content
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "admin|user",
  "iat": 1234567890,
  "exp": 1234654290
}
```

---

## 📊 Data Models

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required for admin),
  role: String (enum: "user", "admin"),
  name: String,
  phone: String,
  otp: String (temporary for reset),
  otpExpiry: Date,
  isEmailVerified: Boolean,
  preferences: {
    categories: [String],
    maxPrice: Number,
    platforms: [String]
  },
  timestamps: { createdAt, updatedAt }
}
```

### Product Model
```javascript
{
  title: String (required),
  description: String,
  category: String (required, indexed),
  tags: [String],
  price: Number (required),
  originalPrice: Number,
  discount: Number,
  platform: Enum (required),
  affiliateLink: String (required),
  imageUrl: String,
  asin: String (unique for Amazon),
  strategy: Enum (AMAZON_API, MANUAL, LINK_ONLY),
  freshness: Enum (FRESH, STALE, ARCHIVED),
  views: Number,
  clicks: Number,
  conversions: Number,
  createdBy: ObjectId (ref: User),
  lastUpdated: Date (indexed),
  timestamps: { createdAt, updatedAt }
}
```

### UserRequest Model
```javascript
{
  userId: ObjectId (ref: User),
  userEmail: String,
  naturalLanguageQuery: String,
  parsedTags: {
    category: String (indexed),
    tags: [String],
    maxPrice: Number,
    minPrice: Number,
    platforms: [String]
  },
  matchedProducts: [ObjectId],
  isFulfilled: Boolean (indexed),
  notificationsSent: [{ productId, sentAt }],
  status: Enum (ACTIVE, FULFILLED, EXPIRED, CANCELLED),
  expiresAt: Date (indexed),
  timestamps: { createdAt, updatedAt }
}
```

---

## 🎓 Design Patterns

### 1. Strategy Pattern
**Purpose**: Encapsulate platform-specific logic
```javascript
// Abstract Strategy interface
class Strategy {
  fetchProductData(productId) {}
  formatProductData(data) {}
  canHandle(platform) {}
}

// Concrete Strategies
class AmazonStrategy extends Strategy { ... }
class NonApiStrategy extends Strategy { ... }
class MeeshoStrategy extends Strategy { ... }

// Context
class StrategyResolver {
  static getStrategy(affiliateLink) { ... }
}
```

### 2. Context API Pattern (Frontend)
**Purpose**: Global state management without Redux
```javascript
// Provider wraps app
<AuthProvider>
  <App />
</AuthProvider>

// Hook for consumption
const { user, token, login, logout } = useAuth();
```

### 3. Middleware Pattern
**Purpose**: Cross-cutting concerns (authentication, logging)
```javascript
app.use(authMiddleware);  // JWT verification
app.use(adminOnly);       // Role checking
```

### 4. Repository Pattern
**Purpose**: Data access abstraction
```javascript
// Models act as repositories
User.findOne({ email })
Product.find({ category, price })
UserRequest.findByIdAndUpdate()
```

---

## 🔌 API Reference

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Universal login |
| POST | `/api/auth/forgot-password` | No | Request OTP |
| POST | `/api/auth/reset-password` | No | Reset with OTP |
| GET | `/api/auth/me` | Yes | Current user |
| PUT | `/api/auth/profile` | Yes | Update profile |

### Product Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/products` | No | - | List products |
| GET | `/api/products/:id` | No | - | Get product |
| POST | `/api/products` | Yes | Admin | Add product |
| PUT | `/api/products/:id` | Yes | Admin | Update |
| DELETE | `/api/products/:id` | Yes | Admin | Delete |
| POST | `/api/products/:id/click` | No | - | Track click |
| GET | `/api/products/admin/stats` | Yes | Admin | Statistics |

### Notify Me Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/requests` | Yes | User | Submit request |
| GET | `/api/requests/user/my-requests` | Yes | User | My requests |
| DELETE | `/api/requests/:id` | Yes | User | Cancel request |
| GET | `/api/requests/admin/all` | Yes | Admin | All requests |
| GET | `/api/requests/admin/stats` | Yes | Admin | Statistics |

---

## 🚀 Deployment Checklist

### Backend (Node.js)
- [ ] Environment variables configured
- [ ] MongoDB Atlas setup
- [ ] Gmail App Password for email
- [ ] Amazon PA-API credentials
- [ ] JWT secret generated
- [ ] CORS origin set to frontend URL
- [ ] Deployed to Heroku/Railway/Render

### Frontend (React)
- [ ] React App built (`npm run build`)
- [ ] API URL points to deployed backend
- [ ] Deployed to Vercel/Netlify
- [ ] Environment variables set

### Production Configuration
```bash
# Backend .env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=<strong-secret>
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=<hashed>
EMAIL_USER=noreply@company.com
EMAIL_PASSWORD=<app-password>
PORT=process.env.PORT
FRONTEND_URL=https://affiliate-app.com
```

---

## 📈 Performance Optimizations

### Database
- Indexed fields: `category`, `lastUpdated`, `isFulfilled`, `platform`, `email`
- Compound indices for common queries
- Pagination (20 items/page)

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Lazy loading for product images
- Debounced search input

### Backend
- Request caching (future)
- Query optimization
- Rate limiting (future)
- Compression middleware

---

## 🧪 Testing Scenarios

### User Flow
1. User visits home page
2. User logs in with email (auto-registers)
3. User browses products with filters
4. User submits Notify Me request
5. Receives email when matching product added
6. Clicks Buy Now → redirects to affiliate link

### Admin Flow
1. Admin logs in with email + password
2. Views dashboard with statistics
3. Adds new product (strategy detection)
4. Sees notifications for matching requests
5. Manages products (CRUD operations)

### Background Jobs
1. Daily: Amazon prices updated
2. Daily: Products marked stale/archived
3. On new product: Matching requests notified

---

## 📚 File Organization

```
Frontend Organization:
- Pages: One per route
- Components: Reusable UI elements
- Context: Global state
- Utils: Helpers and API client

Backend Organization:
- Controllers: Business logic
- Models: Data schemas
- Routes: Endpoint definitions
- Middleware: Request processing
- Strategies: Platform logic
- Utils: Helpers
- Jobs: Background tasks
```

---

## 🎯 Key Takeaways

✅ **Scalable Architecture**: Strategy pattern for infinite platform support  
✅ **Legal Compliance**: No web scraping, official APIs only  
✅ **User-Centric**: Notify Me system with NLP  
✅ **Admin Control**: Dedicated dashboard and workflows  
✅ **Production-Ready**: Error handling, security, optimization  
✅ **Developer-Friendly**: Clear structure, documented code  
✅ **Full-Stack MERN**: MongoDB, Express, React, Node.js  

---

## 📞 Support & Next Steps

1. **Setup**: Follow QUICK_START.md
2. **Development**: Refer to individual README files
3. **API Testing**: Use Postman/Insomnia with provided endpoints
4. **Deployment**: Use deployment checklist above
5. **Customization**: Extend strategies for new platforms

---

**Version**: 1.0.0  
**Created**: January 9, 2026  
**Stack**: MERN (MongoDB + Express + React + Node.js)  
**Status**: ✅ Production Ready
