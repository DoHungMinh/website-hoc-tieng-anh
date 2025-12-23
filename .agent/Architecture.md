# EngPro System Architecture

## 1. Executive Summary

This document outlines the technical architecture for **EngPro**, a modern specific English Learning Platform. The system adopts a monolithic monorepo structure, integrating a React-based frontend with a Node.js/Express backend. Key design goals include high interactivity, scalability, and personalized learning experiences powered by AI integration.

## 2. Technology Stack

### 2.1 Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios

### 2.2 Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Real-time**: Socket.IO
- **AI Integration**: OpenAI API
- **Auth**: JWT + Bcrypt

## 3. Frontend Architecture

The frontend application (`frontend/`) uses a modular, feature-based directory structure to ensure maintainability and separation of concerns.

### 3.1 Directory Structure

```
frontend/
├── src/
│   ├── components/              # UI Components
│   │   ├── assessment/          # Assessment & Testing features
│   │   ├── auth/                # Authentication forms
│   │   ├── common/              # Reusable UI primitives (Buttons, Inputs)
│   │   ├── dashboard/           # Progress tracking & Analytics
│   │   ├── layout/              # Structural layouts (Header, Sidebar)
│   │   ├── learning/            # Lessons & Practice interface
│   │   └── chatbot/             # AI Chat interface
│   ├── config/                  # App configuration (Environment)
│   ├── hooks/                   # Custom logic hooks
│   ├── pages/                   # Page-level components
│   ├── services/                # API communication layer
│   │   ├── api.ts               # Axios instance & interceptors
│   │   └── *Service.ts          # Domain-specific API methods
│   ├── stores/                  # Global state (Zustand)
│   │   ├── useAuthStore.ts
│   │   ├── useLessonStore.ts
│   │   └── useUIStore.ts
│   ├── types/                   # TypeScript definitions
│   └── utils/                   # Helper functions
└── ...
```

### 3.2 State Management & Data Fetching (Optimized Pattern)

The architecture strictly separates **Client State** (UI/Session) and **Server State** (Data Cache) to ensure optimal performance and code maintainability.

#### 1. Server State: React Query
- **Role**: Manages all asynchronous data (fetching, caching, synchronizing).
- **Strategy**:
  - **Stale-while-revalidate**: Data is served immediately from cache while updating in the background.
  - **Window Focus Refetch**: Ensures data freshness when the user returns to the tab.
  - **Optimistic Updates**: Immediate UI feedback for mutations (e.g., submitting a quiz answer) before the server response confirms.

#### 2. Client State: Zustand
- **Role**: Manages synchronous global state.
- **Scope**:
  - **Session**: User tokens, profile summaries.
  - **UI**: Theme toggles, sidebar visibility, modal states.
  - **Logic**: Ephemeral logic like "current active lesson step" or "timer status".
- **Optimization**: Uses atomic selectors to prevent unnecessary re-renders (components only re-render when their specific slice changes).

### 3.3 Feature Modules
- **Assessment**: Contains logic for placement tests, scoring algorithms, and adaptive difficulty adjustments.
- **Learning**: The core system for lesson delivery, supporting diverse question types including Grammar, Vocabulary, and Listening exercises.
- **Dashboard**: Visualizes user progress through interactive charts and graphs.
- **Chatbot**: Provides a real-time interface for communication with the backend AI service.

## 4. Backend Architecture

### 4.1 MVC Pattern
- **Models**: structured Mongoose schemas that define data shape and validation rules.
- **Controllers**: Request handlers encapsulating business logic.
- **Routes**: API endpoint definitions that map URLs to specific controllers.
- **Services**: Isolated business logic layer, separated from HTTP transport concerns.

### 4.2 API Design
- **RESTful**: Adheres to standard resource-based endpoint conventions.
- **Secure**: All protected routes require a valid JWT passed in the Authorization header.

## 5. Development Standards

- **TypeScript**: Enforces strict typing for all Props, State, and API Responses to ensure code reliability.
- **Component Design**: Utilizes functional components with Hooks for modern React development.
- **Styling**: CSS Modules
- **File Naming**: Uses CamelCase for non-component files (`authService.ts`) and PascalCase for components (`Button.tsx`).

---
*EngPro Platform Architecture Documentation*
