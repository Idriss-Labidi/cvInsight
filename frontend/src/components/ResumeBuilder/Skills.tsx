import React, { useState } from "react";
import { useResume } from "../../context/ResumeContext.tsx";
import { v4 as uuidv4 } from "uuid";

const Skills: React.FC = () => {
    const { skills, setSkills, softSkills, setSoftSkills, interests, setInterests } = useResume();
    const [skill, setSkill] = useState("");
    const [softSkill, setSoftSkill] = useState("");
    const [interest, setInterest] = useState("");

    const handleSubmit = (e: React.FormEvent, type: 'skill' | 'softSkill' | 'interest') => {
        e.preventDefault();
        if (type === 'skill') {
            if (!skill.trim()) return;
            setSkills([...skills, { id: uuidv4(), name: skill }]);
            setSkill("");
        } else if (type === 'softSkill') {
            if (!softSkill.trim()) return;
            setSoftSkills([...softSkills, { id: uuidv4(), name: softSkill }]);
            setSoftSkill("");
        } else if (type === 'interest') {
            if (!interest.trim()) return;
            setInterests([...interests, { id: uuidv4(), name: interest }]);
            setInterest("");
        }
    };

    const deleteItem = (id: string, type: 'skill' | 'softSkill' | 'interest') => {
        if (type === 'skill') {
            setSkills(skills.filter((s) => s.id !== id));
        } else if (type === 'softSkill') {
            setSoftSkills(softSkills.filter((s) => s.id !== id));
        } else if (type === 'interest') {
            setInterests(interests.filter((s) => s.id !== id));
        }
    };

    const renderTagList = (
        items: { id: string; name: string }[],
        onDelete: (id: string) => void,
        colorClass: string
    ) =>
        items.length > 0 ? (
            items.map((s) => (
                <div
                    key={s.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full ${colorClass}`}
                >
                    <span>{s.name}</span>
                    <button
                        onClick={() => onDelete(s.id)}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${s.name}`}
                        type="button"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))
        ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm italic">No items added yet</p>
        );

    return (
        <div className="space-y-6">
            {/* Technical Skills */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Technical Skills</h3>
                </div>
                <form onSubmit={(e) => handleSubmit(e, "skill")} className="flex gap-2">
                    <input
                        type="text"
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        placeholder="e.g., React, Python, Docker..."
                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                    <button
                        type="submit"
                        className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>

                    </button>
                </form>
                <div className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    {renderTagList(skills, (id) => deleteItem(id, 'skill'), 'bg-blue-600 dark:bg-blue-500 text-white')}
                </div>
            </div>

            {/* Soft Skills */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Soft Skills</h3>
                </div>
                <form onSubmit={(e) => handleSubmit(e, "softSkill")} className="flex gap-2">
                    <input
                        type="text"
                        value={softSkill}
                        onChange={(e) => setSoftSkill(e.target.value)}
                        placeholder="e.g., Communication, Leadership..."
                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
                    />
                    <button
                        type="submit"
                        className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>

                    </button>
                </form>
                <div className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    {renderTagList(softSkills, (id) => deleteItem(id, 'softSkill'), 'bg-green-600 dark:bg-green-500 text-white')}
                </div>
            </div>

            {/* Interests */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Interests & Hobbies</h3>
                </div>
                <form onSubmit={(e) => handleSubmit(e, "interest")} className="flex gap-2">
                    <input
                        type="text"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        placeholder="e.g., Photography, Gaming, Reading..."
                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                    />
                    <button
                        type="submit"
                        className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>

                    </button>
                </form>
                <div className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    {renderTagList(interests, (id) => deleteItem(id, 'interest'), 'bg-purple-600 dark:bg-purple-500 text-white')}
                </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-medium mb-1">Tips for adding skills:</p>
                        <ul className="space-y-1 text-xs">
                            <li>• Add skills relevant to your target job position</li>
                            <li>• Include both hard and soft skills for balance</li>
                            <li>• Be specific (e.g., "React.js" instead of just "Frontend")</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Skills;