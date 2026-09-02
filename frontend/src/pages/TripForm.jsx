import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { tripApi } from "../api/tripApi";
import FormField from "../components/FormField";

const emptyForm = {
  title: "",
  destination: "",
  startDate: "",
  endDate: "",
  budget: "",
  description: "",
  status: "PLANNED",
};

export default function TripForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    tripApi
      .getTrip(id)
      .then((res) => setForm({ ...res.data, budget: res.data.budget ?? "" }))
      .catch(() => setErrorMsg("Could not load this trip."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    if (isEdit) return;
    const params = new URLSearchParams(location.search);
    const title = params.get("title");
    const destination = params.get("destination");

    if (!title && !destination) return;

    setForm((prev) => ({
      ...prev,
      title: title || prev.title,
      destination: destination || prev.destination,
    }));
  }, [isEdit, location.search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const payload = { ...form, budget: form.budget === "" ? null : Number(form.budget) };
      if (isEdit) {
        await tripApi.updateTrip(id, payload);
      } else {
        await tripApi.createTrip(payload);
      }
      navigate("/trips");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to save trip.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-10 text-slate-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{isEdit ? "Edit Trip" : "Plan a New Trip"}</h1>

      {errorMsg && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <FormField label="Trip Title">
          <input
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Summer Escape to Goa"
          />
        </FormField>

        <FormField label="Destination">
          <input
            name="destination"
            required
            value={form.destination}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Goa, India"
          />
        </FormField>

        <div className="grid sm:grid-cols-2 gap-x-4">
          <FormField label="Start Date">
            <input
              type="date"
              name="startDate"
              required
              value={form.startDate}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </FormField>
          <FormField label="End Date">
            <input
              type="date"
              name="endDate"
              required
              value={form.endDate}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </FormField>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-4">
          <FormField label="Budget (₹)">
            <input
              type="number"
              min="0"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="25000"
            />
          </FormField>
          <FormField label="Status">
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="PLANNED">Planned</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </FormField>
        </div>

        <FormField label="Description">
          <textarea
            name="description"
            rows={4}
            value={form.description || ""}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Notes about this trip..."
          />
        </FormField>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2.5 rounded-md text-sm disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Trip"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/trips")}
            className="text-slate-600 font-medium px-5 py-2.5 rounded-md text-sm hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
