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
import { Principal } from "@icp-sdk/core/principal";
import { Loader2, RefreshCw, Trash2, UserCheck, UserX } from "lucide-react";
import React, { useState } from "react";
import { ApprovalStatus } from "../backend";
import {
  useAssignUserRole,
  useDeleteUser,
  useGetAllProfiles,
  useListApprovals,
  useSetApproval,
} from "../hooks/useQueries";

interface UserRow {
  principalStr: string;
  organizationName: string;
  email: string;
  profileId: string;
}

export default function AdminUserManagementDashboard() {
  const {
    data: profiles = [],
    isLoading: profilesLoading,
    refetch,
  } = useGetAllProfiles();
  const { data: approvals = [] } = useListApprovals();
  const deleteUser = useDeleteUser();
  const setApproval = useSetApproval();

  const users: UserRow[] = profiles.map((p) => ({
    principalStr: p.owner.toString(),
    organizationName: p.organizationName,
    email: p.email,
    profileId: p.id,
  }));

  const getApprovalStatus = (principalStr: string) => {
    const approval = approvals.find(
      (a) => a.principal.toString() === principalStr,
    );
    return approval?.status ?? "unknown";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {profilesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No users found.
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const status = getApprovalStatus(user.principalStr);
                return (
                  <div
                    key={user.principalStr}
                    className="p-3 border rounded-lg space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {user.organizationName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground truncate">
                          {user.principalStr}
                        </p>
                      </div>
                      <Badge
                        variant={
                          status === ApprovalStatus.approved
                            ? "default"
                            : status === ApprovalStatus.rejected
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs flex-shrink-0"
                      >
                        {status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-secondary border-secondary text-xs"
                        onClick={() =>
                          setApproval.mutate({
                            user: Principal.fromText(user.principalStr),
                            status: ApprovalStatus.approved,
                          })
                        }
                        disabled={setApproval.isPending}
                      >
                        <UserCheck className="h-3 w-3 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive text-xs"
                        onClick={() =>
                          setApproval.mutate({
                            user: Principal.fromText(user.principalStr),
                            status: ApprovalStatus.rejected,
                          })
                        }
                        disabled={setApproval.isPending}
                      >
                        <UserX className="h-3 w-3 mr-1" /> Reject
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete all data for "{user.organizationName}"?
                              This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deleteUser.mutate(user.principalStr)
                              }
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
