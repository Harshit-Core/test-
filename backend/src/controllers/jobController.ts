import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { Job } from '../types';
import toast from 'react-hot-toast';

export default function JobBoard() {
  const [keyword, setKeyword] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchJobs = async (remoteFilter?: boolean) => {
    setIsLoading(true);
    try {
      // Use the passed parameter if provided, otherwise use state
      const useRemoteFilter = remoteFilter !== undefined ? remoteFilter : isRemote;
      
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (useRemoteFilter) params.append('isRemote', 'true');
      
      console.log('Fetching with isRemote:', useRemoteFilter, 'params:', params.toString());
      const response = await api.get(`/jobs/search?${params.toString()}`);
      console.log('Received jobs:', response.data.jobs.length);
      
      // Double-check what we received
      const remoteCount = response.data.jobs.filter((j: Job) => j.isRemote).length;
      const nonRemoteCount = response.data.jobs.length - remoteCount;
      console.log(`Jobs breakdown: ${remoteCount} remote, ${nonRemoteCount} non-remote`);
      
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    console.log('Searching with isRemote:', isRemote);
    searchJobs(isRemote);
  };

  const handleRemoteChange = (checked: boolean) => {
    console.log('Remote checkbox changed to:', checked);
    setIsRemote(checked);
    // Automatically search with the new filter value
    searchJobs(checked);
  };

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await api.post('/applications', { jobId, status: 'SAVED' });
    },
    onSuccess: () => toast.success('Job saved to applications'),
    onError: () => toast.error('Failed to save job')
  });

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Job Board</h1>
      
      <div className="card mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search jobs..."
            className="input flex-1"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isRemote}
              onChange={(e) => handleRemoteChange(e.target.checked)}
            />
            Remote Only
          </label>
          <button onClick={handleSearch} className="btn btn-primary">
            Search
          </button>
        </div>
      </div>

      {isLoading ? (
        <p>Loading jobs...</p>
      ) : jobs && jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job: Job) => (
            <div key={job.id} className="card">
              <h3 className="text-xl font-bold">{job.title}</h3>
              <p className="text-gray-600">{job.company} - {job.location}</p>
              <p className="mt-2">{job.description.substring(0, 200)}...</p>
              <div className="flex gap-2 mt-3">
                {job.isRemote && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Remote</span>}
                {job.isPaid && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">Paid</span>}
              </div>
              <div className="flex gap-3 mt-4">
                <a href={job.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  View Job
                </a>
                <button onClick={() => applyMutation.mutate(job.id)} className="btn btn-secondary">
                  Save to Applications
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-gray-600">No jobs found. Try adding jobs through the Admin Panel or adjust your search filters.</p>
        </div>
      )}
    </div>
  );
}
