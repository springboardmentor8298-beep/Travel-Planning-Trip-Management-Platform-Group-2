import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Itinerary() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ tripName: "", day: "", plan: "" });

  const load = async () => setItems((await api.get("/itineraries")).data);
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post("/itineraries", form);
    setForm({ tripName: "", day: "", plan: "" });
    load();
  };

  const remove = async (id) => {
    await api.delete(`/itineraries/${id}`);
    load();
  };

  return (
    <div className="app-page">
      <Link to="/dashboard">← Dashboard</Link>
      <h1>Itinerary Management</h1>

      <form className="form-card" onSubmit={create}>
        <input placeholder="Trip name" value={form.tripName}
          onChange={e => setForm({...form, tripName: e.target.value})} required />
        <input placeholder="Day (e.g. Day 1)" value={form.day}
          onChange={e => setForm({...form, day: e.target.value})} required />
        <textarea placeholder="Plan for the day" value={form.plan}
          onChange={e => setForm({...form, plan: e.target.value})} required />
        <button>Add to Itinerary</button>
      </form>

      <div className="list">
        {items.map(item => (
          <div className="item-card" key={item.id}>
            <h2>{item.tripName} — {item.day}</h2>
            <p>{item.plan}</p>
            <button onClick={() => remove(item.id)}>Delete</button>
          </div>
        ))}
        {items.length === 0 && <p>No itinerary items yet.</p>}
      </div>
    </div>
  );
}

export default Itinerary;
