import { useState, useEffect } from 'react';
import { tripService } from '../utils/api';
import RouteMap from './RouteMap';
import Loader from './Loader';

const TripDetail = ({ tripId, onClose }) => {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId) return;
      
      try {
        setLoading(true);
        const data = await tripService.getTripById(tripId);
        setTrip(data);
        setError('');
      } catch (err) {
        console.error(`Error fetching trip with ID ${tripId}:`, err);
        setError('Failed to load trip details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  if (loading) {
    return (
      <div className="loader-container">
        <Loader />
        <div className="loader-text">Loading trip details...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!trip) {
    return <div className="no-trip">Trip not found.</div>;
  }

  return (
    <div className="trip-detail">
      <div className="trip-detail-header">
        <h2>Trip Details</h2>
        <button onClick={onClose} className="close-button">&times;</button>
      </div>
      
      <div className="trip-detail-content">
        <div className="trip-info">
          <div className="trip-info-item">
            <span className="trip-info-label">Current Location:</span>
            <span className="trip-info-value">{trip.current_location}</span>
          </div>
          <div className="trip-info-item">
            <span className="trip-info-label">Pickup Location:</span>
            <span className="trip-info-value">{trip.pickup_location}</span>
          </div>
          <div className="trip-info-item">
            <span className="trip-info-label">Dropoff Location:</span>
            <span className="trip-info-value">{trip.dropoff_location}</span>
          </div>
          <div className="trip-info-item">
            <span className="trip-info-label">Current Cycle Used:</span>
            <span className="trip-info-value">{trip.current_cycle_used} hours</span>
          </div>
          <div className="trip-info-item">
            <span className="trip-info-label">Created At:</span>
            <span className="trip-info-value">
              {new Date(trip.created_at).toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="trip-map-section">
          <h3>Route Map</h3>
          <RouteMap trip={trip} />
        </div>
      </div>
    </div>
  );
};

export default TripDetail; 