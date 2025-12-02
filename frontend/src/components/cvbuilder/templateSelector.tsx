import React, { useState } from 'react';
import { TemplateLayout } from '../../types/resume.types.ts';
import { RESUME_TEMPLATES } from './templates/resume.templates.ts';

interface TemplateSelectorProps {
    selectedTemplate: string;
    onSelectTemplate: (templateId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onSelectTemplate }) => {
    const [filterLayout, setFilterLayout] = useState<TemplateLayout | 'all'>('all');

    const filteredTemplates = RESUME_TEMPLATES.filter(
        t => filterLayout === 'all' || t.layout === filterLayout
    );

    return (
        <div className="space-y-5 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Choose Template</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{filteredTemplates.length} templates</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-3">
                {['all', 'classic', 'modern', 'minimal', 'creative', 'professional'].map(layout => (
                    <button
                        key={layout}
                        onClick={() => setFilterLayout(layout as TemplateLayout | 'all')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                            filterLayout === layout
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                        type="button"
                    >
                        {layout.charAt(0).toUpperCase() + layout.slice(1)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 gap-6">
                {filteredTemplates.map(template => (
                    <button
                        key={template.id}
                        onClick={() => onSelectTemplate(template.id)}
                        className={`relative group p-3 border-2 rounded-xl transition-all ${
                            selectedTemplate === template.id
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        type="button"
                        aria-pressed={selectedTemplate === template.id}
                    >
                        {template.isPremium && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                                PRO
                            </div>
                        )}

                        <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 overflow-hidden">
                            <img
                                src={template.thumbnail}
                                alt={`${template.name} thumbnail`}
                                className="w-full h-full object-cover"
                                onError={e => {
                                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                                }}
                            />
                        </div>

                        <div className="text-left">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate">{template.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{template.description}</p>
                        </div>

                        {selectedTemplate === template.id && (
                            <div className="absolute top-3 left-3">
                                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
