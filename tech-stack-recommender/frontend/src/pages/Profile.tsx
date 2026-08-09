import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      
      <div className="card">
        <div className="space-y-4">
          <div>
            <label className="font-semibold">Name:</label>
            <p>{user?.name}</p>
          </div>
          <div>
            <label className="font-semibold">Email:</label>
            <p>{user?.email}</p>
          </div>
          <div>
            <label className="font-semibold">Role:</label>
            <p>{user?.role}</p>
          </div>
          {user?.knownSkills && user.knownSkills.length > 0 && (
            <div>
              <label className="font-semibold">Known Skills:</label>
              <div className="flex gap-2 mt-2">
                {user.knownSkills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-primary-100 text-primary-700 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
