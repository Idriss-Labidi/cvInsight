import { BlobProvider } from "@react-pdf/renderer";
import { useResume } from "./ResumeContext";
import ResumePdfDocument from "./ResumePdfDocument";
import { useEffect, useState, useMemo, forwardRef } from 'react';

const DEBOUNCE_MS = 1000;

const ResumePreview = forwardRef<HTMLDivElement>((_, __) => {
    const resume = useResume();

    const [stableData, setStableData] = useState(resume);

    useEffect(() => {
        const handle = setTimeout(() => setStableData(resume), DEBOUNCE_MS);
        return () => clearTimeout(handle);
    }, [resume]);

    const memoizedDoc = useMemo(() => (
        <ResumePdfDocument
            about={stableData.about}
            educationList={stableData.educationList}
            workList={stableData.workList}
            skills={stableData.skills}
            softSkills={stableData.softSkills}
            interests={stableData.interests}
            projects={stableData.projects}
            languages={stableData.languages}
            certificates={stableData.certificates}
            socialActivities={stableData.socialActivities}
            templateId={stableData.selectedTemplate}
        />
    ), [stableData]);

    const [displayedUrl, setDisplayedUrl] = useState<string | null>(null);

    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden">
            <BlobProvider document={memoizedDoc}>
                {({ url, loading }) => {
                    if (!loading && url && url !== displayedUrl) {
                        setDisplayedUrl(url);
                    }

                    return (
                        <div className="relative w-full bg-white" style={{ height: 900 }}>
                            {displayedUrl && (
                                <iframe
                                    title="Resume Preview"
                                    src={`${displayedUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                    className={`w-full h-full transition-all duration-300
                                        ${loading ? "blur-sm" : "blur-0"}
                                    `}
                                    style={{ border: "none", background: "#fff" }}  // 🔥 force white background
                                />
                            )}

                            {loading && (
                                <div className="
                                    absolute inset-0 flex items-center justify-center
                                    bg-white/40 backdrop-blur-sm animate-fadeIn
                                ">
                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-gray-500"></div>
                                </div>
                            )}

                            {!displayedUrl && (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                                    Generating preview...
                                </div>
                            )}
                        </div>
                    );
                }}
            </BlobProvider>
        </div>
    );
});

export default ResumePreview;

