import { useRef, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import api from "../services/api";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^[6-9]\d{9}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function Register() {
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const termsRef = useRef(null);
  const submitRef = useRef(null);
  const [formData, setFormData] = useState({ fullName: "", email: "", phoneNumber: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError("");
    setFormData((current) => ({
      ...current,
      [name]: name === "phoneNumber" ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));
  };

  const moveOnEnter = (event, nextRef) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    nextRef.current?.focus();
  };

  const getValidationError = () => {
    const fullName = formData.fullName.trim();
    const email = formData.email.trim();

    if (fullName.length < 2) {
      return "Please enter your full name.";
    }

    if (!emailPattern.test(email)) {
      return "Please enter a valid email address.";
    }

    if (!phonePattern.test(formData.phoneNumber)) {
      return "Please enter a valid 10 digit mobile number.";
    }

    if (!passwordPattern.test(formData.password)) {
      return "Password must include uppercase, lowercase, number and special character.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = getValidationError();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        ...formData,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (requestError) {
      const response = requestError.response?.data;
      setError(typeof response === "string" ? response : response?.message || (requestError.response ? "Registration could not be completed. Please check your details and try again." : "Backend server is not running. Please start Spring Boot in IntelliJ and try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="register">
      <div className="auth-heading auth-heading--compact">
        <p className="eyebrow">Start exploring</p>
        <h2>Create your account</h2>
        <p>Your next journey starts with one simple step.</p>
      </div>
      <form className="auth-form auth-form--register" onSubmit={handleSubmit}>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <label>Full name<span className="auth-input"><UserRound size={18} /><input type="text" name="fullName" value={formData.fullName} onChange={handleChange} onKeyDown={(event) => moveOnEnter(event, emailRef)} placeholder="Your full name" autoComplete="name" required /></span></label>
        <label>Email address<span className="auth-input"><Mail size={18} /><input ref={emailRef} type="email" name="email" value={formData.email} onChange={handleChange} onKeyDown={(event) => moveOnEnter(event, phoneRef)} placeholder="you@example.com" autoComplete="email" required /></span></label>
        <label>Phone number<span className="auth-input"><Phone size={18} /><input ref={phoneRef} type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} onKeyDown={(event) => moveOnEnter(event, passwordRef)} placeholder="10 digit mobile number" autoComplete="tel" inputMode="numeric" pattern="[0-9]*" maxLength="10" required /></span></label>
        <label>Password<span className="auth-input"><LockKeyhole size={18} /><input ref={passwordRef} type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} onKeyDown={(event) => moveOnEnter(event, termsRef)} placeholder="Upper, lower, number and symbol" autoComplete="new-password" minLength="8" required /><button type="button" title={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
        <label className="terms-check"><input ref={termsRef} type="checkbox" onKeyDown={(event) => moveOnEnter(event, submitRef)} required /><span>I agree to the Terms of Service and Privacy Policy.</span></label>
        <button ref={submitRef} className="auth-submit" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={18} /> Creating account...</> : "Create account"}</button>
      </form>
    </AuthLayout>
  );
}

export default Register;
