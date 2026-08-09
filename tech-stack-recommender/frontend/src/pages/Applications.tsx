import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Application, ApplicationStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function Applications() {
  const queryClient = useQueryClient();

  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await api.get('/applications');
      return response.data as Application[];
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['application-stats'],
    queryFn: async () => {
      const response = await api.get('/applications/stats');
      return response.data as ApplicationStats;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/applications/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-stats'] });
      toast.success('Status updated');
    }
  });

  const chartData = stats ? [
    { status: 'Saved', count: stats.SAVED || 0 },
    { status: 'Applied', count: stats.APPLIED || 0 },
    { status: 'Interviewing', count: stats.INTERVIEWING || 0 },
    { status: 'Rejected', count: stats.REJECTED || 0 },
    { status: 'Offer', count: stats.OFFER || 0 }
  ] : [];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Application Tracker</h1>

      {stats && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Statistics</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-4">
        {applications?.map((app) => (
          <div key={app.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{app.job.title}</h3>
                <p className="text-gray-600">{app.job.company}</p>
              </div>
              <select
                value={app.status}
                onChange={(e) => updateMutation.mutate({ id: app.id, status: e.target.value })}
                className="border rounded px-3 py-1"
              >
                <option value="SAVED">Saved</option>
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="REJECTED">Rejected</option>
                <option value="OFFER">Offer</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
