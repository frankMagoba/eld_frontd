import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tripService } from '../utils/api';
import LogViewer from '../components/LogViewer';

const TripLogPage = () => {
  const { id } = useParams();
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
    <div className="trip-log-page">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> &gt; <Link to={`/trips/${id}`}>Trip Details</Link> &gt; Driver Logs
        </div>
        <h1>Driver Logs for Trip #{id}</h1>
      </div>
      
      <div className="trip-summary">
        <h3>Trip Summary</h3>
        <div className="summary-details">
          <div className="summary-item">
            <span className="label">From:</span>
            <span className="value">{trip.pickup_location}</span>
          </div>
          <div className="summary-item">
            <span className="label">To:</span>
            <span className="value">{trip.dropoff_location}</span>
          </div>
          <div className="summary-item">
            <span className="label">Current Location:</span>
            <span className="value">{trip.current_location}</span>
          </div>
          <div className="summary-item">
            <span className="label">Cycle Used:</span>
            <span className="value">{trip.current_cycle_used} hours</span>
          </div>
        </div>
      </div>
      
      <div className="log-container">
        <LogViewer tripId={id} />
      </div>
    </div>
  );
};

export default TripLogPage; 