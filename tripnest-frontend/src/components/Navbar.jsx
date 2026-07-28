import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
      <div className="container">

        <Link className="navbar-brand fw-bold" to="/">
          🌍 TripNest
        </Link>

        <div>

          <Link className="btn btn-outline-light me-2" to="/">
            Home
          </Link>

          <Link className="btn btn-outline-light me-2" to="/dashboard">
            Dashboard
          </Link>

          <Link className="btn btn-light me-2" to="/login">
            Login
          </Link>

          <Link className="btn btn-warning" to="/register">
            Register
          </Link>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;