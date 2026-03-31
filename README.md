<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# BuildMore - Enterprise Procurement Frontend

BuildMore is a high-density, professional-grade procurement platform designed for industrial and infrastructure projects. It features a modern "Research Command Center" aesthetic with focus on information density, technical clarity, and streamlined procurement workflows.

## Key Features

- **Product Exploration:** Comprehensive product catalog and detailed pages with bulk pricing, technical specs, and verified supply chains.
- **Inventory & Logistics:** Protected dashboards for tracking active inventory, shipments, and real-time logistics.
- **Compliance & Specifications:** Dedicated modules for managing site safety, compliance documentation (EN-ISO), and technical RFP/RFQ workflows.
- **User Workspaces:** Secure authentication, integrated shopping cart, and user profile management.
- **High-Density UI:** A dark-themed, data-rich interface using a 12-column grid system with tailwind-based glassmorphism and industrial-grade aesthetics.

## 📂 Project Structure

```text
buildmore-frontend/
├── public/                 # Static assets (favicons, etc.)
│   └── images/             # Static images like logo and hero backgrounds
├── src/
│   ├── assets/             # Bundled assets (processed by Vite)
│   ├── components/         # Reusable UI components (Header, Hero, ProductCard, etc.)
│   ├── context/            # Global state management (AuthContext, CartContext)
│   ├── data/               # Mock industrial data and product definitions
│   ├── layouts/            # Page structures (MainLayout with sidebar/header)
│   ├── pages/              # Primary route views (Landing, Products, Logistics, etc.)
│   ├── App.tsx             # Main application router and providers
│   └── main.tsx            # Application entry point
├── index.html              # HTML template
├── tailwind.config.js      # Custom theme and grid configurations
└── vite.config.ts          # Vite build tool setup
```

## Tech Stack

- **React** - UI Component library
- **TypeScript** - Type safety and enterprise stability
- **Vite** - High-speed frontend build tool
- **TailwindCSS** - High-performance utility-first styling
- **Lucide React** - Standardized icon sets
- **React Router** - Single Page Application navigation

## 🏃 Run Locally

**Prerequisites:** Node.js (v18+)

1.  **Install dependencies:**
    `npm install`
2.  **Environment Setup:**
    Create a `.env.local` file and add your credentials if needed (e.g., `GEMINI_API_KEY`, Supabase IDs).
3.  **Run Dev Server:**
    `npm run dev`
4.  **Open Browser:**
    Navigate to `http://localhost:5173`

---

_Built for the next generation of industrial procurement._
