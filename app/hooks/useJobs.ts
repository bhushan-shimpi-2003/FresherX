import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useJobsStore } from '../store/jobs.store';

export function useJobs() {
  const { user } = useAuthStore();
  const {
    jobs, isLoading, isLoadingMore, hasMore, filters, error,
    fetchJobs, fetchMoreJobs, fetchJobById, saveJob, unsaveJob,
    setFilters, clearFilters,
  } = useJobsStore();

  // Initial load
  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSaveToggle = useCallback((jobId: string, isSaved: boolean) => {
    if (!user) return;
    if (isSaved) unsaveJob(jobId, user.id);
    else saveJob(jobId, user.id);
  }, [user]);

  return {
    jobs,
    isLoading,
    isLoadingMore,
    hasMore,
    filters,
    error,
    fetchJobs,
    fetchMoreJobs,
    fetchJobById,
    handleSaveToggle,
    setFilters,
    clearFilters,
  };
}
