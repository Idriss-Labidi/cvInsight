import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Calendar, FileText, GitCompare, Layers, Sparkles, Target, Loader } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import axiosInstance from "../../utils/axiosInstance";

interface ResumeResponse {
    id: string;
    filename: string;
    contentType: string;
    size: number;
    uploadedAt: string;
    jsonContent?: unknown;
    score?: number | null;
}

interface ResumeRecord extends ResumeResponse {
    parsedContent: Record<string, unknown> | null;
}

interface AiComparison {
    summary?: string;
    leftHighlights?: string[];
    rightHighlights?: string[];
    sharedStrengths?: string[];
    gaps?: string[];
    winner?: "LEFT" | "RIGHT" | "TIE" | string;
    hiringAdvice?: string;
}

interface ResumeStats {
    score: number | null;
    skillCount: number;
    experienceCount: number;
    educationCount: number;
    projectCount: number;
    size: number;
}

type ComparisonMetricKey = keyof ResumeStats;

interface ComparisonMetric {
    key: ComparisonMetricKey;
    label: string;
    higherIsBetter?: boolean;
    formatter?: (value: number | null) => string;
}

const parseJsonContent = (content: unknown): Record<string, unknown> | null => {
    if (!content) return null;
    if (typeof content === "string") {
        try {
            return JSON.parse(content) as Record<string, unknown>;
        } catch {
            return null;
        }
    }
    if (typeof content === "object") {
        return content as Record<string, unknown>;
    }
    return null;
};

const getArrayFromContent = (content: Record<string, unknown> | null, keys: string[]): unknown[] => {
    if (!content) return [];
    for (const key of keys) {
        const value = (content as Record<string, unknown>)[key];
        if (Array.isArray(value)) {
            return value;
        }
    }
    return [];
};

const extractSkills = (content: Record<string, unknown> | null): string[] => {
    const skillsRaw = getArrayFromContent(content, ["skills", "Skills", "skillset", "skill_list"]);
    const normalized = skillsRaw
        .map((skill) => {
            if (typeof skill === "string") return skill;
            if (typeof skill === "object" && skill !== null) {
                const skillObj = skill as Record<string, unknown>;
                const maybeName = skillObj.name || skillObj.skill || skillObj.title;
                if (typeof maybeName === "string") return maybeName;
            }
            return "";
        })
        .filter(Boolean)
        .map((skill) => skill.trim());

    return Array.from(new Set(normalized));
};

const buildStats = (resume: ResumeRecord | null): ResumeStats => {
    const content = resume?.parsedContent ?? null;
    const skills = extractSkills(content);
    const experiences = getArrayFromContent(content, ["experience", "experiences", "work_experience", "workExperience"]);
    const educations = getArrayFromContent(content, ["education", "educations", "education_history", "educationHistory"]);
    const projects = getArrayFromContent(content, ["projects", "project_list", "project"]);

    return {
        score: typeof resume?.score === "number" ? Math.round(resume.score) : null,
        skillCount: skills.length,
        experienceCount: experiences.length,
        educationCount: educations.length,
        projectCount: projects.length,
        size: resume?.size ?? 0,
    };
};

const ComparisonPage = () => {
    const [resumes, setResumes] = useState<ResumeRecord[]>([]);
    const [leftResumeId, setLeftResumeId] = useState<string>("");
    const [rightResumeId, setRightResumeId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [compareMessage, setCompareMessage] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [leftPreviewUrl, setLeftPreviewUrl] = useState<string | null>(null);
    const [rightPreviewUrl, setRightPreviewUrl] = useState<string | null>(null);
    const [leftPreviewLoading, setLeftPreviewLoading] = useState(false);
    const [rightPreviewLoading, setRightPreviewLoading] = useState(false);
    const [leftPreviewError, setLeftPreviewError] = useState<string | null>(null);
    const [rightPreviewError, setRightPreviewError] = useState<string | null>(null);
    const [aiComparison, setAiComparison] = useState<AiComparison | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        axiosInstance
            .get<ResumeResponse[]>("/resume", { timeout: 0 })
            .then((response) => {
                const mapped = response.data.map((resume) => ({
                    ...resume,
                    parsedContent: parseJsonContent(resume.jsonContent),
                }));
                setResumes(mapped);
            })
            .catch((fetchError) => {
                setError(fetchError.response?.data?.error || "Failed to load resumes.");
            })
            .finally(() => setIsLoading(false));
    }, []);

    const leftResume = useMemo(
        () => resumes.find((resume) => resume.id === leftResumeId) || null,
        [resumes, leftResumeId],
    );

    const rightResume = useMemo(
        () => resumes.find((resume) => resume.id === rightResumeId) || null,
        [resumes, rightResumeId],
    );

    // Load left preview
    useEffect(() => {
        setLeftPreviewError(null);
        if (leftPreviewUrl) {
            URL.revokeObjectURL(leftPreviewUrl);
            setLeftPreviewUrl(null);
        }
        if (!leftResumeId) {
            setLeftPreviewLoading(false);
            return;
        }
        setLeftPreviewLoading(true);
        axiosInstance
            .get(`/resume/${leftResumeId}/file`, { responseType: "blob" })
            .then((response) => {
                const blob = new Blob([response.data], { type: response.headers["content-type"] });
                setLeftPreviewUrl(URL.createObjectURL(blob));
            })
            .catch((fetchError) => setLeftPreviewError(fetchError.response?.data?.error || "Could not load preview."))
            .finally(() => setLeftPreviewLoading(false));
    }, [leftResumeId]);

    // Load right preview
    useEffect(() => {
        setRightPreviewError(null);
        if (rightPreviewUrl) {
            URL.revokeObjectURL(rightPreviewUrl);
            setRightPreviewUrl(null);
        }
        if (!rightResumeId) {
            setRightPreviewLoading(false);
            return;
        }
        setRightPreviewLoading(true);
        axiosInstance
            .get(`/resume/${rightResumeId}/file`, { responseType: "blob" })
            .then((response) => {
                const blob = new Blob([response.data], { type: response.headers["content-type"] });
                setRightPreviewUrl(URL.createObjectURL(blob));
            })
            .catch((fetchError) => setRightPreviewError(fetchError.response?.data?.error || "Could not load preview."))
            .finally(() => setRightPreviewLoading(false));
    }, [rightResumeId]);

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            if (leftPreviewUrl) URL.revokeObjectURL(leftPreviewUrl);
            if (rightPreviewUrl) URL.revokeObjectURL(rightPreviewUrl);
        };
    }, [leftPreviewUrl, rightPreviewUrl]);

    const leftStats = useMemo(() => buildStats(leftResume), [leftResume]);
    const rightStats = useMemo(() => buildStats(rightResume), [rightResume]);

    const leftSkills = useMemo(() => extractSkills(leftResume?.parsedContent ?? null), [leftResume]);
    const rightSkills = useMemo(() => extractSkills(rightResume?.parsedContent ?? null), [rightResume]);

    const sharedSkills = useMemo(() => {
        const rightSet = new Set(rightSkills.map((skill) => skill.toLowerCase()));
        return leftSkills.filter((skill) => rightSet.has(skill.toLowerCase()));
    }, [leftSkills, rightSkills]);

    const uniqueLeftSkills = useMemo(() => {
        const rightSet = new Set(rightSkills.map((skill) => skill.toLowerCase()));
        return leftSkills.filter((skill) => !rightSet.has(skill.toLowerCase()));
    }, [leftSkills, rightSkills]);

    const uniqueRightSkills = useMemo(() => {
        const leftSet = new Set(leftSkills.map((skill) => skill.toLowerCase()));
        return rightSkills.filter((skill) => !leftSet.has(skill.toLowerCase()));
    }, [leftSkills, rightSkills]);

    const comparisonMetrics: ComparisonMetric[] = [
        {
            key: "score",
            label: "Overall score",
            formatter: (value) => (value !== null ? `${value}%` : "N/A"),
        },
        { key: "skillCount", label: "Skills detected" },
        { key: "experienceCount", label: "Experience entries" },
        { key: "educationCount", label: "Education entries" },
        { key: "projectCount", label: "Projects" },
    ];

    const formatValue = (metric: ComparisonMetric, value: number | null) => {
        if (metric.formatter) {
            return metric.formatter(value);
        }
        if (value === null) return "N/A";
        return value.toString();
    };

    const pickWinner = (metric: ComparisonMetric, leftValue: number | null, rightValue: number | null) => {
        const l = typeof leftValue === "number" ? leftValue : null;
        const r = typeof rightValue === "number" ? rightValue : null;
        if (l === null && r === null) return "equal";
        if (l === r) return "equal";
        if (metric.higherIsBetter === false) {
            if (l === null) return "right";
            if (r === null) return "left";
            return l < r ? "left" : "right";
        }
        if (l === null) return "right";
        if (r === null) return "left";
        return l > r ? "left" : "right";
    };

    const handleCompare = () => {
        if (!leftResumeId || !rightResumeId) {
            setCompareMessage("Select a resume on the left and another on the right to compare.");
            setShowResults(false);
            return;
        }
        if (leftResumeId === rightResumeId) {
            setCompareMessage("Choose two different resumes to compare.");
            setShowResults(false);
            return;
        }
        setCompareMessage(null);
        setAiComparison(null);
        setAiError(null);
        setShowResults(true);
        setAiLoading(true);
        axiosInstance
            .post<AiComparison>(
                "/resume/resumes-comparison",
                [leftResumeId, rightResumeId],
                {timeout: 0}
            )
            .then((response) => setAiComparison(response.data))
            .catch((fetchError) => {
                setAiError(fetchError.response?.data?.error || "Failed to load AI comparison.");
            })
            .finally(() => setAiLoading(false));
    };

    return (
        <div className="space-y-6">
            <PageMeta title="Resume Comparaison | CVInsight" description="Compare two resumes side by side." />
            <PageBreadcrumb pageTitle="Resume Comparaison" />

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Compare resumes</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Pick two resumes, then click compare to see overlaps and strengths.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span>We highlight the stronger resume per metric.</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                    <SelectionCard
                        title="Left resume"
                        resumes={resumes}
                        selectedId={leftResumeId}
                        onChange={setLeftResumeId}
                        placeholder="Choose resume for the left column"
                    />

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                            <GitCompare className="w-6 h-6 text-blue-700 dark:text-blue-300" />
                        </div>
                        <div className="text-center">
                            <p className="text-base font-semibold text-gray-900 dark:text-white">Ready to compare</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Choose one resume for each side and hit compare.
                            </p>
                        </div>
                        <button
                            onClick={handleCompare}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
                            disabled={isLoading || resumes.length === 0}
                        >
                            Compare
                        </button>
                        <div className="w-full rounded-lg bg-white dark:bg-gray-900/60 border border-blue-100 dark:border-blue-800 p-3 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-500" />
                                <span className="font-medium text-gray-800 dark:text-white">
                                    Left: {leftResume?.filename || "None selected"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Layers className="w-4 h-4 text-purple-500" />
                                <span className="font-medium text-gray-800 dark:text-white">
                                    Right: {rightResume?.filename || "None selected"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <SelectionCard
                        title="Right resume"
                        resumes={resumes}
                        selectedId={rightResumeId}
                        onChange={setRightResumeId}
                        placeholder="Choose resume for the right column"
                        align="right"
                    />
                </div>

                {compareMessage && (
                    <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
                        <AlertCircle className="w-4 h-4" />
                        <span>{compareMessage}</span>
                    </div>
                )}
                {error && (
                    <div className="mt-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-100">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {(leftResume || rightResume) && !isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <PreviewPanel
                        title="Left preview"
                        resume={leftResume}
                        previewUrl={leftPreviewUrl}
                        loading={leftPreviewLoading}
                        error={leftPreviewError}
                    />
                    <PreviewPanel
                        title="Right preview"
                        resume={rightResume}
                        previewUrl={rightPreviewUrl}
                        loading={rightPreviewLoading}
                        error={rightPreviewError}
                        align="right"
                    />
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, index) => (
                        <div
                            key={index}
                            className="h-64 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 animate-pulse"
                        />
                    ))}
                </div>
            ) : showResults && leftResume && rightResume ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Comparison overview</p>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Metrics side by side</h2>
                                </div>
                                <Target className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {comparisonMetrics.map((metric) => {
                                    const leftValue = leftStats[metric.key];
                                    const rightValue = rightStats[metric.key];
                                    const winner = pickWinner(metric, leftValue, rightValue);

                                    return (
                                        <div
                                            key={metric.key}
                                            className="grid grid-cols-1 md:grid-cols-3 items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center"
                                        >
                                            <div
                                                className={`flex items-center justify-center gap-2 md:gap-3 text-sm font-semibold px-3 py-2 rounded-lg ${
                                                    winner === "left"
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                                        : "text-gray-800 dark:text-gray-100"
                                                }`}
                                            >
                                                <span className="md:hidden text-xs text-gray-500 dark:text-gray-400">Left</span>
                                                {formatValue(metric, leftValue)}
                                            </div>

                                            <div className="text-center text-sm text-gray-600 dark:text-gray-300 font-medium">
                                                {metric.label}
                                            </div>

                                            <div
                                                className={`flex items-center justify-center gap-2 md:gap-3 text-sm font-semibold px-3 py-2 rounded-lg ${
                                                    winner === "right"
                                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                                        : "text-gray-800 dark:text-gray-100"
                                                }`}
                                            >
                                                <span className="md:hidden text-xs text-gray-500 dark:text-gray-400">Right</span>
                                                {formatValue(metric, rightValue)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <AIComparisonPanel
                            data={aiComparison}
                            loading={aiLoading}
                            error={aiError}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <SkillsPanel
                            title="Shared skills"
                            skills={sharedSkills}
                            accentClass="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            helper="Common strengths across both resumes."
                        />
                        <SkillsPanel
                            title="Left only"
                            skills={uniqueLeftSkills}
                            accentClass="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            helper="Skills unique to the left resume."
                        />
                        <SkillsPanel
                            title="Right only"
                            skills={uniqueRightSkills}
                            accentClass="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            helper="Skills unique to the right resume."
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ResumeSnapshot title="Left snapshot" resume={leftResume} />
                        <ResumeSnapshot title="Right snapshot" resume={rightResume} align="right" />
                    </div>
                </>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-600 dark:text-gray-300">
                    Select two different resumes and press compare to see results.
                </div>
            )}
        </div>
    );
};

interface SelectionCardProps {
    title: string;
    resumes: ResumeRecord[];
    selectedId: string;
    onChange: (value: string) => void;
    placeholder: string;
    align?: "left" | "right";
}

const SelectionCard = ({ title, resumes, selectedId, onChange, placeholder, align = "left" }: SelectionCardProps) => {
    const selected = resumes.find((resume) => resume.id === selectedId) || null;

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Pick a resume</h3>
                </div>
                <GitCompare className="w-5 h-5 text-gray-400" />
            </div>

            <select
                value={selectedId}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">{placeholder}</option>
                {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                        {resume.filename}
                    </option>
                ))}
            </select>

            {selected && (
                <div
                    className={`mt-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 space-y-2 ${
                        align === "right" ? "text-right" : "text-left"
                    }`}
                >
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>Uploaded {new Date(selected.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <span>Score: {selected.score !== undefined && selected.score !== null ? `${Math.round(selected.score)}%` : "N/A"}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

interface SkillsPanelProps {
    title: string;
    skills: string[];
    accentClass: string;
    helper: string;
}

const SkillsPanel = ({ title, skills, accentClass, helper }: SkillsPanelProps) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{helper}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${accentClass}`}>
                {skills.length} skill{skills.length !== 1 ? "s" : ""}
            </div>
        </div>
        {skills.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No skills detected.</p>
        ) : (
            <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                    <span
                        key={skill}
                        className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-100"
                    >
                        {skill}
                    </span>
                ))}
            </div>
        )}
    </div>
);

interface PreviewPanelProps {
    title: string;
    resume: ResumeRecord | null;
    previewUrl: string | null;
    loading: boolean;
    error: string | null;
    align?: "left" | "right";
}

const PreviewPanel = ({ title, resume, previewUrl, loading, error, align = "left" }: PreviewPanelProps) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {resume ? resume.filename : "No resume selected"}
                </h3>
            </div>
            <GitCompare className="w-5 h-5 text-blue-500" />
        </div>

        <div className={`relative h-[520px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 ${align === "right" ? "text-right" : "text-left"}`}>
            {!resume ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 px-4">
                    <FileText className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="text-sm font-medium">Select a resume to preview.</p>
                </div>
            ) : loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <Loader className="w-10 h-10 mb-3 animate-spin text-blue-600" />
                    <p className="text-sm font-medium">Loading preview...</p>
                </div>
            ) : error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-red-600 dark:text-red-400 px-4 text-center">
                    <AlertCircle className="w-8 h-8 mb-2" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            ) : previewUrl ? (
                <iframe
                    src={`${previewUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    className="w-full h-full border-none"
                    title={`${title} PDF preview`}
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <FileText className="w-8 h-8 mb-2" />
                    <p className="text-sm font-medium">No preview available.</p>
                </div>
            )}
        </div>
    </div>
);

interface AIComparisonPanelProps {
    data: AiComparison | null;
    loading: boolean;
    error: string | null;
}

const AIComparisonPanel = ({ data, loading, error }: AIComparisonPanelProps) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-3 h-full">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">AI summary</p>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Narrative comparison</h3>
            </div>
            <Sparkles className="w-5 h-5 text-blue-500" />
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 h-full py-6">
                <Loader className="w-8 h-8 mb-3 animate-spin text-blue-600" />
                <p className="text-sm font-medium">Generating AI comparison...</p>
            </div>
        ) : error ? (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            </div>
        ) : data ? (
            <div className="space-y-3">
                {data.summary && <p className="text-sm text-gray-700 dark:text-gray-200">{data.summary}</p>}

                <BulletList title="Left strengths" items={data.leftHighlights} colorClass="text-green-700 dark:text-green-300" />
                <BulletList title="Right strengths" items={data.rightHighlights} colorClass="text-blue-700 dark:text-blue-300" />
                <BulletList title="Shared strengths" items={data.sharedStrengths} colorClass="text-purple-700 dark:text-purple-300" />
                <BulletList title="Gaps" items={data.gaps} colorClass="text-amber-700 dark:text-amber-300" />

                {data.hiringAdvice && (
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-semibold">Advice</p>
                        <p className="mt-1">{data.hiringAdvice}</p>
                    </div>
                )}
                {data.winner && (
                    <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        AI pick: <span className="font-semibold text-gray-900 dark:text-white">{data.winner}</span>
                    </div>
                )}
            </div>
        ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Press Compare to generate AI insights.</p>
        )}
    </div>
);

interface BulletListProps {
    title: string;
    items?: string[];
    colorClass: string;
}

const BulletList = ({ title, items, colorClass }: BulletListProps) => {
    if (!items || items.length === 0) return null;
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
            <ul className="mt-1 space-y-1">
                {items.map((item, idx) => (
                    <li key={idx} className={`text-sm ${colorClass}`}>
                        • {item}
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface ResumeSnapshotProps {
    title: string;
    resume: ResumeRecord | null;
    align?: "left" | "right";
}

const ResumeSnapshot = ({ title, resume, align = "left" }: ResumeSnapshotProps) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {resume ? resume.filename : "No resume selected"}
                </h3>
            </div>
            <Sparkles className="w-5 h-5 text-blue-500" />
        </div>

        {resume ? (
            <div className={`grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300 ${align === "right" ? "text-right" : "text-left"}`}>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{new Date(resume.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                        {resume.score !== undefined && resume.score !== null ? `${Math.round(resume.score)}%` : "N/A"}
                    </p>
                </div>
            </div>
        ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Select a resume to see its details.</p>
        )}
    </div>
);

export default ComparisonPage;
