import React from 'react';

const Spinner = ({ size = 'medium', color = '#4caf50' }) => {
  // Map size string to actual pixel values
  const sizeMap = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };

  const actualSize = sizeMap[size] || sizeMap.medium;

  const spinnerStyle = {
    width: actualSize,
    height: actualSize,
    border: `4px solid rgba(0, 0, 0, 0.1)`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spinner 0.8s linear infinite',
    margin: '0 auto'
  };

  return (
    <div className="spinner-container">
      <div style={spinnerStyle} className="spinner" />
    </div>
  );
};

export default Spinner; 