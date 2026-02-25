import { useAuth } from '../context/AuthContext';
import PointsBadge from './PointsBadge';
import Avatar from './Avatar';

export default function Header() {
  const { user, household } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40 
                        md:top-16">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar avatarUrl={user.avatarUrl} name={user.name} size="sm" />
          <div>
            <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
            {household && (
              <p className="text-xs text-gray-400">{household.name}</p>
            )}
          </div>
        </div>
        <PointsBadge points={user.totalPoints || 0} />
      </div>
    </header>
  );
}
