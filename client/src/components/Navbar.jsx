import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiBook, FiAward, FiUser, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const kidLinks = [
  { to: '/lessons', icon: FiHome, label: 'Lessons' },
  { to: '/my-lessons', icon: FiBook, label: 'My Lessons' },
  { to: '/leaderboard', icon: FiAward, label: 'Board' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
];

const parentLinks = [
  { to: '/lessons', icon: FiHome, label: 'Lessons' },
  { to: '/leaderboard', icon: FiAward, label: 'Board' },
  { to: '/parent', icon: FiSettings, label: 'Manage' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
];

export default function Navbar() {
  const { user, isParent } = useAuth();
  const location = useLocation();

  if (!user || location.pathname === '/' || location.pathname === '/setup') {
    return null;
  }

  const links = isParent ? parentLinks : kidLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 
                     md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 min-w-[60px]
              ${isActive
                ? 'text-primary-600 bg-primary-50 scale-105'
                : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <Icon size={22} />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
