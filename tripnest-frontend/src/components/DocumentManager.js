import React, { useEffect, useState, useCallback } from 'react';
import { getDocuments, uploadDocument, deleteDocument } from '../services/document.service';
import { useAuth } from '../context/AuthContext';

const DOC_TYPES = ['TICKET', 'HOTEL_BOOKING', 'PASSPORT', 'VISA', 'PHOTO', 'OTHER'];

const DOC_ICONS = {
  TICKET: '🎫', HOTEL_BOOKING: '🏨', PASSPORT: '📘',
  VISA: '📋', PHOTO: '📷', OTHER: '📄',
};

export default function DocumentManager({ tripId }) {
  const { currentUser } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('OTHER');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getDocuments(tripId).then(setDocs).finally(() => setLoading(false));
  }, [tripId]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      await uploadDocument(tripId, file, selectedDocType);
      setSuccess(`"${file.name}" uploaded successfully!`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async (docId, fileName) => {
    if (!window.confirm(`Delete "${fileName}"?`)) return;
    await deleteDocument(tripId, docId);
    load();
  };

  const groupedDocs = DOC_TYPES.reduce((acc, type) => {
    const typeDocs = docs.filter((d) => d.docType === type);
    if (typeDocs.length > 0) acc[type] = typeDocs;
    return acc;
  }, {});

  return (
    <div className="document-manager">
      {/* Upload Area */}
      <div className="doc-upload-section">
        <h4>Upload Document</h4>
        <div className="doc-type-selector">
          <label>Document Type:</label>
          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            className="form-control form-control--inline"
          >
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>{DOC_ICONS[t]} {t.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div
          className={`doc-dropzone ${dragOver ? 'doc-dropzone--active' : ''} ${uploading ? 'doc-dropzone--uploading' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="dropzone-content">
              <div className="spinner" />
              <p>Uploading...</p>
            </div>
          ) : (
            <div className="dropzone-content">
              <div className="dropzone-icon">📂</div>
              <p>Drag & drop a file here, or</p>
              <label className="btn btn-secondary btn-sm upload-label">
                Browse Files
                <input type="file" hidden onChange={handleFileInput} />
              </label>
              <p className="dropzone-hint">Max 10MB. PDF, images, and documents supported.</p>
            </div>
          )}
        </div>
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}
      </div>

      {/* Documents List */}
      <div className="doc-list-section">
        <h4>Uploaded Documents ({docs.length})</h4>
        {loading ? (
          <div className="loading-text">Loading documents...</div>
        ) : Object.keys(groupedDocs).length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📁</div>
            <p>No documents uploaded yet. Upload tickets, hotel bookings, or passports.</p>
          </div>
        ) : (
          Object.entries(groupedDocs).map(([type, typeDocs]) => (
            <div key={type} className="doc-group">
              <div className="doc-group__header">
                {DOC_ICONS[type]} {type.replace('_', ' ')} ({typeDocs.length})
              </div>
              <div className="doc-cards">
                {typeDocs.map((doc) => (
                  <div key={doc.id} className="doc-card">
                    <div className="doc-card__icon">{DOC_ICONS[doc.docType] || '📄'}</div>
                    <div className="doc-card__info">
                      <div className="doc-card__name" title={doc.fileName}>{doc.fileName}</div>
                      <div className="doc-card__meta">
                        by @{doc.uploaderUsername} · {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div className="doc-card__actions">
                      <a
                        href={doc.downloadUrl}
                        className="btn-icon btn-icon--download"
                        title="Download"
                        download
                      >
                        ⬇️
                      </a>
                      {currentUser?.username === doc.uploaderUsername && (
                        <button
                          className="btn-icon btn-icon--delete"
                          onClick={() => handleDelete(doc.id, doc.fileName)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
