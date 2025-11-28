"use client";

import { useEffect, useState } from "react";
import { lotsAPI } from "@/lib/api";
import StatsCards from "@/components/StatsCards";
import LotsTable from "@/components/LotTable";
import type { Stats, Lot } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  X,
  Download,
  Trash2,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filter states
  const [searchLotNumber, setSearchLotNumber] = useState("");
  const [searchFileName, setSearchFileName] = useState("");
  const [uploadedByFilter, setUploadedByFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("uploaded_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [recordsPerPage, setRecordsPerPage] = useState(50);

  // UI states
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Bulk operations
  const [selectedLots, setSelectedLots] = useState<number[]>([]);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsData = await lotsAPI.getStats();
      setStats(statsData);

      // Build query parameters
      const params: any = {
        page: currentPage,
        limit: recordsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (searchLotNumber) params.lot_number = searchLotNumber;
      if (searchFileName) params.file_name = searchFileName;
      if (uploadedByFilter) params.uploaded_by = uploadedByFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      // Fetch lots with filters
      const lotsData = await lotsAPI.list(currentPage, recordsPerPage, params);
      setLots(lotsData.lots);
      setTotalPages(Math.ceil(lotsData.total / recordsPerPage));
      setTotalRecords(lotsData.total);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, recordsPerPage, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData();
  };

  const handleClearFilters = () => {
    setSearchLotNumber("");
    setSearchFileName("");
    setUploadedByFilter("");
    setDateFrom("");
    setDateTo("");
    setSortBy("uploaded_at");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const handleBulkDownload = async () => {
    if (selectedLots.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one lot to download",
        variant: "destructive",
      });
      return;
    }

    setBulkDownloading(true);
    try {
      for (const id of selectedLots) {
        await lotsAPI.download(id);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      toast({
        title: "Success",
        description: `Downloaded ${selectedLots.length} lot(s) successfully`,
      });

      setSelectedLots([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download some files",
        variant: "destructive",
      });
    } finally {
      setBulkDownloading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLots.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one lot to delete",
        variant: "destructive",
      });
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedLots.length} lot(s)? This action cannot be undone.`
      )
    ) {
      return;
    }

    setBulkDeleting(true);
    try {
      for (const id of selectedLots) {
        await lotsAPI.delete(id);
      }

      toast({
        title: "Success",
        description: `Deleted ${selectedLots.length} lot(s) successfully`,
      });

      setSelectedLots([]);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some lots",
        variant: "destructive",
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  const activeFilterCount = [
    searchLotNumber,
    searchFileName,
    uploadedByFilter,
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  const hasActiveFilters =
    searchLotNumber ||
    searchFileName ||
    uploadedByFilter ||
    dateFrom ||
    dateTo ||
    sortBy !== "uploaded_at" ||
    sortOrder !== "desc";

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            Monitor and manage all uploaded lots
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <StatsCards stats={stats} loading={loading} />

      {/* Quick Search Bar (Always Visible) */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchLotNumber}
                  onChange={(e) => setSearchLotNumber(e.target.value)}
                  placeholder="Quick search by lot number..."
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 px-1.5 py-0.5 text-xs"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                  {filtersExpanded ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </Button>
                <Button
                  type="submit"
                  className="gap-2 flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && !filtersExpanded && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                <span className="text-xs text-gray-500">Active filters:</span>
                {searchFileName && (
                  <Badge variant="secondary" className="text-xs">
                    File: {searchFileName}
                  </Badge>
                )}
                {uploadedByFilter && (
                  <Badge variant="secondary" className="text-xs">
                    Token: {uploadedByFilter}
                  </Badge>
                )}
                {dateFrom && (
                  <Badge variant="secondary" className="text-xs">
                    From: {dateFrom}
                  </Badge>
                )}
                {dateTo && (
                  <Badge variant="secondary" className="text-xs">
                    To: {dateTo}
                  </Badge>
                )}
                {(sortBy !== "uploaded_at" || sortOrder !== "desc") && (
                  <Badge variant="secondary" className="text-xs">
                    Sort: {sortBy} ({sortOrder})
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Advanced Filters (Collapsible) */}
      {filtersExpanded && (
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5" />
                  Advanced Filters
                </CardTitle>
                <CardDescription className="text-sm">
                  Filter through {totalRecords.toLocaleString()} lots
                </CardDescription>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Clear All</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="searchFileName" className="text-sm">
                  File Name
                </Label>
                <Input
                  id="searchFileName"
                  type="text"
                  value={searchFileName}
                  onChange={(e) => setSearchFileName(e.target.value)}
                  placeholder="Search by file name..."
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="uploadedBy" className="text-sm">
                  Uploaded By Token
                </Label>
                <Input
                  id="uploadedBy"
                  type="text"
                  value={uploadedByFilter}
                  onChange={(e) => setUploadedByFilter(e.target.value)}
                  placeholder="Filter by token..."
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <Label htmlFor="recordsPerPage" className="text-sm">
                  Records Per Page
                </Label>
                <Select
                  value={recordsPerPage.toString()}
                  onValueChange={(value) => {
                    setRecordsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger id="recordsPerPage" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                    <SelectItem value="100">100 per page</SelectItem>
                    <SelectItem value="200">200 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateFrom" className="text-sm">
                  Date From
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="dateTo" className="text-sm">
                  Date To
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Sorting */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sortBy" className="text-sm">
                  Sort By
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sortBy" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uploaded_at">Upload Date</SelectItem>
                    <SelectItem value="lot_number">Lot Number</SelectItem>
                    <SelectItem value="record_count">Record Count</SelectItem>
                    <SelectItem value="file_name">File Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sortOrder" className="text-sm">
                  Order
                </Label>
                <Select
                  value={sortOrder}
                  onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
                >
                  <SelectTrigger id="sortOrder" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                onClick={handleSearch}
                className="gap-2 bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
              >
                <Search className="h-4 w-4" />
                Apply Filters
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFiltersExpanded(false)}
                className="flex-1 sm:flex-none"
              >
                <ChevronUp className="h-4 w-4 mr-2" />
                Hide Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions Bar */}
      {selectedLots.length > 0 && (
        <Card className="border-blue-200 bg-linear-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1">
                <Badge variant="default" className="bg-blue-600">
                  {selectedLots.length} selected
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLots([])}
                  className="text-blue-700 hover:text-blue-800 hover:bg-blue-200 h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleBulkDownload}
                  disabled={bulkDownloading}
                  className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                  {bulkDownloading ? "Downloading..." : "Download"}
                  <span className="hidden sm:inline">
                    ({selectedLots.length})
                  </span>
                </Button>
                <Button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  variant="destructive"
                  className="gap-2 w-full sm:w-auto"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                  {bulkDeleting ? "Deleting..." : "Delete"}
                  <span className="hidden sm:inline">
                    ({selectedLots.length})
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lots Table */}
      <LotsTable
        lots={lots}
        loading={loading}
        onRefresh={fetchData}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        selectedLots={selectedLots}
        onSelectionChange={setSelectedLots}
      />
    </div>
  );
}
