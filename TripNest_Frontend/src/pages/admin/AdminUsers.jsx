import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  UserCheck, 
  UserX, 
  RefreshCw, 
  X, 
  Mail, 
  Phone, 
  Globe, 
  ShieldAlert, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { getAdminUsers } from '../../services/adminService';

const AdminUsers = ({ setActivePage }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminUsers();
      if (response?.data?.success) {
        setUsers(response.data.data);
      } else {
        setError('Failed to fetch user profiles');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Error querying users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
            <p className="text-xs text-slate-400">View and audit all accounts registered on TripNest.</p>
          </div>
        </div>

        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-[#e5e2dd] bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Users
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
            placeholder="Search users by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#e5e2dd] bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 dark:border-slate-800/80 dark:bg-[#0c1017] dark:text-slate-200"
          />
        </div>
        <div className="text-xs font-bold text-slate-400 self-end sm:self-auto">
          Showing {filteredUsers.length} of {users.length} registered users
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
          <p className="text-sm font-bold text-slate-800 dark:text-white">Failed to load profiles</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">{error}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl p-12 text-center text-slate-400">
          No users match your query.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/50 border border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e2dd] dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors group"
                  >
                    <td className="py-4.5 px-6 font-bold text-slate-400">#{user.id}</td>
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-sky-600 text-white font-bold flex items-center justify-center text-xs">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white leading-snug">{user.fullName}</h4>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        user.role === 'ADMIN' 
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
                          : user.role === 'GROUP_ADMIN'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-455'
                          : 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-1.5">
                        {user.enabled ? (
                          <>
                            <UserCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4 text-rose-500" />
                            <span className="text-xs text-rose-600 dark:text-rose-455 font-semibold">Suspended</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4.5 px-6 text-slate-500 font-medium">{formatDate(user.createdAt)}</td>
                    <td className="py-4.5 px-6 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
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

      {/* User Details Inspection Modal */}
      <AnimatePresence>
        {selectedUser && (
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
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-sky-400 to-sky-600 text-white font-bold flex items-center justify-center text-sm">
                    {selectedUser.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedUser.fullName}</h3>
                    <p className="text-xs text-slate-400">Account ID: #{selectedUser.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                  <div className="flex items-center gap-2 text-slate-500 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl bg-[#fcfbf9]/40 dark:bg-transparent">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Email</span>
                      <span className="truncate block font-bold text-slate-800 dark:text-slate-200">{selectedUser.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl bg-[#fcfbf9]/40 dark:bg-transparent">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Phone</span>
                      <span className="block font-bold text-slate-800 dark:text-slate-200">{selectedUser.phone || 'Not Specified'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl bg-[#fcfbf9]/40 dark:bg-transparent">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Country</span>
                      <span className="block font-bold text-slate-800 dark:text-slate-200">{selectedUser.country || 'Not Specified'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl bg-[#fcfbf9]/40 dark:bg-transparent">
                    <ShieldAlert className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Platform Role</span>
                      <span className="block font-bold text-slate-800 dark:text-slate-200">{selectedUser.role}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Profile Bio</h4>
                    <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/10 text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-medium">
                      {selectedUser.bio || 'This user has not written a bio yet.'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Travel Style</h4>
                      <span className="inline-block px-3 py-1.5 rounded-xl border border-slate-150 dark:border-slate-800 bg-[#fcfbf9]/40 dark:bg-transparent text-xs font-bold text-slate-700 dark:text-slate-350">
                        {selectedUser.travelStyle || 'None Specified'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Emergency Contact</h4>
                      <span className="inline-block px-3 py-1.5 rounded-xl border border-slate-150 dark:border-slate-800 bg-[#fcfbf9]/40 dark:bg-transparent text-xs font-bold text-slate-700 dark:text-slate-350">
                        {selectedUser.emergencyContact || 'None Specified'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center gap-2 text-slate-400 text-[11px] font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Registered on {formatDate(selectedUser.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-850 p-6 bg-slate-50/30 dark:bg-slate-900/10">
                <button
                  onClick={() => setSelectedUser(null)}
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

export default AdminUsers;
