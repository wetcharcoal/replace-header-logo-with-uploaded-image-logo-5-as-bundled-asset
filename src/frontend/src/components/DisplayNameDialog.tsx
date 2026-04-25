import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useGetDisplayName, useSetDisplayName } from "../hooks/useQueries";

interface DisplayNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DisplayNameDialog({
  open,
  onOpenChange,
}: DisplayNameDialogProps) {
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString();

  const { data: currentDisplayName } = useGetDisplayName(
    principalStr ?? undefined,
  );
  const setDisplayName = useSetDisplayName();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentDisplayName) setName(currentDisplayName);
  }, [currentDisplayName]);

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    if (!principalStr) {
      setError("Not authenticated.");
      return;
    }
    try {
      await setDisplayName.mutateAsync({
        principal: principalStr,
        name: name.trim(),
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message ?? "Failed to save display name.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Display Name</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={setDisplayName.isPending}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={setDisplayName.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={setDisplayName.isPending}>
            {setDisplayName.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
