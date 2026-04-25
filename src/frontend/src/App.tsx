import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Loader2 } from "lucide-react";
import React, { Suspense } from "react";
import RuntimeErrorBoundary from "./components/RuntimeErrorBoundary";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  if (isInitializing) return <Spinner />;
  if (!isAuthenticated) return <LoginPage />;
  if (profileLoading || !profileFetched) return <Spinner />;

  if (!userProfile) {
    return (
      <OnboardingPage
        onComplete={() => {
          // After onboarding, reload to re-fetch the user profile from backend
          window.location.reload();
        }}
      />
    );
  }

  return <HomePage profileId={userProfile.profileId} />;
}

export default function App() {
  return (
    <RuntimeErrorBoundary>
      <Suspense fallback={<Spinner />}>
        <AppContent />
      </Suspense>
    </RuntimeErrorBoundary>
  );
}
