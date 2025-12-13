"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Show splash screen for minimum 1.5 seconds
    const minDisplayTime = 1500;
    const startTime = Date.now();

    // Check if page is loaded
    const checkLoad = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        setIsFading(true);
        // After fade animation completes, hide splash
        setTimeout(() => {
          setIsVisible(false);
        }, 500); // Match fade-out duration
      }, remaining);
    };

    // If page is already loaded
    if (document.readyState === "complete") {
      checkLoad();
    } else {
      window.addEventListener("load", checkLoad);
      return () => window.removeEventListener("load", checkLoad);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#10B981] via-[#34D399] to-[#6EE7B7] transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-6 px-4">
        {/* Logo/Icon */}
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform transition-all duration-700 animate-pulse">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#10B981] to-[#34D399] rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl sm:text-3xl font-bold">C</span>
            </div>
          </div>
        </div>

        {/* App Name */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            HissabBook
          </h1>
          <p className="text-white/90 text-xs sm:text-sm font-medium">
            UPI Wallets for Business Expenses
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="flex space-x-2 mt-6 sm:mt-8">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}



