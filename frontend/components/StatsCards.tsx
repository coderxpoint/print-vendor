"use client";

import { formatNumber } from "@/lib/utils";
import type { Stats } from "@/types";
import {
  FileText,
  Database,
  Upload,
  Key,
  TrendingUp,
  Activity,
} from "lucide-react";

interface StatsCardsProps {
  stats: Stats | null;
  loading: boolean;
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Lots",
      value: stats?.total_lots || 0,
      icon: FileText,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
      description: "Uploaded lots",
    },
    {
      title: "Total Records",
      value: stats?.total_records || 0,
      icon: Database,
      color: "bg-green-500",
      lightColor: "bg-green-50",
      textColor: "text-green-600",
      description: "Data records",
    },
    {
      title: "Total Uploads",
      value: stats?.total_uploads || 0,
      icon: Upload,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      textColor: "text-purple-600",
      description: "File uploads",
    },
    {
      title: "Active Tokens",
      value: stats?.active_tokens || 0,
      icon: Key,
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
      textColor: "text-orange-600",
      description: "API tokens",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 p-4 sm:p-6 group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {formatNumber(card.value)}
                </p>
              </div>
              <div
                className={`${card.lightColor} p-2.5 sm:p-3 rounded-lg group-hover:scale-110 transition-transform shrink-0`}
              >
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${card.textColor}`} />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Activity className="h-3 w-3" />
              <span className="truncate">{card.description}</span>
            </div>

            {/* Progress indicator - optional visual enhancement */}
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${card.color} rounded-full transition-all duration-1000`}
                style={{ width: `${Math.min(100, (card.value / 100) * 10)}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
