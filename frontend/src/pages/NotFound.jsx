import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCompass, FaHome, FaArrowLeft } from "react-icons/fa";
import "../styles/AppLayout.css";

function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)",
        padding: "2rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          background: "#FFFFFF",
          borderRadius: "24px",
          padding: "3.5rem 2.5rem",
          maxWidth: "540px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 40px -15px rgba(14, 165, 233, 0.15)",
          border: "1px solid #E2E8F0",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "24px",
            background: "#E0F2FE",
            color: "#0284C7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem",
            margin: "0 auto 1.5rem auto",
          }}
        >
          <FaCompass />
        </div>

        <h1 style={{ fontSize: "3.5rem", fontWeight: "800", color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>
          404
        </h1>
        <h2 style={{ fontSize: "1.35rem", fontWeight: "700", color: "#334155", margin: "0.5rem 0 1rem 0" }}>
          Destination Off The Map
        </h2>
        <p style={{ color: "#64748B", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "2rem" }}>
          The page or travel document you are searching for does not exist or has been relocated to another itinerary.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => window.history.back()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.25rem",
              borderRadius: "12px",
              background: "#F1F5F9",
              color: "#475569",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
            }}
          >
            <FaArrowLeft /> Go Back
          </button>

          <Link
            to="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
              background: "#0284C7",
              color: "#FFFFFF",
              fontWeight: "600",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)",
            }}
          >
            <FaHome /> Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default NotFound;
