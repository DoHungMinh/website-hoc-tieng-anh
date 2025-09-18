import { API_BASE_URL, API_ENDPOINTS } from "../utils/constants";

interface UserProgressStats {
    weeklyActivity: Array<{
        day: string;
        dayLabel: string;
        hours: number;
    }>;
    testsCompleted: number;
    coursesEnrolled: number;
    averageScore: number;
    totalStudyTime: number;
    weeklyStudyTime: number;
    weeklyGrowth: number;
}

interface CourseEnrollment {
    _id: string;
    course: {
        title: string;
        level: string;
    };
    enrolledAt: string;
    status: string;
}

interface IELTSResult {
    _id: string;
    examTitle: string;
    examType: "reading" | "listening";
    score: {
        correctAnswers: number;
        totalQuestions: number;
        percentage: number;
        bandScore?: number;
        description?: string;
    };
    completedAt: string;
}

interface ProgressData {
    vocabulary: {
        learned: number;
        target: number;
    };
    listening: {
        hoursCompleted: number;
        target: number;
    };
    testsCompleted: {
        completed: number;
        target: number;
    };
    totalStudyTime: number;
    level: string;
}

class ProgressService {
    private async getAuthHeaders() {
        const token = localStorage.getItem("token");
        console.log(
            "ProgressService: Using token:",
            token ? "Present" : "Missing"
        );
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    }

    // Lấy dữ liệu tiến độ từ backend
    async getUserProgress(): Promise<ProgressData | null> {
        try {
            const url = `${API_BASE_URL}${API_ENDPOINTS.PROGRESS.GET}`;
            console.log("ProgressService: Fetching progress from:", url);

            const response = await fetch(url, {
                headers: await this.getAuthHeaders(),
            });

            console.log(
                "ProgressService: Progress response status:",
                response.status
            );

            if (response.status === 404) {
                // User chưa có progress, tự động initialize
                console.log("Progress not found, initializing...");
                const initResponse = await fetch(
                    `${API_BASE_URL}/progress/initialize`,
                    {
                        method: "POST",
                        headers: await this.getAuthHeaders(),
                    }
                );

                if (initResponse.ok) {
                    const initData = await initResponse.json();
                    console.log("Progress initialized:", initData.success);
                    return initData.success ? initData.data : null;
                }
                return null;
            }

            if (!response.ok) {
                console.warn("Progress data not found, user might be new");
                return null;
            }

            const data = await response.json();
            console.log(
                "ProgressService: Progress data received:",
                data.success
            );
            return data.success ? data.data : null;
        } catch (error) {
            console.error("Error fetching user progress:", error);
            return null;
        }
    }

    // Lấy danh sách khóa học đã đăng ký
    async getUserEnrollments(): Promise<CourseEnrollment[]> {
        try {
            const url = `${API_BASE_URL}/enrollment`;
            console.log("ProgressService: Fetching enrollments from:", url);

            const response = await fetch(url, {
                headers: await this.getAuthHeaders(),
            });

            console.log(
                "ProgressService: Enrollments response status:",
                response.status
            );

            if (!response.ok) {
                console.warn(
                    "Enrollments request failed with status:",
                    response.status
                );
                return [];
            }

            const data = await response.json();
            console.log("ProgressService: Enrollments data:", data);

            // API trả về trực tiếp object với enrollments array
            const enrollments = data.enrollments || [];
            console.log(
                "ProgressService: Parsed enrollments count:",
                enrollments.length
            );

            return enrollments;
        } catch (error) {
            console.error("Error fetching enrollments:", error);
            return [];
        }
    }

    // Lấy số lượng khóa học đã đăng ký (để hiển thị thống kê)
    async getEnrollmentCount(): Promise<number> {
        try {
            const url = `${API_BASE_URL}/enrollment`;
            console.log(
                "ProgressService: Fetching enrollment count from:",
                url
            );

            const response = await fetch(url, {
                headers: await this.getAuthHeaders(),
            });

            if (!response.ok) {
                console.warn(
                    "Enrollment count request failed with status:",
                    response.status
                );
                return 0;
            }

            const data = await response.json();
            console.log("ProgressService: Enrollment count data:", data);

            // Sử dụng totalCourses từ API response
            const count = data.totalCourses || data.enrollments?.length || 0;
            console.log("ProgressService: Enrollment count:", count);

            return count;
        } catch (error) {
            console.error("Error fetching enrollment count:", error);
            return 0;
        }
    }

    // Lấy kết quả IELTS
    async getIELTSResults(): Promise<IELTSResult[]> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/ielts/results/history`,
                {
                    headers: await this.getAuthHeaders(),
                }
            );

            if (!response.ok) return [];

            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error("Error fetching IELTS results:", error);
            return [];
        }
    }

    // Lấy dữ liệu hoạt động tuần
    async getWeeklyActivity(): Promise<{
        weeklyActivity: Array<{
            day: string;
            dayLabel: string;
            hours: number;
            activities: string[];
        }>;
        totalStudyTime: number;
        weeklyStudyTime: number;
        weeklyGrowth: number;
    } | null> {
        try {
            const response = await fetch(
                `${API_BASE_URL}${API_ENDPOINTS.PROGRESS.WEEKLY_ACTIVITY}`,
                {
                    headers: await this.getAuthHeaders(),
                }
            );

            if (!response.ok) {
                console.warn("Weekly activity data not found");
                return null;
            }

            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error("Error fetching weekly activity:", error);
            return null;
        }
    }

    // Tính toán thống kê tổng hợp
    async getUserProgressStats(): Promise<UserProgressStats> {
        try {
            console.log("ProgressService: Starting to fetch progress stats...");

            // Lấy dữ liệu song song
            const [progress, enrollmentCount, ieltsResults, weeklyData] =
                await Promise.all([
                    this.getUserProgress(),
                    this.getEnrollmentCount(),
                    this.getIELTSResults(),
                    this.getWeeklyActivity(),
                ]);

            console.log("ProgressService: Data received:", {
                progress: !!progress,
                enrollments: enrollmentCount,
                ieltsResults: ieltsResults.length,
                weeklyData: !!weeklyData,
            });

            // Tính toán các thống kê
            const totalStudyTime = progress?.totalStudyTime || 0;
            // Chỉ dùng IELTS results để tránh trùng lặp khi cả progress và IELTS đều được cập nhật
            const testsCompleted = ieltsResults.length;
            const coursesEnrolled = enrollmentCount;

            // Tính điểm trung bình từ IELTS results
            const averageScore =
                ieltsResults.length > 0
                    ? ieltsResults.reduce(
                          (sum, result) =>
                              sum +
                              (result.score.bandScore ||
                                  result.score.percentage / 10),
                          0
                      ) / ieltsResults.length
                    : 0;

            // Sử dụng dữ liệu từ API hoặc fallback
            const weeklyActivity = weeklyData?.weeklyActivity || [
                { day: "Mon", dayLabel: "T2", hours: 0 },
                { day: "Tue", dayLabel: "T3", hours: 0 },
                { day: "Wed", dayLabel: "T4", hours: 0 },
                { day: "Thu", dayLabel: "T5", hours: 0 },
                { day: "Fri", dayLabel: "T6", hours: 0 },
                { day: "Sat", dayLabel: "T7", hours: 0 },
                { day: "Sun", dayLabel: "CN", hours: 0 },
            ];

            // Sử dụng dữ liệu thực từ API, không tạo ngẫu nhiên
            let weeklyStudyTime = weeklyData?.weeklyStudyTime || 0;
            let weeklyGrowth = weeklyData?.weeklyGrowth || 0;

            // Nếu không có dữ liệu thực, sử dụng 0 thay vì tạo ngẫu nhiên
            if (weeklyStudyTime === 0 && testsCompleted > 0) {
                // Chỉ estimate thời gian học cơ bản từ tests, không tạo random
                weeklyStudyTime = Math.min(testsCompleted * 0.5, 10); // Max 10h per week
                weeklyGrowth = 0; // Không có dữ liệu thực thì hiển thị 0%

                // Không update weekly activity với dữ liệu giả
                // Giữ nguyên dữ liệu từ API hoặc fallback về 0
            }

            console.log("ProgressService: Final stats:", {
                testsCompleted,
                coursesEnrolled,
                averageScore,
                totalStudyTime,
                weeklyStudyTime,
                weeklyGrowth,
            });

            return {
                weeklyActivity: weeklyActivity.map((day) => ({
                    day: day.day,
                    dayLabel: day.dayLabel,
                    hours: day.hours,
                })),
                testsCompleted,
                coursesEnrolled,
                averageScore: Math.round(averageScore * 10) / 10,
                totalStudyTime,
                weeklyStudyTime,
                weeklyGrowth,
            };
        } catch (error) {
            console.error("Error calculating progress stats:", error);

            // Fallback to default data if error
            return {
                weeklyActivity: [
                    { day: "Mon", dayLabel: "T2", hours: 0 },
                    { day: "Tue", dayLabel: "T3", hours: 0 },
                    { day: "Wed", dayLabel: "T4", hours: 0 },
                    { day: "Thu", dayLabel: "T5", hours: 0 },
                    { day: "Fri", dayLabel: "T6", hours: 0 },
                    { day: "Sat", dayLabel: "T7", hours: 0 },
                    { day: "Sun", dayLabel: "CN", hours: 0 },
                ],
                testsCompleted: 0,
                coursesEnrolled: 0,
                averageScore: 0,
                totalStudyTime: 0,
                weeklyStudyTime: 0,
                weeklyGrowth: 0,
            };
        }
    }

    // Cập nhật progress khi user hoàn thành test
    async updateTestProgress(
        testName: string,
        score: number,
        maxScore: number,
        percentage: number
    ): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/progress/test`, {
                method: "POST",
                headers: await this.getAuthHeaders(),
                body: JSON.stringify({
                    testName,
                    score,
                    maxScore,
                    percentage,
                }),
            });

            if (!response.ok) {
                console.warn(
                    "Failed to update test progress:",
                    response.status
                );
                return false;
            }

            const data = await response.json();
            console.log("Test progress updated:", data.success);
            return data.success;
        } catch (error) {
            console.error("Error updating test progress:", error);
            return false;
        }
    }

    // Cập nhật progress khi user học từ vựng
    async updateVocabularyProgress(
        word: string,
        meaning: string,
        example: string
    ): Promise<boolean> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/progress/vocabulary`,
                {
                    method: "POST",
                    headers: await this.getAuthHeaders(),
                    body: JSON.stringify({
                        word,
                        meaning,
                        example,
                    }),
                }
            );

            if (!response.ok) {
                console.warn(
                    "Failed to update vocabulary progress:",
                    response.status
                );
                return false;
            }

            const data = await response.json();
            console.log("Vocabulary progress updated:", data.success);
            return data.success;
        } catch (error) {
            console.error("Error updating vocabulary progress:", error);
            return false;
        }
    }

    // Cập nhật progress khi user luyện nghe
    async updateListeningProgress(
        title: string,
        duration: number,
        difficulty: string,
        score: number
    ): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/progress/listening`, {
                method: "POST",
                headers: await this.getAuthHeaders(),
                body: JSON.stringify({
                    title,
                    duration,
                    difficulty,
                    score,
                }),
            });

            if (!response.ok) {
                console.warn(
                    "Failed to update listening progress:",
                    response.status
                );
                return false;
            }

            const data = await response.json();
            console.log("Listening progress updated:", data.success);
            return data.success;
        } catch (error) {
            console.error("Error updating listening progress:", error);
            return false;
        }
    }
}

export const progressService = new ProgressService();
export type { UserProgressStats };
