import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { StackRecommendation } from '../types';
import toast from 'react-hot-toast';

export default function Recommender() {
  const [projectDescription, setProjectDescription] = useState('');
  const [recommendations, setRecommendations] = useState<StackRecommendation[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const recommendMutation = useMutation({
    mutationFn: async (description: string) => {
      const response = await api.post('/stacks/recommend', {
        projectDescription: description,
        constraints: {}
      });
      return response.data;
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations);
      toast.success('Recommendations generated!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to generate recommendations');
    }
  });

  const saveStackMutation = useMutation({
    mutationFn: async (stackId: string) => {
      await api.post(`/stacks/save/${stackId}`);
    },
    onSuccess: () => {
      toast.success('Stack saved!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to save stack');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectDescription.trim()) {
      toast.error('Please enter a project description');
      return;
    }
    recommendMutation.mutate(projectDescription);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Tech Stack Recommender</h1>
      
      <form onSubmit={handleSubmit} className="card mb-8">
        <label className="block text-lg font-medium mb-2">
          Describe Your Project
        </label>
        <textarea
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          className="input resize-none h-32"
          placeholder="e.g., I'm building a real-time collaborative document editing tool for small teams..."
          required
        />
        <button
          type="submit"
          className="btn btn-primary mt-4"
          disabled={recommendMutation.isPending}
        >
          {recommendMutation.isPending ? 'Generating...' : 'Get Recommendations'}
        </button>
      </form>

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Recommended Stacks</h2>
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.stack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setExpandedId(expandedId === rec.stack.id ? null : rec.stack.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary-700">{rec.stack.name}</h3>
                  <p className="text-gray-600 mt-1">{rec.stack.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-lg font-semibold text-green-600">
                      {(rec.score * 100).toFixed(0)}% Match
                    </span>
                    <div className="flex gap-2">
                      {rec.stack.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    saveStackMutation.mutate(rec.stack.id);
                  }}
                  className="btn btn-secondary ml-4"
                >
                  Save
                </button>
              </div>

              {expandedId === rec.stack.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-4 pt-4 border-t"
                >
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold mb-1">Components</h4>
                      <ul className="list-disc list-inside text-gray-700">
                        {rec.stack.components.map((comp) => (
                          <li key={comp}>{comp}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Details</h4>
                      <p><strong>Team Size:</strong> {rec.stack.teamSize}</p>
                      <p><strong>Budget:</strong> {rec.stack.budget}</p>
                      <p><strong>Learning Curve:</strong> {rec.stack.learningCurve}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Use Case</h4>
                    <p className="text-gray-700">{rec.stack.useCase}</p>
                  </div>
                  {rec.matchedKeywords.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-semibold mb-1">Matched Keywords</h4>
                      <div className="flex gap-2">
                        {rec.matchedKeywords.map((kw) => (
                          <span key={kw} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
