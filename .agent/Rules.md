# 🎯 Hướng dẫn & Nguyên tắc Phát triển CLIENT - ENGPRO

Tài liệu này định nghĩa các tiêu chuẩn, nguyên tắc và hướng dẫn tối ưu hóa để đảm bảo Frontend **ENGPRO** đạt hiệu suất cao, code chất lượng và trải nghiệm người dùng xuất sắc.

***

## 1. Tầm nhìn & Quy mô (Scope)

**ENGPRO Client** là giao diện người dùng cho nền tảng học tiếng Anh trực tuyến, tích hợp AI Chatbot làm gia sư ảo, hệ thống đánh giá năng lực và lộ trình học tập thích ứng.

- **Tech Stack**: React 18 + Vite + TypeScript + Zustand + React Query + Axios + CSS Modules
- **Architecture**: Modular Feature-based structure
- **Target**: High interactivity, Sub-3s load time, Accessibility First

***

## 2. Nguyên tắc Cốt lõi (Core Principles)

### 🚀 Performance First (Tối ưu Hiệu năng)

- **Lazy Loading**: Áp dụng `React.lazy` và `Suspense` cho các module chính:
    - Route Pages: `AuthPage`, `Dashboard`, `CourseApp`, `Chatbot`
    - Heavy Components: `VideoPlayer`, `PDFViewer`, `ChartComponents`
- **Asset Optimization**:
    - **Images**: Sử dụng format WebP/AVIF.
    - **Icons**: Import specific icons từ `lucide-react` để tree-shaking hiệu quả (e.g., `import { User } from 'lucide-react'` thay vì import *)
- **Minimize Re-renders**:
    - Sử dụng `useMemo` cho các logic tính toán điểm số, thống kê tiến độ phức tạp.
    - `useCallback` cho các function tương tác user (submit answer, play audio).
    - Tách biệt state: Dùng Zustand stores nhỏ gọn thay vì một store khổng lồ để tránh re-render không cần thiết.

### 🎨 Visual & UX Excellence

- **Loading States**:
    - **Skeleton UI**: Cho danh sách bài học, dashboard cards.
    - **Progress Indicators**: Cho tải bài học, video buffering.
    - **Typing Indicators**: Cho AI Chatbot để tạo cảm giác hội thoại tự nhiên.
- **Feedback & Notifications**:
    - Toast notifications cho: nộp bài thành công/thất bại, đạt achievement mới, lỗi kết nối.
    - **Micro-interactions**: Hiệu ứng khi chọn đáp án đúng/sai, hover bài học, streak update.
- **Accessibility (A11y)**:
    - Semantic HTML (`<main>`, `<article>`, `<button>`).
    - Keyboard navigation cho bài kiểm tra và điều khiển video.

### 🛠 Clean Code & Maintainability

- **TypeScript Strict Mode**:
    - Defines Interface/Type rõ ràng cho Course, Lesson, UserProfile.
    - Không dùng `any` trừ trường hợp bất khả kháng (và phải có comment giải thích).
- **Separation of Concerns**:
    - **UI Components**: Chỉ render UI.
    - **Hooks**: Chứa logic xử lý (e.g., `useLessonProgress`, `useAudioRecorder`).
    - **Services**: Gọi API (`courseService`, `authService`).
    - **Stores**: Quản lý state toàn cục (`useAuthStore`, `useLessonStore`).

***

## 3. Quy chuẩn Đặt tên (Naming Conventions)

### ⚛️ React Components & Files

| Element | Convention | Example |
| :-- | :-- | :-- |
| **Components** | PascalCase | `LessonCard`, `QuizModal`, `ChatBubble` |
| **Component Files** | PascalCase + `.tsx` | `LessonCard.tsx`, `AudioPlayer.tsx` |
| **Pages** | PascalCase + `Page` | `CoursePage.tsx`, `ProfilePage.tsx` |

### 🪝 Hooks & Stores

| Element | Convention | Example |
| :-- | :-- | :-- |
| **Custom Hooks** | `use` + PascalCase | `useTimer.ts`, `useSpeechRecognition.ts` |
| **Zustand Stores** | `use` + Entity + `Store` | `useAuthStore.ts`, `useCourseStore.ts` |

### 📦 Types & Interfaces

| Element | Convention | Example |
| :-- | :-- | :-- |
| **Interfaces/Types** | PascalCase | `User`, `Lesson`, `CourseProgress` |
| **Props Interface** | ComponentName + `Props` | `LessonCardProps`, `ButtonProps` |

### 🎨 Styling (CSS Modules)

| Element | Convention | Example |
| :-- | :-- | :-- |
| **File Name** | ComponentName + `.module.css` | `LessonCard.module.css` |
| **Class Name** | camelCase | `.lessonCard`, `.submitButton` |

```tsx
// Usage
import styles from './LessonCard.module.css';

<div className={styles.lessonCard}>
  <button className={styles.submitButton}>Submit</button>
</div>
```

***
### 🔤 Variables & Functions

| Element | Convention | Example |
| :-- | :-- | :-- |
| **State variables** | camelCase | `currentLesson`, `isRecording`, `score` |
| **Boolean** | `is`, `has`, `should` | `isCompleted`, `hasPassed`, `shouldShowHint` |
| **Event Handlers** | `handle` + Action | `handleSubmitAnswer`, `handlePlayAudio` |
## 4. Quản lý State & API (Tối ưu hóa Hiệu suất)

### 🐻 Zustand (Client State - Atomic & Lightweight)

Sử dụng cho state **đồng bộ** và **global** của client.
**QUAN TRỌNG**: Luôn sử dụng atomic selectors khi lấy state để tránh re-render thừa.

```typescript
// ❌ BAD: Lấy cả object store -> Component map render lại khi bất kỳ property nào thay đổi
const { token, user } = useAuthStore();

// ✅ GOOD: Atomic Selectors -> Chỉ render lại khi 'token' thay đổi
const token = useAuthStore((state) => state.token);
```

### 📡 React Query (Server State - Caching & Synchronization)

Sử dụng cho **mọi** thao tác gọi API. Tuyệt đối **không** lưu API data vào Zustand trừ khi cần transform phức tạp dùng chung nhiều nơi.

**Chiến lược tối ưu:**
1.  **Stale Time**: Config `staleTime` hợp lý (e.g., `Infinity` cho static data như danh sách tỉnh thành, 5 phút cho danh sách khóa học).
2.  **Prefetching**: Prefetch data khi user hover vào link hoặc component chuẩn bị mount.
3.  **Optimistic Updates**: Update UI ngay lập tức khi user tương tác (like, submit) trước khi server phản hồi.

```typescript
// hooks/useCourses.ts
export const useCourses = (level: string) => {
  return useQuery({
    queryKey: ['courses', level],
    queryFn: () => courseService.getCoursesByLevel(level),
    staleTime: 5 * 60 * 1000, // Data được coi là "tươi" trong 5 phút
    gcTime: 10 * 60 * 1000,   // Cache giữ trong 10 phút trước khi dọn dẹp
    placeholderData: keepPreviousData, // Tránh layout shift khi filter/pagination
  });
};
```

***

## 5. Xử lý Lỗi (Error Handling)

### 🛡️ Global Error Handling

1. **API Interceptor (Axios)**:
   - Tự động refresh token khi hết hạn (401).
   - Redirect về login nếu refresh thất bại.
   - Toast error message chung cho 500 errors.

2. **React Query `onError`**:
   - Hiển thị toast cụ thể cho từng query/mutation thất bại (e.g., "Nộp bài thất bại, vui lòng thử lại").

3. **Error Boundaries**:
   - Wrap các section chính (`CoursePlayer`, `Dashboard`) để crash cục bộ không làm sập cả app.

***

## 6. Tối ưu Performance (Optimization)

### 🔄 React Optimizations

1. **useMemo/useCallback**:
   - Dùng cho các list render nặng như `VocabularyList` (hàng trăm từ).
   - Dùng cho các hàm được truyền xuống `VideoControl` components.

2. **React.memo**:
   - Áp dụng cho `QuestionCard` trong bài test để tránh re-render khi timer chạy.

### 📦 Code Splitting

- Sử dụng Dynamic Import cho các bộ thư viện nặng (nếu có) như chart lib hoặc PDF reader.
- Lazy load các modal ít dùng (ví dụ: `CertificateModal`).

***

## 7. Testing Checklist

- ✅ **Unit Tests**: Kiểm tra logic tính điểm, utility functions (`formatTime`, `calculateLevel`).
- ✅ **Component Tests**: Kiểm tra render `QuestionCard`, `ChatInput`.
- ✅ **Integration Tests**: Kiểm tra luồng `Login` -> `Dashboard` -> `Start Lesson`.
- ✅ **E2E Tests**: Kiểm tra critical path: Đăng ký -> Làm bài test đầu vào -> Nhận kết quả.

***

## 8. Git Workflow

- **Branching**: `feature/feature-name`, `bugfix/issue-name`.
- **Commit Messages**: `type: description`
    - `feat: Implement voice recognition for speaking practice`
    - `fix: Correct typo in placement test result`
    - `style: Update lesson card gradients`
    - `refactor: Move auth logic to custom hook`

***

## ✅ Final Checklist Before Merge

- [ ] Clear console.log debugging.
- [ ] Type check clean (no implicit any).
- [ ] Linting passed.
- [ ] Verified on Mobile/Tablet sizes.
- [ ] Optimized images & assets.

***

**🎯 Mục tiêu**: Xây dựng nền tảng EngPro nhanh, mượt mà và tin cậy để đồng hành cùng người học mỗi ngày!
