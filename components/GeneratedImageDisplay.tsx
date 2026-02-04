import React from 'react';

interface GeneratedImageDisplayProps {
  imageUrl: string;
  onDownload: () => void;
  onClose: () => void;
}

const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({ imageUrl, onDownload, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-xl overflow-hidden max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-amber-50">
          <h3 className="text-lg font-bold text-red-800">Your Festive Couplet</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-red-100 rounded-full text-red-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Area */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
          <img 
            src={imageUrl} 
            alt="Generated Chinese New Year Couplet" 
            className="max-w-full h-auto rounded shadow-lg object-contain max-h-[60vh]"
          />
        </div>

        {/* Footer / Actions */}
        <div className="p-6 border-t bg-white flex flex-col sm:flex-row gap-4 justify-end">
           <button
            onClick={onClose}
             className="px-6 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
           >
             Close
           </button>
          <button
            onClick={onDownload}
            className="flex-1 sm:flex-none px-8 py-3 bg-red-600 text-white rounded-lg font-bold shadow-lg hover:bg-red-500 hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedImageDisplay;
