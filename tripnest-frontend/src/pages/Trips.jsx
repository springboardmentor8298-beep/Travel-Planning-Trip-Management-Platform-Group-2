import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Trips() {
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState({
    title: "", destination: "", startDate: "", endDate: "", description: ""
  });

  const load = async () => {
    const response = await api.get("/trips");
    setTrips(response.data);
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post("/trips", form);
    setForm({ title: "", destination: "", startDate: "", endDate: "", description: "" });
    load();
  };

  const remove = async (id) => {
    await api.delete(`/trips/${id}`);
    load();
  };

  return (
    <div className="app-page">
      <Link to="/dashboard">← Dashboard</Link>
      <h1>Trip Management</h1>

      <form className="form-card" onSubmit={create}>
        <input placeholder="Trip title" value={form.title}
          onChange={e => setForm({...form, title: e.target.value})} required />
        <input placeholder="Destination" value={form.destination}
          onChange={e => setForm({...form, destination: e.target.value})} required />
        <input type="date" value={form.startDate}
          onChange={e => setForm({...form, startDate: e.target.value})} />
        <input type="date" value={form.endDate}
          onChange={e => setForm({...form, endDate: e.target.value})} />
        <textarea placeholder="Description" value={form.description}
          onChange={e => setForm({...form, description: e.target.value})} />
        <button>Create Trip</button>
      </form>

      <div className="list">
        {trips.map(trip => (
          <div className="item-card" key={trip.id}>
            <h2>{trip.title}</h2>
            <p>📍 {trip.destination}</p>
            <p>{trip.startDate} → {trip.endDate}</p>
            <p>{trip.description}</p>
            <button onClick={() => remove(trip.id)}>Delete</button>
          </div>
        ))}
        {trips.length === 0 && <p>No trips yet. Create your first trip.</p>}
      </div>
    </div>
  );
}

export default Trips;
