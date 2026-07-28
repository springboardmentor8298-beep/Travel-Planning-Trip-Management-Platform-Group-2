import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function DashboardCard({ module, onOpen }) {
  const navigate = useNavigate();
  const Icon = module.icon;
  const isAvailable = module.status === "Available";

  return (
    <button className="module-card" type="button" onClick={() => isAvailable ? navigate(module.path) : onOpen(module)}>
      <span className={`module-icon module-icon--${module.accent}`}><Icon size={20} /></span>
      <span className="module-card__body">
        <span className="module-card__title">{module.title}</span>
        <span className="module-card__description">{module.description}</span>
        <span className={`module-status ${isAvailable ? "module-status--ready" : ""}`}>{module.status}</span>
      </span>
      <ArrowUpRight className="module-card__arrow" size={18} />
    </button>
  );
}

export default DashboardCard;
