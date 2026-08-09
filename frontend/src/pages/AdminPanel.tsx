import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const queryClient = useQueryClient();
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    externalUrl: '',
    isPaid: true,
    isRemote: false
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: typeof jobForm) => {
      const response = await api.post('/admin/jobs', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Job created');
      setJobForm({
        title: '',
        company: '',
        description: '',
        location: '',
        externalUrl: '',
        isPaid: true,
        isRemote: false
      });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: any) => {
      console.error('Job creation error:', error);
      const message = error.response?.data?.error || 'Failed to create job';
      toast.error(message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createJobMutation.mutate(jobForm);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Add Manual Job Listing</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Job Title"
            value={jobForm.title}
            onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
            className="input"
            required
          />
          <input
            type="text"
            placeholder="Company"
            value={jobForm.company}
            onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
            className="input"
            required
          />
          <textarea
            placeholder="Description"
            value={jobForm.description}
            onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
            className="input resize-none h-32"
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={jobForm.location}
            onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
            className="input"
            required
          />
          <input
            type="url"
            placeholder="External URL"
            value={jobForm.externalUrl}
            onChange={(e) => setJobForm({ ...jobForm, externalUrl: e.target.value })}
            className="input"
            required
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={jobForm.isPaid}
                onChange={(e) => setJobForm({ ...jobForm, isPaid: e.target.checked })}
              />
              Paid Position
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={jobForm.isRemote}
                onChange={(e) => setJobForm({ ...jobForm, isRemote: e.target.checked })}
              />
              Remote
            </label>
          </div>
          <button type="submit" className="btn btn-primary">
            Add Job
          </button>
        </form>
      </div>
    </div>
  );
}
