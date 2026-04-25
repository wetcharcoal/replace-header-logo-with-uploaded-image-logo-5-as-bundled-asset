import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Loader2 } from "lucide-react";
import React, { useState } from "react";
import type { Profile } from "../backend";
import { useFileUrl } from "../blob-storage/FileStorage";
import {
  useGetAllNeeds,
  useGetAllProfiles,
  useGetAllResources,
} from "../hooks/useQueries";
import OrganizationDetailDialog from "./OrganizationDetailDialog";

function ProfileThumb({ path }: { path: string }) {
  const { data: url } = useFileUrl(path);
  if (!url) return null;
  return <img src={url} alt="" className="w-8 h-8 rounded-full object-cover" />;
}

export default function HomePageView() {
  const { data: profiles = [], isLoading: profilesLoading } =
    useGetAllProfiles();
  const { data: needs = [], isLoading: needsLoading } = useGetAllNeeds();
  const { data: resources = [], isLoading: resourcesLoading } =
    useGetAllResources();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Needs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Current Needs</CardTitle>
          </CardHeader>
          <CardContent>
            {needsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : needs.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No needs posted yet.
              </p>
            ) : (
              <div className="space-y-2">
                {needs.slice(0, 10).map((need) => (
                  <div key={need.id} className="p-2 border rounded-lg">
                    <p className="text-sm font-medium line-clamp-2">
                      {need.description}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {need.category}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-secondary">
              Available Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resourcesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : resources.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No resources posted yet.
              </p>
            ) : (
              <div className="space-y-2">
                {resources.slice(0, 10).map((resource) => (
                  <div key={resource.id} className="p-2 border rounded-lg">
                    <p className="text-sm font-medium line-clamp-2">
                      {resource.description}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {resource.category}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Profiles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            {profilesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : profiles.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No organizations registered yet.
              </p>
            ) : (
              <div className="space-y-2">
                {profiles.map((profile) => (
                  <button
                    type="button"
                    key={profile.id}
                    className="w-full flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/50 transition-colors text-left"
                    onClick={() => setSelectedProfile(profile)}
                  >
                    {profile.profilePicture ? (
                      <ProfileThumb path={profile.profilePicture} />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {profile.organizationName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {profile.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedProfile && (
        <OrganizationDetailDialog
          profile={selectedProfile}
          open={!!selectedProfile}
          onOpenChange={(open) => {
            if (!open) setSelectedProfile(null);
          }}
        />
      )}
    </div>
  );
}
