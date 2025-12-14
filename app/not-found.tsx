"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    // For static export, dynamic routes will be handled client-side
    // This component acts as a fallback
    // The actual routing will be handled by the app's client-side navigation
  }, [pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Loading...</h1>
        <p className="mt-2 text-slate-600">Please wait while we load the page.</p>
      </div>
    </div>
  );
}




