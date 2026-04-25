import { Building2, Eye, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  useDeleteProfile,
  useGetProfile,
  useGetProfileCreationLog,
} from "../hooks/useQueries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export default function PendingGroupsReviewPage() {
  const { data: creationLog = [], isLoading } = useGetProfileCreationLog();
  const { mutate: deleteProfile, isPending: isDeleting } = useDeleteProfile();

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);

  const { data: selectedProfile } = useGetProfile(selectedProfileId);

  const handleViewDetails = (profileId: string) => {
    setSelectedProfileId(profileId);
    setDetailDialogOpen(true);
  };

  const handleDeleteGroup = (profileId: string) => {
    setProfileToDelete(profileId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (profileToDelete) {
      deleteProfile(profileToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setProfileToDelete(null);
        },
      });
    }
  };

  // Sort by most recent first
  const sortedLog = [...creationLog].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading group creation log...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                <Building2 className="w-6 h-6" />
                Pending Groups Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedLog.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No groups have been created yet
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organization Name</TableHead>
                        <TableHead>Creator Principal</TableHead>
                        <TableHead>Profile ID</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedLog.map((entry) => (
                        <TableRow
                          key={`log-${entry.creator}-${entry.timestamp}`}
                        >
                          <TableCell className="font-medium">
                            {entry.organizationName}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {entry.creator.toString()}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {entry.profileId}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(
                              Number(entry.timestamp) / 1000000,
                            ).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleViewDetails(entry.profileId)
                                }
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleDeleteGroup(entry.profileId)
                                }
                                disabled={isDeleting}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail View Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Group Details</DialogTitle>
            <DialogDescription>
              Detailed information about this organization
            </DialogDescription>
          </DialogHeader>
          {selectedProfile ? (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Organization Name
                  </p>
                  <p className="text-sm">{selectedProfile.organizationName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Profile ID
                  </p>
                  <p className="text-sm font-mono">{selectedProfile.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-sm">{selectedProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone
                  </p>
                  <p className="text-sm">{selectedProfile.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Address
                  </p>
                  <p className="text-sm">{selectedProfile.address}</p>
                </div>
                {selectedProfile.bio && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Bio
                    </p>
                    <p className="text-sm">{selectedProfile.bio}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Functions
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedProfile.functions.map((func) => (
                      <span
                        key={String(func)}
                        className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                      >
                        {String(func)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this group and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete Group"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
