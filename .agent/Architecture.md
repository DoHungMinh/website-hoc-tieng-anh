# EngPro System Architecture

## 1. Executive Summary

This document outlines the technical architecture for **EngPro**, a comprehensive English Learning Platform with AI-powered features. The system adopts a monorepo structure with two separate frontend applications (Client & Admin) and a unified Node.js/Express backend. Key design goals include high interactivity, scalability, IELTS exam preparation, and personalized learning experiences powered by AI integration.

## 2. Technology Stack

### 2.1 Frontend (Client & Admin)
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules + Tailwind CSS
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
- **AI Integration**: OpenAI API (GPT-4, Whisper, TTS)
- **Auth**: JWT + Bcrypt
- **Validation**: Joi

## 3. Project Structure

```
website-hoc-tieng-anh/
├── .agent/                          # Agent documentation
│   ├── Architecture.md              # This file
│   ├── Overview.md                  # Project overview
│   └── Rules.md                     # Development rules
├── frontend/
│   ├── client/                      # User-facing application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── assessment/      # Proficiency tests
│   │   │   │   ├── auth/            # Login/Register
│   │   │   │   ├── chatbot/         # AI Chatbot (GoPro 4.2)
│   │   │   │   ├── common/          # Reusable UI (Logo, Buttons)
│   │   │   │   ├── dashboard/       # Progress tracking
│   │   │   │   ├── home/            # Landing page sections
│   │   │   │   ├── ielts/           # IELTS exam components
│   │   │   │   ├── layout/          # Header, Sidebar, Footer
│   │   │   │   ├── learning/        # Lessons & Practice
│   │   │   │   └── video/           # Video player components
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   ├── pages/               # Page components
│   │   │   ├── services/            # API communication
│   │   │   ├── stores/              # Zustand stores
│   │   │   ├── types/               # TypeScript definitions
│   │   │   └── utils/               # Helper functions
│   │   └── ...
│   └── admin/                       # Admin dashboard application
│       ├── src/
│       │   ├── components/
│       │   │   └── admin/
│       │   │       └── dashboard/   # Admin management components
│       │   │           ├── AIIELTSReadingCreator.tsx
│       │   │           ├── CourseManagement.tsx
│       │   │           ├── CreateIELTSExam.tsx
│       │   │           ├── DashboardStats.tsx
│       │   │           └── EditIELTSExam.tsx
│       │   ├── contexts/            # React contexts
│       │   ├── hooks/               # Admin-specific hooks
│       │   ├── layouts/             # Admin layouts
│       │   ├── pages/               # Admin pages
│       │   ├── services/            # Admin API services
│       │   ├── stores/              # Admin state
│       │   └── utils/               # Admin utilities
│       └── ...
└── backend/
    ├── src/
    │   ├── controllers/             # API Controllers (13 files)
    │   ├── middleware/              # Auth, Validation (5 files)
    │   ├── models/                  # Mongoose schemas (9 files)
    │   ├── routes/                  # API routes (13 files)
    │   ├── services/                # Business logic (9 files)
    │   ├── utils/                   # Helpers (3 files)
    │   ├── server.ts                # Express server setup
    │   └── index.ts                 # Entry point
    └── ...
```

## 4. Frontend Architecture

### 4.1 Client Application
The client application serves end-users with learning features:

- **Assessment**: Placement tests, scoring, adaptive difficulty
- **Learning**: Lessons, vocabulary, grammar exercises
- **IELTS**: Full IELTS exam simulation (Reading, Listening, Writing, Speaking)
- **Dashboard**: Progress visualization, achievements, streaks
- **Chatbot**: AI-powered assistant "GoPro 4.2" with voice support

### 4.2 Admin Application
The admin application provides management capabilities:

- **Course Management**: Create, edit, delete courses
- **IELTS Exam Creator**: AI-powered exam generation
- **User Management**: View and manage user accounts
- **Statistics Dashboard**: Platform analytics

### 4.3 State Management Pattern

**Client State (Zustand)**:
- Session: User tokens, profile
- UI: Theme, sidebar, modals
- Logic: Timer status, current lesson step

**Server State (API + Caching)**:
- Course data, lessons
- User progress
- Chat history

### 4.4 Component Styling
- **CSS Modules**: For component-specific styles (e.g., `Chatbot.module.css`)
- **Tailwind CSS**: For utility-first styling where needed

## 5. Backend Architecture

### 5.1 MVC Pattern
- **Models**: Mongoose schemas (User, Course, Lesson, Progress, IELTSExam, etc.)
- **Controllers**: Request handlers with business logic
- **Routes**: RESTful API endpoint definitions
- **Services**: Isolated business logic (AI, Email, Payment)

### 5.2 Key Services
- **AI Service**: OpenAI integration for chatbot, exam generation
- **Voice Chat API**: Speech-to-text and text-to-speech
- **Payment Service**: VNPay integration
- **Email Service**: Nodemailer for notifications

### 5.3 API Design
- **RESTful**: Resource-based endpoints
- **Authentication**: JWT in Authorization header
- **Real-time**: Socket.IO for chat and notifications

## 6. AI Features

### 6.1 GoPro 4.2 Chatbot
- Text-based conversation
- Voice chat with Whisper (STT) and TTS
- Context-aware responses
- Learning progress analysis

### 6.2 IELTS AI Generator
- Automatic reading passage generation
- Question generation (Multiple choice, True/False/Not Given, etc.)
- Writing prompt generation
- Speaking topic generation

## 7. Development Standards

- **TypeScript**: Strict typing for all Props, State, API responses
- **Component Design**: Functional components with Hooks
- **Styling**: CSS Modules preferred, Tailwind for utilities
- **File Naming**: 
  - Components: PascalCase (`Button.tsx`)
  - Non-components: camelCase (`authService.ts`)
  - CSS Modules: `ComponentName.module.css`

---
*EngPro Platform Architecture Documentation - Updated December 2025*
