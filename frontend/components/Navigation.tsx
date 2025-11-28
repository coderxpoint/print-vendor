"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get user info from localStorage
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        setUsername(userData.username || "Admin");
      }
    } catch (error) {
      setUsername("Admin");
    }
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  if (!mounted) return null;

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 group"
            >
              <div className="bg-linear-to-br from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg font-bold shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                <Shield className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg text-gray-900">
                  QR Validator
                </span>
                <p className="text-xs text-gray-500 -mt-0.5">Data Management</p>
              </div>
              <span className="sm:hidden font-bold text-lg text-gray-900">
                QR Validator
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);

                return (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant={active ? "default" : "ghost"}
                      className={`flex items-center gap-2 relative ${
                        active ? "bg-blue-600 hover:bg-blue-700" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                      {link.badge && (
                        <Badge
                          variant="secondary"
                          className="ml-1 px-1.5 py-0.5 text-xs"
                        >
                          {link.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}

              {/* User Menu - Desktop */}
              <div className="ml-3 pl-3 border-l border-gray-200">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 hover:bg-gray-100"
                    >
                      <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-medium shadow-sm">
                        {username.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden lg:inline text-sm font-medium text-gray-700">
                        {username}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">{username}</span>
                        <span className="text-xs text-gray-500 font-normal">
                          Administrator
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-16 right-0 bottom-0 w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* User Info */}
          <div className="p-4 border-b border-gray-200 bg-linear-to-br from-blue-50 to-blue-100">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-md">
                {username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{username}</p>
                <p className="text-xs text-gray-600">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-2 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);

                return (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant={active ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-3 ${
                        active
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          : ""
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{link.label}</span>
                      {link.badge && (
                        <Badge
                          variant="secondary"
                          className="ml-auto px-1.5 py-0.5 text-xs"
                        >
                          {link.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
