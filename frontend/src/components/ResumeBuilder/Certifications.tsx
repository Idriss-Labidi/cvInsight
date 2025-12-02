import React from "react";
import { useResume } from "../../context/ResumeContext.tsx";
import { v4 as uuidv4 } from "uuid";

const Certifications: React.FC = () => {
    const { certificates, setCertificates } = useResume();

    const addCertification = () => {
        setCertificates([
            ...certificates,
            {id:uuidv4(), title: "", issuer: "", year: "" },
        ]);
    };

    const handleCertificationChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const { name, value } = e.target;
        setCertificates(
            certificates.map((certificate) =>
                certificate.id === id ? { ...certificate, [name]: value } : certificate
            )
        );
    };


    const deleteCertification = (index: number) => {
        const updatedCertificates = certificates.filter((_, i) => i !== index);
        setCertificates(updatedCertificates);
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            {certificates.map((certificate, index) => (
                <div key={index} className="group border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-900 dark:border-gray-700">
                    <header className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
                        <h3 className="font-semibold text-blue-600 text-lg">{certificate.title || "Certificate"}</h3>
                        <button
                            onClick={() => deleteCertification(index)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </header>
                    <section className="p-6 space-y-6">
                        <div className="flex flex-col gap-6">
                            <div>
                                <label htmlFor={`title-${certificate.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Certificate Title</label>
                                <input
                                    id={`title-${certificate.id}`}
                                    name="title"
                                    value={certificate.title}
                                    onChange={(e) => handleCertificationChange(e, certificate.id)}
                                    className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor={`issuer-${certificate.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Issuer</label>
                                    <input
                                        id={`issuer-${certificate.id}`}
                                        name="issuer"
                                        value={certificate.issuer}
                                        onChange={(e) => handleCertificationChange(e, certificate.id)}
                                        className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                </div>

                                <div>
                                    <label htmlFor={`year-${certificate.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Year</label>
                                    <input
                                        id={`year-${certificate.id}`}
                                        name="year"
                                        type="number"
                                        value={certificate.year}
                                        onChange={(e) => handleCertificationChange(e, certificate.id)}
                                        className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            ))}

            {certificates.length < 5 && (
                <button
                    onClick={addCertification}
                    type="button"
                    className="block w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition"
                >
                    + Add Certification
                </button>
            )}
        </div>
    );
};

export default Certifications;
