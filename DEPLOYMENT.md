# 🚀 Deployment Guide

## Hướng dẫn triển khai dự án lên Vercel

### 1. Chuẩn bị triển khai

```bash
# Cài đặt dependencies cho toàn bộ dự án
npm run install:all

# Build frontend
npm run build:frontend

# Test production build locally
cd frontend && npm run preview
```

### 2. Vercel Configuration

Tạo file `vercel.json` trong root folder:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ]
}
```

### 3. Environment Variables

Trong Vercel Dashboard, cần setup các biến môi trường:

```
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=https://your-domain.vercel.app
```

### 4. Build Commands

- **Frontend Build Command**: `cd frontend && npm run build`
- **Backend Build Command**: `cd backend && npm run build`
- **Install Command**: `npm run install:all`

### 5. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```
