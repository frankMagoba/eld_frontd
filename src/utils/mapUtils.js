// Nominatim API for geocoding
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';
// OSRM API for routing
const OSRM_API = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Geocode a location string to get coordinates
 * @param {string} locationString - Location name (e.g., "Chicago, IL")
 * @returns {Promise<[number, number]>} - [lat, lng] coordinates
 */
export const geocodeLocation = async (locationString) => {
  try {
    // Add a slight delay to avoid rate limiting (if making multiple calls)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const params = new URLSearchParams({
      q: locationString,
      format: 'json',
      limit: 1
    });
    
    const response = await fetch(`${NOMINATIM_API}?${params}`);
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error(`Could not geocode location: ${locationString}`);
    }
    
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

/**
 * Get a route between two points using OSRM API
 * @param {[number, number]} start - [lat, lng] coordinates of start point
 * @param {[number, number]} end - [lat, lng] coordinates of end point
 * @returns {Promise<{route: Array<[number, number]>, distance: number, duration: number}>}
 */
export const getRoute = async (start, end) => {
  try {
    // OSRM expects coordinates in lng,lat format
    const startLngLat = `${start[1]},${start[0]}`;
    const endLngLat = `${end[1]},${end[0]}`;
    
    const response = await fetch(`${OSRM_API}/${startLngLat};${endLngLat}?overview=full&geometries=geojson`);
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('Could not find a route between the specified locations');
    }
    
    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Convert to [lat, lng]
    
    return {
      route: coordinates,
      distance: route.distance / 1000, // Convert to kilometers
      duration: route.duration / 60, // Convert to minutes
    };
  } catch (error) {
    console.error('Routing error:', error);
    throw error;
  }
};

/**
 * Format duration in minutes to hours and minutes
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration (e.g., "2h 30m")
 */
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

/**
 * Format distance in kilometers
 * @param {number} kilometers - Distance in kilometers
 * @returns {string} - Formatted distance
 */
export const formatDistance = (kilometers) => {
  return `${kilometers.toFixed(1)} km (${(kilometers * 0.621371).toFixed(1)} mi)`;
};

/**
 * Find a point along a route at a specific time
 * @param {Array<[number, number]>} routeCoordinates - Array of [lat, lng] coordinates
 * @param {number} totalDuration - Total route duration in minutes
 * @param {number} minutesFromStart - Minutes from start point
 * @returns {[number, number]} - [lat, lng] coordinates at that point
 */
export const findPointAtTime = (routeCoordinates, totalDuration, minutesFromStart) => {
  if (!routeCoordinates || routeCoordinates.length === 0) {
    throw new Error('No route coordinates provided');
  }
  
  if (minutesFromStart <= 0) {
    return routeCoordinates[0];
  }
  
  if (minutesFromStart >= totalDuration) {
    return routeCoordinates[routeCoordinates.length - 1];
  }
  
  // Calculate the percentage of the route completed
  const routePercentage = minutesFromStart / totalDuration;
  
  // Find the index based on percentage
  const index = Math.floor(routePercentage * (routeCoordinates.length - 1));
  
  return routeCoordinates[index];
};

/**
 * Calculate break and rest points along a route based on HOS data
 * @param {Object} hosData - HOS calculation data from API
 * @param {Array<[number, number]>} routeCoordinates - Array of [lat, lng] coordinates
 * @param {number} totalDuration - Total route duration in minutes
 * @param {Date} startTime - Trip start time
 * @returns {Object} - Object with break and rest points
 */
export const calculateStopPoints = (hosData, routeCoordinates, totalDuration, startTime) => {
  if (!hosData || !routeCoordinates || routeCoordinates.length === 0) {
    return { breakPoints: [], restPoints: [] };
  }
  
  const breakPoints = [];
  const restPoints = [];
  
  // Process required breaks
  if (hosData.required_breaks && hosData.required_breaks.length > 0) {
    hosData.required_breaks.forEach(breakData => {
      // Calculate minutes from start
      const breakStartTime = new Date(breakData.start_time);
      const minutesFromStart = (breakStartTime - new Date(startTime)) / (1000 * 60);
      
      try {
        const point = findPointAtTime(routeCoordinates, totalDuration, minutesFromStart);
        breakPoints.push({
          position: point,
          startTime: breakStartTime,
          endTime: new Date(breakData.end_time),
          type: breakData.break_type,
          reason: breakData.reason
        });
      } catch (error) {
        console.error('Error finding break point:', error);
      }
    });
  }
  
  // Process required rest periods
  if (hosData.required_rest_periods && hosData.required_rest_periods.length > 0) {
    hosData.required_rest_periods.forEach(restData => {
      // Calculate minutes from start
      const restStartTime = new Date(restData.start_time);
      const minutesFromStart = (restStartTime - new Date(startTime)) / (1000 * 60);
      
      try {
        const point = findPointAtTime(routeCoordinates, totalDuration, minutesFromStart);
        restPoints.push({
          position: point,
          startTime: restStartTime,
          endTime: new Date(restData.end_time),
          type: restData.rest_type,
          reason: restData.reason
        });
      } catch (error) {
        console.error('Error finding rest point:', error);
      }
    });
  }
  
  return { breakPoints, restPoints };
};

/**
 * Format datetime to display format
 * @param {Date} datetime - Date object
 * @returns {string} - Formatted datetime string
 */
export const formatDateTime = (datetime) => {
  return new Date(datetime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
}; 