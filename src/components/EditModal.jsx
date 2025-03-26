import { useEffect, useRef, useState } from 'react';
import { tripService } from '../utils/api';
import Loader from './Loader';

const EditModal = ({ trip, isOpen, onSave, onCancel }) => {
  const modalRef = useRef(null);
  const [formData, setFormData] = useState({
    current_location: trip?.current_location || '',
    pickup_location: trip?.pickup_location || '',
    dropoff_location: trip?.dropoff_location || '',
    current_cycle_used: trip?.current_cycle_used || 0
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Update form data when trip changes
    if (trip) {
      setFormData({
        current_location: trip.current_location || '',
        pickup_location: trip.pickup_location || '',
        dropoff_location: trip.dropoff_location || '',
        current_cycle_used: trip.current_cycle_used || 0
      });
    }
  }, [trip]);
  
  useEffect(() => {
    // Focus trap for accessibility
    const handleTabKey = (e) => {
      if (e.key === 'Tab' && modalRef.current) {
        const focusableModalElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableModalElements.length > 0) {
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
      const firstInput = modalRef.current?.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 100);
    
    // Clean up
    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, [onCancel]);
  
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'current_location':
      case 'pickup_location':
      case 'dropoff_location':
        if (!value.trim()) {
          error = 'This field is required';
        } else if (value.trim().length < 2) {
          error = 'Must be at least 2 characters';
        }
        break;
      
      case 'current_cycle_used':
        if (value === '') {
          error = 'This field is required';
        } else if (isNaN(value) || value < 0) {
          error = 'Must be a positive number';
        } else if (value > 70) {
          error = 'Cannot exceed 70 hours (HOS regulations)';
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle current_cycle_used differently to allow for numbers
    const parsedValue = name === 'current_cycle_used' 
      ? (value === '' ? '' : parseInt(value, 10) || 0)
      : value;
    
    // Update form data
    setFormData({
      ...formData,
      [name]: parsedValue,
    });
    
    // Clear error message
    setError('');
    
    // Only validate after user has interacted with the field
    if (formErrors[name]) {
      const fieldError = validateField(name, parsedValue);
      setFormErrors({
        ...formErrors,
        [name]: fieldError
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Validate each field
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        errors[key] = error;
        isValid = false;
      }
    });
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    setFormErrors({
      ...formErrors,
      [name]: error
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    if (!validateForm()) {
      setError('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Ensure cycle hours is a number before submission
      const submissionData = {
        ...formData,
        current_cycle_used: Number(formData.current_cycle_used)
      };
      
      // Update trip
      const updatedTrip = await tripService.updateTrip(trip.id, submissionData);
      
      // Call the callback with the updated trip
      onSave(updatedTrip);
    } catch (err) {
      setError(err.message || 'Failed to update trip. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`}>
      <div 
        className={`modal edit-modal ${isOpen ? 'active' : ''}`}
        ref={modalRef}
        role="dialog"
        aria-labelledby="edit-modal-title"
      >
        <div className="modal-header">
          <h2 id="edit-modal-title" className="modal-title">Edit Trip #{trip?.id}</h2>
          <button 
            onClick={onCancel} 
            className="modal-close-button"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="trip-form">
            <div className={`form-group ${formErrors.current_location ? 'has-error' : ''}`}>
              <label htmlFor="current_location">Current Location:</label>
              <input
                type="text"
                id="current_location"
                name="current_location"
                value={formData.current_location}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="e.g. Chicago, IL"
              />
              {formErrors.current_location && (
                <div className="field-error">{formErrors.current_location}</div>
              )}
            </div>
            
            <div className={`form-group ${formErrors.pickup_location ? 'has-error' : ''}`}>
              <label htmlFor="pickup_location">Pickup Location:</label>
              <input
                type="text"
                id="pickup_location"
                name="pickup_location"
                value={formData.pickup_location}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="e.g. Detroit, MI"
              />
              {formErrors.pickup_location && (
                <div className="field-error">{formErrors.pickup_location}</div>
              )}
            </div>
            
            <div className={`form-group ${formErrors.dropoff_location ? 'has-error' : ''}`}>
              <label htmlFor="dropoff_location">Dropoff Location:</label>
              <input
                type="text"
                id="dropoff_location"
                name="dropoff_location"
                value={formData.dropoff_location}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="e.g. Indianapolis, IN"
              />
              {formErrors.dropoff_location && (
                <div className="field-error">{formErrors.dropoff_location}</div>
              )}
            </div>
            
            <div className={`form-group ${formErrors.current_cycle_used ? 'has-error' : ''}`}>
              <label htmlFor="current_cycle_used">Current Cycle Used (hours):</label>
              <input
                type="number"
                id="current_cycle_used"
                name="current_cycle_used"
                value={formData.current_cycle_used}
                onChange={handleChange}
                onBlur={handleBlur}
                min="0"
                max="70"
                step="1"
                required
              />
              <div className="field-hint">Maximum 70 hours (HOS regulations)</div>
              {formErrors.current_cycle_used && (
                <div className="field-error">{formErrors.current_cycle_used}</div>
              )}
            </div>
          </form>
        </div>
        
        <div className="modal-actions modal-actions-with-spacing">
          <button 
            onClick={onCancel}
            className="cancel-button"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button 
            onClick={handleSubmit}
            className="confirm-button update-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="button-with-loader">
                <Loader /> <span>Updating...</span>
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal; 