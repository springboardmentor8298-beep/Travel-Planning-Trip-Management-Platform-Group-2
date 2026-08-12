import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const COUNTRY_SUGGESTIONS = [
  "India", "France", "Japan", "Italy", "Thailand", "USA", "UK",
  "Spain", "Australia", "Singapore", "UAE", "Switzerland",
];

const TYPE_OPTIONS = ["Beach", "City", "Mountain", "Island", "Nature", "Heritage", "Pilgrimage"];

export default function AddDestination() {
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    name: "", country: "", description: "", imageUrl: "",
    startingPrice: "", durationDays: "", durationNights: "",
    travelGuideUrl: "", type: "",
    latitude: "", longitude: "",
  });

  // Local file chosen for upload
  const [imageFile, setImageFile] = useState(null);
  const [imageMode, setImageMode] = useState("url"); // "url" | "file"
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
    if (field === "imageUrl" && imageMode === "url") setPreview(val);
  };

  /* ── Image file chosen ── */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ── Get current GPS location ── */
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setGpsLoading(false);
      },
      () => {
        setError("Could not get your location. Please enter coordinates manually.");
        setGpsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = {
        name: form.name,
        country: form.country,
        description: form.description || null,
        imageUrl: imageMode === "url" ? (form.imageUrl || null) : null,
        startingPrice: form.startingPrice ? Number(form.startingPrice) : null,
        durationDays: form.durationDays ? Number(form.durationDays) : null,
        durationNights: form.durationNights ? Number(form.durationNights) : null,
        travelGuideUrl: form.travelGuideUrl || null,
        type: form.type || null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      };

      if (imageMode === "file" && imageFile) {
        // Send as multipart/form-data
        const fd = new FormData();
        fd.append("data", JSON.stringify(data));
        fd.append("image", imageFile);
        await axiosClient.post("/destinations", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosClient.post("/destinations", data);
      }
      navigate("/destinations");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create destination.");
    } finally {
      setLoading(false);
    }
  };

  const googleMapsUrl =
    form.latitude && form.longitude
      ? `https://www.google.com/maps?q=${form.latitude},${form.longitude}`
      : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/destinations")}
          className="text-sm text-brand-600 hover:underline flex items-center gap-1 mb-3"
        >
          ← Back to Destinations
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Add New Destination</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Fill in the details below to add a destination to the explore catalog.
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr_280px] gap-6">
        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Destination Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Bali, Santorini, Goa"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Country / Region <span className="text-red-500">*</span>
            </label>
            <input
              required
              list="country-list"
              value={form.country}
              onChange={set("country")}
              placeholder="e.g. India, France"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <datalist id="country-list">
              {COUNTRY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              value={form.type}
              onChange={set("type")}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">Select a type…</option>
              {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={set("description")}
              placeholder="What makes this destination special? Describe the experience, highlights, best season…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* ── Image section ── */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-slate-700">Cover Image</p>

            {/* Toggle */}
            <div className="flex gap-2">
              {["url", "file"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setImageMode(m); setPreview(""); setImageFile(null); }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    imageMode === m
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white text-slate-600 border-slate-300 hover:border-brand-400"
                  }`}
                >
                  {m === "url" ? "🔗 Paste URL" : "📁 Upload File"}
                </button>
              ))}
            </div>

            {imageMode === "url" ? (
              <div>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={set("imageUrl")}
                  placeholder="https://images.unsplash.com/…"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Paste any public image URL (Unsplash, etc.)
                </p>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="w-full border-2 border-dashed border-slate-300 hover:border-brand-400 rounded-lg px-3 py-4 text-sm text-slate-500 hover:text-brand-600 transition-colors text-center"
                >
                  {imageFile ? (
                    <span className="font-medium text-brand-700">✓ {imageFile.name}</span>
                  ) : (
                    <>
                      <span className="block text-2xl mb-1">📷</span>
                      Click to choose an image file
                    </>
                  )}
                </button>
                <p className="text-xs text-slate-400 mt-1">
                  Supported: JPG, PNG, WebP — max 20 MB
                </p>
              </div>
            )}
          </div>

          {/* ── GPS / Location section ── */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">📍 GPS Location</p>
              <button
                type="button"
                onClick={handleGetGPS}
                disabled={gpsLoading}
                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-full transition-all"
              >
                {gpsLoading ? "Locating…" : "📡 Use My Location"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  value={form.latitude}
                  onChange={set("latitude")}
                  placeholder="e.g. 15.2993"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  value={form.longitude}
                  onChange={set("longitude")}
                  placeholder="e.g. 74.1240"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                />
              </div>
            </div>

            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:underline font-medium"
              >
                🗺️ Preview on Google Maps →
              </a>
            )}
            <p className="text-xs text-slate-400">
              Click "Use My Location" to auto-fill, or type coordinates manually.
            </p>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Starting Price (₹ per person)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">₹</span>
              <input
                type="number"
                min="0"
                value={form.startingPrice}
                onChange={set("startingPrice")}
                placeholder="e.g. 15000"
                className="w-full border border-slate-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration — Days</label>
              <input
                type="number" min="1"
                value={form.durationDays}
                onChange={set("durationDays")}
                placeholder="e.g. 5"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration — Nights</label>
              <input
                type="number" min="0"
                value={form.durationNights}
                onChange={set("durationNights")}
                placeholder="e.g. 4"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Travel guide */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Travel Guide / Booking URL
            </label>
            <input
              type="url"
              value={form.travelGuideUrl}
              onChange={set("travelGuideUrl")}
              placeholder="https://…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium px-6 py-2.5 rounded-lg"
            >
              {loading ? "Saving…" : "Add Destination"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/destinations")}
              className="border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium px-6 py-2.5 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* ── Preview card ── */}
        <aside className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Card Preview</p>
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
            <div className="h-44 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center overflow-hidden">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={() => setPreview("")}
                />
              ) : (
                <span className="text-5xl">🏞️</span>
              )}
            </div>
            <div className="p-4 space-y-1.5">
              <p className="font-bold text-slate-900 truncate">{form.name || "Destination Name"}</p>
              <p className="text-sm text-slate-500 truncate">📍 {form.country || "Country"}</p>
              {form.type && (
                <span className="inline-block text-xs bg-brand-100 text-brand-700 font-semibold px-2 py-0.5 rounded-full">
                  {form.type}
                </span>
              )}
              {form.description && (
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{form.description}</p>
              )}
              {form.startingPrice && (
                <p className="text-xs font-semibold text-emerald-700 mt-1">
                  ₹{Number(form.startingPrice).toLocaleString("en-IN")} / person
                </p>
              )}
              {(form.durationDays || form.durationNights) && (
                <p className="text-xs text-slate-500">
                  🕐 {form.durationDays || "?"}D / {form.durationNights || "?"}N
                </p>
              )}
              {form.latitude && form.longitude && (
                <p className="text-xs text-slate-400">
                  🌐 {Number(form.latitude).toFixed(4)}, {Number(form.longitude).toFixed(4)}
                </p>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center">Preview updates as you type</p>
        </aside>
      </div>
    </div>
  );
}
