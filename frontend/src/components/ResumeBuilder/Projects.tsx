import React from "react";
import { useResume } from "../../context/ResumeContext.tsx";
import { v4 as uuidv4 } from "uuid";

const DeleteIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={size} height={size} aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const Projects: React.FC = () => {
    const { projects, setProjects } = useResume();

    const addMore = () => {
        setProjects([
            ...projects,
            {
                id: uuidv4(),
                name: "",
                url: "",
                github: "",
                description: "",
            },
        ]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string) => {
        const { name, value } = e.target;
        setProjects(projects.map((project) => (project.id === id ? { ...project, [name]: value } : project)));
    };

    const deleteProject = (id: string) => {
        setProjects(projects.filter((p) => p.id !== id));
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            {projects.map((project) => (
                <div key={project.id} className="group border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-900 dark:border-gray-700">
                    <header className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
                        <h3 className="font-semibold text-blue-600 text-lg">{project.name || "Project Name"}</h3>
                        <button
                            onClick={() => deleteProject(project.id)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                            type="button"
                            aria-label={`Delete project: ${project.name || "Untitled"}`}
                        >
                            <DeleteIcon />
                        </button>
                    </header>
                    <section className="p-6 space-y-6">
                        <div className="flex flex-col gap-6">
                            <div>
                                <label htmlFor={`name-${project.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Project Name</label>
                                <input
                                    id={`name-${project.id}`}
                                    name="name"
                                    placeholder="Project Name"
                                    value={project.name}
                                    onChange={(e) => handleChange(e, project.id)}
                                    className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor={`url-${project.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Project URL</label>
                                    <input
                                        id={`url-${project.id}`}
                                        name="url"
                                        type="url"
                                        placeholder="https://example.com"
                                        value={project.url}
                                        onChange={(e) => handleChange(e, project.id)}
                                        className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                </div>

                                <div>
                                    <label htmlFor={`github-${project.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">GitHub Repository</label>
                                    <input
                                        id={`github-${project.id}`}
                                        name="github"
                                        type="url"
                                        placeholder="https://github.com/username/repo"
                                        value={project.github}
                                        onChange={(e) => handleChange(e, project.id)}
                                        className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor={`description-${project.id}`} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    id={`description-${project.id}`}
                                    name="description"
                                    rows={4}
                                    placeholder="Describe your project..."
                                    value={project.description}
                                    onChange={(e) => handleChange(e, project.id)}
                                    className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            ))}

            {projects.length < 5 && (
                <button
                    onClick={addMore}
                    type="button"
                    className="block w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition"
                >
                    + Add Project
                </button>
            )}
        </div>
    );
};

export default Projects;
