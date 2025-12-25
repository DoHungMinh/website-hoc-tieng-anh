// Skill types for English learning
export type SkillType = 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'reading' | 'writing';

export interface SkillTab {
    id: SkillType;
    label: string;
    icon: string;
    count: number;
}

export interface SkillCourse {
    id: string;
    title: string;
    description: string;
    materials: number;
    tag: string;
    courseType: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'paused';
    labels: string[];
    variant: 'pink' | 'yellow' | 'green' | 'blue' | 'purple' | 'orange';
}

export interface LevelData {
    level: string;
    title: string;
    skills: Record<SkillType, SkillCourse[]>;
}
