import React from "react";
import { useResume } from "./ResumeContext";
import { v4 as uuidv4 } from "uuid";

const Languages: React.FC = () => {
    const { languages, setLanguages } = useResume();

    const addLanguage = () => {
        setLanguages([
            ...languages,
            {id:uuidv4(), name: "", level: "" },
        ]);
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const { name, value } = e.target;
        setLanguages(
            languages.map((language) =>
                language.id === id ? { ...language, [name]: value } : language
            )
        );
    };


    const deleteLanguage = (id: string) => {
        const updatedLanguages = languages.filter((lang:any) => lang.id !== id);
        setLanguages(updatedLanguages);
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            {languages.map((language:any, index:any) => (
                <div key={language.id ||index} className="group border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-900 dark:border-gray-700">
                    <header className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
                        <h3 className="font-semibold text-blue-600 text-lg">{language.name || "Language"}</h3>
                        <button
                            onClick={() => deleteLanguage(language.id)}
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
                                <label htmlFor={`name-${index}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Language</label>
                                <input
                                    id={`name-${index}`}
                                    name="name"
                                    value={language.name}
                                    onChange={(e) => handleLanguageChange(e, language.id)}
                                    className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label htmlFor={`level-${index}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Proficiency Level</label>
                                <input
                                    id={`level-${index}`}
                                    name="level"
                                    value={language.level}
                                    onChange={(e) => handleLanguageChange(e, language.id)}
                                    className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            ))}

            {languages.length < 5 && (
                <button
                    onClick={addLanguage}
                    type="button"
                    className="block w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition"
                >
                    + Add Language
                </button>
            )}
        </div>
    );
};

export default Languages;
