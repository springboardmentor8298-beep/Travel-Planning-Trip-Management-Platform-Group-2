import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getTripStatus, formatDateRange } from '../utils/date';
import { formatCurrency } from '../utils/currency';
import { createTrip, getMyTrips, deleteTrip as deleteTripApi, updateTrip as updateTripApi } from "../services/tripService";
import {
  Search,
  SlidersHorizontal,
  Plus,
  MapPin,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  Eye,
  Luggage,
  X,
  AlertTriangle
} from 'lucide-react';

const Trips = ({ setActivePage, setSelectedTripId, isCreateOpenInitially, closeCreateInitially }) => {

  const { addTrip: addTripToContext, updateTrip: updateTripInContext } = useAppContext();

  const [trips, setTrips] = useState([]);
  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {

    try {

      const response = await getMyTrips();
      const tripList = Array.isArray(response?.data?.data) ? response.data.data : [];

      setTrips(tripList.map((trip) => ({
        ...trip,
        title: trip.title ?? trip.tripName ?? '',
        tripName: trip.tripName ?? trip.title ?? '',
        destination: trip.destination ?? trip.destinationName ?? '',
        destinationName: trip.destinationName ?? trip.destination ?? ''
      })));

    } catch (error) {

      console.error(error);

    }

  }

  // Local Search / Filter / Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Active, Upcoming, Completed
  const [sortBy, setSortBy] = useState('startDate-asc'); // startDate-asc, startDate-desc, budget-desc, title-asc

  // Modal control state
  const [isCreateOpen, setIsCreateOpen] = useState(isCreateOpenInitially || false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingTripId, setDeletingTripId] = useState(null);

  // Form Fields
  const [formFields, setFormFields] = useState({
    title: '',
    destinationName: '',
    city: '',
    state: '',
    country: '',
    totalMembers: '',
    startDate: '',
    endDate: '',
    budget: '',
    notes: ''
  });

  const resetForm = () => {
    setFormFields({
      title: '',
      destinationName: '',
      city: '',
      state: '',
      country: '',
      totalMembers: '',
      startDate: '',
      endDate: '',
      budget: '',
      notes: ''
    });
  };

  // Close create shortcut callback if triggered from Header
  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    if (closeCreateInitially) closeCreateInitially();
    resetForm();
  };

  // Open Edit Form
  const handleOpenEdit = (trip) => {
    setEditingTrip(trip);
    setFormFields({
      title: trip.title ?? trip.tripName ?? '',
      destinationName: trip.destinationName ?? trip.destination ?? '',
      city: trip.city ?? '',
      state: trip.state ?? '',
      country: trip.country ?? '',
      totalMembers: trip.totalMembers ?? '',
      startDate: trip.startDate ?? '',
      endDate: trip.endDate ?? '',
      budget: trip.budget ?? '',
      notes: trip.notes || ''
    });
    setIsEditOpen(true);
  };

  // Handle Form Submit (Create)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (
      !formFields.title ||
      !formFields.destinationName ||
      !formFields.city ||
      !formFields.state ||
      !formFields.country ||
      !formFields.startDate ||
      !formFields.endDate ||
      !formFields.budget
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (new Date(formFields.endDate) < new Date(formFields.startDate)) {
      alert("End date cannot be earlier than the start date.");
      return;
    }

    try {
      const tripPayload = {
        title: formFields.title,
        tripName: formFields.title,
        destination: formFields.destinationName,
        destinationName: formFields.destinationName,
        city: formFields.city,
        state: formFields.state,
        country: formFields.country,
        totalMembers: Number.parseInt(formFields.totalMembers || '1', 10),
        startDate: formFields.startDate,
        endDate: formFields.endDate,
        budget: Number.parseFloat(formFields.budget),
        notes: formFields.notes
      };

      await createTrip(tripPayload);
      await loadTrips();
      await loadTrips();
      alert("Trip Created Successfully");

      handleCloseCreate();

    } catch (error) {

      console.error(error);

      alert("Failed to create trip");

    }
  };

  // Handle Form Submit (Edit)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formFields.title || !formFields.destinationName || !formFields.startDate || !formFields.endDate || !formFields.budget) {
      alert("Please fill in all required fields.");
      return;
    }

    if (new Date(formFields.endDate) < new Date(formFields.startDate)) {
      alert("End date cannot be earlier than the start date.");
      return;
    }

    try {
      const tripPayload = {
        title: formFields.title,
        tripName: formFields.title,
        destination: formFields.destinationName,
        destinationName: formFields.destinationName,
        startDate: formFields.startDate,
        endDate: formFields.endDate,
        budget: Number.parseFloat(formFields.budget),
        notes: formFields.notes
      };

      await updateTripApi(editingTrip.id, tripPayload);
      updateTripInContext(editingTrip.id, tripPayload);
      await loadTrips();

      setIsEditOpen(false);
      setEditingTrip(null);
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Failed to update trip");
    }
  };

  // Open Delete Confirm
  const handleOpenDelete = (id) => {
    setDeletingTripId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {

    if (!deletingTripId) return;

    try {


      await deleteTripApi(deletingTripId);

      await loadTrips();   // Refresh trips from backend

      setIsDeleteConfirmOpen(false);
      setDeletingTripId(null);

      alert("Trip deleted successfully");

    } catch (error) {

      console.error(error);

      alert("Failed to delete trip");

    }
  };

  const handleViewDetails = (id) => {
    setSelectedTripId(id);
    setActivePage('trip-details');
  };

  // Filter & Sort Logic
  const filteredTrips = trips.filter(trip => {
    const status = getTripStatus(trip.startDate, trip.endDate);

    // Search filter
    const matchesSearch =
      (trip.tripName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.destination ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    // Status filter
    const matchesStatus = statusFilter === 'All' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    switch (sortBy) {
      case 'startDate-asc':
        return new Date(a.startDate) - new Date(b.startDate);
      case 'startDate-desc':
        return new Date(b.startDate) - new Date(a.startDate);
      case 'budget-desc':
        return b.budget - a.budget;
      case "title-asc":
        return (a.tripName ?? "").localeCompare(b.tripName ?? "");
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6 p-1 sm:p-2">
      {/* Search / Filter toolbar */}
      <div className="rounded-[28px] border border-white/70 bg-white/70 p-4 shadow-[0_20px_45px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 shadow-sm shadow-slate-200/50 transition-all duration-300 focus-within:border-indigo-400 focus-within:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:shadow-none dark:focus-within:border-sky-500">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search trips by title or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm text-slate-700 outline-none dark:text-slate-200"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm text-slate-700 outline-none dark:text-slate-200"
              >
                <option value="startDate-asc">Date: Earliest First</option>
                <option value="startDate-desc">Date: Latest First</option>
                <option value="budget-desc">Budget: High to Low</option>
                <option value="title-asc">Title: A to Z</option>
              </select>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/30 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Create Trip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trips list grid */}
      {sortedTrips.length === 0 ? (
        <div className="rounded-[32px] border border-white/70 bg-white/70 p-12 text-center shadow-[0_25px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-sky-500/15 text-indigo-600 dark:text-sky-300">
            <Luggage className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">No trips found</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try adjusting your filters, search term, or create a brand new adventure.</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            <Plus className="h-4 w-4" />
            <span>Plan a trip</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sortedTrips.map((trip) => {
            const status = getTripStatus(trip.startDate, trip.endDate);
            const totalExp = trip.spent ?? 0;
            const expPercent = Math.min(Math.round((totalExp / trip.budget) * 100), 100);

            return (
              <div
                key={trip.id}
                className="group flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/70 bg-white/75 shadow-[0_20px_45px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_-30px_rgba(15,23,42,0.45)] dark:border-slate-800/70 dark:bg-slate-900/75"
              >
                {/* Image Placeholder / Banner style */}
                <div className="relative flex h-36 flex-col justify-between bg-gradient-to-br from-sky-500 via-indigo-600 to-violet-600 p-5">
                  {/* Status badge */}
                  <span className={`self-start rounded-full px-2.5 py-1 text-[10px] font-semibold ${status === 'Active'
                    ? 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/20'
                    : status === 'Upcoming'
                      ? 'bg-white/20 text-white ring-1 ring-white/25'
                      : 'bg-slate-900/20 text-slate-50 ring-1 ring-white/20'
                    }`}>
                    {status}
                  </span>

                  <div>
                    <h3 className="text-lg font-semibold text-white leading-snug drop-shadow-sm">{trip.tripName}</h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-sky-100/90">
                      <MapPin className="h-3.5 w-3.5 text-sky-200" />
                      <span className="truncate">{trip.destination}</span>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/70">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span>Spent: {formatCurrency(totalExp)}</span>
                      <span>Budget: {formatCurrency(trip.budget)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-slate-700">
                      <div
                        className={`h-2 rounded-full ${expPercent > 90 ? 'bg-rose-500' : expPercent > 75 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                        style={{ width: `${expPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
                    <button
                      onClick={() => handleViewDetails(trip.id)}
                      className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-indigo-600 transition-colors duration-300 hover:bg-indigo-50 hover:text-indigo-700 dark:text-sky-400 dark:hover:bg-slate-800"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Details</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(trip)}
                        className="rounded-full p-2 text-slate-400 transition-all duration-300 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-sky-400"
                        title="Edit Trip Settings"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(trip.id)}
                        className="rounded-full p-2 text-slate-400 transition-all duration-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400"
                        title="Delete Trip"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE TRIP MODAL */}
      {(isCreateOpen || isCreateOpenInitially) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_35px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/80"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-slate-800 flex-shrink-0">
              <div>
                <p className="text-sm font-medium text-indigo-600 dark:text-sky-400">New adventure</p>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Plan a New Journey</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseCreate}
                className="rounded-full p-2 text-slate-400 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="space-y-4 p-6 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Trip Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vizag Trip"
                  value={formFields.title}
                  onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Destination Name *
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. R K Beach"
                  value={formFields.destinationName}
                  onChange={(e) =>
                    setFormFields({
                      ...formFields,
                      destinationName: e.target.value
                    })
                  }
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    City *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Vizag"
                    value={formFields.city}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        city: e.target.value
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    State *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Andhra Pradesh"
                    value={formFields.state}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        state: e.target.value
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Country *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="India"
                    value={formFields.country}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        country: e.target.value
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Total Members *
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={formFields.totalMembers}
                    onChange={(e) =>
                      setFormFields({
                        ...formFields,
                        totalMembers: e.target.value
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formFields.startDate}
                    onChange={(e) => setFormFields({ ...formFields, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formFields.endDate}
                    onChange={(e) => setFormFields({ ...formFields, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allocated Budget (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    placeholder="5000"
                    value={formFields.budget}
                    onChange={(e) => setFormFields({ ...formFields, budget: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200/80 bg-white/80 py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Important Notes</label>
                <textarea
                  placeholder="Key details like lodging check-in rules or visa requirements..."
                  value={formFields.notes}
                  onChange={(e) => setFormFields({ ...formFields, notes: e.target.value })}
                  rows="3"
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                />
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 border-t border-slate-200/70 px-6 py-4 dark:border-slate-800 bg-[#fcfbf9]/60 dark:bg-[#0b0e14]/60 backdrop-blur-md rounded-b-[32px] flex-shrink-0">
              <button
                type="button"
                onClick={handleCloseCreate}
                className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/30 active:scale-95"
              >
                Create Journey
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT TRIP MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleEditSubmit}
            className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_35px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/80"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-slate-800 flex-shrink-0">
              <div>
                <p className="text-sm font-medium text-indigo-600 dark:text-sky-400">Edit trip</p>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Modify Travel Details</h3>
              </div>
              <button
                type="button"
                onClick={() => { setIsEditOpen(false); setEditingTrip(null); resetForm(); }}
                className="rounded-full p-2 text-slate-400 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="space-y-4 p-6 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Trip Title *</label>
                <input
                  type="text"
                  required
                  value={formFields.title}
                  onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Destination *</label>
                <input
                  type="text"
                  required
                  value={formFields.destinationName}
                  onChange={(e) => setFormFields({ ...formFields, destinationName: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formFields.startDate}
                    onChange={(e) => setFormFields({ ...formFields, startDate: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formFields.endDate}
                    onChange={(e) => setFormFields({ ...formFields, endDate: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Allocated Budget (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    value={formFields.budget}
                    onChange={(e) => setFormFields({ ...formFields, budget: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200/80 bg-white/80 py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Notes</label>
                <textarea
                  value={formFields.notes}
                  onChange={(e) => setFormFields({ ...formFields, notes: e.target.value })}
                  rows="3"
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                />
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 border-t border-slate-200/70 px-6 py-4 dark:border-slate-800 bg-[#fcfbf9]/60 dark:bg-[#0b0e14]/60 backdrop-blur-md rounded-b-[32px] flex-shrink-0">
              <button
                type="button"
                onClick={() => { setIsEditOpen(false); setEditingTrip(null); resetForm(); }}
                className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/30 active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* UI DELETE CONFIRMATION DIALOG */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-6 text-center shadow-[0_35px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/80">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Delete Journey?</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                This action is permanent and will delete all activities, recorded expenses, and uploaded documents associated with this trip.
              </p>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => { setIsDeleteConfirmOpen(false); setDeletingTripId(null); }}
                className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                No, Keep it
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-full bg-gradient-to-r from-rose-600 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-600/30 active:scale-95"
              >
                Yes, Delete Trip
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Trips;
