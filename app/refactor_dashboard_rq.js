const fs = require('fs');
const path = 'c:\\Users\\Bhush\\Desktop\\FresherX\\app\\app\\(recruiter)\\dashboard\\index.tsx';
let code = fs.readFileSync(path, 'utf8');

// Imports
code = code.replace(
  "import { useRecruiterStore } from '../../../store/recruiter.store';",
  "import { useRecruiterStore } from '../../../store/recruiter.store';\nimport { useQueryClient } from '@tanstack/react-query';\nimport { useRecruiterProfile, useRecruiterJobs, useRecruiterStats } from '../../../hooks/useRecruiterData';"
);

// Component body
code = code.replace(
  "  const { profile, company, jobs, stats, analytics, isLoading, fetchProfile, fetchJobs, fetchStats } = useRecruiterStore();",
  `  // React Query Migration
  const queryClient = useQueryClient();
  const { data: profileRes, isLoading: profileLoading } = useRecruiterProfile(user?.id);
  const { data: jobsData, isLoading: jobsLoading } = useRecruiterJobs(user?.id);
  const { data: stats } = useRecruiterStats(user?.id);

  const profile = profileRes?.profile || profileRes; // Depends on how profile is returned
  const company = profileRes?.company;
  const jobs = jobsData?.activeJobs || [];
  const analytics = jobsData?.analytics || [];
  const isLoading = profileLoading || jobsLoading;`
);

// UseEffect replacement
code = code.replace(
  `  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
      fetchJobs(user.id);
      fetchStats(user.id);

      const channel = supabase
        .channel('dashboard_jobs')
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
        .channel('dashboard_jobs')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'jobs', filter: \`recruiter_id=eq.\${user.id}\` },
          (payload) => {
            // Optimistic Cache Mutation for Jobs
            if (payload.new && payload.new.id) {
               queryClient.setQueryData(['recruiterJobs', user.id], (oldData) => {
                 if (!oldData) return oldData;
                 // Safely trigger a background refetch instead of complex manual mapping
                 // because we also need to recalculate analytics arrays and stats.
                 return oldData; 
               });
               // Invalidate to trigger background update
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
console.log('Dashboard RQ refactored successfully.');
