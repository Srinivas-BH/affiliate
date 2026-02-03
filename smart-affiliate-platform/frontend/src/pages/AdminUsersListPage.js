import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import AdminNavbar from "../components/AdminNavbar";

/**
 * Admin User Directory Page
 * Styled to match the "Platform Live Insights" theme
 */
export default function AdminUsersListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use useCallback to prevent unnecessary re-renders
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      /** * FIX 1: Use the correct endpoint. 
       * Based on your previous logic, "/auth/admin/users" is the standard route.
       */
      const res = await api.get("/auth/admin/users"); 
      
      /** * FIX 2: Data Extraction. 
       * Axios wraps responses in a 'data' object. 
       * We check for 'res.data.users' first, then 'res.data' as a fallback.
       */
      const userList = res.data?.users || res.data || [];
      setUsers(Array.isArray(userList) ? userList : []);
      
    } catch (error) {
      console.error("Critical Error fetching users:", error);
      // Optional: Set an error state here to show a message to the admin
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    // Auto-refresh every 60 seconds to keep the "Last Active" column fresh
    const interval = setInterval(fetchUsers, 60000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing Directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter">
            👥 User Directory
          </h1>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Registered: </span>
            <span className="text-lg font-black text-blue-600">{users.length}</span>
          </div>
        </div>

        {/* MODERN TABLE CONTAINER */}
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-8 py-6 border-b border-gray-100">User Identity</th>
                <th className="px-8 py-6 border-b border-gray-100">Account Name</th>
                <th className="px-8 py-6 border-b border-gray-100">Joined On</th>
                <th className="px-8 py-6 border-b border-gray-100 text-center">Activity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-blue-600 text-sm">{u.email}</span>
                      <span className="text-[10px] text-gray-300 font-bold uppercase">ID: {u._id?.slice(-6)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-black text-gray-700 uppercase text-xs">{u.name || "Anonymous User"}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-gray-500 font-bold text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    {u.lastActive ? (
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-green-500 uppercase">Online Recently</span>
                        <span className="text-[9px] text-gray-400 font-bold">
                          {new Date(u.lastActive).toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-gray-300 uppercase italic">Never Logged In</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* EMPTY STATE LOGIC */}
          {users.length === 0 && (
            <div className="py-32 text-center">
              <div className="mb-4 opacity-20 flex justify-center">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No users found in database</p>
              <p className="text-gray-300 text-[10px] mt-2 font-bold uppercase">Ensure backend is running on port 5001</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}