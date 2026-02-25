import { FiStar } from 'react-icons/fi';

export default function PointsBadge({ points, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-sm px-2 py-0.5 gap-1',
    md: 'text-base px-3 py-1 gap-1.5',
    lg: 'text-xl px-4 py-2 gap-2',
  };

  return (
    <div
      className={`inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 
                  text-white font-bold rounded-full shadow-md ${sizeClasses[size]}`}
    >
      <FiStar className="fill-white" />
      <span>{points.toLocaleString()}</span>
    </div>
  );
}
