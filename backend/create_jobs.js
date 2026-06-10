require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createJobs() {
  const recruiterId = '89c620e5-8ccb-4da0-845c-cde6b6c34fd1';
  
  const jobs = [
    {
      recruiter_id: recruiterId,
      title: 'Senior Frontend Engineer',
      company_name: 'TechFlow Solutions',
      description: 'We are looking for an experienced Frontend Engineer to lead our React Native mobile app development.',
      requirements: ['3+ years experience with React/React Native', 'Strong TypeScript skills', 'Experience with state management'],
      skills: ['React Native', 'TypeScript', 'Redux', 'Expo'],
      job_type: 'Full-time',
      experience_level: 'Senior',
      salary_min: 12,
      salary_max: 16,
      location: 'San Francisco, CA',
      is_remote: true,
      apply_link: 'https://example.com/apply',
      status: 'published',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      recruiter_id: recruiterId,
      title: 'Backend Node.js Developer',
      company_name: 'TechFlow Solutions',
      description: 'Join our backend team to build scalable microservices using Node.js and PostgreSQL.',
      requirements: ['Experience with Express/NestJS', 'Strong SQL knowledge', 'Understanding of REST APIs'],
      skills: ['Node.js', 'PostgreSQL', 'Express', 'Docker'],
      job_type: 'Full-time',
      experience_level: 'Mid-Level',
      salary_min: 90,
      salary_max: 13,
      location: 'New York, NY',
      is_remote: true,
      apply_link: 'https://example.com/apply',
      status: 'pending',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      recruiter_id: recruiterId,
      title: 'UX/UI Designer',
      company_name: 'Creative Minds',
      description: 'Design beautiful and intuitive user interfaces for our next generation of products.',
      requirements: ['Portfolio demonstrating web/mobile design', 'Proficiency in Figma', 'Understanding of user-centered design'],
      skills: ['Figma', 'UI Design', 'Wireframing', 'Prototyping'],
      job_type: 'Full-time',
      experience_level: 'Mid-Level',
      salary_min: 70,
      salary_max: 95,
      location: 'Austin, TX',
      is_remote: false,
      apply_link: 'https://example.com/apply',
      status: 'published',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      recruiter_id: recruiterId,
      title: 'Junior Data Analyst',
      company_name: 'DataCorp',
      description: 'Great opportunity for a recent graduate to start their career in data analytics.',
      requirements: ['Bachelor degree in related field', 'Basic Python and SQL knowledge', 'Strong analytical mindset'],
      skills: ['Python', 'SQL', 'Excel', 'Data Visualization'],
      job_type: 'Full-time',
      experience_level: 'Entry-Level',
      salary_min: 55,
      salary_max: 70,
      location: 'Chicago, IL',
      is_remote: true,
      apply_link: 'https://example.com/apply',
      status: 'published',
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      recruiter_id: recruiterId,
      title: 'DevOps Engineer',
      company_name: 'CloudScale Inc',
      description: 'Help us maintain and scale our cloud infrastructure on AWS.',
      requirements: ['Experience with AWS', 'Knowledge of CI/CD pipelines', 'Proficiency in infrastructure as code (Terraform)'],
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
      job_type: 'Full-time',
      experience_level: 'Mid-Level',
      salary_min: 11,
      salary_max: 14,
      location: 'Seattle, WA',
      is_remote: true,
      apply_link: 'https://example.com/apply',
      status: 'pending',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const { data, error } = await supabase.from('jobs').insert(jobs).select();
  
  if (error) {
    console.error('Error inserting jobs:', error);
  } else {
    console.log(`Successfully created ${data.length} jobs!`);
  }
}

createJobs();
