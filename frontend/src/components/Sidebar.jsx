import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaHome,
  FaSuitcase,
  FaGlobe,
  FaCalendarAlt,
  FaClock,
  FaWallet,
  FaCreditCard,
  FaBell,
  FaUser,
  FaFileAlt,
} from "react-icons/fa";
import { getUnreadNotificationCount } from "../services/api";
import "../styles/AppLayout.css";

const primaryMenuItems = [
  { path: "/dashboard", label: "Dashboard", icon: <FaHome />, iconColor: "#38BDF8" },
  { path: "/trips", label: "My Trips", icon: <FaSuitcase />, iconColor: "#2563EB" },
  { path: "/destinations", label: "Destinations", icon: <FaGlobe />, iconColor: "#0EA5E9" },
  { path: "/itinerary", label: "Itineraries", icon: <FaCalendarAlt />, iconColor: "#14B8A6" },
  { path: "/activities", label: "Activities", icon: <FaClock />, iconColor: "#EC4899" },
];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await getUnreadNotificationCount();
        setUnreadCount(res.data?.unreadCount || 0);
      } catch (err) {
        console.error("Failed to load unread count in sidebar:", err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const secondaryMenuItems = [
    {
      path: "/budget",
      label: "Budget",
      icon: <FaWallet />,
      iconColor: "#22C55E",
      badge: <span className="sidebar-pill-badge emerald">Tracker</span>,
    },
    {
      path: "/expenses",
      label: "Expenses",
      icon: <FaCreditCard />,
      iconColor: "#F97316",
      badge: <span className="sidebar-pill-badge orange">Cards</span>,
    },
    {
      path: "/reports",
      label: "Reports",
      icon: <FaFileAlt />,
      iconColor: "#0284C7",
      badge: <span className="sidebar-pill-badge" style={{ background: "#E0F2FE", color: "#0284C7" }}>Audit</span>,
    },
    {
      path: "/notifications",
      label: "Notifications",
      icon: <FaBell />,
      iconColor: "#F59E0B",
      badge: unreadCount > 0 ? <span className="sidebar-unread-badge">{unreadCount}</span> : null,
    },
    {
      path: "/profile",
      label: "My Profile",
      icon: <FaUser />,
      iconColor: "#8B5CF6",
      isProfile: true,
    },
  ];

  const handleNavClick = (e, path) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) {
      return;
    }
    e.preventDefault();
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <aside className="app-sidebar" aria-label="Sidebar Navigation">
      {/* MAIN MENU SECTION */}
      <div className="sidebar-group">
        <div className="sidebar-group-title">MAIN MENU</div>
        {primaryMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={(e) => handleNavClick(e, item.path)}
            className={({ isActive }) =>
              `app-sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {({ isActive }) => (
              <motion.div
                className="sidebar-link-inner"
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <span
                  className="app-sidebar-icon"
                  style={{ color: isActive ? "#FFFFFF" : item.iconColor }}
                >
                  {item.icon}
                </span>
                <span className="sidebar-link-label">{item.label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>

      {/* SECTION DIVIDER */}
      <div className="app-sidebar-divider"></div>

      {/* FINANCE & ACCOUNT SECTION */}
      <div className="sidebar-group">
        <div className="sidebar-group-title">FINANCE & ACCOUNT</div>
        {secondaryMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={(e) => handleNavClick(e, item.path)}
            className={({ isActive }) =>
              `app-sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {({ isActive }) => (
              <motion.div
                className="sidebar-link-inner"
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {item.isProfile ? (
                  <div className="sidebar-profile-avatar-wrap">
                    <div className="sidebar-profile-avatar">
                      <FaUser style={{ color: isActive ? "#FFFFFF" : "#8B5CF6" }} />
                    </div>
                    <span className="sidebar-online-status" title="Online"></span>
                  </div>
                ) : (
                  <span
                    className="app-sidebar-icon"
                    style={{ color: isActive ? "#FFFFFF" : item.iconColor }}
                  >
                    {item.icon}
                  </span>
                )}

                <span className="sidebar-link-label">{item.label}</span>

                {item.badge && <div className="ms-auto">{item.badge}</div>}
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
