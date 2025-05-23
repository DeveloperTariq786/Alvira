import Image from 'next/image';

const LoadingState = ({ height = "85vh", message = "Loading...", size = "full", type = "page" }) => {  if (type === "button") {
    return (
      <div className="flex items-center justify-center space-x-2 py-1">
        <div className="relative">
          <div className="animate-spin h-5 w-5 border-3 border-t-transparent border-white rounded-full"></div>
          <div className="absolute inset-0 animate-ping opacity-30 h-5 w-5 border-3 border-white rounded-full"></div>
        </div>
        {message && <span className="text-sm font-medium">{message}</span>}
      </div>
    );
  }

  return (
    <div style={{ height }} className={`flex items-center justify-center ${size === "full" ? "bg-gray-50" : ""}`}>
      <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6 relative w-24 h-24">
          <Image 
            src="/logo.jpg" 
            alt="Alvira Logo" 
            width={96} 
            height={96}
            className="rounded-full"
          />
          <div className="absolute inset-0 rounded-full border-2 border-[#c5a87f] border-t-transparent animate-spin"></div>
        </div>
        <div className="text-xl font-medium text-[#1e2832] mb-2">{message}</div>
        <div className="text-sm text-gray-500">Please wait while we prepare your experience</div>
        
        <div className="mt-4 w-full max-w-[200px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#c5a87f] rounded-full animate-pulse" style={{ width: '75%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState; 