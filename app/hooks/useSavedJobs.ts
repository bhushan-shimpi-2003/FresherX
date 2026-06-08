import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useJobsStore } from '../store/jobs.store';

export function useSavedJobs() {
  const { user } = useAuthStore();
  const { savedJobs, isSavedLoading, fetchSavedJobs, unsaveJob } = useJobsStore();

  useEffect(() => {
    if (user) fetchSavedJobs(user.id);
  }, [user]);

  const removeSaved = (jobId: string) => {
    if (user) unsaveJob(jobId, user.id);
  };

  return { savedJobs, isLoading: isSavedLoading, removeSaved };
}
