# DIS-CYRA

A full-stack MERN application for aggregating affiliate products from multiple e-commerce platforms with intelligent notification system.

## 🎯 Project Overview

**DIS-CYRA** is an enterprise-grade platform that:
- Aggregates products from Amazon, Flipkart, Myntra, Meesho, and other platforms
- Uses official APIs (Amazon PA-API) and admin-managed data (NO web scraping)
- Provides intelligent "Notify Me" feature with NLP-based request parsing
- Separates Admin and User dashboards with role-based access control
- Implements the Strategy Pattern for scalable platform integration
- Includes automated price updates and freshness management

## 📋 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Email**: Nodemailer (Gmail SMTP)
- **Scheduling**: node-cron
- **API**: RESTful architecture

### Frontend
- **Library**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context API

## 🏗️ Project Structure

```
smart-affiliate-platform/
├── backend/
│   ├── controllers/
│   │   ├── authController.js          # Login, forgot password, OTP reset
│   │   ├── productController.js       # Product CRUD + notifications
│   │   └── userRequestController.js   # Notify Me requests
│   ├── strategies/
│   │   ├── AmazonStrategy.js          # PA-API integration
│   │   ├── NonApiStrategy.js          # Manual data entry
│   │   ├── MeeshoStrategy.js          # Link-only strategy
│   │   └── StrategyResolver.js        # Platform detection
│   ├── models/
│   │   ├── User.js                    # User schema + auth methods
│   │   ├── Product.js                 # Product schema with indices
│   │   └── UserRequest.js             # Notify Me requests schema
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT verification + role checks
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── userRequestRoutes.js
│   ├── jobs/
│   │   ├── amazonPriceUpdater.js      # Daily cron job
│   │   └── priceFreshnessManager.js   # Staleness management
│   ├── utils/
│   │   ├── mailer.js                  # Email sending
│   │   ├── tokenUtils.js              # JWT generation/verification
│   │   ├── detectPlatform.js          # Platform detection
│   │   └── nlpParser.js               # Natural language parsing
│   ├── server.js                      # Express app setup
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js              # Navigation bar
│   │   │   └── ProtectedRoute.js      # Role-based routing
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── ProductsPage.js
│   │   │   ├── NotifyMePage.js
│   │   │   ├── ProfilePage.js
│   │   │   └── AdminDashboard.js
│   │   ├── context/
│   │   │   └── AuthContext.js         # Authentication state
│   │   ├── utils/
│   │   │   └── api.js                 # Axios interceptors
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── README.md
│
├── README.md
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- Git

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# App runs on http://localhost:3000
```

## 🔐 Authentication System

### Universal Login Endpoint: `/api/auth/login`

#### Admin Flow
```javascript
{
  "email": "admin@smartaffiliate.com",
  "password": "hashed_password"
}
// Returns admin JWT with "admin" role
```

#### User Flow
```javascript
{
  "email": "user@example.com"
  // No password required
}
// Auto-registers if not exists, returns user JWT
```

### Additional Auth Endpoints

- `POST /api/auth/forgot-password` - Send 6-digit OTP via email
- `POST /api/auth/reset-password` - Verify OTP and reset password
- `GET /api/auth/me` - Get current authenticated user
- `PUT /api/auth/profile` - Update user preferences

## 📦 Strategy Pattern Implementation

The Strategy Pattern enables platform-specific behavior:

```javascript
// Platform detection → Strategy assignment
const strategy = StrategyResolver.getStrategy(affiliateLink);
// Returns: AmazonStrategy | NonApiStrategy | MeeshoStrategy
```

### Amazon Strategy
- Uses PA-API for real-time price fetching
- Daily cron updates at midnight
- Stores ASIN for product identification
- Strategy type: `AMAZON_API`

### Non-API Strategy
- Manual data entry by admin
- Excel bulk upload support (future)
- Works for Flipkart, Myntra, etc.
- Strategy type: `MANUAL`

### Meesho Strategy
- Link-only redirection
- No price tracking
- Minimal data storage
- Strategy type: `LINK_ONLY`

## 🔔 Notify Me System

### User Submission
```javascript
POST /api/requests
{
  "query": "I want a budget laptop under ₹50,000 from Amazon"
}
```

### NLP Processing
- Extracts category, tags, max price, platforms
- Regex-based parsing (production: use compromise.js)
- Saves structured query in UserRequest collection

### Automatic Notifications
When admin adds/updates a product:
1. System finds matching UserRequests
2. Validates price and platform constraints
3. Sends email notification via Nodemailer
4. Updates notification tracking
5. Marks request as fulfilled (after 3 notifications)

## 📊 Admin Dashboard Features

- **Product Statistics**: Count, avg price, views, clicks by platform
- **Request Analytics**: Status breakdown, top requested categories
- **Manage Products**: Add, update, delete products
- **Monitor Requests**: View all Notify Me requests
- **Export Reports**: Generate performance data (feature)

## ⏰ Background Jobs

### Amazon Price Updater
```bash
Schedule: 0 0 * * * (Daily at midnight)
Action: Fetches latest prices for all Amazon products via PA-API
```

### Price Freshness Manager
```bash
Schedule: 0 1 * * * (Daily at 1 AM)
Action: Marks products stale (30+ days), archives (60+ days)
```

## 🛡️ Security Features

- JWT-based stateless authentication
- bcryptjs password hashing (admin only)
- OTP-based password reset (6-digit, 10-min expiry)
- CORS enabled with frontend URL validation
- Role-based access control (admin/user)
- Protected API routes with authMiddleware

## 📧 Email Configuration

### Gmail SMTP Setup
1. Enable 2-factor authentication on Gmail
2. Generate App Password
3. Add to `.env`:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

### Email Templates
- Welcome email on first login
- OTP email for password reset
- Product match notification with details

## 🎓 Architecture Decisions

### Why Strategy Pattern?
- **Scalability**: Add new platforms by implementing new strategies
- **Separation of Concerns**: Platform logic isolated from core business
- **Maintainability**: Changes to one strategy don't affect others

### Why No Web Scraping?
- ✅ **Legal Compliance**: Respects platform ToS
- ✅ **System Stability**: No bot detection/IP blocks
- ✅ **Data Accuracy**: Official APIs guarantee fresh data
- ✅ **Sustainable**: Works reliably long-term

### Why Only Amazon Auto-Updates?
- Amazon provides official PA-API with affiliate support
- Other platforms don't offer affiliate data APIs
- Admin-managed data provides quality control
- Prevents Terms of Service violations

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📝 Environment Variables

### Backend `.env`
```
MONGO_URI=mongodb://localhost:27017/smart-affiliate
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@smartaffiliate.com
ADMIN_PASSWORD=hashed_password
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password
AMAZON_ACCESS_KEY=your_key
AMAZON_SECRET_KEY=your_secret
AMAZON_PARTNER_TAG=your_tag
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚢 Deployment

### Backend (Heroku, Railway, Render)
1. Set environment variables in dashboard
2. MongoDB Atlas for cloud database
3. Gmail App Password for email
4. Amazon PA-API credentials

### Frontend (Vercel, Netlify)
1. Set `REACT_APP_API_URL` environment variable
2. Deploy from GitHub main branch
3. Auto-rebuilds on commits

## 📚 API Documentation

### Authentication
- `POST /api/auth/login` - Universal login
- `POST /api/auth/forgot-password` - Request OTP
- `POST /api/auth/reset-password` - Reset with OTP
- `GET /api/auth/me` - Current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Products
- `GET /api/products` - Get all products (paginated, filterable)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Add product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `POST /api/products/:id/click` - Track affiliate click
- `GET /api/products/admin/stats` - Statistics (admin only)

### Notify Me
- `POST /api/requests` - Submit notify request (user)
- `GET /api/requests/user/my-requests` - User's requests (user)
- `DELETE /api/requests/:id` - Cancel request (user)
- `GET /api/requests/admin/all` - All requests (admin)
- `GET /api/requests/admin/stats` - Statistics (admin)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 📞 Support

For issues, questions, or suggestions, please create a GitHub issue.

## 🎯 Future Roadmap

- [ ] Amazon PA-API actual integration
- [ ] Excel bulk upload for products
- [ ] Advanced NLP using compromise.js
- [ ] Payment integration for premium features
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSocket)
- [ ] Analytics dashboard with charts
- [ ] User reviews and ratings
- [ ] Wishlist feature
- [ ] Price history graphs

---

**Built with ❤️ by the DIS-CYRA Team**
