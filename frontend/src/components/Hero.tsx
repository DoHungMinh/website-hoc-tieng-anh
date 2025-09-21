import React from "react";
import { Award, Users, BookOpen } from "lucide-react";

interface HeroProps {
    onNavigate?: (page: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
    return (
        <section
            id="home"
            className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-lime-600"
        >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute w-32 h-32 bg-white rounded-full top-20 left-10 blur-3xl"></div>
                <div className="absolute w-48 h-48 rounded-full bottom-20 right-10 bg-lime-300 blur-3xl"></div>
                <div className="absolute w-64 h-64 transform -translate-x-1/2 -translate-y-1/2 bg-green-300 rounded-full top-1/2 left-1/2 blur-3xl"></div>
            </div>

            <div className="relative px-4 pt-20 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl">
                        Học Tiếng Anh
                        <span className="block text-lime-300">Hiệu Quả</span>
                    </h1>
                    <p className="max-w-3xl mx-auto mb-8 text-xl leading-relaxed text-green-100 md:text-2xl">
                        Nền tảng học tiếng Anh trực tuyến hàng đầu với AI
                        chatbot thông minh, giúp bạn chinh phục mọi kỳ thi tiếng
                        Anh.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 mb-16 sm:flex-row">
                        <button
                            onClick={() => onNavigate?.("courses")}
                            className="px-8 py-4 text-lg font-bold text-green-900 transition-all duration-300 transform shadow-lg bg-lime-500 hover:bg-lime-400 rounded-xl hover:scale-105"
                        >
                            Bắt đầu học ngay
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid max-w-4xl grid-cols-1 gap-8 mx-auto md:grid-cols-3">
                        <div className="p-6 border bg-white/10 backdrop-blur-md rounded-2xl border-white/20">
                            <div className="flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-lime-300" />
                            </div>
                            <div className="mb-2 text-3xl font-bold text-white">
                                50,000+
                            </div>
                            <div className="text-green-100">
                                Học viên tin tưởng
                            </div>
                        </div>

                        <div className="p-6 border bg-white/10 backdrop-blur-md rounded-2xl border-white/20">
                            <div className="flex items-center justify-center mb-4">
                                <BookOpen className="w-8 h-8 text-lime-300" />
                            </div>
                            <div className="mb-2 text-3xl font-bold text-white">
                                1,000+
                            </div>
                            <div className="text-green-100">
                                Bài học tương tác
                            </div>
                        </div>

                        <div className="p-6 border bg-white/10 backdrop-blur-md rounded-2xl border-white/20">
                            <div className="flex items-center justify-center mb-4">
                                <Award className="w-8 h-8 text-lime-300" />
                            </div>
                            <div className="mb-2 text-3xl font-bold text-white">
                                95%
                            </div>
                            <div className="text-green-100">
                                Tỷ lệ đỗ kỳ thi
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
