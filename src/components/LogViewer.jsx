import { useState, useEffect } from 'react';
import { tripService } from '../utils/api';
import Loader from './Loader';

const LogViewer = ({ tripId }) => {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [pdfData, setPdfData] = useState(null);
  const [filename, setFilename] = useState('driver_log.pdf');
  
  // Add state for carrier information
  const [carrierInfo, setCarrierInfo] = useState({
    carrierName: 'Transport Company',
    officeAddress: '123 Trucking Lane, Anytown, USA',
    vehicleNumber: '',
    coDriverName: ''
  });

  useEffect(() => {
    const fetchPdfLog = async () => {
      if (!tripId) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch the base64 encoded PDF data
        const response = await tripService.getTripLog(tripId, carrierInfo);
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
  }, [tripId]); // Don't include carrierInfo here to prevent auto-reload on field change

  const handleDownload = async () => {
    if (!pdfData) return;
    
    try {
      setDownloading(true);
      
      // Fetch updated PDF with latest carrier info before download
      const response = await tripService.getTripLog(tripId, carrierInfo);
      const updatedPdfData = response.pdfData;
      
      // Convert base64 to blob
      const byteCharacters = atob(updatedPdfData);
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
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCarrierInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));
  };
  
  const handlePreview = async () => {
    if (!tripId) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Fetch updated PDF with latest carrier info
      const response = await tripService.getTripLog(tripId, carrierInfo);
      setPdfData(response.pdfData);
      setFilename(response.filename);
    } catch (err) {
      console.error(`Error previewing PDF log for trip ${tripId}:`, err);
      setError('Failed to preview driver log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !pdfData) {
    return (
      <div className="loader-container">
        <Loader />
        <div className="loader-text">Loading driver log...</div>
      </div>
    );
  }

  if (error && !pdfData) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="log-viewer">
      <div className="log-viewer-header">
        <h2>Driver Daily Log</h2>
        <div className="log-viewer-info">
          <p>Fill in the details below to complete your FMCSA-compliant driver log.</p>
        </div>
      </div>
      
      <div className="carrier-form">
        <h3>Carrier Information</h3>
        <p>This information will appear on the driver's daily log sheet.</p>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="carrierName">Carrier Name:</label>
            <input
              type="text"
              id="carrierName"
              name="carrierName"
              value={carrierInfo.carrierName}
              onChange={handleInputChange}
              placeholder="e.g. Transport Company"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="officeAddress">Main Office Address:</label>
            <input
              type="text"
              id="officeAddress"
              name="officeAddress"
              value={carrierInfo.officeAddress}
              onChange={handleInputChange}
              placeholder="e.g. 123 Trucking Lane, Anytown, USA"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="vehicleNumber">Vehicle/Trailer Number:</label>
            <input
              type="text"
              id="vehicleNumber"
              name="vehicleNumber"
              value={carrierInfo.vehicleNumber}
              onChange={handleInputChange}
              placeholder="e.g. TRK-12345"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="coDriverName">Co-Driver Name (if applicable):</label>
            <input
              type="text"
              id="coDriverName"
              name="coDriverName"
              value={carrierInfo.coDriverName}
              onChange={handleInputChange}
              placeholder="e.g. John Smith"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            onClick={handlePreview} 
            className="preview-button"
            disabled={loading}
          >
            {loading ? (
              <span className="button-with-loader">
                <Loader /> <span>Updating...</span>
              </span>
            ) : (
              'Update Preview'
            )}
          </button>
        </div>
      </div>

      <div className="log-action-container">
        <p>The driver's daily log has been generated and is ready to be downloaded.</p>
        <p>Multiple log sheets will be generated automatically for trips spanning multiple days.</p>
        
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
        
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default LogViewer; 