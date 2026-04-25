import React, { useState } from "react";
import AdminMaintenanceView from "../components/AdminMaintenanceView";
import AdminUserManagementDashboard from "../components/AdminUserManagementDashboard";
import EventsPage from "../components/EventsPage";
import ExchangeView from "../components/ExchangeView";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HomePageView from "../components/HomePageView";
import PendingGroupsReviewPage from "../components/PendingGroupsReviewPage";
import ProfileView from "../components/ProfileView";
import RuntimeErrorBoundary from "../components/RuntimeErrorBoundary";
import WhitelistHistoryViewer from "../components/WhitelistHistoryViewer";
import { useIsCallerAdmin } from "../hooks/useQueries";
import MemberJoinPage from "./MemberJoinPage";

type ActiveView =
  | "home"
  | "profile"
  | "exchange"
  | "events"
  | "admin"
  | "admin-users"
  | "pending-groups"
  | "whitelist-history"
  | "join";

interface HomePageProps {
  profileId: string;
}

export default function HomePage({ profileId }: HomePageProps) {
  const [activeView, setActiveView] = useState<ActiveView>("home");
  const { data: isAdmin = false } = useIsCallerAdmin();

  const handleNavigate = (view: string) => {
    setActiveView(view as ActiveView);
  };

  const renderView = () => {
    switch (activeView) {
      case "home":
        return <HomePageView />;
      case "profile":
        return <ProfileView profileId={profileId} />;
      case "exchange":
        return <ExchangeView />;
      case "events":
        return <EventsPage />;
      case "admin":
        return isAdmin ? (
          <AdminMaintenanceView />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-muted-foreground">
              Unauthorized: Admin access required.
            </p>
          </div>
        );
      case "admin-users":
        return isAdmin ? (
          <AdminUserManagementDashboard />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-muted-foreground">
              Unauthorized: Admin access required.
            </p>
          </div>
        );
      case "pending-groups":
        return isAdmin ? (
          <PendingGroupsReviewPage />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-muted-foreground">
              Unauthorized: Admin access required.
            </p>
          </div>
        );
      case "whitelist-history":
        return isAdmin ? (
          <WhitelistHistoryViewer />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-muted-foreground">
              Unauthorized: Admin access required.
            </p>
          </div>
        );
      case "join":
        return <MemberJoinPage />;
      default:
        return <HomePageView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        currentView={activeView}
        onNavigate={handleNavigate}
        profileName={profileId}
      />
      <main className="flex-1 flex flex-col">
        <RuntimeErrorBoundary key={activeView}>
          {renderView()}
        </RuntimeErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
