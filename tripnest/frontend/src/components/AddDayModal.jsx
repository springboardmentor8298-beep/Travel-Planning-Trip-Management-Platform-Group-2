import { useState, useEffect } from "react";

const AddDayModal = ({ isOpen, onClose, onSave, nextDay }) => {
  const [formData, setFormData] = useState({
    day: nextDay || 1,
    description: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        day: nextDay,
        description: "",
      });
    }
  }, [isOpen, nextDay]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.description.trim()) {
      alert("Please enter a description.");
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Add New Day</h2>

        <div style={styles.group}>
          <label>Day Number</label>
          <input
            type="number"
            value={formData.day}
            disabled
            style={styles.input}
          />
        </div>

        <div style={styles.group}>
          <label>Description</label>

          <input
            type="text"
            value={formData.description}
            placeholder="Adventure Activities"
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
            style={styles.input}
          />
        </div>

        <div style={styles.buttons}>
          <button style={styles.cancel} onClick={onClose}>
            Cancel
          </button>

          <button style={styles.save} onClick={handleSubmit}>
            Create Day
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
    background: "rgba(0,0,0,.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modal: {
    width: "450px",
    background: "#1e293b",
    padding: "30px",
    borderRadius: "16px",
    border: "1px solid #7c3aed",
  },

  title: {
    color: "white",
    fontSize: "28px",
    marginBottom: "20px",
  },

  group: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "18px",
  },

  input: {
    marginTop: "6px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "white",
  },

  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },

  cancel: {
    background: "#334155",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  save: {
    background: "#7c3aed",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default AddDayModal;