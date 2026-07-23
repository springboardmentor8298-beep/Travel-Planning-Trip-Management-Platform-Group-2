import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/Signup.css";

function Signup() {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        name: "",
        age: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });
    };

    const register = async () => {
        try {
            const response = await API.post("/users/register", user);

            console.log("Response:", response.data);

            alert("Registration Successful!");

            navigate("/");
        } catch (error) {
            console.error("Registration Error:", error);

            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Data:", error.response.data);
                alert("Registration Failed!\nStatus: " + error.response.status);
            } else if (error.request) {
                console.log(error.request);
                alert("Cannot connect to Spring Boot Backend!");
            } else {
                console.log(error.message);
                alert("Error: " + error.message);
            }
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-card">

                <h1>Create Account</h1>

                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={user.name}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={user.age}
                    onChange={handleChange}
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={user.email}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={user.password}
                    onChange={handleChange}
                />

                <button onClick={register}>
                    Register
                </button>

                <p>
                    Already have an account?
                    <Link to="/"> Login</Link>
                </p>

            </div>
        </div>
    );
}

export default Signup;