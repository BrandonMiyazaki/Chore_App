import { useState, useEffect } from 'react';
import { leaderboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import PointsBadge from '../components/PointsBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leaderboardApi.get();
      setRankings(res.data);
    } catch {
      setError('Could not load the leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) return <LoadingSpinner message="Loading leaderboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchLeaderboard} />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">Leaderboard 🏆</h1>
      <p className="text-gray-400 text-center mb-8">Who&apos;s learning the most?</p>

      {rankings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🏅</div>
          <p className="text-gray-400 text-lg">No scores yet. Start learning!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rankings.map((entry, index) => {
            const isCurrentUser = entry.id === user?.id;
            return (
              <div
                key={entry.id}
                className={`card flex items-center gap-4 animate-slide-up
                  ${isCurrentUser ? 'ring-2 ring-primary-400 bg-primary-50' : ''}
                  ${index < 3 ? 'shadow-lg' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Rank */}
                <div className="w-10 text-center flex-shrink-0">
                  {index < 3 ? (
                    <span className="text-3xl">{MEDALS[index]}</span>
                  ) : (
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  )}
                </div>

                {/* Avatar + Name */}
                <Avatar avatarUrl={entry.avatarUrl} name={entry.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold truncate ${isCurrentUser ? 'text-primary-700' : 'text-gray-800'}`}>
                    {entry.name} {isCurrentUser && '(You)'}
                  </h3>
                  <p className="text-xs text-gray-400 capitalize">{entry.role}</p>
                </div>

                {/* Points */}
                <PointsBadge points={entry.totalPoints || 0} size="sm" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
