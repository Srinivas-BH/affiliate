# Backend Authentication Controller

Comprehensive authentication implementation with universal login, OTP-based password reset, and user profile management.

## Core Features

### 1. Universal Login Endpoint

**Route**: `POST /api/auth/login`

#### Admin Login
```javascript
{
  "email": "admin@smartaffiliate.com",
  "password": "securePassword123"
}
// Returns: { token: "jwt_token", role: "admin", user: {...} }
```

- Email must match `ADMIN_EMAIL` environment variable
- Password verified using bcryptjs
- Issues admin JWT token
- Admin can only login with valid password

#### User Login (Passwordless)
```javascript
{
  "email": "user@example.com"
  // No password required
}
// Returns: { token: "jwt_token", role: "user", user: {...} }
```

- No password required
- Auto-registers user if not exists
- Issues user JWT token
- One-click login experience

### 2. Forgot Password - OTP Generation

**Route**: `POST /api/auth/forgot-password`

```javascript
{
  "email": "user@example.com"
}
```

- Generates 6-digit random OTP
- Sets OTP expiry to 10 minutes
- Sends OTP via email (Nodemailer + Gmail SMTP)
- Returns success message (doesn't reveal if user exists)

### 3. Password Reset with OTP

**Route**: `POST /api/auth/reset-password`

```javascript
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword"
}
```

- Validates OTP matches and hasn't expired
- Hashes new password with bcryptjs
- Clears OTP from database
- User can login with new password

### 4. Get Current User

**Route**: `GET /api/auth/me` (Protected)

```javascript
// Returns: { user: { id, email, role, name, phone, preferences, ... } }
```

- Requires valid JWT token
- Returns user profile without sensitive data

### 5. Update User Profile

**Route**: `PUT /api/auth/profile` (Protected)

```javascript
{
  "name": "John Doe",
  "phone": "+91 9876543210",
  "preferences": {
    "categories": ["Electronics", "Mobile Phones"],
    "maxPrice": 50000
  }
}
```

- Updates user preferences
- Used for "Notify Me" matching
- Returns updated user object

## Authentication Flow Diagram

```
User Login
    ↓
[Check if Admin Email?]
    ├─→ YES → Require Password → Verify with bcrypt → Issue Admin JWT
    └─→ NO  → Auto-register → Issue User JWT
```

## JWT Token Structure

```javascript
{
  id: "user_id",
  email: "user@example.com",
  role: "user" | "admin",
  iat: 1234567890,
  exp: 1234654290
}
```

## Implementation Details

### Password Hashing
- Using bcryptjs with salt rounds = 10
- Passwords hashed before saving to DB
- comparePassword method for verification

### OTP Generation
```javascript
// 6-digit OTP: 100000-999999
generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
```

### Email Configuration
- Uses Nodemailer with Gmail SMTP
- Requires Gmail App Password (2FA enabled)
- HTML email templates for professional appearance

### JWT Management
- Secret stored in environment variable
- Default expiry: 7 days
- Token sent via Authorization Bearer header
- Automatic logout on token expiry (frontend)

## Error Handling

- 400: Missing required fields
- 401: Invalid credentials / Expired OTP
- 404: User not found
- 500: Server error with descriptive message

## Security Best Practices

✅ Passwords hashed with bcryptjs  
✅ OTP has 10-minute expiry  
✅ JWT tokens signed with secret  
✅ No password sent in API responses  
✅ Email addresses validated  
✅ Rate limiting ready (can add with express-rate-limit)  
✅ CORS enabled for frontend domain  

## Database Schema

### User Model
```javascript
{
  email: String (unique, lowercase),
  password: String (hashed, nullable),
  role: "user" | "admin",
  name: String,
  phone: String,
  otp: String,
  otpExpiry: Date,
  isEmailVerified: Boolean,
  preferences: {
    categories: [String],
    maxPrice: Number,
    platforms: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Middleware Usage

```javascript
// Protect routes with authentication
router.get("/me", authMiddleware, getCurrentUser);

// Admin-only routes
router.post("/products", authMiddleware, adminOnly, addProduct);

// User-only routes
router.post("/requests", authMiddleware, userOnly, submitRequest);
```

## Testing Endpoints

### Test Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartaffiliate.com",
    "password": "adminPassword"
  }'
```

### Test User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Test Forgot Password
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Test Reset Password
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456",
    "newPassword": "newPassword123"
  }'
```

## Response Examples

### Successful Login
```json
{
  "success": true,
  "message": "User login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "user",
    "name": "John Doe"
  }
}
```

### Error Response
```json
{
  "error": "Invalid admin credentials"
}
```

## Integration with Frontend

### React Authentication Context
```javascript
const { login, logout, user, token } = useAuth();

// Admin login
await login("admin@example.com", "password");

// User login
await login("user@example.com");

// Forgot password
await forgotPassword("user@example.com");

// Reset password
await resetPassword("user@example.com", "123456", "newPassword");
```

### Axios Interceptor
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

**This authentication system provides a robust foundation for the DIS-CYRA with support for both admin and user workflows.**
