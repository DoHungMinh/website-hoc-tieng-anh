# EngPro - English Learning Platform with AI Chatbot

EngPro is a comprehensive online English learning platform featuring an intelligent AI Chatbot (GoPro 4.2), IELTS exam preparation, proficiency assessment systems, and adaptive learning lessons.

## Project Status

| Component | Status | Technology |
|-----------|--------|------------|
| **Frontend Client** | Completed | React + TypeScript + Vite + CSS Modules |
| **Frontend Admin** | Completed | React + TypeScript + Vite + Tailwind CSS |
| **Backend** | Completed | Node.js + Express + MongoDB |
| **AI Chatbot** | Completed | OpenAI GPT-4 + Voice Chat |
| **IELTS System** | Completed | AI-powered exam generation |

### Development Servers
- **Client**: http://localhost:5173
- **Admin**: http://localhost:5174
- **Backend**: http://localhost:5000

## Project Architecture

```
website-hoc-tieng-anh/
├── .agent/                           # Agent documentation
│   ├── Architecture.md               # System architecture
│   ├── Overview.md                   # Project overview
│   └── Rules.md                      # Development rules
├── frontend/
│   ├── client/                       # User-facing application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── assessment/       # Proficiency tests
│   │   │   │   ├── auth/             # Login/Register
│   │   │   │   ├── chatbot/          # AI Chatbot (GoPro 4.2)
│   │   │   │   ├── common/           # Reusable UI (Logo, Buttons)
│   │   │   │   ├── dashboard/        # Progress tracking
│   │   │   │   ├── home/             # Landing page sections
│   │   │   │   ├── ielts/            # IELTS exam components
│   │   │   │   ├── layout/           # Header, Sidebar, Footer
│   │   │   │   ├── learning/         # Lessons & Practice
│   │   │   │   └── video/            # Video player
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   ├── pages/                # Page components
│   │   │   ├── services/             # API communication
│   │   │   ├── stores/               # Zustand stores
│   │   │   ├── types/                # TypeScript definitions
│   │   │   └── utils/                # Helper functions
│   │   └── ...
│   └── admin/                        # Admin dashboard
│       ├── src/
│       │   ├── components/admin/     # Admin components
│       │   │   └── dashboard/
│       │   │       ├── AIIELTSReadingCreator.tsx
│       │   │       ├── CourseManagement.tsx
│       │   │       ├── CreateIELTSExam.tsx
│       │   │       ├── DashboardStats.tsx
│       │   │       └── EditIELTSExam.tsx
│       │   ├── hooks/                # Admin hooks
│       │   ├── layouts/              # Admin layouts
│       │   ├── pages/                # Admin pages
│       │   ├── services/             # Admin API services
│       │   └── stores/               # Admin state
│       └── ...
└── backend/
    ├── src/
    │   ├── controllers/              # API Controllers
    │   ├── middleware/               # Auth, Validation
    │   ├── models/                   # Mongoose schemas
    │   ├── routes/                   # API routes
    │   ├── services/                 # Business logic
    │   ├── utils/                    # Helpers
    │   └── server.ts                 # Express server
    └── ...
```

## Key Features

### 1. AI Chatbot - GoPro 4.2
- **Intelligent Conversation**: Powered by OpenAI GPT-4
- **Voice Chat**: Speech-to-text (Whisper) and text-to-speech
- **Learning Support**: Grammar explanations, vocabulary help
- **Progress Analysis**: Personalized recommendations
- **Modern UI**: Purple gradient design with CSS Modules

### 2. IELTS Preparation System
- **Reading**: Full passages with various question types
- **Listening**: Audio-based tests with transcripts
- **Writing**: Task 1 & Task 2 practice
- **Speaking**: AI-powered speaking practice
- **AI Exam Generator**: Automatic exam creation

### 3. Entrance Assessment
- **30-minute Test**: Grammar, Vocabulary, Reading, Listening
- **Detailed Results**: Score 0-100, Level A1-C2
- **Skill Analysis**: Strength/Weakness report
- **Personalized Path**: Custom learning recommendations

### 4. Adaptive Learning
- **Dynamic Content**: Adjusts based on progress
- **Skill-based**: Focus on weak areas
- **Video Lessons**: YouTube integration
- **Practice Exercises**: Interactive quizzes

### 5. Progress Dashboard
- **Overview Stats**: Learning statistics
- **Progress Charts**: Visual tracking
- **Achievements**: Badge system
- **Streak Tracking**: Daily motivation

### 6. Admin Dashboard
- **Course Management**: Create/Edit/Delete courses
- **IELTS Creator**: AI-powered exam generation
- **User Management**: View and manage users
- **Analytics**: Platform statistics

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| CSS Modules | Component Styling |
| Tailwind CSS | Utility Styling |
| Zustand | State Management |
| React Router | Navigation |
| Lucide React | Icons |
| Socket.IO Client | Real-time |
| Axios | HTTP Client |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Framework |
| TypeScript | Type Safety |
| MongoDB | Database |
| Mongoose | ODM |
| Socket.IO | Real-time |
| OpenAI API | AI Features |
| JWT | Authentication |
| Bcrypt | Password Hashing |
| Joi | Validation |

## Installation and Execution

### Prerequisites
- Node.js 18+
- MongoDB
- Git
- OpenAI API Key

### Quick Start

```bash
# Clone repository
git clone https://github.com/DoHungMinh/website-hoc-tieng-anh.git
cd website-hoc-tieng-anh

# Install all dependencies
npm run install:all

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Run development servers
npm run dev
```

### Manual Setup

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure:
# - MONGODB_URI
# - JWT_SECRET
# - OPENAI_API_KEY
npm run dev
```

#### Frontend Client
```bash
cd frontend/client
npm install
npm run dev
```

#### Frontend Admin
```bash
cd frontend/admin
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout

### Assessment
- `POST /api/assessment/create` - Create test
- `POST /api/assessment/start/:id` - Start test
- `POST /api/assessment/submit-answer` - Submit answer
- `POST /api/assessment/complete/:id` - Complete test

### Chatbot
- `POST /api/chatbot/message` - Send message
- `GET /api/chatbot/history` - Chat history
- `POST /api/voice/chat` - Voice chat

### IELTS
- `GET /api/ielts/exams` - List exams
- `POST /api/ielts/exams` - Create exam
- `POST /api/ielts/generate` - AI generate exam

### Progress
- `GET /api/progress` - Get progress
- `PUT /api/progress/update` - Update progress

## Design System

### Colors
- **Primary Gradient**: `#6366f1 → #8b5cf6` (Indigo to Purple)
- **Background**: Light lavender gradient
- **Text**: Dark gray (`#1f2937`)

### Typography
- **Headings**: Semi-bold to Bold
- **Body**: Regular weight
- **Font**: System fonts

### Components
- **Border Radius**: 24px (large), 12px (medium), 50% (circular)
- **Shadows**: Subtle elevation with rgba

## Documentation

See the `.agent/` folder for detailed documentation:
- **Architecture.md** - System architecture
- **Overview.md** - Project overview
- **Rules.md** - Development guidelines

## Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License

## Contributors

- **DoHungMinh** - Initial work and development

---

**Happy Learning!**
