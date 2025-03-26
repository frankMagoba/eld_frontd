import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripService } from '../utils/api';
import Loader from './Loader';
import DeleteModal from './DeleteModal';
import EditModal from './EditModal';

const SmartTable = ({ refreshTrigger, onEdit }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [tripToEdit, setTripToEdit] = useState(null);
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

  const handleDeleteClick = (trip) => {
    setTripToDelete(trip);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tripToDelete) return;
    
    try {
      setDeleting(tripToDelete.id);
      await tripService.deleteTrip(tripToDelete.id);
      // Remove the deleted trip from the state
      setTrips(trips.filter(trip => trip.id !== tripToDelete.id));
      // Close the modal
      setDeleteModalOpen(false);
      setTripToDelete(null);
    } catch (err) {
      console.error('Error deleting trip:', err);
      alert('Failed to delete the trip. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setTripToDelete(null);
  };

  const handleEditClick = (trip) => {
    setTripToEdit(trip);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (updatedTrip) => {
    // Update the trip in the trips array
    setTrips(trips.map(trip => 
      trip.id === updatedTrip.id ? updatedTrip : trip
    ));
    
    // Close the modal
    setEditModalOpen(false);
    setTripToEdit(null);
    
    // Optional: call onEdit callback in case other components need to know
    if (onEdit) {
      onEdit(null);
    }
  };

  const handleCancelEdit = () => {
    setEditModalOpen(false);
    setTripToEdit(null);
  };

  const handleViewDetails = (id) => {
    navigate(`/trips/${id}`);
  };

  const handleViewLogs = (id) => {
    navigate(`/trips/${id}/logs`);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedTrips = () => {
    const sortableTrips = [...trips];
    if (sortConfig.key) {
      sortableTrips.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTrips;
  };

  const getFilteredTrips = () => {
    const sortedTrips = getSortedTrips();
    if (!searchTerm) return sortedTrips;
    
    return sortedTrips.filter(trip => 
      trip.pickup_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.dropoff_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.current_location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getSortIndicator = (column) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
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

  const filteredTrips = getFilteredTrips();

  return (
    <div className="smart-table-container">
      <div className="table-header">
        <h2>Trip List</h2>
        <div className="table-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search" 
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <button onClick={fetchTrips} className="refresh-button" title="Refresh trips">
            <i className="icon-refresh">↻</i>
          </button>
        </div>
      </div>

      {filteredTrips.length === 0 ? (
        <div className="no-results">No trips match your search criteria.</div>
      ) : (
        <div className="table-responsive">
          <table className="smart-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('id')} className="col-id">
                  ID{getSortIndicator('id')}
                </th>
                <th onClick={() => requestSort('created_at')} className="col-date">
                  Date{getSortIndicator('created_at')}
                </th>
                <th onClick={() => requestSort('current_location')} className="col-location">
                  From{getSortIndicator('current_location')}
                </th>
                <th onClick={() => requestSort('pickup_location')} className="col-location">
                  Via{getSortIndicator('pickup_location')}
                </th>
                <th onClick={() => requestSort('dropoff_location')} className="col-location">
                  To{getSortIndicator('dropoff_location')}
                </th>
                <th onClick={() => requestSort('current_cycle_used')} className="col-hours">
                  Hrs{getSortIndicator('current_cycle_used')}
                </th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className={deleting === trip.id ? 'deleting' : ''}>
                  <td>#{trip.id}</td>
                  <td>
                    <div className="date-stacked">
                      <span className="date-primary">{formatDate(trip.created_at)}</span>
                      <span className="date-secondary">{formatTime(trip.created_at)}</span>
                    </div>
                  </td>
                  <td title={trip.current_location}>{trip.current_location}</td>
                  <td title={trip.pickup_location}>{trip.pickup_location}</td>
                  <td title={trip.dropoff_location}>{trip.dropoff_location}</td>
                  <td>{trip.current_cycle_used}</td>
                  <td className="action-icons">
                    <button
                      onClick={() => handleEditClick(trip)}
                      className="icon-button edit-icon"
                      disabled={deleting === trip.id}
                      title="Edit trip"
                      aria-label="Edit trip"
                    >
                      <i className="icon-edit">✎</i>
                    </button>
                    <button
                      onClick={() => handleViewDetails(trip.id)}
                      className="icon-button details-icon"
                      disabled={deleting === trip.id}
                      title="View trip details"
                      aria-label="View trip details"
                    >
                      <i className="icon-details">🔍</i>
                    </button>
                    <button
                      onClick={() => handleViewLogs(trip.id)}
                      className="icon-button logs-icon"
                      disabled={deleting === trip.id}
                      title="View driver logs"
                      aria-label="View driver logs"
                    >
                      <i className="icon-logs">📋</i>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(trip)}
                      className="icon-button delete-icon"
                      disabled={deleting === trip.id}
                      title="Delete trip"
                      aria-label="Delete trip"
                    >
                      {deleting === trip.id ? <Loader /> : <i className="icon-delete">🗑</i>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="table-footer">
        <span className="trip-count">
          {filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'} 
          {searchTerm && ` (filtered from ${trips.length})`}
        </span>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && tripToDelete && (
        <DeleteModal 
          trip={tripToDelete}
          isOpen={deleteModalOpen}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={deleting === tripToDelete.id}
        />
      )}

      {/* Edit Modal */}
      {editModalOpen && tripToEdit && (
        <EditModal
          trip={tripToEdit}
          isOpen={editModalOpen}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default SmartTable; 