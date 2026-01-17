import React from "react";
import Navbar from "../components/UserNavbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
              About DIS-CYRA
            </h1>

            <div className="space-y-6 text-gray-700 leading-relaxed">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  🎯 Our Mission
                </h2>
                <p className="text-lg">
                  DIS-CYRA is designed to help you save time and money by
                  aggregating products from all major shopping platforms in one convenient place.
                  We understand that finding the best deals across multiple platforms can be
                  time-consuming and overwhelming.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  ⚡ How We Help You
                </h2>
                <ul className="space-y-3 list-disc list-inside">
                  <li className="text-lg">
                    <strong>Save Time:</strong> No need to visit multiple shopping websites.
                    Find all your desired products in one platform.
                  </li>
                  <li className="text-lg">
                    <strong>Best Prices:</strong> We curate products with the best deals
                    from Amazon, Flipkart, Myntra, Meesho, and more.
                  </li>
                  <li className="text-lg">
                    <strong>Smart Notifications:</strong> Use our "Write to Us" feature to
                    describe what you're looking for in natural language. We'll notify you
                    when matching products are available.
                  </li>
                  <li className="text-lg">
                    <strong>Wishlist:</strong> Save products you like for later viewing
                    and easy access.
                  </li>
                  <li className="text-lg">
                    <strong>Category Filtering:</strong> Quickly find products by category
                    to streamline your shopping experience.
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  ⚠️ Important Notice
                </h2>
                <p className="text-lg font-semibold text-yellow-800">
                  Prices may vary for each and every day. We update product prices regularly,
                  but prices on the official platforms may change at any time. We recommend
                  grabbing the products as soon as possible when you find a good deal!
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  🛍️ Supported Platforms
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Amazon", emoji: "🟠" },
                    { name: "Flipkart", emoji: "🔵" },
                    { name: "Myntra", emoji: "💙" },
                    { name: "Meesho", emoji: "📱" },
                  ].map((platform) => (
                    <div
                      key={platform.name}
                      className="bg-gray-50 p-4 rounded-lg text-center border-2 border-gray-200"
                    >
                      <div className="text-3xl mb-2">{platform.emoji}</div>
                      <p className="font-semibold text-gray-900">{platform.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  💡 Get Started
                </h2>
                <p className="text-lg mb-4">
                  Ready to start saving time and money? Browse our curated product collection,
                  add items to your wishlist, or use the "Write to Us" feature to let us know
                  what you're looking for!
                </p>
                <div className="flex gap-4 mt-4">
                  <a
                    href="/dashboard"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Browse Products
                  </a>
                  <a
                    href="/write-to-us"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    Write to Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
