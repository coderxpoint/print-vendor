"use client";

import { useEffect, useState } from "react";
import { tokensAPI } from "@/lib/api";
import TokenList from "@/components/TokenList";
import type { APIToken } from "@/types";

export default function SettingsPage() {
  const [tokens, setTokens] = useState<APIToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdToken, setCreatedToken] = useState<APIToken | null>(null);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const data = await tokensAPI.list();
      setTokens(data);
    } catch (error) {
      console.error("Failed to fetch tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) {
      alert("Please enter a token name");
      return;
    }

    setCreating(true);
    try {
      const token = await tokensAPI.generate(newTokenName);
      setCreatedToken(token);
      setNewTokenName("");
      fetchTokens();
    } catch (error) {
      alert("Failed to create token");
    } finally {
      setCreating(false);
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setCreatedToken(null);
    setNewTokenName("");
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage API tokens for merchant access
        </p>
      </div>

      {/* Create Token Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium flex items-center space-x-2"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Generate New Token</span>
        </button>
      </div>

      {/* Tokens List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <TokenList tokens={tokens} onRefresh={fetchTokens} />
      )}

      {/* Create Token Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Generate New API Token
            </h3>

            <form onSubmit={handleCreateToken}>
              <div className="mb-6">
                <label
                  htmlFor="tokenName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Token Name
                </label>
                <input
                  id="tokenName"
                  type="text"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  placeholder="e.g., Merchant ABC"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  This name will help you identify which merchant is using this
                  token
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50"
                >
                  {creating ? "Generating..." : "Generate Token"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Token Created Modal */}
      {createdToken && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
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
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Token Generated Successfully!
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Copy this token now. You won't be able to see it again.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Name: {createdToken.name}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={createdToken.token}
                  readOnly
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdToken.token);
                    alert("Token copied to clipboard!");
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <svg
                  className="h-5 w-5 text-yellow-600 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Important:</p>
                  <p>
                    Save this token securely. It won't be shown again. Merchants
                    will need this token to upload data via the API.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
