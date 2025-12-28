import { useState, useEffect } from "react";
import {
    Headphones,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    Star,
    Timer,
    ArrowLeft,
    FileText,
    BookOpen,
} from "lucide-react";
import {
    calculateIELTSScore,
    calculateSimpleScore,
    getBandScoreColor,
    getBandScoreBackground,
} from "@/utils/ieltsScoring";
import { progressService } from "@/services/progressService";
import { API_BASE_URL } from '@/utils/constants';

interface Question {
    id: string;
    type:
    | "multiple-choice"
    | "fill-blank"
    | "true-false-notgiven"
    | "matching"
    | "map-labeling";
    question: string;
    options?: string[];
    correctAnswer?: string | number;
    userAnswer?: string | number;
    audioTimestamp?: number;
}

interface Passage {
    id: string;
    title: string;
    content: string;
    questions: Question[];
}

interface Section {
    id: string;
    title: string;
    description: string;
    audioUrl?: string;
    duration: number;
    questions: Question[];
}

interface ExamData {
    _id: string;
    title: string;
    type: "reading" | "listening";
    difficulty: string;
    duration: number;
    totalQuestions: number;
    description: string;
    passages?: Passage[];
    sections?: Section[];
}

interface IELTSTestProps {
    onBackToCenter?: () => void;
}

const IELTSTest: React.FC<IELTSTestProps> = ({ onBackToCenter }) => {
    const [examData, setExamData] = useState<ExamData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentSection, setCurrentSection] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string | number>>({});
    const [testStarted, setTestStarted] = useState(false);
    const [testStartTime, setTestStartTime] = useState<number>(0);
    const [showResults, setShowResults] = useState(false);
    const [showDetailedResults, setShowDetailedResults] = useState(false);

    // Fetch exam data
    useEffect(() => {
        const fetchExamData = async () => {
            try {
                const currentExam = sessionStorage.getItem("currentExam");
                if (!currentExam) {
                    console.error("No exam selected");
                    alert("Vui lòng chọn đề thi từ danh sách");
                    onBackToCenter?.();
                    return;
                }

                const { examId } = JSON.parse(currentExam);
                if (!examId) {
                    console.error("Invalid exam data");
                    alert("Dữ liệu đề thi không hợp lệ");
                    onBackToCenter?.();
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/ielts/${examId}`);

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data) {
                        setExamData(data.data);
                        setTimeRemaining(data.data.duration * 60); // Convert minutes to seconds
                    } else {
                        console.error("Invalid exam data structure:", data);
                        alert("Dữ liệu đề thi không hợp lệ");
                        onBackToCenter?.();
                    }
                } else {
                    console.error(
                        "Failed to fetch exam data:",
                        response.status
                    );
                    alert("Không thể tải đề thi. Vui lòng thử lại");
                    onBackToCenter?.();
                }
            } catch (error) {
                console.error("Error fetching exam data:", error);
                alert("Lỗi khi tải đề thi");
                onBackToCenter?.();
            } finally {
                setLoading(false);
            }
        };

        fetchExamData();
    }, [onBackToCenter]);

    // Timer effect
    useEffect(() => {
        if (testStarted && timeRemaining > 0 && !showResults) {
            const timer = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        setShowResults(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [testStarted, timeRemaining, showResults]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
                .toString()
                .padStart(2, "0")}`;
        }
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    const handleAnswer = (questionId: string, answer: string | number) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const handleBackToCenter = () => {
        sessionStorage.removeItem("currentExam");
        if (onBackToCenter) {
            onBackToCenter();
        } else {
            window.location.reload(); // Fallback
        }
    };

    const getCurrentQuestions = (): Question[] => {
        if (!examData) return [];

        if (examData.type === "reading" && examData.passages) {
            return examData.passages[currentSection]?.questions || [];
        } else if (examData.type === "listening" && examData.sections) {
            return examData.sections[currentSection]?.questions || [];
        }

        return [];
    };

    const getTotalSections = (): number => {
        if (!examData) return 0;

        if (examData.type === "reading" && examData.passages) {
            return examData.passages.length;
        } else if (examData.type === "listening" && examData.sections) {
            return examData.sections.length;
        }

        return 0;
    };

    const getCurrentSectionTitle = (): string => {
        if (!examData) return "";

        if (examData.type === "reading" && examData.passages) {
            return examData.passages[currentSection]?.title || "";
        } else if (examData.type === "listening" && examData.sections) {
            return examData.sections[currentSection]?.title || "";
        }

        return "";
    };

    const getCurrentPassageContent = (): string => {
        if (!examData || examData.type !== "reading" || !examData.passages)
            return "";
        return examData.passages[currentSection]?.content || "";
    };

    const getCurrentAudioUrl = (): string => {
        if (!examData || examData.type !== "listening" || !examData.sections)
            return "";
        return examData.sections[currentSection]?.audioUrl || "";
    };

    const calculateIELTSScoring = () => {
        // Get all questions from all sections/passages
        const allQuestions: Question[] = [];

        if (examData?.type === "reading" && examData.passages) {
            examData.passages.forEach((passage) => {
                allQuestions.push(...passage.questions);
            });
        } else if (examData?.type === "listening" && examData.sections) {
            examData.sections.forEach((section) => {
                allQuestions.push(...section.questions);
            });
        }

        // Count correct answers
        const correctAnswers = Object.keys(answers).reduce(
            (count, questionId) => {
                const question = allQuestions.find(
                    (q: Question) => q.id === questionId
                );
                if (question && question.correctAnswer !== undefined) {
                    let userAnswer = answers[questionId];
                    let correctAnswer = question.correctAnswer;

                    // Handle multiple choice: convert letters to indices for comparison
                    if (question.type === "multiple-choice") {
                        // Convert correct answer letter to index
                        if (
                            typeof correctAnswer === "string" &&
                            correctAnswer.match(/^[A-D]$/)
                        ) {
                            correctAnswer = correctAnswer.charCodeAt(0) - 65;
                        }
                        // Convert user answer letter to index
                        if (
                            typeof userAnswer === "string" &&
                            userAnswer.match(/^[A-D]$/)
                        ) {
                            userAnswer = userAnswer.charCodeAt(0) - 65;
                        }
                    }

                    // Handle True/False/Not Given: normalize both to string format for comparison
                    if (question.type === "true-false-notgiven") {
                        const tfngOptions = ["TRUE", "FALSE", "NOT GIVEN"];
                        // Convert index-based answers to strings for comparison
                        if (
                            typeof correctAnswer === "number" &&
                            correctAnswer >= 0 &&
                            correctAnswer < 3
                        ) {
                            correctAnswer = tfngOptions[correctAnswer];
                        }
                        if (
                            typeof userAnswer === "number" &&
                            userAnswer >= 0 &&
                            userAnswer < 3
                        ) {
                            userAnswer = tfngOptions[userAnswer];
                        }
                    }

                    if (userAnswer === correctAnswer) {
                        return count + 1;
                    }
                }
                return count;
            },
            0
        );

        const totalQuestions = allQuestions.length;

        // Check if questions have correct answers for IELTS scoring
        const hasCorrectAnswers = allQuestions.some(
            (q) => q.correctAnswer !== undefined
        );

        if (
            hasCorrectAnswers &&
            (examData?.type === "listening" || examData?.type === "reading")
        ) {
            if (examData?.type === "listening") {
                return calculateIELTSScore("listening", correctAnswers);
            } else if (examData?.type === "reading") {
                return calculateIELTSScore("reading", correctAnswers);
            }
        }

        // Fallback to simple scoring if no correct answers available
        const answeredQuestions = Object.keys(answers).length;
        const simpleResult = calculateSimpleScore(
            answeredQuestions,
            totalQuestions
        );

        return {
            totalQuestions,
            correctAnswers: hasCorrectAnswers
                ? correctAnswers
                : answeredQuestions,
            bandScore: 0,
            percentage: simpleResult.percentage,
            description: simpleResult.description,
        };
    };

    const getQuestionDetails = () => {
        // Get all questions from all sections/passages with their details
        const questionDetails: Array<{
            id: string;
            question: string;
            type: string;
            options?: string[];
            correctAnswer?: string | number;
            userAnswer?: string | number;
            isCorrect?: boolean;
            sectionTitle?: string;
        }> = [];

        if (examData?.type === "reading" && examData.passages) {
            examData.passages.forEach((passage, passageIndex) => {
                passage.questions.forEach((question) => {
                    const userAnswer = answers[question.id];

                    // Calculate isCorrect with proper comparison for multiple choice and T/F/NG
                    let isCorrect = false;
                    if (question.correctAnswer !== undefined) {
                        let correctAnswer = question.correctAnswer;
                        let currentUserAnswer = userAnswer;

                        // Handle multiple choice: convert letters to indices for comparison
                        if (question.type === "multiple-choice") {
                            if (
                                typeof correctAnswer === "string" &&
                                correctAnswer.match(/^[A-D]$/)
                            ) {
                                correctAnswer =
                                    correctAnswer.charCodeAt(0) - 65;
                            }
                            if (
                                typeof currentUserAnswer === "string" &&
                                currentUserAnswer.match(/^[A-D]$/)
                            ) {
                                currentUserAnswer =
                                    currentUserAnswer.charCodeAt(0) - 65;
                            }
                        }

                        // Handle True/False/Not Given: normalize both to uppercase string format for comparison
                        if (question.type === "true-false-notgiven") {
                            // Convert index-based answers to strings for comparison
                            const tfngOptions = ["TRUE", "FALSE", "NOT GIVEN"];
                            if (
                                typeof correctAnswer === "number" &&
                                correctAnswer >= 0 &&
                                correctAnswer < 3
                            ) {
                                correctAnswer = tfngOptions[correctAnswer];
                            } else if (typeof correctAnswer === "string") {
                                correctAnswer = correctAnswer.toUpperCase();
                            }

                            if (
                                typeof currentUserAnswer === "number" &&
                                currentUserAnswer >= 0 &&
                                currentUserAnswer < 3
                            ) {
                                currentUserAnswer =
                                    tfngOptions[currentUserAnswer];
                            } else if (typeof currentUserAnswer === "string") {
                                currentUserAnswer =
                                    currentUserAnswer.toUpperCase();
                            }
                        }

                        isCorrect = currentUserAnswer === correctAnswer;
                    }

                    questionDetails.push({
                        id: question.id,
                        question: question.question,
                        type: question.type,
                        options: question.options,
                        correctAnswer: question.correctAnswer,
                        userAnswer: userAnswer,
                        isCorrect: isCorrect,
                        sectionTitle: `Passage ${passageIndex + 1}: ${passage.title
                            }`,
                    });
                });
            });
        } else if (examData?.type === "listening" && examData.sections) {
            examData.sections.forEach((section, sectionIndex) => {
                section.questions.forEach((question) => {
                    const userAnswer = answers[question.id];

                    // Calculate isCorrect with proper comparison for multiple choice and T/F/NG
                    let isCorrect = false;
                    if (question.correctAnswer !== undefined) {
                        let correctAnswer = question.correctAnswer;
                        let currentUserAnswer = userAnswer;

                        // Handle multiple choice: convert letters to indices for comparison
                        if (question.type === "multiple-choice") {
                            if (
                                typeof correctAnswer === "string" &&
                                correctAnswer.match(/^[A-D]$/)
                            ) {
                                correctAnswer =
                                    correctAnswer.charCodeAt(0) - 65;
                            }
                            if (
                                typeof currentUserAnswer === "string" &&
                                currentUserAnswer.match(/^[A-D]$/)
                            ) {
                                currentUserAnswer =
                                    currentUserAnswer.charCodeAt(0) - 65;
                            }
                        }

                        // Handle True/False/Not Given: normalize both to uppercase string format for comparison
                        if (question.type === "true-false-notgiven") {
                            // Convert index-based answers to strings for comparison
                            const tfngOptions = ["TRUE", "FALSE", "NOT GIVEN"];
                            if (
                                typeof correctAnswer === "number" &&
                                correctAnswer >= 0 &&
                                correctAnswer < 3
                            ) {
                                correctAnswer = tfngOptions[correctAnswer];
                            } else if (typeof correctAnswer === "string") {
                                correctAnswer = correctAnswer.toUpperCase();
                            }

                            if (
                                typeof currentUserAnswer === "number" &&
                                currentUserAnswer >= 0 &&
                                currentUserAnswer < 3
                            ) {
                                currentUserAnswer =
                                    tfngOptions[currentUserAnswer];
                            } else if (typeof currentUserAnswer === "string") {
                                currentUserAnswer =
                                    currentUserAnswer.toUpperCase();
                            }
                        }

                        isCorrect = currentUserAnswer === correctAnswer;
                    }

                    questionDetails.push({
                        id: question.id,
                        question: question.question,
                        type: question.type,
                        options: question.options,
                        correctAnswer: question.correctAnswer,
                        userAnswer: userAnswer,
                        isCorrect: isCorrect,
                        sectionTitle: `Section ${sectionIndex + 1}: ${section.title
                            }`,
                    });
                });
            });
        }

        return questionDetails;
    };

    const handleSubmitTest = async () => {
        if (confirm("Bạn có chắc chắn muốn nộp bài không?")) {
            // Calculate test result first
            const testResult = calculateIELTSScoring();

            // Save result to backend
            try {
                const token = localStorage.getItem("token");
                if (token && examData) {
                    const timeSpent = Date.now() - testStartTime;

                    const response = await fetch(
                        `${API_BASE_URL}/ielts/${examData._id}/submit`,
                        {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                answers: answers,
                                timeSpent: Math.floor(timeSpent / 1000), // Convert to seconds
                            }),
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        console.log("Test result saved:", data);

                        // Update progress after saving test result
                        try {
                            await progressService.updateTestProgress(
                                examData.title,
                                testResult.correctAnswers,
                                testResult.totalQuestions,
                                testResult.percentage
                            );
                            console.log("Progress updated successfully");
                        } catch (progressError) {
                            console.error(
                                "Failed to update progress:",
                                progressError
                            );
                        }
                    } else {
                        console.error(
                            "Failed to save test result:",
                            response.status
                        );
                    }
                }
            } catch (error) {
                console.error("Error saving test result:", error);
            }

            setShowResults(true);
        }
    };

    const handleStartTest = () => {
        setTestStarted(true);
        setTestStartTime(Date.now());
    };

    const nextQuestion = () => {
        const questions = getCurrentQuestions();
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else if (currentSection < getTotalSections() - 1) {
            setCurrentSection(currentSection + 1);
            setCurrentQuestion(0);
        }
    };

    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        } else if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
            const prevSectionQuestions =
                examData?.type === "reading"
                    ? examData.passages?.[currentSection - 1]?.questions
                        .length || 0
                    : examData?.sections?.[currentSection - 1]?.questions
                        .length || 0;
            setCurrentQuestion(prevSectionQuestions - 1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải đề thi...</p>
                </div>
            </div>
        );
    }

    if (!examData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Không tìm thấy đề thi
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Vui lòng chọn đề thi từ danh sách.
                    </p>
                    <button
                        onClick={handleBackToCenter}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Quay lại IELTS Center
                    </button>
                </div>
            </div>
        );
    }

    // Show detailed results screen (check this FIRST)
    if (showDetailedResults) {
        const questionDetails = getQuestionDetails();
        const testResult = calculateIELTSScoring();

        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => setShowDetailedResults(false)}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Quay lại kết quả tổng quát
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Chi tiết kết quả bài thi
                            </h1>
                            <div></div>
                        </div>

                        {/* Summary stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                <div className="text-xl font-bold text-blue-600">
                                    {testResult.correctAnswers}
                                </div>
                                <div className="text-blue-600 text-sm">
                                    Câu đúng
                                </div>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4 text-center">
                                <div className="text-xl font-bold text-red-600">
                                    {testResult.totalQuestions -
                                        testResult.correctAnswers}
                                </div>
                                <div className="text-red-600 text-sm">
                                    Câu sai
                                </div>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-4 text-center">
                                <div className="text-xl font-bold text-yellow-600">
                                    {testResult.percentage}%
                                </div>
                                <div className="text-yellow-600 text-sm">
                                    Tỷ lệ chính xác
                                </div>
                            </div>
                            {testResult.bandScore > 0 && (
                                <div
                                    className={`rounded-lg p-4 text-center ${getBandScoreColor(
                                        testResult.bandScore
                                    )}`}
                                >
                                    <div className="text-xl font-bold">
                                        {testResult.bandScore}
                                    </div>
                                    <div className="text-sm">IELTS Band</div>
                                </div>
                            )}
                        </div>

                        {/* Questions by section */}
                        <div className="space-y-6">
                            {(() => {
                                const groupedQuestions: {
                                    [key: string]: typeof questionDetails;
                                } = {};
                                questionDetails.forEach((q) => {
                                    const section = q.sectionTitle || "General";
                                    if (!groupedQuestions[section]) {
                                        groupedQuestions[section] = [];
                                    }
                                    groupedQuestions[section].push(q);
                                });

                                return Object.entries(groupedQuestions).map(
                                    ([sectionTitle, questions]) => (
                                        <div
                                            key={sectionTitle}
                                            className="border rounded-lg p-6"
                                        >
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                {sectionTitle}
                                            </h3>
                                            <div className="space-y-4">
                                                {questions.map(
                                                    (question, index) => (
                                                        <div
                                                            key={question.id}
                                                            className={`border rounded-lg p-4 ${question.isCorrect
                                                                ? "border-green-200 bg-green-50"
                                                                : question.correctAnswer !==
                                                                    undefined
                                                                    ? "border-red-200 bg-red-50"
                                                                    : "border-gray-200 bg-gray-50"
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div
                                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${question.isCorrect
                                                                            ? "bg-green-500"
                                                                            : question.correctAnswer !==
                                                                                undefined
                                                                                ? "bg-red-500"
                                                                                : "bg-gray-500"
                                                                            }`}
                                                                    >
                                                                        {index +
                                                                            1}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {question.isCorrect ? (
                                                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                                                        ) : question.correctAnswer !==
                                                                            undefined ? (
                                                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                                                        ) : (
                                                                            <div className="h-5 w-5"></div>
                                                                        )}
                                                                        <span className="text-sm font-medium text-gray-600">
                                                                            {
                                                                                question.type
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="mb-3">
                                                                <p className="text-gray-900 font-medium">
                                                                    {
                                                                        question.question
                                                                    }
                                                                </p>
                                                            </div>

                                                            {/* Multiple choice options */}
                                                            {question.type ===
                                                                "multiple-choice" &&
                                                                question.options && (
                                                                    <div className="space-y-2 mb-3">
                                                                        {question.options.map(
                                                                            (
                                                                                option,
                                                                                optionIndex
                                                                            ) => {
                                                                                // Convert correct answer letter to index for comparison
                                                                                const correctAnswerIndex =
                                                                                    typeof question.correctAnswer ===
                                                                                        "string" &&
                                                                                        question.correctAnswer.match(
                                                                                            /^[A-D]$/
                                                                                        )
                                                                                        ? question.correctAnswer.charCodeAt(
                                                                                            0
                                                                                        ) -
                                                                                        65
                                                                                        : question.correctAnswer;

                                                                                // Convert user answer letter to index for comparison
                                                                                const userAnswerIndex =
                                                                                    typeof question.userAnswer ===
                                                                                        "string" &&
                                                                                        question.userAnswer.match(
                                                                                            /^[A-D]$/
                                                                                        )
                                                                                        ? question.userAnswer.charCodeAt(
                                                                                            0
                                                                                        ) -
                                                                                        65
                                                                                        : question.userAnswer;

                                                                                const isCorrectOption =
                                                                                    correctAnswerIndex ===
                                                                                    optionIndex;
                                                                                const isUserSelectedOption =
                                                                                    userAnswerIndex ===
                                                                                    optionIndex;

                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            optionIndex
                                                                                        }
                                                                                        className={`p-2 rounded border ${isCorrectOption
                                                                                            ? "border-green-500 bg-green-100"
                                                                                            : isUserSelectedOption
                                                                                                ? "border-red-500 bg-red-100"
                                                                                                : "border-gray-200"
                                                                                            }`}
                                                                                    >
                                                                                        <span className="font-medium">
                                                                                            {String.fromCharCode(
                                                                                                65 +
                                                                                                optionIndex
                                                                                            )}
                                                                                            .{" "}
                                                                                        </span>
                                                                                        {
                                                                                            option
                                                                                        }
                                                                                        {isCorrectOption && (
                                                                                            <span className="ml-2 text-green-600 font-medium">
                                                                                                (Đáp
                                                                                                án
                                                                                                đúng)
                                                                                            </span>
                                                                                        )}
                                                                                        {isUserSelectedOption &&
                                                                                            !isCorrectOption && (
                                                                                                <span className="ml-2 text-red-600 font-medium">
                                                                                                    (Bạn
                                                                                                    đã
                                                                                                    chọn)
                                                                                                </span>
                                                                                            )}
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        )}
                                                                    </div>
                                                                )}

                                                            {/* True/False/Not Given options */}
                                                            {question.type ===
                                                                "true-false-notgiven" && (
                                                                    <div className="space-y-2 mb-3">
                                                                        {[
                                                                            "TRUE",
                                                                            "FALSE",
                                                                            "NOT GIVEN",
                                                                        ].map(
                                                                            (
                                                                                option
                                                                            ) => {
                                                                                const displayOption =
                                                                                    option ===
                                                                                        "TRUE"
                                                                                        ? "True"
                                                                                        : option ===
                                                                                            "FALSE"
                                                                                            ? "False"
                                                                                            : "Not Given";

                                                                                // Normalize both answers to uppercase for comparison
                                                                                let normalizedCorrectAnswer =
                                                                                    "";
                                                                                if (
                                                                                    typeof question.correctAnswer ===
                                                                                    "string"
                                                                                ) {
                                                                                    normalizedCorrectAnswer =
                                                                                        question.correctAnswer.toUpperCase();
                                                                                } else if (
                                                                                    typeof question.correctAnswer ===
                                                                                    "number" &&
                                                                                    question.options
                                                                                ) {
                                                                                    normalizedCorrectAnswer =
                                                                                        question.options[
                                                                                            question
                                                                                                .correctAnswer
                                                                                        ]?.toUpperCase() ||
                                                                                        "";
                                                                                }

                                                                                let normalizedUserAnswer =
                                                                                    "";
                                                                                if (
                                                                                    typeof question.userAnswer ===
                                                                                    "string"
                                                                                ) {
                                                                                    normalizedUserAnswer =
                                                                                        question.userAnswer.toUpperCase();
                                                                                } else if (
                                                                                    typeof question.userAnswer ===
                                                                                    "number" &&
                                                                                    question.options
                                                                                ) {
                                                                                    normalizedUserAnswer =
                                                                                        question.options[
                                                                                            question
                                                                                                .userAnswer
                                                                                        ]?.toUpperCase() ||
                                                                                        "";
                                                                                }

                                                                                const isCorrectOption =
                                                                                    normalizedCorrectAnswer ===
                                                                                    option;
                                                                                const isUserSelectedOption =
                                                                                    normalizedUserAnswer ===
                                                                                    option;

                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            option
                                                                                        }
                                                                                        className={`p-2 rounded border ${isCorrectOption
                                                                                            ? "border-green-500 bg-green-100"
                                                                                            : isUserSelectedOption &&
                                                                                                !isCorrectOption
                                                                                                ? "border-red-500 bg-red-100"
                                                                                                : "border-gray-200"
                                                                                            }`}
                                                                                    >
                                                                                        {
                                                                                            displayOption
                                                                                        }
                                                                                        {isCorrectOption && (
                                                                                            <span className="ml-2 text-green-600 font-medium">
                                                                                                (Đáp
                                                                                                án
                                                                                                đúng)
                                                                                            </span>
                                                                                        )}
                                                                                        {isUserSelectedOption &&
                                                                                            !isCorrectOption && (
                                                                                                <span className="ml-2 text-red-600 font-medium">
                                                                                                    (Bạn
                                                                                                    đã
                                                                                                    chọn)
                                                                                                </span>
                                                                                            )}
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        )}
                                                                    </div>
                                                                )}

                                                            {/* Fill in the blank */}
                                                            {(question.type ===
                                                                "fill-blank" ||
                                                                question.type ===
                                                                "matching") && (
                                                                    <div className="space-y-2 mb-3">
                                                                        <div className="p-3 bg-gray-100 rounded">
                                                                            <div className="text-sm text-gray-600">
                                                                                Câu
                                                                                trả
                                                                                lời
                                                                                của
                                                                                bạn:
                                                                            </div>
                                                                            <div
                                                                                className={`font-medium ${question.isCorrect
                                                                                    ? "text-green-600"
                                                                                    : "text-red-600"
                                                                                    }`}
                                                                            >
                                                                                {question.userAnswer ||
                                                                                    "(Không trả lời)"}
                                                                            </div>
                                                                        </div>
                                                                        {question.correctAnswer && (
                                                                            <div className="p-3 bg-green-100 rounded">
                                                                                <div className="text-sm text-green-600">
                                                                                    Đáp
                                                                                    án
                                                                                    đúng:
                                                                                </div>
                                                                                <div className="font-medium text-green-700">
                                                                                    {
                                                                                        question.correctAnswer
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )
                                );
                            })()}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-4 justify-center mt-8">
                            <button
                                onClick={() => setShowDetailedResults(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                            >
                                Quay lại kết quả tổng quát
                            </button>
                            <button
                                onClick={handleBackToCenter}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                            >
                                Quay lại IELTS Center
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                            >
                                Làm lại bài thi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show results screen (check this AFTER detailed results)
    if (showResults) {
        const testResult = calculateIELTSScoring();
        const totalQuestions = examData.totalQuestions;
        const answeredQuestions = Object.keys(answers).length;

        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Hoàn thành bài thi
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            {examData.title}
                        </p>

                        {/* IELTS Band Score Display */}
                        {testResult.bandScore > 0 && (
                            <div className="mb-8">
                                <div
                                    className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl font-bold text-white mb-4 ${getBandScoreBackground(
                                        testResult.bandScore
                                    )}`}
                                >
                                    {testResult.bandScore}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    IELTS Band Score
                                </h2>
                                <p className="text-lg text-gray-600 mb-4">
                                    {testResult.description}
                                </p>

                                {/* Improvement suggestions */}
                                {testResult.bandScore < 7.0 && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                        <h3 className="font-semibold text-blue-900 mb-2">
                                            💡 Gợi ý cải thiện:
                                        </h3>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            {examData.type === "reading" && (
                                                <>
                                                    <li>
                                                        • Tăng cường từ vựng học
                                                        thuật qua việc đọc báo,
                                                        tạp chí tiếng Anh
                                                    </li>
                                                    <li>
                                                        • Luyện tập kỹ năng
                                                        skimming và scanning để
                                                        tìm thông tin nhanh hơn
                                                    </li>
                                                    <li>
                                                        • Làm quen với các dạng
                                                        câu hỏi True/False/Not
                                                        Given và Multiple Choice
                                                    </li>
                                                </>
                                            )}
                                            {examData.type === "listening" && (
                                                <>
                                                    <li>
                                                        • Nghe podcast, TED
                                                        talks tiếng Anh để quen
                                                        với nhiều giọng nói khác
                                                        nhau
                                                    </li>
                                                    <li>
                                                        • Luyện tập nghe và ghi
                                                        chú thông tin quan trọng
                                                    </li>
                                                    <li>
                                                        • Làm quen với các dạng
                                                        câu hỏi điền từ và chọn
                                                        đáp án đúng
                                                    </li>
                                                </>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-blue-50 rounded-xl p-6">
                                <div className="text-2xl font-bold text-blue-600">
                                    {answeredQuestions}/{totalQuestions}
                                </div>
                                <div className="text-blue-600">
                                    Câu đã trả lời
                                </div>
                            </div>
                            <div className="bg-green-50 rounded-xl p-6">
                                <div className="text-2xl font-bold text-green-600">
                                    {testResult.correctAnswers}/
                                    {testResult.totalQuestions}
                                </div>
                                <div className="text-green-600">
                                    Câu trả lời đúng
                                </div>
                            </div>
                            <div className="bg-yellow-50 rounded-xl p-6">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {testResult.percentage}%
                                </div>
                                <div className="text-yellow-600">
                                    Tỷ lệ chính xác
                                </div>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-6">
                                <div className="text-2xl font-bold text-purple-600">
                                    {formatTime(
                                        examData.duration * 60 - timeRemaining
                                    )}
                                </div>
                                <div className="text-purple-600">
                                    Thời gian đã dùng
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleBackToCenter}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                            >
                                Quay lại IELTS Center
                            </button>
                            <button
                                onClick={() => setShowDetailedResults(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <FileText className="h-5 w-5" />
                                Xem chi tiết kết quả
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                            >
                                Làm lại bài thi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Pre-test screen
    if (!testStarted) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8">


                        <div className="text-center mb-8">
                            <div
                                className={`w-20 h-20 rounded-full ${examData.type === "reading"
                                        ? "bg-indigo-100 text-indigo-600"
                                        : "bg-purple-100 text-purple-600"
                                    } flex items-center justify-center mx-auto mb-4`}
                            >
                                {examData.type === "reading" ? (
                                    <FileText className="h-10 w-10" />
                                ) : (
                                    <Headphones className="h-10 w-10" />
                                )}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {examData.title}
                            </h1>
                            <p className="text-gray-600">
                                {examData.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <Clock className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                                <div className="text-lg font-bold text-gray-900">
                                    {examData.duration} phút
                                </div>
                                <div className="text-sm text-gray-600">
                                    Thời gian
                                </div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <BookOpen className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                                <div className="text-lg font-bold text-gray-900">
                                    {getTotalSections()}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {examData.type === "reading"
                                        ? "Passages"
                                        : "Sections"}
                                </div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <CheckCircle className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                                <div className="text-lg font-bold text-gray-900">
                                    {examData.totalQuestions}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Câu hỏi
                                </div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <Star className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                                <div className="text-lg font-bold text-gray-900">
                                    {examData.difficulty}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Cấp độ
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 mb-8">
                            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                Hướng dẫn làm bài:
                            </h3>
                            <ul className="list-disc list-inside space-y-2 text-amber-800 ml-1">
                                <li>
                                    Đọc kỹ đề bài và câu hỏi trước khi trả lời
                                </li>
                                <li>Quản lý thời gian hợp lý cho từng phần</li>
                                <li>
                                    Có thể chuyển đổi giữa các câu hỏi trong
                                    cùng phần
                                </li>
                                <li>Kiểm tra lại đáp án trước khi nộp bài</li>
                                {examData.type === "listening" && (
                                    <li>
                                        Audio sẽ chỉ phát một lần, hãy tập trung
                                        nghe
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={handleStartTest}
                                className={`bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-md`}
                            >
                                Bắt đầu làm bài
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main test interface
    const questions = getCurrentQuestions();
    const currentQuestionData = questions[currentQuestion];

    if (!currentQuestionData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Không có câu hỏi
                    </h2>
                    <button
                        onClick={handleBackToCenter}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Quay lại IELTS Center
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={handleBackToCenter}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Thoát
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    {examData.title}
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {getCurrentSectionTitle()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Timer className="h-5 w-5" />
                                <span className="font-mono text-lg">
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                            <button
                                onClick={handleSubmitTest}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Nộp bài
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel - Passage/Audio */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        {examData.type === "reading" ? (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    {getCurrentSectionTitle()}
                                </h2>
                                <div className="prose max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                        {getCurrentPassageContent()}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    {getCurrentSectionTitle()}
                                </h2>
                                {getCurrentAudioUrl() && (
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <audio
                                            controls
                                            src={getCurrentAudioUrl()}
                                            className="w-full mb-4"
                                            onPlay={() => setIsPlaying(true)}
                                            onPause={() => setIsPlaying(false)}
                                        />
                                        <div className="flex items-center justify-between text-sm text-gray-600">
                                            <span>
                                                Audio for{" "}
                                                {getCurrentSectionTitle()}
                                            </span>
                                            <span>
                                                {isPlaying
                                                    ? "Playing..."
                                                    : "Paused"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Questions */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                Câu {currentQuestion + 1} / {questions.length}
                            </h3>
                            <div className="text-sm text-gray-600">
                                Phần {currentSection + 1} / {getTotalSections()}
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-800 mb-4">
                                {currentQuestionData.question}
                            </p>

                            {/* Multiple Choice */}
                            {currentQuestionData.type === "multiple-choice" &&
                                currentQuestionData.options && (
                                    <div className="space-y-3">
                                        {currentQuestionData.options.map(
                                            (option, index) => (
                                                <label
                                                    key={index}
                                                    className="flex items-center gap-3 cursor-pointer"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={
                                                            currentQuestionData.id
                                                        }
                                                        value={index}
                                                        checked={
                                                            answers[
                                                            currentQuestionData
                                                                .id
                                                            ] === index
                                                        }
                                                        onChange={() =>
                                                            handleAnswer(
                                                                currentQuestionData.id,
                                                                index
                                                            )
                                                        }
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-gray-700">
                                                        {option}
                                                    </span>
                                                </label>
                                            )
                                        )}
                                    </div>
                                )}

                            {/* Fill in the blank */}
                            {currentQuestionData.type === "fill-blank" && (
                                <input
                                    type="text"
                                    value={
                                        answers[currentQuestionData.id] || ""
                                    }
                                    onChange={(e) =>
                                        handleAnswer(
                                            currentQuestionData.id,
                                            e.target.value
                                        )
                                    }
                                    placeholder="Nhập câu trả lời..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                />
                            )}

                            {/* True/False/Not Given */}
                            {currentQuestionData.type ===
                                "true-false-notgiven" && (
                                    <div className="space-y-3">
                                        {["TRUE", "FALSE", "NOT GIVEN"].map(
                                            (option, index) => {
                                                const displayOption =
                                                    option === "TRUE"
                                                        ? "True"
                                                        : option === "FALSE"
                                                            ? "False"
                                                            : "Not Given";
                                                return (
                                                    <label
                                                        key={index}
                                                        className="flex items-center gap-3 cursor-pointer"
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={
                                                                currentQuestionData.id
                                                            }
                                                            value={option}
                                                            checked={
                                                                answers[
                                                                currentQuestionData
                                                                    .id
                                                                ] === option
                                                            }
                                                            onChange={() =>
                                                                handleAnswer(
                                                                    currentQuestionData.id,
                                                                    option
                                                                )
                                                            }
                                                            className="text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-gray-700">
                                                            {displayOption}
                                                        </span>
                                                    </label>
                                                );
                                            }
                                        )}
                                    </div>
                                )}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-6 border-t">
                            <button
                                onClick={prevQuestion}
                                disabled={
                                    currentSection === 0 &&
                                    currentQuestion === 0
                                }
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                                Câu trước
                            </button>

                            <div className="text-sm text-gray-600">
                                Đã trả lời: {Object.keys(answers).length}/
                                {examData.totalQuestions}
                            </div>

                            <button
                                onClick={nextQuestion}
                                disabled={
                                    currentSection === getTotalSections() - 1 &&
                                    currentQuestion === questions.length - 1
                                }
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Câu sau
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IELTSTest;
