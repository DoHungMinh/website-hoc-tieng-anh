# Hướng dẫn & Nguyên tắc Phát triển - ENGPRO

Tài liệu này định nghĩa các tiêu chuẩn, nguyên tắc và hướng dẫn tối ưu hóa để đảm bảo **ENGPRO** đạt hiệu suất cao, code chất lượng và trải nghiệm người dùng xuất sắc.

---

## 1. Tầm nhìn & Quy mô (Scope)

**ENGPRO** bao gồm 2 ứng dụng frontend và 1 backend:

| Application | Mục đích | Port |
|-------------|----------|------|
| **Client** | Giao diện người học | 5173 |
| **Admin** | Bảng điều khiển quản trị | 5174 |
| **Backend** | API Server | 5000 |

### Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + Zustand + CSS Modules
- **Backend**: Node.js + Express + MongoDB + Socket.IO
- **AI**: OpenAI API (GPT-4, Whisper, TTS)
- **Architecture**: Modular Feature-based structure

---

## 2. Nguyên tắc Cốt lõi (Core Principles)

### Performance First

- **Lazy Loading**: `React.lazy` + `Suspense` cho route pages và heavy components
- **Asset Optimization**:
  - Images: WebP/AVIF format
  - Icons: Import cụ thể từ `lucide-react` (không import *)
- **Minimize Re-renders**:
  - `useMemo` cho logic tính toán phức tạp
  - `useCallback` cho event handlers
  - Zustand atomic selectors

### Visual & UX Excellence

- **Loading States**: Skeleton UI, Progress indicators, Typing indicators
- **Feedback**: Toast notifications cho actions
- **Micro-interactions**: Hover effects, transitions
- **Accessibility**: Semantic HTML, keyboard navigation

### Clean Code & Maintainability

- **TypeScript Strict Mode**: Không dùng `any`
- **Separation of Concerns**:
  - UI Components: Chỉ render
  - Hooks: Logic xử lý
  - Services: API calls
  - Stores: Global state

---

## 3. Quy chuẩn Đặt tên (Naming Conventions)

### React Components & Files

| Element | Convention | Example |
|---------|------------|---------|
| **Components** | PascalCase | `LessonCard`, `ChatBubble` |
| **Component Files** | PascalCase + `.tsx` | `LessonCard.tsx` |
| **Pages** | PascalCase + `Page` | `CoursePage.tsx` |

### Hooks & Stores

| Element | Convention | Example |
|---------|------------|---------|
| **Custom Hooks** | `use` + PascalCase | `useTimer.ts`, `useAudioRecorder.ts` |
| **Zustand Stores** | `use` + Entity + `Store` | `useAuthStore.ts` |

### Styling (CSS Modules)

| Element | Convention | Example |
|---------|------------|---------|
| **File Name** | ComponentName + `.module.css` | `Chatbot.module.css` |
| **Class Name** | camelCase | `.chatWindow`, `.messageBubble` |

```tsx
// Usage
import styles from './Chatbot.module.css';

<div className={styles.chatWindow}>
  <div className={styles.messageBubble}>Hello</div>
</div>
```

### Variables & Functions

| Element | Convention | Example |
|---------|------------|---------|
| **State variables** | camelCase | `currentLesson`, `isRecording` |
| **Boolean** | `is`, `has`, `should` | `isCompleted`, `hasError` |
| **Event Handlers** | `handle` + Action | `handleSend`, `handleClose` |

---

## 4. Quản lý State

### Zustand (Client State)

Sử dụng cho state đồng bộ và global. **Luôn dùng atomic selectors**:

```typescript
// BAD: Re-render khi bất kỳ property thay đổi
const { token, user } = useAuthStore();

// GOOD: Chỉ render lại khi 'token' thay đổi
const token = useAuthStore((state) => state.token);
```

### API Communication

- Sử dụng `apiService` cho HTTP calls
- Handle errors với try/catch
- Show loading states

---

## 5. Styling Guidelines

### CSS Modules (Ưu tiên)

Sử dụng cho component-specific styles:

```css
/* Chatbot.module.css */
.chatWindow {
  position: fixed;
  bottom: 24px;
  right: 24px;
  /* ... */
}
```

### Tailwind CSS

Sử dụng cho utility-first styles nhanh:

```tsx
<div className="flex items-center gap-4 p-4">
```

### Design Tokens

| Token | Value |
|-------|-------|
| **Primary Gradient** | `#6366f1 → #8b5cf6` (Purple) |
| **Border Radius** | 24px (cards), 50% (buttons) |
| **Shadows** | `0 10px 40px rgba(0,0,0,0.15)` |

---

## 6. Xử lý Lỗi (Error Handling)

1. **API Interceptor**: Auto refresh token, redirect on 401
2. **Try/Catch**: Wrap all async operations
3. **User Feedback**: Toast messages cho errors
4. **Error Boundaries**: Wrap major sections

---

## 7. File Structure by Feature

```
components/
├── chatbot/
│   ├── Chatbot.tsx           # Main component
│   ├── Chatbot.module.css    # Styles
│   ├── VoiceChat.tsx         # Voice feature
│   └── VoiceVisualizer.tsx   # Audio visualization
├── ielts/
│   ├── IELTSReading.tsx
│   ├── IELTSListening.tsx
│   └── ...
```

---

## 8. Git Workflow

### Branching
- `feature/feature-name`
- `bugfix/issue-name`
- `hotfix/urgent-fix`

### Commit Messages
```
feat: Add voice chat to chatbot
fix: Correct IELTS timer issue
style: Update chatbot CSS to purple theme
refactor: Move auth logic to custom hook
docs: Update README with new features
```

---

## 9. Testing Checklist

- Console.log đã được xóa
- Type check clean (no implicit any)
- Responsive trên Mobile/Tablet
- Loading states hoạt động
- Error handling đầy đủ

---

## Final Checklist Before Merge

- [ ] Clear console.log debugging
- [ ] Type check clean
- [ ] Linting passed
- [ ] Tested on Mobile/Tablet
- [ ] Optimized images & assets
- [ ] No hardcoded values

---

**Mục tiêu**: Xây dựng nền tảng EngPro nhanh, mượt mà và tin cậy để đồng hành cùng người học mỗi ngày!

---
*EngPro Development Rules - Updated December 2025*
