import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

const DOC_TYPES = ["TICKET", "VOUCHER", "HOTEL_BOOKING", "PHOTO", "OTHER"];

export default function DocumentUpload({ tripId }) {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [docType, setDocType] = useState("TICKET");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const load = async () => {
    try {
      const res = await api.get(`/trips/${tripId}/documents`);
      setDocuments(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load documents");
    }
  };

  useEffect(() => { load(); }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", docType);

    setUploading(true);
    try {
      // NOTE: no headers object here on purpose. Setting Content-Type
      // manually to "multipart/form-data" strips the boundary parameter
      // the browser would otherwise generate, and the backend can't parse
      // the request without it. Axios detects FormData and sets the
      // correct header (with boundary) automatically.
      await api.post(`/trips/${tripId}/documents`, formData);
      load();
    } catch (err) {
      // Full diagnostic dump - if you see this in DevTools Console, copy
      // the status + data fields exactly, that's what pinpoints the bug.
      console.error("Document upload failed:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const status = err.response?.status;
      const serverMessage = err.response?.data?.error;
      setError(
        serverMessage
          ? `${serverMessage} (HTTP ${status})`
          : `Upload failed - no response from server (check backend is running and CORS is correct). ${err.message}`
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (doc) => {
    const res = await api.get(`/documents/${doc.id}/download`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", doc.originalFileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-lg p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4">📎 Documents</h2>

      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

      <div className="flex gap-2 mb-4">
        <select value={docType} onChange={(e) => setDocType(e.target.value)} className="border border-slate-300 p-2 rounded-lg text-sm">
          {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <label className="flex-1 cursor-pointer">
          <div className="border-2 border-dashed border-emerald-300 rounded-lg p-2 text-center text-xs text-emerald-500 hover:bg-emerald-50 transition">
            {uploading ? "Uploading..." : "Click to choose a file"}
          </div>
          <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" disabled={uploading} />
        </label>
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-slate-500">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleDownload(doc)}
              className="w-full flex justify-between items-center p-3 rounded-xl bg-white/70 border border-slate-100 hover:bg-white text-left"
            >
              <div>
                <span className="text-sm text-slate-700">{doc.originalFileName}</span>
                <div className="text-[11px] text-slate-400">{doc.documentType} · uploaded by {doc.uploadedByEmail}</div>
              </div>
              <span className="text-emerald-500 text-xs">⬇ Download</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
