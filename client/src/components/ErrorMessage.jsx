import { FiAlertCircle } from 'react-icons/fi';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 text-center px-4">
      <FiAlertCircle className="text-kid-red" size={48} />
      <p className="text-gray-600 font-medium text-lg">{message || 'Something went wrong!'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Try Again
        </button>
      )}
    </div>
  );
}
