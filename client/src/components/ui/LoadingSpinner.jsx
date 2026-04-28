const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const spinner = (
    <div
      className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizes[size]}`}
    />
  );

  if (fullScreen) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
