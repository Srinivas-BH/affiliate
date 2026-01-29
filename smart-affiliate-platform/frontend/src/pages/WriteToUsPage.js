import React, { useState, useEffect } from "react";
import api from "../utils/api";
import Navbar from "../components/UserNavbar";
import { Link } from "react-router-dom";

export default function WriteToUsPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // New State for storing user's requests
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Fetch requests on page load
  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await api.get("/requests/user/my-requests");
      if (res.data.success) {
        setMyRequests(res.data.requests);
      }
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please describe what product you're looking for");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await api.post("/requests", { query });
      setSuccess(true);
      setQuery("");
      
      // Refresh the list immediately after submitting
      fetchMyRequests();
      
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* --- SUBMISSION FORM SECTION --- */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
              ✍️ Write to Us
            </h1>
            <p className="text-gray-600 text-center mb-8 text-lg">
              Tell us what product you're looking for in your own words. We'll analyze
              your request and notify you when matching products are available!
            </p>

            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6">
                <p className="font-semibold">✅ Request Submitted Successfully!</p>
                <p className="text-sm mt-1">
                  We'll notify you via email when matching products are available.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
                <p className="font-semibold">⚠️ Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Describe the product you're looking for:
                </label>
                <textarea
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setError("");
                  }}
                  placeholder="Example: I'm looking for wireless headphones under ₹5000 from Amazon, or a laptop bag for my MacBook under ₹2000..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition min-h-[150px] text-lg"
                  rows="6"
                />
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>How it works:</strong> Our AI analyzes your request to identify
                  the product category, price range, and platform preferences. When our
                  admin adds matching products, you'll receive an email notification!
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 active:scale-95 shadow-lg text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "🔔 Notify Me"
                )}
              </button>
            </form>
          </div>

          {/* --- YOUR ACTIVE REQUESTS SECTION (NEW) --- */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Requests</h2>
            
            {loadingRequests ? (
              <div className="text-center py-8 text-gray-500">Loading your requests...</div>
            ) : myRequests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500 border border-gray-200">
                You haven't made any requests yet.
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map((req) => (
                  <div key={req._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 transition hover:shadow-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2 
                          ${req.isFulfilled ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {req.isFulfilled ? "✅ COMPLETED" : "⏳ PENDING"}
                        </span>
                        <p className="text-sm text-gray-400">
                          {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      {req.parsedTags && req.parsedTags.category && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          {req.parsedTags.category}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-800 font-medium text-lg mb-4">
                      "{req.naturalLanguageQuery}"
                    </p>

                    {/* Show Matched Product if Fulfilled */}
                    {req.isFulfilled && req.matchedProducts && req.matchedProducts.length > 0 && (
                      <div className="bg-green-50 p-4 rounded-md border border-green-200 mt-3">
                        <p className="text-sm font-bold text-green-800 mb-2">We found matches for you:</p>
                        <div className="flex flex-wrap gap-2">
                          {req.matchedProducts.map(prod => (
                            <Link 
                              key={prod._id || prod} 
                              to={`/product/${prod._id || prod}`}
                              className="text-blue-600 hover:underline text-sm bg-white px-2 py-1 rounded border border-green-200"
                            >
                              View Matched Product ↗
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}