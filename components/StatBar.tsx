
import React from 'react';

interface StatBarProps {
  label: string;
  value: number;
  color: string;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, color }) => {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1 uppercase tracking-wider text-slate-400 font-semibold">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default StatBar;
