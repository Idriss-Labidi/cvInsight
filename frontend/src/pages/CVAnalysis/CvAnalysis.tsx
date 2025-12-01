import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import CvAnalysisResult from "./CvAnalysisResult";
import PageMeta from "../../components/common/PageMeta.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import axiosInstance from "../../utils/axiosInstance.ts";
import {CVSummary} from "../../types/recommendation.types.ts";
import CVSelector from "../../components/career/CVSelector.tsx";
import {recommendationService} from "../../services/recommendationService.ts";

export default function CvAnalysis() {
    const [resumes, setResumes] = useState<CVSummary[]>([]);
    const [selectedResume, setSelectedResume] = useState<CVSummary | null>(null);
    const [resumesLoading, setResumesLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingSelectionId, setPendingSelectionId] = useState<string | null>(null);
    const location = useLocation();

    const resumeIdFromUrl = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const queryId = params.get("id");
        // prefer state if provided, fallback to query param
        const stateId = (location.state as { resumeId?: string } | null)?.resumeId;
        return stateId || queryId;
    }, [location]);

    useEffect(() => {
        setResumesLoading(true);
        setError(null);
        recommendationService.getUserCVs()
            .then(cvs => setResumes(cvs))
            .catch(error => {
                setError(error.response?.data?.error || "Unexpected error loading resumes.");
            })
            .finally(() => setResumesLoading(false));
    }, []);

    useEffect(() => {
        if (resumeIdFromUrl) {
            setPendingSelectionId(resumeIdFromUrl);
        }
    }, [resumeIdFromUrl]);

    const handleSelect = (id: string) => {
        setLoading(true);
        setAnalysis(null);
        setPdfUrl(null);
        setError(null);

        // fetch analysis
        axiosInstance
            .get(`/resume/${id}/analysis`, {
                timeout: 0,
            })
            .then(response => setAnalysis(response.data))
            .catch(error => {
                setError(error.response?.data?.error || "Unexpected error during analysis.");
            })
            .finally(() => setLoading(false));

        // fetch pdf file
        axiosInstance
            .get(`/resume/${id}/file`, {
                responseType: "blob",
            })
            .then(response => {
                const blob = new Blob([response.data], { type: response.headers["content-type"] });
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
            })
            .catch(() => {
                setError("Could not load PDF file.");
            })
    };

    useEffect(() => {
        if (!pendingSelectionId || resumes.length === 0) return;
        const found = resumes.find(r => r.id === pendingSelectionId);
        if (found) {
            setSelectedResume(found);
            handleSelect(found.id);
            setPendingSelectionId(null);
        }
    }, [pendingSelectionId, resumes]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <PageMeta title="CV Analyser | CVInsight" description="Resume analysis tool" />
            <PageBreadcrumb pageTitle="Resume Analyser" />

            {/* Main Container */}
            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* CV Selector */}
                <CVSelector
                    cvList={resumes}
                    selectedCVs={selectedResume}
                    onSelectCV={cv => {
                        const selected = cv as CVSummary;
                        setSelectedResume(selected);
                        handleSelect(selected.id);
                    }}
                    isLoading={resumesLoading}
                />

                {/* Analysis and PDF Viewer Container */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-280px)] min-h-[600px]">
                    {/* LEFT: ANALYSIS RESULT */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="h-full overflow-y-auto p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                        Analysis Results
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Detailed insights and recommendations
                                    </p>
                                </div>
                            </div>
                            <CvAnalysisResult analysis={analysis} loading={loading} error={error} />
                        </div>
                    </div>

                    {/* RIGHT: PDF VIEWER */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="h-full flex flex-col">
                            {/* PDF Header */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                            CV Preview
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {selectedResume ? selectedResume.fileName : 'No CV selected'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* PDF Content */}
                            <div className="flex-1 bg-gray-100 dark:bg-gray-900/50 relative">
                                {pdfUrl ? (
                                    <iframe
                                        src={pdfUrl}
                                        className="w-full h-full border-none"
                                        title="CV Preview"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm font-medium">No CV selected</p>
                                        <p className="text-xs mt-1 text-gray-400 dark:text-gray-600">
                                            Select a CV from the list above to preview it
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
