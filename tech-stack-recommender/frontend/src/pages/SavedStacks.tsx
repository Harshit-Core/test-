import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { SavedStack } from '../types';

export default function SavedStacks() {
  const { data: savedStacks } = useQuery({
    queryKey: ['saved-stacks'],
    queryFn: async () => {
      const response = await api.get('/stacks/saved');
      return response.data as SavedStack[];
    }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Saved Stacks</h1>
      
      <div className="space-y-4">
        {savedStacks?.map((saved) => (
          <div key={saved.id} className="card">
            <h3 className="text-xl font-bold text-primary-700">{saved.stack.name}</h3>
            <p className="text-gray-600 mt-1">{saved.stack.description}</p>
            <div className="mt-3">
              <h4 className="font-semibold">Components:</h4>
              <p>{saved.stack.components.join(', ')}</p>
            </div>
            {saved.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <h4 className="font-semibold text-sm">Notes:</h4>
                <p className="text-sm">{saved.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
