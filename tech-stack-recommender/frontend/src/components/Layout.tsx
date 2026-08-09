import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ? 'bg-primary-700' : '';

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold">
                Tech Stack Recommender
              </Link>
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md ${isActive('/')}`}
                >
                  Recommender
                </Link>
                <Link
                  to="/jobs"
                  className={`px-3 py-2 rounded-md ${isActive('/jobs')}`}
                >
                  Job Board
                </Link>
                <Link
                  to="/applications"
                  className={`px-3 py-2 rounded-md ${isActive('/applications')}`}
                >
                  Applications
                </Link>
                <Link
                  to="/saved"
                  className={`px-3 py-2 rounded-md ${isActive('/saved')}`}
                >
                  Saved Stacks
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md ${isActive('/admin')}`}
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="hover:underline">
                {user?.name}
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
