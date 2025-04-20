# Lost & Found Portal Architecture

## Modular Architecture Overview

This document outlines the modular architecture for the Lost & Found Portal application.

### Folder Structure

```
src/
  ├── app/                      # Next.js app directory containing routes
  ├── components/               # Shared UI components
  │   ├── ui/                   # Base UI components (buttons, inputs, etc.)
  │   ├── forms/                # Form components and related utilities
  │   ├── layout/               # Layout components (nav, footer, etc.)
  │   ├── items/                # Item-related components
  │   ├── admin/                # Admin dashboard components
  │   └── shared/               # Shared components used across features
  ├── hooks/                    # Custom React hooks
  │   ├── api/                  # API-related hooks
  │   ├── form/                 # Form-related hooks
  │   └── ui/                   # UI-related hooks
  ├── services/                 # Service layer for API interactions
  │   ├── api/                  # API client and utilities
  │   ├── items/                # Item-related API services
  │   ├── auth/                 # Authentication services
  │   └── admin/                # Admin-related services
  ├── lib/                      # Library code and utilities
  ├── constants/                # Application constants and enums
  ├── types/                    # TypeScript type definitions
  ├── utils/                    # Utility functions
  ├── schemas/                  # Validation schemas
  └── model/                    # Database models
```

### Component Structure Guidelines

1. **UI Components:**

   - Small, focused, reusable
   - Accept props for customization
   - No direct API calls or business logic

2. **Container Components:**

   - Compose UI components
   - Handle data fetching via hooks
   - Manage local state

3. **Page Components:**
   - Minimal logic
   - Compose container components
   - Handle routing concerns

### Hooks Guidelines

1. **Custom Hooks:**

   - Extract reusable logic
   - Follow the `use` prefix naming convention
   - Return consistent data structures

2. **API Hooks:**
   - Wrap API services
   - Handle loading/error states
   - Provide data transformation

### Service Guidelines

1. **API Services:**
   - Encapsulate API endpoints
   - Handle request/response formatting
   - Error normalization
   - No UI or state management logic

### Benefits

- **Separation of Concerns:** Each module has a single responsibility
- **Reusability:** Components and hooks can be reused across the application
- **Maintainability:** Easier to debug and extend
- **Scalability:** New features can be added without affecting existing ones
- **Testing:** Modular components are easier to test
