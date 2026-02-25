import { useState, useEffect } from 'react';
import { lessonsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LessonCard from '../components/LessonCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const TOPICS = ['All', 'Reading', 'Math', 'Science', 'Art', 'Music', 'Geography', 'Writing', 'History', 'Language'];

export default function LessonBoard() {
  const { user, updateUser } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('All');

  const fetchLessons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await lessonsApi.list();
      setLessons(res.data);
    } catch (err) {
      setError('Could not load lessons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleComplete = (lesson) => {
    // Optimistic update of user points
    if (user) {
      updateUser({ ...user, totalPoints: (user.totalPoints || 0) + lesson.points });
    }
  };

  const filteredLessons =
    selectedTopic === 'All'
      ? lessons
      : lessons.filter((l) => l.topic === selectedTopic);

  if (loading) return <LoadingSpinner message="Loading lessons..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchLessons} />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Page Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Pick a Lesson! 🎯</h1>
        <p className="text-gray-400 mt-1">Choose something fun to learn today</p>
      </div>

      {/* Topic Filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
              ${selectedTopic === topic
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'
              }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-400 text-lg">No lessons found for this topic.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
