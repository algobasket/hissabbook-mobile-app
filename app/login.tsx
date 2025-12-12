"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import OTPLoginForm from "./components/OTPLoginForm";
import EmailPasswordLoginForm from "./components/EmailPasswordLoginForm";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || 
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "/backend");

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<"otp" | "email">("otp");
  const [smallLogoUrl, setSmallLogoUrl] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-[#edf1ff] font-sans text-slate-900">
      <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 py-8 sm:py-10 md:py-12">
        <section className="flex w-full max-w-md items-center justify-center">
          <div className="w-full space-y-6 sm:space-y-8">
            <div className="space-y-3 text-center">
              <Link href="/" className="flex justify-center transition-transform hover:scale-105">
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
              <div className={`welcome-fallback ${smallLogoUrl ? 'hidden' : ''}`}>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                  Welcome to HissabBook <span className="inline-block">👋</span>
                </h1>
              </div>
              <p className="text-sm text-slate-500">
                Login/Register to HissabBook
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              {loginMethod === "otp" ? (
                <OTPLoginForm onSwitchToEmail={() => setLoginMethod("email")} />
              ) : (
                <EmailPasswordLoginForm onSwitchToOtp={() => setLoginMethod("otp")} />
              )}
            </div>

            <p className="text-center text-xs text-slate-500">
              To know more about HissabBook please visit{" "}
              <Link className="font-semibold text-[#10B981] hover:underline" href="#">
                HissabBook.com
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

