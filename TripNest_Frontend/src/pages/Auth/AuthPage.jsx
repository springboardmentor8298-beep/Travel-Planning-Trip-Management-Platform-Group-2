import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import "./Auth.css";

/**
 * AuthPage
 *
 * Replicates the full animated Login ↔ Register sliding panel
 * from the original HTML/CSS/JS implementation.
 *
 * State:
 *   isActive — mirrors the `.container.active` class in the original
 */
export default function AuthPage() {
    const [isActive, setIsActive] = useState(true);

    return (
        <div className="auth-page">

            {/* ── Main Card ──────────────────────────────── */}
            <div className={`container ${isActive ? "active" : ""}`}>

                {/* ── Login Form ─────────────────────────── */}
                <div className="form-container login-container">
                    <Login onSuccess={(data) => console.log("Login data:", data)} />
                </div>

                {/* ── Register Form ──────────────────────── */}
                <div className="form-container register-container">
                    <Register
                        onSuccess={() => {
                            setIsActive(false);
                        }}
                    />
                </div>

                {/* ── Sliding Toggle Panel ───────────────── */}
                <div className="toggle-container">
                    <div className="toggle">

                        {/* Left panel — shown when Register is active */}
                        <div className="toggle-panel toggle-left">
                            <h1>Welcome Back!</h1>
                            <p>Already have an account?</p>
                            <button
                                className="hidden-btn"
                                onClick={() => setIsActive(false)}
                            >
                                Login
                            </button>
                        </div>

                        {/* Right panel — shown when Login is active */}
                        <div className="toggle-panel toggle-right">
                            <h1>Hello, Friend!</h1>
                            <p>Don't have an account?</p>
                            <button
                                className="hidden-btn"
                                onClick={() => setIsActive(true)}
                            >
                                Register
                            </button>
                        </div>

                    </div>
                </div>
                {/* ─────────────────────────────────────────── */}

            </div>
        </div>
    );
}
