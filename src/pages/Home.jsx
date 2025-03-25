import { useState } from 'react';
import TripForm from '../components/TripForm';
import TripList from '../components/TripList';

const Home = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTripCreated = () => {
    // Increment the refresh key to trigger a re-fetch in TripList
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="home-container">
      <main className="app-content">
        <div className="trip-form-section">
          <TripForm onTripCreated={handleTripCreated} />
        </div>
        
        <div className="trip-list-section">
          <TripList refreshTrigger={refreshKey} />
        </div>
      </main>
    </div>
  );
};

export default Home; 