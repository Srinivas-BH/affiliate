import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/UserNavbar";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    fetchProduct();
    checkWishlist();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.product);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setInWishlist(wishlist.includes(id));
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const handleBuyNow = async () => {
    try {
      // Track click
      await api.post(`/products/${id}/click`);
      // Open affiliate link in new tab
      window.open(product.affiliateLink, "_blank");
    } catch (error) {
      console.error("Error tracking click:", error);
      // Still open link even if tracking fails
      window.open(product.affiliateLink, "_blank");
    }
  };

  const handleWishlist = () => {
    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      if (inWishlist) {
        // Remove from wishlist
        const updated = wishlist.filter((itemId) => itemId !== id);
        localStorage.setItem("wishlist", JSON.stringify(updated));
        setInWishlist(false);
      } else {
        // Add to wishlist
        wishlist.push(id);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        setInWishlist(true);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600 text-xl">Product not found</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="relative">
              <img
                src={product.imageUrl || "https://via.placeholder.com/500"}
                alt={product.title}
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/500";
                }}
              />
              {product.discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                  {product.discount}% OFF
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <div className="mb-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {product.platform}
                </span>
                <span className="ml-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {product.category}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>

              {product.description && (
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Price Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-4xl font-bold text-blue-600">
                    ₹{product.price?.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-green-600 font-semibold">
                        Save ₹{(product.originalPrice - product.price).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
                {product.discount > 0 && (
                  <p className="text-sm text-gray-600">
                    {product.discount}% discount applied
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 shadow-lg text-lg"
                >
                  🛒 BUY NOW
                </button>
                <button
                  onClick={handleWishlist}
                  className={`w-full font-bold py-4 rounded-lg transition ${
                    inWishlist
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {inWishlist ? "❤️ Remove from Wishlist" : "🤍 Add to Wishlist"}
                </button>
              </div>

              {/* Important Notice */}
              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Important:</strong> Prices may vary daily. Grab the product as soon as possible!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
