import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import UserApproval "mo:caffeineai-user-approval/approval";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";

(with migration = Migration.run)
actor MontrealFoodSystem {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinObjectStorage();

  var approvalState : UserApproval.UserApprovalState = UserApproval.initState(accessControlState);

  var profiles = Map.empty<Text, Profile>();
  var needs = Map.empty<Text, Need>();
  var resources = Map.empty<Text, ResourceHave>();
  var categoryMatches = Map.empty<Text, CategoryMatch>();
  var events = Map.empty<Text, Event>();
  var userProfiles = Map.empty<Principal, UserProfile>();
  var displayNames = Map.empty<Principal, Text>();
  var profileMembers = Map.empty<Text, Map.Map<Principal, ProfileMember>>();
  var joinRequests = Map.empty<Text, List.List<JoinRequest>>();
  var registrationAttempts = Map.empty<Principal, List.List<Int>>();
  var suspendedUsers = Map.empty<Principal, SuspensionInfo>();
  var profileCreationLog = List.empty<ProfileCreationEntry>();
  var suspiciousActivityFlags = List.empty<SuspiciousActivityFlag>();
  var historicalWhitelist = Map.empty<Principal, WhitelistEntry>();

  // ─── Type Definitions ─────────────────────────────────────────────────────

  type UserProfile = {
    profileId : Text;
  };

  type Profile = {
    id : Text;
    organizationName : Text;
    functions : [FunctionType];
    address : ?Text;
    phone : ?Text;
    email : Text;
    bio : ?Text;
    profilePicture : ?Text;
    needs : [Text];
    resources : [Text];
    owner : Principal;
  };

  type FunctionType = {
    #production;
    #processing;
    #distribution;
    #wasteManagement;
    #education;
    #equipmentSpace;
  };

  type Need = {
    id : Text;
    profileId : Text;
    description : Text;
    category : ResourceCategory;
    startDate : Int;
    endDate : Int;
    owner : Principal;
  };

  type ResourceHave = {
    id : Text;
    profileId : Text;
    description : Text;
    category : ResourceCategory;
    owner : Principal;
  };

  type ResourceCategory = {
    #foodDrink;
    #storageSpace;
    #kitchenSpace;
    #distributionSpace;
    #equipment;
    #publicity;
    #other;
  };

  type CategoryMatch = {
    category : ResourceCategory;
    needIds : [Text];
    resourceIds : [Text];
  };

  type Event = {
    id : Text;
    creatorProfileId : Text;
    location : Text;
    description : Text;
    time : Int;
    image : ?Text;
    needs : [Text];
    owner : Principal;
  };

  type ProfileRole = {
    #clubAdmin;
    #user;
  };

  type ProfileMember = {
    principal : Principal;
    role : ProfileRole;
    displayName : ?Text;
  };

  type JoinRequest = {
    principal : Principal;
    profileId : Text;
    status : JoinRequestStatus;
    displayName : ?Text;
  };

  type JoinRequestStatus = {
    #pending;
    #approved;
    #denied;
  };

  type WhitelistEntry = {
    principal : Principal;
    timestamp : Int;
    reason : Text;
  };

  type SuspensionInfo = {
    suspendedAt : Int;
    reason : Text;
    suspendedBy : Principal;
  };

  type ProfileCreationEntry = {
    profileId : Text;
    creator : Principal;
    timestamp : Int;
    organizationName : Text;
  };

  type SuspiciousActivityFlag = {
    principal : Principal;
    activityType : SuspiciousActivityType;
    timestamp : Int;
    details : Text;
  };

  type SuspiciousActivityType = {
    #rapidAccountCreation;
    #repeatedFailedRegistration;
    #unusualPattern;
  };

  type DeletePermission = {
    #allowed;
    #notAllowed;
    #notFound;
    #notMember;
    #notClubAdmin;
    #notProfileAdmin;
    #notGeneralAdmin;
  };

  type RegistrationData = {
    id : Text;
    organizationName : Text;
    functions : [FunctionType];
    address : ?Text;
    phone : ?Text;
    email : Text;
    bio : ?Text;
    profilePicture : ?Text;
  };

  // ─── Internal helpers ─────────────────────────────────────────────────────

  let ADMIN_PRINCIPAL : Text = "u354h-2fjor-ncivd-f6nbm-buo6a-jvqbf-eoa3z-hjpkr-3g5oa-e7vzx-iqe";

  func isCallerAdminInternal(caller : Principal) : Bool {
    if (caller.toText() == ADMIN_PRINCIPAL) { return true };
    AccessControl.isAdmin(accessControlState, caller);
  };

  func getCallerUserRoleInternal(caller : Principal) : AccessControl.UserRole {
    if (caller.toText() == ADMIN_PRINCIPAL) { return #admin };
    AccessControl.getUserRole(accessControlState, caller);
  };

  func isClubAdmin(caller : Principal, profileId : Text) : Bool {
    switch (profileMembers.get(profileId)) {
      case (null) { false };
      case (?membersMap) {
        switch (membersMap.get(caller)) {
          case (null) { false };
          case (?member) {
            switch (member.role) {
              case (#clubAdmin) { true };
              case (#user) { false };
            };
          };
        };
      };
    };
  };

  func isProfileMember(caller : Principal, profileId : Text) : Bool {
    switch (profileMembers.get(profileId)) {
      case (null) { false };
      case (?membersMap) {
        switch (membersMap.get(caller)) {
          case (null) { false };
          case (?_member) { true };
        };
      };
    };
  };

  func isClubAdminOfItemOwner(caller : Principal, itemOwner : Principal) : Bool {
    for ((profileId, membersMap) in profileMembers.entries()) {
      let callerIsClubAdmin = switch (membersMap.get(caller)) {
        case (null) { false };
        case (?member) {
          switch (member.role) {
            case (#clubAdmin) { true };
            case (#user) { false };
          };
        };
      };
      if (callerIsClubAdmin) {
        let ownerIsMember = switch (membersMap.get(itemOwner)) {
          case (null) { false };
          case (?_) { true };
        };
        if (ownerIsMember) {
          return true;
        };
      };
    };
    false;
  };

  func checkNeedDeletePermission(caller : Principal, need : Need) : DeletePermission {
    if (isCallerAdminInternal(caller)) { return #allowed };
    if (Principal.equal(caller, need.owner)) { return #allowed };
    if (isClubAdminOfItemOwner(caller, need.owner)) { return #allowed };
    #notAllowed;
  };

  func checkResourceDeletePermission(caller : Principal, resource : ResourceHave) : DeletePermission {
    if (isCallerAdminInternal(caller)) { return #allowed };
    if (Principal.equal(caller, resource.owner)) { return #allowed };
    if (isClubAdminOfItemOwner(caller, resource.owner)) { return #allowed };
    #notAllowed;
  };

  func verifyNeedDeletePermission(caller : Principal, need : Need) {
    switch (checkNeedDeletePermission(caller, need)) {
      case (#allowed) {};
      case (_) {
        Runtime.trap("Unauthorized: You do not have permission to delete this need");
      };
    };
  };

  func verifyResourceDeletePermission(caller : Principal, resource : ResourceHave) {
    switch (checkResourceDeletePermission(caller, resource)) {
      case (#allowed) {};
      case (_) {
        Runtime.trap("Unauthorized: You do not have permission to delete this resource");
      };
    };
  };

  func isSuspended(caller : Principal) : Bool {
    switch (suspendedUsers.get(caller)) {
      case (null) { false };
      case (?_) { true };
    };
  };

  func requireNotSuspended(caller : Principal) {
    if (isSuspended(caller)) {
      Runtime.trap("Unauthorized: User account is suspended");
    };
  };

  // ─── Access Control (extended) ────────────────────────────────────────────

  // Keep legacy name for frontend compatibility (MixinAuthorization uses _initializeAccessControl)
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  // Override getCallerUserRole to honour hardcoded admin principal
  // Note: MixinAuthorization already provides getCallerUserRole, so we shadow it
  // public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
  //   getCallerUserRoleInternal(caller);
  // };

  // ─── User Profile ─────────────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isCallerAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    requireNotSuspended(caller);
    userProfiles.add(caller, profile);
  };

  // ─── Display Names ────────────────────────────────────────────────────────

  public query ({ caller }) func getDisplayName() : async ?Text {
    displayNames.get(caller);
  };

  public shared ({ caller }) func setDisplayName(name : Text) : async () {
    requireNotSuspended(caller);
    displayNames.add(caller, name);
  };

  // ─── Approval ─────────────────────────────────────────────────────────────

  public query ({ caller }) func isCallerApproved() : async Bool {
    if (isCallerAdminInternal(caller)) { return true };
    UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // ─── Profile Registration ─────────────────────────────────────────────────

  public shared ({ caller }) func registerProfile(registrationData : RegistrationData) : async Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register profiles");
    };
    requireNotSuspended(caller);
    let profile : Profile = {
      id = registrationData.id;
      organizationName = registrationData.organizationName;
      functions = registrationData.functions;
      address = registrationData.address;
      phone = registrationData.phone;
      email = registrationData.email;
      bio = registrationData.bio;
      profilePicture = registrationData.profilePicture;
      needs = [];
      resources = [];
      owner = caller;
    };
    profiles.add(profile.id, profile);
    profile;
  };

  public query func listProfiles() : async [Profile] {
    profiles.values().toArray();
  };

  public query func getProfile(id : Text) : async ?Profile {
    profiles.get(id);
  };

  public shared ({ caller }) func updateProfile(id : Text, data : RegistrationData) : async Profile {
    requireNotSuspended(caller);
    let existing = switch (profiles.get(id)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?p) { p };
    };
    if (not isCallerAdminInternal(caller) and not isClubAdmin(caller, id)) {
      Runtime.trap("Unauthorized: Only club admins can update profiles");
    };
    let updated : Profile = {
      existing with
      organizationName = data.organizationName;
      functions = data.functions;
      address = data.address;
      phone = data.phone;
      email = data.email;
      bio = data.bio;
      profilePicture = data.profilePicture;
    };
    profiles.add(id, updated);
    updated;
  };

  public shared ({ caller }) func deleteProfile(id : Text) : async () {
    if (not isCallerAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete profiles");
    };
    profiles.remove(id);
    profileMembers.remove(id);
    joinRequests.remove(id);
  };

  // ─── Needs ────────────────────────────────────────────────────────────────

  type NeedInput = {
    id : Text;
    profileId : Text;
    description : Text;
    category : ResourceCategory;
    startDate : Int;
    endDate : Int;
  };

  public shared ({ caller }) func addNeed(input : NeedInput) : async Need {
    requireNotSuspended(caller);
    if (not isProfileMember(caller, input.profileId) and not isCallerAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Must be a member of the profile to add needs");
    };
    let need : Need = {
      id = input.id;
      profileId = input.profileId;
      description = input.description;
      category = input.category;
      startDate = input.startDate;
      endDate = input.endDate;
      owner = caller;
    };
    needs.add(need.id, need);
    switch (profiles.get(input.profileId)) {
      case (null) {};
      case (?profile) {
        let updated = { profile with needs = profile.needs.concat([need.id]) };
        profiles.add(input.profileId, updated);
      };
    };
    need;
  };

  public query func listNeeds() : async [Need] {
    needs.values().toArray();
  };

  public shared ({ caller }) func deleteNeed(id : Text) : async () {
    requireNotSuspended(caller);
    switch (needs.get(id)) {
      case (null) { Runtime.trap("Need not found") };
      case (?need) {
        verifyNeedDeletePermission(caller, need);
        needs.remove(id);
        switch (profiles.get(need.profileId)) {
          case (null) {};
          case (?profile) {
            let updatedNeeds = profile.needs.filter(func(needId) { needId != id });
            profiles.add(need.profileId, { profile with needs = updatedNeeds });
          };
        };
      };
    };
  };

  // ─── Resources ────────────────────────────────────────────────────────────

  type ResourceInput = {
    id : Text;
    profileId : Text;
    description : Text;
    category : ResourceCategory;
  };

  public shared ({ caller }) func addResource(input : ResourceInput) : async ResourceHave {
    requireNotSuspended(caller);
    if (not isProfileMember(caller, input.profileId) and not isCallerAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Must be a member of the profile to add resources");
    };
    let resource : ResourceHave = {
      id = input.id;
      profileId = input.profileId;
      description = input.description;
      category = input.category;
      owner = caller;
    };
    resources.add(resource.id, resource);
    switch (profiles.get(input.profileId)) {
      case (null) {};
      case (?profile) {
        let updated = { profile with resources = profile.resources.concat([resource.id]) };
        profiles.add(input.profileId, updated);
      };
    };
    resource;
  };

  public query func listResources() : async [ResourceHave] {
    resources.values().toArray();
  };

  public shared ({ caller }) func deleteResource(id : Text) : async () {
    requireNotSuspended(caller);
    switch (resources.get(id)) {
      case (null) { Runtime.trap("Resource not found") };
      case (?resource) {
        verifyResourceDeletePermission(caller, resource);
        resources.remove(id);
        switch (profiles.get(resource.profileId)) {
          case (null) {};
          case (?profile) {
            let updatedResources = profile.resources.filter(func(resourceId) { resourceId != id });
            profiles.add(resource.profileId, { profile with resources = updatedResources });
          };
        };
      };
    };
  };

  // ─── Events ───────────────────────────────────────────────────────────────

  type EventInput = {
    id : Text;
    creatorProfileId : Text;
    location : Text;
    description : Text;
    time : Int;
    image : ?Text;
    needs : [Text];
  };

  public shared ({ caller }) func addEvent(input : EventInput) : async Event {
    requireNotSuspended(caller);
    let event : Event = {
      id = input.id;
      creatorProfileId = input.creatorProfileId;
      location = input.location;
      description = input.description;
      time = input.time;
      image = input.image;
      needs = input.needs;
      owner = caller;
    };
    events.add(event.id, event);
    event;
  };

  public query func listEvents() : async [Event] {
    events.values().toArray();
  };

  public shared ({ caller }) func deleteEvent(id : Text) : async () {
    switch (events.get(id)) {
      case (null) { Runtime.trap("Event not found") };
      case (?event) {
        if (not isCallerAdminInternal(caller) and not Principal.equal(caller, event.owner)) {
          Runtime.trap("Unauthorized: Cannot delete this event");
        };
        events.remove(id);
      };
    };
  };

  // ─── Members & Join Requests ──────────────────────────────────────────────

  public shared ({ caller }) func addMember(profileId : Text, memberPrincipal : Principal, role : ProfileRole) : async () {
    requireNotSuspended(caller);
    if (not isCallerAdminInternal(caller) and not isClubAdmin(caller, profileId)) {
      Runtime.trap("Unauthorized: Only club admins can add members");
    };
    let membersMap = switch (profileMembers.get(profileId)) {
      case (null) { Map.empty<Principal, ProfileMember>() };
      case (?m) { m };
    };
    let member : ProfileMember = {
      principal = memberPrincipal;
      role = role;
      displayName = displayNames.get(memberPrincipal);
    };
    membersMap.add(memberPrincipal, member);
    profileMembers.add(profileId, membersMap);
  };

  public shared ({ caller }) func removeMember(profileId : Text, memberPrincipal : Principal) : async () {
    requireNotSuspended(caller);
    if (not isCallerAdminInternal(caller) and not isClubAdmin(caller, profileId)) {
      Runtime.trap("Unauthorized: Only club admins can remove members");
    };
    switch (profileMembers.get(profileId)) {
      case (null) {};
      case (?membersMap) {
        membersMap.remove(memberPrincipal);
        profileMembers.add(profileId, membersMap);
      };
    };
  };

  public query func listMembers(profileId : Text) : async [ProfileMember] {
    switch (profileMembers.get(profileId)) {
      case (null) { [] };
      case (?membersMap) { membersMap.values().toArray() };
    };
  };

  public shared ({ caller }) func requestJoin(profileId : Text, displayName : ?Text) : async () {
    requireNotSuspended(caller);
    let request : JoinRequest = {
      principal = caller;
      profileId = profileId;
      status = #pending;
      displayName = displayName;
    };
    let existing = switch (joinRequests.get(profileId)) {
      case (null) { List.empty<JoinRequest>() };
      case (?l) { l };
    };
    existing.add(request);
    joinRequests.add(profileId, existing);
  };

  public query ({ caller }) func listJoinRequests(profileId : Text) : async [JoinRequest] {
    if (not isCallerAdminInternal(caller) and not isClubAdmin(caller, profileId)) {
      Runtime.trap("Unauthorized: Only club admins can view join requests");
    };
    switch (joinRequests.get(profileId)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func approveJoinRequest(profileId : Text, requestorPrincipal : Principal, approved : Bool) : async () {
    requireNotSuspended(caller);
    if (not isCallerAdminInternal(caller) and not isClubAdmin(caller, profileId)) {
      Runtime.trap("Unauthorized: Only club admins can approve join requests");
    };
    switch (joinRequests.get(profileId)) {
      case (null) { Runtime.trap("No join requests for this profile") };
      case (?list) {
        let newStatus : JoinRequestStatus = if (approved) { #approved } else { #denied };
        list.mapInPlace(func(req) {
          if (Principal.equal(req.principal, requestorPrincipal)) {
            { req with status = newStatus }
          } else { req };
        });
        joinRequests.add(profileId, list);
        if (approved) {
          let membersMap = switch (profileMembers.get(profileId)) {
            case (null) { Map.empty<Principal, ProfileMember>() };
            case (?m) { m };
          };
          let member : ProfileMember = {
            principal = requestorPrincipal;
            role = #user;
            displayName = displayNames.get(requestorPrincipal);
          };
          membersMap.add(requestorPrincipal, member);
          profileMembers.add(profileId, membersMap);
        };
      };
    };
  };

  // ─── User Suspension ──────────────────────────────────────────────────────

  public shared ({ caller }) func suspendUser(user : Principal, reason : Text) : async () {
    if (not isCallerAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can suspend users");
    };
    if (user.toText() == ADMIN_PRINCIPAL) {
      Runtime.trap("Cannot suspend the general admin");
    };
    let info : SuspensionInfo = {
      suspendedAt = 0;
      reason = reason;
      suspendedBy = caller;
    };
    suspendedUsers.add(user, info);
    historicalWhitelist.add(user, {
      principal = user;
      timestamp = 0;
      reason = reason;
    });
  };

  public shared ({ caller }) func unsuspendUser(user : Principal) : async () {
    if (not isCallerAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can unsuspend users");
    };
    suspendedUsers.remove(user);
  };

  public query ({ caller }) func listSuspendedUsers() : async [SuspensionInfo] {
    if (not isCallerAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can view suspended users");
    };
    suspendedUsers.values().toArray();
  };

  public query ({ caller }) func getSuspensionInfo(user : Principal) : async ?SuspensionInfo {
    if (not isCallerAdminInternal(caller) and caller != user) {
      Runtime.trap("Unauthorized");
    };
    suspendedUsers.get(user);
  };

  public query ({ caller }) func isSuspendedUser(user : Principal) : async Bool {
    isSuspended(user);
  };

  // ─── Historical Whitelist ─────────────────────────────────────────────────

  public query ({ caller }) func listHistoricalWhitelist() : async [WhitelistEntry] {
    if (not isCallerAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can view whitelist");
    };
    historicalWhitelist.values().toArray();
  };

  // ─── Admin: delete user ───────────────────────────────────────────────────

  public shared ({ caller }) func deleteUser(user : Principal) : async () {
    if (not isCallerAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete users");
    };
    userProfiles.remove(user);
    displayNames.remove(user);
    suspendedUsers.remove(user);
    // Remove from all profile member maps
    for ((profileId, membersMap) in profileMembers.entries()) {
      membersMap.remove(user);
    };
  };

  // ─── Matches (category-based) ─────────────────────────────────────────────

  public query func getMatches(profileId : Text) : async [(Need, [ResourceHave])] {
    let profileNeeds = switch (profiles.get(profileId)) {
      case (null) { return [] };
      case (?p) { p.needs };
    };
    var result = List.empty<(Need, [ResourceHave])>();
    for (needId in profileNeeds.values()) {
      switch (needs.get(needId)) {
        case (null) {};
        case (?need) {
          let matchingResources = resources.values().toArray().filter(
            func(r : ResourceHave) : Bool = r.category == need.category and r.profileId != profileId
          );
          result.add((need, matchingResources));
        };
      };
    };
    result.toArray();
  };

  public query func getGlobalMatches() : async [(Need, [ResourceHave])] {
    var result = List.empty<(Need, [ResourceHave])>();
    for ((_, need) in needs.entries()) {
      let matchingResources = resources.values().toArray().filter(
        func(r : ResourceHave) : Bool = r.category == need.category and r.profileId != need.profileId
      );
      if (matchingResources.size() > 0) {
        result.add((need, matchingResources));
      };
    };
    result.toArray();
  };
};
