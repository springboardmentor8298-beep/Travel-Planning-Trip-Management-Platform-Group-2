import { useState, useId } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import "../../styles/PasswordField.css";

function PasswordField({ label, name, value, onChange, placeholder, required }) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();
  const fieldId = name || inputId;

  return (
    <div className="auth-input-field-group">
      {label && (
        <label className="auth-input-label" htmlFor={fieldId}>
          {label}
        </label>
      )}
      <div className="password-field-wrapper">
        <span className="auth-input-icon-slot">
          <FaLock className="auth-input-field-icon" aria-hidden="true" />
        </span>
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="auth-text-input password-text-input"
          autoComplete="new-password"
        />
        <button
          type="button"
          className="password-toggle-action-btn"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <FaEyeSlash className="password-toggle-icon" /> : <FaEye className="password-toggle-icon" />}
        </button>
      </div>
    </div>
  );
}

export default PasswordField;
