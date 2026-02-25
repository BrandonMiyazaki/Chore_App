import { useState, useEffect } from 'react';
import { completedLessonsApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const STATUS_BADGES = {
  pending: { label: '⏳ Pending', className: 'bg-yellow-100 text-yellow-700' },
  approved: { label: '✅ Approved', className: 'bg-green-100 text-green-700' },
  rejected: { label: '❌ Rejected', className: 'bg-red-100 text-red-700' },
};

export default function MyLessons() {
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'

  const fetchCompleted = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await completedLessonsApi.list();
      setCompletedLessons(res.data);
    } catch {
      setError('Could not load your lessons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompleted();
  }, []);

  const filtered =
    filter === 'all'
      ? completedLessons
      : completedLessons.filter((cl) => cl.status === filter);

  if (loading) return <LoadingSpinner message="Loading your lessons..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCompleted} />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">My Lessons 📋</h1>
      <p className="text-gray-400 text-center mb-6">Your learning history</p>

      {/* Filter Tabs */}
      <div className="flex gap-2 justify-center mb-6">
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-medium text-sm capitalize transition-all
              ${filter === f
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Lessons List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-400 text-lg">
            {filter === 'all' ? "You haven't completed any lessons yet!" : `No ${filter} lessons.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cl) => {
            const badge = STATUS_BADGES[cl.status] || STATUS_BADGES.pending;
            return (
              <div
                key={cl.id}
                className="card flex items-center gap-4 animate-fade-in"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-kid-purple flex items-center justify-center text-2xl flex-shrink-0">
                  {cl.lesson?.icon || '📚'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">
                    {cl.lesson?.title || 'Lesson'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {cl.completedAt
                      ? new Date(cl.completedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })
                      : ''}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                  <span className="text-sm font-bold text-yellow-600">
                    +{cl.pointsAwarded} ⭐
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
