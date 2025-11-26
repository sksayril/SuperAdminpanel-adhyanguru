# Learnzie Learning Management System

## Overview

Learnzie is a modern Learning Management System (LMS) built for students and educators. The platform provides comprehensive course management, progress tracking, scheduling, analytics, and certification features. It follows a dual-mode design approach with distinct interfaces for students and administrators, inspired by modern EdTech platforms like Coursera and Khan Academy.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system

**Design System:**
- Card-based architecture with elevated shadows for content blocks
- Custom color tokens using CSS variables (HSL format)
- Typography system using Inter font family from Google Fonts
- Consistent spacing system using Tailwind units (2, 4, 6, 8, 12, 16, 24)
- Responsive layout with fixed sidebar (w-64) and flexible main content area
- Theme support via CSS custom properties with light/dark mode capability

**Component Structure:**
- Reusable UI components in `/client/src/components/ui/` (accordions, alerts, badges, buttons, cards, dialogs, forms, etc.)
- Application-specific components (AppSidebar, AppHeader, StatCard, ProgressRing, CalendarWidget)
- Page components organized by feature (dashboard, courses, schedule, analytics, certificates, settings)
- Separate admin routes with distinct navigation (/admin, /admin/courses, /admin/users)

**Key Architectural Decisions:**
- **Component Library Choice**: Shadcn/ui provides unstyled, accessible components that can be customized, avoiding vendor lock-in while maintaining consistency
- **Client-Side Routing**: Wouter chosen for minimal bundle size while providing full routing capabilities
- **Data Fetching**: TanStack Query handles caching, synchronization, and background updates automatically
- **Type Safety**: Full TypeScript coverage with shared schema types between client and server

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL (via Neon serverless)
- **Build Tool**: esbuild for production builds
- **Development**: tsx for TypeScript execution

**API Design:**
- RESTful endpoints under `/api/*` namespace
- Resource-based routing (GET /api/courses, GET /api/stats, etc.)
- JSON request/response format
- Error handling with appropriate HTTP status codes

**Data Models:**
- **Users**: id, username, email, role, avatar, fullName
- **Courses**: id, title, instructor, category, description, thumbnail, duration, progress, lessons tracking, status
- **Assignments**: id, title, course, dueDate, status, progress, priority
- **Schedules**: id, title, course, date, time, type
- **Activities**: tracking user actions and progress
- **Learning Activities**: detailed learning history and metrics

**Storage Layer:**
- Interface-based storage abstraction (IStorage) allowing for future database swaps
- CRUD operations for all entities
- Aggregated data endpoints (dashboard stats, progress data)

**Key Architectural Decisions:**
- **ORM Choice**: Drizzle provides type-safe queries with minimal runtime overhead and excellent PostgreSQL support
- **Schema Validation**: Drizzle-Zod integration ensures runtime validation matches TypeScript types
- **Development/Production Split**: Separate entry points (index-dev.ts, index-prod.ts) for optimal development experience and production performance
- **Session Management**: Uses connect-pg-simple for PostgreSQL-backed sessions

### Development Environment

**Build Process:**
- Development: Vite dev server with HMR, served through Express middleware
- Production: Vite builds client bundle, esbuild bundles server code
- Type checking: Standalone tsc process (noEmit mode)

**Path Aliases:**
- `@/*` → client/src/*
- `@shared/*` → shared/*
- `@assets/*` → attached_assets/*

**Development Tools:**
- Replit-specific plugins for runtime error overlay, dev banner, and cartographer
- PostCSS with Tailwind and Autoprefixer

### Code Organization

**Monorepo Structure:**
```
/client          - React frontend application
  /src
    /components  - Reusable UI components
    /pages       - Route-based page components
    /hooks       - Custom React hooks
    /lib         - Utility functions and configurations
/server          - Express backend application
/shared          - Shared TypeScript types and schemas
/migrations      - Database migration files
```

**Key Architectural Decisions:**
- **Monorepo Approach**: Keeps frontend and backend in sync with shared types, simplifying development and deployment
- **Shared Schema**: Single source of truth for data models prevents type mismatches
- **Component Collocation**: UI components colocated with their styles and logic for better maintainability

## External Dependencies

### Database
- **Neon Serverless PostgreSQL**: Managed PostgreSQL database accessed via @neondatabase/serverless
- Connection configured via DATABASE_URL environment variable
- Drizzle Kit for schema migrations (stored in /migrations)

### UI Component Libraries
- **Radix UI**: Headless, accessible component primitives for 20+ components (Dialog, Dropdown, Popover, Select, Tabs, Toast, etc.)
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Chart library for analytics visualizations (LineChart, BarChart)
- **Embla Carousel**: Carousel/slider functionality
- **cmdk**: Command menu component
- **React Hook Form**: Form state management with @hookform/resolvers for validation
- **Date-fns**: Date manipulation and formatting

### Styling & Theming
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant styling
- **clsx + tailwind-merge**: Conditional className composition

### Development Tools
- **Replit Plugins**: Runtime error modal, dev banner, cartographer for enhanced DX
- **TypeScript**: Full type safety across the stack
- **ESBuild**: Fast production builds
- **Vite**: Fast development server with HMR

### Fonts
- **Google Fonts**: Inter font family loaded via CDN

### Key Integration Decisions
- **Neon vs Traditional PostgreSQL**: Serverless Postgres chosen for auto-scaling and reduced operational overhead
- **Radix UI Primitives**: Provides accessibility out of the box while allowing full styling control
- **React Hook Form**: Reduces re-renders compared to controlled inputs, improving form performance
- **Date-fns vs Moment**: Smaller bundle size and tree-shakeable compared to Moment.js