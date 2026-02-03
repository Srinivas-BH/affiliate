# Environment Variables Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/smart-affiliate

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

# Amazon PA-API Configuration (Optional - for Amazon product fetching)
AMAZON_ACCESS_KEY=your_amazon_access_key
AMAZON_SECRET_KEY=your_amazon_secret_key
AMAZON_ASSOCIATE_TAG=your_associate_tag
AMAZON_REGION=IN
```

## Gmail SMTP Setup

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "DIS-CYRA"
   - Copy the generated 16-character password
   - Use this password in `EMAIL_PASSWORD`

## Admin Account

Default admin credentials:
- Email: `bhsrinivas94@gmail.com`
- Password: `SBHaff$2706`

To initialize the admin account, run:
```bash
cd backend
node scripts/initAdmin.js
```
