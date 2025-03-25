import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tripService } from '../utils/api';
import RouteMap from '../components/RouteMap';

const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await tripService.getTripById(id);
        setTrip(data);
        setError('');
      } catch (err) {
        console.error(`Error fetching trip with ID ${id}:`, err);
        setError('Failed to load trip details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const handleViewLogs = () => {
    navigate(`/trips/${id}/logs`);
  };

  if (loading) {
    return <div className="loading">Loading trip details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!trip) {
    return <div className="no-trip">Trip not found.</div>;
  }

  return (
    <div className="trip-detail-page">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> &gt; Trip Details
        </div>
        <h1>Trip Details #{id}</h1>
      </div>
      
      <div className="trip-actions">
        <button 
          onClick={handleViewLogs}
          className="view-logs-button"
        >
          View Driver Logs
        </button>
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

export default TripDetailPage; 