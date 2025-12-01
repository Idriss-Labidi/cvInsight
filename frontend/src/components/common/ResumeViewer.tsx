// components/ResumeViewer.tsx
import { useState, useEffect } from 'react';
import { Download, Loader, Maximize2, Minimize2 } from 'lucide-react';
import axiosInstance from "../../utils/axiosInstance.ts";
import { Modal } from "../ui/modal";

interface ResumeViewerProps {
    resume: {
        id: string;
        filename: string;
        fileData: string;
        contentType: string;
    } | null;
    onClose: () => void;
}

export default function ResumeViewer({ resume, onClose }: ResumeViewerProps) {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setPdfUrl(null);
        setError(null);
        setIsLoading(true);

        if (resume) {
            axiosInstance
                .get(`/resume/${resume.id}/file`, {
                    responseType: "blob",
                })
                .then(response => {
                    const blob = new Blob([response.data], { type: response.headers["content-type"] });
                    const url = URL.createObjectURL(blob);
                    setPdfUrl(url);
                    setIsLoading(false);
                })
                .catch((error) => {
                    setError(error.response?.data?.error || "Could not load PDF file.");
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }

        // Cleanup
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [resume]);

    const handleDownload = () => {
        if (pdfUrl && resume) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = resume.filename || 'resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <Modal
            isOpen={!!resume}
            onClose={onClose}
            className={`${isFullscreen ? '' : 'max-w-6xl m-4'}`}
            showCloseButton={false}
            isFullscreen={isFullscreen}
        >
            <div className={`${isFullscreen ? 'w-full h-screen' : 'w-full'} flex flex-col bg-white dark:bg-gray-800 ${!isFullscreen && 'rounded-3xl'} overflow-hidden`}>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {resume?.filename.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {resume?.filename}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Resume Preview
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={!pdfUrl}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Download PDF"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            title="Close (ESC)"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Body - PDF Viewer */}
                <div className={`${isFullscreen ? 'h-[calc(100vh-73px)]' : 'h-[600px]'} bg-gray-100 dark:bg-gray-900/50 relative overflow-hidden`}>
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                            <Loader className="w-12 h-12 mb-4 animate-spin text-blue-600" />
                            <p className="text-sm font-medium">Loading PDF...</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Please wait</p>
                        </div>
                    ) : error ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                            <div className="w-20 h-20 mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Failed to load PDF</p>
                            <p className="text-xs mt-1 text-gray-400 dark:text-gray-600 max-w-md text-center px-4">
                                {error || "The file may be corrupted or in an unsupported format"}
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    ) : pdfUrl ? (
                        <iframe
                            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                            className="w-full h-full border-none"
                            title="CV Preview"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm font-medium">No PDF available</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
