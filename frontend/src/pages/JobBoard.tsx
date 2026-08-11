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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const searchJobs = async (remoteFilter?: boolean, page: number = 1) => {
    setIsLoading(true);
    try {
      const useRemoteFilter = remoteFilter !== undefined ? remoteFilter : isRemote;
      
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (useRemoteFilter) params.append('isRemote', 'true');
      params.append('page', page.toString());
      params.append('limit', '20');
      
      const response = await api.get(`/jobs/search?${params.toString()}`);
      
      setJobs(response.data.jobs);
      setCurrentPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.totalPages);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    searchJobs(isRemote, 1);
  };

  const handleRemoteChange = (checked: boolean) => {
    setIsRemote(checked);
    searchJobs(checked, 1);
  };

  const handlePageChange = (page: number) => {
    searchJobs(isRemote, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await api.post('/applications', { jobId, status: 'SAVED' });
    },
    onSuccess: () => toast.success('Job saved to applications'),
    onError: () => toast.error('Failed to save job')
  });

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 rounded border"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="px-2">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 rounded border ${
            i === currentPage ? 'bg-blue-500 text-white' : ''
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="px-2">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 rounded border"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    );

    return <div className="flex gap-2 justify-center mt-6">{pages}</div>;
  };

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
        {total > 0 && (
          <p className="text-sm text-gray-600 mt-3">
            Showing {jobs.length} of {total} jobs (Page {currentPage} of {totalPages})
          </p>
        )}
      </div>

      {isLoading ? (
        <p>Loading jobs...</p>
      ) : jobs && jobs.length > 0 ? (
        <>
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
          {renderPagination()}
        </>
      ) : (
        <div className="card text-center py-8">
          <p className="text-gray-600">No jobs found. Try adding jobs through the Admin Panel or adjust your search filters.</p>
        </div>
      )}
    </div>
  );
}
