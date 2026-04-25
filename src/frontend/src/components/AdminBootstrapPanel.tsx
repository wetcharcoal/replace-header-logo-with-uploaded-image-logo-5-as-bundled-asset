import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";
import React from "react";
import {
  useGetCallerUserRole,
  useInitializeAccessControl,
  useIsCallerAdmin,
} from "../hooks/useQueries";

export default function AdminBootstrapPanel() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: userRole } = useGetCallerUserRole();
  const initializeAccessControl = useInitializeAccessControl();

  // Only show if not yet initialized (user is guest)
  if (adminLoading) return null;
  if (isAdmin) return null;
  if (userRole && userRole !== "guest") return null;

  return (
    <Card className="border-dashed border-2 border-muted">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Admin Bootstrap
        </CardTitle>
        <CardDescription className="text-xs">
          If you are the first user, click below to become the general admin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {initializeAccessControl.isSuccess ? (
          <p className="text-xs text-secondary font-medium">
            ✓ Access control initialized. You are now admin.
          </p>
        ) : (
          <>
            {initializeAccessControl.isError && (
              <p className="text-xs text-destructive mb-2">
                {initializeAccessControl.error?.message ??
                  "Initialization failed."}
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => initializeAccessControl.mutate()}
              disabled={initializeAccessControl.isPending}
              className="w-full text-xs"
            >
              {initializeAccessControl.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Initializing…
                </>
              ) : (
                "Initialize as Admin"
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
