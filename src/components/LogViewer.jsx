import { useState, useEffect } from 'react';
import { tripService } from '../utils/api';
import Loader from './Loader';

const LogViewer = ({ tripId }) => {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [pdfData, setPdfData] = useState(null);
  const [filename, setFilename] = useState('driver_log.pdf');

  useEffect(() => {
    const fetchPdfLog = async () => {
      if (!tripId) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch the base64 encoded PDF data
        const response = await tripService.getTripLog(tripId);
        setPdfData(response.pdfData);
        setFilename(response.filename);
      } catch (err) {
        console.error(`Error fetching PDF log for trip ${tripId}:`, err);
        setError('Failed to load driver log. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPdfLog();
  }, [tripId]);

  const handleDownload = async () => {
    if (!pdfData) return;
    
    try {
      setDownloading(true);
      
      // Convert base64 to blob
      const byteCharacters = atob(pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download the PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <Loader />
        <div className="loader-text">Loading driver log...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="log-viewer">
      <div className="log-viewer-header">
        <h2>Driver Daily Log</h2>
        <div className="log-viewer-info">
          <p>PDF log is ready for download.</p>
        </div>
      </div>

      <div className="log-action-container">
        <p>The driver's daily log has been generated and is ready to be downloaded.</p>
        <p>Click the button below to download the PDF file.</p>
        
        <button 
          onClick={handleDownload} 
          className="download-button"
          disabled={!pdfData || downloading}
        >
          {downloading ? (
            <span className="button-with-loader">
              <Loader /> <span>Downloading...</span>
            </span>
          ) : (
            'Download Driver Log PDF'
          )}
        </button>
      </div>
    </div>
  );
};

export default LogViewer; 