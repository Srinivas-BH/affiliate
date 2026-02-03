# Admin Account Setup Guide

## Overview

The DIS-CYRA implements a secure admin account setup with the following features:

- **Default Admin Email**: `bhsrinivas94@gmail.com` (configured in `.env`)
- **Secure Password Requirements**: Strong password validation
- **One-time Setup**: Admin account can only be initialized once
- **Password Reset**: Available via forgot-password flow after initial setup

## Features

### 1. Default Admin Email

The admin email is set to `bhsrinivas94@gmail.com` in the `.env` file:

```env
ADMIN_EMAIL=bhsrinivas94@gmail.com
```

This email is:
- Fixed and cannot be changed during setup
- Used for admin login
- Pre-configured in the database
- Available as read-only in the setup form

### 2. Secure Password Requirements

The admin password must meet the following security criteria:

- **Minimum Length**: At least 12 characters
- **Uppercase Letters**: At least one A-Z character
- **Lowercase Letters**: At least one a-z character
- **Numbers**: At least one 0-9 digit
- **Special Characters**: At least one special character (!@#$%^&*()_+-=[]{};':"\\|,.<>/?

Example of a valid password:
```
AdminPass@123456
MySecure#Admin2024
```

### 3. One-Time Setup

The setup process is designed to be executed only once:

- **First Time**: Admin account is created with the provided password
- **Already Setup**: If attempting to setup again, an error message is displayed
- **Reset Password**: Use the forgot-password flow to change the password after setup

## Setup Process

### Step 1: Navigate to Admin Setup Page

URL: `http://localhost:3001/admin/setup` (or `http://localhost:3000/admin/setup`)

### Step 2: Fill in Setup Form

1. **Admin Email** (Read-only): `bhsrinivas94@gmail.com`
2. **Admin Name**: Enter your name (default: "Admin")
3. **Secure Password**: Create a strong password meeting all requirements
4. **Confirm Password**: Re-enter the password to confirm

### Step 3: Verify Password Requirements

The form displays real-time password strength indicators:
- ✓ Checkmark = requirement met
- ○ Circle = requirement not met

All requirements must be met before the setup button is enabled.

### Step 4: Submit Setup

Click "🚀 Setup Admin Account" to initialize the admin account.

Success message: "Admin account setup successfully! Redirecting to login..."

## Backend Implementation

### New Endpoints

#### 1. Setup Admin Account

**POST** `/api/auth/setup-admin`

Request Body:
```json
{
  "password": "AdminPass@123456",
  "name": "Administrator"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "Admin account setup successfully",
  "admin": {
    "id": "user_id",
    "email": "bhsrinivas94@gmail.com",
    "name": "Administrator",
    "role": "admin"
  }
}
```

Response (Error - Weak Password):
```json
{
  "error": "Password must contain: at least 12 characters, uppercase letters, lowercase letters, numbers, and special characters",
  "requirements": {
    "minLength": false,
    "hasUpperCase": true,
    "hasLowerCase": true,
    "hasNumbers": true,
    "hasSpecialChars": false
  }
}
```

Response (Error - Already Setup):
```json
{
  "error": "Admin account already initialized. Use forgot-password to reset."
}
```

#### 2. Check Admin Setup Status

**GET** `/api/auth/admin-status`

Response:
```json
{
  "success": true,
  "isAdminSetup": true,
  "adminEmail": "bhsrinivas94@gmail.com"
}
```

### Password Validation Function

```javascript
const validatePasswordStrength = (password) => {
  const requirements = {
    minLength: password.length >= 12,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const isStrong = Object.values(requirements).every((req) => req);

  return {
    isStrong,
    requirements,
    message: !isStrong ? "Password requirements not met" : null,
  };
};
```

## Frontend Implementation

### Admin Setup Page

**File**: `frontend/src/pages/AdminSetupPage.js`

Features:
- Real-time password strength validation
- Visual requirement indicators
- Form validation before submission
- Status checking to prevent re-initialization
- Redirect to login on successful setup

### Routes

```javascript
// Setup Page (public)
<Route path="/admin/setup" element={<AdminSetupPage />} />

// Admin Dashboard (protected, admin only)
<Route path="/admin/dashboard" element={
  <ProtectedRoute adminOnly={true}>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

## Security Features

### 1. Password Hashing

Passwords are hashed using bcryptjs with 10 salt rounds:

```javascript
const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(this.password, salt);
```

### 2. One-Time Setup Protection

The system checks if a password is already set:

```javascript
if (admin && admin.password) {
  return res.status(403).json({
    error: "Admin account already initialized. Use forgot-password to reset."
  });
}
```

### 3. Strong Password Requirements

Enforces complex passwords with:
- Minimum 12 characters (prevents brute force)
- Mixed case letters (increases entropy)
- Numbers and special characters (further complexity)

### 4. Environment Variables

Sensitive configuration stored in `.env`:
```env
ADMIN_EMAIL=bhsrinivas94@gmail.com
JWT_SECRET=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017/smart-affiliate
```

## Usage Example

### Complete Admin Setup Flow

1. **First Time Setup**
   - User navigates to `/admin/setup`
   - Sees admin email: `bhsrinivas94@gmail.com`
   - Creates strong password: `MyAdminPass#2024`
   - Submits setup
   - Account created successfully

2. **Admin Login**
   - Navigate to `/login`
   - Select "Admin Login"
   - Email: `bhsrinivas94@gmail.com`
   - Password: `MyAdminPass#2024`
   - Receives JWT token
   - Redirected to admin dashboard

3. **Forgot Password (if needed)**
   - Navigate to `/login`
   - Click "Forgot Password"
   - Enter email: `bhsrinivas94@gmail.com`
   - Receive OTP
   - Verify OTP
   - Set new password
   - Login with new password

## Troubleshooting

### "Admin account already initialized" Error

**Cause**: Admin account was already set up
**Solution**: Use the forgot-password flow to reset the password

### "Password does not meet strength requirements" Error

**Cause**: Password doesn't meet one or more requirements
**Solution**: Ensure your password has:
- At least 12 characters
- At least one UPPERCASE letter
- At least one lowercase letter
- At least one number
- At least one special character

### Cannot access admin setup page

**Cause**: Admin might already be set up
**Solution**: 
1. Check admin status at `/api/auth/admin-status`
2. If setup is complete, use login page instead

## Environment Variables Configuration

Update `.env` file in backend directory:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/smart-affiliate

# Admin Configuration
ADMIN_EMAIL=bhsrinivas94@gmail.com

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d

# Email Configuration (for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Best Practices

1. **Use Strong Passwords**: Follow all password requirements
2. **Unique Email**: Keep the admin email unique and secure
3. **Store Credentials Safely**: Don't share admin credentials
4. **Implement MFA**: Consider adding two-factor authentication
5. **Regular Audits**: Monitor admin account access logs
6. **Update Regularly**: Change password every 90 days
7. **Backup Credentials**: Store credentials in a secure password manager

## Related Documentation

- [Authentication System](./AUTH_DOCUMENTATION.md)
- [User Management](./USER_DOCUMENTATION.md)
- [Security Best Practices](./SECURITY.md)
