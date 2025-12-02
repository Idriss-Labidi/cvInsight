import {useState} from "react";
import axiosInstance from "../utils/axiosInstance.ts";
import Button from "./ui/button/Button.tsx";


type Props = {
    file: File | null;
    onSuccess: (data: any) => void;
    onError: (message: string) => void;
};

export default function CvUploader({file, onSuccess, onError}: Props) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await axiosInstance.post("/resume/upload-and-process", formData, {
                timeout: 0,
                headers: { "Content-Type": "multipart/form-data" },
            });

            onSuccess(response.data);
        } catch (err: any) {
            onError(err?.response?.data?.error || "Unexpected error occurred during upload.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <div className="my-3">
                <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="upload-btn"
                >
                    {uploading ? "Uploading..." : "Upload and Process"}
                </Button>
            </div>

            {uploading && (
                <div className="mt-6 flex justify-center">
                    <div className="flex flex-col items-center space-y-3 animate-pulse">
                        <div className="h-10 w-10 rounded-full border-4 border-t-transparent border-blue-500 animate-spin"></div>
                        <p className="text-blue-600 font-medium">Processing your resume...</p>
                    </div>
                </div>
            )}
        </>
    );
}