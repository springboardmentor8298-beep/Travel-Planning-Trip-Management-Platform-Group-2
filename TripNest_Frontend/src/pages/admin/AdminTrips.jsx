import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  X, 
  User, 
  Calendar, 
  DollarSign, 
  Users, 
  FileText,
  AlertCircle,
  Clock,
  Luggage
} from 'lucide-react';
import { getAdminTrips, getAdminTripMembers } from '../../services/adminService';
import { formatCurrency } from '../../utils/currency';

const AdminTrips = ({ setActivePage }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState(null);

  useEffect(() => {
    if (selectedTrip) {
      loadTripMembers(selectedTrip.id);
    } else {
      setMembers([]);
      setMembersError(null);
    }
  }, [selectedTrip]);

  const loadTripMembers = async (tripId) => {
    setLoadingMembers(true);
    setMembersError(null);
    try {
      const response = await getAdminTripMembers(tripId);
      if (response?.data?.success) {
        setMembers(response.data.data);
      } else {
        setMembersError('Failed to load trip members');
      }
    } catch (err) {
      console.error(err);
      setMembersError(err?.response?.data?.message || 'Error fetching members list');
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminTrips();
      if (response?.data?.success) {
        setTrips(response.data.data);
      } else {
        setError('Failed to fetch platform trips');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Error querying trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const filteredTrips = trips.filter(trip => 
    trip.tripName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.ownerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e2dd]/60 dark:border-slate-800/60 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('admin')}
            className="p-2.5 rounded-xl border border-[#e5e2dd] bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition-all"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trip Management</h1>
            <p className="text-xs text-slate-400">Audit and inspect all itineraries planned on the platform.</p>
          </div>
        </div>

        <button
          onClick={loadTrips}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-[#e5e2dd] bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Trips
        </button>
      </div>

      {/* Search and stats bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search trips by name, owner, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#e5e2dd] bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 dark:border-slate-800/80 dark:bg-[#0c1017] dark:text-slate-200"
          />
        </div>
        <div className="text-xs font-bold text-slate-400 self-end sm:self-auto">
          Showing {filteredTrips.length} of {trips.length} itineraries
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
          <p className="text-xs text-slate-400">Querying platform database...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
          <p className="text-sm font-bold text-slate-800 dark:text-white">Failed to load trips</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">{error}</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-12 text-center text-slate-400">
          No itineraries match your query.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e2dd] dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Trip Name</th>
                  <th className="py-4 px-6">Owner</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Budget</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                {filteredTrips.map((trip) => (
                  <tr 
                    key={trip.id} 
                    className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors group"
                  >
                    <td className="py-4.5 px-6 font-bold text-slate-400">#{trip.id}</td>
                    <td className="py-4.5 px-6 font-bold text-slate-900 dark:text-white">{trip.tripName}</td>
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-550 flex items-center justify-center text-[10px] font-bold border border-[#e5e2dd] dark:border-slate-800">
                          {trip.ownerName ? trip.ownerName.charAt(0).toUpperCase() : 'O'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-850 dark:text-slate-200 leading-none">{trip.ownerName}</p>
                          <span className="text-[10px] text-slate-400">{trip.ownerEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 font-medium text-slate-650 dark:text-slate-350">
                      <span className="text-xs">
                        {formatDate(trip.startDate)} &rarr; {formatDate(trip.endDate)}
                      </span>
                    </td>
                    <td className="py-4.5 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        trip.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : trip.status === 'UPCOMING'
                          ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400'
                          : trip.status === 'COMPLETED'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                          : 'bg-slate-50 text-slate-600 dark:bg-slate-950/30 dark:text-slate-400'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(trip.budget)}
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <button
                        onClick={() => setSelectedTrip(trip)}
                        className="px-3.5 py-1.5 rounded-xl border border-[#e5e2dd] dark:border-slate-800 text-xs font-bold text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-500 dark:hover:text-sky-400 transition-all"
                      >
                        Inspect Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trip Details Inspection Modal */}
      <AnimatePresence>
        {selectedTrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl overflow-hidden rounded-3xl border border-[#e5e2dd] bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0c1017]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 p-6 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#0ea5e9] to-[#0ea5e9]/80 text-white font-bold flex items-center justify-center">
                    <Luggage className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedTrip.tripName}</h3>
                    <p className="text-xs text-slate-400">Itinerary ID: #{selectedTrip.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                  
                  <div className="flex items-center gap-2 text-slate-500 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl bg-[#fcfbf9]/40 dark:bg-transparent">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Owner / Creator</span>
                      <span className="block font-bold text-slate-800 dark:text-slate-200">
                        {selectedTrip.ownerName} ({selectedTrip.ownerEmail})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl bg-[#fcfbf9]/40 dark:bg-transparent">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Overall Budget</span>
                      <span className="block font-bold text-slate-800 dark:text-slate-200">{formatCurrency(selectedTrip.budget)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl bg-[#fcfbf9]/40 dark:bg-transparent">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Start Date</span>
                      <span className="block font-bold text-slate-800 dark:text-slate-200">{formatDate(selectedTrip.startDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl bg-[#fcfbf9]/40 dark:bg-transparent">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">End Date</span>
                      <span className="block font-bold text-slate-800 dark:text-slate-200">{formatDate(selectedTrip.endDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl bg-[#fcfbf9]/40 dark:bg-transparent">
                    <Users className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Group Members</span>
                      <span className="block font-bold text-slate-850 dark:text-slate-200">{selectedTrip.totalMembers || 1} members</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl bg-[#fcfbf9]/40 dark:bg-transparent">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Computed Status</span>
                      <span className="block font-bold text-slate-850 dark:text-slate-200">{selectedTrip.status}</span>
                    </div>
                  </div>

                </div>

                {/* Additional Information */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</h4>
                    <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/10 text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-medium">
                      {selectedTrip.description || 'No description provided.'}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Internal Notes</h4>
                    <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/10 text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-medium">
                      {selectedTrip.notes || 'No travel notes provided.'}
                    </div>
                  </div>

                  {/* Trip Members & Invitations Section */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                      Trip Members & Invitations
                    </h4>

                    {loadingMembers ? (
                      <div className="flex items-center justify-center py-6 gap-2 text-xs text-slate-400 font-semibold">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-500" />
                        <span>Loading collaborators...</span>
                      </div>
                    ) : membersError ? (
                      <div className="p-3.5 rounded-2xl border border-rose-100 bg-rose-50/50 dark:border-rose-950/20 dark:bg-rose-950/5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                        {membersError}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Summary counts */}
                        {(() => {
                          const ownerRecord = {
                            name: selectedTrip.ownerName,
                            email: selectedTrip.ownerEmail,
                            role: 'OWNER',
                            status: 'ACCEPTED',
                            createdAt: selectedTrip.createdAt
                          };
                          const otherMembers = members.filter(m => m.email?.toLowerCase() !== selectedTrip.ownerEmail?.toLowerCase());
                          const allMembers = [ownerRecord, ...otherMembers];

                          const total = allMembers.length;
                          const owner = allMembers.filter(m => m.role?.toUpperCase() === 'OWNER').length;
                          const editors = allMembers.filter(m => m.role?.toUpperCase() === 'EDITOR').length;
                          const viewers = allMembers.filter(m => m.role?.toUpperCase() === 'VIEWER' || m.role?.toUpperCase() === 'MEMBER').length;
                          const pending = allMembers.filter(m => m.status?.toUpperCase() === 'PENDING').length;

                          return (
                            <>
                              <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-450 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
                                <span className="mr-2 text-slate-650 dark:text-slate-200">{total} Members / Invitations:</span>
                                <span className="bg-sky-50 dark:bg-sky-950/30 text-sky-650 px-2 py-0.5 rounded-lg">{owner} Owner</span>
                                <span className="bg-purple-50 dark:bg-purple-950/30 text-purple-650 px-2 py-0.5 rounded-lg">{editors} Editors</span>
                                <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-605 px-2 py-0.5 rounded-lg">{viewers} Viewers</span>
                                <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-605 px-2 py-0.5 rounded-lg">{pending} Pending</span>
                              </div>

                              {/* Members list */}
                              <div className="divide-y divide-slate-100 dark:divide-slate-850/60 max-h-[30vh] overflow-y-auto border border-slate-100 dark:border-slate-850 rounded-2xl bg-[#fcfbf9]/20 dark:bg-transparent">
                                {allMembers.map((member, idx) => {
                                  const dbRole = member.role?.toUpperCase();
                                  const displayRole = dbRole === 'OWNER' ? 'OWNER' : dbRole === 'EDITOR' ? 'EDITOR' : 'VIEWER';
                                  const dbStatus = member.status?.toUpperCase();
                                  const displayStatus = dbStatus === 'ACCEPTED' ? 'JOINED' : dbStatus === 'PENDING' ? 'PENDING' : dbStatus;

                                  const isOwner = displayRole === 'OWNER';

                                  return (
                                    <div key={idx} className="flex items-center justify-between p-3.5 text-xs font-medium">
                                      <div className="flex items-center gap-3">
                                        <div className="text-base">
                                          {isOwner ? '👑' : '👤'}
                                        </div>
                                        <div className="text-left">
                                          <p className="font-bold text-slate-850 dark:text-slate-200 leading-tight">
                                            {member.name || 'Invited User'}
                                          </p>
                                          <p className="text-[10px] text-slate-400">
                                            {member.email}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3">
                                        {/* Invited/Joined Date */}
                                        {member.createdAt && (
                                          <span className="text-[10px] text-slate-400 hidden sm:inline">
                                            {isOwner ? 'Created: ' : displayStatus === 'JOINED' ? 'Joined: ' : 'Invited: '}
                                            {formatDate(member.createdAt)}
                                          </span>
                                        )}

                                        {/* Role Badge */}
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                                          displayRole === 'OWNER'
                                            ? 'bg-amber-100 text-amber-750 dark:bg-amber-950/20 dark:text-amber-450'
                                            : displayRole === 'EDITOR'
                                            ? 'bg-purple-100 text-purple-750 dark:bg-purple-950/20 dark:text-purple-450'
                                            : 'bg-blue-100 text-blue-750 dark:bg-blue-950/20 dark:text-blue-450'
                                        }`}>
                                          {displayRole}
                                        </span>

                                        {/* Status Badge */}
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                                          displayStatus === 'JOINED'
                                            ? 'bg-emerald-100 text-emerald-750 dark:bg-emerald-950/20 dark:text-emerald-450'
                                            : 'bg-amber-100 text-amber-755 dark:bg-amber-955/20 dark:text-amber-455'
                                        }`}>
                                          {displayStatus}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center gap-2 text-slate-400 text-[11px] font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Created on {formatDate(selectedTrip.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-850 p-6 bg-slate-50/30 dark:bg-slate-900/10">
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold transition-colors"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTrips;
