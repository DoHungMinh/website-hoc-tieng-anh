import { useState, useEffect } from "react";
import {
    BookOpen,
    Headphones,
    GraduationCap,
    Clock,
    Target,
    Star,
    ChevronRight,
    Play,
    Trophy,
    TrendingUp,
} from "lucide-react";
import IELTSPractice from "./IELTSPractice";
import IELTSTest from "./IELTSTest";
import IELTSExamCard from "./IELTSExamCard";
import IELTSTestHistory from "./IELTSTestHistory";
import { useCachedFetch } from "@/utils/apiCache";
import { API_BASE_URL } from "@/utils/constants";
import SearchFilterBar from "../common/SearchFilterBar";
import SearchFilterBar from "../common/SearchFilterBar";

interface IELTSExam {
    _id: string;
    title: string;
    type: "reading" | "listening";
    difficulty: string;
    duration: number;
    totalQuestions: number;
    description: string;
}

type ViewType = "home" | "practice" | "test";

const IELTSCenter = () => {
    const [currentView, setCurrentView] = useState<ViewType>("home");
    const [exams, setExams] = useState<IELTSExam[]>([]);
    const [loading, setLoading] = useState(true);
    const { fetchWithCache } = useCachedFetch();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    // Filter options for SearchFilterBar
    const filterOptions = [
        { id: 'reading', label: 'Reading', value: 'reading', category: 'Loại bài thi' },
        { id: 'listening', label: 'Listening', value: 'listening', category: 'Loại bài thi' },
        { id: 'easy', label: 'Easy', value: 'Easy', category: 'Độ khó' },
        { id: 'medium', label: 'Medium', value: 'Medium', category: 'Độ khó' },
        { id: 'hard', label: 'Hard', value: 'Hard', category: 'Độ khó' },
        { id: 'intermediate', label: 'Intermediate', value: 'Intermediate', category: 'Cấp độ' },
        { id: 'advanced', label: 'Advanced', value: 'Advanced', category: 'Cấp độ' },
    ];

    const handleFilterToggle = (filterId: string) => {
        setActiveFilters((prev) =>
            prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [...prev, filterId]
        );
    };

    // Filter and search logic
    const filteredExams = exams.filter((exam) => {
        // Search filter
        const matchesSearch = searchQuery.trim() === '' ||
            exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exam.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exam.difficulty?.toLowerCase().includes(searchQuery.toLowerCase());

        // Active filters
        if (activeFilters.length === 0) return matchesSearch;

        const typeFilters = activeFilters.filter(id => ['reading', 'listening'].includes(id));
        const difficultyFilters = activeFilters.filter(id => ['easy', 'medium', 'hard'].includes(id));
        const levelFilters = activeFilters.filter(id => ['intermediate', 'advanced'].includes(id));

        let matchesTypeFilter = typeFilters.length === 0 || typeFilters.includes(exam.type);
        let matchesDifficultyFilter = difficultyFilters.length === 0 || 
            difficultyFilters.some(filter => exam.difficulty?.toLowerCase().includes(filter));
        let matchesLevelFilter = levelFilters.length === 0 ||
            levelFilters.some(filter => exam.difficulty?.toLowerCase().includes(filter));

        return matchesSearch && matchesTypeFilter && matchesDifficultyFilter && matchesLevelFilter;
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    // Filter options for SearchFilterBar
    const filterOptions = [
        { id: 'reading', label: 'Reading', value: 'reading', category: 'Loại bài thi' },
        { id: 'listening', label: 'Listening', value: 'listening', category: 'Loại bài thi' },
        { id: 'easy', label: 'Easy', value: 'Easy', category: 'Độ khó' },
        { id: 'medium', label: 'Medium', value: 'Medium', category: 'Độ khó' },
        { id: 'hard', label: 'Hard', value: 'Hard', category: 'Độ khó' },
        { id: 'intermediate', label: 'Intermediate', value: 'Intermediate', category: 'Cấp độ' },
        { id: 'advanced', label: 'Advanced', value: 'Advanced', category: 'Cấp độ' },
    ];

    const handleFilterToggle = (filterId: string) => {
        setActiveFilters((prev) =>
            prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [...prev, filterId]
        );
    };

    // Fetch published IELTS exams - chỉ gọi 1 lần khi component mount
    useEffect(() => {
        const fetchExams = async () => {
            try {
                setLoading(true);
                console.log("Fetching IELTS exams...");

                // Sử dụng cache với TTL 10 phút cho IELTS exams
                const data = await fetchWithCache(
                    `${API_BASE_URL}/ielts?limit=6&status=published`,
                    undefined,
                    "ielts-exams-home",
                    10 * 60 * 1000 // 10 phút
                );

                console.log("Fetched exams data:", data);
                console.log("Exams array:", data.data);
                console.log("Number of exams:", data.data?.length);

                if (data.success && Array.isArray(data.data)) {
                    setExams(data.data);
                } else {
                    console.log("No exams found or invalid data structure");
                    setExams([]);
                }
            } catch (error) {
                console.error("Error fetching exams:", error);
                setExams([]);
            } finally {
                setLoading(false);
            }
        };

        // Chỉ fetch khi chưa có data hoặc khi component mount lần đầu
        if (exams.length === 0) {
            fetchExams();
        }
    }, []); // Empty dependency array - chỉ chạy 1 lần khi mount

    const handleStartExam = (examId: string, type: "reading" | "listening") => {
        // Navigate to specific exam
        setCurrentView("test");
        // Store exam info for the test component
        sessionStorage.setItem("currentExam", JSON.stringify({ examId, type }));
    };

    const stats = [
        {
            icon: GraduationCap,
            value: "50,000+",
            label: "Học viên đã học",
            color: "from-green-500 to-emerald-500",
        },
        {
            icon: Trophy,
            value: "8.5+",
            label: "Điểm trung bình",
            color: "from-lime-500 to-green-500",
        },
        {
            icon: Target,
            value: "95%",
            label: "Tỷ lệ đạt mục tiêu",
            color: "from-emerald-500 to-teal-500",
        },
        {
            icon: TrendingUp,
            value: "2.1x",
            label: "Cải thiện band điểm",
            color: "from-teal-500 to-cyan-500",
        },
    ];

    const features = [
        {
            icon: BookOpen,
            title: "Reading Practice",
            description:
                "Luyện tập kỹ năng đọc hiểu với các bài Academic và General Training",
            features: [
                "40+ bộ đề thực tế",
                "Phân tích chi tiết đáp án",
                "Tracking tiến độ",
            ],
            time: "60 phút/bài",
            difficulty: "Band 4.0-9.0",
            color: "from-blue-500 to-indigo-500",
        },
        {
            icon: Headphones,
            title: "Listening Practice",
            description:
                "Nâng cao khả năng nghe hiểu với audio chất lượng cao và đa dạng chủ đề",
            features: [
                "4 phần chuẩn IELTS",
                "Tốc độ điều chỉnh được",
                "Transcript đầy đủ",
            ],
            time: "40 phút/bài",
            difficulty: "Band 4.0-9.0",
            color: "from-green-500 to-emerald-500",
        },
    ];

    const testimonials = [
        {
            name: "Nguyễn Minh Anh",
            score: "Band 8.0",
            image: "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150",
            text: "Nhờ luyện tập đều đặn trên nền tảng này, mình đã cải thiện từ 6.5 lên 8.0 chỉ trong 3 tháng!",
        },
        {
            name: "Trần Văn Nam",
            score: "Band 7.5",
            image: "https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150",
            text: "Phần Speaking với AI rất thú vị và hiệu quả. Feedback chi tiết giúp mình biết chính xác điểm yếu.",
        },
        {
            name: "Lê Thị Hoa",
            score: "Band 8.5",
            image: "https://images.pexels.com/photos/3769020/pexels-photo-3769020.jpeg?auto=compress&cs=tinysrgb&w=150",
            text: "Bộ đề Reading và Listening rất đa dạng, giúp mình làm quen với mọi dạng bài trong kỳ thi thực tế.",
        },
    ];

    if (currentView === "practice") {
        return <IELTSPractice />;
    }

    if (currentView === "test") {
        return <IELTSTest onBackToCenter={() => setCurrentView("home")} />;
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50">
            {/* Hero Section */}
            <div className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-lime-600/10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-green-800 to-lime-600 bg-clip-text text-transparent mb-6">
                            IELTS Center
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8">
                            Nền tảng luyện thi IELTS Reading & Listening với AI,
                            giúp bạn đạt band điểm mục tiêu một cách hiệu quả
                            nhất
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <button
                                onClick={() => setCurrentView("practice")}
                                className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3"
                            >
                                <Play className="h-6 w-6" />
                                Bắt đầu luyện tập
                            </button>
                            <button
                                onClick={() => setCurrentView("test")}
                                className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-green-600 hover:border-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3"
                            >
                                <Target className="h-6 w-6" />
                                Làm bài test
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                                >
                                    <div
                                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4 mx-auto`}
                                    >
                                        <stat.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                        {stat.value}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-800 to-lime-600 bg-clip-text text-transparent mb-6">
                            Tính năng nổi bật
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Trải nghiệm học tập toàn diện với công nghệ AI tiên
                            tiến và phương pháp giảng dạy hiệu quả
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
                            >
                                <div
                                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <feature.icon className="h-8 w-8 text-white" />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-700 transition-colors">
                                    {feature.title}
                                </h3>

                                <p className="text-gray-600 mb-6">
                                    {feature.description}
                                </p>

                                <div className="space-y-3 mb-6">
                                    {feature.features.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-gray-700">
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {feature.time}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        {feature.difficulty}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setCurrentView("practice")}
                                    className="w-full bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg"
                                >
                                    Bắt đầu luyện tập
                                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Available IELTS Exams Section */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-800 to-lime-600 bg-clip-text text-transparent mb-6">
                            Đề Thi IELTS Mới Nhất
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Thực hành với các đề thi IELTS chính thức, được cập
                            nhật liên tục để phù hợp với format thi mới nhất
                        </p>
                    </div>

                    {/* Search and Filter Bar */}
                    <SearchFilterBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        activeFilters={activeFilters}
                        onFilterToggle={handleFilterToggle}
                        filterOptions={filterOptions}
                        placeholder="Tìm kiếm theo loại bài thi, độ khó, cấp độ..."
                        colorTheme="green"
                    />

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            {/* Left side - Available Exams */}
                            <div className="xl:col-span-2">
                                {filteredExams.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {filteredExams.map((exam) => (
                                            <IELTSExamCard
                                                key={exam._id}
                                                exam={exam}
                                                onStartExam={handleStartExam}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                                            <BookOpen className="h-full w-full" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {searchQuery || activeFilters.length > 0
                                                ? 'Không tìm thấy đề thi phù hợp'
                                                : 'Chưa có đề thi nào'}
                                        </h3>
                                        <p className="text-gray-500">
                                            {searchQuery || activeFilters.length > 0
                                                ? 'Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc'
                                                : 'Các đề thi IELTS sẽ được cập nhật sớm nhất có thể.'}
                                        </p>
                                    </div>
                                )}

                                {filteredExams.length > 0 && (
                                    <div className="text-center mt-8">
                                        <button
                                            onClick={() =>
                                                setCurrentView("practice")
                                            }
                                            className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
                                        >
                                            Xem tất cả đề thi
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Right side - Test History */}
                            <div className="xl:col-span-1">
                                <IELTSTestHistory />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="py-20 bg-gradient-to-r from-green-50 to-lime-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-800 to-lime-600 bg-clip-text text-transparent mb-6">
                            Học viên nói gì
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Hàng nghìn học viên đã đạt được mục tiêu band điểm
                            của mình
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-900">
                                            {testimonial.name}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 text-yellow-500" />
                                            <span className="text-green-600 font-bold">
                                                {testimonial.score}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-gray-600 italic">
                                    "{testimonial.text}"
                                </p>

                                <div className="flex text-yellow-500 mt-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className="h-4 w-4 fill-current"
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-gradient-to-r from-green-600 to-lime-600 rounded-3xl p-12 text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Sẵn sàng đạt band điểm mục tiêu?
                        </h2>
                        <p className="text-xl mb-8 opacity-90">
                            Bắt đầu hành trình chinh phục IELTS với phương pháp
                            học tập thông minh và hiệu quả
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => setCurrentView("practice")}
                                className="bg-white hover:bg-gray-100 text-green-600 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Luyện tập miễn phí
                            </button>
                            <button
                                onClick={() => setCurrentView("test")}
                                className="bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Thi thử ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default IELTSCenter;
