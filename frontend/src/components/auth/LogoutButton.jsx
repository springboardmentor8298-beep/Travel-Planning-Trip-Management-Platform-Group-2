import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    navigate("/", { replace: true });
  };

  return (
    <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={handleLogout}>
      <FiLogOut />
      <span>Logout</span>
    </button>
  );
}

export default LogoutButton;
