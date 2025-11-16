# 🎙️ VOICE CHAT API - TESTING GUIDE

## 📋 PREREQUISITES

### 1. Check OpenAI API Key
```bash
# Kiểm tra file .env có OPENAI_API_KEY chưa
cat backend/.env | grep OPENAI_API_KEY
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
```

Server sẽ chạy ở: `http://localhost:5002`

---

## 🧪 TEST ENDPOINTS

### **1. Test Service Status**
**Endpoint:** `GET /api/voice/test`  
**Headers:** 
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "Voice chat service is running",
    "openAIConfigured": true,
    "services": {
      "whisper": "Ready",
      "tts": "Ready",
      "voiceChat": "Ready"
    },
    "timestamp": "2025-11-15T04:15:23.456Z"
  }
}
```

**Thunder Client / Postman:**
```
Method: GET
URL: http://localhost:5002/api/voice/test
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### **2. Get Available Voices**
**Endpoint:** `GET /api/voice/voices`  
**Headers:** 
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "voices": [
      {
        "id": "alloy",
        "name": "Alloy",
        "description": "Neutral, balanced voice",
        "gender": "neutral"
      },
      {
        "id": "echo",
        "name": "Echo",
        "description": "Male, clear voice",
        "gender": "male"
      },
      // ... more voices
    ],
    "count": 6
  }
}
```

---

### **3. Transcribe Audio (STT Only)**
**Endpoint:** `POST /api/voice/transcribe`  
**Headers:** 
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Body (Form-Data):**
- Key: `audio` (File)
- Value: Chọn file audio (.mp3, .wav, .webm, .m4a)

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "transcript": "Hello, how are you today?",
    "length": 25
  }
}
```

**Thunder Client / Postman:**
```
Method: POST
URL: http://localhost:5002/api/voice/transcribe
Headers:
  Authorization: Bearer YOUR_TOKEN
Body: form-data
  audio: [Select audio file]
```

---

### **4. Text to Speech (TTS Only)**
**Endpoint:** `POST /api/voice/speak`  
**Headers:** 
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "text": "Hello! I am your English learning assistant.",
  "voice": "alloy",
  "speed": 1.0
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "audioBase64": "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA...",
    "textLength": 46
  }
}
```

**Cách test audio:**
1. Copy `audioBase64` từ response
2. Paste vào tool: https://base64.guru/converter/decode/audio
3. Click "Decode" và play audio

---

### **5. Full Voice Chat (STT → AI → TTS)**
**Endpoint:** `POST /api/voice/chat`  
**Headers:** 
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Body (Form-Data):**
- Key: `audio` (File) - File audio recording
- Key: `voice` (Text) - Voice preference: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`
- Key: `history` (Text) - Optional: `[{"role":"user","content":"hi"},{"role":"assistant","content":"hello"}]`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "transcript": "What is my current English level?",
    "response": "Based on your recent test results, your current level is B1 (Intermediate). You've completed 3 IELTS tests with an average score of 72%. Keep practicing to reach B2!",
    "audioBase64": "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA...",
    "processingTime": 8234,
    "metadata": {
      "transcriptLength": 34,
      "responseLength": 156,
      "voice": "alloy"
    }
  }
}
```

**Thunder Client / Postman:**
```
Method: POST
URL: http://localhost:5002/api/voice/chat
Headers:
  Authorization: Bearer YOUR_TOKEN
Body: form-data
  audio: [Select audio file - ví dụ: test-audio.wav]
  voice: alloy
```

---

## 🎤 TẠO FILE AUDIO TEST

### **Option 1: Record từ máy tính**
1. Mở Sound Recorder (Windows) hoặc QuickTime (Mac)
2. Record câu: "What is my current English level?"
3. Save as .wav hoặc .mp3

### **Option 2: Dùng Online Voice Recorder**
1. Truy cập: https://online-voice-recorder.com/
2. Click "Record" → Nói tiếng Anh
3. Click "Stop" → "Save" → Download file

### **Option 3: Convert text to audio (để test nhanh)**
1. Truy cập: https://ttsmp3.com/
2. Nhập text: "Hello, I want to practice English conversation"
3. Select voice: English (US)
4. Download MP3

---

## 🔐 LẤY JWT TOKEN

### **Cách 1: Từ Frontend**
1. Login vào web: http://localhost:5173
2. Mở DevTools (F12) → Console
3. Gõ: `localStorage.getItem('token')`
4. Copy token

### **Cách 2: Test login endpoint**
```
POST http://localhost:5002/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

Response sẽ có `token` → Copy và dùng

---

## 📊 EXPECTED FLOW

```
1. User gửi audio file
   ↓
2. Backend nhận file → Save to temp/uploads/
   ↓
3. Whisper STT → Chuyển audio thành text
   ↓
4. AI Service → Xử lý text, generate response
   ↓
5. TTS → Chuyển response thành audio
   ↓
6. Return audioBase64 + transcript + response
   ↓
7. Delete temp files
```

---

## ⚠️ TROUBLESHOOTING

### **Error: "OpenAI API key not configured"**
**Fix:** Add OPENAI_API_KEY vào file `.env`
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

### **Error: "Audio file is required"**
**Fix:** 
- Đảm bảo chọn đúng field name: `audio` (không phải `file`)
- File phải là audio format: .mp3, .wav, .webm, .m4a

### **Error: "Only audio files are allowed"**
**Fix:**
- Check file extension
- File size < 25MB

### **Error: "Authentication required"**
**Fix:**
- Thêm Header: `Authorization: Bearer YOUR_TOKEN`
- Token phải valid và chưa expire

### **Response chậm (> 10s)**
**Bình thường!** Voice chat flow:
- Whisper STT: ~2-3s
- GPT Processing: ~3-5s
- TTS: ~2-3s
- **Total: 8-12 giây là OK**

---

## 💰 COST ESTIMATION

Mỗi voice chat session 5 phút (~10 turns):

| Service | Cost per request | Total (10 requests) |
|---------|------------------|---------------------|
| Whisper STT | $0.006/min | $0.30 |
| GPT-4o Mini | ~$0.0025 | $0.025 |
| TTS | $0.000015 | $0.00015 |
| **TOTAL** | | **~$0.32** |

---

## ✅ SUCCESS CRITERIA

- [x] `/api/voice/test` returns status "Ready"
- [x] `/api/voice/voices` returns 6 voices
- [x] `/api/voice/transcribe` converts audio → text
- [x] `/api/voice/speak` converts text → audio (base64)
- [x] `/api/voice/chat` full flow STT → AI → TTS (8-12s)

---

## 🚀 NEXT STEPS

Sau khi test backend OK:
1. Implement frontend components (VoiceChat.tsx)
2. Add voice button vào chatbot UI
3. Test browser compatibility
4. Add usage tracking và billing

---

**Happy Testing! 🎉**

Nếu có lỗi, check:
1. Backend logs (terminal running `npm run dev`)
2. Network tab trong DevTools
3. Response error message
