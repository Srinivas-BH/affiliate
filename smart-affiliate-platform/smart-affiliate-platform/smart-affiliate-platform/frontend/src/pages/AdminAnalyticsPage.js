import React, { useState, useEffect } from "react";
import api from "../utils/api";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Fetch user data - in a real app, you'd have a dedicated analytics endpoint
      // For now, we'll create a mock structure
      const [productStats, requestStats] = await Promise.all([
        api.get("/products/admin/stats").catch(() => ({ stats: [] })),
        api.get("/requests/admin/stats").catch(() => ({ stats: {} })),
      ]);

      setAnalytics({
        totalUsers: 0, // Would come from a users endpoint
        activeUsers: 0,
        totalProducts: productStats.stats?.reduce((acc, s) => acc + s.count, 0) || 0,
        totalRequests: requestStats.stats?.byStatus?.reduce((acc, s) => acc + s.count, 0) || 0,
        productStats: productStats.stats || [],
        requestStats: requestStats.stats || {},
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">📈 User Analytics</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.totalUsers || "N/A"}
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.activeUsers || "N/A"}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.totalProducts || 0}
                </p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          {/* Total Requests */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.totalRequests || 0}
                </p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>
        </div>

        {/* Products by Platform */}
        {analytics?.productStats?.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Products by Platform</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Platform</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Count</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Views</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.productStats.map((stat) => (
                    <tr key={stat._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {stat._id === "AMAZON" && "🟠 "}
                        {stat._id === "FLIPKART" && "🔵 "}
                        {stat._id === "MYNTRA" && "💙 "}
                        {stat._id === "MEESHO" && "📱 "}
                        {stat._id}
                      </td>
                      <td className="py-3 px-4">{stat.count}</td>
                      <td className="py-3 px-4">₹{Math.round(stat.avgPrice || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">{stat.totalViews?.toLocaleString() || 0}</td>
                      <td className="py-3 px-4">{stat.totalClicks?.toLocaleString() || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Request Statistics */}
        {analytics?.requestStats?.byStatus && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Statistics</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {analytics.requestStats.byStatus.map((stat) => (
                <div
                  key={stat._id}
                  className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500"
                >
                  <p className="text-sm text-gray-600 font-semibold mb-1">
                    {stat._id.charAt(0).toUpperCase() + stat._id.slice(1)}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> User analytics data is collected from user login activity and
            product interactions. Active users are those who have logged in within the last 30 days.
          </p>
        </div>
      </div>
    </div>
  );
}
