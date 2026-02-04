import React from 'react';
import { CoupletData } from '../types';

interface CoupletDisplayProps {
  data: CoupletData;
}

const CoupletDisplay: React.FC<CoupletDisplayProps> = ({ data }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-amber-50 rounded-xl shadow-inner border-2 border-amber-200 mt-6 max-w-3xl w-full mx-auto">
      
      {/* Horizontal Scroll (Henpi) */}
      <div className="mb-8 relative group">
        <div className="bg-red-700 text-amber-100 font-serif text-3xl md:text-5xl px-8 py-4 rounded shadow-lg border-2 border-amber-400 tracking-widest relative z-10">
          {data.horizontal}
        </div>
        {/* Decorative knot placeholder */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-500 rotate-45 z-0"></div>
      </div>

      <div className="flex justify-between w-full max-w-2xl px-4 md:px-12 gap-8">
        
        {/* Upper Scroll (Shanglian) - Right side in tradition, but usually displayed Left-Right for web UX unless strict. 
            Traditional: Right is Upper, Left is Lower. 
            Let's stick to visual Left = Upper for modern readability, or label them if needed. 
            Actually, visually, the Upper Scroll is usually placed on the Right side of the door (viewer's right) in strict tradition, 
            but in modern context, Left-to-Right reading order puts Upper on Left. 
            Let's place Upper on the LEFT for intuitive reading order for modern users. */}
            
        {/* Left Pillar (Upper) */}
        <div className="flex flex-col items-center">
          <div className="bg-red-700 text-amber-100 font-serif text-3xl md:text-5xl py-8 px-4 rounded-lg shadow-xl border-2 border-amber-400 writing-vertical-rl tracking-widest min-h-[300px] flex items-center justify-center">
            {data.upper}
          </div>
          <div className="mt-2 text-red-800 font-bold text-sm uppercase tracking-wider">Upper Scroll</div>
        </div>

        {/* Center Decoration (Fu character or Empty space) */}
        <div className="flex-1 flex items-center justify-center opacity-20 pointer-events-none select-none">
          <div className="text-red-600 text-9xl font-serif rotate-45 border-4 border-red-600 p-4 rounded-lg">
            <div className="-rotate-45">福</div>
          </div>
        </div>

        {/* Right Pillar (Lower) */}
        <div className="flex flex-col items-center">
          <div className="bg-red-700 text-amber-100 font-serif text-3xl md:text-5xl py-8 px-4 rounded-lg shadow-xl border-2 border-amber-400 writing-vertical-rl tracking-widest min-h-[300px] flex items-center justify-center">
            {data.lower}
          </div>
          <div className="mt-2 text-red-800 font-bold text-sm uppercase tracking-wider">Lower Scroll</div>
        </div>
      </div>
    </div>
  );
};

export default CoupletDisplay;
