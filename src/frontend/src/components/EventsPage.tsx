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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Calendar, Edit, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import {
  type Event,
  useDeleteEvent,
  useGetAllEvents,
  useGetCallerUserProfile,
  useIsCallerAdmin,
} from "../hooks/useQueries";
import EventForm from "./EventForm";

export default function EventsPage() {
  const { data: events = [], isLoading } = useGetAllEvents();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const { identity } = useInternetIdentity();
  const deleteEvent = useDeleteEvent();

  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);

  const callerPrincipal = identity?.getPrincipal().toString();

  const canDelete = (event: Event) =>
    isAdmin || event.owner === callerPrincipal;
  const canEdit = (event: Event) => isAdmin || event.owner === callerPrincipal;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Events</h1>
        {userProfile && (
          <Button
            onClick={() => {
              setEditEvent(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Create Event
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">No events yet.</p>
            {userProfile && (
              <Button
                className="mt-4"
                onClick={() => {
                  setEditEvent(null);
                  setShowForm(true);
                }}
              >
                Create the first event
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events
            .slice()
            .sort((a, b) => Number(b.time) - Number(a.time))
            .map((event) => (
              <Card key={event.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(Number(event.time)).toLocaleDateString(
                            "en-CA",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {canEdit(event) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditEvent(event);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete(event) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Event</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this event? This
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteEvent.mutate(event.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {showForm && (
        <EventForm
          profileId={userProfile?.profileId ?? ""}
          editEvent={editEvent}
          onClose={() => {
            setShowForm(false);
            setEditEvent(null);
          }}
        />
      )}
    </div>
  );
}
