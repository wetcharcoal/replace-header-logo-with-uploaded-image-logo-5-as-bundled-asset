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
import { Calendar, Trash2 } from "lucide-react";
import React from "react";
import type { ResourceCategory } from "../hooks/useQueries";

function categoryLabel(category: ResourceCategory): string {
  switch (category) {
    case "foodDrink":
      return "Food & Drink";
    case "storageSpace":
      return "Storage Space";
    case "kitchenSpace":
      return "Kitchen Space";
    case "distributionSpace":
      return "Distribution Space";
    case "equipment":
      return "Equipment";
    case "publicity":
      return "Publicity";
    case "other":
      return "Other";
    default:
      return "Unknown";
  }
}

function formatDate(ms: number): string {
  if (!ms) return "";
  return new Date(ms).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface NeedResourceCardProps {
  type: "need" | "resource";
  id: string;
  category: ResourceCategory;
  description: string;
  startDate?: number;
  endDate?: number;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export default function NeedResourceCard({
  type,
  id,
  category,
  description,
  startDate,
  endDate,
  canDelete = false,
  onDelete,
  isDeleting = false,
}: NeedResourceCardProps) {
  const isNeed = type === "need";

  return (
    <div
      className={`relative rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md ${
        isNeed ? "border-l-4 border-l-primary" : "border-l-4 border-l-secondary"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Badge
            variant={isNeed ? "destructive" : "default"}
            className="shrink-0 text-xs font-semibold uppercase tracking-wide"
          >
            {isNeed ? "Need" : "Resource"}
          </Badge>
          <Badge variant="outline" className="shrink-0 text-xs">
            {categoryLabel(category)}
          </Badge>
        </div>
        {canDelete && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete {isNeed ? "Need" : "Resource"}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this{" "}
                  {isNeed ? "need" : "resource"}. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <p className="mt-2 text-sm text-foreground leading-relaxed">
        {description}
      </p>

      {isNeed &&
        startDate !== undefined &&
        endDate !== undefined &&
        startDate > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>
              {formatDate(startDate)} – {formatDate(endDate)}
            </span>
          </div>
        )}
    </div>
  );
}
