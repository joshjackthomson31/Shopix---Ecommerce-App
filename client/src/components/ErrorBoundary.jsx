import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              An unexpected error occurred. Please try reloading the page.
            </p>
            {this.state.error && (
              <p className="text-sm text-red-400 mb-6 font-mono bg-red-50 p-3 rounded-lg max-w-md mx-auto">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReload}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
