# DIS-CYRA - Frontend

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm start
```

Server will run on `http://localhost:3000`

## Project Structure

```
Frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── context/        # Auth context
│   ├── utils/          # API client
│   ├── App.js          # Main app
│   ├── index.js        # Entry point
│   └── index.css       # Tailwind styles
├── public/             # Static files
├── package.json        # Dependencies
├── tailwind.config.js  # Tailwind config
└── postcss.config.js   # PostCSS config
```

## Features

### Pages
- **Home** - Landing page with features
- **Login** - Universal auth (admin + user)
- **Products** - Browse and search products with filters
- **Notify Me** - Submit product requests
- **Profile** - User preferences and settings
- **Admin Dashboard** - Statistics and management

### Components
- **Navbar** - Navigation with auth state
- **ProtectedRoute** - Role-based access control
- **ProductCard** - Product display with CTA

### Context
- **AuthContext** - JWT token management and user state

## Available Scripts

### `npm start`
Runs the app in development mode

### `npm build`
Builds the app for production

### `npm test`
Launches the test runner

## Styling

Uses Tailwind CSS with custom utilities defined in `index.css`:
- `.btn-primary`, `.btn-secondary`, `.btn-danger` - Button styles
- `.card` - Card component
- `.input-field` - Form input
- `.badge` - Badge variants

## Authentication Flow

1. User enters email
2. If admin email: require password, verify with bcrypt, issue admin JWT
3. If user email: passwordless login, auto-register if needed, issue user JWT
4. JWT stored in localStorage
5. Sent with every API request via Authorization header
