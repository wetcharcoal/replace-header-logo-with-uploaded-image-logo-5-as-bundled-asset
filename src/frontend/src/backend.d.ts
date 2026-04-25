import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ResourceInput {
    id: string;
    profileId: string;
    description: string;
    category: ResourceCategory;
}
export interface JoinRequest {
    status: JoinRequestStatus;
    principal: Principal;
    displayName?: string;
    profileId: string;
}
export interface WhitelistEntry {
    principal: Principal;
    timestamp: bigint;
    reason: string;
}
export interface Need {
    id: string;
    endDate: bigint;
    owner: Principal;
    profileId: string;
    description: string;
    category: ResourceCategory;
    startDate: bigint;
}
export interface Event {
    id: string;
    owner: Principal;
    time: bigint;
    description: string;
    needs: Array<string>;
    image?: string;
    creatorProfileId: string;
    location: string;
}
export interface SuspensionInfo {
    suspendedAt: bigint;
    suspendedBy: Principal;
    reason: string;
}
export interface Profile {
    id: string;
    bio?: string;
    organizationName: string;
    owner: Principal;
    resources: Array<string>;
    email: string;
    needs: Array<string>;
    address?: string;
    functions: Array<FunctionType>;
    phone?: string;
    profilePicture?: string;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface ResourceHave {
    id: string;
    owner: Principal;
    profileId: string;
    description: string;
    category: ResourceCategory;
}
export interface EventInput {
    id: string;
    time: bigint;
    description: string;
    needs: Array<string>;
    image?: string;
    creatorProfileId: string;
    location: string;
}
export interface RegistrationData {
    id: string;
    bio?: string;
    organizationName: string;
    email: string;
    address?: string;
    functions: Array<FunctionType>;
    phone?: string;
    profilePicture?: string;
}
export interface ProfileMember {
    principal: Principal;
    displayName?: string;
    role: ProfileRole;
}
export interface NeedInput {
    id: string;
    endDate: bigint;
    profileId: string;
    description: string;
    category: ResourceCategory;
    startDate: bigint;
}
export interface UserProfile {
    profileId: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum FunctionType {
    production = "production",
    education = "education",
    equipmentSpace = "equipmentSpace",
    wasteManagement = "wasteManagement",
    processing = "processing",
    distribution = "distribution"
}
export enum JoinRequestStatus {
    pending = "pending",
    denied = "denied",
    approved = "approved"
}
export enum ProfileRole {
    user = "user",
    clubAdmin = "clubAdmin"
}
export enum ResourceCategory {
    storageSpace = "storageSpace",
    other = "other",
    equipment = "equipment",
    publicity = "publicity",
    foodDrink = "foodDrink",
    distributionSpace = "distributionSpace",
    kitchenSpace = "kitchenSpace"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEvent(input: EventInput): Promise<Event>;
    addMember(profileId: string, memberPrincipal: Principal, role: ProfileRole): Promise<void>;
    addNeed(input: NeedInput): Promise<Need>;
    addResource(input: ResourceInput): Promise<ResourceHave>;
    approveJoinRequest(profileId: string, requestorPrincipal: Principal, approved: boolean): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteEvent(id: string): Promise<void>;
    deleteNeed(id: string): Promise<void>;
    deleteProfile(id: string): Promise<void>;
    deleteResource(id: string): Promise<void>;
    deleteUser(user: Principal): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDisplayName(): Promise<string | null>;
    getGlobalMatches(): Promise<Array<[Need, Array<ResourceHave>]>>;
    getMatches(profileId: string): Promise<Array<[Need, Array<ResourceHave>]>>;
    getProfile(id: string): Promise<Profile | null>;
    getSuspensionInfo(user: Principal): Promise<SuspensionInfo | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    isSuspendedUser(user: Principal): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    listEvents(): Promise<Array<Event>>;
    listHistoricalWhitelist(): Promise<Array<WhitelistEntry>>;
    listJoinRequests(profileId: string): Promise<Array<JoinRequest>>;
    listMembers(profileId: string): Promise<Array<ProfileMember>>;
    listNeeds(): Promise<Array<Need>>;
    listProfiles(): Promise<Array<Profile>>;
    listResources(): Promise<Array<ResourceHave>>;
    listSuspendedUsers(): Promise<Array<SuspensionInfo>>;
    registerProfile(registrationData: RegistrationData): Promise<Profile>;
    removeMember(profileId: string, memberPrincipal: Principal): Promise<void>;
    requestApproval(): Promise<void>;
    requestJoin(profileId: string, displayName: string | null): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setDisplayName(name: string): Promise<void>;
    suspendUser(user: Principal, reason: string): Promise<void>;
    unsuspendUser(user: Principal): Promise<void>;
    updateProfile(id: string, data: RegistrationData): Promise<Profile>;
}
