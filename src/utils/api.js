import axios from 'axios';

// Use environment variables with fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Trip API services
export const tripService = {
  // Get all trips
  getAllTrips: async () => {
    try {
      const response = await apiClient.get('/trips/');
      return response.data;
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }
  },
  
  // Get trip by ID
  getTripById: async (id) => {
    try {
      const response = await apiClient.get(`/trips/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching trip with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new trip
  createTrip: async (tripData) => {
    try {
      const response = await apiClient.post('/trips/', tripData);
      return response.data;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  },
  
  // Update a trip
  updateTrip: async (id, tripData) => {
    try {
      const response = await apiClient.put(`/trips/${id}/`, tripData);
      return response.data;
    } catch (error) {
      console.error(`Error updating trip with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a trip
  deleteTrip: async (id) => {
    try {
      await apiClient.delete(`/trips/${id}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting trip with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Get driver log PDF for a trip
  getTripLog: async (id, options = {}) => {
    try {
      // Build query parameters including optional fields
      const { 
        carrierName = '', 
        officeAddress = '', 
        vehicleNumber = '', 
        coDriverName = '' 
      } = options;
      
      // Build query params string
      let queryParams = `?trip_id=${id}`;
      if (carrierName) queryParams += `&carrier_name=${encodeURIComponent(carrierName)}`;
      if (officeAddress) queryParams += `&office_address=${encodeURIComponent(officeAddress)}`;
      if (vehicleNumber) queryParams += `&vehicle_number=${encodeURIComponent(vehicleNumber)}`;
      if (coDriverName) queryParams += `&co_driver_name=${encodeURIComponent(coDriverName)}`;
      
      // Use the standard axios client for JSON response
      const response = await apiClient.get(`/generate_log/${queryParams}`);
      
      // Return the base64 data and filename
      return {
        pdfData: response.data.pdf_data,
        filename: response.data.filename
      };
    } catch (error) {
      console.error(`Error fetching driver log for trip ${id}:`, error);
      throw error;
    }
  },
  
  // Calculate HOS (Hours of Service) information for a trip
  calculateHOS: async (tripData) => {
    try {
      const { origin, destination, estimated_duration, start_time, current_cycle_used } = tripData;
      
      const requestData = {
        origin,
        destination,
        estimated_duration,
        start_time,
        current_cycle_used
      };
      
      const response = await apiClient.post('/calculate_hos/', requestData);
      return response.data;
    } catch (error) {
      console.error('Error calculating HOS data:', error);
      throw error;
    }
  }
};

export default apiClient; 