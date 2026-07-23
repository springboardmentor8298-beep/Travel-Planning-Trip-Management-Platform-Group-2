import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {

    const navigate = useNavigate();

    const logout = () => {

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        alert("Logged Out Successfully!");

        navigate("/");
    };

    return (

        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

            <div className="container">

                <Link className="navbar-brand" to="/dashboard">
                    🌍 TripNest
                </Link>

                <div className="ms-auto">

                    <Link
                        className="btn btn-outline-light me-2"
                        to="/dashboard"
                    >
                        Dashboard
                    </Link>

                    <button
                        className="btn btn-danger"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </div>

        </nav>

    );
}

export default Navbar;