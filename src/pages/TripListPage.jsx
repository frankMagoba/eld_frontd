import { useState } from 'react';
import SmartTable from '../components/SmartTable';

const TripListPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTripUpdated = () => {
    // Increment the refresh key to trigger a re-fetch in SmartTable
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="trip-list-page">
      <div className="page-header">
        <h1>Trip History</h1>
        <p>View and manage your saved routes and trip logs.</p>
      </div>
      
      <div className="trip-list-container">
        <SmartTable 
          refreshTrigger={refreshKey}
          onEdit={handleTripUpdated}
        />
      </div>
    </div>
  );
};

export default TripListPage; 