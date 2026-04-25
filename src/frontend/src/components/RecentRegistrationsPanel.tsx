import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Flag, Loader2, X } from "lucide-react";
import React from "react";
import {
  useClearFlag,
  useGetProfileCreationLog,
  useGetSuspiciousActivityFlags,
} from "../hooks/useQueries";

export default function RecentRegistrationsPanel() {
  const { data: flags = [], isLoading: flagsLoading } =
    useGetSuspiciousActivityFlags();
  const { data: log = [], isLoading: logLoading } = useGetProfileCreationLog();
  const clearFlag = useClearFlag();

  return (
    <div className="space-y-6">
      {/* Suspicious Activity Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Flag className="h-4 w-4 text-destructive" />
            Suspicious Activity Flags
          </CardTitle>
        </CardHeader>
        <CardContent>
          {flagsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : flags.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No suspicious activity detected.
            </p>
          ) : (
            <div className="space-y-2">
              {flags.map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-start justify-between p-2 border rounded-lg"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-medium">{flag.activityType}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {flag.principal}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {flag.details}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={() => clearFlag.mutate(flag.id)}
                    disabled={clearFlag.isPending}
                    title="Clear flag"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Profile Creations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" />
            Recent Registrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : log.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No recent registrations.
            </p>
          ) : (
            <div className="space-y-2">
              {[...log]
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 20)
                .map((entry) => (
                  <div
                    key={`${entry.creator}-${entry.timestamp}`}
                    className="p-2 border rounded-lg"
                  >
                    <p className="text-sm font-medium">
                      {entry.organizationName}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {entry.creator}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
