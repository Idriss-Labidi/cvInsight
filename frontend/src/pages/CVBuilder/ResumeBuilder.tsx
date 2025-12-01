import React, { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import ResumePdfDocument from "../../components/ResumeBuilder/ResumePdfDocument.tsx";
import { ResumeProvider, useResume } from "../../components/ResumeBuilder/ResumeContext.tsx";
import About from "../../components/ResumeBuilder/About.tsx";
import Education from "../../components/ResumeBuilder/Education.tsx";
import Work from "../../components/ResumeBuilder/Work.tsx";
import Skills from "../../components/ResumeBuilder/Skills.tsx";
import Projects from "../../components/ResumeBuilder/Projects.tsx";
import ResumePreview from "../../components/ResumeBuilder/ResumePreview.tsx";
import { TemplateSelector } from "../../components/ResumeBuilder/templateSelector.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import SocialActivities from "../../components/ResumeBuilder/SocialActivities.tsx";
import Certifications from "../../components/ResumeBuilder/Certifications.tsx";
import Languages from "../../components/ResumeBuilder/Languages.tsx";

const tabs = [
    {
        id: "template",
        label: "Template",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
                <line x1={3} y1={9} x2={21} y2={9} />
                <line x1={9} y1={21} x2={9} y2={9} />
            </svg>
        ),
    },
    {
        id: "about",
        label: "About",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
    {
        id: "education",
        label: "Education",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.597 6.426c-.597 2.627-3.259 4.746-6.757 4.746s-6.16-2.119-6.757-4.746a12.066 12.066 0 01.597-6.426L12 14z" />
            </svg>
        ),
    },
    {
        id: "work",
        label: "Work Experience",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width={20} height={14} x={2} y={7} rx={2} ry={2} />
                <path d="M16 7V5a4 4 0 00-8 0v2" />
            </svg>
        ),
    },
    {
        id: "skills",
        label: "Skills",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
    },
    {
        id: "projects",
        label: "Projects",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
        ),
    },
    {
        id: "certifications",
        label: "Certifications",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
            </svg>
        ),
    },
    {
        id: "languages",
        label: "Languages",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 7l-7-5-7 5v10l7 5 7-5V7z" />
            </svg>
        ),
    },
    {
        id: "socialActivities",
        label: "Social Activities",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
            </svg>
        ),
    },
];

const ResumeBuilderContent: React.FC = () => {
    const [activeTab, setActiveTab] = useState("template");
    const [isDownloading, setIsDownloading] = useState(false);
    const { selectedTemplate, setSelectedTemplate, about , educationList, workList, skills, softSkills, interests, projects, languages, certificates, socialActivities } = useResume();

    const renderTab = () => {
        switch (activeTab) {
            case "template":
                return <TemplateSelector selectedTemplate={selectedTemplate} onSelectTemplate={setSelectedTemplate} />;
            case "about":
                return <About />;
            case "education":
                return <Education />;
            case "work":
                return <Work />;
            case "skills":
                return <Skills />;
            case "projects":
                return <Projects />;
            case "certifications":
                return <Certifications />;
            case "languages":
                return <Languages />;
            case "socialActivities":
                return <SocialActivities />;
            default:
                return null;
        }
    };

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            const blob = await pdf(
                <ResumePdfDocument
                    about={about}
                    educationList={educationList}
                    workList={workList}
                    skills={skills}
                    softSkills={softSkills}
                    interests={interests}
                    projects={projects}
                    languages={languages}
                    certificates={certificates}
                    socialActivities={socialActivities}
                    templateId={selectedTemplate}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = (about.name ? `${about.name.replace(/\s+/g, '_')}_Resume.pdf` : 'Resume.pdf');
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to download PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-6 p-5">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Panel - Form */}
                <section className="flex flex-col lg:col-span-2 h-[calc(100vh-180px)]">
                    <div className="flex flex-col h-full border border-gray-200 rounded-2xl dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                        {/* Tabs Navigation */}
                        <nav className="p-5 pb-0">
                            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                                            activeTab === tab.id
                                                ? "bg-blue-600 text-white shadow-sm"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                                        }`}
                                        type="button"
                                    >
                                        {tab.icon}
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </nav>

                        {/* Form Content - Scrollable */}
                        <main className="flex-1 overflow-y-auto custom-scrollbar p-5">{renderTab()}</main>
                    </div>
                </section>

                {/* Right Panel - Preview */}
                <section className="flex flex-col lg:col-span-3 h-[calc(100vh-180px)]">
                    <div className="flex flex-col h-full border border-gray-200 rounded-2xl dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                        <header className="p-5 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Live Preview</h2>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Your resume updates in real-time
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Live
                                </span>
                            </div>
                        </header>

                        {/* Preview Content - Scrollable */}
                        <main className="flex-1 overflow-y-auto custom-scrollbar p-5">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl -z-10 blur-sm"></div>
                                <div className="bg-white rounded-xl shadow-xl relative">
                                    <ResumePreview />
                                </div>
                            </div>
                        </main>
                    </div>
                </section>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 bg-white dark:bg-gray-900">
                <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Draft
                </button>
                <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDownloading ? (
                        <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PDF
                        </>
                    )}
                </button>
            </div>

            {/* Tips Section */}
            <div className="p-5 border border-blue-200 rounded-2xl dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                            Pro Tips
                        </h3>
                        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                            <li>• Use action verbs to describe your work experience</li>
                            <li>• Quantify your achievements with numbers and metrics</li>
                            <li>• Keep your resume concise and relevant to the job</li>
                            <li>• Proofread carefully for spelling and grammar errors</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ResumeBuilder: React.FC = () => {
    return (
        <ResumeProvider>
            <PageBreadcrumb pageTitle="Resume Builder"></PageBreadcrumb>
            <ResumeBuilderContent />
        </ResumeProvider>
    );
};

export default ResumeBuilder;