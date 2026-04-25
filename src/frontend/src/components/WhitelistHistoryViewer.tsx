import { History, Loader2 } from "lucide-react";
import { useGetHistoricalWhitelist } from "../hooks/useQueries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export default function WhitelistHistoryViewer() {
  const { data: whitelist = [], isLoading } = useGetHistoricalWhitelist();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading whitelist history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <History className="w-6 h-6" />
              Historical Whitelist
            </CardTitle>
            <CardDescription>
              This is a read-only view of previously whitelisted users for
              reference purposes only. The whitelist system has been replaced
              with open registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {whitelist.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No historical whitelist data available
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Principal ID</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {whitelist.map((entry) => (
                      <TableRow key={entry.principal.toString()}>
                        <TableCell className="font-mono text-xs">
                          {entry.principal.toString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(
                            Number(entry.timestamp) / 1000000,
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {entry.reason}
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
  );
}
