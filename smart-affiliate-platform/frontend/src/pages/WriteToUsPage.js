import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/UserNavbar";

export default function WriteToUsPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err.error || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
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
                  placeholder="Example: I'm looking for a gaming laptop from Amazon under 50000 with 16GB RAM"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition min-h-[150px] text-lg"
                  rows="6"
                />
                <p className="text-sm text-gray-500 mt-2">
                  💡 Tip: Include category, price range (under 50000, budget 30k, 2-5 lakhs), platform (amazon, flipkart, myntra), and specifications for best results!
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>🤖 How it works:</strong> Our AI (NLP Parser) analyzes your request to extract:
                </p>
                <ul className="text-sm text-blue-800 mt-2 ml-4 space-y-1">
                  <li>✓ <strong>Category:</strong> What product (Laptop, Mobile, Shoes, etc.)</li>
                  <li>✓ <strong>Budget:</strong> Price limits (under 50k, max 80000, 20-50k range)</li>
                  <li>✓ <strong>Platform:</strong> Where to buy (Amazon, Flipkart, Myntra, etc.)</li>
                  <li>✓ <strong>Specs:</strong> Features (16GB RAM, Gaming, 4K, etc.)</li>
                </ul>
                <p className="text-sm text-blue-800 mt-2">
                  When our admin adds matching products, you'll receive an instant email notification!
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

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">✨ Smart Example Requests:</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="text-gray-700">💻 "gaming laptop with 16gb ram under 50000 from amazon"</p>
                  <p className="text-xs text-gray-500 mt-1">Admin sees: Category: Laptops | Budget: ₹50,000 | Platform: AMAZON | Specs: 16gb, ram, gaming</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                  <p className="text-gray-700">👟 "running shoes size 9 between 2000 to 4000 on myntra"</p>
                  <p className="text-xs text-gray-500 mt-1">Admin sees: Category: Fashion | Budget: ₹2,000-₹4,000 | Platform: MYNTRA | Specs: size</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                  <p className="text-gray-700">📱 "smartphone under 30000 from flipkart amazon"</p>
                  <p className="text-xs text-gray-500 mt-1">Admin sees: Category: Mobile Phones | Budget: ₹30,000 | Platforms: FLIPKART, AMAZON</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500">
                  <p className="text-gray-700">🎧 "wireless earbuds under 5000 max price"</p>
                  <p className="text-xs text-gray-500 mt-1">Admin sees: Category: Audio | Budget: ₹5,000 | Specs: wireless, earbuds</p>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg border-l-4 border-pink-500">
                  <p className="text-gray-700">📺 "4k smart tv 55 inch budget 40k to 80k"</p>
                  <p className="text-xs text-gray-500 mt-1">Admin sees: Category: Televisions | Budget: ₹40,000-₹80,000 | Specs: 55inch, 4k</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}