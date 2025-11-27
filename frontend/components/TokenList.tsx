"use client";

import { useState } from "react";
import { tokensAPI } from "@/lib/api";
import { formatDate, copyToClipboard } from "@/lib/utils";
import type { APIToken } from "@/types";

interface TokenListProps {
  tokens: APIToken[];
  onRefresh: () => void;
}

export default function TokenList({ tokens, onRefresh }: TokenListProps) {
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = async (token: string, id: number) => {
    const success = await copyToClipboard(token);
    if (success) {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await tokensAPI.toggle(id);
      onRefresh();
    } catch (error) {
      alert("Failed to toggle token");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this token?")) {
      return;
    }

    try {
      await tokensAPI.delete(id);
      onRefresh();
    } catch (error) {
      alert("Failed to delete token");
    }
  };

  return (
    <div className="space-y-4">
      {tokens.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
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
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
          <p className="text-gray-500">No API tokens generated yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Generate a token to allow merchants to upload data
          </p>
        </div>
      ) : (
        tokens.map((token) => (
          <div
            key={token.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              {/* Token Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {token.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      token.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {token.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Token String */}
                <div className="mb-3">
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono text-gray-700 truncate">
                      {token.token}
                    </code>
                    <button
                      onClick={() => handleCopy(token.token, token.id)}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition"
                      title="Copy token"
                    >
                      {copied === token.id ? (
                        <svg
                          className="h-5 w-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
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
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Token Stats */}
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Created: {formatDate(token.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <span>Used: {token.usage_count} times</span>
                  </div>
                  {token.last_used_at && (
                    <div className="flex items-center space-x-1">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>Last used: {formatDate(token.last_used_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleToggle(token.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                    token.is_active
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {token.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(token.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete token"
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
            </div>
          </div>
        ))
      )}
    </div>
  );
}
