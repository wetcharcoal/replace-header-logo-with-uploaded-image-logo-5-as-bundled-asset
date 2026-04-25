import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  Building2,
  Calendar,
  ChevronDown,
  History,
  Home,
  LogOut,
  Menu,
  Shield,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { useGetCallerUserProfile, useIsCallerAdmin } from "../hooks/useQueries";
import DisplayNameDialog from "./DisplayNameDialog";

export interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  profileName?: string;
}

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "profile", label: "My Profile", icon: User },
  { id: "exchange", label: "Exchange", icon: ArrowLeftRight },
  { id: "events", label: "Events", icon: Calendar },
  { id: "join", label: "Join Org", icon: UserPlus },
];

const ADMIN_NAV_ITEMS = [
  { id: "admin", label: "Admin", icon: Shield },
  { id: "admin-users", label: "Users", icon: Users },
  { id: "pending-groups", label: "Groups", icon: Building2 },
  { id: "whitelist-history", label: "History", icon: History },
];

export default function Header({ currentView, onNavigate }: HeaderProps) {
  const { identity, clear } = useInternetIdentity();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const queryClient = useQueryClient();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDisplayNameDialog, setShowDisplayNameDialog] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const principalStr = identity?.getPrincipal().toString();
  const shortPrincipal = principalStr
    ? `${principalStr.slice(0, 5)}…${principalStr.slice(-3)}`
    : "";

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNav("home")}
            className="flex items-center gap-2 font-bold text-foreground hover:text-primary transition-colors flex-shrink-0"
          >
            <img
              src="/assets/logo.png"
              alt="MFS"
              className="h-8 w-8 object-contain"
            />
            <span className="hidden sm:inline text-sm font-semibold">
              Montreal Food System
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}

            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {ADMIN_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{shortPrincipal}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => setShowDisplayNameDialog(true)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Set Display Name
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-1.5 rounded-md hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}

            {isAdmin && (
              <>
                <div className="pt-1 pb-0.5 px-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Admin
                  </p>
                </div>
                {ADMIN_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </>
            )}

            <div className="pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          </div>
        )}
      </header>

      <DisplayNameDialog
        open={showDisplayNameDialog}
        onOpenChange={setShowDisplayNameDialog}
      />
    </>
  );
}
