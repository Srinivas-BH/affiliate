import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center">
        {/* Website Name */}
        <h1 className="text-6xl md:text-8xl font-black text-white mb-12 drop-shadow-lg">
          DIS-CYRA
        </h1>

        {/* Login Option */}
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-blue-600 px-12 py-4 text-xl font-bold rounded-xl hover:bg-gray-100 transform hover:scale-110 transition-all shadow-2xl"
        >
          Login
        </button>
      </div>
    </div>
  );
}
