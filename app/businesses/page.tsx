"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import ProtectedRoute from "../components/ProtectedRoute";
import { getAuthToken } from "../utils/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "/backend");

interface Business {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  masterWalletUpi: string | null;
  masterWalletQrCode: string | null;
  masterWalletBalance: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function BusinessesPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingBusinessId, setDeletingBusinessId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_BASE}/api/businesses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch businesses");
      }

      const data = await response.json();
      setBusinesses(data.businesses || []);
    } catch (err) {
      console.error("Error fetching businesses:", err);
      setError(err instanceof Error ? err.message : "Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteBusiness = async (businessId: string) => {
    try {
      setDeletingBusinessId(businessId);
      setError(null);
      const token = getAuthToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_BASE}/api/businesses/${businessId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete business");
      }

      // Remove business from list
      setBusinesses((prev) => prev.filter((b) => b.id !== businessId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Error deleting business:", err);
      setError(err instanceof Error ? err.message : "Failed to delete business");
    } finally {
      setDeletingBusinessId(null);
    }
  };

  const handleEditBusiness = (businessId: string) => {
    router.push(`/edit-business/${businessId}`);
  };

  return (
    <ProtectedRoute>
      <AppShell activePath="/businesses">
        <section className="max-w-7xl space-y-4 sm:space-y-6">
          <div className="rounded-[12px] sm:rounded-2xl md:rounded-3xl border border-white/70 bg-white p-4 sm:p-6 md:p-8 shadow-md">
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-[#1f2937]">Businesses List</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  View and manage all your businesses
                </p>
              </div>
              <button
                onClick={() => router.push("/add-new-business")}
                className="rounded-lg sm:rounded-xl bg-[#10B981] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-[#10B981]/90 active:scale-95"
              >
                Add New Business
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-600">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#10B981]"></div>
              </div>
            ) : businesses.length === 0 ? (
              <div className="py-8 sm:py-12 text-center">
                <p className="text-sm sm:text-base text-slate-500">No businesses found.</p>
                <button
                  onClick={() => router.push("/add-new-business")}
                  className="mt-4 rounded-lg sm:rounded-xl bg-[#10B981] px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-[#10B981]/90 active:scale-95"
                >
                  Create Your First Business
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-3">
                  {businesses.map((business) => (
                    <div key={business.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-[#1f2937]">{business.name}</h3>
                            {business.description && (
                              <p className="mt-1 text-xs text-slate-500">{business.description}</p>
                            )}
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              business.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {business.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 border-t border-slate-100 pt-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Owner</p>
                            <p className="mt-0.5 text-xs font-medium text-[#1f2937]">{business.ownerName}</p>
                            <p className="text-[10px] text-slate-500">{business.ownerEmail}</p>
                          </div>
                          
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Master UPI Wallet</p>
                            <p className="mt-0.5 text-xs text-[#1f2937]">
                              {business.masterWalletUpi || (
                                <span className="text-slate-400">Not set</span>
                              )}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Created At</p>
                            <p className="mt-0.5 text-xs text-slate-600">{formatDate(business.createdAt)}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleEditBusiness(business.id)}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-95 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (deleteConfirmId === business.id) {
                                handleDeleteBusiness(business.id);
                              } else {
                                setDeleteConfirmId(business.id);
                              }
                            }}
                            disabled={deletingBusinessId === business.id}
                            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors active:scale-95 ${
                              deleteConfirmId === business.id
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {deletingBusinessId === business.id
                              ? "Deleting..."
                              : deleteConfirmId === business.id
                              ? "Confirm"
                              : "Delete"}
                          </button>
                          {deleteConfirmId === business.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(null);
                              }}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 active:scale-95"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Business Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Owner
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Master UPI Wallet ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Created At
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {businesses.map((business) => (
                        <tr key={business.id} className="hover:bg-slate-50">
                          <td className="px-4 py-4">
                            <div className="font-medium text-[#1f2937]">{business.name}</div>
                            {business.description && (
                              <div className="mt-1 text-sm text-slate-500">{business.description}</div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-[#1f2937]">{business.ownerName}</div>
                            <div className="text-xs text-slate-500">{business.ownerEmail}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-[#1f2937]">
                              {business.masterWalletUpi || (
                                <span className="text-slate-400">Not set</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                business.status === "active"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {business.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {formatDate(business.createdAt)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditBusiness(business.id)}
                                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (deleteConfirmId === business.id) {
                                    handleDeleteBusiness(business.id);
                                  } else {
                                    setDeleteConfirmId(business.id);
                                  }
                                }}
                                disabled={deletingBusinessId === business.id}
                                className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                  deleteConfirmId === business.id
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {deletingBusinessId === business.id
                                  ? "Deleting..."
                                  : deleteConfirmId === business.id
                                  ? "Confirm Delete"
                                  : "Delete"}
                              </button>
                              {deleteConfirmId === business.id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmId(null);
                                  }}
                                  className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}

