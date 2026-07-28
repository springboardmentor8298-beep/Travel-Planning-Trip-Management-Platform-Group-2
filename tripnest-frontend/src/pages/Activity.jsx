import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Activity() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    activityName: "", location: "", date: "", time: ""
  });

  const load = async () => setItems((await api.get("/activities")).data);
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post("/activities", form);
    setForm({ activityName: "", location: "", date: "", time: "" });
    load();
  };

  const remove = async (id) => {
    await api.delete(`/activities/${id}`);
    load();
  };

  return (
    <div className="app-page">
      <Link to="/dashboard">← Dashboard</Link>
      <h1>Activity Scheduling</h1>

      <form className="form-card" onSubmit={create}>
        <input placeholder="Activity name" value={form.activityName}
          onChange={e => setForm({...form, activityName: e.target.value})} required />
        <input placeholder="Location" value={form.location}
          onChange={e => setForm({...form, location: e.target.value})} required />
        <input type="date" value={form.date}
          onChange={e => setForm({...form, date: e.target.value})} />
        <input type="time" value={form.time}
          onChange={e => setForm({...form, time: e.target.value})} />
        <button>Schedule Activity</button>
      </form>

      <div className="list">
        {items.map(item => (
          <div className="item-card" key={item.id}>
            <h2>🎯 {item.activityName}</h2>
            <p>📍 {item.location}</p>
            <p>🗓️ {item.date} at {item.time}</p>
            <button onClick={() => remove(item.id)}>Delete</button>
          </div>
        ))}
        {items.length === 0 && <p>No activities scheduled yet.</p>}
      </div>
    </div>
  );
}

export default Activity;
