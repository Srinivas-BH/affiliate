# Complete Workflow Documentation

## ✅ **WORKFLOW IMPLEMENTED EXACTLY AS REQUESTED**

### 🔐 **LOGIN PAGE WORKFLOW**

**Location**: http://localhost:3000/login

**How it works:**
1. **Simple Email Input** - No admin checkbox visible
2. **User enters email** and clicks "Continue"
3. **Backend checks email**:
   - If email = `bhsrinivas94@gmail.com` → Shows password field
   - If any other email → Passwordless login, auto-creates profile
4. **After login**:
   - User → Redirects to `/dashboard` (User Dashboard)
   - Admin → Redirects to `/admin/dashboard` (Admin Dashboard)

**Forgot Password:**
- Admin can click "Forgot Password?" link
- Receives 6-digit OTP via email
- Can reset password with OTP

---

### 👤 **USER WORKFLOW**

#### **After Login → User Dashboard** (`/dashboard`)

**Layout:**
1. **Navbar** (top):
   - Home (redirects to dashboard)
   - Category (dropdown with all categories)
   - Wishlist
   - About
   - Write to Us
   - Profile (dropdown: Edit Profile, Sign Out)

2. **Search Bar** (below navbar):
   - Search products by keyword

3. **Home Page Content**:
   - Shows all products updated by admin
   - Product cards with:
     - Product image
     - Title
     - Price
     - Platform badge
     - Discount badge (if applicable)
     - "View Details" button

4. **Category Filtering**:
   - Click "Category" in navbar
   - Select category from dropdown
   - Products filtered by selected category

#### **Product Detail Page** (`/product/:id`)

**When user clicks on product:**
- Product image (large)
- Product title
- Price (with original price if discounted)
- Platform badge
- Category badge
- **BUY NOW button** → Opens affiliate link in new tab
- **Wishlist button** → Saves to wishlist
- Important notice about price variations

#### **Wishlist Page** (`/wishlist`)

- Shows all saved products
- Remove from wishlist option
- Click product to view details

#### **About Page** (`/about`)

- Information about the platform
- Notice: "Prices may vary daily, grab products ASAP"

#### **Write to Us Page** (`/write-to-us`)

- NLP input field
- User types natural language request
- Backend parses: category, price range, platforms, tags
- Sends request to admin dashboard
- User gets email notification when matching product added

#### **Profile Page** (`/profile`)

- Edit user name
- Sign out option
- View account information

---

### 👑 **ADMIN WORKFLOW**

#### **After Login → Admin Dashboard** (`/admin/dashboard`)

**Initial State:**
- Empty dashboard
- **ADD+ button** (prominent)

**When Admin clicks ADD+:**
- Opens Excel-like interface
- Table with columns:
  - Image URL
  - Affiliate Link
  - Title
  - Price
  - Original Price
  - Category
  - Platform (auto-detected)
- **For Amazon products:**
  - Auto-fetches price from PA-API
  - Shows "Auto-fetch" indicator
- **For other platforms:**
  - Admin manually enters price
- **Add Row** button to add more products
- **Save Products** button to save to database

**After Products Added:**
- **Application dropdown** appears in navbar
- Contains platforms: Amazon, Flipkart, Myntra, Meesho, Other
- Click platform → Shows products for that platform
- Can **Edit** or **Delete** products
- Amazon prices auto-update every 24 hours

#### **User Requests Page** (`/admin/user-requests`)

- Shows all "Notify Me" requests from users
- Displays:
  - User email
  - Natural language query
  - Parsed category, price range, platforms, tags
  - Status (Active, Fulfilled, Cancelled)
  - Matched products count
- Filter by status

#### **User Analytics Page** (`/admin/analytics`)

- Total users
- Active users (logged in within 30 days)
- Total products
- Total requests
- Products by platform statistics
- Request statistics

---

## 🔄 **COMPLETE FLOW DIAGRAM**

```
USER FLOW:
Home Page → Login (email only) → Dashboard
  ↓
Dashboard → Search/Category Filter → View Products
  ↓
Product Detail → BUY NOW (affiliate link) OR Add to Wishlist
  ↓
Wishlist → View saved products
  ↓
Write to Us → Submit NLP request → Email notification when matched

ADMIN FLOW:
Home Page → Login (admin email + password) → Admin Dashboard
  ↓
Admin Dashboard → ADD+ → Excel Interface
  ↓
Add Products → Save → Products appear in User Dashboard
  ↓
Application Dropdown → Select Platform → Edit/Delete Products
  ↓
User Requests → View requests → Add matching products → Users notified
  ↓
Analytics → View user statistics
```

---

## 🎯 **KEY FEATURES**

✅ **Universal Login** - Single endpoint, auto-detects admin
✅ **Passwordless User Login** - Just email
✅ **Admin Password Protection** - Only for admin email
✅ **Auto-Fetch Amazon Prices** - Via PA-API
✅ **Manual Price Entry** - For non-API platforms
✅ **Excel-like Interface** - Easy bulk product addition
✅ **Platform Management** - Edit/Delete by platform
✅ **NLP Request Parsing** - Natural language to structured data
✅ **Auto-Notifications** - Email when matching products added
✅ **Category Filtering** - Dropdown in navbar
✅ **Wishlist** - Save products for later
✅ **Search** - Find products quickly

---

## 📍 **ACCESS POINTS**

- **Home Page**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **User Dashboard**: http://localhost:3000/dashboard (after login)
- **Admin Dashboard**: http://localhost:3000/admin/dashboard (after admin login)
- **Backend API**: http://localhost:5000

---

**Status**: ✅ **ALL WORKFLOWS IMPLEMENTED AND TESTED**
