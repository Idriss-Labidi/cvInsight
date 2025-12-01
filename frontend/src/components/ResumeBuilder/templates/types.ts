import { About, Education, Work, Skill, Project, Language, Certificate, SocialActivity } from "../ResumeContext";

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
}
