import { SkillTab, SkillCourse, SkillType } from '../types/skill';

export const skillTabs: SkillTab[] = [
    { id: 'vocabulary', label: 'Từ vựng', icon: '📚', count: 8 },
    { id: 'grammar', label: 'Ngữ pháp', icon: '📝', count: 6 },
    { id: 'listening', label: 'Nghe', icon: '🎧', count: 5 },
    { id: 'speaking', label: 'Nói', icon: '🗣️', count: 4 },
    { id: 'reading', label: 'Đọc', icon: '📖', count: 7 },
    { id: 'writing', label: 'Viết', icon: '✍️', count: 5 },
];

// Generate mock courses for each skill
const generateCourses = (skill: SkillType, level: string): SkillCourse[] => {
    const courseTemplates: Record<SkillType, { titles: string[]; descriptions: string[] }> = {
        vocabulary: {
            titles: [
                'Từ vựng theo chủ đề',
                'Từ vựng giao tiếp hàng ngày',
                'Từ vựng học thuật',
                'Phrasal Verbs cơ bản',
                'Idioms thông dụng',
                'Collocations phổ biến',
                'Word Formation',
                'Synonym & Antonym',
            ],
            descriptions: [
                'Học từ vựng theo các chủ đề thiết yếu trong cuộc sống',
                'Nắm vững từ vựng cần thiết cho giao tiếp hàng ngày',
            ],
        },
        grammar: {
            titles: [
                'Thì cơ bản trong tiếng Anh',
                'Câu điều kiện',
                'Mệnh đề quan hệ',
                'Câu bị động',
                'Reported Speech',
                'Modal Verbs',
            ],
            descriptions: [
                'Hiểu và sử dụng thành thạo các cấu trúc ngữ pháp',
                'Áp dụng ngữ pháp vào giao tiếp thực tế',
            ],
        },
        listening: {
            titles: [
                'Nghe hiểu hội thoại',
                'Nghe tin tức',
                'Nghe podcast',
                'IELTS Listening Practice',
                'Dictation luyện nghe',
            ],
            descriptions: [
                'Rèn luyện kỹ năng nghe qua các bài luyện đa dạng',
                'Cải thiện khả năng nghe hiểu trong các tình huống thực tế',
            ],
        },
        speaking: {
            titles: [
                'Phát âm chuẩn IPA',
                'Giao tiếp cơ bản',
                'Thuyết trình tiếng Anh',
                'IELTS Speaking Practice',
            ],
            descriptions: [
                'Rèn luyện khả năng phát âm và giao tiếp tự tin',
                'Thực hành nói trong nhiều tình huống khác nhau',
            ],
        },
        reading: {
            titles: [
                'Đọc hiểu văn bản ngắn',
                'Đọc báo tiếng Anh',
                'Đọc truyện ngắn',
                'IELTS Reading Practice',
                'Scanning & Skimming',
                'Academic Reading',
                'Reading for TOEIC',
            ],
            descriptions: [
                'Nâng cao kỹ năng đọc hiểu qua nhiều loại văn bản',
                'Phát triển chiến lược đọc hiệu quả',
            ],
        },
        writing: {
            titles: [
                'Viết câu cơ bản',
                'Viết đoạn văn',
                'Viết email chuyên nghiệp',
                'IELTS Writing Task 1 & 2',
                'Essay Writing',
            ],
            descriptions: [
                'Học cách viết rõ ràng và mạch lạc',
                'Rèn luyện kỹ năng viết học thuật và thực tế',
            ],
        },
    };

    const variants: SkillCourse['variant'][] = ['pink', 'yellow', 'green', 'blue', 'purple', 'orange'];
    const statuses: SkillCourse['status'][] = ['not_started', 'in_progress', 'completed', 'paused'];
    const labelSets = [
        ['Cơ bản', 'Quan trọng'],
        ['Nâng cao', 'Thực hành'],
        ['Thiết yếu'],
        ['Ôn tập', 'Thi cử'],
    ];

    const template = courseTemplates[skill];

    return template.titles.map((title, index) => ({
        id: `${level}-${skill}-${index + 1}`,
        title,
        description: template.descriptions[index % template.descriptions.length],
        materials: Math.floor(Math.random() * 15) + 5,
        tag: `${level} Guideline`,
        courseType: 'Khoá học',
        status: statuses[index % statuses.length],
        labels: labelSets[index % labelSets.length],
        variant: variants[index % variants.length],
    }));
};

export const getLevelSkillCourses = (level: string): Record<SkillType, SkillCourse[]> => ({
    vocabulary: generateCourses('vocabulary', level),
    grammar: generateCourses('grammar', level),
    listening: generateCourses('listening', level),
    speaking: generateCourses('speaking', level),
    reading: generateCourses('reading', level),
    writing: generateCourses('writing', level),
});

export const getSkillTabsWithCounts = (courses: Record<SkillType, SkillCourse[]>): SkillTab[] =>
    skillTabs.map(tab => ({
        ...tab,
        count: courses[tab.id].length,
    }));
