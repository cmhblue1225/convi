# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server (Vite with hot reload)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint code quality checks
- `npm run preview` - Preview production build locally
- `npm run server` - Start backend Express server
- `npm run dev:full` - Run both frontend and backend concurrently

### Testing & Production
- `npm run test:prod` - Build and test production locally
- `npm run serve:local` - Serve on port 3001 for local testing
- `npm run production` - Build and start for production

### Excel & Setup Commands
- `npm run setup:excel` - Configure Excel functionality
- Excel features include: storeSupply, hqSupply, orderManagement, inventoryReport

## Architecture Overview

### Technology Stack
- **Frontend**: React 19 + TypeScript 5.x + Vite 7
- **Backend**: Express.js with Supabase integration
- **Database**: PostgreSQL (Supabase) with Row Level Security (RLS)
- **State Management**: Zustand with subscribeWithSelector middleware
- **Styling**: Tailwind CSS 3.4 with HeadlessUI components
- **Authentication**: Supabase Auth with JWT tokens
- **Payments**: Toss Payments integration
- **Maps**: Google Maps API for store locations

### Application Structure
This is a comprehensive convenience store management platform with three distinct user roles:

1. **Customer** (`/customer/*`)
   - Store selection with GPS-based location
   - Product catalog and shopping cart
   - Order tracking and payment processing
   - User profile and order history

2. **Store Owner** (`/store/*`)
   - Real-time order management
   - Inventory tracking and supply requests
   - Sales analytics and reporting
   - Refund processing

3. **Headquarters** (`/hq/*`)
   - Multi-store oversight and analytics
   - Product master data management
   - Supply chain approval workflow
   - Member and store management

### Key Architectural Patterns

**State Management**: Zustand stores located in `src/stores/` with role-based separation
- `authStore.ts` - Authentication and user session management
- `cartStore.ts` - Shopping cart state
- `orderStore.ts` - Order processing
- `pointStore.ts` - Customer loyalty points
- `wishlistStore.ts` - Product wishlist

**Real-time Features**: Supabase real-time subscriptions for:
- Order status updates
- Inventory changes
- Notifications system

**Database Integration**: 
- 17 PostgreSQL tables with comprehensive RLS policies
- Database functions and triggers for business logic automation
- Automated inventory management and sales tracking

**Component Organization**:
- `components/common/` - Shared UI components
- `components/customer/` - Customer-specific components  
- `components/store/` - Store owner components
- `components/hq/` - Headquarters components

**Page Structure**: Role-based routing with protected routes
- Uses React Router 7.7.1 with nested layouts
- `ProtectedRoute` component enforces role-based access control
- Payment success/fail routes for Toss Payments integration

### Environment Configuration

Required environment variables:
```env
VITE_SUPABASE_URL - Supabase project URL
VITE_SUPABASE_ANON_KEY - Supabase anonymous key
VITE_TOSS_CLIENT_KEY - Toss Payments client key  
VITE_GOOGLE_MAPS_API_KEY - Google Maps API key
VITE_GOOGLE_GEOCODING_API_KEY - Google Geocoding API key
```

### Database Setup
- Run `supabase-setup/00_setup_all_advanced.sql` for complete database initialization
- Includes all tables, RLS policies, functions, triggers, and seed data
- Test accounts pre-configured for each role

### Development Notes

**Authentication Flow**: Uses Supabase Auth with automatic session restoration and real-time auth state changes

**Payment Integration**: Toss Payments SDK with support for multiple payment methods and duplicate payment prevention

**Error Handling**: Comprehensive error boundaries and user-friendly error messages throughout the application

**Accessibility**: Enhanced focus visibility and accessibility checks in development mode

**File Structure**: Well-organized with clear separation of concerns and TypeScript strict mode enabled