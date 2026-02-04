import React from 'react';

interface ProgressBarProps {
  progress: number;
  text: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, text }) => {
  return (
    <div className="max-w-2xl mx-auto my-10 text-center">
      <p className="text-lg text-blue-200 mb-3 h-6">{text}</p>
      <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden border border-white/20 backdrop-blur-sm">
        <div
          className="bg-gradient-to-r from-blue-500 to-teal-400 h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
    </div>
  );
};
