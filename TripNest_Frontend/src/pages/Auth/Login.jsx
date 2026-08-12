import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { loginUser } from "../../services/authService";
import { saveToken } from "../../utils/token";
import {
    FaGoogle,
    FaFacebookF,
    FaGithub,
    FaLinkedinIn
} from "react-icons/fa";
export default function Login({ onSuccess }) {

    const navigate = useNavigate();
    const { loginUser: setLoggedInUser } = useAppContext();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState({});

    const btnRef = useRef(null);

    function validate() {

        const errs = {};

        if (!email.trim()) errs.email = true;

        if (!password.trim()) errs.password = true;

        return errs;
    }

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

    async function handleSubmit(e) {

        e.preventDefault();

        addRipple(e);

        const errs = validate();

        setErrors(errs);

        if (Object.keys(errs).length > 0) return;

        try {

            const response = await loginUser({

                email,

                password

            });

            console.log(response.data);

            saveToken(response.data.data.token);

            const loggedInUser = response.data.data;
            setLoggedInUser(loggedInUser);

            if (loggedInUser.role === 'ADMIN') {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        } catch (error) {

            alert(

                error.response?.data?.message ||

                "Invalid Email or Password"

            );

        }

    }

    // ── Render ─────────────────────────────────────────────
    return (
        <form onSubmit={handleSubmit} noValidate>
            <h1>Login</h1>

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
                {/* Eye toggle — rendered as a plain button to avoid form submit */}
                <button
                    type="button"
                    className="input-icon"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                >
                    <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
            </div>

            {/* Forgot password */}
            <a href="#!" className="forgot-link">
                Forgot Password?
            </a>

            {/* Submit */}
            <button
                ref={btnRef}
                type="submit"
                className="submit-btn"
            >
                Login
            </button>

            <p className="or-text">or login with</p>

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
