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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { type ResourceCategory, useCreateNeed } from "../hooks/useQueries";

const CATEGORIES: ResourceCategory[] = [
  "foodDrink",
  "storageSpace",
  "kitchenSpace",
  "distributionSpace",
  "equipment",
  "publicity",
  "other",
];

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  foodDrink: "Food & Drink",
  storageSpace: "Storage Space",
  kitchenSpace: "Kitchen Space",
  distributionSpace: "Distribution Space",
  equipment: "Equipment",
  publicity: "Publicity",
  other: "Other",
};

interface NeedFormProps {
  profileId: string;
  onClose: () => void;
}

export default function NeedForm({ profileId, onClose }: NeedFormProps) {
  const { identity } = useInternetIdentity();
  const createNeed = useCreateNeed();

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ResourceCategory>("other");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    const owner = identity?.getPrincipal().toString() ?? "";
    const id = `need_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    try {
      await createNeed.mutateAsync({
        id,
        profileId,
        description: description.trim(),
        category,
        startDate: startDate ? new Date(startDate).getTime() : 0,
        endDate: endDate ? new Date(endDate).getTime() : 0,
        owner,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create need.");
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
          <DialogTitle>Add Need</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you need..."
              rows={3}
              disabled={createNeed.isPending}
            />
          </div>

          <div className="space-y-1">
            <Label>Category *</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as ResourceCategory)}
              disabled={createNeed.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={createNeed.isPending}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={createNeed.isPending}
              />
            </div>
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
              disabled={createNeed.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createNeed.isPending}>
              {createNeed.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Add Need"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
