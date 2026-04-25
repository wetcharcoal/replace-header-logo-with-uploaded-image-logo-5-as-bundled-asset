import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApprovalStatus,
  FunctionType,
  Profile,
  RegistrationData,
  UserProfile,
} from "../backend";
import { UserRole } from "../backend";
import { useBackendActor } from "./useBackendActor";

// ─── Re-export backend types so components can import from one place ───────────
export type { FunctionType, Profile, RegistrationData, UserProfile };
export type { FunctionType as FunctionTypeValues };

// ─── Local types (not in backend) ─────────────────────────────────────────────

export type ResourceCategory =
  | "foodDrink"
  | "storageSpace"
  | "kitchenSpace"
  | "distributionSpace"
  | "equipment"
  | "publicity"
  | "other";

export type ProfileRole = "clubAdmin" | "user";

export type JoinRequestStatus = "pending" | "approved" | "denied";

export interface Need {
  id: string;
  profileId: string;
  description: string;
  category: ResourceCategory;
  startDate: number;
  endDate: number;
  owner: string;
}

export interface ResourceHave {
  id: string;
  profileId: string;
  description: string;
  category: ResourceCategory;
  owner: string;
}

export interface Event {
  id: string;
  creatorProfileId: string;
  location: string;
  description: string;
  time: number;
  image: [] | [string];
  needs: string[];
  owner: string;
}

export interface ProfileMember {
  principal: Principal;
  role: ProfileRole;
  displayName: [] | [string];
}

export interface JoinRequest {
  principal: Principal;
  profileId: string;
  status: JoinRequestStatus;
  displayName: [] | [string];
}

export interface SuspiciousActivityFlag {
  id: string;
  principal: string;
  activityType: string;
  timestamp: number;
  details: string;
}

export interface ProfileCreationEntry {
  profileId: string;
  creator: string;
  timestamp: number;
  organizationName: string;
}

// ─── Local storage helpers ─────────────────────────────────────────────────────

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function lsSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// ─── Access Control (backend-backed) ──────────────────────────────────────────

export function useGetCallerUserRole() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<UserRole>({
    queryKey: ["callerUserRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInitializeAccessControl() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.initializeAccessControl();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["callerUserRole"] });
    },
  });
}

export function useAssignUserRole() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { user: Principal; role: UserRole }>({
    mutationFn: async ({ user, role }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerUserRole"] });
    },
  });
}

// ─── Approval (backend-backed) ────────────────────────────────────────────────

export function useIsCallerApproved() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<boolean>({
    queryKey: ["isCallerApproved"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestApproval() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isCallerApproved"] });
    },
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["approvals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetApproval() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { user: Principal; status: ApprovalStatus }>({
    mutationFn: async ({ user, status }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    },
  });
}

// ─── User Profile (backend-backed) ────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useBackendActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, UserProfile>({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── Display name (local storage) ─────────────────────────────────────────────

export function useGetDisplayName(principal?: string) {
  return useQuery<string | null>({
    queryKey: ["displayName", principal],
    queryFn: async () => {
      if (!principal) return null;
      const map = lsGet<Record<string, string>>("mfs_displayNames", {});
      return map[principal] ?? null;
    },
    enabled: !!principal,
  });
}

// Alias for backward compat
export const useGetCallerDisplayName = useGetDisplayName;

export function useSetDisplayName() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { principal: string; name: string }>({
    mutationFn: async ({ principal, name }) => {
      const map = lsGet<Record<string, string>>("mfs_displayNames", {});
      map[principal] = name;
      lsSet("mfs_displayNames", map);
    },
    onSuccess: (_v, { principal }) => {
      queryClient.invalidateQueries({ queryKey: ["displayName", principal] });
    },
  });
}

// ─── Profiles (local storage + backend registerProfile) ───────────────────────

export function useGetAllProfiles() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: async () => lsGet<Profile[]>("mfs_profiles", []),
    enabled: !!actor && !isFetching,
  });
}

export function useGetProfile(profileId: string | null | undefined) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Profile | null>({
    queryKey: ["profile", profileId],
    queryFn: async () => {
      if (!profileId) return null;
      const profiles = lsGet<Profile[]>("mfs_profiles", []);
      return profiles.find((p) => p.id === profileId) ?? null;
    },
    enabled: !!actor && !isFetching && !!profileId,
  });
}

export function useRegisterProfile() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<Profile, Error, RegistrationData>({
    mutationFn: async (registrationData: RegistrationData) => {
      if (!actor) throw new Error("Actor not available");
      const profile = await actor.registerProfile(registrationData);
      // Cache locally
      const existing = lsGet<Profile[]>("mfs_profiles", []);
      const updated = [...existing.filter((p) => p.id !== profile.id), profile];
      lsSet("mfs_profiles", updated);
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export const useCreateProfile = useRegisterProfile;
export const useAdminCreateProfile = useRegisterProfile;

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation<Profile, Error, Partial<Profile> & { id: string }>({
    mutationFn: async (updates) => {
      const existing = lsGet<Profile[]>("mfs_profiles", []);
      const idx = existing.findIndex((p) => p.id === updates.id);
      if (idx === -1) throw new Error("Profile not found");
      const updated = { ...existing[idx], ...updates } as Profile;
      existing[idx] = updated;
      lsSet("mfs_profiles", existing);
      return updated;
    },
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
    },
  });
}

export function useUpdateGroupProfileFields() {
  return useUpdateProfile();
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (profileId: string) => {
      const existing = lsGet<Profile[]>("mfs_profiles", []);
      lsSet(
        "mfs_profiles",
        existing.filter((p) => p.id !== profileId),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

// ─── Needs (local storage) ─────────────────────────────────────────────────────

export function useGetAllNeeds() {
  return useQuery<Need[]>({
    queryKey: ["needs"],
    queryFn: async () => lsGet<Need[]>("mfs_needs", []),
  });
}

export function useGetNeedsByProfile(profileId: string | null | undefined) {
  return useQuery<Need[]>({
    queryKey: ["needs", "profile", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      return lsGet<Need[]>("mfs_needs", []).filter(
        (n) => n.profileId === profileId,
      );
    },
    enabled: !!profileId,
  });
}

export function useCreateNeed() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<Need, Error, Need>({
    mutationFn: async (need: Need) => {
      if (!actor) throw new Error("Actor not available");
      const all = lsGet<Need[]>("mfs_needs", []);
      all.push(need);
      lsSet("mfs_needs", all);
      const profiles = lsGet<Profile[]>("mfs_profiles", []);
      const idx = profiles.findIndex((p) => p.id === need.profileId);
      if (idx !== -1) {
        profiles[idx] = {
          ...profiles[idx],
          needs: [...profiles[idx].needs, need.id],
        };
        lsSet("mfs_profiles", profiles);
      }
      return need;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["needs"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

export function useDeleteNeed() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      try {
        await actor.deleteNeed(id);
      } catch {
        /* not in backend */
      }
      lsSet(
        "mfs_needs",
        lsGet<Need[]>("mfs_needs", []).filter((n) => n.id !== id),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["needs"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

// ─── Resources (local storage) ────────────────────────────────────────────────

export function useGetAllResources() {
  return useQuery<ResourceHave[]>({
    queryKey: ["resources"],
    queryFn: async () => lsGet<ResourceHave[]>("mfs_resources", []),
  });
}

export function useGetResourcesByProfile(profileId: string | null | undefined) {
  return useQuery<ResourceHave[]>({
    queryKey: ["resources", "profile", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      return lsGet<ResourceHave[]>("mfs_resources", []).filter(
        (r) => r.profileId === profileId,
      );
    },
    enabled: !!profileId,
  });
}

export function useCreateResource() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<ResourceHave, Error, ResourceHave>({
    mutationFn: async (resource: ResourceHave) => {
      if (!actor) throw new Error("Actor not available");
      const all = lsGet<ResourceHave[]>("mfs_resources", []);
      all.push(resource);
      lsSet("mfs_resources", all);
      const profiles = lsGet<Profile[]>("mfs_profiles", []);
      const idx = profiles.findIndex((p) => p.id === resource.profileId);
      if (idx !== -1) {
        profiles[idx] = {
          ...profiles[idx],
          resources: [...profiles[idx].resources, resource.id],
        };
        lsSet("mfs_profiles", profiles);
      }
      return resource;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

export function useDeleteResource() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      try {
        await actor.deleteResource(id);
      } catch {
        /* not in backend */
      }
      lsSet(
        "mfs_resources",
        lsGet<ResourceHave[]>("mfs_resources", []).filter((r) => r.id !== id),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

// ─── Events (local storage) ───────────────────────────────────────────────────

export function useGetAllEvents() {
  return useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: async () => lsGet<Event[]>("mfs_events", []),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation<Event, Error, Event>({
    mutationFn: async (event: Event) => {
      const all = lsGet<Event[]>("mfs_events", []);
      all.push(event);
      lsSet("mfs_events", all);
      return event;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation<Event, Error, Event>({
    mutationFn: async (event: Event) => {
      const all = lsGet<Event[]>("mfs_events", []);
      const idx = all.findIndex((e) => e.id === event.id);
      if (idx !== -1) all[idx] = event;
      else all.push(event);
      lsSet("mfs_events", all);
      return event;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      lsSet(
        "mfs_events",
        lsGet<Event[]>("mfs_events", []).filter((e) => e.id !== id),
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

// ─── Profile members (local storage) ──────────────────────────────────────────

export function useGetProfileMembers(profileId: string | null | undefined) {
  return useQuery<ProfileMember[]>({
    queryKey: ["profileMembers", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      return (
        lsGet<Record<string, ProfileMember[]>>("mfs_profileMembers", {})[
          profileId
        ] ?? []
      );
    },
    enabled: !!profileId,
  });
}

export function useAddProfileMember() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { profileId: string; member: ProfileMember }>(
    {
      mutationFn: async ({ profileId, member }) => {
        const map = lsGet<Record<string, ProfileMember[]>>(
          "mfs_profileMembers",
          {},
        );
        const members = map[profileId] ?? [];
        const idx = members.findIndex(
          (m) => m.principal.toString() === member.principal.toString(),
        );
        if (idx !== -1) members[idx] = member;
        else members.push(member);
        map[profileId] = members;
        lsSet("mfs_profileMembers", map);
      },
      onSuccess: (_v, { profileId }) =>
        queryClient.invalidateQueries({
          queryKey: ["profileMembers", profileId],
        }),
    },
  );
}

export function useAdminAssignProfileMember() {
  return useAddProfileMember();
}

export function useRemoveProfileMember() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { profileId: string; principal: string }>({
    mutationFn: async ({ profileId, principal }) => {
      const map = lsGet<Record<string, ProfileMember[]>>(
        "mfs_profileMembers",
        {},
      );
      map[profileId] = (map[profileId] ?? []).filter(
        (m) => m.principal.toString() !== principal,
      );
      lsSet("mfs_profileMembers", map);
    },
    onSuccess: (_v, { profileId }) =>
      queryClient.invalidateQueries({
        queryKey: ["profileMembers", profileId],
      }),
  });
}

export const useLeaveProfile = useRemoveProfileMember;

// ─── Join requests (local storage) ────────────────────────────────────────────

export function useGetJoinRequests(profileId: string | null | undefined) {
  return useQuery<JoinRequest[]>({
    queryKey: ["joinRequests", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      return (
        lsGet<Record<string, JoinRequest[]>>("mfs_joinRequests", {})[
          profileId
        ] ?? []
      );
    },
    enabled: !!profileId,
  });
}

export function useRequestJoinProfile() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, JoinRequest>({
    mutationFn: async (request: JoinRequest) => {
      const map = lsGet<Record<string, JoinRequest[]>>("mfs_joinRequests", {});
      const list = map[request.profileId] ?? [];
      const idx = list.findIndex(
        (r) => r.principal.toString() === request.principal.toString(),
      );
      if (idx !== -1) list[idx] = request;
      else list.push(request);
      map[request.profileId] = list;
      lsSet("mfs_joinRequests", map);
    },
    onSuccess: (_v, req) =>
      queryClient.invalidateQueries({
        queryKey: ["joinRequests", req.profileId],
      }),
  });
}

// Alias used by MemberJoinPage
export const useRequestJoin = useRequestJoinProfile;

export function useHandleJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { profileId: string; principal: string; status: JoinRequestStatus }
  >({
    mutationFn: async ({ profileId, principal, status }) => {
      const map = lsGet<Record<string, JoinRequest[]>>("mfs_joinRequests", {});
      const list = map[profileId] ?? [];
      const idx = list.findIndex((r) => r.principal.toString() === principal);
      if (idx !== -1) list[idx] = { ...list[idx], status };
      map[profileId] = list;
      lsSet("mfs_joinRequests", map);
    },
    onSuccess: (_v, { profileId }) =>
      queryClient.invalidateQueries({ queryKey: ["joinRequests", profileId] }),
  });
}

// ─── Admin: user management stubs ─────────────────────────────────────────────

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (principalStr: string) => {
      const profiles = lsGet<Profile[]>("mfs_profiles", []);
      lsSet(
        "mfs_profiles",
        profiles.filter((p) => p.owner.toString() !== principalStr),
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profiles"] }),
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { principal: string; reason: string }>({
    mutationFn: async ({ principal, reason }) => {
      const map = lsGet<
        Record<string, { reason: string; suspendedAt: number }>
      >("mfs_suspended", {});
      map[principal] = { reason, suspendedAt: Date.now() };
      lsSet("mfs_suspended", map);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["suspendedUsers"] }),
  });
}

export function useGetSuspiciousActivityFlags() {
  return useQuery<SuspiciousActivityFlag[]>({
    queryKey: ["suspiciousFlags"],
    queryFn: async () =>
      lsGet<SuspiciousActivityFlag[]>("mfs_suspiciousFlags", []),
  });
}

export function useClearFlag() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (flagId: string) => {
      lsSet(
        "mfs_suspiciousFlags",
        lsGet<SuspiciousActivityFlag[]>("mfs_suspiciousFlags", []).filter(
          (f) => f.id !== flagId,
        ),
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["suspiciousFlags"] }),
  });
}

export function useGetProfileCreationLog() {
  return useQuery<ProfileCreationEntry[]>({
    queryKey: ["profileCreationLog"],
    queryFn: async () =>
      lsGet<ProfileCreationEntry[]>("mfs_profileCreationLog", []),
  });
}

export function useGetHistoricalWhitelist() {
  return useQuery({
    queryKey: ["historicalWhitelist"],
    queryFn: async () =>
      lsGet<Array<{ principal: string; timestamp: number; reason: string }>>(
        "mfs_historicalWhitelist",
        [],
      ),
  });
}
