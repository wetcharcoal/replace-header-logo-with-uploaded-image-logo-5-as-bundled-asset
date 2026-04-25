import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Search,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  type JoinRequestStatus,
  type Profile,
  useGetAllProfiles,
  useRequestJoin,
} from "../hooks/useQueries";

interface MemberJoinPageProps {
  onBack?: () => void;
}

export default function MemberJoinPage({ onBack }: MemberJoinPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [requestStatus, setRequestStatus] = useState<JoinRequestStatus | null>(
    null,
  );

  const { data: allProfiles = [] } = useGetAllProfiles();
  const { mutate: requestJoin, isPending } = useRequestJoin();
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const filteredProfiles = searchTerm.trim()
    ? allProfiles.filter((p: Profile) =>
        p.organizationName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : allProfiles;

  const handleSubmitRequest = () => {
    if (!selectedProfile || !identity) return;
    const principal = identity.getPrincipal();
    requestJoin(
      {
        principal,
        profileId: selectedProfile.id,
        status: "pending",
        displayName: [],
      },
      {
        onSuccess: () => {
          setHasSubmitted(true);
          setRequestStatus("pending");
        },
      },
    );
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  if (hasSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center py-12 px-4">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            {requestStatus === "pending" && (
              <>
                <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-10 h-10 text-yellow-600" />
                </div>
                <CardTitle className="text-3xl">Request Pending</CardTitle>
                <CardDescription className="text-base">
                  Your request to join{" "}
                  <span className="font-semibold text-foreground">
                    {selectedProfile?.organizationName}
                  </span>{" "}
                  has been submitted.
                </CardDescription>
              </>
            )}
            {requestStatus === "approved" && (
              <>
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <CardTitle className="text-3xl">Request Approved!</CardTitle>
                <CardDescription className="text-base">
                  Your request has been approved. Please refresh the page to
                  access your organization.
                </CardDescription>
              </>
            )}
            {requestStatus === "denied" && (
              <>
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <CardTitle className="text-3xl">Request Denied</CardTitle>
                <CardDescription className="text-base">
                  Your request to join was not approved. You can submit a new
                  request to a different organization.
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {requestStatus === "pending" && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  Your request is being reviewed by the organization admin.
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {requestStatus === "denied" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setHasSubmitted(false);
                    setRequestStatus(null);
                    setSelectedProfile(null);
                  }}
                >
                  Try Another Organization
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-muted-foreground"
              >
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center py-12 px-4">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader className="space-y-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <CardTitle className="text-2xl">Join an Organization</CardTitle>
          <CardDescription>
            Search for an organization and submit a request to join.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-64 rounded-md border">
            <div className="p-2 space-y-1">
              {filteredProfiles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {searchTerm
                    ? "No organizations found."
                    : "No organizations available."}
                </p>
              ) : (
                filteredProfiles.map((profile: Profile) => (
                  <button
                    type="button"
                    key={profile.id}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                      selectedProfile?.id === profile.id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {profile.organizationName}
                      </p>
                      {profile.bio && (
                        <p className="text-xs text-muted-foreground truncate">
                          {profile.bio}
                        </p>
                      )}
                    </div>
                    {selectedProfile?.id === profile.id && (
                      <Badge
                        variant="default"
                        className="ml-auto shrink-0 text-xs"
                      >
                        Selected
                      </Badge>
                    )}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          <Button
            className="w-full"
            disabled={!selectedProfile || isPending}
            onClick={handleSubmitRequest}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                Submitting...
              </span>
            ) : selectedProfile ? (
              `Request to Join ${selectedProfile.organizationName}`
            ) : (
              "Select an Organization"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
