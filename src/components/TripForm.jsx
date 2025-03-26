import { useState } from 'react';
import { tripService } from '../utils/api';
import Loader from './Loader';

const TripForm = ({ onTripCreated }) => {
  const [formData, setFormData] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: 0
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const resetForm = () => {
    setFormData({
      current_location: '',
      pickup_location: '',
      dropoff_location: '',
      current_cycle_used: 0
    });
    setFormErrors({});
    setError('');
  };
  
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
          error = '';
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
    
    // Handle current_cycle_used differently to allow for temporarily empty inputs
    const parsedValue = name === 'current_cycle_used' 
      ? (value === '' ? '' : parseInt(value, 10) || 0)
      : value;
    
    // Update form data
    setFormData({
      ...formData,
      [name]: parsedValue,
    });
    
    // Clear success message on change
    if (success) {
      setSuccess('');
    }
    
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
      let error = '';
      const value = formData[key];
      
      // Special handling for current_cycle_used
      if (key === 'current_cycle_used') {
        if (value === '' || value === null) {
          error = 'This field is required';
          isValid = false;
        } else if (isNaN(value) || value < 0) {
          error = 'Must be a positive number';
          isValid = false;
        } else if (value > 70) {
          error = 'Cannot exceed 70 hours (HOS regulations)';
          isValid = false;
        }
      } else {
        // For other fields, use existing validation
        error = validateField(key, value);
        if (error) {
          isValid = false;
        }
      }
      
      errors[key] = error;
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
    setSuccess('');
    
    try {
      // Ensure cycle hours is a number before submission
      const submissionData = {
        ...formData,
        current_cycle_used: Number(formData.current_cycle_used)
      };
      
      // Create new trip
      const result = await tripService.createTrip(submissionData);
      
      // Reset form after successful creation
      resetForm();
      setSuccess('Trip created successfully!');
      
      // Call the callback if provided
      if (onTripCreated) {
        onTripCreated(result);
      }
    } catch (err) {
      setError(err.message || 'Failed to create trip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="trip-form-container">
      <h2>Plan Your Route</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
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
            placeholder="e.g. Milwaukee, WI"
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
          <label htmlFor="current_cycle_used">Current Cycle Hours Used:</label>
          <input
            type="number"
            id="current_cycle_used"
            name="current_cycle_used"
            value={formData.current_cycle_used}
            onChange={handleChange}
            onBlur={handleBlur}
            min="0"
            max="70"
            step="0.5"
            required
            placeholder="0"
          />
          {formErrors.current_cycle_used && (
            <div className="field-error">{formErrors.current_cycle_used}</div>
          )}
          <div className="field-hint">
            Enter how many hours you've already driven in your current cycle (0-70)
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="button-with-loader">
                <Loader /> <span>Planning...</span>
              </span>
            ) : (
              'Calculate Route & Logs'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TripForm; 