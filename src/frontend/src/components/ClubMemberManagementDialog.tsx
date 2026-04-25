import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Principal } from "@icp-sdk/core/principal";
import { Loader2, UserCheck, UserMinus, UserPlus, UserX } from "lucide-react";
import React, { useState } from "react";
import {
  type JoinRequest,
  type ProfileMember,
  type ProfileRole,
  useAddProfileMember,
  useGetJoinRequests,
  useGetProfileMembers,
  useHandleJoinRequest,
  useRemoveProfileMember,
} from "../hooks/useQueries";

interface ClubMemberManagementDialogProps {
  profileId: string;
  onClose: () => void;
}

function getDisplayName(member: ProfileMember | JoinRequest): string {
  const arr = member.displayName;
  if (Array.isArray(arr) && arr.length > 0) return arr[0] as string;
  return `${member.principal.toString().slice(0, 12)}…`;
}

export default function ClubMemberManagementDialog({
  profileId,
  onClose,
}: ClubMemberManagementDialogProps) {
  const { data: members = [], isLoading: membersLoading } =
    useGetProfileMembers(profileId);
  const { data: joinRequests = [] } = useGetJoinRequests(profileId);

  const addMember = useAddProfileMember();
  const removeMember = useRemoveProfileMember();
  const handleRequest = useHandleJoinRequest();

  const [newPrincipal, setNewPrincipal] = useState("");
  const newRole: ProfileRole = "user";
  const [addError, setAddError] = useState<string | null>(null);

  const handleAddMember = async () => {
    setAddError(null);
    if (!newPrincipal.trim()) {
      setAddError("Principal is required.");
      return;
    }
    try {
      const principal = Principal.fromText(newPrincipal.trim());
      await addMember.mutateAsync({
        profileId,
        member: { principal, role: newRole, displayName: [] },
      });
      setNewPrincipal("");
    } catch (err: any) {
      setAddError(err?.message ?? "Invalid principal.");
    }
  };

  const pendingRequests = joinRequests.filter((r) => r.status === "pending");

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
        </DialogHeader>

        {/* Pending Join Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
              Pending Requests
            </h3>
            <div className="space-y-2">
              {pendingRequests.map((req) => (
                <div
                  key={req.principal.toString()}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <span className="text-sm">{getDisplayName(req)}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-secondary border-secondary"
                      onClick={() =>
                        handleRequest.mutate({
                          profileId,
                          principal: req.principal.toString(),
                          status: "approved",
                        })
                      }
                      disabled={handleRequest.isPending}
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive"
                      onClick={() =>
                        handleRequest.mutate({
                          profileId,
                          principal: req.principal.toString(),
                          status: "denied",
                        })
                      }
                      disabled={handleRequest.isPending}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Members */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
            Members ({members.length})
          </h3>
          {membersLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.principal.toString()}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div>
                    <span className="text-sm">{getDisplayName(member)}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {member.role}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() =>
                      removeMember.mutate({
                        profileId,
                        principal: member.principal.toString(),
                      })
                    }
                    disabled={removeMember.isPending}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Member */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
            Add Member
          </h3>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="newPrincipal">Principal ID</Label>
              <Input
                id="newPrincipal"
                value={newPrincipal}
                onChange={(e) => setNewPrincipal(e.target.value)}
                placeholder="aaaaa-bbbbb-ccccc-ddddd-eee"
                disabled={addMember.isPending}
              />
            </div>
            {addError && <p className="text-xs text-destructive">{addError}</p>}
            <Button
              onClick={handleAddMember}
              disabled={addMember.isPending}
              size="sm"
              className="w-full"
            >
              {addMember.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
