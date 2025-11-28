"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, logout, getUser } from "@/lib/auth";
import Link from "next/link";
import Navigation from "@/components/Navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push("/login");
    } else {
      const user = getUser();
      if (user) {
        setUsername(user.username);
      }
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2024 Data Validation System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
