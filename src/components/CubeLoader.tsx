import React from 'react';

const CubeLoader: React.FC = () => {
  return (
    <div className="flex space-x-1 cube-loader">
      <div className="w-2 h-2 rounded-full"></div>
      <div className="w-2 h-2 rounded-full"></div>
      <div className="w-2 h-2 rounded-full"></div>
    </div>
  );
};

export default CubeLoader;