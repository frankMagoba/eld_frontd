import React from 'react';
import Loader from './Loader';

const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-overlay">
      <div>
        <Loader />
        <div className="loading-text">{message}</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
