import React, { useState, useEffect } from "react";
import api from "../utils/api";
import AdminNavbar from "../components/AdminNavbar";

export default function MeeshoProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeeshoData = async () => {
      try {
        setLoading(true);
        // This query string (?platform=MEESHO) is the secret to fixing the leak
        const res = await api.get("/products?platform=MEESHO");
        setProducts(res.data?.products || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMeeshoData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tighter">
          🟣 MEESHO Distribution
        </h1>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((item) => (
                <tr key={item._id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={item.imageUrl} className="w-10 h-10 object-contain rounded border" />
                    <span className="font-bold text-sm text-gray-800">{item.title}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">{item.category}</td>
                  <td className="px-6 py-4 font-black text-blue-600">₹{item.price}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      Meesho Live
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && !loading && (
            <div className="py-24 text-center text-gray-300 font-black uppercase tracking-widest">
               No Meesho products in distribution.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}