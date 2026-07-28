import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  return (
    <>
      <Navbar />

      <div className="container text-center mt-5">

        <h1 className="fw-bold">
          Welcome to TripNest
        </h1>

        <p className="lead">
          Smart AI Powered Travel Planning Platform
        </p>

        <div className="mt-4">

          <Link to="/register" className="btn btn-primary me-3">
            Register
          </Link>

          <Link to="/login" className="btn btn-success me-3">
            Login
          </Link>

          <Link to="/dashboard" className="btn btn-dark">
            Dashboard
          </Link>

        </div>

      </div>
    </>
  );
}

export default Home;