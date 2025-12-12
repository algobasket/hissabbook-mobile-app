"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import ProtectedRoute from "../components/ProtectedRoute";
import { getAuthToken, isManager } from "../utils/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "/backend");

interface PayoutRequest {
  id: string;
  reference: string;
  submittedBy: string;
  amount: number;
  utr: string;
  remarks: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userEmail: string | null;
  userPhone: string | null;
  proofFilename: string | null;
}

export default function ApprovalsPage() {
  const router = useRouter();
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchPayoutRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const statusParam = selectedStatus !== "all" ? `?status=${selectedStatus}` : "";
      const response = await fetch(`${API_BASE}/api/payout-requests${statusParam}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch payout requests (${response.status})`);
      }

      const data = await response.json();
      setPayoutRequests(data.payoutRequests || []);
    } catch (err: any) {
      console.error("Error fetching payout requests:", err);
      setError(err.message || "Failed to load payout requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    
    fetchPayoutRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, selectedStatus]);

  const handleStatusUpdate = async (id: string, status: "accepted" | "rejected") => {
    if (processingId) return;

    setProcessingId(id);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch(`${API_BASE}/api/payout-requests/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          notes: status === "accepted" ? "Approved by manager" : "Rejected by manager",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update request status");
      }

      // Refresh the list
      await fetchPayoutRequests();
    } catch (err: any) {
      console.error("Error updating payout request status:", err);
      setError(err.message || "Failed to update request status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (processingId) return;
    if (!confirm("Are you sure you want to delete this payout request? This action cannot be undone.")) {
      return;
    }

    setProcessingId(id);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch(`${API_BASE}/api/payout-requests/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete payout request");
      }

      // Refresh the list
      await fetchPayoutRequests();
    } catch (err: any) {
      console.error("Error deleting payout request:", err);
      setError(err.message || "Failed to delete payout request");
    } finally {
      setProcessingId(null);
    }
  };

  if (!mounted) {
    return (
      <ProtectedRoute>
        <AppShell activePath="/approvals">
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-600">Loading...</p>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day}-${month}-${year} ${hours}:${minutes}${ampm}`;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: "bg-amber-100", text: "text-amber-600", label: "Pending" },
      accepted: { bg: "bg-emerald-100", text: "text-emerald-600", label: "Accepted" },
      rejected: { bg: "bg-rose-100", text: "text-rose-600", label: "Rejected" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`rounded-full ${config.bg} ${config.text} px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold`}>
        {config.label}
      </span>
    );
  };

  return (
    <ProtectedRoute>
      <AppShell activePath="/approvals">
        <section className="mx-auto flex w-full flex-col gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6 py-4 sm:py-6 md:py-10">
          <div className="rounded-[12px] sm:rounded-2xl md:rounded-[32px] border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-panel">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-[#1f2937]">Payout Requests</h2>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500">
                <label className="text-xs sm:text-sm">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending Review</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <p className="text-xs sm:text-sm text-slate-600">Loading payout requests...</p>
              </div>
            ) : error ? (
              <div className="rounded-lg sm:rounded-xl bg-rose-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-rose-600">
                {error}
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-3">
                  {payoutRequests.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-500">
                      No payout requests found
                    </div>
                  ) : (
                    payoutRequests.map((request) => {
                        // Construct proof URL - handle cases where filename might already include path
                        let proofUrl = null;
                        if (request.proofFilename) {
                          let filename = request.proofFilename;
                          // Remove any existing /uploads/ or /backend/uploads/ prefix
                          filename = filename.replace(/^\/?(backend\/)?uploads\//, '');
                          // Normalize API_BASE (remove trailing slash)
                          const apiBaseNormalized = API_BASE.replace(/\/$/, '');
                          proofUrl = `${apiBaseNormalized}/uploads/${filename}`;
                          
                          // Debug logging (remove in production if needed)
                          if (process.env.NODE_ENV === 'development') {
                            console.log('Payout proof URL construction:', {
                              original: request.proofFilename,
                              cleaned: filename,
                              apiBase: API_BASE,
                              finalUrl: proofUrl
                            });
                          }
                        }

                        return (
                          <div key={request.id} className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Request #</p>
                                  <p className="mt-0.5 text-xs sm:text-sm font-semibold text-[#1f2937] break-all">{request.reference}</p>
                                </div>
                                <div className="ml-2 flex-shrink-0">
                                  {getStatusBadge(request.status)}
                                </div>
                              </div>

                              <div className="space-y-2 border-t border-slate-100 pt-2">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Submitted By</p>
                                  <p className="mt-0.5 text-xs font-medium text-[#1f2937]">{request.submittedBy}</p>
                                  {request.userEmail && (
                                    <p className="text-[10px] text-slate-500">{request.userEmail}</p>
                                  )}
                                  {request.userPhone && (
                                    <p className="text-[10px] text-slate-500">{request.userPhone}</p>
                                  )}
                                </div>

                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Amount</p>
                                  <p className="mt-0.5 text-sm font-semibold text-[#1f2937]">{formatAmount(request.amount)}</p>
                                </div>

                                {request.remarks && (
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Remark</p>
                                    <p className="mt-0.5 text-xs text-slate-600">{request.remarks}</p>
                                  </div>
                                )}

                                {request.utr && (
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">UTR / Reference</p>
                                    <p className="mt-0.5 text-xs text-slate-600 break-all">{request.utr}</p>
                                  </div>
                                )}

                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Screenshot</p>
                                  <div className="mt-0.5">
                                    {request.proofFilename ? (
                                      <button
                                        onClick={() => setSelectedImage(proofUrl)}
                                        className="inline-flex items-center gap-1.5 text-xs text-[#10B981] hover:text-[#10B981]/80 hover:underline transition-colors font-medium"
                                      >
                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                        View Attachment
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-slate-400">No attachment</span>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                                  <div>
                                    <p className="font-semibold uppercase tracking-wide">Created</p>
                                    <p className="mt-0.5">{formatDate(request.createdAt)}</p>
                                  </div>
                                  <div>
                                    <p className="font-semibold uppercase tracking-wide">Updated</p>
                                    <p className="mt-0.5">{formatDate(request.updatedAt)}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                                {isManager() && request.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleStatusUpdate(request.id, "accepted")}
                                      disabled={processingId === request.id}
                                      className="flex-1 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
                                    >
                                      {processingId === request.id ? "Processing..." : "Approve"}
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(request.id, "rejected")}
                                      disabled={processingId === request.id}
                                      className="flex-1 rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
                                    >
                                      {processingId === request.id ? "Processing..." : "Reject"}
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleDelete(request.id)}
                                  disabled={processingId === request.id}
                                  className="flex-1 rounded-lg bg-slate-500 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
                                >
                                  {processingId === request.id ? "Processing..." : "Delete"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-hidden rounded-xl sm:rounded-2xl border border-slate-100">
                  <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Request #</th>
                        <th className="px-4 py-3">Submitted By</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Remark</th>
                        <th className="px-4 py-3">UTR / Reference</th>
                        <th className="px-4 py-3">Screenshot</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Created At</th>
                        <th className="px-4 py-3">Updated</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-600">
                      {payoutRequests.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                            No payout requests found
                          </td>
                        </tr>
                      ) : (
                        payoutRequests.map((request) => {
                          // Construct proof URL - handle cases where filename might already include path
                          let proofUrl = null;
                          if (request.proofFilename) {
                            let filename = request.proofFilename;
                            filename = filename.replace(/^\/?(backend\/)?uploads\//, '');
                            const apiBaseNormalized = API_BASE.replace(/\/$/, '');
                            proofUrl = `${apiBaseNormalized}/uploads/${filename}`;
                          }

                          return (
                            <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-4 font-semibold text-[#1f2937]">{request.reference}</td>
                              <td className="px-4 py-4">
                                <div className="flex flex-col">
                                  <span className="font-medium text-[#1f2937]">{request.submittedBy}</span>
                                  {request.userEmail && (
                                    <span className="text-xs text-slate-500">{request.userEmail}</span>
                                  )}
                                  {request.userPhone && (
                                    <span className="text-xs text-slate-500">{request.userPhone}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4 font-semibold text-[#1f2937]">
                                {formatAmount(request.amount)}
                              </td>
                              <td className="px-4 py-4 max-w-xs">
                                <div className="truncate" title={request.remarks || ""}>
                                  {request.remarks || "-"}
                                </div>
                              </td>
                              <td className="px-4 py-4">{request.utr}</td>
                              <td className="px-4 py-4">
                                {request.proofFilename ? (
                                  <button
                                    onClick={() => setSelectedImage(proofUrl)}
                                    className="inline-flex items-center gap-2 text-sm text-[#10B981] hover:text-[#10B981]/80 hover:underline transition-colors font-medium"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                    Attachment
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400">No attachment</span>
                                )}
                              </td>
                              <td className="px-4 py-4">{getStatusBadge(request.status)}</td>
                              <td className="px-4 py-4 text-slate-500">
                                {formatDate(request.createdAt)}
                              </td>
                              <td className="px-4 py-4 text-slate-500">
                                {formatDate(request.updatedAt)}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  {isManager() && request.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() => handleStatusUpdate(request.id, "accepted")}
                                        disabled={processingId === request.id}
                                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      >
                                        {processingId === request.id ? "Processing..." : "Approve"}
                                      </button>
                                      <button
                                        onClick={() => handleStatusUpdate(request.id, "rejected")}
                                        disabled={processingId === request.id}
                                        className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      >
                                        {processingId === request.id ? "Processing..." : "Reject"}
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleDelete(request.id)}
                                    disabled={processingId === request.id}
                                    className="rounded-lg bg-slate-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {processingId === request.id ? "Processing..." : "Delete"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>
      </AppShell>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw] bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Attachment Preview</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedImage) {
                      const link = document.createElement('a');
                      link.href = selectedImage;
                      link.download = selectedImage.split('/').pop() || 'attachment';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#10B981] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#10B981]/90 transition-colors shadow-sm active:scale-95"
                  aria-label="Download attachment"
                >
                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="rounded-lg bg-white p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200"
                  aria-label="Close modal"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Image Container */}
            <div className="p-6 bg-slate-50">
              <img
                src={selectedImage || ''}
                alt="Attachment"
                className="max-h-[75vh] max-w-full mx-auto rounded-lg shadow-lg object-contain bg-white"
                onClick={(e) => e.stopPropagation()}
                onError={(e) => {
                  console.error('Failed to load payout proof image:', {
                    url: selectedImage,
                    apiBase: API_BASE,
                    timestamp: new Date().toISOString()
                  });
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%236b7280"%3EImage not found%3C/text%3E%3C/svg%3E';
                }}
                onLoad={() => {
                  console.log('Successfully loaded payout proof image:', selectedImage);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
