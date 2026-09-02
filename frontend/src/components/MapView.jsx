import React, { useEffect, useRef } from "react";

// Inject Leaflet CSS once
function injectLeafletCSS() {
  if (document.getElementById("leaflet-css")) return;
  const link = document.createElement("link");
  link.id = "leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
}

const TYPE_COLORS = {
  SIGHTSEEING: "#6366f1",
  TRANSPORTATION: "#f59e0b",
  ACCOMMODATION: "#10b981",
  DINING: "#ec4899",
  ADVENTURE: "#ef4444",
  SHOPPING: "#8b5cf6",
  OTHER: "#64748b",
};

const TYPE_EMOJI = {
  SIGHTSEEING: "🏛",
  TRANSPORTATION: "🚌",
  ACCOMMODATION: "🏨",
  DINING: "🍜",
  ADVENTURE: "🧗",
  SHOPPING: "🛍",
  OTHER: "📍",
};

function makeIcon(L, color, emoji, index) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="36" height="48">
      <path fill="${color}" stroke="white" stroke-width="2"
            d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z"/>
      <circle cx="18" cy="18" r="11" fill="white" opacity="0.95"/>
      <text x="18" y="23" text-anchor="middle" font-size="13">${emoji || "📍"}</text>
      ${index !== undefined
      ? `<text x="18" y="10" text-anchor="middle" font-size="8" fill="white" font-weight="bold">${index + 1}</text>`
      : ""}
    </svg>`;
  return L.divIcon({
    html: svg,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48],
    className: "",
  });
}

export default function MapView({
  markers = [],
  drawRoute = false,
  center,
  zoom = 13,
  height = "360px",
  className = "",
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const routeRef = useRef(null);
  const timerRef = useRef(null);   // track the invalidateSize timeout
  const mountedRef = useRef(true);   // track whether component is still mounted

  /* ── Main map effect ──────────────────────────────────────── */
  useEffect(() => {
    injectLeafletCSS();

    let L;
    try {
      L = require("leaflet");
    } catch {
      return;
    }

    // Guard: container must still be in DOM
    if (!containerRef.current || !mountedRef.current) return;

    // Fix broken default icon paths in CRA
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const validMarkers = markers.filter(
      (m) => m && typeof m.lat === "number" && typeof m.lng === "number"
    );

    const defaultCenter = validMarkers.length
      ? [validMarkers[0].lat, validMarkers[0].lng]
      : [20.5937, 78.9629];
    const mapCenter = center || defaultCenter;

    // Init map only once per mount
    if (!mapRef.current) {
      try {
        mapRef.current = L.map(containerRef.current, {
          center: mapCenter,
          zoom,
          zoomControl: true,
          scrollWheelZoom: true,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(mapRef.current);
      } catch (e) {
        // Container not yet ready — bail silently
        mapRef.current = null;
        return;
      }
    }

    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers safely
    markersRef.current.forEach((m) => { try { m.remove(); } catch { } });
    markersRef.current = [];
    if (routeRef.current) { try { routeRef.current.remove(); } catch { } routeRef.current = null; }

    // Add new markers
    validMarkers.forEach((m, i) => {
      if (!mountedRef.current) return;
      const color = m.color || TYPE_COLORS[m.type] || "#6366f1";
      const emoji = TYPE_EMOJI[m.type] || "📍";
      const icon = makeIcon(L, color, emoji, drawRoute ? i : undefined);
      try {
        const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
        if (m.label) {
          marker.bindPopup(`
            <div style="min-width:140px">
              <strong style="font-size:13px">${m.label}</strong>
              ${m.sublabel ? `<br/><span style="font-size:11px;color:#64748b">${m.sublabel}</span>` : ""}
              ${m.time ? `<br/><span style="font-size:11px;color:#6366f1">🕐 ${m.time}</span>` : ""}
            </div>
          `);
        }
        markersRef.current.push(marker);
      } catch { }
    });

    // Route polyline
    if (drawRoute && validMarkers.length > 1) {
      try {
        routeRef.current = L.polyline(
          validMarkers.map((m) => [m.lat, m.lng]),
          { color: "#6366f1", weight: 3, dashArray: "8 6", opacity: 0.85 }
        ).addTo(map);
      } catch { }
    }

    // Fit bounds
    try {
      if (validMarkers.length > 1) {
        map.fitBounds(
          L.latLngBounds(validMarkers.map((m) => [m.lat, m.lng])),
          { padding: [40, 40] }
        );
      } else if (validMarkers.length === 1) {
        map.setView([validMarkers[0].lat, validMarkers[0].lng], zoom);
      }
    } catch { }

    // Invalidate size — cancel any pending timer first, only run if still mounted
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (mountedRef.current && mapRef.current) {
        try { mapRef.current.invalidateSize(); } catch { }
      }
    }, 150);
  }, [markers, drawRoute, center, zoom]); // eslint-disable-line

  /* ── Cleanup on unmount ───────────────────────────────────── */
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cancel pending timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      // Remove map instance
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch { }
        mapRef.current = null;
      }
      markersRef.current = [];
      routeRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`rounded-xl overflow-hidden border border-slate-200 ${className}`}
      style={{ height, zIndex: 0 }}
    />
  );
}
