import React from "react";

const Maintenance = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 overflow-hidden">
      {/* Animated circles */}
      <div className="absolute w-72 h-72 bg-white rounded-full opacity-20 animate-ping-slow -top-16 -left-16"></div>
      <div className="absolute w-96 h-96 border-4 border-white rounded-full opacity-10 animate-spin-slow -bottom-24 -right-24"></div>

      <div className="z-10 text-center px-6">
        {/* Animated illustration (example SVG) */}
        <svg
          className="mx-auto w-24 h-24 mb-6 text-white animate-bounce"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 animate-fadeIn">
          Oops! We’re Under Maintenance
        </h1>
        <p className="text-white/80 text-lg mb-6 animate-fadeIn delay-200">
          We’re improving  to serve you better.we’ll be
          back shortly-Have a Coffee till then! 
        </p>

       

        <p className="mt-8 text-white/50 text-sm animate-fadeIn delay-600">
          © {new Date().getFullYear()} LIFE IN FRAMES. All rights reserved.
        </p>
      </div>

      {/* Tailwind Animations */}
      <style>
        {`
          @keyframes ping-slow {
            0% { transform: scale(0.8); opacity: 0.2; }
            50% { transform: scale(1); opacity: 0.1; }
            100% { transform: scale(0.8); opacity: 0.2; }
          }
          .animate-ping-slow { animation: ping-slow 4s infinite; }

          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spin-slow { animation: spin-slow 20s linear infinite; }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 1s ease forwards; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-400 { animation-delay: 0.4s; }
          .delay-600 { animation-delay: 0.6s; }
        `}
      </style>
    </div>
  );
};

export default Maintenance;
