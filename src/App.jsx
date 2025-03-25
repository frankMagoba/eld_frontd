import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import TripDetailPage from './pages/TripDetailPage';
import TripLogPage from './pages/TripLogPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <div className="container">
            <h1>Route Planner</h1>
            <nav className="main-nav">
              <ul className="nav-links">
                <li><Link to="/">New trip</Link></li>
              </ul>
            </nav>
          </div>
        </header>
        
        <main className="app-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/trips/:id" element={<TripDetailPage />} />
              <Route path="/trips/:id/logs" element={<TripLogPage />} />
            </Routes>
          </div>
        </main>
        
        <footer className="app-footer">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} Driver Hours & Route Planner. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
