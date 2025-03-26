# ELD Route Planner Frontend

A React frontend for planning routes, calculating required breaks, and generating FMCSA-compliant driver logs.

## Features

- **Route Planning**: 
  - Enter current location, pickup location, and dropoff location
  - Specify current cycle hours already used
  - Get instant results showing route, required stops, and driver logs

- **Interactive Maps**: 
  - View trip routes with detailed waypoints
  - Display current, pickup, and dropoff locations
  - Show required break and rest locations
  - Display distance and estimated travel time
  - Automatically center and zoom to fit the route

- **Hours of Service (HOS) Management**: 
  - Calculate required breaks and rest periods based on FMCSA regulations
  - Show compliance status for regulatory limits
  - Visual indicators for break and rest locations

- **Driver Log Generation**:
  - Automatically fill out electronic driver logs
  - Generate PDF log sheets for each day of the trip
  - Add carrier information to logs
  - Download logs for record-keeping

- **Trip Management**:
  - View all saved trips in the system
  - Search and sort trip records
  - Edit trip details
  - Delete unwanted trips

## Technologies Used

- React and React Router
- Axios for API calls
- CSS for styling
- Leaflet and React-Leaflet for interactive maps
- OpenStreetMap for map tiles
- OSRM (Open Source Routing Machine) for route calculations
- PDF generation for driver logs

## Project Structure

- `src/components/` - Reusable React components
  - `TripForm.jsx` - Form for entering route planning details
  - `RouteMap.jsx` - Displays an interactive map with route information
  - `LogViewer.jsx` - Handles driver log generation and downloading
  - `SmartTable.jsx` - Data table with sorting and filtering for trip history
  - `DeleteModal.jsx` - Modal for confirming trip deletion
  - `EditModal.jsx` - Modal for editing trip details
  - `Spinner.jsx` and `Loader.jsx` - Loading indicators
  
- `src/pages/` - Page-level components
  - `Home.jsx` - Main page with route planner and results display
  - `TripListPage.jsx` - Page for viewing trip history
  - `TripDetailPage.jsx` - Page showing detailed trip information
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
3. Create a `.env` file based on `.env.example` and configure your API URL
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Build for production:
   ```bash
   npm run build
   ```

## Map Features Details

The map functionality includes:

- **Geocoding**: Convert location names to coordinates using Nominatim API
- **Route Planning**: Calculate optimal routes between points using OSRM API
- **HOS Compliance**: Calculate and display required break and rest locations
- **Interactive Elements**: Click on markers to see location details
- **Distance and Time**: Show total distance and estimated time for the route

## Driver Log Features

- **Automatic Log Generation**: Create logs based on trip details
- **Multiple Day Support**: Generate separate logs for multi-day trips
- **Customizable Carrier Info**: Add company and vehicle information
- **PDF Download**: Save logs for record-keeping and inspections

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the production build locally
