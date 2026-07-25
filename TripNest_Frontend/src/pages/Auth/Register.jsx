import { useState, useRef } from "react";
import { registerUser } from "../../services/authService";
import toast from "react-hot-toast";
/**
 * Register
 * Props:
 *   onSuccess — called when form is valid and submitted
 */
export default function Register({ onSuccess }) {
    // ── State ──────────────────────────────────────────────
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState({});

    const btnRef = useRef(null);

    // ── Validation ─────────────────────────────────────────
    function validate() {
        const errs = {};
        if (!username.trim()) errs.username = true;
        if (!email.trim()) errs.email = true;
        if (!password.trim()) errs.password = true;
        return errs;
    }

    // ── Ripple ─────────────────────────────────────────────
    function addRipple(e) {
        const btn = btnRef.current;
        const existing = btn.querySelector(".ripple");
        if (existing) existing.remove();

        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;

        const span = document.createElement("span");
        span.className = "ripple";
        span.style.width = span.style.height = `${diameter}px`;
        span.style.left = `${e.clientX - btn.getBoundingClientRect().left - radius}px`;
        span.style.top = `${e.clientY - btn.getBoundingClientRect().top - radius}px`;

        btn.appendChild(span);
    }

    // ── Submit ─────────────────────────────────────────────
    async function handleSubmit(e) {
        e.preventDefault();
        addRipple(e);

        const errs = validate();
        setErrors(errs);

        if (Object.keys(errs).length > 0) {
            return;
        }

        try {
            await registerUser({
                fullName: username,
                email,
                password,
            });

            // Clear form
            setUsername("");
            setEmail("");
            setPassword("");

            // Move to login page
            onSuccess?.();

            toast.success("Registration Successful! Please login.");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Registration Failed"
            );
        }
    }

    // ── Render ─────────────────────────────────────────────
    return (
        <form onSubmit={handleSubmit} noValidate>
            <h1>Create Account</h1>

            {/* Username */}
            <div className="input-box">
                <input
                    type="text"
                    placeholder="Full Name"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        setErrors((prev) => ({ ...prev, username: false }));
                    }}
                    className={errors.username ? "input-error" : ""}
                    required
                />
                <i className="fa-solid fa-user" />
            </div>

            {/* Email */}
            <div className="input-box">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: false }));
                    }}
                    className={errors.email ? "input-error" : ""}
                    required
                />
                <i className="fa-solid fa-envelope" />
            </div>

            {/* Password */}
            <div className="input-box">
                <input
                    type={showPass ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, password: false }));
                    }}
                    className={errors.password ? "input-error" : ""}
                    required
                />
                <button
                    type="button"
                    className="input-icon"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                >
                    <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
            </div>

            {/* Submit */}
            <button
                ref={btnRef}
                type="submit"
                className="submit-btn"
            >
                Register
            </button>

            <p className="or-text">or register with</p>

            {/* Social icons */}
            <div className="social-icons">
                <a href="#!" aria-label="Google">
                    <i className="fab fa-google" />
                </a>
                <a href="#!" aria-label="Facebook">
                    <i className="fab fa-facebook-f" />
                </a>
                <a href="#!" aria-label="GitHub">
                    <i className="fab fa-github" />
                </a>
                <a href="#!" aria-label="LinkedIn">
                    <i className="fab fa-linkedin-in" />
                </a>
            </div>
        </form>
    );
}
