import { useEffect, useRef } from 'react';
import Loader from './Loader';

const DeleteModal = ({ trip, isOpen, onConfirm, onCancel, isDeleting }) => {
  const modalRef = useRef(null);
  
  useEffect(() => {
    // Focus trap for accessibility
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        const focusableModalElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableModalElements[0];
        const lastElement = focusableModalElements[focusableModalElements.length - 1];
        
        if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        } else if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      }
    };
    
    // Handle ESC key
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    
    // Add event listeners
    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscKey);
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    
    // Initial focus
    const timer = setTimeout(() => {
      const confirmButton = modalRef.current.querySelector('.confirm-button');
      if (confirmButton) confirmButton.focus();
    }, 100);
    
    // Clean up
    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, [onCancel]);
  
  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`}>
      <div 
        className={`modal delete-modal ${isOpen ? 'active' : ''}`}
        ref={modalRef}
        role="dialog"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <div className="modal-icon">
          <span className="warning-icon">!</span>
        </div>
        
        <h2 id="delete-modal-title" className="modal-title">Confirm Deletion</h2>
        
        <p id="delete-modal-description" className="modal-message">
          Are you sure you want to delete trip #{trip.id} from {trip.current_location} to {trip.dropoff_location}?
          <br />
          <span className="modal-warning">This action cannot be undone.</span>
        </p>
        
        <div className="modal-actions">
          <button 
            onClick={onCancel}
            className="cancel-button"
            disabled={isDeleting}
          >
            Cancel
          </button>
          
          <button 
            onClick={onConfirm}
            className="confirm-button delete-button"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="button-with-loader">
                <Loader /> <span>Deleting...</span>
              </span>
            ) : (
              'Delete Trip'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal; 