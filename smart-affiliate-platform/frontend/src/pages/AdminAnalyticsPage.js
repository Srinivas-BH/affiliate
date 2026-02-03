import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProducts: 0,
    totalRequests: 0,
    detailedProductStats: [],
  });
  
  // NEW: State for the Distribution Hub Filter
  const [activeApp, setActiveApp] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const [userRes, productRes, requestRes] = await Promise.all([
        api.get("/auth/admin/stats").catch(() => ({ stats: { totalUsers: 0, activeUsers: 0 } })),
        api.get("/products/admin/stats").catch(() => ({ stats: [] })),
        api.get("/requests/admin/stats").catch(() => ({ stats: { byStatus: [] } })),
      ]);

      const rawStats = productRes.data?.stats || productRes.stats || [];

      setAnalytics({
        totalUsers: userRes.data?.stats?.totalUsers || userRes.stats?.totalUsers || 0,
        activeUsers: userRes.data?.stats?.activeUsers || userRes.stats?.activeUsers || 0,
        totalProducts: rawStats.length || 0,
        totalRequests: requestRes.data?.stats?.byStatus?.reduce((acc, s) => acc + s.count, 0) || 0,
        detailedProductStats: rawStats,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  // NEW: Derived state for the filtered table
  const filteredTableData = activeApp === "ALL" 
    ? analytics.detailedProductStats 
    : analytics.detailedProductStats.filter(item => item.platform === activeApp);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2 uppercase tracking-tighter">
          📈 Platform Live Insights
        </h1>

        {/* TOP CARDS (STAYS THE SAME) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div onClick={() => navigate("/admin/users")} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 cursor-pointer hover:bg-blue-50 transition-all transform hover:scale-105">
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Users</p>
            <p className="text-3xl font-black text-gray-800">{analytics.totalUsers}</p>
            <p className="text-xs text-blue-600 mt-2 font-bold">View user list →</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 relative">
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Live Now</p>
            <p className="text-3xl font-black text-green-600">{analytics.activeUsers}</p>
            <span className="absolute top-6 right-6 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Live Products</p>
            <p className="text-3xl font-black text-gray-800">{analytics.totalProducts}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">User Requests</p>
            <p className="text-3xl font-black text-gray-800">{analytics.totalRequests}</p>
          </div>
        </div>

        {/* NEW: DISTRIBUTION HUB FILTER (Update This Filter Only) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {['ALL', 'AMAZON', 'FLIPKART', 'MEESHO', 'MYNTRA'].map((site) => (
            <button
              key={site}
              onClick={() => setActiveApp(site)}
              className={`py-4 rounded-2xl font-black text-xs transition-all border-b-4 uppercase tracking-widest ${
                activeApp === site 
                ? 'bg-black text-white border-gray-700 shadow-lg scale-105' 
                : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {site} VIEW
            </button>
          ))}
        </div>

        {/* UPDATED: Product Performance Table (Filtered) */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10 border border-gray-100">
          <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Product Performance Details</h2>
            <span className="text-xs font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase">
              Viewing: {activeApp}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-gray-400 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4 border-b">Platform</th>
                  <th className="px-6 py-4 border-b">Category</th>
                  <th className="px-6 py-4 border-b">Product Name</th>
                  <th className="px-6 py-4 border-b text-right">Avg Price</th>
                  <th className="px-6 py-4 border-b text-center text-blue-500">Views</th>
                  <th className="px-6 py-4 border-b text-center text-green-500">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTableData.map((item) => (
                  <tr key={item._id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-black text-[10px] text-gray-700 uppercase">
                      {item.platform === "AMAZON" ? "🟠 AMAZON" : 
                       item.platform === "FLIPKART" ? "🔵 FLIPKART" : 
                       item.platform === "MEESHO" ? "🟣 MEESHO" :
                       `📦 ${item.platform}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-500 uppercase">{item.category}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold text-sm truncate max-w-[250px]">{item.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-800 text-sm">
                      ₹{item.avgPrice?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600 font-bold">
                      {item.totalViews || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black">
                        {item.totalClicks || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* EMPTY STATE */}
            {filteredTableData.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-gray-400 font-black uppercase tracking-widest text-sm">
                  No {activeApp} products tracked yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}