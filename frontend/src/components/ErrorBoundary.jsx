import React from "react";
import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaRedo, FaChevronLeft } from "react-icons/fa";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("TripNest ErrorBoundary Caught an Error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#F7FAFC",
            color: "#1E293B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "540px",
              width: "100%",
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "24px",
              padding: "2.5rem",
              textAlign: "center",
              boxShadow: "0 10px 30px -5px rgba(30, 41, 59, 0.08)",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "20px",
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                color: "#EF4444",
                fontSize: "2rem",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem",
              }}
            >
              <FaExclamationTriangle />
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.75rem" }}>
              Something Went Wrong Loading Destination
            </h2>

            <p style={{ color: "#64748B", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "1.75rem" }}>
              We encountered an unexpected error displaying this travel page. Please try refreshing or return to the destinations catalog.
            </p>

            {this.state.error?.message && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  borderRadius: "12px",
                  padding: "0.75rem 1rem",
                  fontSize: "0.85rem",
                  color: "#991B1B",
                  fontFamily: "monospace",
                  marginBottom: "1.75rem",
                  wordBreak: "break-word",
                  textAlign: "left",
                }}
              >
                <strong>Error:</strong> {this.state.error.message}
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  background: "#0EA5E9",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "12px",
                  padding: "0.75rem 1.5rem",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 14px rgba(14, 165, 233, 0.25)",
                }}
              >
                <FaRedo /> Try Again
              </button>

              <Link
                to="/destinations"
                style={{
                  background: "#F1F5F9",
                  color: "#475569",
                  border: "1px solid #CBD5E1",
                  borderRadius: "12px",
                  padding: "0.75rem 1.5rem",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <FaChevronLeft /> Catalog
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
