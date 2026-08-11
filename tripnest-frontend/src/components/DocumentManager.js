import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import documentService from '../services/document.service';

const DocumentManager = () => {
  const { id } = useParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, type
  
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    documentType: 'PASSPORT',
    description: '',
    expiryDate: '',
    fileUrl: ''
  });

  const DOCUMENT_TYPES = [
    'PASSPORT',
    'VISA',
    'DRIVERS_LICENSE',
    'TRAVEL_INSURANCE',
    'FLIGHT_TICKET',
    'HOTEL_BOOKING',
    'OTHER'
  ];

  useEffect(() => {
    loadDocuments();
  }, [id]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const documentsData = await documentService.getTripDocuments(id);
      setDocuments(documentsData);
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      await documentService.createDocument(id, uploadFormData);
      setShowUploadForm(false);
      setUploadFormData({
        name: '',
        documentType: 'PASSPORT',
        description: '',
        expiryDate: '',
        fileUrl: ''
      });
      loadDocuments();
    } catch (err) {
      setError('Failed to upload document');
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentService.deleteDocument(documentId);
        loadDocuments();
      } catch (err) {
        setError('Failed to delete document');
      }
    }
  };

  const handleFilterByType = async (type) => {
    try {
      setLoading(true);
      if (type === 'all') {
        const documentsData = await documentService.getTripDocuments(id);
        setDocuments(documentsData);
      } else {
        const documentsData = await documentService.getTripDocumentsByType(id, type);
        setDocuments(documentsData);
      }
      setFilter(type);
    } catch (err) {
      setError('Failed to filter documents');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentIcon = (type) => {
    const icons = {
      PASSPORT: '🛂',
      VISA: '📋',
      DRIVERS_LICENSE: '🪪',
      TRAVEL_INSURANCE: '🛡️',
      FLIGHT_TICKET: '✈️',
      HOTEL_BOOKING: '🏨',
      OTHER: '📄'
    };
    return icons[type] || '📄';
  };

  const getDocumentColor = (type) => {
    const colors = {
      PASSPORT: 'var(--gradient-primary)',
      VISA: 'var(--gradient-secondary)',
      DRIVERS_LICENSE: 'var(--gradient-accent)',
      TRAVEL_INSURANCE: 'var(--color-success-bg)',
      FLIGHT_TICKET: 'var(--color-info-bg)',
      HOTEL_BOOKING: 'var(--color-warning-bg)',
      OTHER: 'var(--color-bg-alt)'
    };
    return colors[type] || 'var(--color-bg-alt)';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    return expiry < now;
  };

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Document Manager 📄</h1>
            <p className="page-subtitle">Upload and manage your travel documents</p>
          </div>
          <button className="btn btn-primary btn-auto" onClick={() => setShowUploadForm(!showUploadForm)}>
            {showUploadForm ? 'Cancel' : '+ Upload Document'}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Document Upload Form */}
        {showUploadForm && (
          <div className="section-card">
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Upload New Document</h2>
            <form onSubmit={handleUploadSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="document-name">Document Name *</label>
                  <input
                    id="document-name"
                    name="name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. My Passport"
                    value={uploadFormData.name}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="document-type">Document Type *</label>
                  <select
                    id="document-type"
                    name="documentType"
                    className="form-input form-select"
                    value={uploadFormData.documentType}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, documentType: e.target.value })}
                  >
                    {DOCUMENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="document-description">Description</label>
                <textarea
                  id="document-description"
                  name="description"
                  className="form-input"
                  placeholder="Describe this document"
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="document-expiry">Expiry Date</label>
                  <input
                    id="document-expiry"
                    name="expiryDate"
                    type="date"
                    className="form-input"
                    value={uploadFormData.expiryDate}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, expiryDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="document-url">File URL</label>
                  <input
                    id="document-url"
                    name="fileUrl"
                    type="url"
                    className="form-input"
                    placeholder="https://example.com/document.pdf"
                    value={uploadFormData.fileUrl}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, fileUrl: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary btn-auto">Upload Document</button>
                <button type="button" className="btn btn-outline btn-auto" onClick={() => {
                  setShowUploadForm(false);
                  setUploadFormData({
                    name: '',
                    documentType: 'PASSPORT',
                    description: '',
                    expiryDate: '',
                    fileUrl: ''
                  });
                }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="section-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className={`btn btn-auto ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleFilterByType('all')}
            >
              All
            </button>
            {DOCUMENT_TYPES.map(type => (
              <button 
                key={type}
                className={`btn btn-auto ${filter === type ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleFilterByType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        <div className="section-card">
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
            {filter === 'all' ? 'All Documents' : `${filter} Documents`}
          </h2>
          {loading ? (
            <div className="loading-text">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="empty-state">
              <p>No documents found. Upload your travel documents to get started!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {documents.map((document) => (
                <div 
                  key={document.id}
                  className="stat-card"
                  style={{ 
                    borderLeft: `4px solid ${getDocumentColor(document.documentType)}`,
                    position: 'relative'
                  }}
                >
                  {isExpired(document.expiryDate) && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '1rem', 
                      right: '1rem',
                      background: 'var(--color-error-bg)',
                      color: '#fff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      EXPIRED
                    </div>
                  )}
                  {isExpiringSoon(document.expiryDate) && !isExpired(document.expiryDate) && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '1rem', 
                      right: '1rem',
                      background: 'var(--color-warning-bg)',
                      color: '#fff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      EXPIRING SOON
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '3rem' }}>
                      {getDocumentIcon(document.documentType)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem 0' }}>{document.name}</h3>
                          <span 
                            className="badge" 
                            style={{ background: getDocumentColor(document.documentType), color: '#fff' }}
                          >
                            {document.documentType}
                          </span>
                        </div>
                        <button 
                          className="btn btn-sm btn-danger btn-auto"
                          onClick={() => handleDelete(document.id)}
                        >
                          Delete
                        </button>
                      </div>
                      {document.description && (
                        <p style={{ margin: '0.5rem 0', color: 'var(--color-text-muted)' }}>
                          {document.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        <span>📅 Expiry: {formatDate(document.expiryDate)}</span>
                        <span>📦 Size: {document.fileSize ? `${(document.fileSize / 1024).toFixed(2)} KB` : 'Unknown'}</span>
                        <span>🕒 Uploaded: {formatDate(document.uploadedAt)}</span>
                      </div>
                      {document.fileUrl && (
                        <div style={{ marginTop: '1rem' }}>
                          <a 
                            href={document.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline btn-auto"
                            style={{ display: 'inline-block' }}
                          >
                            View Document
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document Tips */}
        <div className="section-card">
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Document Tips</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px' }}>
              <strong>🛂 Keep copies:</strong> Always keep digital copies of important documents like passports and visas.
            </div>
            <div style={{ padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px' }}>
              <strong>📋 Check expiry dates:</strong> Regularly check document expiry dates and renew them before travel.
            </div>
            <div style={{ padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px' }}>
              <strong>🛡️ Travel insurance:</strong> Upload your travel insurance policy for easy access during emergencies.
            </div>
            <div style={{ padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px' }}>
              <strong>📱 Mobile access:</strong> Store documents in cloud storage for mobile access during your trip.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;
