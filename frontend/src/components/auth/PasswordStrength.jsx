import "../../styles/PasswordStrength.css";

function PasswordStrength({ password }) {
  const tests = [
    { label: "Minimum 8 characters", valid: password.length >= 8 },
    { label: "Uppercase", valid: /[A-Z]/.test(password) },
    { label: "Lowercase", valid: /[a-z]/.test(password) },
    { label: "Number", valid: /[0-9]/.test(password) },
    { label: "Special Character", valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = tests.filter((test) => test.valid).length;
  const strength = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Excellent"][score];

  return (
    <div className="password-strength-panel">
      <div className="password-strength-bar">
        {tests.map((test, index) => (
          <span
            key={test.label}
            className={`strength-step ${test.valid ? "valid" : "invalid"}`}
            style={{ width: `${100 / tests.length}%` }}
          />
        ))}
      </div>
      <div className="password-strength-meta">
        <span className="strength-label">Password strength: {strength}</span>
        <ul className="strength-list">
          {tests.map((test) => (
            <li key={test.label} className={test.valid ? "valid" : "invalid"}>
              {test.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PasswordStrength;
