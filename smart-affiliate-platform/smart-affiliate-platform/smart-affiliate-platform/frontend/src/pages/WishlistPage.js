import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/UserNavbar";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const wishlistIds = JSON.parse(localStorage.getItem("wishlist") || "[]");
      
      if (wishlistIds.length === 0) {
        setWishlistItems([]);
        return;
      }

      // Fetch product details for each wishlist item
      const products = await Promise.all(
        wishlistIds.map(async (id) => {
          try {
            const response = await api.get(`/products/${id}`);
            return response.product;
          } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
            return null;
          }
        })
      );

      setWishlistItems(products.filter((p) => p !== null));
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (productId) => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const updated = wishlist.filter((id) => id !== productId);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    fetchWishlist();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">❤️ My Wishlist</h1>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">💔</div>
            <p className="text-gray-600 text-xl mb-2">Your wishlist is empty</p>
            <p className="text-gray-400 mb-6">Start adding products you like!</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-64 bg-gray-200 overflow-hidden">
                  <img
                    src={product.imageUrl || "https://via.placeholder.com/300"}
                    alt={product.title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => navigate(`/product/${product._id}`)}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300";
                    }}
                  />
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                  >
                    ❌
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-bold text-blue-600">
                      ₹{product.price?.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
