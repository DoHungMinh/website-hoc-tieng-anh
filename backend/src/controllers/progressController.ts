import { Request, Response } from "express";
import { Progress, IProgress } from "../models/Progress";
import { User } from "../models/User";

interface AuthRequest extends Request {
    user?: any;
}

// Create or initialize progress for user
export const initializeProgress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        // Check if progress already exists
        let progress = await Progress.findOne({ userId });

        if (!progress) {
            // Create new progress with default values
            progress = await Progress.create({
                userId,
                vocabulary: {
                    learned: 0,
                    target: 5000,
                    recentWords: [],
                },
                listening: {
                    hoursCompleted: 0,
                    target: 200,
                    recentSessions: [],
                },
                testsCompleted: {
                    completed: 0,
                    target: 60,
                    recentTests: [],
                },
                studyStreak: {
                    current: 0,
                    target: 30,
                    lastStudyDate: new Date(),
                },
                weeklyActivity: [],
                totalStudyTime: 0,
                level: "A1",
                achievements: [],
            });
        }

        return res.json({
            success: true,
            message: "Progress initialized successfully",
            data: progress,
        });
    } catch (error) {
        console.error("Initialize progress error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi khởi tạo tiến độ",
        });
    }
};

// Get user progress
export const getUserProgress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        const progress = await Progress.findOne({ userId });

        if (!progress) {
            return res.status(404).json({
                success: false,
                message:
                    "Chưa có dữ liệu tiến độ. Hãy bắt đầu học để tạo tiến độ!",
            });
        }

        return res.json({
            success: true,
            data: progress,
        });
    } catch (error) {
        console.error("Get progress error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy dữ liệu tiến độ",
        });
    }
};

// Get weekly activity
export const getWeeklyActivity = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        const progress = await Progress.findOne({ userId });

        if (!progress) {
            return res.json({
                success: true,
                data: {
                    weeklyActivity: [],
                    totalStudyTime: 0,
                    weeklyGrowth: 0,
                },
            });
        }

        // Get current week activity
        const today = new Date();
        const year = today.getFullYear();
        const week = getWeekNumber(today);
        const weekString = `${year}-W${week.toString().padStart(2, "0")}`;

        const currentWeek = progress.weeklyActivity.find(
            (w) => w.week === weekString
        );
        const weeklyData = currentWeek
            ? currentWeek.days
            : [
                  { day: "Thứ 2", hours: 0, activities: [] },
                  { day: "Thứ 3", hours: 0, activities: [] },
                  { day: "Thứ 4", hours: 0, activities: [] },
                  { day: "Thứ 5", hours: 0, activities: [] },
                  { day: "Thứ 6", hours: 0, activities: [] },
                  { day: "Thứ 7", hours: 0, activities: [] },
                  { day: "Chủ nhật", hours: 0, activities: [] },
              ];

        // Calculate growth compared to previous week
        const previousWeekNumber = week > 1 ? week - 1 : 52;
        const previousYear = week > 1 ? year : year - 1;
        const previousWeekString = `${previousYear}-W${previousWeekNumber
            .toString()
            .padStart(2, "0")}`;

        const previousWeek = progress.weeklyActivity.find(
            (w) => w.week === previousWeekString
        );
        const currentTotal = currentWeek?.totalHours || 0;
        const previousTotal = previousWeek?.totalHours || 0;

        const weeklyGrowth =
            previousTotal > 0
                ? Math.round(
                      ((currentTotal - previousTotal) / previousTotal) * 100
                  )
                : 0;

        return res.json({
            success: true,
            data: {
                weeklyActivity: weeklyData.map((day) => ({
                    day: day.day,
                    dayLabel:
                        day.day === "Chủ nhật"
                            ? "CN"
                            : day.day.replace("Thứ ", "T"),
                    hours: Math.round(day.hours * 10) / 10,
                    activities: day.activities,
                })),
                totalStudyTime: Math.round(progress.totalStudyTime * 10) / 10,
                weeklyStudyTime: Math.round(currentTotal * 10) / 10,
                weeklyGrowth,
            },
        });
    } catch (error) {
        console.error("Get weekly activity error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy dữ liệu hoạt động tuần",
        });
    }
};

// Update vocabulary progress
export const updateVocabularyProgress = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user.id;
        const { word, meaning, example } = req.body;

        if (!word || !meaning || !example) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin từ vựng",
            });
        }

        // Find or create progress
        let progress = await Progress.findOne({ userId });
        if (!progress) {
            // Initialize progress if not exists
            progress = await Progress.create({
                userId,
                vocabulary: { learned: 0, target: 5000, recentWords: [] },
                listening: {
                    hoursCompleted: 0,
                    target: 200,
                    recentSessions: [],
                },
                testsCompleted: { completed: 0, target: 60, recentTests: [] },
                studyStreak: {
                    current: 0,
                    target: 30,
                    lastStudyDate: new Date(),
                },
                weeklyActivity: [],
                totalStudyTime: 0,
                level: "A1",
                achievements: [],
            });
        }

        // Check if word already exists
        const existingWord = progress.vocabulary.recentWords.find(
            (w) => w.word.toLowerCase() === word.toLowerCase()
        );

        if (existingWord) {
            // Update existing word
            existingWord.reviewCount += 1;
            existingWord.masteryLevel = Math.min(
                100,
                existingWord.masteryLevel + 5
            );
        } else {
            // Add new word
            const newWord = {
                word,
                meaning,
                example,
                learnedAt: new Date(),
                reviewCount: 1,
                masteryLevel: 20, // Starting mastery level
            };

            progress.vocabulary.recentWords.push(newWord);
            progress.vocabulary.learned += 1;

            // Keep only last 50 words
            if (progress.vocabulary.recentWords.length > 50) {
                progress.vocabulary.recentWords =
                    progress.vocabulary.recentWords.slice(-50);
            }
        }

        // Update study streak and weekly activity
        await updateStudyActivity(userId, "Học từ vựng mới", 0.1); // 6 minutes per word

        // Check and unlock achievements
        await checkVocabularyAchievements(userId, progress.vocabulary.learned);

        await progress.save();

        return res.json({
            success: true,
            message: "Cập nhật tiến độ từ vựng thành công",
            data: {
                vocabularyLearned: progress.vocabulary.learned,
                newWord: !existingWord,
            },
        });
    } catch (error) {
        console.error("Update vocabulary progress error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật tiến độ từ vựng",
        });
    }
};

// Update listening progress
export const updateListeningProgress = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user.id;
        const { title, duration, difficulty, score } = req.body;

        if (!title || !duration || !difficulty || score === undefined) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin session nghe",
            });
        }

        let progress = await Progress.findOne({ userId });
        if (!progress) {
            progress = await initializeUserProgress(userId);
        }

        if (!progress) {
            return res.status(500).json({
                success: false,
                message: "Không thể khởi tạo tiến độ listening",
            });
        }

        // Add listening session
        const session = {
            title,
            duration: Number(duration),
            difficulty,
            score: Number(score),
            completedAt: new Date(),
        };

        progress.listening.recentSessions.push(session);
        progress.listening.hoursCompleted += duration / 60; // Convert minutes to hours

        // Keep only last 20 sessions
        if (progress.listening.recentSessions.length > 20) {
            progress.listening.recentSessions =
                progress.listening.recentSessions.slice(-20);
        }

        // Update study activity
        await updateStudyActivity(userId, "Luyện nghe", duration / 60);

        // Check achievements
        await checkListeningAchievements(
            userId,
            progress.listening.hoursCompleted
        );

        await progress.save();

        return res.json({
            success: true,
            message: "Cập nhật tiến độ nghe thành công",
            data: {
                hoursCompleted: progress.listening.hoursCompleted,
                sessionScore: score,
            },
        });
    } catch (error) {
        console.error("Update listening progress error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật tiến độ nghe",
        });
    }
};

// Update test progress
export const updateTestProgress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { testName, score, maxScore, percentage } = req.body;

        if (
            !testName ||
            score === undefined ||
            !maxScore ||
            percentage === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin bài test",
            });
        }

        let progress = await Progress.findOne({ userId });
        if (!progress) {
            progress = await initializeUserProgress(userId);
        }

        if (!progress) {
            return res.status(500).json({
                success: false,
                message: "Không thể khởi tạo tiến độ test",
            });
        }

        // Add test result
        const testResult = {
            testName,
            score: Number(score),
            maxScore: Number(maxScore),
            percentage: Number(percentage),
            completedAt: new Date(),
        };

        progress.testsCompleted.recentTests.push(testResult);
        progress.testsCompleted.completed += 1;

        // Keep only last 15 tests
        if (progress.testsCompleted.recentTests.length > 15) {
            progress.testsCompleted.recentTests =
                progress.testsCompleted.recentTests.slice(-15);
        }

        // Update study activity (assume 30 minutes per test)
        await updateStudyActivity(userId, "Làm bài kiểm tra", 0.5);

        // Check achievements
        await checkTestAchievements(
            userId,
            progress.testsCompleted.completed,
            percentage
        );

        await progress.save();

        return res.json({
            success: true,
            message: "Cập nhật tiến độ test thành công",
            data: {
                testsCompleted: progress.testsCompleted.completed,
                testScore: percentage,
            },
        });
    } catch (error) {
        console.error("Update test progress error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật tiến độ test",
        });
    }
};

// Helper function to initialize user progress
const initializeUserProgress = async (userId: string) => {
    return await Progress.create({
        userId,
        vocabulary: { learned: 0, target: 5000, recentWords: [] },
        listening: { hoursCompleted: 0, target: 200, recentSessions: [] },
        testsCompleted: { completed: 0, target: 60, recentTests: [] },
        studyStreak: { current: 0, target: 30, lastStudyDate: new Date() },
        weeklyActivity: [],
        totalStudyTime: 0,
        level: "A1",
        achievements: [],
    });
};

// Helper function to update study activity and streak
const updateStudyActivity = async (
    userId: string,
    activity: string,
    hours: number
) => {
    try {
        const progress = await Progress.findOne({ userId });
        if (!progress) return;

        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayNames = [
            "Chủ nhật",
            "Thứ 2",
            "Thứ 3",
            "Thứ 4",
            "Thứ 5",
            "Thứ 6",
            "Thứ 7",
        ];
        const currentDay = dayNames[dayOfWeek];

        // Get current week (ISO format)
        const year = today.getFullYear();
        const week = getWeekNumber(today);
        const weekString = `${year}-W${week.toString().padStart(2, "0")}`;

        // Find or create current week activity
        let currentWeek = progress.weeklyActivity.find(
            (w) => w.week === weekString
        );

        if (!currentWeek) {
            currentWeek = {
                week: weekString,
                days: dayNames.map((day) => ({
                    day,
                    hours: 0,
                    activities: [],
                })),
                totalHours: 0,
            };
            progress.weeklyActivity.push(currentWeek);
        }

        // Update current day activity
        const currentDayActivity = currentWeek.days.find(
            (d) => d.day === currentDay
        );
        if (currentDayActivity) {
            currentDayActivity.hours += hours;
            if (!currentDayActivity.activities.includes(activity)) {
                currentDayActivity.activities.push(activity);
            }
        }

        // Update total hours for the week
        currentWeek.totalHours = currentWeek.days.reduce(
            (sum, day) => sum + day.hours,
            0
        );

        // Update total study time
        progress.totalStudyTime += hours;

        // Update streak
        const lastStudyDate = new Date(progress.studyStreak.lastStudyDate);
        const daysDiff = Math.floor(
            (today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 0) {
            // Same day, just update last study date
            progress.studyStreak.lastStudyDate = today;
        } else if (daysDiff === 1) {
            // Consecutive day, increase streak
            progress.studyStreak.current += 1;
            progress.studyStreak.lastStudyDate = today;
        } else if (daysDiff > 1) {
            // Streak broken, reset to 1
            progress.studyStreak.current = 1;
            progress.studyStreak.lastStudyDate = today;
        }

        // Keep only last 8 weeks
        if (progress.weeklyActivity.length > 8) {
            progress.weeklyActivity = progress.weeklyActivity.slice(-8);
        }

        // Update user total study hours
        await User.findByIdAndUpdate(userId, {
            totalStudyHours: progress.totalStudyTime,
            streakCount: progress.studyStreak.current,
        });

        // Check streak achievements
        await checkStreakAchievements(userId, progress.studyStreak.current);

        await progress.save();
    } catch (error) {
        console.error("Error updating study activity:", error);
    }
};

// Helper function to get week number
const getWeekNumber = (date: Date): number => {
    const d = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

// Achievement checking functions
const checkVocabularyAchievements = async (
    userId: string,
    wordsLearned: number
) => {
    const progress = await Progress.findOne({ userId });
    if (!progress) return;

    const achievements = [
        {
            id: "vocab_10",
            title: "Khởi đầu từ vựng",
            description: "Học được 10 từ vựng đầu tiên",
            icon: "📖",
            threshold: 10,
        },
        {
            id: "vocab_50",
            title: "Người học từ vựng",
            description: "Học được 50 từ vựng",
            icon: "📚",
            threshold: 50,
        },
        {
            id: "vocab_100",
            title: "Học thuộc 100 từ",
            description: "Học được 100 từ vựng mới",
            icon: "📚",
            threshold: 100,
        },
        {
            id: "vocab_500",
            title: "Chuyên gia từ vựng",
            description: "Học được 500 từ vựng",
            icon: "🎓",
            threshold: 500,
        },
        {
            id: "vocab_1000",
            title: "Bậc thầy từ vựng",
            description: "Học được 1000 từ vựng",
            icon: "👑",
            threshold: 1000,
        },
    ];

    for (const achievement of achievements) {
        if (wordsLearned >= achievement.threshold) {
            const exists = progress.achievements.find(
                (a) => a.id === achievement.id
            );
            if (!exists) {
                progress.achievements.push({
                    id: achievement.id,
                    title: achievement.title,
                    description: achievement.description,
                    icon: achievement.icon,
                    unlockedAt: new Date(),
                    category: "vocabulary",
                });
            }
        }
    }

    await progress.save();
};

const checkListeningAchievements = async (
    userId: string,
    hoursCompleted: number
) => {
    const progress = await Progress.findOne({ userId });
    if (!progress) return;

    const achievements = [
        {
            id: "listening_5",
            title: "Người nghe mới",
            description: "Hoàn thành 5 giờ luyện nghe",
            icon: "🎧",
            threshold: 5,
        },
        {
            id: "listening_20",
            title: "Người nghe chăm chỉ",
            description: "Hoàn thành 20 giờ luyện nghe",
            icon: "🎧",
            threshold: 20,
        },
        {
            id: "listening_50",
            title: "Người nghe chuyên nghiệp",
            description: "Hoàn thành 50 giờ luyện nghe",
            icon: "🎧",
            threshold: 50,
        },
        {
            id: "listening_100",
            title: "Bậc thầy nghe",
            description: "Hoàn thành 100 giờ luyện nghe",
            icon: "👂",
            threshold: 100,
        },
    ];

    for (const achievement of achievements) {
        if (hoursCompleted >= achievement.threshold) {
            const exists = progress.achievements.find(
                (a) => a.id === achievement.id
            );
            if (!exists) {
                progress.achievements.push({
                    id: achievement.id,
                    title: achievement.title,
                    description: achievement.description,
                    icon: achievement.icon,
                    unlockedAt: new Date(),
                    category: "listening",
                });
            }
        }
    }

    await progress.save();
};

const checkTestAchievements = async (
    userId: string,
    testsCompleted: number,
    lastScore: number
) => {
    const progress = await Progress.findOne({ userId });
    if (!progress) return;

    const achievements = [
        {
            id: "test_1",
            title: "Bước đầu tiên",
            description: "Hoàn thành bài test đầu tiên",
            icon: "🎯",
            threshold: 1,
        },
        {
            id: "test_5",
            title: "Người làm test",
            description: "Hoàn thành 5 bài test",
            icon: "📝",
            threshold: 5,
        },
        {
            id: "test_10",
            title: "Bậc thầy kiểm tra",
            description: "Hoàn thành 10 bài kiểm tra",
            icon: "🏆",
            threshold: 10,
        },
        {
            id: "test_25",
            title: "Chuyên gia test",
            description: "Hoàn thành 25 bài test",
            icon: "🥇",
            threshold: 25,
        },
    ];

    // Score-based achievements
    if (lastScore >= 90) {
        const excellentExists = progress.achievements.find(
            (a) => a.id === "score_excellent"
        );
        if (!excellentExists) {
            progress.achievements.push({
                id: "score_excellent",
                title: "Điểm số xuất sắc",
                description: "Đạt điểm 90% trở lên trong bài test",
                icon: "⭐",
                unlockedAt: new Date(),
                category: "test",
            });
        }
    }

    for (const achievement of achievements) {
        if (testsCompleted >= achievement.threshold) {
            const exists = progress.achievements.find(
                (a) => a.id === achievement.id
            );
            if (!exists) {
                progress.achievements.push({
                    id: achievement.id,
                    title: achievement.title,
                    description: achievement.description,
                    icon: achievement.icon,
                    unlockedAt: new Date(),
                    category: "test",
                });
            }
        }
    }

    await progress.save();
};

const checkStreakAchievements = async (
    userId: string,
    currentStreak: number
) => {
    const progress = await Progress.findOne({ userId });
    if (!progress) return;

    const achievements = [
        {
            id: "streak_3",
            title: "Khởi đầu tốt",
            description: "Học liên tục trong 3 ngày",
            icon: "🔥",
            threshold: 3,
        },
        {
            id: "streak_7",
            title: "Streak 7 ngày",
            description: "Học liên tục trong 7 ngày",
            icon: "🔥",
            threshold: 7,
        },
        {
            id: "streak_14",
            title: "Hai tuần kiên trì",
            description: "Học liên tục trong 14 ngày",
            icon: "💪",
            threshold: 14,
        },
        {
            id: "streak_30",
            title: "Tháng hoàn hảo",
            description: "Học liên tục trong 30 ngày",
            icon: "👑",
            threshold: 30,
        },
    ];

    for (const achievement of achievements) {
        if (currentStreak >= achievement.threshold) {
            const exists = progress.achievements.find(
                (a) => a.id === achievement.id
            );
            if (!exists) {
                progress.achievements.push({
                    id: achievement.id,
                    title: achievement.title,
                    description: achievement.description,
                    icon: achievement.icon,
                    unlockedAt: new Date(),
                    category: "streak",
                });
            }
        }
    }

    await progress.save();
};
