import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import React from "react";
import type { Profile } from "../backend";
import { FunctionType } from "../backend";
import { useFileUrl } from "../blob-storage/FileStorage";
import {
  useGetNeedsByProfile,
  useGetResourcesByProfile,
} from "../hooks/useQueries";
import NeedResourceCard from "./NeedResourceCard";

const FUNCTION_LABELS: Record<FunctionType, string> = {
  [FunctionType.production]: "Production",
  [FunctionType.processing]: "Processing",
  [FunctionType.distribution]: "Distribution",
  [FunctionType.wasteManagement]: "Waste Management",
  [FunctionType.education]: "Education",
  [FunctionType.equipmentSpace]: "Equipment / Space",
};

interface OrganizationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

function ProfileImage({ path }: { path: string }) {
  const { data: url } = useFileUrl(path);
  if (!url) return <Skeleton className="h-16 w-16 rounded-full" />;
  return (
    <img
      src={url}
      alt="Profile"
      className="h-16 w-16 rounded-full object-cover border-2 border-border shadow"
    />
  );
}

export default function OrganizationDetailDialog({
  open,
  onOpenChange,
  profile,
}: OrganizationDetailDialogProps) {
  const { data: needs = [] } = useGetNeedsByProfile(profile.id);
  const { data: resources = [] } = useGetResourcesByProfile(profile.id);

  const bio = profile.bio ?? null;
  const phone = profile.phone ?? null;
  const address = profile.address ?? null;
  const profilePicture = profile.profilePicture ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            {profilePicture ? (
              <ProfileImage path={profilePicture} />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <DialogTitle className="text-xl font-bold truncate">
                {profile.organizationName}
              </DialogTitle>
              {bio && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {bio}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-5">
            {/* Functions */}
            {profile.functions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Functions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.functions.map((fn) => (
                    <Badge key={fn} variant="secondary" className="text-xs">
                      {FUNCTION_LABELS[fn as FunctionType] ?? fn}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="space-y-1.5 text-sm text-muted-foreground">
              {profile.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span>{profile.email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{phone}</span>
                </div>
              )}
              {address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{address}</span>
                </div>
              )}
            </div>

            {/* Needs */}
            {needs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Needs ({needs.length})
                </p>
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
                      canDelete={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {resources.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Resources ({resources.length})
                </p>
                <div className="space-y-2">
                  {resources.map((resource) => (
                    <NeedResourceCard
                      key={resource.id}
                      id={resource.id}
                      type="resource"
                      category={resource.category}
                      description={resource.description}
                      canDelete={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {needs.length === 0 && resources.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No needs or resources listed yet.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
