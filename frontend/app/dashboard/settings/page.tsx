"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Token {
  id: number;
  token: string;
  name: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  usage_count: number;
}

export default function SettingsPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTokenName, setNewTokenName] = useState("");
  const [creatingToken, setCreatingToken] = useState(false);
  const [visibleTokens, setVisibleTokens] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  // Get JWT token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Fetch all tokens
  const fetchTokens = async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        toast({
          title: "Error",
          description: "Please login first",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("http://localhost:8000/api/tokens", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data);
      } else {
        throw new Error("Failed to fetch tokens");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tokens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new token
  const createToken = async () => {
    if (!newTokenName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a token name",
        variant: "destructive",
      });
      return;
    }

    setCreatingToken(true);
    try {
      const authToken = getAuthToken();
      const response = await fetch(
        "http://localhost:8000/api/tokens/generate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newTokenName }),
        }
      );

      if (response.ok) {
        const newToken = await response.json();
        setTokens([newToken, ...tokens]);
        setNewTokenName("");

        // Copy token to clipboard
        await navigator.clipboard.writeText(newToken.token);

        toast({
          title: "Success!",
          description: "Token created and copied to clipboard",
        });

        // Show the new token by default
        setVisibleTokens(new Set([newToken.id]));
      } else {
        throw new Error("Failed to create token");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create token",
        variant: "destructive",
      });
    } finally {
      setCreatingToken(false);
    }
  };

  // Delete token
  const deleteToken = async (tokenId: number) => {
    if (!confirm("Are you sure you want to delete this token?")) {
      return;
    }

    try {
      const authToken = getAuthToken();
      const response = await fetch(
        `http://localhost:8000/api/tokens/${tokenId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        setTokens(tokens.filter((t) => t.id !== tokenId));
        toast({
          title: "Success",
          description: "Token deleted successfully",
        });
      } else {
        throw new Error("Failed to delete token");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete token",
        variant: "destructive",
      });
    }
  };

  // Toggle token active status
  const toggleToken = async (tokenId: number) => {
    try {
      const authToken = getAuthToken();
      const response = await fetch(
        `http://localhost:8000/api/tokens/${tokenId}/toggle`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        setTokens(
          tokens.map((t) =>
            t.id === tokenId ? { ...t, is_active: !t.is_active } : t
          )
        );
        toast({
          title: "Success",
          description: "Token status updated",
        });
      } else {
        throw new Error("Failed to toggle token");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update token status",
        variant: "destructive",
      });
    }
  };

  // Copy token to clipboard
  const copyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      toast({
        title: "Copied!",
        description: "Token copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy token",
        variant: "destructive",
      });
    }
  };

  // Toggle token visibility
  const toggleTokenVisibility = (tokenId: number) => {
    const newVisible = new Set(visibleTokens);
    if (newVisible.has(tokenId)) {
      newVisible.delete(tokenId);
    } else {
      newVisible.add(tokenId);
    }
    setVisibleTokens(newVisible);
  };

  // Mask token for display
  const maskToken = (token: string) => {
    return (
      token.substring(0, 12) +
      "•".repeat(20) +
      token.substring(token.length - 8)
    );
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage API tokens and application settings
        </p>
      </div>

      {/* Create New Token */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New API Token
          </CardTitle>
          <CardDescription>
            Generate a new token for merchant access to the upload API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="tokenName">Token Name</Label>
              <Input
                id="tokenName"
                placeholder="e.g., Merchant Store 1, Production API"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && createToken()}
                className="mt-2"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={createToken}
                disabled={creatingToken || !newTokenName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {creatingToken ? "Creating..." : "Generate Token"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>API Tokens ({tokens.length})</CardTitle>
          <CardDescription>
            Manage existing API tokens for merchant access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus className="h-16 w-16 mx-auto" />
              </div>
              <p className="text-gray-600 mb-2">No API tokens yet</p>
              <p className="text-sm text-gray-500">
                Create your first token to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="border rounded-lg p-4 hover:border-gray-400 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{token.name}</h3>
                        <Badge
                          variant={token.is_active ? "default" : "secondary"}
                          className={
                            token.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {token.is_active ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" /> Inactive
                            </>
                          )}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">
                            {visibleTokens.has(token.id)
                              ? token.token
                              : maskToken(token.token)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleTokenVisibility(token.id)}
                          >
                            {visibleTokens.has(token.id) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToken(token.token)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-500">Created</p>
                            <p className="font-medium">
                              {new Date(token.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Last Used</p>
                            <p className="font-medium">
                              {token.last_used_at
                                ? new Date(
                                    token.last_used_at
                                  ).toLocaleDateString()
                                : "Never"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Usage Count</p>
                            <p className="font-medium">{token.usage_count}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleToken(token.id)}
                        className={
                          token.is_active
                            ? "text-orange-600 hover:text-orange-700"
                            : "text-green-600 hover:text-green-700"
                        }
                      >
                        {token.is_active ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteToken(token.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How to Use API Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Generate a Token</h4>
            <p className="text-sm text-gray-600">
              Create a new token above by entering a descriptive name and
              clicking "Generate Token". The token will be automatically copied
              to your clipboard.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. Share with Merchant</h4>
            <p className="text-sm text-gray-600">
              Securely share the generated token with the merchant who needs to
              upload data.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. API Endpoint</h4>
            <p className="text-sm text-gray-600 mb-2">
              Merchants should use this endpoint to upload data:
            </p>
            <code className="block bg-gray-100 p-3 rounded text-sm font-mono">
              POST http://localhost:8000/api/upload?token=YOUR_TOKEN_HERE
            </code>
          </div>

          <div>
            <h4 className="font-semibold mb-2">4. Manage Tokens</h4>
            <p className="text-sm text-gray-600">
              You can disable tokens temporarily or delete them permanently.
              Track usage statistics to monitor merchant activity.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
