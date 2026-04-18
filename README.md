# BuildMore - Enterprise Procurement Frontend

BuildMore is a high-density, professional-grade B2B procurement platform designed for industrial and infrastructure projects. It features a modern "Research Command Center" aesthetic with focus on information density, technical clarity, and streamlined procurement workflows.

## Tech Stack

- **React 19** with TypeScript
- **Vite 6** — build tool
- **Tailwind CSS v4** — utility-first styling
- **React Router v7** — client-side routing
- **Motion** — animations
- **Lucide React** — icon set

## Project Structure

```text
buildmore-frontend/
├── public/                 # Static assets
├── src/
│   ├── api/                # API client and endpoint definitions
│   ├── components/         # Reusable UI components
│   ├── context/            # AuthContext, AdminAuthContext, CartContext
│   ├── layouts/            # MainLayout (user), AdminLayout
│   ├── pages/              # Page components (one per route)
│   ├── App.tsx             # Router and providers
│   └── main.tsx            # Entry point
├── index.html
└── vite.config.ts
```

## Getting Started

**Prerequisites:** Node.js v18+

```bash
npm install
```

### Environment Setup

| File | Purpose |
|---|---|
| `.env.local` | Local dev — hits `localhost:5050` |
| `.env.production` | Production builds — hits Render backend |

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 3000 with local API |
| `npm run dev:prod` | Start dev server on port 3000 with production API |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | TypeScript type check |
| `npm run clean` | Remove `dist/` folder |

---

## User Functionality

### Authentication
- Register and log in with JWT-based session management
- Protected routes requiring authentication

### Home / Landing Page
- Hero section with call-to-action
- Product category grid for quick browsing
- Featured product carousel (8 latest products)
- Flash deal banners with auto-rotation, countdown timers, and progress bars

### Product Catalog (`/products`)
- Full product listing with search
- Filter by: category, price range, star rating, stock availability, sale status
- Sort by: featured, price (low/high), newest, best rated
- Toggle grid/list view
- Paginated results with "Load More"

### Product Detail (`/products/:id`)
- Image gallery with thumbnail navigation
- Name, category, rating, description, price, discount, and stock status
- Bulk pricing information
- Add to cart with quantity selector
- Add to wishlist
- Create RFQ directly from product page
- Share product link
- Tabbed info: Description, Specifications, Shipping details
- Download technical spec sheets (PDF)

### Shopping Cart & Checkout (`/cart`)
- View cart items with image, name, SKU, price, quantity, and subtotal
- Adjust quantity or remove items
- Order summary with logistics fee (₹450 flat LTL freight)
- Shipping address form with validation
- Quick-select from saved addresses
- Place order

### User Profile Dashboard (`/profile`)
- **Overview** — stats (total spent, pending orders, active shipments, delivered ratio) + recent orders
- **Orders** — full order history with status badges (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED); cancel order with optional reason
- **Addresses** — add, edit, and delete saved delivery addresses
- **Account** — view email, phone, role, and member since date

### Inventory (`/inventory`)
- View stock levels across all products
- Search by name or SKU; filter by category
- Sortable table: SKU, name, category, quantity, status (OK / Low / Out of Stock), unit price
- Stats: total units, low stock alerts, total inventory value

### Logistics & Shipment Tracking (`/logistics`)
- Track shipments by tracking number or order number
- Filter by carrier, origin/destination, and status
- Shipment cards with progress bar and status badge
- Detailed tracking event timeline (location, description, timestamp)
- Stats: active shipments, delivered, failed

### RFQ Management (`/rfqs`)
- Create RFQs with notes, requester name, and optional expiry date
- Add, edit, and remove line items (product name, quantity, target price, notes)
- Submit RFQ for admin review
- View admin-quoted prices and notes once processed
- Status flow: DRAFT → SUBMITTED → UNDER\_REVIEW → QUOTED → ACCEPTED / REJECTED / EXPIRED

### Compliance Hub (`/compliance`)
- Upload compliance documents (PDF, DOC, DOCX, XLSX)
- Document types: ISO, CE, RoHS, REACH, SDS, AUDIT, OTHER
- Track status: Active, Expiring Soon, Expired
- Stats overview, search, filter, and download

### Specifications & Technical Docs (`/specs`)
- Browse spec sheet library by title, product name, category, or file type (PDF, CAD, XLSX, DWG)
- View details: description, material specs, version, file size
- Download spec sheets

---

## Admin Functionality

Access the admin panel at `/admin/login` using admin credentials.

### Admin Dashboard (`/admin`)
- Stats: total products, orders, RFQs, and shipments
- Recent orders widget (last 5): order number, items, total, status
- Recent RFQs widget (last 5): RFQ number, items, estimated value, status
- Quick navigation to all admin sections

### Product Management (`/admin/products`)
- View all products with search and category/availability filters
- Stats: total products, available, out of stock, total inventory value (INR)
- Per product: edit name/category/price/material, delete with confirmation, toggle availability, adjust stock inline

### Add New Product (`/admin/products/add`)
- Fields: name, description, category, price (INR), stock quantity, material specs
- Multi-image upload (minimum 1 required)
- Form validation and error handling

### Order Management (`/admin/orders`)
- View all customer orders with expandable detail cards
- Customer info, shipping address, and itemised product list per order
- Update order status: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → CANCELLED

### RFQ Management (`/admin/rfqs`)
- View all user-submitted RFQs with expandable cards
- Add admin notes per RFQ
- Set quoted price per line item
- Update status: UNDER\_REVIEW → QUOTED → ACCEPTED / REJECTED

### Shipment Management (`/admin/shipments`)
- View all shipments across all orders
- Create new shipment: carrier, origin, destination, ETA, freight class, weight
- Update shipment status: PREPARING → PICKED\_UP → IN\_TRANSIT → OUT\_FOR\_DELIVERY → DELIVERED / FAILED
- Add tracking events with location, description, and timestamp
- Full tracking event history per shipment

---

## Deployment

- **Production backend**: https://buildmore-inframart-backend.onrender.com
- **Frontend hosting**: Vercel (auto-deploys on push to `main`)

---

_Built for the next generation of industrial procurement._
