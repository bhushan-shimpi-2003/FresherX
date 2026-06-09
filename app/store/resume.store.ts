import { create } from 'zustand';

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  year: string;
  score: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  description: string;
  link: string;
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  skills: string; // comma separated
  hobbies: string; // comma separated
  education: ResumeEducation[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
}

interface ResumeStore {
  data: ResumeData;
  updateData: (updates: Partial<ResumeData>) => void;
  addEducation: (edu: ResumeEducation) => void;
  removeEducation: (id: string) => void;
  addExperience: (exp: ResumeExperience) => void;
  removeExperience: (id: string) => void;
  addProject: (proj: ResumeProject) => void;
  removeProject: (id: string) => void;
  addCertification: (cert: ResumeCertification) => void;
  removeCertification: (id: string) => void;
  reset: () => void;
}

const defaultData: ResumeData = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  portfolio: '',
  summary: '',
  skills: '',
  hobbies: '',
  education: [],
  experience: [],
  projects: [],
  certifications: [],
};

export const useResumeStore = create<ResumeStore>((set) => ({
  data: defaultData,
  updateData: (updates) => set((state) => ({ data: { ...state.data, ...updates } })),
  addEducation: (edu) => set((state) => ({ data: { ...state.data, education: [...state.data.education, edu] } })),
  removeEducation: (id) => set((state) => ({ data: { ...state.data, education: state.data.education.filter(e => e.id !== id) } })),
  addExperience: (exp) => set((state) => ({ data: { ...state.data, experience: [...state.data.experience, exp] } })),
  removeExperience: (id) => set((state) => ({ data: { ...state.data, experience: state.data.experience.filter(e => e.id !== id) } })),
  addProject: (proj) => set((state) => ({ data: { ...state.data, projects: [...state.data.projects, proj] } })),
  removeProject: (id) => set((state) => ({ data: { ...state.data, projects: state.data.projects.filter(p => p.id !== id) } })),
  addCertification: (cert) => set((state) => ({ data: { ...state.data, certifications: [...state.data.certifications, cert] } })),
  removeCertification: (id) => set((state) => ({ data: { ...state.data, certifications: state.data.certifications.filter(c => c.id !== id) } })),
  reset: () => set({ data: defaultData }),
}));
