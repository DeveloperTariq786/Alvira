import Image from 'next/image';

const LoadingState = ({ height = "85vh", message = "Loading...", size = "full", type = "page" }) => {
  if (type === "button") {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-[#c5a87f] rounded-full"></div>
        {message && <span className="text-sm">{message}</span>}
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