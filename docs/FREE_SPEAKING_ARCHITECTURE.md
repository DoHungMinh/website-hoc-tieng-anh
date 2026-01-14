# 🎤 FREE SPEAKING - PRONUNCIATION SCORING SYSTEM
## Architecture & Implementation Guide

---

## 📋 OVERVIEW

Free Speaking là tính năng luyện nói tự do theo 3 topics (Food, Family, Animals). User ghi âm 44s, hệ thống tự động chấm điểm IELTS 4 criteria (Pronunciation, Fluency, Vocabulary, Grammar) và hiển thị chi tiết từng từ.

**Chiến lược:** Tận dụng 80% kiến trúc từ **Prompt Practice** đã có sẵn.

---

## 🎯 CORE FLOW

```
User clicks topic → Record 44s audio → Submit
  ↓
Backend receives audio (webm/mp3)
  ↓
1. Upload to Cloudinary (permanent storage)
2. Download MP3 từ Cloudinary (Speechace yêu cầu MP3)
3. Transcribe với OpenAI Whisper → text
4. Score pronunciation/fluency với Speechace Pro API (dùng transcript làm reference)
   → Trả về: quality_score, pronunciation_score, fluency_score, word_score_list
   → Mỗi word có syllable_score_list với extent [start_ms, end_ms]
5. Detect pauses từ word timing gaps (syllable extent)
6. Score vocabulary/grammar với OpenAI GPT-4
7. Convert Speechace scores (0-100) → IELTS (0-9)
8. Save to FreeSpeakingSession DB
9. Cleanup temp files
10. Return results to frontend
  ↓
Display: Score cards + Word boxes + Transcript + Pause markers + Audio player
```

---

## 🔑 API STRATEGY: Pro API + GPT-4 Hybrid

**Why this approach:**
- ✅ **Speechace Pro API ($8):** Pronunciation + Fluency + Word-level timing
- ✅ **GPT-4:** Vocabulary + Grammar scoring (IELTS-aligned prompts)
- ✅ **Pause detection:** Calculate from `syllable_score_list.extent` gaps
- ❌ **No need Premium API:** Pro + GPT-4 đủ cho Free Speaking use case

**Response Structure from Speechace Pro:**
```typescript
interface SpeechaceProResponse {
  status: "success";
  text_score: {
    quality_score: number;           // 0-100 (overall)
    pronunciation_score: number;     // 0-100
    fluency_score: number;           // 0-100
    word_score_list: [
      {
        word: "hello";
        quality_score: 85;
        syllable_score_list: [
          {
            extent: [1200, 1450];    // [start_ms, end_ms] ← KEY for pause detection
            letters: "hel";
            quality_score: 90;
          },
          {
            extent: [1450, 1680];
            letters: "lo";
            quality_score: 80;
          }
        ];
        phone_score_list: [...];
      }
    ];
  };
}
```

**What Pro API DOES NOT have (Premium only):**
- ❌ `vocabulary_score`
- ❌ `grammar_score`
- ❌ `coherence_score`
- ❌ `task_achievement_score`
- ❌ `pausePositions[]` array (but we can calculate from extent)

---

## 🔧 BACKEND ARCHITECTURE

### 1. Database Schema

**Model: `FreeSpeakingSession.ts`** (NEW)

```typescript
interface IFreeSpeakingSession extends Document {
  userId: string;
  topicId: 'food' | 'family' | 'animals';
  topicTitle: string;
  questions: string[];  // 2 câu hỏi
  
  // Audio
  userAudioUrl: string;          // Cloudinary URL
  userAudioPublicId: string;
  recordingDuration: number;
  
  // Transcription
  transcript: string;             // From OpenAI Whisper
  
  // IELTS Scores (0-9)
  scores: {
    overall: number;
    pronunciation: number;        // From Speechace
    fluency: number;              // From Speechace
    vocabulary: number;           // From GPT-4
    grammar: number;              // From GPT-4
  };
  
  // Word-level analysis
  wordScores: IWordScore[];       // From Speechace
  
  // Metrics
  metrics: {
    badPauses: number;            // Detected from word timing
    accuracy: number;             // % words with score >= 70
  };
  
  completedAt: Date;
}

// Reuse existing interfaces
interface IWordScore {
  word: string;
  score: number;           // 0-100
  startTime: number;       // seconds
  endTime: number;
  phoneScores: IPhoneScore[];
}

interface IPhoneScore {
  phone: string;
  soundMostLike: string;
  score: number;
  stressLevel?: number;
}
```

**Indexes:**
```javascript
db.freespeakingsessions.createIndex({ userId: 1, topicId: 1 });
db.freespeakingsessions.createIndex({ userId: 1, completedAt: -1 });
```

---

### 2. Service Layer (Mở rộng `PronunciationScoringService`)

**File: `backend/src/services/pronunciationScoringService.ts`**

Thêm method mới:

```typescript
async scoreFreeSpeaking(
  userId: string,
  topicId: string,
  topicTitle: string,
  questions: string[],
  audioFilePath: string
): Promise<FreeSpeakingResult> {
  
  // ═══════════════════════════════════════
  // STEP 1: Upload to Cloudinary
  // ═══════════════════════════════════════
  const cloudinaryResult = await this.cloudinaryService.uploadAudio(
    audioFilePath,
    {
      folder: 'free-speaking-recordings',
      publicId: `user-${userId}-topic-${topicId}-${Date.now()}`,
    }
  );
  
  // ═══════════════════════════════════════
  // STEP 2: Download MP3 for Speechace
  // ═══════════════════════════════════════
  const mp3Path = await this.downloadAudioFromCloudinary(
    cloudinaryResult.secureUrl,
    userId,
    topicId
  );
  
  // ═══════════════════════════════════════
  // STEP 3: Transcribe với Whisper
  // ═══════════════════════════════════════
  const transcript = await this.whisperService.transcribe(mp3Path);
  console.log('📝 Transcript:', transcript);
  
  // ═══════════════════════════════════════
  // STEP 4: Score Pronunciation/Fluency (Speechace Pro)
  // ═══════════════════════════════════════
  const speechaceResult = await speechaceService.scoreAudio(
    mp3Path,
    transcript,  // ← Dùng transcript làm reference text
    userId
  );
  
  console.log('📊 Speechace Scores:');
  console.log('  - Pronunciation:', speechaceResult.text_score.pronunciation_score);
  console.log('  - Fluency:', speechaceResult.text_score.fluency_score);
  console.log('  - Words analyzed:', speechaceResult.text_score.word_score_list.length);
  
  // ═══════════════════════════════════════
  // STEP 5: Parse word scores & Extract timing
  // ═══════════════════════════════════════
  const wordScores = this.parseWordScoresWithTiming(
    speechaceResult.text_score.word_score_list
  );
  
  // ═══════════════════════════════════════
  // STEP 6: Detect pauses from timing gaps
  // ═══════════════════════════════════════
  const pauseInfo = this.detectPausesFromExtent(wordScores);
  console.log('⏸️ Pauses detected:', pauseInfo.badPauses);
  
  // ═══════════════════════════════════════
  // STEP 7: Score Vocabulary/Grammar (GPT-4)
  // ═══════════════════════════════════════
  const gptScores = await this.scoreWithGPT4(
    topicTitle,
    questions,
    transcript
  );
  
  console.log('🤖 GPT-4 Scores:');
  console.log('  - Vocabulary:', gptScores.vocabulary);
  console.log('  - Grammar:', gptScores.grammar);
  
  // ═══════════════════════════════════════
  // STEP 8: Convert to IELTS scale
  // ═══════════════════════════════════════
  const ieltsScores = {
    pronunciation: this.toIELTS(speechaceResult.text_score.pronunciation_score),
    fluency: this.toIELTS(speechaceResult.text_score.fluency_score),
    vocabulary: gptScores.vocabulary,
    grammar: gptScores.grammar,
    overall: 0  // Calculate below
  };
  
  // Overall = average of 4 criteria
  ieltsScores.overall = this.round(
    (ieltsScores.pronunciation + ieltsScores.fluency + 
     ieltsScores.vocabulary + ieltsScores.grammar) / 4
  );
  
  // ═══════════════════════════════════════
  // STEP 9: Calculate metrics
  // ═══════════════════════════════════════
  const metrics = {
    badPauses: pauseInfo.badPauses,
    accuracy: this.calculateAccuracy(wordScores)
  };
  
  // ═══════════════════════════════════════
  // STEP 10: Save to Database
  // ═══════════════════════════════════════
  const session = await FreeSpeakingSession.create({
    userId,
    topicId,
    topicTitle,
    questions,
    userAudioUrl: cloudinaryResult.secureUrl,
    userAudioPublicId: cloudinaryResult.publicId,
    transcript,
    scores: ieltsScores,
    wordScores,
    metrics,
    recordingDuration: cloudinaryResult.duration,
    completedAt: new Date()
  });
  
  // ═══════════════════════════════════════
  // STEP 11: Cleanup temp files
  // ═══════════════════════════════════════
  fs.unlinkSync(mp3Path);
  fs.unlinkSync(audioFilePath);
  
  return {
    sessionId: session._id,
    transcript,
    scores: ieltsScores,
    wordScores,
    metrics,
    userAudioUrl: cloudinaryResult.secureUrl
  };
}
```

---

### 3. Helper Methods

**A. GPT-4 Vocabulary/Grammar Scoring:**

```typescript
private async scoreWithGPT4(
  topicTitle: string,
  questions: string[],
  transcript: string
): Promise<{ vocabulary: number; grammar: number }> {
  
  const prompt = `You are an IELTS Speaking examiner. Evaluate this response:

**Topic:** ${topicTitle}

**Questions:**
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

**User's Answer:**
"${transcript}"

Rate the following on IELTS scale (0-9):

1. **Vocabulary** (Lexical Resource):
   - Range (variety of words)
   - Accuracy (correct usage)
   - Appropriacy (suitable for topic)

2. **Grammar** (Grammatical Range and Accuracy):
   - Range (variety of structures)
   - Accuracy (correct usage)
   - Complexity (simple vs complex sentences)

Return ONLY valid JSON:
{
  "vocabulary": 7.5,
  "grammar": 6.0,
  "vocabulary_feedback": "Good range but some repetition",
  "grammar_feedback": "Mostly simple sentences, few errors"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3  // Low temperature for consistency
  });
  
  const result = JSON.parse(response.choices[0].message.content);
  
  console.log('📊 GPT-4 Scores:', result);
  
  return {
    vocabulary: result.vocabulary,
    grammar: result.grammar
  };
}
```

---

**B. Parse Word Scores với Timing từ Syllable Extent:**

```typescript
/**
 * Parse Speechace word scores và extract timing từ syllable extent
 * Pro API trả về syllable_score_list với extent [start_ms, end_ms]
 */
private parseWordScoresWithTiming(
  wordScoreList: SpeechaceWordScore[]
): IWordScore[] {
  
  return wordScoreList.map(wordScore => {
    // Extract timing từ syllable_score_list
    const syllables = wordScore.syllable_score_list;
    
    if (syllables.length === 0) {
      console.warn(`⚠️ No syllables for word: ${wordScore.word}`);
      return {
        word: wordScore.word,
        score: wordScore.quality_score,
        startTime: 0,
        endTime: 0,
        phoneScores: this.parsePhoneScores(wordScore.phone_score_list),
        pauseAfter: false
      };
    }
    
    // First syllable start = word start
    // Last syllable end = word end
    const startMs = syllables[0].extent[0];
    const endMs = syllables[syllables.length - 1].extent[1];
    
    return {
      word: wordScore.word,
      score: wordScore.quality_score,
      startTime: startMs / 1000,  // Convert ms → seconds
      endTime: endMs / 1000,
      phoneScores: this.parsePhoneScores(wordScore.phone_score_list),
      pauseAfter: false  // Will be set by detectPausesFromExtent()
    };
  });
}

private parsePhoneScores(phoneScoreList: SpeechacePhoneScore[]): IPhoneScore[] {
  return phoneScoreList.map(phone => ({
    phone: phone.phone,
    soundMostLike: phone.sound_most_like || phone.phone,
    score: phone.quality_score,
    stressLevel: phone.stress_level || undefined
  }));
}
```

---

**C. Detect Pauses từ Word Timing Gaps:**

```typescript
/**
 * Detect pauses từ gap giữa các words
 * Speechace Pro không có pausePositions[], nhưng có word timing qua syllable extent
 * 
 * Logic: Nếu gap giữa word[i].endTime và word[i+1].startTime > threshold → pause
 */
private detectPausesFromExtent(
  wordScores: IWordScore[]
): { badPauses: number; pausePositions: number[] } {
  
  let pauseCount = 0;
  const pausePositions: number[] = [];
  const PAUSE_THRESHOLD_MS = 500; // 500ms = 0.5s
  
  for (let i = 0; i < wordScores.length - 1; i++) {
    const currentWord = wordScores[i];
    const nextWord = wordScores[i + 1];
    
    // Skip if no valid timing
    if (!currentWord.endTime || !nextWord.startTime) {
      continue;
    }
    
    // Calculate gap in milliseconds
    const gapMs = (nextWord.startTime - currentWord.endTime) * 1000;
    
    // Detect pause if gap > threshold
    if (gapMs > PAUSE_THRESHOLD_MS) {
      pauseCount++;
      pausePositions.push(i);
      
      // Mark pause in wordScores for frontend
      wordScores[i].pauseAfter = true;
      
      console.log(`⏸️ Pause detected after "${currentWord.word}" (${gapMs.toFixed(0)}ms gap)`);
    }
  }
  
  console.log(`📊 Total pauses: ${pauseCount} / ${wordScores.length - 1} gaps`);
  
  return { badPauses: pauseCount, pausePositions };
}
```

**Pause Detection Example:**

```
Word timeline:
[hello] 0.5s-1.2s
        ⏸️ 800ms gap → PAUSE detected
[my] 2.0s-2.3s
     🟢 100ms gap → Normal
[name] 2.4s-2.9s
       ⏸️ 600ms gap → PAUSE detected
[is] 3.5s-3.7s
```

---

**D. Convert Speechace (0-100) → IELTS (0-9):**

**D. Convert Speechace (0-100) → IELTS (0-9):**

```typescript
private toIELTS(score: number | undefined): number {
  if (!score) return 0;
  
  // Speechace 0-100 → IELTS 0-9
  const ielts = (score / 100) * 9;
  return this.round(ielts);
}

private round(num: number): number {
  // Round to nearest 0.5 (IELTS uses 0.5 increments)
  // Example: 7.3 → 7.5, 7.7 → 8.0, 7.2 → 7.0
  return Math.round(num * 2) / 2;
}
```

**Conversion Examples:**
| Speechace | IELTS |
|-----------|-------|
| 95-100 | 9.0 |
| 85-94 | 8.0-8.5 |
| 75-84 | 7.0-7.5 |
| 65-74 | 6.0-6.5 |
| 55-64 | 5.0-5.5 |
| < 55 | < 5.0 |

---

**E. Calculate Accuracy:**

```typescript
private calculateAccuracy(wordScores: IWordScore[]): number {
  const total = wordScores.length;
  const correct = wordScores.filter(w => w.score >= 70).length;
  return Math.round((correct / total) * 100);
}
```

---

### 4. Controller

**File: `backend/src/controllers/freeSpeakingController.ts`** (NEW)

```typescript
import { Request, Response } from 'express';
import { pronunciationScoringService } from '../services/pronunciationScoringService';
import FreeSpeakingSession from '../models/FreeSpeakingSession';
import fs from 'fs';

export const freeSpeakingController = {
  
  /**
   * POST /api/free-speaking/score
   */
  async scoreRecording(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Audio file is required'
        });
      }
      
      const { topicId, topicTitle, questions } = req.body;
      
      if (!topicId || !topicTitle || !questions) {
        return res.status(400).json({
          success: false,
          error: 'topicId, topicTitle, and questions are required'
        });
      }
      
      // Parse questions JSON string
      const questionsArray = JSON.parse(questions);
      
      console.log('🎤 Free Speaking scoring request');
      console.log('👤 User:', userId);
      console.log('📝 Topic:', topicTitle);
      
      // Score recording
      const result = await pronunciationScoringService.scoreFreeSpeaking(
        userId,
        topicId,
        topicTitle,
        questionsArray,
        req.file.path
      );
      
      return res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('❌ Free speaking scoring failed:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Scoring failed'
      });
    }
  },
  
  /**
   * GET /api/free-speaking/latest/:topicId
   */
  async getLatestSession(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      const { topicId } = req.params;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      
      const session = await FreeSpeakingSession
        .findOne({ userId, topicId })
        .sort({ completedAt: -1 })
        .limit(1);
      
      return res.json({
        success: true,
        data: session
      });
      
    } catch (error) {
      console.error('❌ Failed to get latest session:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch session'
      });
    }
  },
  
  /**
   * GET /api/free-speaking/history
   */
  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      
      const sessions = await FreeSpeakingSession
        .find({ userId })
        .select('topicId topicTitle scores.overall completedAt')
        .sort({ completedAt: -1 })
        .limit(20);
      
      return res.json({
        success: true,
        data: sessions
      });
      
    } catch (error) {
      console.error('❌ Failed to get history:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch history'
      });
    }
  }
};
```

---

### 5. Routes

**File: `backend/src/routes/freeSpeaking.routes.ts`** (NEW)

```typescript
import express from 'express';
import multer from 'multer';
import path from 'path';
import { freeSpeakingController } from '../controllers/freeSpeakingController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Multer config (reuse từ pronunciation.routes.ts)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../temp/audio'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `free-speaking-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files allowed.'));
    }
  }
});

// Routes
router.post('/score', 
  authenticateToken, 
  upload.single('audio'), 
  freeSpeakingController.scoreRecording
);

router.get('/latest/:topicId', 
  authenticateToken, 
  freeSpeakingController.getLatestSession
);

router.get('/history', 
  authenticateToken, 
  freeSpeakingController.getHistory
);

export default router;
```

**Register in `server.ts`:**
```typescript
import freeSpeakingRoutes from './routes/freeSpeaking.routes';
app.use('/api/free-speaking', freeSpeakingRoutes);
```

---

## 🎨 FRONTEND INTEGRATION

### 1. Update FreeSpeakingRecording.tsx

```typescript
const handleSubmitRecording = async (audioBlob: Blob) => {
  setIsLoading(true);
  
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('topicId', topicId);
    formData.append('topicTitle', topicTitle);
    formData.append('questions', JSON.stringify(questions));
    
    const response = await fetch('/api/free-speaking/score', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Pass result to parent component
      onRecordingComplete(result.data);
      setIsCompleted(true);
    } else {
      alert('Không thể chấm điểm. Vui lòng thử lại.');
    }
    
  } catch (error) {
    console.error('❌ Scoring failed:', error);
    alert('Lỗi kết nối. Vui lòng kiểm tra internet.');
  } finally {
    setIsLoading(false);
  }
};
```

---

### 2. Update AssessmentMode.tsx

```typescript
const [resultData, setResultData] = useState<any>(null);

const handleRecordingComplete = (data: any) => {
  setResultData(data);
  setAssessmentView('result');
};

// Pass to FreeSpeakingRecording
<FreeSpeakingRecording
  onRecordingComplete={handleRecordingComplete}
  ...
/>

// Pass to FreeSpeakingResult
<FreeSpeakingResult
  resultData={resultData}
  ...
/>
```

---

### 3. Update FreeSpeakingResult.tsx

Replace mock data with real data:

```typescript
interface FreeSpeakingResultProps {
  resultData: {
    transcript: string;
    scores: {
      overall: number;
      pronunciation: number;
      fluency: number;
      vocabulary: number;
      grammar: number;
    };
    wordScores: Array<{
      word: string;
      score: number;
      startTime: number;
      endTime: number;
      pauseAfter?: boolean;
      phoneScores: Array<{
        phone: string;
        soundMostLike: string;
        score: number;
      }>;
    }>;
    metrics: {
      badPauses: number;
      accuracy: number;
    };
    userAudioUrl: string;
  };
  topicTitle: string;
  questions: string[];
  onBack: () => void;
}

const FreeSpeakingResult: React.FC<FreeSpeakingResultProps> = ({
  resultData,
  topicTitle,
  questions,
  onBack
}) => {
  const { transcript, scores, wordScores, metrics, userAudioUrl } = resultData;
  
  // Use real data instead of mock
  const [audioUrl] = useState(userAudioUrl);
  
  // ... rest of component
};
```

---

## 📊 SPEECHACE PRO API vs PREMIUM API

### Response Structure Comparison

**Pro API Response (Current - $8/month):**
```json
{
  "status": "success",
  "text_score": {
    "quality_score": 78,
    "pronunciation_score": 85,
    "fluency_score": 72,
    "word_score_list": [
      {
        "word": "hello",
        "quality_score": 85,
        "syllable_score_list": [
          {
            "extent": [1200, 1450],
            "letters": "hel",
            "quality_score": 90,
            "phone_count": 3,
            "stress_level": 1
          }
        ],
        "phone_score_list": [...]
      }
    ]
  }
}
```

**Premium API Response (Extended):**
```json
{
  "status": "success",
  "text_score": {
    "quality_score": 78,
    "pronunciation_score": 85,
    "fluency_score": 72,
    "vocabulary_score": 70,        // ← Only in Premium
    "grammar_score": 68,            // ← Only in Premium
    "coherence_score": 75,          // ← Only in Premium
    "task_achievement_score": 80,   // ← Only in Premium
    "word_score_list": [...]
  }
}
```

### Feature Comparison Table

| Feature | Pro API | Premium API | Our Solution |
|---------|---------|-------------|--------------|
| **Pronunciation** | ✅ | ✅ | Use Pro API |
| **Fluency** | ✅ | ✅ | Use Pro API |
| **Word Timing** | ✅ (syllable extent) | ✅ | Use Pro API |
| **Pause Detection** | ❌ (manual calculation) | ✅ (automatic) | Calculate from extent |
| **Vocabulary** | ❌ | ✅ | Use GPT-4 |
| **Grammar** | ❌ | ✅ | Use GPT-4 |
| **Coherence** | ❌ | ✅ | Not needed |
| **Task Achievement** | ❌ | ✅ | Not needed |
| **Max Audio** | 45s | 2 minutes | 44s (OK) |
| **Price** | $8/month | Higher | $8 + GPT-4 |

### Why Pro + GPT-4 Hybrid Works:

1. ✅ **Pro API đủ cho pronunciation + fluency** (core speaking skills)
2. ✅ **Pause detection tự calculate** từ syllable extent (accurate enough)
3. ✅ **GPT-4 flexible hơn** cho vocabulary/grammar (có thể custom prompts)
4. ✅ **Cost-effective:** Pro $8 + GPT-4 ~$0.015/request vs Premium subscription
5. ✅ **44s audio < 45s limit** của Pro API

---

## 📊 KEY DIFFERENCES: Prompt Practice vs Free Speaking

| Feature | Prompt Practice | Free Speaking |
|---------|----------------|---------------|
| **Reference Text** | Fixed 16 prompts | User's transcript (dynamic) |
| **Speechace Input** | Prompt text | Transcript from Whisper |
| **Vocabulary/Grammar** | N/A | GPT-4 scoring |
| **Database** | UserPracticeSession | FreeSpeakingSession |
| **API Param** | promptIndex (0-15) | topicId (food/family/animals) |
| **Score Scale** | 0-100 | IELTS 0-9 |
| **Questions** | 1 prompt | 2 questions per topic |

---

## 🔑 REUSABLE COMPONENTS (80%)

✅ **Backend Services:**
- `SpeechaceService.scoreAudio()`
- `CloudinaryService.uploadAudio()`
- `WhisperService.transcribe()`
- `PronunciationScoringService.downloadAudioFromCloudinary()`
- `PronunciationScoringService.parseWordScores()`

✅ **Database Interfaces:**
- `IWordScore`
- `IPhoneScore`

✅ **Frontend:**
- MediaRecorder API flow
- FormData upload
- Audio player
- Word box component structure

---

## ⚙️ ENVIRONMENT VARIABLES

Add to `backend/.env`:

```bash
# OpenAI (existing)
OPENAI_API_KEY=sk-...

# Speechace (existing)
SPEECHACE_API_KEY=10aVYSlQ02Qo...
SPEECHACE_API_ENDPOINT=https://api2.speechace.com

# Cloudinary (existing)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc...
```

---

## 📈 COST ESTIMATION (Updated with Pro + GPT-4)

### Per User Session (44s audio):

| Service | Usage | Cost | Notes |
|---------|-------|------|-------|
| **Whisper** | 44s transcription | $0.004 | OpenAI STT |
| **Speechace Pro** | 1 audio scoring | Included | $8/month subscription |
| **GPT-4** | ~500 tokens (vocab/grammar) | $0.015 | gpt-4-turbo |
| **Cloudinary** | 100KB storage | Free | Free tier: 25GB |
| **Total** | Per session | **$0.019** | ~2 cents |

### Monthly Cost Estimates:

| Users/Day | Sessions/Month | Whisper | GPT-4 | Total/Month |
|-----------|----------------|---------|-------|-------------|
| **10** | 300 | $1.20 | $4.50 | **$5.70 + $8 sub** |
| **50** | 1,500 | $6.00 | $22.50 | **$28.50 + $8 sub** |
| **100** | 3,000 | $12.00 | $45.00 | **$57.00 + $8 sub** |
| **500** | 15,000 | $60.00 | $225.00 | **$285.00 + $8 sub** |

**Speechace Pro Subscription:** $8/month (unlimited API calls within rate limits)

### Cost Comparison: Pro+GPT-4 vs Premium:

**Scenario: 100 users/day (3,000 sessions/month)**

| Approach | Breakdown | Total/Month |
|----------|-----------|-------------|
| **Pro + GPT-4** | Pro: $8<br>Whisper: $12<br>GPT-4: $45 | **$65** |
| **Premium API** | Subscription: ~$50-100+<br>Whisper: $12 | **$62-112** |

**Verdict:** Pro + GPT-4 cost-competitive và flexible hơn cho customization.

---

## 🧪 TESTING CHECKLIST

### Backend:
- [ ] FreeSpeakingSession model saves correctly
- [ ] Multer accepts audio files (webm/mp3)
- [ ] Cloudinary upload succeeds
- [ ] MP3 download from Cloudinary works
- [ ] Whisper transcription accurate
- [ ] Speechace Pro returns word scores with syllable extent
- [ ] Pause detection from extent gaps works (threshold: 500ms)
- [ ] GPT-4 returns valid JSON scores (vocabulary + grammar)
- [ ] IELTS conversion correct (0-9 scale, 0.5 increments)
- [ ] API returns complete response
- [ ] Temp files cleanup after processing

### Frontend:
- [ ] MediaRecorder captures audio (44s max)
- [ ] FormData includes: audio, topicId, topicTitle, questions[]
- [ ] Loading state shows correctly ("Đang chấm điểm...")
- [ ] Result page displays real data (not mock)
- [ ] Word boxes show correct colors (green: ≥70, red: <70)
- [ ] Pause markers (yellow dots 🟡) appear between words
- [ ] Audio player plays user recording from Cloudinary
- [ ] Score cards show IELTS scores (0-9 scale)
- [ ] Metrics display: Bad pauses count + Accuracy %

### Integration:
- [ ] End-to-end flow: Record → Score → Display
- [ ] Error handling (API failure, timeout, network)
- [ ] Cleanup temp files (audio + MP3)
- [ ] Latest session retrieval works
- [ ] Pause detection accuracy: gap > 500ms = pause
- [ ] Word timing accuracy: within 100ms of Speechace

### Performance:
- [ ] Total response time < 15s (44s audio)
- [ ] Whisper transcription < 3s
- [ ] Speechace scoring < 5s
- [ ] GPT-4 scoring < 4s
- [ ] Cloudinary upload < 2s

---

## 📅 IMPLEMENTATION TIMELINE (Updated)

| Week | Tasks | Details | Status |
|------|-------|---------|--------|
| **Week 1** | **Backend Foundation** | | 🔄 |
| | • Create FreeSpeakingSession model | Include syllable extent support | |
| | • Extend PronunciationScoringService | Add `scoreFreeSpeaking()` method | |
| | • Implement pause detection | Calculate from `syllable_score_list.extent` gaps | |
| | • Add GPT-4 vocabulary/grammar scoring | IELTS-aligned prompts | |
| **Week 2** | **API & Routes** | | 🔄 |
| | • Create freeSpeakingController | 3 endpoints: score, latest, history | |
| | • Create freeSpeaking.routes.ts | Multer config for audio upload | |
| | • Test with Postman | Verify Speechace Pro response structure | |
| | • Validate pause detection | Test with 500ms threshold | |
| **Week 3** | **Frontend Integration** | | 🔄 |
| | • Update FreeSpeakingRecording | API call to `/api/free-speaking/score` | |
| | • Update FreeSpeakingResult | Real data from backend (remove mock) | |
| | • Implement pause markers UI | Yellow dots between words | |
| | • Test full flow | Record → API → Display | |
| **Week 4** | **Polish & Deploy** | | 🔄 |
| | • Error handling | Network, API timeout, invalid audio | |
| | • Loading states | "Đang chấm điểm..." with progress | |
| | • UI polish | Animations, responsive design | |
| | • Performance optimization | Audio compression, caching | |
| | • Deploy to production | Test with real users | |

**Total: 3-4 weeks**

**Critical Path:**
1. Week 1 Day 1-3: Database model + pause detection logic
2. Week 1 Day 4-5: GPT-4 integration
3. Week 2 Day 1-3: Controller + routes
4. Week 2 Day 4-5: Postman testing + debug
5. Week 3: Frontend integration
6. Week 4: Polish + deploy

---

## 🚀 DEPLOYMENT NOTES

### 1. Prerequisites

**Ensure temp/audio folder exists:**
```bash
mkdir -p backend/temp/audio
chmod 755 backend/temp/audio
```

**Environment variables:**
```bash
# backend/.env
OPENAI_API_KEY=sk-...
SPEECHACE_API_KEY=10aVYSlQ02Qo...  # Pro API key
SPEECHACE_API_ENDPOINT=https://api2.speechace.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc...
```

---

### 2. Register Routes

**File: `backend/src/server.ts`**

```typescript
import freeSpeakingRoutes from './routes/freeSpeaking.routes';

// ... other routes
app.use('/api/free-speaking', freeSpeakingRoutes);
```

---

### 3. Test API với Postman

**POST** `http://localhost:5000/api/free-speaking/score`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Body (form-data):**
```
audio: <select_audio_file.webm>
topicId: "food"
topicTitle: "Food & Cooking"
questions: ["What is your favorite dish to eat and why?", "What dish can you make and how do you make it?"]
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "67abc...",
    "transcript": "My favorite dish is pho because it's delicious and healthy...",
    "scores": {
      "overall": 7.5,
      "pronunciation": 8.0,
      "fluency": 7.5,
      "vocabulary": 7.0,
      "grammar": 7.5
    },
    "wordScores": [
      {
        "word": "favorite",
        "score": 85,
        "startTime": 0.5,
        "endTime": 1.2,
        "pauseAfter": false,
        "phoneScores": [...]
      }
    ],
    "metrics": {
      "badPauses": 2,
      "accuracy": 93
    },
    "userAudioUrl": "https://res.cloudinary.com/..."
  }
}
```

---

### 4. Verify Pause Detection

**Check logs for pause detection:**
```
⏸️ Pause detected after "dish" (650ms gap)
⏸️ Pause detected after "because" (800ms gap)
📊 Total pauses: 2 / 45 gaps
```

**Verify wordScores have `pauseAfter` flag:**
```json
{
  "word": "dish",
  "score": 85,
  "pauseAfter": true  // ← Should be true for words before pause
}
```

---

### 5. Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Enable CORS for frontend domain
- [ ] Set up rate limiting (max 5 requests/minute per user)
- [ ] Configure Cloudinary webhooks for storage monitoring
- [ ] Set up error logging (Sentry/LogRocket)
- [ ] Enable audio compression (reduce file size)
- [ ] Set up backup strategy for DB
- [ ] Monitor API usage (Speechace credits, OpenAI tokens)
- [ ] Set up alerts for API failures
- [ ] Test with different audio qualities (high/low bitrate)

---

### 6. Monitoring & Alerts

**Key Metrics:**
- Average response time (target: < 15s)
- Speechace API success rate (target: > 98%)
- GPT-4 API success rate (target: > 99%)
- Pause detection accuracy (validate with manual checks)
- Storage usage (Cloudinary)
- Cost per session (target: < $0.02)

**Set up alerts for:**
- Response time > 20s
- API error rate > 2%
- Storage > 80% of quota
- Cost spike (> $100/day)

---

## 📚 REFERENCES

### API Documentation:
1. **Speechace Pro API:** https://docs.speechace.com/
   - Text Scoring API v9: `/api/scoring/text/v9/json`
   - Pro SKU: Pronunciation + Fluency only
   - Response structure: `text_score.word_score_list[].syllable_score_list[].extent`
   
2. **OpenAI Whisper:** https://platform.openai.com/docs/guides/speech-to-text
   - Model: `whisper-1`
   - Pricing: $0.006/minute
   
3. **OpenAI GPT-4:** https://platform.openai.com/docs/guides/chat
   - Model: `gpt-4-turbo` (or `gpt-4`)
   - Response format: `json_object` for structured output
   - Temperature: 0.3 (consistent scoring)
   
4. **Cloudinary Audio:** https://cloudinary.com/documentation/audio_transformations
   - Resource type: `video` (for audio files)
   - Auto-conversion: WebM → MP3
   - CDN delivery: Global edge servers
   
5. **IELTS Speaking Band Descriptors:** https://www.ielts.org/for-test-takers/how-ielts-is-scored
   - Scale: 0-9 (0.5 increments)
   - 4 criteria: Fluency, Vocabulary, Grammar, Pronunciation

### Technical References:
6. **Web Audio API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
   - For audio segment extraction (client-side)
   
7. **MediaRecorder API:** https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
   - Browser audio recording
   - Output format: `audio/webm;codecs=opus`

### Code Samples:
8. **Speechace Samples:** https://github.com/speechace/speechace-api-samples
   - Frontend + Backend integration examples

---

## 🔐 SECURITY CONSIDERATIONS

### Audio File Security:
- **Upload validation:** Check file type, size, duration
- **Virus scanning:** Optional for production
- **Temporary storage:** Auto-delete after 1 hour
- **Cloudinary access:** Signed URLs with expiration

### API Key Security:
- **Environment variables:** Never commit to git
- **Key rotation:** Every 90 days
- **Rate limiting:** Max 5 requests/minute per user
- **User authentication:** JWT required for all endpoints

### Data Privacy:
- **GDPR compliance:** User consent for audio recording
- **Data retention:** Delete sessions after 90 days
- **Anonymization:** Remove user_id before analytics
- **Encryption:** TLS 1.3 for all API calls

---

## 🐛 TROUBLESHOOTING

### Common Issues:

**1. Speechace returns "invalid audio format"**
- ✅ Solution: Ensure Cloudinary converts to MP3
- ✅ Check: Audio file has valid header
- ✅ Try: Re-upload with `format: 'mp3'` in Cloudinary options

**2. Pause detection not working**
- ✅ Check: `syllable_score_list` exists in response
- ✅ Verify: Extent values are not [0, 0]
- ✅ Adjust: PAUSE_THRESHOLD_MS (try 300ms or 700ms)

**3. GPT-4 returns invalid JSON**
- ✅ Solution: Use `response_format: { type: 'json_object' }`
- ✅ Check: Prompt clearly states "Return ONLY valid JSON"
- ✅ Fallback: Parse error → return default scores (6.0, 6.0)

**4. Timeout on long audio**
- ✅ Increase: Axios timeout to 60s
- ✅ Check: Audio duration < 45s (Pro API limit)
- ✅ Frontend: Show progress indicator

**5. Word timing gaps negative**
- ✅ Cause: Words not in chronological order
- ✅ Fix: Sort wordScores by startTime before pause detection
- ✅ Log: Warn if gap < 0

---

## 📊 SAMPLE DATA STRUCTURES

### Database Document Example:

```json
{
  "_id": "67abc123...",
  "userId": "67user456...",
  "topicId": "food",
  "topicTitle": "Food & Cooking",
  "questions": [
    "What is your favorite dish to eat and why?",
    "What dish or food can you make and how do you make it?"
  ],
  "userAudioUrl": "https://res.cloudinary.com/.../user-123-food-1736851200.mp3",
  "userAudioPublicId": "free-speaking-recordings/user-123-food-1736851200",
  "recordingDuration": 42.5,
  "transcript": "My favorite dish is pho because it's very delicious and healthy. I can make spring rolls by wrapping vegetables and shrimp in rice paper.",
  "scores": {
    "overall": 7.5,
    "pronunciation": 8.0,
    "fluency": 7.5,
    "vocabulary": 7.0,
    "grammar": 7.5
  },
  "wordScores": [
    {
      "word": "favorite",
      "score": 85,
      "startTime": 0.5,
      "endTime": 1.2,
      "pauseAfter": false,
      "phoneScores": [
        { "phone": "f", "soundMostLike": "f", "score": 90 },
        { "phone": "ey", "soundMostLike": "ey", "score": 85 },
        { "phone": "v", "soundMostLike": "v", "score": 80 }
      ]
    },
    {
      "word": "dish",
      "score": 92,
      "startTime": 1.3,
      "endTime": 1.8,
      "pauseAfter": true,
      "phoneScores": [...]
    }
  ],
  "metrics": {
    "badPauses": 2,
    "accuracy": 93
  },
  "completedAt": "2026-01-15T14:30:00Z"
}
```

---

**Document Version:** 1.0  
**Created:** 2026-01-15  
**Author:** GitHub Copilot AI
