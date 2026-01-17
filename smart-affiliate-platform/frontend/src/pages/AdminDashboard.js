import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import api from "../utils/api";

export default function AdminDashboard() {
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-12">
        {!showAddForm ? (
          <div className="max-w-4xl mx-auto">
            {/* Empty Dashboard */}
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-6">📊</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                Manage products, view user requests, and track analytics
              </p>

              {/* ADD+ Button */}
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-lg transition transform hover:scale-105 shadow-lg text-xl mb-8"
              >
                ➕ ADD+
              </button>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <button
                  onClick={() => navigate("/admin/products")}
                  className="bg-white border-2 border-blue-500 text-blue-600 font-bold py-6 px-6 rounded-lg hover:bg-blue-50 transition transform hover:scale-105 shadow-md"
                >
                  <div className="text-3xl mb-2">📦</div>
                  <div>Manage Products</div>
                </button>
                <button
                  onClick={() => navigate("/admin/user-requests")}
                  className="bg-white border-2 border-green-500 text-green-600 font-bold py-6 px-6 rounded-lg hover:bg-green-50 transition transform hover:scale-105 shadow-md"
                >
                  <div className="text-3xl mb-2">📋</div>
                  <div>User Requests</div>
                </button>
                <button
                  onClick={() => navigate("/admin/analytics")}
                  className="bg-white border-2 border-purple-500 text-purple-600 font-bold py-6 px-6 rounded-lg hover:bg-purple-50 transition transform hover:scale-105 shadow-md"
                >
                  <div className="text-3xl mb-2">📈</div>
                  <div>User Analytics</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <AddProductForm onClose={() => setShowAddForm(false)} />
        )}
      </div>
    </div>
  );
}

// Excel-like Product Add Form
function AddProductForm({ onClose }) {
  const [products, setProducts] = useState([
    {
      imageUrl: "",
      affiliateLink: "",
      title: "",
      price: "",
      originalPrice: "",
      category: "",
      description: "",
      platform: "",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const addRow = () => {
    setProducts([
      ...products,
      {
        imageUrl: "",
        affiliateLink: "",
        title: "",
        price: "",
        originalPrice: "",
        category: "",
        description: "",
        platform: "",
      },
    ]);
  };

  const removeRow = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;

    // Auto-detect platform from affiliate link
    if (field === "affiliateLink" && value) {
      const link = value.toLowerCase();
      if (link.includes("amazon")) {
        updated[index].platform = "AMAZON";
      } else if (link.includes("flipkart")) {
        updated[index].platform = "FLIPKART";
      } else if (link.includes("myntra")) {
        updated[index].platform = "MYNTRA";
      } else if (link.includes("meesho")) {
        updated[index].platform = "MEESHO";
      } else {
        updated[index].platform = "OTHER";
      }

      // For Amazon, auto-fetch price
      if (updated[index].platform === "AMAZON") {
        fetchAmazonPrice(updated[index].affiliateLink, index);
      }
    }

    setProducts(updated);
  };

  const fetchAmazonPrice = async (affiliateLink, index) => {
    try {
      setLoading(true);
      // Extract ASIN from Amazon URL
      const asinMatch = affiliateLink.match(/\/dp\/([A-Z0-9]{10})/);
      if (asinMatch) {
        // In production, this would call the backend API to fetch from PA-API
        // For now, we'll let the backend handle it when saving
        console.log("Amazon product detected, will auto-fetch on save");
      }
    } catch (error) {
      console.error("Error fetching Amazon price:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save each product
      for (const product of products) {
        if (!product.affiliateLink) continue;

        await api.post("/products", {
          title: product.title || "Product",
          description: product.description || "",
          category: product.category || "General",
          price: parseFloat(product.price) || 0,
          originalPrice: parseFloat(product.originalPrice) || parseFloat(product.price) || 0,
          affiliateLink: product.affiliateLink,
          imageUrl: product.imageUrl || "",
        });
      }

      alert("Products saved successfully!");
      setProducts([
        {
          imageUrl: "",
          affiliateLink: "",
          title: "",
          price: "",
          originalPrice: "",
          category: "",
          description: "",
          platform: "",
        },
      ]);
      onClose();
    } catch (error) {
      alert("Error saving products: " + (error.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Products (Excel-like)</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Image URL</th>
                <th className="border border-gray-300 p-2 text-left">Affiliate Link</th>
                <th className="border border-gray-300 p-2 text-left">Title</th>
                <th className="border border-gray-300 p-2 text-left">Price</th>
                <th className="border border-gray-300 p-2 text-left">Original Price</th>
                <th className="border border-gray-300 p-2 text-left">Category</th>
                <th className="border border-gray-300 p-2 text-left">Platform</th>
                <th className="border border-gray-300 p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">
                    <input
                      type="text"
                      value={product.imageUrl}
                      onChange={(e) => updateProduct(index, "imageUrl", e.target.value)}
                      placeholder="Image URL"
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <input
                      type="text"
                      value={product.affiliateLink}
                      onChange={(e) => updateProduct(index, "affiliateLink", e.target.value)}
                      placeholder="Affiliate Link"
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <input
                      type="text"
                      value={product.title}
                      onChange={(e) => updateProduct(index, "title", e.target.value)}
                      placeholder="Product Title"
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => updateProduct(index, "price", e.target.value)}
                      placeholder="Price"
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                    />
                    {product.platform === "AMAZON" && (
                      <span className="text-xs text-blue-600">(Auto-fetch)</span>
                    )}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <input
                      type="number"
                      value={product.originalPrice}
                      onChange={(e) => updateProduct(index, "originalPrice", e.target.value)}
                      placeholder="Original Price"
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <input
                      type="text"
                      value={product.category}
                      onChange={(e) => updateProduct(index, "category", e.target.value)}
                      placeholder="Category"
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <span className="text-sm font-semibold text-blue-600">
                      {product.platform || "Auto-detect"}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-2">
                    {products.length > 1 && (
                      <button
                        onClick={() => removeRow(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex gap-4">
          <button
            onClick={addRow}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            ➕ Add Row
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "💾 Save Products"}
          </button>
        </div>

        <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> For Amazon products, price will be auto-fetched from PA-API.
            For other platforms, please enter the price manually.
          </p>
        </div>
      </div>
    </div>
  );
}
