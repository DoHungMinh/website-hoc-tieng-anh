# COPILOT CONTEXT - WEBSITE_HOC_TIENG_ANH_PROJECT
Tài liệu này cung cấp bối cảnh kỹ thuật toàn diện của dự án WEBSITE_HOC_TIENG_ANH để GitHub Copilot có thể hỗ trợ hiệu quả nhất.
## 1\. Cách chạy dự án 
[cite\_start]Dự án bao gồm hai phần chính: frontend (React) và backend (Node.js + Express + MongoDB). Dưới đây là hướng dẫn chi tiết để thiết lập, chạy và khởi động lại cả hai phần trong terminal.
frontend: cd frontend; npm run dev
backend: cd backend; npm run dev
[cite\_start]Trước khi trả lời tôi hãy đọc qua kỹ file .env của backend nhé 

## 2\. Trước khi trả lời và làm việc với dự án
[cite\_start] Trước khi trả lời tôi hãy đọc qua kỹ file README.md trong thư mục docs nhé
[cite\_start] Trước khi làm việc với dự án hãy nhớ là luôn phải giữ được logic, ui, ux và tông màu giao diện ban đầu của dự án nhé. Đừng thay đổi giao diện và tông màu của dự án khi chưa có sự đồng ý của tôi nhé.
[cite\_start] Trước khi làm việc với dự án hãy nhớ là luôn phải giữ được cấu trúc thư mục và file ban đầu của dự án nhé. Đừng thay đổi cấu trúc thư mục và file của dự án khi chưa có sự đồng ý của tôi nhé.
[cite\_start] Trước khi làm việc với dự án hãy nhớ là luôn phải giữ được các tiêu chuẩn code ban đầu của dự án nhé. Đừng thay đổi các tiêu chuẩn code của dự án khi chưa có sự đồng ý của tôi nhé.
[cite\_start] Trước khi trả lời các câu hỏi của tôi đừng có tự ý tạo file .md mà hãy trả lời chi tiết và dễ hiểu cho tôi trực tiếp luôn chứ đừng có tạo file . 
[cite\_start] Khi tôi muốn hỏi 1 chủ đề, hay vấn đề gì đấy, đừng tự ý làm gì chỉnh sửa hay tác động vào code luôn mà hãy trình bày ra hướng giải quyết và hỏi tôi xem tôi có đồng ý không đã nhé. Chỉ khi nào tôi đồng ý thì bạn mới được phép làm theo hướng giải quyết đó thôi nhé.
[cite\_end]
## 3\. VIDEO LISTENING EXERCISE - TECHNICAL SPECIFICATION
[cite\_start] Trước khi làm việc với tính năng VIDEO LISTENING EXERCISE hãy đọc kỹ file VIDEO_LISTENING_EXERCISE_TECHNICAL_SPECIFICATION này nhé:

1. TỔNG QUAN
Bài tập luyện nghe dựa trên video YouTube
User điền từ/câu vào ô trống sau khi nghe
Free, educational, pure listening practice
2. ADMIN WORKFLOW
Tạo exercise:

-Chọn video YouTube
-Download file .srt từ downsub.com
-Edit file .srt: Thay từ cần blank → [[answer]]
I am [[running]] to the store.
-Upload: YouTube URL + file .srt đã edit
-System auto-parse và publish
Validation rules:

✅ File .srt format
✅ Syntax: [[answer]] (answer = đáp án đúng)
✅ Max 1 blank/câu
✅ Timing không overlap
3. USER WORKFLOW
Flow:

-Chọn video từ library
-Click "Start" → Video play, KHÔNG HIỆN subtitle
Đến câu có blank:
Video chạy đến hết câu (endTime)
Video TỰ ĐỘNG PAUSE
Hiện câu: "I am _____ to the store."
-User điền đáp án
[🔊 Replay] button: Nghe lại đúng câu đó (từ startTime → endTime)
-Click "Check":
✅ Đúng: Hiện từ màu xanh → Auto continue sau 2s
❌ Sai: Hiện đáp án màu đỏ → [Try Again] hoặc [Continue]
-Video resume → Lặp lại cho blank tiếp theo
-Hết blanks → Summary screen (score, details)

4. DATA STRUCTURE
// File .srt format
1
00:00:01,500 --> 00:00:04,200
I am [[running]] to the store.

// Parsed to:
interface SubtitleBlock {
  index: number;
  startTime: number;        // 1.5 (giây)
  endTime: number;          // 4.2
  originalText: string;     // "I am [[running]] to the store."
  displayText: string;      // "I am _____ to the store."
  hasBlank: boolean;
  answer?: string;          // "running"
}

// Database model
interface VideoExercise {
  youtubeId: string;
  title: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  topics: string[];
  subtitles: SubtitleBlock[];
  blankCount: number;
}

5. ANSWER VALIDATION
// Normalize & compare
function checkAnswer(userInput: string, correctAnswer: string): boolean {
  const normalize = (text: string) => text
    .toLowerCase()              // "Running" → "running" ✅
    .trim()                     
    .replace(/[.,!?;:'"]/g, ''); // Remove punctuation
  
  return normalize(userInput) === normalize(correctAnswer);
}

// ✅ ĐÚNG: "Running", "running.", "  running  "
// ❌ SAI: "run" (khác word form), "runing" (spelling error)
6. KEY FEATURES
Pause timing: Sau khi hết câu (endTime)

Replay: Nghe lại ĐÚNG CÂU có blank (startTime → endTime)

Subtitle: Ẩn khi video chạy, chỉ hiện khi pause

Blank rules: 1 blank/câu maximum

Answer matching: Case-insensitive, strip punctuation, exact word

7. TECH STACK
Backend:

Parse .srt: Extract timing, text, answer
Validate: Syntax, timing, blank count
API: CRUD video exercises
Frontend:

YouTube IFrame API
Monitor currentTime (100ms interval)
Pause at endTime
Replay: seekTo(startTime) + play + auto-pause at endTime
Libraries needed:

react-youtube (YouTube player wrapper)
SRT parser (custom hoặc library)
8. VALIDATION CHECKLIST
 File .srt format, UTF-8
 Timing: HH:MM:SS,mmm format
 Blank syntax: [[answer]] correct
 Max 1 blank/sentence
 Answer not empty
 No unmatched brackets

WORKFLOW TÓM TẮT:
Admin: Video URL + .srt [[answer]] → Upload → System parse
User: Chọn video → Play (no sub) → Pause at blank → Điền/Replay → Check → Continue

[cite\_end]