"use client";

import { useEffect, useState } from "react";
import { lotsAPI } from "@/lib/api";
import StatsCards from "@/components/StatsCards";
import LotsTable from "@/components/LotTable";
import type { Stats, Lot } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchLotNumber, setSearchLotNumber] = useState("");
  const limit = 50;

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsData = await lotsAPI.getStats();
      setStats(statsData);

      // Fetch lots
      const lotsData = await lotsAPI.list(
        currentPage,
        limit,
        searchLotNumber || undefined
      );
      setLots(lotsData.lots);
      setTotalPages(Math.ceil(lotsData.total / limit));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchLotNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData();
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage all uploaded lots
        </p>
      </div>

      {/* Statistics */}
      <StatsCards stats={stats} loading={loading} />

      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex items-center space-x-3">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={searchLotNumber}
              onChange={(e) => setSearchLotNumber(e.target.value)}
              placeholder="Search by lot number..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            Search
          </button>
          {searchLotNumber && (
            <button
              type="button"
              onClick={() => {
                setSearchLotNumber("");
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Lots Table */}
      <LotsTable
        lots={lots}
        loading={loading}
        onRefresh={fetchData}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
