# DIS-CYRA - Complete Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Gmail account (for email notifications)
- Amazon Associates account (optional, for PA-API)

## Step 1: Clone and Install Dependencies

```bash
# Navigate to project directory
cd smart-affiliate-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Configure Environment Variables

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/smart-affiliate
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-affiliate

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Admin Configuration
ADMIN_EMAIL=bhsrinivas94@gmail.com

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Amazon PA-API Configuration (Optional)
AMAZON_ACCESS_KEY=your_amazon_access_key
AMAZON_SECRET_KEY=your_amazon_secret_key
AMAZON_ASSOCIATE_TAG=your_associate_tag
AMAZON_REGION=IN
```

### Gmail SMTP Setup

1. Go to your Google Account: https://myaccount.google.com/
2. Enable **2-Step Verification**
3. Generate an **App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "DIS-CYRA"
   - Copy the generated 16-character password
   - Use this password in `EMAIL_PASSWORD`

### Amazon PA-API Setup (Optional)

1. Sign up for Amazon Associates: https://affiliate-program.amazon.com/
2. Complete the application process
3. Once approved, go to Product Advertising API section
4. Create credentials:
   - Access Key ID
   - Secret Access Key
   - Associate Tag
5. Add these to your `.env` file

## Step 3: Initialize Database and Admin Account

```bash
# Make sure MongoDB is running
# For local MongoDB:
mongod

# Initialize admin account
cd backend
node scripts/initAdmin.js
```

This will create the admin account with:
- Email: `bhsrinivas94@gmail.com`
- Password: `SBHaff$2706`

**⚠️ IMPORTANT**: Change the password after first login!

## Step 4: Start the Application

### Terminal 1 - Backend Server

```bash
cd backend
npm run dev
# or
npm start
```

Backend will run on: http://localhost:5000

### Terminal 2 - Frontend Server

```bash
cd frontend
npm start
```

Frontend will run on: http://localhost:3000

## Step 5: Verify Installation

1. **Backend Health Check**: http://localhost:5000/api/health
2. **Frontend**: http://localhost:3000
3. **Admin Login**: Use `bhsrinivas94@gmail.com` and password `SBHaff$2706`
4. **User Login**: Enter any email (passwordless)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Universal login (admin/user)
- `POST /api/auth/forgot-password` - Request OTP
- `POST /api/auth/reset-password` - Reset with OTP
- `GET /api/auth/me` - Get current user
- `POST /api/auth/setup-admin` - Setup admin account

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Add product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `POST /api/products/:id/click` - Track affiliate click

### Notify Me
- `POST /api/requests` - Submit notify request
- `GET /api/requests/user/my-requests` - Get user's requests
- `DELETE /api/requests/:id` - Cancel request

## Features

### ✅ Universal Authentication
- Single login endpoint
- Admin: Email + Password (bcrypt)
- User: Passwordless auto-register

### ✅ Strategy Pattern
- **Amazon**: PA-API auto-fetch + 24h cron updates
- **Non-API Platforms**: Manual data entry
- **Meesho**: Link-only strategy

### ✅ Notify Me System
- Natural language query parsing
- Automatic email notifications
- Product matching algorithm

### ✅ Automated Jobs
- Daily Amazon price updates (midnight)
- Price freshness management (1 AM)
- Automatic stale/archive marking

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGO_URI` in `.env`
- For Atlas, verify network access settings

### Email Not Sending
- Verify Gmail App Password is correct
- Check 2-Step Verification is enabled
- Ensure `EMAIL_USER` and `EMAIL_PASSWORD` are set

### Amazon PA-API Not Working
- Verify credentials in `.env`
- Check Associate account status
- System will fallback to mock data if API fails

### Admin Login Fails
- Run `node scripts/initAdmin.js` again
- Check `ADMIN_EMAIL` matches `.env`
- Verify password is correct

## Development

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start with nodemon (auto-reload)
```

### Frontend Scripts
```bash
npm start          # Start development server
npm run build      # Build for production
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use strong `JWT_SECRET`
3. Configure production MongoDB
4. Set up proper CORS origins
5. Use environment-specific email credentials
6. Enable HTTPS
7. Set up process manager (PM2)

## Support

For issues or questions, refer to:
- `README.md` - Project overview
- `ENV_SETUP.md` - Environment configuration
- `ADMIN_SETUP_GUIDE.md` - Admin setup details
