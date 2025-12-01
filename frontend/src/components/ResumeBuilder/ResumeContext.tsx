import  { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { TemplateTheme } from '../../types/resume.types.ts';
import { RESUME_TEMPLATES } from './templates/resume.templates.ts';

export type TemplateType = "modern" | "minimalist" | "professional";

export interface About {
    name: string;
    role: string;
    email: string;
    phone: string;
    address: string;
    linkedin: string;
    github: string;
    portfolio: string;
    picture: string;
    summary: string;
}

export interface Education {
    id: string;
    degree: string;
    school: string;
    startYr: number;
    endYr: number;
    grade: string;
}

export interface Work {
    id: string;
    position: string;
    company: string;
    type: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface Skill {
    id: string;
    name: string;
}

export interface Project {
    id: string;
    name: string;
    url: string;
    github: string;
    description: string;
}

export interface Language {
    id: string;
    name: string;
    level: string;
}

export interface Certificate {
    id: string;
    title: string;
    issuer: string;
    year: string;
}

export interface SocialActivity {
    id: string;
    role: string;
    organization: string;
    description: string;
}
interface ResumeContextType {
    about: About;
    setAbout: (about: About) => void;
    educationList: Education[];
    setEducationList: (education: Education[]) => void;
    skills: Skill[];
    setSkills: (skills: Skill[]) => void;
    softSkills: Skill[];
    setSoftSkills: (softSkills: Skill[]) => void;
    interests: Skill[];
    setInterests: (interests: Skill[]) => void;
    workList: Work[];
    setWorkList: (workList: Work[]) => void;
    projects: Project[];
    setProjects: (projects: Project[]) => void;
    languages: Language[];
    setLanguages: (languages: Language[]) => void;
    certificates: Certificate[];
    setCertificates: (certificates: Certificate[]) => void;
    socialActivities: SocialActivity[];
    setSocialActivities: (socialActivities: SocialActivity[]) => void;
    template: TemplateType;
    setTemplate: (template: TemplateType) => void;
    selectedTemplate: string;
    setSelectedTemplate: (templateId: string) => void;
    templateTheme: TemplateTheme;
    setTemplateTheme: (theme: TemplateTheme) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const useResume = (): ResumeContextType => {
    const context = useContext(ResumeContext);
    if (!context) {
        throw new Error("useResume must be used within ResumeProvider");
    }
    return context;
};

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
    const [selectedTemplate, setSelectedTemplate] = useState('classic-blue');
    const [templateTheme, setTemplateTheme] = useState<TemplateTheme>('blue');
    const [template, setTemplate] = useState<TemplateType>("modern");

    // Sync theme when template changes
    useEffect(() => {
        const templateObj = RESUME_TEMPLATES.find(t => t.id === selectedTemplate);
        if (templateObj) {
            setTemplateTheme(templateObj.theme);
        }
    }, [selectedTemplate]);

    const [about, setAbout] = useState<About>({
        name: "",
        role: "",
        email: "",
        phone: "",
        address: "",
        linkedin: "",
        github: "",
        portfolio: "",
        picture: "",
        summary: "",
    });

    const [educationList, setEducationList] = useState<Education[]>([
        { id: uuidv4(), degree: "", school: "", startYr: 0, endYr: 0, grade: "" },
    ]);

    const [skills, setSkills] = useState<Skill[]>([
        { id: uuidv4(), name: "JavaScript" },
        { id: uuidv4(), name: "ReactJS" },
        { id: uuidv4(), name: "NodeJS" },
        { id: uuidv4(), name: "MongoDB" },
    ]);

    const [softSkills, setSoftSkills] = useState<Skill[]>([
        { id: uuidv4(), name: "Communication" },
        { id: uuidv4(), name: "Problem-solving" },
        { id: uuidv4(), name: "Teamwork" },
        { id: uuidv4(), name: "Leadership" },
    ]);

    const [interests, setInterests] = useState<Skill[]>([
        { id: uuidv4(), name: "Web Development" },
        { id: uuidv4(), name: "Machine Learning" },
        { id: uuidv4(), name: "Open Source Projects" },
    ]);

    const [workList, setWorkList] = useState<Work[]>([
        { id: uuidv4(), position: "", company: "", type: "", startDate: "", endDate: "", description: "" },
    ]);

    const [projects, setProjects] = useState<Project[]>([
        { id: uuidv4(), name: "", url: "", github: "", description: "" },
    ]);
    const [languages, setLanguages] = useState<Language[]>([
        {id:uuidv4(), name: "", level: "" },
    ]);

    const [certificates, setCertificates] = useState<Certificate[]>([
        {id:uuidv4(), title: "", issuer: "", year: "" },
    ]);

    const [socialActivities, setSocialActivities] = useState<SocialActivity[]>([
        {id:uuidv4(), role: "", organization: "", description: "" },
    ]);

    return (
        <ResumeContext.Provider
            value={{
                about,
                setAbout,
                educationList,
                setEducationList,
                skills,
                setSkills,
                softSkills,
                setSoftSkills,
                interests,
                setInterests,
                workList,
                setWorkList,
                projects,
                setProjects,
                languages,
                setLanguages,
                certificates,
                setCertificates,
                socialActivities,
                setSocialActivities,
                template,
                setTemplate,
                selectedTemplate,
                setSelectedTemplate,
                templateTheme,
                setTemplateTheme,
            }}
        >
            {children}
        </ResumeContext.Provider>
    );
};
