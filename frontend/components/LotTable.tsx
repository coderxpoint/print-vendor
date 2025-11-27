"use client";

import { useState } from "react";
import { formatDate, formatNumber } from "@/lib/utils";
import { lotsAPI } from "@/lib/api";
import type { Lot } from "@/types";

interface LotsTableProps {
  lots: Lot[];
  loading: boolean;
  onRefresh: () => void;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function LotsTable({
  lots,
  loading,
  onRefresh,
  totalPages,
  currentPage,
  onPageChange,
}: LotsTableProps) {
  const [selectedLots, setSelectedLots] = useState<number[]>([]);
  const [downloading, setDownloading] = useState<number | null>(null);

  const handleSelectAll = () => {
    if (selectedLots.length === lots.length) {
      setSelectedLots([]);
    } else {
      setSelectedLots(lots.map((lot) => lot.id));
    }
  };

  const handleSelectLot = (id: number) => {
    if (selectedLots.includes(id)) {
      setSelectedLots(selectedLots.filter((lotId) => lotId !== id));
    } else {
      setSelectedLots([...selectedLots, id]);
    }
  };

  const handleDownload = async (id: number) => {
    setDownloading(id);
    try {
      await lotsAPI.download(id);
    } catch (error) {
      alert("Failed to download file");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedLots.length === 0) {
      alert("Please select at least one lot");
      return;
    }

    try {
      for (const id of selectedLots) {
        await lotsAPI.download(id);
        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      setSelectedLots([]);
    } catch (error) {
      alert("Failed to download some files");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lot?")) {
      return;
    }

    try {
      await lotsAPI.delete(id);
      onRefresh();
    } catch (error) {
      alert("Failed to delete lot");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded mb-3"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Uploaded Lots</h2>
          <div className="flex items-center space-x-3">
            {selectedLots.length > 0 && (
              <button
                onClick={handleDownloadSelected}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
              >
                Download Selected ({selectedLots.length})
              </button>
            )}
            <button
              onClick={onRefresh}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Refresh"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedLots.length === lots.length && lots.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lot Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Records
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploaded At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploaded By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lots.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium">No lots uploaded yet</p>
                  <p className="text-sm mt-1">
                    Lots will appear here once merchants upload data
                  </p>
                </td>
              </tr>
            ) : (
              lots.map((lot) => (
                <tr key={lot.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLots.includes(lot.id)}
                      onChange={() => handleSelectLot(lot.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {lot.lot_number}
                    </div>
                    <div className="text-xs text-gray-500">{lot.file_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {formatNumber(lot.record_count)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lot.uploaded_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                      {lot.uploaded_by_token || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownload(lot.id)}
                        disabled={downloading === lot.id}
                        className="text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                        title="Download CSV"
                      >
                        {downloading === lot.id ? (
                          <svg
                            className="animate-spin h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(lot.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
