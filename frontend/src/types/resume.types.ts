export type TemplateTheme = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'mono';
export type TemplateLayout = 'classic' | 'modern' | 'minimal' | 'creative' | 'professional';

export interface ResumeTemplate {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    theme: TemplateTheme;
    layout: TemplateLayout;
    isPremium?: boolean;
}

export interface ResumeContent {
    skills?: string[];
    summary?: string;
    personal?: PersonalInfo;
    projects?: Project[];
    education?: Education[];
    languages?: Language[];
    experience?: Experience[];
    certifications?: Certification[];
    socialActivities?: SocialActivity[];
}

export interface PersonalInfo {
    email?: string;
    phone?: string;
    fullName?: string;
    otherProfiles?: string[];
}

export interface Project {
    link?: string;
    name?: string;
    description?: string;
    technologies?: string[];
}

export interface Education {
    degree?: string;
    institution?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}

export interface Language {
    name?: string;
    level?: string;
}

export interface Experience {
    title?: string;
    company?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}

export interface Certification {
    year?: string;
    title?: string;
    issuer?: string;
}

export interface SocialActivity {
    role?: string;
    organization?: string;
    description?: string;
}