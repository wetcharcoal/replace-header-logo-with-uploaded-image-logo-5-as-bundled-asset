import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Building2, Users } from "lucide-react";
import { useState } from "react";
import AdminBootstrapPanel from "../components/AdminBootstrapPanel";
import PrincipalInfoCard from "../components/PrincipalInfoCard";
import RegistrationPage from "./RegistrationPage";

interface OnboardingPageProps {
  onComplete: () => void;
}

type OnboardingView = "choice" | "register-org";

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const { identity } = useInternetIdentity();
  const [view, setView] = useState<OnboardingView>("choice");

  if (view === "register-org") {
    return (
      <RegistrationPage
        onSuccess={onComplete}
        onBack={() => setView("choice")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome to the Montreal Food System
          </h1>
          <p className="text-muted-foreground text-sm">
            How would you like to participate?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => setView("register-org")}
            className="flex items-center gap-4 p-5 border-2 border-border rounded-xl hover:border-primary transition-colors text-left bg-card"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Register an Organization
              </p>
              <p className="text-sm text-muted-foreground">
                Create a profile for your food system organization.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onComplete}
            className="flex items-center gap-4 p-5 border-2 border-border rounded-xl hover:border-primary transition-colors text-left bg-card"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Join as a Member</p>
              <p className="text-sm text-muted-foreground">
                Browse organizations and request to join one.
              </p>
            </div>
          </button>
        </div>

        {identity && (
          <div className="space-y-3">
            <PrincipalInfoCard />
            <AdminBootstrapPanel />
          </div>
        )}
      </div>
    </div>
  );
}
