import React from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  bgColorClass?: string; // Optional Tailwind background color class
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, bgColorClass = 'bg-blue-50' }) => {
  return (
    <div className={`${bgColorClass} p-4 rounded-lg shadow-md flex flex-col items-center justify-center`}>
      <p className="text-sm font-medium text-gray-600 mb-1 text-center">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
    </div>
  );
};

export default MetricCard;
