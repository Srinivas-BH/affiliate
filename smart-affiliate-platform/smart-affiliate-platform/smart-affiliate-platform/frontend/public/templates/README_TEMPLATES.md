# HTML Template Files - Reference Guide

## Purpose
These HTML files are **reference templates** for manual editing and understanding the UI structure. They are NOT used by the React application, but serve as:

1. **Documentation** - Visual reference of each page layout
2. **Manual Editing** - Easy to edit HTML structure
3. **Design Reference** - Understand component structure
4. **Future Updates** - Template for creating static versions if needed

## Available Templates

### User Pages
- `login.html` - Login page with email/password detection
- `user-dashboard.html` - User home page with products grid
- `product-detail.html` - Product detail page with BUY NOW button
- `write-to-us.html` - NLP request submission form
- `wishlist.html` - User wishlist page (to be created)
- `about.html` - About page (to be created)
- `profile.html` - User profile page (to be created)

### Admin Pages
- `admin-dashboard.html` - Empty admin dashboard with ADD+ button
- `add-product-excel.html` - Excel-like product addition interface
- `admin-products.html` - Platform-based product management (to be created)
- `admin-requests.html` - User requests management (to be created)
- `admin-analytics.html` - User analytics dashboard (to be created)

## How to Use

1. **View Templates**: Open any `.html` file in a browser
2. **Edit Structure**: Modify HTML/CSS as needed
3. **Reference**: Use as guide when updating React components
4. **Static Version**: Can be converted to static HTML if needed

## Note

⚠️ **These are static HTML templates with Tailwind CDN**
- They use Tailwind CSS via CDN for styling
- No JavaScript functionality (forms won't submit)
- No API integration
- Pure HTML/CSS reference only

## React vs HTML

- **React App**: Uses components in `src/pages/` (functional, with API)
- **HTML Templates**: Static reference in `public/templates/` (visual only)

To update the actual application, edit the React components in `src/pages/`.
