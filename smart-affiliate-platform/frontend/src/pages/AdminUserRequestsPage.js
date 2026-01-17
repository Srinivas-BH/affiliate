import React, { useState, useEffect } from "react";
import api from "../utils/api";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminUserRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ACTIVE");

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/requests/admin/all", {
        params: { status: filter },
      });
      setRequests(response.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
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
            <p className="text-gray-600">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">📋 User Requests</h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="ACTIVE">Active</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="">All</option>
          </select>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-xl">No requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      From: {request.userEmail}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {request.naturalLanguageQuery}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      request.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : request.status === "FULFILLED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Parsed Information:</p>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-semibold">Category:</span>{" "}
                      {request.parsedTags?.category || "Not specified"}
                    </div>
                    <div>
                      <span className="font-semibold">Max Price:</span>{" "}
                      {request.parsedTags?.maxPrice
                        ? `₹${request.parsedTags.maxPrice.toLocaleString()}`
                        : "No limit"}
                    </div>
                    <div>
                      <span className="font-semibold">Platforms:</span>{" "}
                      {request.parsedTags?.platforms?.length > 0
                        ? request.parsedTags.platforms.join(", ")
                        : "Any"}
                    </div>
                    <div>
                      <span className="font-semibold">Tags:</span>{" "}
                      {request.parsedTags?.tags?.join(", ") || "None"}
                    </div>
                  </div>
                </div>

                {request.matchedProducts?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Matched Products: {request.matchedProducts.length}
                    </p>
                    <p className="text-sm text-gray-600">
                      Notifications sent: {request.notificationsSent?.length || 0}
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-4">
                  Requested: {new Date(request.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
