import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import "./trip-details.css";

export default function NotFound() {
  return <main className="not-found-page"><Compass size={38} /><p className="eyebrow">404</p><h1>This route is off the map.</h1><p>The page you requested does not exist or has moved.</p><Link className="primary-button" to="/dashboard">Return to dashboard</Link></main>;
}
