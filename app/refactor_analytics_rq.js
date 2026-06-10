const fs = require('fs');
const path = 'c:\\Users\\Bhush\\Desktop\\FresherX\\app\\app\\(recruiter)\\analytics\\index.tsx';
let code = fs.readFileSync(path, 'utf8');

// Imports
code = code.replace(
  "import { useRecruiterStore } from '../../../store/recruiter.store';",
  "import { useRecruiterStore } from '../../../store/recruiter.store';\nimport { useQueryClient } from '@tanstack/react-query';\nimport { useRecruiterJobs, useRecruiterStats } from '../../../hooks/useRecruiterData';"
);

// Component body
code = code.replace(
  "  const { stats, jobs, fetchStats, fetchJobs } = useRecruiterStore();",
  `  const queryClient = useQueryClient();
  const { data: jobsData } = useRecruiterJobs(user?.id);
  const { data: stats } = useRecruiterStats(user?.id);
  const jobs = jobsData?.activeJobs || [];`
);

// UseEffect replacement
code = code.replace(
  `  useEffect(() => {
    if (user) { 
      fetchStats(user.id); 
      fetchJobs(user.id); 
      
      const channel = supabase
        .channel('analytics_jobs')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'jobs', filter: \`recruiter_id=eq.\${user.id}\` },
          () => {
            fetchJobs(user.id);
            fetchStats(user.id);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);`,
  `  useEffect(() => {
    if (user) { 
      const channel = supabase
        .channel('analytics_jobs')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'jobs', filter: \`recruiter_id=eq.\${user.id}\` },
          (payload) => {
            if (payload.new && payload.new.id) {
               queryClient.invalidateQueries({ queryKey: ['recruiterJobs', user.id] });
               queryClient.invalidateQueries({ queryKey: ['recruiterStats', user.id] });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);`
);

fs.writeFileSync(path, code);
console.log('Analytics RQ refactored successfully.');
