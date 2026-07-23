import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
import Destinations from "./Destinations";
import TripPlan from "./TripPlan";
import MyTrips from "./MyTrips";
import Footer from "./Footer";
import "../styles/Dashboard.css";

function Dashboard() {

    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <>
            <Navbar />

            <div className="dashboard">

                <div className="welcome-card">

                    <h1>
                        👋 Welcome {user?.name || "Guest"}
                    </h1>

                    <p>
                        Discover amazing destinations and plan your dream vacation with ease.
                    </p>

                </div>

                <SearchBar />

                <Destinations />

                <TripPlan />

                <MyTrips />

            </div>

            <Footer />
        </>
    );
}

export default Dashboard;