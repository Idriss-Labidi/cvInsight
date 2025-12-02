import React from "react";
import { useResume } from "../../context/ResumeContext.tsx";

const About: React.FC = () => {
    const { about, setAbout } = useResume();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAbout({ ...about, [name]: value });
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 gap-6">
                {[
                    { id: "name", label: "Full Name", type: "text", autoComplete: "name", placeholder: "Full Name", value: about.name },
                    { id: "role", label: "Role", type: "text", placeholder: "Role", value: about.role },
                    { id: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "Email", value: about.email },
                    { id: "phone", label: "Phone", type: "tel", autoComplete: "tel", placeholder: "Phone", value: about.phone },
                    { id: "address", label: "Address", type: "text", autoComplete: "street-address", placeholder: "Address", value: about.address },
                    { id: "linkedin", label: "LinkedIn", type: "url", placeholder: "https://linkedin.com", value: about.linkedin },
                    { id: "github", label: "GitHub", type: "url", placeholder: "https://github.com", value: about.github },
                    { id: "portfolio", label: "Portfolio", type: "url", placeholder: "https://yourportfolio.com", value: about.portfolio },
                ].map(({ id, label, type, autoComplete, placeholder, value }) => (
                    <div key={id} className="flex flex-col gap-2">
                        <label htmlFor={id} className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
                        <input
                            id={id}
                            name={id}
                            type={type}
                            autoComplete={autoComplete}
                            placeholder={placeholder}
                            value={value || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        />
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                <label htmlFor="summary" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Professional Summary</label>
                <textarea
                    id="summary"
                    name="summary"
                    rows={5}
                    placeholder="Write a brief professional summary"
                    value={about.summary || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
            </div>
        </div>
    );
};

export default About;
