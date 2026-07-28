import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Destinations() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", country: "", description: "" });

  const load = async () => setItems((await api.get("/destinations")).data);
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post("/destinations", form);
    setForm({ name: "", country: "", description: "" });
    load();
  };

  const remove = async (id) => {
    await api.delete(`/destinations/${id}`);
    load();
  };

  return (
    <div className="app-page">
      <Link to="/dashboard">← Dashboard</Link>
      <h1>Destination Management</h1>

      <form className="form-card" onSubmit={create}>
        <input placeholder="Destination name" value={form.name}
          onChange={e => setForm({...form, name: e.target.value})} required />
        <input placeholder="Country" value={form.country}
          onChange={e => setForm({...form, country: e.target.value})} required />
        <textarea placeholder="Description" value={form.description}
          onChange={e => setForm({...form, description: e.target.value})} />
        <button>Add Destination</button>
      </form>

      <div className="list">
        {items.map(item => (
          <div className="item-card" key={item.id}>
            <h2>📍 {item.name}</h2>
            <p>{item.country}</p>
            <p>{item.description}</p>
            <button onClick={() => remove(item.id)}>Delete</button>
          </div>
        ))}
        {items.length === 0 && <p>No destinations yet.</p>}
      </div>
    </div>
  );
}

export default Destinations;
