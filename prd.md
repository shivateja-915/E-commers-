================================================================
PROJECT REQUIREMENTS DOCUMENT (PRD)
Women's Fashion Catalogue Website
================================================================
Version     : 1.0
Project Type: E-Commerce Catalogue (No Cart, No Payment)
Contact Mode: WhatsApp Inquiry
================================================================


----------------------------------------------------------------
1. PROJECT OVERVIEW
----------------------------------------------------------------

This is a women's fashion catalogue website where customers can
browse dresses, save favourites, and contact the store directly
via WhatsApp to place an order or ask questions.

There is no cart, no checkout, no payment gateway, and no
customer login or signup. The website acts as a digital
catalogue with WhatsApp as the sales channel.

An admin panel allows the store owner to add, edit, and delete
dresses, manage filters, and control featured content.


----------------------------------------------------------------
2. TECH STACK
----------------------------------------------------------------

Frontend       : React + Vite + Tailwind CSS
Backend/DB     : Supabase (PostgreSQL)
Image Storage  : Cloudinary
Authentication : Supabase Auth (admin only)
Hosting        : Vercel


----------------------------------------------------------------
3. SUPABASE DATABASE SCHEMA
----------------------------------------------------------------

TABLE: products
---------------
id              uuid          PRIMARY KEY DEFAULT gen_random_uuid()
name            text          NOT NULL
description     text
category        text
sizes           text[]        (array of sizes e.g. ["S","M","L","XL"])
image_urls      text[]        (array of Cloudinary image URLs)
is_featured     boolean       DEFAULT false
is_favourite    boolean       DEFAULT false
created_at      timestamp     DEFAULT now()

TABLE: filters
--------------
id              uuid          PRIMARY KEY DEFAULT gen_random_uuid()
filter_name     text          NOT NULL    (e.g. "Category", "Size", "Color")
filter_values   text[]        (e.g. ["Anarkali","Kurti","Lehenga"])
is_visible      boolean       DEFAULT true
sort_order      integer

NOTE: No orders table, no users table, no cart table.


----------------------------------------------------------------
4. CLOUDINARY SETUP
----------------------------------------------------------------

- Create a free Cloudinary account at cloudinary.com
- Get credentials: Cloud Name, API Key, API Secret
- Create an unsigned upload preset named: fashion-store-upload
- Folder structure in Cloudinary:
    fashion-store/
    └── dresses/

Image Requirements for Admin:
- Recommended ratio   : 3:4 (portrait)
- Recommended size    : 1200 x 1600 px
- Minimum size        : 900 x 1200 px
- Accepted formats    : JPG, WebP
- Maximum file size   : 2MB per image
- Maximum images/dress: 5 photos
- Background          : White or plain light color

Cloudinary URL transformation to use in frontend:
  w_900,h_1200,c_fill,f_auto,q_auto

This auto-crops to 3:4, converts to WebP, and optimizes quality.


----------------------------------------------------------------
5. ENVIRONMENT VARIABLES
----------------------------------------------------------------

Create a .env file in the project root:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=fashion-store-upload
VITE_WHATSAPP_NUMBER=+919059899695
VITE_STORE_NAME=VAISHNAVI COLLECTIONS


----------------------------------------------------------------
6. FOLDER STRUCTURE
----------------------------------------------------------------

src/
├── pages/
│   ├── Home.jsx
│   ├── Shop.jsx
│   ├── ProductDetail.jsx
│   ├── Favourites.jsx
│   └── admin/
│       ├── AdminLogin.jsx
│       ├── AdminDashboard.jsx
│       ├── AddDress.jsx
│       ├── ManageDresses.jsx
│       └── FilterSettings.jsx
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── ProductCard.jsx
│   ├── WhatsAppButton.jsx
│   ├── DescriptionBox.jsx
│   ├── ImageGallery.jsx
│   ├── FilterBar.jsx
│   └── ProtectedRoute.jsx
├── context/
│   └── FavouritesContext.jsx
├── lib/
│   ├── supabase.js
│   └── cloudinary.js
└── App.jsx


----------------------------------------------------------------
7. ROUTES
----------------------------------------------------------------

Public Routes (No Login Required):
  /                   Home page
  /shop               Shop / catalogue page
  /product/:id        Product detail page
  /favourites         User's saved favourites page

Admin Routes (Login Required):
  /admin              Redirects to /admin/login or /admin/dashboard
  /admin/login        Admin login page
  /admin/dashboard    Admin dashboard home
  /admin/add          Add new dress
  /admin/manage       View and manage all dresses
  /admin/filters      Manage filter settings


----------------------------------------------------------------
8. PAGE DETAILS
----------------------------------------------------------------

--------------------------
8.1 NAVBAR
--------------------------

Elements:
  - Store name / logo on the left
  - Navigation links: Home, Shop, Favourites

Behaviour:
  - Sticky at top while scrolling
  - On mobile: hamburger menu
  - No login/signup links visible to customers
  - Favourites link shows count badge if user has saved dresses
    (count stored in localStorage)


--------------------------
8.2 HOME PAGE (/home)
--------------------------

Section 1 - Hero Banner:
  - Full width image (admin uploads from dashboard)
  - Overlay text: heading + subheading
  - One CTA button: "Explore Collection" -> links to /shop
  - Image stored in Cloudinary, URL saved in a settings table
    or hardcoded as an env variable for simplicity

Section 2 - Featured Dresses:
  - Heading: "Featured Collection"
  - Shows dresses where is_featured = true in Supabase
  - Displays 4 dress cards in a row (2 on mobile)
  - Each card: image, name, category
  - "View All" button -> links to /shop

Section 3 - Your Favourites:
  - Heading: "Your Favourites"
  - Shows dresses the user has heart-clicked
  - Favourites are stored in localStorage as an array of product IDs
  - On load, fetch those products from Supabase by ID
  - If no favourites saved: show empty state message
    "You have not saved any dresses yet." with a Shop button
  - Displays as a 2-card wide highlighted grid

Section 4 - Footer:
  - Store name and tagline
  - WhatsApp contact number
  - Copyright line


--------------------------
8.3 SHOP PAGE (/shop)
--------------------------

Filter Bar (top of page):
  - Dropdowns for each filter that is_visible = true in filters table
  - Filters are fetched from Supabase filters table
  - "Clear All" button resets all filters
  - On mobile: filters collapse into a "Filter" button that opens
    a slide-in drawer

Dress Grid:
  - 3 columns on desktop, 2 columns on mobile
  - Each card shows: dress image, heart icon, name, category
  - Heart icon toggles favourite (saves/removes from localStorage)
  - Clicking the card opens /product/:id
  - Filters apply in real time without page reload
  - Show total item count: "Showing 24 dresses"

Empty State:
  - If no dresses match filters: "No dresses found. Try clearing
    your filters."


--------------------------
8.4 PRODUCT DETAIL PAGE (/product/:id)
--------------------------

Layout - Desktop:
  - Left column (55%): image gallery
  - Right column (45%): dress info

Layout - Mobile:
  - Images stacked on top
  - Info below
  - WhatsApp button sticky at bottom of screen

Left Column - Image Gallery:
  - One large main image displayed (3:4 ratio)
  - Row of thumbnail images below the main image
  - Clicking a thumbnail updates the main image
  - Main image switches with a fade transition (0.2 seconds)
  - Active thumbnail has a colored border highlight
  - Thumbnails scroll horizontally if more than 5 images
  - All images served from Cloudinary with auto optimization

Right Column - Dress Info:
  - Dress name (large, bold)
  - Category tag
  - Heart icon to save to favourites
  - Description section (see 8.5 for detail)
  - Available Sizes label
  - Size selector: clickable size buttons (S, M, L, XL, XXL etc.)
    One size must be selected before WhatsApp button is active
  - WhatsApp button (see 8.6 for detail)

Related Dresses (below main content):
  - Heading: "You may also like"
  - 3 dress cards from the same category (random)
  - Same card style as shop page


--------------------------
8.5 DESCRIPTION BOX
--------------------------

Customer View (Product Detail Page):
  - By default shows only the first 3 lines of description
  - "Read more" button with down arrow at the bottom
  - Clicking "Read more" smoothly expands the box downward
  - Animation: smooth slide down, 0.4 seconds ease-in-out
  - Arrow icon rotates 180 degrees when expanded
  - Button text changes to "Show less" when expanded
  - Clicking "Show less" collapses back with same animation

Description Template (pre-filled in admin add dress form):
  The following template is pre-loaded in the description
  textarea when admin opens the Add Dress form. Admin can
  edit, delete, or add any points.

  ---TEMPLATE START---
  About this Dress
  [Write a short intro about the dress here]

  Fabric and Material
  - Fabric: [e.g. Georgette / Cotton / Silk]
  - Lining: [Yes / No]
  - Transparency: [Slight / None]

  Fit and Style
  - Type: [e.g. Anarkali / Kurti / Lehenga]
  - Fit: [Regular / Flared / Slim]
  - Length: [Full length / Knee length / Midi]

  Color and Design
  - Color: [e.g. Royal Blue with Gold border]
  - Pattern: [Floral / Embroidered / Printed / Plain]
  - Occasion: [Casual / Festival / Wedding / Party]

  Care Instructions
  - [e.g. Dry clean only / Hand wash recommended]

  What is Included
  - [e.g. 1 Kurti + Dupatta / Full Lehenga Set]
  ---TEMPLATE END---

Admin Description Box Behaviour:
  - Textarea is pre-filled with the template above
  - Admin can freely edit the text
  - Textarea is resizable by dragging the bottom edge
  - Minimum height: 200px
  - No rich text editor needed, plain textarea is fine


--------------------------
8.6 WHATSAPP BUTTON
--------------------------

Behaviour:
  - Button label: "Contact on WhatsApp"
  - Button is disabled (grayed out) if no size is selected
  - Once a size is selected, button becomes active
  - On click, opens WhatsApp with pre-filled message

WhatsApp URL format:
  https://wa.me/VITE_WHATSAPP_NUMBER?text=MESSAGE

Pre-filled message:
  Hi! I am interested in "[Dress Name]", Size: [Selected Size].
  Can you share more details?

  The dress name and selected size are inserted dynamically.

On mobile:
  - WhatsApp button is sticky at the bottom of the screen
  - Always visible while the user scrolls through the product page


--------------------------
8.7 FAVOURITES PAGE (/favourites)
--------------------------

  - Shows all dresses the user has saved by clicking heart icon
  - Favourites IDs stored in localStorage key: "favourites"
  - On page load, fetch those products from Supabase
  - Same card grid as shop page (3 columns desktop, 2 mobile)
  - Each card has heart icon, clicking removes from favourites
  - Empty state: "No favourites yet. Start exploring!" with
    a button to /shop
  - No login required, fully localStorage based


----------------------------------------------------------------
9. ADMIN PANEL
----------------------------------------------------------------

--------------------------
9.1 ADMIN LOGIN (/admin/login)
--------------------------

  - Simple email and password login form
  - Uses Supabase Auth
  - Only pre-registered admin email can log in
  - On success: redirects to /admin/dashboard
  - On fail: shows error message
  - No signup option visible


--------------------------
9.2 ADMIN DASHBOARD (/admin/dashboard)
--------------------------

  - Shows quick stats:
      Total dresses count
      Featured dresses count
      Favourite-marked dresses count
  - Navigation links to:
      Add Dress
      Manage Dresses
      Filter Settings
  - Logout button


--------------------------
9.3 ADD DRESS (/admin/add)
--------------------------

Form Fields:
  - Dress Name          (text input, required)
  - Category            (text input or dropdown, required)
  - Sizes Available     (multi-select checkboxes: XS S M L XL XXL
                         or custom text input to add custom sizes)
  - Description         (textarea, pre-filled with template,
                         resizable, required)
  - Images              (image uploader, max 5 images)
  - Mark as Featured    (toggle switch)
  - Mark as Favourite   (toggle switch)

Image Uploader:
  - 5 upload slots shown as boxes
  - Admin clicks a box to select image from device
  - Image previews immediately after selection
  - First slot is always the main/cover image (labeled)
  - Shows warning if image is smaller than 900x1200px
  - Shows warning if image is larger than 2MB
  - On form submit, images are uploaded to Cloudinary first,
    then the returned URLs are saved to Supabase

Form Submit:
  - Validate all required fields
  - Upload images to Cloudinary
  - Save product record to Supabase products table
  - Show success message and option to add another dress or
    go to Manage Dresses


--------------------------
9.4 MANAGE DRESSES (/admin/manage)
--------------------------

  - Table or card grid of all dresses
  - Each row/card shows: thumbnail image, name, category, sizes,
    featured status, favourite status
  - Actions per dress:
      Edit   -> opens edit form (same as add form, pre-filled)
      Delete -> shows confirmation dialog, then deletes from
                Supabase and removes images from Cloudinary
  - Search bar to filter by name or category
  - Sort by: newest first, oldest first, name A-Z


--------------------------
9.5 FILTER SETTINGS (/admin/filters)
--------------------------

  - Shows list of all filters (fetched from filters table)
  - Each filter shows: filter name, filter values, visible toggle
  - Admin can toggle visibility of each filter (on/off)
  - Admin can add a new filter:
      Filter Name (e.g. "Color")
      Filter Values (comma separated e.g. "Red, Blue, Green")
  - Admin can edit filter values of existing filters
  - Admin can delete a filter
  - Changes save immediately to Supabase


----------------------------------------------------------------
10. FAVOURITES LOGIC (CUSTOMER SIDE)
----------------------------------------------------------------

Storage:
  - localStorage key: "favourites"
  - Value: JSON array of product IDs
  - Example: ["uuid-1", "uuid-2", "uuid-3"]

Add to Favourites:
  - User clicks heart icon on any product card or detail page
  - Product ID is added to localStorage array
  - Heart icon turns filled/colored
  - No login required

Remove from Favourites:
  - User clicks filled heart icon again
  - Product ID is removed from localStorage array
  - Heart icon turns back to outline

Persistence:
  - Favourites persist across browser sessions
  - Lost only if user clears browser data
  - Not synced across devices (no account system)

Context:
  - FavouritesContext.jsx manages the favourites state globally
  - All components read from and write to this context
  - Context syncs with localStorage on every change


----------------------------------------------------------------
11. WHATSAPP NUMBER CONFIGURATION
----------------------------------------------------------------

  - Store the WhatsApp number in .env as VITE_WHATSAPP_NUMBER
  - Format: country code + number, no spaces, no plus sign
  - This number is used in all WhatsApp links across the site


----------------------------------------------------------------
12. BUILD ORDER (RECOMMENDED)
----------------------------------------------------------------

Step 1 : Set up Supabase project, create tables with SQL schema
Step 2 : Set up Cloudinary account, create upload preset
Step 3 : Create React + Vite project, install Tailwind CSS
Step 4 : Set up environment variables
Step 5 : Create supabase.js and cloudinary.js in lib/
Step 6 : Build Navbar and Footer components
Step 7 : Build Home page (hero, featured, favourites sections)
Step 8 : Build Shop page (grid + filter bar)
Step 9 : Build Product Detail page (image gallery + info + WhatsApp)
Step 10: Build Favourites page
Step 11: Build Admin Login with Supabase Auth
Step 12: Build ProtectedRoute component
Step 13: Build Admin Dashboard
Step 14: Build Add Dress form with Cloudinary upload
Step 15: Build Manage Dresses page (edit/delete)
Step 16: Build Filter Settings page
Step 17: Set up React Router for all routes
Step 18: Build FavouritesContext and connect to all components
Step 19: Test all flows end to end
Step 20: Deploy to Vercel


----------------------------------------------------------------



----------------------------------------------------------------
END OF PRD
================================================================