import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripService } from '../utils/api';
import LoadingOverlay from './LoadingOverlay';
import Loader from './Loader';

const TripList = ({ refreshTrigger }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // Track which trip is being deleted
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, [refreshTrigger]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getAllTrips();
      setTrips(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch trips. Please try again later.');
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        setDeleting(id);
        await tripService.deleteTrip(id);
        // Remove the deleted trip from the state
        setTrips(trips.filter(trip => trip.id !== id));
      } catch (err) {
        console.error('Error deleting trip:', err);
        alert('Failed to delete the trip. Please try again.');
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/trips/${id}`);
  };

  const handleViewLogs = (id) => {
    navigate(`/trips/${id}/logs`);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <Loader />
        <div className="loader-text">Loading trips...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (trips.length === 0) {
    return <div className="no-trips">No trips found. Create one to get started!</div>;
  }

  return (
    <div className="trip-list">
      <h2>Trip List</h2>
      <div className="trip-cards">
        {trips.map(trip => (
          <div key={trip.id} className="trip-card">
            {deleting === trip.id && <LoadingOverlay message="Deleting trip..." />}
            <div className="trip-header">
              <h3>Trip #{trip.id}</h3>
              <span className="trip-date">
                {new Date(trip.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="trip-details">
              <p><strong>Current Location:</strong> {trip.current_location}</p>
              <p><strong>Pickup:</strong> {trip.pickup_location}</p>
              <p><strong>Dropoff:</strong> {trip.dropoff_location}</p>
              <p><strong>Cycle Used:</strong> {trip.current_cycle_used} hours</p>
            </div>
            <div className="trip-actions">
              <button 
                onClick={() => handleViewDetails(trip.id)} 
                className="view-details-button"
                disabled={deleting === trip.id}
              >
                View Details
              </button>
              <button 
                onClick={() => handleViewLogs(trip.id)} 
                className="view-logs-button"
                disabled={deleting === trip.id}
              >
                View Logs
              </button>
              <button 
                onClick={() => handleDelete(trip.id)} 
                className="delete-button"
                disabled={deleting === trip.id}
              >
                {deleting === trip.id ? (
                  <span className="button-with-loader">
                    <Loader /> <span>Deleting...</span>
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripList; 