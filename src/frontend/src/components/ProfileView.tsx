import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Loader2, Mail, MapPin, Phone, Plus, Users } from "lucide-react";
import React, { useState } from "react";
import { FunctionType } from "../backend";
import { useFileUrl } from "../blob-storage/FileStorage";
import {
  Need,
  ResourceHave,
  useDeleteNeed,
  useDeleteResource,
  useGetNeedsByProfile,
  useGetProfile,
  useGetProfileMembers,
  useGetResourcesByProfile,
  useIsCallerAdmin,
} from "../hooks/useQueries";
import ClubMemberManagementDialog from "./ClubMemberManagementDialog";
import HaveForm from "./HaveForm";
import NeedForm from "./NeedForm";
import NeedResourceCard from "./NeedResourceCard";

const FUNCTION_LABELS: Record<FunctionType, string> = {
  [FunctionType.production]: "Production",
  [FunctionType.processing]: "Processing",
  [FunctionType.distribution]: "Distribution",
  [FunctionType.wasteManagement]: "Waste Management",
  [FunctionType.education]: "Education",
  [FunctionType.equipmentSpace]: "Equipment / Space",
};

interface ProfileViewProps {
  profileId: string;
}

function ProfilePicture({ path }: { path: string }) {
  const { data: url } = useFileUrl(path);
  if (!url)
    return (
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
        ?
      </div>
    );
  return (
    <img
      src={url}
      alt="Profile"
      className="w-20 h-20 rounded-full object-cover border-2 border-border"
    />
  );
}

export default function ProfileView({ profileId }: ProfileViewProps) {
  const { identity } = useInternetIdentity();
  const callerPrincipal = identity?.getPrincipal().toString();

  const { data: profile, isLoading: profileLoading } = useGetProfile(profileId);
  const { data: needs = [], isLoading: needsLoading } =
    useGetNeedsByProfile(profileId);
  const { data: resources = [], isLoading: resourcesLoading } =
    useGetResourcesByProfile(profileId);
  const { data: members = [] } = useGetProfileMembers(profileId);
  const { data: isAdmin = false } = useIsCallerAdmin();

  const deleteNeed = useDeleteNeed();
  const deleteResource = useDeleteResource();

  const [showNeedForm, setShowNeedForm] = useState(false);
  const [showHaveForm, setShowHaveForm] = useState(false);
  const [showMembersDialog, setShowMembersDialog] = useState(false);

  const isOwner = profile?.owner?.toString() === callerPrincipal;
  const isClubAdmin = members.some(
    (m) => m.principal.toString() === callerPrincipal && m.role === "clubAdmin",
  );
  const canManage = isOwner || isClubAdmin || isAdmin;

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Profile not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {profile.profilePicture ? (
              <ProfilePicture path={profile.profilePicture} />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                {profile.organizationName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground">
                {profile.organizationName}
              </h1>
              {profile.bio && (
                <p className="text-muted-foreground mt-1">{profile.bio}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {profile.functions.map((fn) => (
                  <Badge key={fn} variant="secondary" className="text-xs">
                    {FUNCTION_LABELS[fn as FunctionType] ?? fn}
                  </Badge>
                ))}
              </div>
            </div>
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMembersDialog(true)}
              >
                <Users className="h-4 w-4 mr-1" />
                Members
              </Button>
            )}
          </div>

          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            {profile.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>{profile.email}</span>
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{profile.phone}</span>
              </div>
            )}
            {profile.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{profile.address}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Needs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg text-primary">Needs</CardTitle>
          {canManage && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNeedForm(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Need
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {needsLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : needs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No needs listed.</p>
          ) : (
            <div className="space-y-2">
              {needs.map((need) => (
                <NeedResourceCard
                  key={need.id}
                  id={need.id}
                  type="need"
                  category={need.category}
                  description={need.description}
                  startDate={need.startDate}
                  endDate={need.endDate}
                  canDelete={
                    isAdmin || need.owner === callerPrincipal || isClubAdmin
                  }
                  onDelete={() => deleteNeed.mutate(need.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg text-secondary">Resources</CardTitle>
          {canManage && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowHaveForm(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Resource
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {resourcesLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : resources.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No resources listed.
            </p>
          ) : (
            <div className="space-y-2">
              {resources.map((resource) => (
                <NeedResourceCard
                  key={resource.id}
                  id={resource.id}
                  type="resource"
                  category={resource.category}
                  description={resource.description}
                  canDelete={
                    isAdmin || resource.owner === callerPrincipal || isClubAdmin
                  }
                  onDelete={() => deleteResource.mutate(resource.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showNeedForm && (
        <NeedForm
          profileId={profileId}
          onClose={() => setShowNeedForm(false)}
        />
      )}
      {showHaveForm && (
        <HaveForm
          profileId={profileId}
          onClose={() => setShowHaveForm(false)}
        />
      )}
      {showMembersDialog && (
        <ClubMemberManagementDialog
          profileId={profileId}
          onClose={() => setShowMembersDialog(false)}
        />
      )}
    </div>
  );
}
