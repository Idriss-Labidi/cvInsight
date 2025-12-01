import {ResumeTemplate} from "../../../types/resume.types.ts";

export const RESUME_TEMPLATES: ResumeTemplate[] = [
    {
        id: 'temp-1',
        name: 'Classic Blue',
        description: 'Traditional professional layout with blue accents',
        thumbnail: '/templates/classic-blue.png',
        theme: 'blue',
        layout: 'classic',
        isPremium: false
    },

    {
        id: 'temp-2',
        name: 'Classic Lines',
        description: 'Centered name, black separators, uppercase headings; mirrors the provided image',
        thumbnail: '/templates/classic-lines.png',
        theme: 'mono',
        layout: 'classic',
        isPremium: false
    },

    {
        id: 'temp-3',
        name: 'Health Green',
        description: 'Clean healthcare style with green accent headings, dotted rules, and skill tags',
        thumbnail: '/templates/health-green.png',
        theme: 'green',
        layout: 'modern',
        isPremium: false
    },

    {
        id: 'temp-4',
        name: 'Classic Lines',
        description: 'Monochrome, serif headings with subtle top rule and section separators',
        thumbnail: '/templates/classic-lines.png',
        theme: 'mono',
        layout: 'classic',
        isPremium: false
    },

];
