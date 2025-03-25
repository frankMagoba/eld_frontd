import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  geocodeLocation, 
  getRoute, 
  formatDistance, 
  formatDuration, 
  calculateStopPoints,
  formatDateTime 
} from '../utils/mapUtils';
import { tripService } from '../utils/api';
import Loader from './Loader';

// Fix for default Leaflet markers not showing in production builds
// Import marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
});

// Custom marker icons for different locations
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
    className: `custom-marker-${color}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const currentIcon = createCustomIcon('blue');
const pickupIcon = createCustomIcon('green');
const dropoffIcon = createCustomIcon('red');
const breakIcon = createCustomIcon('orange');
const restIcon = createCustomIcon('purple');

const RouteMap = ({ trip }) => {
  const [currentCoords, setCurrentCoords] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState([39.8283, -98.5795]); // Center of US
  const [mapZoom, setMapZoom] = useState(4);
  const [breakPoints, setBreakPoints] = useState([]);
  const [restPoints, setRestPoints] = useState([]);
  const [hosData, setHosData] = useState(null);

  useEffect(() => {
    const loadMapData = async () => {
      if (!trip || !trip.current_location || !trip.pickup_location || !trip.dropoff_location) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      
      try {
        // Geocode locations
        const [currentLoc, pickupLoc, dropoffLoc] = await Promise.all([
          geocodeLocation(trip.current_location),
          geocodeLocation(trip.pickup_location),
          geocodeLocation(trip.dropoff_location)
        ]);
        
        setCurrentCoords(currentLoc);
        setPickupCoords(pickupLoc);
        setDropoffCoords(dropoffLoc);
        
        // Calculate routes
        const pickupRoute = await getRoute(currentLoc, pickupLoc);
        const dropoffRoute = await getRoute(pickupLoc, dropoffLoc);
        
        // Combine route coordinates for calculating stop points
        const allRouteCoordinates = [...pickupRoute.route, ...dropoffRoute.route];
        
        setRouteData({
          toPickup: pickupRoute,
          toDropoff: dropoffRoute,
          totalDistance: pickupRoute.distance + dropoffRoute.distance,
          totalDuration: pickupRoute.duration + dropoffRoute.duration
        });
        
        // Calculate center and zoom to fit all points
        const allPoints = [currentLoc, pickupLoc, dropoffLoc];
        const bounds = L.latLngBounds(allPoints.map(coord => L.latLng(coord[0], coord[1])));
        setMapCenter([
          (bounds.getNorth() + bounds.getSouth()) / 2,
          (bounds.getEast() + bounds.getWest()) / 2
        ]);
        
        // Calculate appropriate zoom level
        const maxDistance = Math.max(
          bounds.getNorth() - bounds.getSouth(),
          bounds.getEast() - bounds.getWest()
        );
        
        let zoom = 12;
        if (maxDistance > 5) zoom = 8;
        if (maxDistance > 10) zoom = 6;
        if (maxDistance > 20) zoom = 5;
        if (maxDistance > 40) zoom = 4;
        
        setMapZoom(zoom);
        
        // Calculate HOS data with start time as now
        const startTime = new Date();
        const totalDurationHours = (pickupRoute.duration + dropoffRoute.duration) / 60;
        
        const hosRequestData = {
          origin: trip.current_location,
          destination: trip.dropoff_location,
          estimated_duration: totalDurationHours,
          start_time: startTime.toISOString(),
          current_cycle_used: trip.current_cycle_used || 0
        };
        
        const hosResponse = await tripService.calculateHOS(hosRequestData);
        setHosData(hosResponse.hos_data);
        
        // Calculate break and rest points
        const { breakPoints, restPoints } = calculateStopPoints(
          hosResponse.hos_data,
          allRouteCoordinates,
          pickupRoute.duration + dropoffRoute.duration,
          startTime
        );
        
        setBreakPoints(breakPoints);
        setRestPoints(restPoints);
      } catch (err) {
        console.error('Error loading map data:', err);
        setError('Failed to load map data. Please check location names.');
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, [trip]);

  if (loading) {
    return (
      <div className="loader-container">
        <Loader />
        <div className="loader-text">Loading map data...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!trip || !currentCoords || !pickupCoords || !dropoffCoords) {
    return <div className="no-map-data">No location data available for mapping.</div>;
  }

  return (
    <div className="route-map-container">
      <div className="map-wrapper">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: '500px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Current location marker */}
          <Marker position={currentCoords} icon={currentIcon}>
            <Popup>
              <strong>Current Location:</strong> {trip.current_location}
            </Popup>
          </Marker>
          
          {/* Pickup location marker */}
          <Marker position={pickupCoords} icon={pickupIcon}>
            <Popup>
              <strong>Pickup Location:</strong> {trip.pickup_location}
            </Popup>
          </Marker>
          
          {/* Dropoff location marker */}
          <Marker position={dropoffCoords} icon={dropoffIcon}>
            <Popup>
              <strong>Dropoff Location:</strong> {trip.dropoff_location}
            </Popup>
          </Marker>
          
          {/* Break point markers */}
          {breakPoints.map((point, index) => (
            <Marker 
              key={`break-${index}`} 
              position={point.position}
              icon={breakIcon}
            >
              <Popup>
                <div className="marker-popup break-popup">
                  <h4>Required Break</h4>
                  <p><strong>Type:</strong> {point.type}</p>
                  <p><strong>Reason:</strong> {point.reason}</p>
                  <p><strong>Start:</strong> {formatDateTime(point.startTime)}</p>
                  <p><strong>End:</strong> {formatDateTime(point.endTime)}</p>
                  <p><strong>Duration:</strong> {formatDuration((point.endTime - point.startTime) / 60000)}</p>
                </div>
              </Popup>
              <Tooltip permanent direction="top" offset={[0, -20]}>
                <span>Break</span>
              </Tooltip>
            </Marker>
          ))}
          
          {/* Rest point markers */}
          {restPoints.map((point, index) => (
            <Marker 
              key={`rest-${index}`} 
              position={point.position}
              icon={restIcon}
            >
              <Popup>
                <div className="marker-popup rest-popup">
                  <h4>Required Rest</h4>
                  <p><strong>Type:</strong> {point.type}</p>
                  <p><strong>Reason:</strong> {point.reason}</p>
                  <p><strong>Start:</strong> {formatDateTime(point.startTime)}</p>
                  <p><strong>End:</strong> {formatDateTime(point.endTime)}</p>
                  <p><strong>Duration:</strong> {formatDuration((point.endTime - point.startTime) / 60000)}</p>
                </div>
              </Popup>
              <Tooltip permanent direction="top" offset={[0, -20]}>
                <span>Rest</span>
              </Tooltip>
            </Marker>
          ))}
          
          {/* Route from current to pickup */}
          {routeData && routeData.toPickup && (
            <Polyline 
              positions={routeData.toPickup.route}
              color="blue"
              weight={4}
              opacity={0.7}
              dashArray="10, 10"
            />
          )}
          
          {/* Route from pickup to dropoff */}
          {routeData && routeData.toDropoff && (
            <Polyline 
              positions={routeData.toDropoff.route}
              color="green"
              weight={4}
              opacity={0.7}
            />
          )}
        </MapContainer>
      </div>

      <div className="route-info-sidebar">
        <h3>Route Information</h3>
        <div className="route-info-item">
          <div className="route-label">
            <div className="route-dot route-dot-blue"></div>
            <span>Current to Pickup:</span>
          </div>
          <div className="route-value">
            <div>{routeData && formatDistance(routeData.toPickup.distance)}</div>
            <div>{routeData && formatDuration(routeData.toPickup.duration)}</div>
          </div>
        </div>
        
        <div className="route-info-item">
          <div className="route-label">
            <div className="route-dot route-dot-green"></div>
            <span>Pickup to Dropoff:</span>
          </div>
          <div className="route-value">
            <div>{routeData && formatDistance(routeData.toDropoff.distance)}</div>
            <div>{routeData && formatDuration(routeData.toDropoff.duration)}</div>
          </div>
        </div>
        
        <div className="route-info-total">
          <div className="route-label">
            <span>Total Journey:</span>
          </div>
          <div className="route-value">
            <div>{routeData && formatDistance(routeData.totalDistance)}</div>
            <div>{routeData && formatDuration(routeData.totalDuration)}</div>
          </div>
        </div>
        
        {/* HOS Information */}
        {hosData && (
          <>
            <h3 className="hos-info-title">Hours of Service</h3>
            
            {/* Required breaks */}
            {breakPoints.length > 0 && (
              <div className="hos-section">
                <h4>Required Breaks</h4>
                {breakPoints.map((point, index) => (
                  <div key={`break-info-${index}`} className="hos-info-item">
                    <div className="hos-label">
                      <div className="marker-dot marker-dot-orange"></div>
                      <span>Break {index + 1}:</span>
                    </div>
                    <div className="hos-value">
                      <div>{formatDateTime(point.startTime)}</div>
                      <div>{formatDuration((point.endTime - point.startTime) / 60000)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Required rest periods */}
            {restPoints.length > 0 && (
              <div className="hos-section">
                <h4>Required Rest Periods</h4>
                {restPoints.map((point, index) => (
                  <div key={`rest-info-${index}`} className="hos-info-item">
                    <div className="hos-label">
                      <div className="marker-dot marker-dot-purple"></div>
                      <span>Rest {index + 1}:</span>
                    </div>
                    <div className="hos-value">
                      <div>{formatDateTime(point.startTime)}</div>
                      <div>{formatDuration((point.endTime - point.startTime) / 60000)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* HOS Compliance Status */}
            <div className="hos-section">
              <h4>HOS Compliance</h4>
              <div className="compliance-item">
                <span>70-Hour Cycle: </span>
                <span className={`compliance-status ${hosData.cycle_compliant ? 'compliant' : 'non-compliant'}`}>
                  {hosData.cycle_compliant ? 'Compliant' : 'Non-compliant'}
                </span>
              </div>
              <div className="compliance-item">
                <span>11-Hour Driving Limit: </span>
                <span className={`compliance-status ${hosData.driving_compliant ? 'compliant' : 'non-compliant'}`}>
                  {hosData.driving_compliant ? 'Compliant' : 'Non-compliant'}
                </span>
              </div>
              <div className="compliance-item">
                <span>14-Hour Duty Window: </span>
                <span className={`compliance-status ${hosData.duty_window_compliant ? 'compliant' : 'non-compliant'}`}>
                  {hosData.duty_window_compliant ? 'Compliant' : 'Non-compliant'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RouteMap; 