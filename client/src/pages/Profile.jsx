import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Avatar, { AVATARS } from '../components/Avatar';
import PointsBadge from '../components/PointsBadge';
import { FiLogOut, FiCopy } from 'react-icons/fi';
import { useState } from 'react';

export default function Profile() {
  const { user, household, logout, isParent } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const copyJoinCode = () => {
    if (household?.joinCode) {
      navigator.clipboard.writeText(household.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Profile Card */}
      <div className="card text-center mb-6 animate-fade-in">
        <div className="flex justify-center mb-4">
          <Avatar avatarUrl={user.avatarUrl} name={user.name} size="lg" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
        <p className="text-gray-400 capitalize mb-4">{user.role}</p>
        <PointsBadge points={user.totalPoints || 0} size="lg" />
      </div>

      {/* Household Info */}
      {household && (
        <div className="card mb-6 animate-slide-up">
          <h2 className="font-bold text-gray-700 mb-3">🏠 {household.name}</h2>

          {isParent && household.joinCode && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Join Code (share with kids)</p>
                <p className="text-2xl font-bold tracking-widest text-primary-600">
                  {household.joinCode}
                </p>
              </div>
              <button
                onClick={copyJoinCode}
                className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                title="Copy join code"
              >
                {copied ? '✅' : <FiCopy size={20} />}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Avatar Selection */}
      <div className="card mb-6 animate-slide-up">
        <h2 className="font-bold text-gray-700 mb-3">🎨 Your Avatar</h2>
        <div className="grid grid-cols-6 gap-2">
          {AVATARS.map((a) => (
            <button
              key={a.id}
              className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all
                ${user.avatarUrl === a.id
                  ? 'bg-primary-100 ring-2 ring-primary-500 scale-110'
                  : 'bg-gray-100 hover:bg-gray-200'
                }`}
            >
              {a.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        <FiLogOut /> Log Out
      </button>
    </div>
  );
}
