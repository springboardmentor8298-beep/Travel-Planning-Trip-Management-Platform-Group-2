const DeleteActivityModal = ({
  isOpen,
  onClose,
  onConfirm,
  activityName,
}) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.icon}>🗑️</div>

        <h2 style={styles.title}>Delete Activity</h2>

        <p style={styles.message}>
          Are you sure you want to delete
        </p>

        <h3 style={styles.activityName}>
          "{activityName}"
        </h3>

        <p style={styles.warning}>
          This action cannot be undone.
        </p>

        <div style={styles.buttons}>
          <button
            style={styles.cancelBtn}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            style={styles.deleteBtn}
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modal: {
    width: "420px",
    background: "#1e293b",
    borderRadius: "18px",
    padding: "30px",
    textAlign: "center",
    border: "1px solid #7c3aed",
    boxShadow: "0 0 25px rgba(0,0,0,.4)",
  },

  icon: {
    fontSize: "55px",
    marginBottom: "15px",
  },

  title: {
    color: "white",
    fontSize: "28px",
    marginBottom: "15px",
  },

  message: {
    color: "#cbd5e1",
    marginBottom: "8px",
  },

  activityName: {
    color: "#22d3ee",
    marginBottom: "12px",
  },

  warning: {
    color: "#94a3b8",
    fontSize: "14px",
    marginBottom: "25px",
  },

  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
  },

  cancelBtn: {
    background: "#334155",
    color: "white",
    border: "none",
    padding: "12px 22px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  deleteBtn: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "12px 22px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default DeleteActivityModal;