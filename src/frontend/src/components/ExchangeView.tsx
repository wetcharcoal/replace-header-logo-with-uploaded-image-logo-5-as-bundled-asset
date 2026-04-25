import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import React, { useState } from "react";
import {
  type Need,
  type ResourceHave,
  useGetAllNeeds,
  useGetAllResources,
} from "../hooks/useQueries";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export default function ExchangeView() {
  const { data: allNeeds = [], isLoading: needsLoading } = useGetAllNeeds();
  const { data: allResources = [], isLoading: resourcesLoading } =
    useGetAllResources();
  const { data: userProfile } = useGetCallerUserProfile();

  const isLoading = needsLoading || resourcesLoading;

  // Find needs that have matching resources (same category)
  const getMatchingResources = (need: Need): ResourceHave[] => {
    return allResources.filter((r) => r.category === need.category);
  };

  // Your matches: needs from your profile that have matching resources
  const myProfileId = userProfile?.profileId;
  const myNeeds = myProfileId
    ? allNeeds.filter((n) => n.profileId === myProfileId)
    : [];
  const myNeedsWithMatches = myNeeds.filter(
    (n) => getMatchingResources(n).length > 0,
  );

  // Global matches: all needs that have matching resources
  const globalNeedsWithMatches = allNeeds.filter(
    (n) => getMatchingResources(n).length > 0,
  );

  // Group by category
  const groupByCategory = (needs: Need[]) => {
    const groups: Record<string, Need[]> = {};
    for (const need of needs) {
      if (!groups[need.category]) groups[need.category] = [];
      groups[need.category].push(need);
    }
    return groups;
  };

  const renderMatchGroup = (needs: Need[]) => {
    const groups = groupByCategory(needs);
    if (Object.keys(groups).length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <ArrowLeftRight className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No matches found yet.</p>
          <p className="text-sm mt-1">
            Matches appear when a need and resource share the same category.
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {Object.entries(groups).map(([category, categoryNeeds]) => (
          <Card key={category}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base capitalize">
                  {category}
                </CardTitle>
                <Badge className="bg-secondary text-secondary-foreground">
                  {categoryNeeds.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryNeeds.map((need) => {
                const matches = getMatchingResources(need);
                return (
                  <div key={need.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive" className="text-xs">
                        Need
                      </Badge>
                      <p className="text-sm font-medium">{need.description}</p>
                    </div>
                    {matches.length > 0 && (
                      <div className="ml-2 border-l-2 border-secondary pl-3 space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">
                          Matching Resources:
                        </p>
                        {matches.map((resource) => (
                          <p
                            key={resource.id}
                            className="text-sm text-foreground"
                          >
                            {resource.description}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-foreground">
        Exchange Opportunities
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="global">
          <TabsList className="mb-4">
            <TabsTrigger value="your">
              Your Matches ({myNeedsWithMatches.length})
            </TabsTrigger>
            <TabsTrigger value="global">
              Global Matches ({globalNeedsWithMatches.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="your">
            {renderMatchGroup(myNeedsWithMatches)}
          </TabsContent>
          <TabsContent value="global">
            {renderMatchGroup(globalNeedsWithMatches)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
