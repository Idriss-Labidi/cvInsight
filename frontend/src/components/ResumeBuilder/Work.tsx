import React from "react";
import { useResume } from "../../context/ResumeContext.tsx";
import { v4 as uuidv4 } from "uuid";

const DeleteIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={size} height={size} aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const Work: React.FC = () => {
    const { workList, setWorkList } = useResume();

    const addMore = () => {
        setWorkList([
            ...workList,
            {
                id: uuidv4(),
                position: "",
                company: "",
                type: "",
                startDate: "",
                endDate: "",
                description: "",
            },
        ]);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
        id: string
    ) => {
        const { name, value } = e.target;
        setWorkList(workList.map((work) => (work.id === id ? { ...work, [name]: value } : work)));
    };

    const deleteWork = (id: string) => {
        setWorkList(workList.filter((work) => work.id !== id));
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            {workList.map((work) => (
                <div key={work.id} className="group border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-900 dark:border-gray-700">
                    <header className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
                        <h3 className="font-semibold text-blue-600 text-lg">{work.position || "Position"}</h3>
                        <button
                            onClick={() => deleteWork(work.id)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                            type="button"
                            aria-label={`Delete work experience: ${work.position || "Untitled"}`}
                        >
                            <DeleteIcon />
                        </button>
                    </header>
                    <section className="p-6 space-y-6">
                        <div className="flex flex-col gap-6">
                            <div>
                                <label htmlFor={`position-${work.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Position</label>
                                <input
                                    id={`position-${work.id}`}
                                    name="position"
                                    placeholder="Position"
                                    value={work.position}
                                    onChange={(e) => handleChange(e, work.id)}
                                    className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor={`company-${work.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Company</label>
                                    <input
                                        id={`company-${work.id}`}
                                        name="company"
                                        placeholder="Company"
                                        value={work.company}
                                        onChange={(e) => handleChange(e, work.id)}
                                        className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                </div>

                                <div>
                                    <label htmlFor={`type-${work.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Employment Type</label>
                                    <select
                                        id={`type-${work.id}`}
                                        name="type"
                                        value={work.type}
                                        onChange={(e) => handleChange(e, work.id)}
                                        className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Freelance">Freelance</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor={`startDate-${work.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Start Date</label>
                                    <input
                                        type="month"
                                        id={`startDate-${work.id}`}
                                        name="startDate"
                                        value={work.startDate}
                                        onChange={(e) => handleChange(e, work.id)}
                                        className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`endDate-${work.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">End Date</label>
                                    <input
                                        type="month"
                                        id={`endDate-${work.id}`}
                                        name="endDate"
                                        value={work.endDate}
                                        onChange={(e) => handleChange(e, work.id)}
                                        className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor={`description-${work.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    id={`description-${work.id}`}
                                    name="description"
                                    rows={4}
                                    value={work.description}
                                    onChange={(e) => handleChange(e, work.id)}
                                    placeholder="Describe your responsibilities..."
                                    className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            ))}

            {workList.length < 5 && (
                <button
                    onClick={addMore}
                    type="button"
                    className="block w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition"
                >
                    + Add Experience
                </button>
            )}
        </div>
    );
};

export default Work;
