import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    BookOpen,
    FileText,
    Volume2,
    Clock,
    Users,
    X,
    RefreshCw,
} from "lucide-react";
import CreateIELTSExam from "./CreateIELTSExam";
import EditIELTSExam from "./EditIELTSExam";
import AIIELTSReadingCreator from "./AIIELTSReadingCreator";
import { AIGeneratedIELTSReading } from "@/services/aiIELTSService";

interface Exam {
    _id: string;
    title: string;
    type: "reading" | "listening";
    difficulty: string;
    duration: number;
    totalQuestions: number;
    status: "draft" | "published";
    createdAt: string;
    updatedAt: string;
    passages?: unknown[];
    sections?: unknown[];
    description?: string;
}

const ExamManagement = () => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterLevel, setFilterLevel] = useState("all");
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Replace mock data with API calls
    const [exams, setExams] = useState<Exam[]>([]);
    const [stats, setStats] = useState({
        totalExams: 0,
        readingExams: 0,
        listeningExams: 0,
        publishedExams: 0,
    });

    // Fetch exams from API
    const fetchExams = async (showLoadingState = true) => {
        try {
            if (showLoadingState) {
                setLoading(true);
            }
            setError(null);

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại."
                );
            }

            console.log("Fetching exams...");
            const response = await fetch("/api/ielts?status=all", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Response status:", response.status);

            if (response.status === 401) {
                localStorage.removeItem("token");
                throw new Error(
                    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                );
            }

            if (response.status === 403) {
                throw new Error("Bạn không có quyền truy cập chức năng này.");
            }

            if (!response.ok) {
                throw new Error(`Lỗi server: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched exams data:", data);

            if (data.success && Array.isArray(data.data)) {
                setExams(data.data);
                setRetryCount(0);
            } else {
                console.warn("Unexpected data format:", data);
                setExams([]);
            }
        } catch (error) {
            console.error("Error fetching exams:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Lỗi không xác định khi tải danh sách đề thi"
            );

            // Retry logic - KHÔNG retry khi gặp lỗi 429 (Too Many Requests)
            const is429Error = error instanceof Error && error.message.includes('429');
            if (retryCount < 2 && !is429Error) {
                setTimeout(() => {
                    setRetryCount((prev) => prev + 1);
                    fetchExams(false);
                }, 1000 * (retryCount + 1));
            } else if (is429Error) {
                console.warn('⚠️ Rate limit exceeded. Please wait before retrying.');
            }
        } finally {
            if (showLoadingState) {
                setLoading(false);
            }
        }
    };

    // Fetch exam statistics
    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Không tìm thấy token đăng nhập");
            }

            console.log("Fetching stats...");
            const response = await fetch("/api/ielts/admin/stats", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Stats response status:", response.status);

            if (response.status === 401) {
                localStorage.removeItem("token");
                throw new Error("Phiên đăng nhập đã hết hạn");
            }

            if (response.status === 403) {
                throw new Error("Không có quyền truy cập thống kê");
            }

            if (!response.ok) {
                throw new Error(`Lỗi server: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched stats data:", data);

            if (data.success && data.data) {
                setStats({
                    totalExams: data.data.total || 0,
                    readingExams: data.data.reading || 0,
                    listeningExams: data.data.listening || 0,
                    publishedExams: data.data.published || 0,
                });
            } else {
                console.warn("Unexpected stats data format:", data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            // Don't show error for stats, just log it
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
        fetchStats();
    }, []);

    // Refresh data manually
    const handleRefresh = async () => {
        await Promise.all([fetchExams(true), fetchStats()]);
    };

    // Handle edit exam
    const handleEditExam = (exam: Exam) => {
        setEditingExam(exam);
        setShowEditForm(true);
    };

    // Handle delete exam with confirmation
    const handleDeleteExam = async (examId: string) => {
        if (
            !confirm(
                "Bạn có chắc chắn muốn xóa đề thi này không? Hành động này không thể hoàn tác."
            )
        ) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Vui lòng đăng nhập lại");
                return;
            }

            const response = await fetch(`/api/ielts/${examId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                await handleRefresh();
                alert("Xóa đề thi thành công!");
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Không thể xóa đề thi");
            }
        } catch (error) {
            console.error("Error deleting exam:", error);
            alert(
                error instanceof Error ? error.message : "Lỗi khi xóa đề thi"
            );
        }
    };

    const handleToggleStatus = async (
        examId: string,
        currentStatus: string
    ) => {
        if (!examId) {
            console.error("ExamId is undefined");
            return;
        }

        const newStatus = currentStatus === "published" ? "draft" : "published";

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Vui lòng đăng nhập lại");
                return;
            }

            const response = await fetch(`/api/ielts/${examId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                await handleRefresh();
                const statusText =
                    newStatus === "published" ? "xuất bản" : "ẩn";
                alert(`Đã ${statusText} đề thi thành công!`);
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || "Không thể thay đổi trạng thái"
                );
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Lỗi khi cập nhật trạng thái"
            );
        }
    };

    // Handle AI-generated reading exam
    const handleAIReadingExamGenerated = async (
        examData: AIGeneratedIELTSReading
    ) => {
        try {
            console.log("AI Reading exam generated:", examData);

            // Display success message with exam details
            const message = `Đề thi "${examData.title}" đã được tạo thành công!
      
📋 Chi tiết:
• ${examData.passages.length} passages
• ${examData.total_questions} câu hỏi
• Thời gian: ${examData.duration} phút
• Target Band: ${examData.target_band}`;

            alert(message);

            // Refresh the exams list to show the new exam
            await handleRefresh();
        } catch (error) {
            console.error("Error handling AI reading exam:", error);
            alert("Có lỗi xảy ra khi xử lý đề thi Reading");
        }
    };

    const filteredExams = exams.filter((exam) => {
        const matchesSearch = exam.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesType = filterType === "all" || exam.type === filterType;
        const matchesLevel =
            filterLevel === "all" || exam.difficulty.includes(filterLevel);
        return matchesSearch && matchesType && matchesLevel;
    });

    if (showCreateForm) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-800"
                        >
                            <X className="w-5 h-5" />
                            Quay lại
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Tạo đề thi mới
                        </h1>
                    </div>
                </div>
                <CreateIELTSExam />
                <div className="mt-6">
                    <button
                        onClick={async () => {
                            setShowCreateForm(false);
                            await handleRefresh();
                        }}
                        className="px-4 py-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (showEditForm && editingExam) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setShowEditForm(false);
                                setEditingExam(null);
                            }}
                            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-800"
                        >
                            <X className="w-5 h-5" />
                            Quay lại
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Chỉnh sửa đề thi
                        </h1>
                    </div>
                </div>
                <EditIELTSExam
                    examData={editingExam}
                    onSave={async (updatedData) => {
                        console.log("Exam updated:", updatedData);
                        setShowEditForm(false);
                        setEditingExam(null);
                        await handleRefresh();
                    }}
                    onCancel={() => {
                        setShowEditForm(false);
                        setEditingExam(null);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Quản lý đề thi
                    </h1>
                    <p className="text-gray-600">
                        Tạo và quản lý các đề thi IELTS Reading và Listening
                    </p>
                    {error && (
                        <div className="p-3 mt-2 bg-red-100 border border-red-300 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                            <button
                                onClick={() => {
                                    setError(null);
                                    handleRefresh();
                                }}
                                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={handleRefresh}
                        disabled={loading || statsLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-5 w-5 ${
                                loading || statsLoading ? "animate-spin" : ""
                            }`}
                        />
                        Làm mới
                    </button>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5" />
                        Tạo đề thi thủ công
                    </button>
                    <div className="flex-shrink-0">
                        <AIIELTSReadingCreator
                            onExamGenerated={handleAIReadingExamGenerated}
                        />
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Tổng đề thi
                            </p>
                            {statsLoading ? (
                                <div className="h-8 mt-1 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.totalExams}
                                </p>
                            )}
                        </div>
                        <div className="p-3 bg-green-100 rounded-xl">
                            <FileText className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Reading Tests
                            </p>
                            {statsLoading ? (
                                <div className="h-8 mt-1 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.readingExams}
                                </p>
                            )}
                        </div>
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Listening Tests
                            </p>
                            {statsLoading ? (
                                <div className="h-8 mt-1 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.listeningExams}
                                </p>
                            )}
                        </div>
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Volume2 className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Đã xuất bản
                            </p>
                            {statsLoading ? (
                                <div className="h-8 mt-1 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.publishedExams}
                                </p>
                            )}
                        </div>
                        <div className="p-3 bg-green-100 rounded-xl">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="relative">
                        <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm đề thi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="all">Tất cả loại</option>
                        <option value="reading">Reading</option>
                        <option value="listening">Listening</option>
                    </select>
                    <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="all">Tất cả cấp độ</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Band 4.0-5.0">Band 4.0-5.0</option>
                        <option value="Band 5.0-6.0">Band 5.0-6.0</option>
                        <option value="Band 6.0-7.0">Band 6.0-7.0</option>
                        <option value="Band 7.0-8.0">Band 7.0-8.0</option>
                        <option value="Band 8.0-9.0">Band 8.0-9.0</option>
                    </select>
                </div>
            </div>

            {/* Exams Table */}
            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Đề thi
                                </th>
                                <th className="hidden px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:table-cell">
                                    Loại
                                </th>
                                <th className="hidden px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase lg:table-cell">
                                    Cấp độ
                                </th>
                                <th className="hidden px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase lg:table-cell">
                                    Thời gian
                                </th>
                                <th className="hidden px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:table-cell">
                                    Câu hỏi
                                </th>
                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Trạng thái
                                </th>
                                <th className="hidden px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase lg:table-cell">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-4 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading
                                ? // Skeleton loading rows
                                  Array.from({ length: 5 }).map((_, index) => (
                                      <tr key={index} className="animate-pulse">
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <div className="flex items-center">
                                                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                                  <div className="ml-4">
                                                      <div className="w-32 h-4 mb-2 bg-gray-200 rounded"></div>
                                                      <div className="w-24 h-3 bg-gray-200 rounded"></div>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="hidden px-6 py-4 whitespace-nowrap md:table-cell">
                                              <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                                          </td>
                                          <td className="hidden px-6 py-4 whitespace-nowrap lg:table-cell">
                                              <div className="w-20 h-4 bg-gray-200 rounded"></div>
                                          </td>
                                          <td className="hidden px-6 py-4 whitespace-nowrap lg:table-cell">
                                              <div className="w-16 h-4 bg-gray-200 rounded"></div>
                                          </td>
                                          <td className="hidden px-6 py-4 whitespace-nowrap md:table-cell">
                                              <div className="w-8 h-4 bg-gray-200 rounded"></div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                                          </td>
                                          <td className="hidden px-6 py-4 whitespace-nowrap lg:table-cell">
                                              <div className="w-24 h-4 bg-gray-200 rounded"></div>
                                          </td>
                                          <td className="px-6 py-4 text-right whitespace-nowrap">
                                              <div className="flex items-center justify-end gap-2">
                                                  <div className="w-16 h-8 bg-gray-200 rounded"></div>
                                                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                                                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                                              </div>
                                          </td>
                                      </tr>
                                  ))
                                : filteredExams.map((exam) => (
                                      <tr
                                          key={exam._id}
                                          className="transition-colors hover:bg-gray-50"
                                      >
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <div className="flex items-center">
                                                  <div
                                                      className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${
                                                          exam.type ===
                                                          "reading"
                                                              ? "bg-blue-100 text-blue-600"
                                                              : "bg-purple-100 text-purple-600"
                                                      }`}
                                                  >
                                                      {exam.type ===
                                                      "reading" ? (
                                                          <BookOpen className="w-5 h-5" />
                                                      ) : (
                                                          <Volume2 className="w-5 h-5" />
                                                      )}
                                                  </div>
                                                  <div className="ml-4">
                                                      <div className="text-sm font-medium text-gray-900">
                                                          {exam.title}
                                                      </div>
                                                      <div className="text-xs text-gray-500 md:hidden">
                                                          {exam.type ===
                                                          "reading"
                                                              ? "Reading"
                                                              : "Listening"}{" "}
                                                          •{" "}
                                                          {exam.totalQuestions}{" "}
                                                          câu
                                                      </div>
                                                      <div className="text-xs text-gray-500 lg:hidden">
                                                          ID:{" "}
                                                          {exam._id.slice(-8)}
                                                      </div>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="hidden px-6 py-4 whitespace-nowrap md:table-cell">
                                              <span
                                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                      exam.type === "reading"
                                                          ? "bg-blue-100 text-blue-800"
                                                          : "bg-purple-100 text-purple-800"
                                                  }`}
                                              >
                                                  {exam.type === "reading"
                                                      ? "Reading"
                                                      : "Listening"}
                                              </span>
                                          </td>
                                          <td className="hidden px-6 py-4 text-sm text-gray-900 whitespace-nowrap lg:table-cell">
                                              {exam.difficulty}
                                          </td>
                                          <td className="hidden px-6 py-4 text-sm text-gray-900 whitespace-nowrap lg:table-cell">
                                              <div className="flex items-center gap-1">
                                                  <Clock className="w-4 h-4 text-gray-400" />
                                                  {exam.duration} phút
                                              </div>
                                          </td>
                                          <td className="hidden px-6 py-4 text-sm text-gray-900 whitespace-nowrap md:table-cell">
                                              {exam.totalQuestions}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <span
                                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                      exam.status ===
                                                      "published"
                                                          ? "bg-green-100 text-green-800"
                                                          : "bg-yellow-100 text-yellow-800"
                                                  }`}
                                              >
                                                  {exam.status === "published"
                                                      ? "Đã xuất bản"
                                                      : "Bản nháp"}
                                              </span>
                                          </td>
                                          <td className="hidden px-6 py-4 text-sm text-gray-500 whitespace-nowrap lg:table-cell">
                                              {new Date(
                                                  exam.createdAt
                                              ).toLocaleDateString("vi-VN")}
                                          </td>
                                          <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                              <div className="flex items-center justify-end gap-2">
                                                  <button
                                                      onClick={() =>
                                                          handleToggleStatus(
                                                              exam._id,
                                                              exam.status
                                                          )
                                                      }
                                                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                                          exam.status ===
                                                          "published"
                                                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                                              : "bg-green-100 text-green-800 hover:bg-green-200"
                                                      } transition-colors`}
                                                      title={
                                                          exam.status ===
                                                          "published"
                                                              ? "Ẩn đề thi"
                                                              : "Xuất bản đề thi"
                                                      }
                                                  >
                                                      {exam.status ===
                                                      "published"
                                                          ? "Ẩn"
                                                          : "Xuất bản"}
                                                  </button>
                                                  <button
                                                      onClick={() =>
                                                          handleEditExam(exam)
                                                      }
                                                      className="p-2 text-green-600 transition-colors rounded-lg hover:text-green-700 hover:bg-green-50"
                                                      title="Chỉnh sửa"
                                                  >
                                                      <Edit className="w-4 h-4" />
                                                  </button>
                                                  <button
                                                      onClick={() =>
                                                          handleDeleteExam(
                                                              exam._id
                                                          )
                                                      }
                                                      className="p-2 text-red-600 transition-colors rounded-lg hover:text-red-700 hover:bg-red-50"
                                                      title="Xóa"
                                                  >
                                                      <Trash2 className="w-4 h-4" />
                                                  </button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                        </tbody>
                    </table>
                </div>

                {filteredExams.length === 0 && !loading && (
                    <div className="py-12 text-center">
                        <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                            <FileText className="w-full h-full" />
                        </div>
                        <h3 className="mb-2 text-lg font-medium text-gray-900">
                            Không có đề thi nào
                        </h3>
                        <p className="mb-6 text-gray-500">
                            {searchTerm ||
                            filterType !== "all" ||
                            filterLevel !== "all"
                                ? "Không tìm thấy đề thi phù hợp với bộ lọc."
                                : "Chưa có đề thi nào được tạo."}
                        </p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            Tạo đề thi đầu tiên
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamManagement;
