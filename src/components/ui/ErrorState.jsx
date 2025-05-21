const ErrorState = ({ message = "Something went wrong. Please try again later.", retryFn = null }) => {
  return (
    <div className="h-[85vh] flex flex-col items-center justify-center bg-gray-100">
      <div className="text-xl text-red-600 mb-4">{message}</div>
      {retryFn && (
        <button 
          onClick={retryFn}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState; 