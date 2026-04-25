import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { ChevronDown, ChevronUp, Loader2, Search } from "lucide-react";
import React, { useState } from "react";
import type { Profile } from "../backend";
import {
  type Need,
  type ResourceHave,
  useDeleteNeed,
  useDeleteResource,
  useGetAllNeeds,
  useGetAllProfiles,
  useGetAllResources,
} from "../hooks/useQueries";
import { useIsCallerAdmin } from "../hooks/useQueries";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import NeedResourceCard from "./NeedResourceCard";

export default function ResourcesNeedsView() {
  const { data: needs = [], isLoading: needsLoading } = useGetAllNeeds();
  const { data: resources = [], isLoading: resourcesLoading } =
    useGetAllResources();
  const { data: profiles = [] } = useGetAllProfiles();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const { identity } = useInternetIdentity();

  const deleteNeed = useDeleteNeed();
  const deleteResource = useDeleteResource();

  const [search, setSearch] = useState("");
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());

  const callerPrincipal = identity?.getPrincipal().toString();

  const toggleOrg = (profileId: string) => {
    setExpandedOrgs((prev) => {
      const next = new Set(prev);
      if (next.has(profileId)) next.delete(profileId);
      else next.add(profileId);
      return next;
    });
  };

  const profileMap = new Map<string, Profile>(profiles.map((p) => [p.id, p]));

  const filteredNeeds = needs.filter(
    (n) =>
      n.description.toLowerCase().includes(search.toLowerCase()) ||
      n.category.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredResources = resources.filter(
    (r) =>
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()),
  );

  const groupByProfile = <T extends { profileId: string }>(items: T[]) => {
    const groups: Record<string, T[]> = {};
    for (const item of items) {
      if (!groups[item.profileId]) groups[item.profileId] = [];
      groups[item.profileId].push(item);
    }
    return groups;
  };

  const needsByProfile = groupByProfile(filteredNeeds);
  const resourcesByProfile = groupByProfile(filteredResources);

  const renderNeedOrgSection = (profileId: string, items: Need[]) => {
    const org = profileMap.get(profileId);
    const orgName = org?.organizationName ?? profileId;
    const isExpanded = expandedOrgs.has(`need-${profileId}`);
    return (
      <Card key={`need-${profileId}`} className="mb-3">
        <CardHeader
          className="cursor-pointer py-3"
          onClick={() => toggleOrg(`need-${profileId}`)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{orgName}</span>
              <Badge variant="outline" className="text-xs">
                {items.length}
              </Badge>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="pt-0 space-y-2">
            {items.map((need) => (
              <NeedResourceCard
                key={need.id}
                id={need.id}
                type="need"
                category={need.category}
                description={need.description}
                startDate={need.startDate}
                endDate={need.endDate}
                canDelete={isAdmin || need.owner === callerPrincipal}
                onDelete={() => deleteNeed.mutate(need.id)}
              />
            ))}
          </CardContent>
        )}
      </Card>
    );
  };

  const renderResourceOrgSection = (
    profileId: string,
    items: ResourceHave[],
  ) => {
    const org = profileMap.get(profileId);
    const orgName = org?.organizationName ?? profileId;
    const isExpanded = expandedOrgs.has(`resource-${profileId}`);
    return (
      <Card key={`resource-${profileId}`} className="mb-3">
        <CardHeader
          className="cursor-pointer py-3"
          onClick={() => toggleOrg(`resource-${profileId}`)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{orgName}</span>
              <Badge variant="outline" className="text-xs">
                {items.length}
              </Badge>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="pt-0 space-y-2">
            {items.map((resource) => (
              <NeedResourceCard
                key={resource.id}
                id={resource.id}
                type="resource"
                category={resource.category}
                description={resource.description}
                canDelete={isAdmin || resource.owner === callerPrincipal}
                onDelete={() => deleteResource.mutate(resource.id)}
              />
            ))}
          </CardContent>
        )}
      </Card>
    );
  };

  const isLoading = needsLoading || resourcesLoading;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search needs and resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-primary mb-3">
              Needs ({filteredNeeds.length})
            </h2>
            {Object.keys(needsByProfile).length === 0 ? (
              <p className="text-muted-foreground text-sm">No needs found.</p>
            ) : (
              Object.entries(needsByProfile).map(([profileId, items]) =>
                renderNeedOrgSection(profileId, items),
              )
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary mb-3">
              Resources ({filteredResources.length})
            </h2>
            {Object.keys(resourcesByProfile).length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No resources found.
              </p>
            ) : (
              Object.entries(resourcesByProfile).map(([profileId, items]) =>
                renderResourceOrgSection(profileId, items),
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
