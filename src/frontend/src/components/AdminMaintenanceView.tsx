import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, Trash2, UserCheck, UserX } from "lucide-react";
import React, { useState } from "react";
import { ApprovalStatus } from "../backend";
import {
  useAssignUserRole,
  useDeleteEvent,
  useDeleteNeed,
  useDeleteProfile,
  useDeleteResource,
  useGetAllEvents,
  useGetAllNeeds,
  useGetAllProfiles,
  useGetAllResources,
  useGetCallerUserRole,
  useListApprovals,
  useSetApproval,
} from "../hooks/useQueries";

export default function AdminMaintenanceView() {
  const {
    data: profiles = [],
    isLoading: profilesLoading,
    refetch: refetchProfiles,
  } = useGetAllProfiles();
  const {
    data: needs = [],
    isLoading: needsLoading,
    refetch: refetchNeeds,
  } = useGetAllNeeds();
  const {
    data: resources = [],
    isLoading: resourcesLoading,
    refetch: refetchResources,
  } = useGetAllResources();
  const {
    data: events = [],
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useGetAllEvents();
  const {
    data: approvals = [],
    isLoading: approvalsLoading,
    refetch: refetchApprovals,
  } = useListApprovals();

  const deleteProfile = useDeleteProfile();
  const deleteNeed = useDeleteNeed();
  const deleteResource = useDeleteResource();
  const deleteEvent = useDeleteEvent();
  const setApproval = useSetApproval();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6 text-foreground">
        Admin Maintenance
      </h1>

      <Tabs defaultValue="profiles">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="profiles">
            Profiles ({profiles.length})
          </TabsTrigger>
          <TabsTrigger value="needs">Needs ({needs.length})</TabsTrigger>
          <TabsTrigger value="resources">
            Resources ({resources.length})
          </TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="approvals">
            Approvals ({approvals.length})
          </TabsTrigger>
        </TabsList>

        {/* Profiles Tab */}
        <TabsContent value="profiles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Profiles</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchProfiles()}
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {profilesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : profiles.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No profiles found.
                </p>
              ) : (
                <div className="space-y-2">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {profile.organizationName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {profile.email}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {profile.id}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "
                              {profile.organizationName}"? This cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteProfile.mutate(profile.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Needs Tab */}
        <TabsContent value="needs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Needs</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchNeeds()}
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {needsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : needs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No needs found.
                </p>
              ) : (
                <div className="space-y-2">
                  {needs.map((need) => (
                    <div
                      key={need.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{need.description}</p>
                        <Badge variant="outline" className="text-xs">
                          {need.category}
                        </Badge>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          {need.profileId}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Need</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete this need? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteNeed.mutate(need.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Resources</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchResources()}
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {resourcesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : resources.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No resources found.
                </p>
              ) : (
                <div className="space-y-2">
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{resource.description}</p>
                        <Badge variant="outline" className="text-xs">
                          {resource.category}
                        </Badge>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          {resource.profileId}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete this resource? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteResource.mutate(resource.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Events</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchEvents()}
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : events.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No events found.
                </p>
              ) : (
                <div className="space-y-2">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{event.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(Number(event.time)).toLocaleDateString()}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete this event? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteEvent.mutate(event.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Approvals</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchApprovals()}
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {approvalsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : approvals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No approval requests.
                </p>
              ) : (
                <div className="space-y-2">
                  {approvals.map((approval) => (
                    <div
                      key={approval.principal.toString()}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-mono">
                          {approval.principal.toString()}
                        </p>
                        <Badge
                          variant={
                            approval.status === ApprovalStatus.approved
                              ? "default"
                              : approval.status === ApprovalStatus.rejected
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs mt-1"
                        >
                          {approval.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-secondary border-secondary hover:bg-secondary/10"
                          onClick={() =>
                            setApproval.mutate({
                              user: approval.principal,
                              status: ApprovalStatus.approved,
                            })
                          }
                          disabled={setApproval.isPending}
                        >
                          <UserCheck className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive hover:bg-destructive/10"
                          onClick={() =>
                            setApproval.mutate({
                              user: approval.principal,
                              status: ApprovalStatus.rejected,
                            })
                          }
                          disabled={setApproval.isPending}
                        >
                          <UserX className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
