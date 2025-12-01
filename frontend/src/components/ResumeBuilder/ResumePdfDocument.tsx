import React from "react";
import { About, Education, Work, Skill, Project, Language, Certificate, SocialActivity } from "./ResumeContext";
import Template1 from "./templates/Template1.tsx";
import Template3 from "./templates/Template3.tsx";
import Template4 from "./templates/Template4.tsx";
import Template2 from "./templates/Template2.tsx";

export interface ResumePdfProps {
  about: About;
  educationList: Education[];
  workList: Work[];
  skills: Skill[];
  softSkills: Skill[];
  interests: Skill[];
  projects: Project[];
  languages: Language[];
  certificates: Certificate[];
  socialActivities: SocialActivity[];
  templateId?: string;
}

const ResumePdfDocument: React.FC<ResumePdfProps> = (props) => {
  const templateId = props.templateId ?? 'classic-blue';

  switch (templateId) {
    case 'temp-3':
      return <Template3 {...props} />;
    case 'temp-4':
      return <Template4 {...props} />;
    case 'temp-2':
      return <Template2 {...props} />;
    case 'temp-1':
    default:
      return <Template1 {...props} />;
  }
};

export default ResumePdfDocument;
