# Driver Hours & Route Planner

A React frontend for managing driver hours, route planning, and trip logistics, built with Vite.

## Features

- View all trips in the system
- Create new trips
- Delete existing trips
- Responsive design
- **Interactive Maps**: View trip routes and distances with Leaflet
  - Display current, pickup, and dropoff locations on the map
  - Draw route paths between locations
  - Show distance and estimated travel time
  - Automatically center and zoom to fit the route
- **Hours of Service (HOS) Management**: Track and plan driver hours according to regulations
  - Calculate required breaks and rest periods
  - Show compliance status for regulatory limits
  - Visual indicators for compliant and non-compliant statuses

## Technologies Used

- React
- React Router for navigation
- Axios for API calls
- CSS for styling
- Leaflet and React-Leaflet for interactive maps
- OpenStreetMap for map tiles
- OSRM (Open Source Routing Machine) for route calculations

## Project Structure

- `src/components/` - Reusable React components
  - `TripForm.jsx` - Form for creating new trips
  - `TripList.jsx` - Displays a list of trips with options to view details or delete
  - `TripDetail.jsx` - Shows detailed information about a trip
  - `RouteMap.jsx` - Displays an interactive map with route information
  - `LogViewer.jsx` - Handles downloading of driver log PDFs
  - `Spinner.jsx` - Loading spinner for async operations
  - `LoadingOverlay.jsx` - Overlay for loading states
- `src/pages/` - Page-level components
  - `Home.jsx` - Main page with trip form and trip list
  - `TripDetailPage.jsx` - Page showing detailed trip information with route map
  - `TripLogPage.jsx` - Page for viewing and downloading driver logs
- `src/utils/` - Utility functions and API services
  - `api.js` - API service for backend communication
  - `mapUtils.js` - Map-related utilities (geocoding, routing, etc.)

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Map Features

The map functionality includes:

- **Geocoding**: Convert location names to coordinates using Nominatim API
- **Route Planning**: Calculate routes between points using OSRM API
- **Interactive Elements**: Click on markers to see location information
- **Distance Calculation**: Calculate total distance and travel time
- **Responsive Design**: Map adapts to different screen sizes

## API Integration

This frontend is designed to work with the ELD Log backend API. Make sure the backend is running on `http://localhost:8000` or update the API URL in `src/utils/api.js` if your backend is running on a different URL.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the production build locally
