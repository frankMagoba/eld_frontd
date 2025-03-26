import { useState } from 'react';
import TripForm from '../components/TripForm';
import RouteMap from '../components/RouteMap';
import LogViewer from '../components/LogViewer';

const Home = () => {
  const [currentTrip, setCurrentTrip] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleTripCreated = (trip) => {
    setCurrentTrip(trip);
    setShowResults(true);
  };

  return (
    <div className="home-container">
      <div className="route-planner-header">
        <h1>ELD Route Planner</h1>
        <p className="route-description">
          Plan your route, calculate required breaks, and generate FMCSA-compliant electronic logs.
        </p>
      </div>
      
      <main className="planner-content">
        {!showResults ? (
          <div className="input-section">
            <div className="form-container">
              <TripForm 
                onTripCreated={handleTripCreated}
              />
            </div>
          </div>
        ) : (
          <div className="results-section">
            <div className="results-header">
              <h2>Your Route Plan</h2>
              <button 
                className="back-button"
                onClick={() => setShowResults(false)}
              >
                ← Plan New Route
              </button>
            </div>

            <div className="route-results">
              <div className="trip-summary">
                <h3>Trip Details</h3>
                <div className="summary-details">
                  <div className="summary-item">
                    <span className="label">Current Location:</span>
                    <span className="value">{currentTrip?.current_location}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Pickup Location:</span>
                    <span className="value">{currentTrip?.pickup_location}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Dropoff Location:</span>
                    <span className="value">{currentTrip?.dropoff_location}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Cycle Used:</span>
                    <span className="value">{currentTrip?.current_cycle_used} hours</span>
                  </div>
                </div>
              </div>

              <div className="map-container">
                <h3>Route Map & Required Stops</h3>
                <p className="map-description">Map showing route with break/rest locations</p>
                <RouteMap trip={currentTrip} />
              </div>

              <div className="logs-container">
                <h3>Driver Log Sheets</h3>
                <p className="logs-description">Electronic driver logs for your trip</p>
                {currentTrip && <LogViewer tripId={currentTrip.id} />}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home; 