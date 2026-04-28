import LoadingSpinner from './LoadingSpinner';

/**
 * Reusable loading wrapper component
 * Shows a centered loading spinner when loading is true
 */
const LoadingWrapper = ({ loading, children, minHeight = '400px' }) => {
  if (loading) {
    return (
      <div 
        className="flex justify-center items-center"
        style={{ minHeight }}
      >
        <LoadingSpinner />
      </div>
    );
  }
  return children;
};

export default LoadingWrapper;
