import { useState } from 'react';
import confetti from 'canvas-confetti';
import { lessonsApi } from '../services/api';

const TOPIC_COLORS = {
  Reading: 'from-blue-400 to-blue-500',
  Math: 'from-purple-400 to-purple-500',
  Science: 'from-green-400 to-green-500',
  Art: 'from-pink-400 to-pink-500',
  Music: 'from-yellow-400 to-yellow-500',
  Geography: 'from-teal-400 to-teal-500',
  Writing: 'from-indigo-400 to-indigo-500',
  History: 'from-amber-400 to-amber-500',
  Language: 'from-rose-400 to-rose-500',
  default: 'from-gray-400 to-gray-500',
};

function getTopicGradient(topic) {
  return TOPIC_COLORS[topic] || TOPIC_COLORS.default;
}

export default function LessonCard({ lesson, onComplete, disabled }) {
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleComplete = async () => {
    if (completing || completed || disabled) return;
    setCompleting(true);
    try {
      await lessonsApi.complete(lesson.id);
      setCompleted(true);

      // Fire confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24'],
      });

      if (onComplete) onComplete(lesson);
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div
      className={`card hover:shadow-xl hover:-translate-y-1 cursor-pointer animate-fade-in
                  ${completed ? 'ring-4 ring-kid-green/50 bg-green-50' : ''}`}
    >
      {/* Icon */}
      <div
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getTopicGradient(lesson.topic)} 
                    flex items-center justify-center text-3xl mx-auto mb-3 shadow-md`}
      >
        {lesson.icon || '📚'}
      </div>

      {/* Title & Topic */}
      <h3 className="font-bold text-gray-800 text-center text-lg mb-1 leading-tight">
        {lesson.title}
      </h3>
      <p className="text-xs text-gray-400 text-center mb-3 uppercase tracking-wide font-medium">
        {lesson.topic}
      </p>

      {/* Points */}
      <div className="flex justify-center mb-3">
        <span className="bg-yellow-100 text-yellow-700 font-bold text-sm px-3 py-1 rounded-full">
          ⭐ {lesson.points} pts
        </span>
      </div>

      {/* Complete Button */}
      {!disabled && (
        <button
          onClick={handleComplete}
          disabled={completing || completed}
          className={`w-full font-bold py-3 rounded-2xl transition-all duration-200 text-lg
                     ${completed
                       ? 'bg-kid-green text-white cursor-default'
                       : 'btn-primary hover:scale-105 active:scale-95'
                     }`}
        >
          {completed ? '✅ Done!' : completing ? '...' : 'GO! 🚀'}
        </button>
      )}
    </div>
  );
}
