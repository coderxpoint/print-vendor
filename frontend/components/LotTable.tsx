"use client";

import { useState } from "react";
import { formatDate, formatNumber } from "@/lib/utils";
import { lotsAPI } from "@/lib/api";
import type { Lot } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar,
  User,
  FileText,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface LotsTableProps {
  lots: Lot[];
  loading: boolean;
  onRefresh: () => void;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  selectedLots: number[];
  onSelectionChange: (selected: number[]) => void;
}

export default function LotsTable({
  lots,
  loading,
  onRefresh,
  totalPages,
  currentPage,
  onPageChange,
  selectedLots,
  onSelectionChange,
}: LotsTableProps) {
  const [downloading, setDownloading] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSelectAll = () => {
    if (selectedLots.length === lots.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(lots.map((lot) => lot.id));
    }
  };

  const handleSelectLot = (id: number) => {
    if (selectedLots.includes(id)) {
      onSelectionChange(selectedLots.filter((lotId) => lotId !== id));
    } else {
      onSelectionChange([...selectedLots, id]);
    }
  };

  const handleDownload = async (id: number) => {
    setDownloading(id);
    try {
      await lotsAPI.download(id);
      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lot?")) {
      return;
    }

    try {
      await lotsAPI.delete(id);
      toast({
        title: "Success",
        description: "Lot deleted successfully",
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lot",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 sm:p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded mb-3"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Uploaded Lots
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Showing {lots.length} lot(s)
              {selectedLots.length > 0 && ` · ${selectedLots.length} selected`}
            </p>
          </div>
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="gap-2 w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left w-12">
                <Checkbox
                  checked={
                    selectedLots.length === lots.length && lots.length > 0
                  }
                  onCheckedChange={handleSelectAll}
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
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium">No lots found</p>
                  <p className="text-sm mt-1">
                    Try adjusting your filters or upload new data
                  </p>
                </td>
              </tr>
            ) : (
              lots.map((lot) => (
                <tr
                  key={lot.id}
                  className={`hover:bg-gray-50 transition ${
                    selectedLots.includes(lot.id) ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedLots.includes(lot.id)}
                      onCheckedChange={() => handleSelectLot(lot.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {lot.lot_number}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                      {lot.file_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {formatNumber(lot.record_count)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lot.uploaded_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-700"
                    >
                      {lot.uploaded_by_token || "Unknown"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleDownload(lot.id)}
                        disabled={downloading === lot.id}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        {downloading === lot.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => handleDelete(lot.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden divide-y divide-gray-200">
        {lots.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-base font-medium">No lots found</p>
            <p className="text-sm mt-1">
              Try adjusting your filters or upload new data
            </p>
          </div>
        ) : (
          lots.map((lot) => (
            <div
              key={lot.id}
              className={`p-4 hover:bg-gray-50 transition ${
                selectedLots.includes(lot.id) ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    checked={selectedLots.includes(lot.id)}
                    onCheckedChange={() => handleSelectLot(lot.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {lot.lot_number}
                        </h3>
                        <p className="text-sm text-gray-500 truncate mt-0.5">
                          {lot.file_name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDownload(lot.id)}
                      disabled={downloading === lot.id}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(lot.id)}
                      className="gap-2 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm ml-8">
                <div className="flex items-center gap-2 text-gray-600">
                  <Hash className="h-4 w-4 flex shrink-0" />
                  <span className="truncate">
                    <span className="font-medium text-gray-900">
                      {formatNumber(lot.record_count)}
                    </span>{" "}
                    records
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4 flex shrink-0" />
                  <span className="truncate text-xs">
                    {formatDate(lot.uploaded_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 col-span-2">
                  <User className="h-4 w-4 flex shrink-0" />
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700 text-xs"
                  >
                    {lot.uploaded_by_token || "Unknown"}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-700 order-2 sm:order-1">
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto">
              <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="gap-2 flex-1 sm:flex-none"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              {/* Page numbers - Hidden on mobile */}
              <div className="hidden md:flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="gap-2 flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
