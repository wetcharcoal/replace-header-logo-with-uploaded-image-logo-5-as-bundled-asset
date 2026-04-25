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
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
  type Event,
  useCreateEvent,
  useUpdateEvent,
} from "../hooks/useQueries";

interface EventFormProps {
  profileId: string;
  editEvent: Event | null;
  onClose: () => void;
}

export default function EventForm({
  profileId,
  editEvent,
  onClose,
}: EventFormProps) {
  const { identity } = useInternetIdentity();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const [description, setDescription] = useState(editEvent?.description ?? "");
  const [location, setLocation] = useState(editEvent?.location ?? "");
  const [dateStr, setDateStr] = useState(
    editEvent
      ? new Date(Number(editEvent.time)).toISOString().split("T")[0]
      : "",
  );
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!editEvent;
  const isPending = createEvent.isPending || updateEvent.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!location.trim()) {
      setError("Location is required.");
      return;
    }
    if (!dateStr) {
      setError("Date is required.");
      return;
    }

    const owner = identity?.getPrincipal().toString() ?? "";
    const time = new Date(dateStr).getTime();

    try {
      if (isEditing && editEvent) {
        await updateEvent.mutateAsync({
          ...editEvent,
          description: description.trim(),
          location: location.trim(),
          time,
        });
      } else {
        const id = `event_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        await createEvent.mutateAsync({
          id,
          creatorProfileId: profileId,
          description: description.trim(),
          location: location.trim(),
          time,
          image: [],
          needs: [],
          owner,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to save event.");
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Event" : "Create Event"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the event..."
              rows={3}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. 123 Rue Saint-Denis, Montréal"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              disabled={isPending}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded p-2">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Saving…" : "Creating…"}
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Event"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
