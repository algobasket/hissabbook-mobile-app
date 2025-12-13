/* eslint-disable react/no-array-index-key */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getApiBaseUrl } from "./utils/config";

const API_BASE = getApiBaseUrl();

const slides = [
  {
    title: "Understand your business health",
    description:
      "Download weekly or monthly reports on your business expenses and cash flow in PDF & Excel formats.",
    accent: "#10B981",
    image: "/images/1.png",
  },
  {
    title: "Track every rupee with ease",
    description:
      "Keep receipts, payouts, and cashbooks organised in one secure place. Stay audit ready 24/7.",
    accent: "#00B8A9",
    image: "/images/2.png",
  },
  {
    title: "Collaborate with your entire team",
    description:
      "Invite accountants, partners, and vendors with role-based access so everyone stays aligned in real time.",
    accent: "#8B5CF6",
    image: "/images/3.png",
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [smallLogoUrl, setSmallLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  // Fetch small logo from site settings
  useEffect(() => {
    const fetchSmallLogo = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/settings/site/public`);
        if (response.ok) {
          const siteSettings = await response.json();
          if (siteSettings.smallLogoUrl) {
            const logoUrl = siteSettings.smallLogoUrl.startsWith('http') 
              ? siteSettings.smallLogoUrl 
              : `${API_BASE}/uploads/${siteSettings.smallLogoUrl}`;
            setSmallLogoUrl(logoUrl);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch small logo:", err);
        // Continue without logo - will show fallback
      }
    };
    fetchSmallLogo();
  }, []);

  const slide = useMemo(() => slides[currentSlide], [currentSlide]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="min-h-screen bg-[#edf1ff] font-sans text-slate-900">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
        {/* Logo */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 transition-transform hover:scale-105">
            {smallLogoUrl ? (
              <img
                src={smallLogoUrl}
                alt="HissabBook"
                className="h-12 w-auto sm:h-14 md:h-[68px] object-contain cursor-pointer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('.logo-fallback');
                    if (fallback) fallback.classList.remove('hidden');
                  }
                }}
              />
            ) : null}
            <div className={`logo-fallback flex items-center gap-2 sm:gap-3 ${smallLogoUrl ? 'hidden' : ''}`}>
              <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-white text-lg sm:text-xl font-bold text-[#10B981] shadow-sm">
                C
              </span>
              <span className="text-xl sm:text-2xl font-semibold text-[#10B981]">
                HissabBook
              </span>
            </div>
          </Link>
        </div>

        {/* Slider Section */}
        <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10">
          {/* Image */}
          <div className="relative w-full max-w-[55%] sm:max-w-[50%] md:max-w-[45%] overflow-hidden rounded-[30px] sm:rounded-[40px] shadow-[0_35px_90px_rgba(35,87,255,0.18)]">
            <Image
              src={slide.image}
              alt={slide.title}
              width={512}
              height={640}
              priority
              className="h-full w-full rounded-[30px] sm:rounded-[40px] object-contain bg-transparent"
            />
            <div className="pointer-events-none absolute inset-0 rounded-[30px] sm:rounded-[40px] border border-white/40" />
          </div>

          {/* Slide Content */}
          <div className="flex w-full max-w-md flex-col items-center gap-4 sm:gap-6 text-center">
            <div className="space-y-2 sm:space-y-3">
              <span
                className="inline-flex items-center rounded-full bg-white/80 px-3 sm:px-4 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.35em]"
                style={{ color: slide.accent }}
              >
                Feature Highlight
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F172A] transition-all duration-500">
                {slide.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 transition-opacity duration-500 px-4">
                {slide.description}
              </p>
            </div>

            {/* Navigation Dots and Controls */}
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2 sm:gap-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? "w-8 sm:w-10 bg-[#10B981]"
                        : "w-2 sm:w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition hover:border-[#10B981] hover:text-[#10B981] active:scale-95"
                  type="button"
                  aria-label="Previous slide"
                  onClick={() =>
                    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
                  }
                >
                  <span className="text-lg font-semibold">‹</span>
                </button>
                <button
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition hover:border-[#10B981] hover:text-[#10B981] active:scale-95"
                  type="button"
                  aria-label="Next slide"
                  onClick={goToNext}
                >
                  <span className="text-lg font-semibold">›</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Get Started Button */}
        <div className="mt-4 sm:mt-5 md:mt-6 w-full max-w-md px-4">
          <Link
            href="/login"
            className="block w-full rounded-full bg-gradient-to-r from-[#10B981] to-[#10B981]/90 px-6 sm:px-8 py-3 sm:py-4 text-center text-sm sm:text-base font-bold text-white shadow-2xl shadow-[#10B981]/40 transition-all hover:scale-105 hover:shadow-[#10B981]/50 active:scale-95"
          >
            GET STARTED
          </Link>
        </div>

        {/* Trust Indicator */}
        <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-600">
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">HissabBook is trusted by 30 Lakh+ users</span>
        </div>
      </div>
    </div>
  );
}
