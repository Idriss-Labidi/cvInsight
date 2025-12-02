import React from "react";
import { useResume } from "../../context/ResumeContext.tsx";
import { v4 as uuidv4 } from "uuid";

const DeleteIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={size} height={size} aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const Education: React.FC = () => {
    const { educationList, setEducationList } = useResume();

    const addMore = () => {
        setEducationList([
            ...educationList,
            {
                id: uuidv4(),
                degree: "",
                school: "",
                startYr: 0,
                endYr: 0,
                grade: "",
            },
        ]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const { name, value } = e.target;
        setEducationList(educationList.map((edu) => (edu.id === id ? { ...edu, [name]: value } : edu)));
    };

    const deleteEducation = (id: string) => {
        setEducationList(educationList.filter((edu) => edu.id !== id));
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            {educationList.map((education) => (
                <div key={education.id} className="group border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-900 dark:border-gray-700">
                    <header className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
                        <h3 className="font-semibold text-blue-600 text-lg">{education.degree || "Degree"}</h3>
                        <button
                            onClick={() => deleteEducation(education.id)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                            type="button"
                            aria-label={`Delete education: ${education.degree || "Untitled"}`}
                        >
                            <DeleteIcon />
                        </button>
                    </header>
                    <section className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label htmlFor={`degree-${education.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Degree</label>
                                <input
                                    id={`degree-${education.id}`}
                                    name="degree"
                                    placeholder="Degree"
                                    value={education.degree}
                                    onChange={(e) => handleChange(e, education.id)}
                                    className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label htmlFor={`school-${education.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">School</label>
                                <input
                                    id={`school-${education.id}`}
                                    name="school"
                                    placeholder="School"
                                    value={education.school}
                                    onChange={(e) => handleChange(e, education.id)}
                                    className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <label htmlFor={`startYr-${education.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Start Year</label>
                                <input
                                    id={`startYr-${education.id}`}
                                    name="startYr"
                                    type="number"
                                    min={1900}
                                    max={2030}
                                    placeholder="2020"
                                    value={education.startYr || ""}
                                    onChange={(e) => handleChange(e, education.id)}
                                    className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label htmlFor={`endYr-${education.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">End Year</label>
                                <input
                                    id={`endYr-${education.id}`}
                                    name="endYr"
                                    type="number"
                                    min={1900}
                                    max={2030}
                                    placeholder="2023"
                                    value={education.endYr || ""}
                                    onChange={(e) => handleChange(e, education.id)}
                                    className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label htmlFor={`grade-${education.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Grade</label>
                                <input
                                    id={`grade-${education.id}`}
                                    name="grade"
                                    placeholder="8.5 CGPA"
                                    value={education.grade}
                                    onChange={(e) => handleChange(e, education.id)}
                                    className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            ))}

            {educationList.length < 3 && (
                <button
                    onClick={addMore}
                    type="button"
                    className="block w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow hover:shadow-lg transition"
                >
                    + Add Education
                </button>
            )}
        </div>
    );
};

export default Education;
