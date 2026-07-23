import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import beach from "../assets/beach.jpg";
import "../styles/Login.css";

function Login() {

    const navigate = useNavigate();

    const [user, setUser] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });
    };

    const login = async () => {

        try {

            const response = await API.post("/auth/login", user);

            console.log(response.data);

            // Save JWT Token
            localStorage.setItem("token", response.data.token);

            // Save User Details
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            alert("Login Successful!");

            navigate("/dashboard");

        } catch (error) {

            console.error(error);

            if (error.response) {

                alert("Login Failed : " + error.response.status);

            } else {

                alert("Cannot connect to Spring Boot Backend!");

            }

        }

    };

    return (

        <div
            className="login-page"
            style={{
                backgroundImage: `url(${beach})`,
            }}
        >

            <div className="login-card">

                <h1>🌴 Welcome to TripNest</h1>

                <p>Plan Your Dream Vacation</p>

                <input
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    value={user.email}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Enter Password"
                    value={user.password}
                    onChange={handleChange}
                />

                <button onClick={login}>
                    Login
                </button>

                <br />
                <br />

                <Link to="#">Forgot Password?</Link>

                <p>
                    New User?{" "}
                    <Link to="/signup">
                        Sign Up
                    </Link>
                </p>

            </div>

        </div>

    );
}

export default Login;