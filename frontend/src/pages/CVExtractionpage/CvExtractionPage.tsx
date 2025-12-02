import DropzoneComponent from "../../components/form/form-elements/DropZone.tsx";
import {useState} from "react";
import PageMeta from "../../components/common/PageMeta.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import CvUploader from "../../components/CvUploader.tsx";
import { useResume } from "../../context/ResumeContext.tsx";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router';

export default function CvExtractionPage() {
    return (
        <>
            <PageMeta
                title="CV Extraction and Reformulation | CVInsight"
                description="PLACEHOLDER DESCRIPTION FOR SEO"
            />
            <PageBreadcrumb pageTitle="Resume Extraction" />

            <CvExtractionContent />
        </>
    );
}

function CvExtractionContent() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [populated, setPopulated] = useState(false);

    const navigate = useNavigate();

    // Resume context setters
    const {
        setAbout,
        setEducationList,
        setSkills,
        setSoftSkills,
        setInterests,
        setWorkList,
        setProjects,
        setLanguages,
        setCertificates,
        setSocialActivities,
    } = useResume();

    const handleFileChange = (files: File[]) => {
        setSelectedFiles(files);
        setResult(null);
        setError(null);
        setPopulated(false);
    };

    const asRecord = (x: unknown): Record<string, unknown> => (x && typeof x === 'object') ? (x as Record<string, unknown>) : {};
    const getString = (obj: Record<string, unknown>, ...keys: string[]) => {
        for (const k of keys) {
            const v = obj[k];
            if (typeof v === 'string' && v.trim() !== '') return v;
            if (typeof v === 'number') return String(v);
        }
        return '';
    };
    const getNumber = (obj: Record<string, unknown>, ...keys: string[]) => {
        for (const k of keys) {
            const v = obj[k];
            if (typeof v === 'number') return v;
            if (typeof v === 'string') {
                const n = parseInt(v as string, 10);
                if (!isNaN(n)) return n;
            }
        }
        return 0;
    };
    const getArrayFrom = (obj: Record<string, unknown>, ...keys: string[]) => {
        for (const k of keys) {
            const v = obj[k];
            if (Array.isArray(v)) return v as unknown[];
        }
        return null;
    };

    const handleSuccess = (data: unknown) => {
        setResult(JSON.stringify(data, null, 2));
        setError(null);

        // Best-effort mapping from backend shape to our resume context
        try {
            if (!data || typeof data !== 'object') return;

            const root = asRecord(data);

            // About
            const aboutSrc = root['about'] ?? root['personal'] ?? root['profile'];
            if (aboutSrc && typeof aboutSrc === 'object') {
                const src = asRecord(aboutSrc);
                const about = {
                    name: getString(src, 'name', 'fullName'),
                    role: getString(src, 'role', 'title', 'profession'),
                    email: getString(src, 'email'),
                    phone: getString(src, 'phone', 'telephone'),
                    address: getString(src, 'address'),
                    linkedin: getString(src, 'linkedin', 'linkedinUrl'),
                    github: getString(src, 'github', 'githubUrl'),
                    portfolio: getString(src, 'portfolio', 'website'),
                    picture: getString(src, 'picture'),
                    summary: getString(src, 'summary', 'bio', 'description'),
                };
                setAbout(about);
            }

            // Education
            const educArr = getArrayFrom(root, 'education', 'educations');
            if (educArr) {
                const edu = educArr.map(item => {
                    const e = asRecord(item);
                    return {
                        id: uuidv4(),
                        degree: getString(e, 'degree', 'qualification'),
                        school: getString(e, 'school', 'institution', 'university'),
                        startYr: getNumber(e, 'startYr', 'startYear', 'fromYear'),
                        endYr: getNumber(e, 'endYr', 'endYear', 'toYear'),
                        grade: getString(e, 'grade', 'score', 'result'),
                    };
                });
                if (edu.length) setEducationList(edu);
            }

            // Work / Experience
            const workArr = getArrayFrom(root, 'experience', 'work', 'workExperience');
            if (workArr) {
                const work = workArr.map(item => {
                    const w = asRecord(item);
                    const endDate = getString(w, 'endDate', 'to');
                    const current = w['current'] === true;
                    return {
                        id: uuidv4(),
                        position: getString(w, 'position', 'title'),
                        company: getString(w, 'company', 'employer'),
                        type: getString(w, 'type'),
                        startDate: getString(w, 'startDate', 'from'),
                        endDate: endDate || (current ? 'Present' : ''),
                        description: getString(w, 'description', 'summary', 'details'),
                    };
                });
                if (work.length) setWorkList(work);
            }

            // Skills
            const skillsArr = getArrayFrom(root, 'skills');
            if (skillsArr) {
                const skills = skillsArr.map(item => {
                    if (typeof item === 'string') return { id: uuidv4(), name: item };
                    const s = asRecord(item);
                    return { id: uuidv4(), name: getString(s, 'name') };
                });
                if (skills.length) setSkills(skills);
            }

            // Soft skills
            const softArr = getArrayFrom(root, 'softSkills', 'soft_skills');
            if (softArr) {
                const soft = softArr.map(item => {
                    if (typeof item === 'string') return { id: uuidv4(), name: item };
                    const s = asRecord(item);
                    return { id: uuidv4(), name: getString(s, 'name') };
                });
                if (soft.length) setSoftSkills(soft);
            }

            // Interests
            const intsArr = getArrayFrom(root, 'interests');
            if (intsArr) {
                const ints = intsArr.map(item => {
                    if (typeof item === 'string') return { id: uuidv4(), name: item };
                    const i = asRecord(item);
                    return { id: uuidv4(), name: getString(i, 'name') };
                });
                if (ints.length) setInterests(ints);
            }

            // Projects
            const projectsArr = getArrayFrom(root, 'projects');
            if (projectsArr) {
                const projects = projectsArr.map(item => {
                    const p = asRecord(item);
                    return {
                        id: uuidv4(),
                        name: getString(p, 'name', 'title'),
                        url: getString(p, 'url', 'link'),
                        github: getString(p, 'github', 'repo'),
                        description: getString(p, 'description', 'summary'),
                    };
                });
                if (projects.length) setProjects(projects);
            }

            // Languages
            const langsArr = getArrayFrom(root, 'languages');
            if (langsArr) {
                const langs = langsArr.map(item => {
                    const l = asRecord(item);
                    return { id: uuidv4(), name: getString(l, 'name', 'language'), level: getString(l, 'level', 'proficiency') };
                });
                if (langs.length) setLanguages(langs);
            }

            // Certificates
            const certsArr = getArrayFrom(root, 'certificates', 'certs');
            if (certsArr) {
                const certs = certsArr.map(item => {
                    const c = asRecord(item);
                    return { id: uuidv4(), title: getString(c, 'title', 'name'), issuer: getString(c, 'issuer', 'institution'), year: getString(c, 'year', 'date') };
                });
                if (certs.length) setCertificates(certs);
            }

            // Social activities
            const actsArr = getArrayFrom(root, 'socialActivities', 'activities');
            if (actsArr) {
                const acts = actsArr.map(item => {
                    const a = asRecord(item);
                    return { id: uuidv4(), role: getString(a, 'role', 'title'), organization: getString(a, 'organization', 'org'), description: getString(a, 'description', 'details') };
                });
                if (acts.length) setSocialActivities(acts);
            }

            setPopulated(true);
        } catch (e) {
            console.warn('Failed to map parsed resume into context', e);
        }
    };

    const handleError = (message: string) => {
        setError(message);
        setResult(null);
        setPopulated(false);
    };

    const openResumeBuilder = () => {
        // Use SPA navigation to preserve in-memory context
        navigate('/resume-builder');
    };

    return (
        <>
            <DropzoneComponent
                acceptedFileTypes={{
                    "application/pdf": [],
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
                }}
                onFilesChange={handleFileChange}
            />

            {selectedFiles.length > 0 && (
                <CvUploader
                    file={selectedFiles[0]}
                    onSuccess={handleSuccess}
                    onError={handleError}
                />
            )}

            {result && (
                <div className="mt-8 p-6 rounded-xl bg-gray-900 text-gray-100 shadow-lg border border-gray-700 animate-fade-in">
                    <div className="flex items-start justify-between gap-4">
                        <h2 className="text-xl font-semibold mb-4 text-blue-400">Analysis Result</h2>
                        {populated && (
                            <div className="flex items-center gap-2">
                                <button onClick={openResumeBuilder} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">Open in Resume Builder</button>
                            </div>
                        )}
                    </div>
                    <pre className="p-4 bg-gray-800 rounded-lg overflow-auto max-h-[500px] text-sm leading-relaxed">
                        {result}
                    </pre>
                </div>
            )}

            {error && (
                <div className="mt-6 p-4 rounded-xl bg-red-100 text-red-800 border border-red-300 shadow animate-fade-in">
                    <p className="font-medium">⚠️ {error}</p>
                </div>
            )}
        </>
    );
}