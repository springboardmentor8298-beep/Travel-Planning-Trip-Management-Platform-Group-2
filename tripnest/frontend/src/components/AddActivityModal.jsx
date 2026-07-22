import { useState, useEffect } from "react";

const AddActivityModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    time: "",
    type: "Sightseeing",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        location: "",
        time: "",
        type: "Sightseeing",
        notes: "",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    if (
      !formData.title ||
      !formData.location ||
      !formData.time
    ) {
      alert("Please fill all required fields.");
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Add Activity</h2>

        <div style={styles.group}>
          <label>Activity Name</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            style={styles.input}
            placeholder="Breakfast"
          />
        </div>

        <div style={styles.group}>
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            style={styles.input}
            placeholder="Munnar"
          />
        </div>

        <div style={styles.group}>
          <label>Time</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.group}>
          <label>Activity Type</label>

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={styles.input}
          >
            <option>Sightseeing</option>
            <option>Food</option>
            <option>Transport</option>
            <option>Shopping</option>
            <option>Hotel</option>
            <option>Adventure</option>
          </select>
        </div>

        <div style={styles.group}>
          <label>Notes</label>

          <textarea
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleChange}
            style={styles.textarea}
          />
        </div>

        <div style={styles.buttons}>
          <button
            style={styles.cancel}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            style={styles.save}
            onClick={handleSubmit}
          >
            Save Activity
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
    width: "500px",
    background: "#1e293b",
    padding: "30px",
    borderRadius: "16px",
    border: "1px solid #7c3aed",
  },

  title: {
    color: "white",
    marginBottom: "20px",
    fontSize: "28px",
  },

  group: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "16px",
  },

  input: {
    marginTop: "6px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "white",
  },

  textarea: {
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
    padding: "10px 20px",
    background: "#334155",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  save: {
    padding: "10px 20px",
    background: "#7c3aed",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default AddActivityModal;