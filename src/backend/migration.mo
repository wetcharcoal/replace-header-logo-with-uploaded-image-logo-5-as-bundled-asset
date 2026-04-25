import BaseToCore "BaseToCore";
import ListBase "mo:base/List";
import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  // ─── Old Map internal representation (mo:core v1 / old B-tree format) ────
  // These match the binary format in backend.most (Tree-based, immutable)

  type OldTree<K, V> = {
    #black : (OldTree<K, V>, K, V, OldTree<K, V>);
    #leaf;
    #red : (OldTree<K, V>, K, V, OldTree<K, V>);
  };

  type OldMap<K, V> = { root : OldTree<K, V>; size : Nat };

  // In-order traversal of an OldMap
  func entries<K, V>(m : OldMap<K, V>) : [(K, V)] {
    let result = List.empty<(K, V)>();
    func traverse(t : OldTree<K, V>) {
      switch t {
        case (#leaf) {};
        case (#red(l, k, v, r)) { traverse(l); result.add((k, v)); traverse(r) };
        case (#black(l, k, v, r)) { traverse(l); result.add((k, v)); traverse(r) };
      };
    };
    traverse(m.root);
    result.toArray();
  };

  // ─── types duplicated from main.mo (cannot import main.mo) ───────────────

  type UserRole = { #admin; #user; #guest };

  type ApprovalStatus = { #approved; #rejected; #pending };

  type FunctionType = {
    #production;
    #processing;
    #distribution;
    #wasteManagement;
    #education;
    #equipmentSpace;
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

  type UserProfile = { profileId : Text };

  type ProfileRole = { #clubAdmin; #user };

  type ProfileMember = {
    principal : Principal;
    role : ProfileRole;
    displayName : ?Text;
  };

  type JoinRequestStatus = { #pending; #approved; #denied };

  type JoinRequest = {
    principal : Principal;
    profileId : Text;
    status : JoinRequestStatus;
    displayName : ?Text;
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

  type SuspiciousActivityType = {
    #rapidAccountCreation;
    #repeatedFailedRegistration;
    #unusualPattern;
  };

  type SuspiciousActivityFlag = {
    principal : Principal;
    activityType : SuspiciousActivityType;
    timestamp : Int;
    details : Text;
  };

  // Old Map type (mo:core Map with old binary format — must be iterated and rebuilt)

  // Old registry type (from caffeineai-object-storage old format — must be explicitly discarded)
  type FileReference = { path : Text; hash : Text };

  type OldRegistry = {
    var authorizedPrincipals : [Principal];
    var blobsToRemove : OldMap<Text, Bool>;
    var references : OldMap<Text, FileReference>;
  };

  // Old approvalState type (uses old-format Map)
  type OldApprovalState = {
    var approvalStatus : OldMap<Principal, ApprovalStatus>;
  };

  // ─── OldActor: matches the current stable snapshot ───────────────────────

  type OldActor = {
    accessControlState : {
      var adminAssigned : Bool;
      var userRoles : OldMap<Principal, UserRole>;
    };
    var approvalState : OldApprovalState;
    registry : OldRegistry;
    var profiles : OldMap<Text, Profile>;
    var needs : OldMap<Text, Need>;
    var resources : OldMap<Text, ResourceHave>;
    var categoryMatches : OldMap<Text, CategoryMatch>;
    var events : OldMap<Text, Event>;
    var userProfiles : OldMap<Principal, UserProfile>;
    var displayNames : OldMap<Principal, Text>;
    var profileMembers : OldMap<Text, OldMap<Principal, ProfileMember>>;
    var joinRequests : OldMap<Text, ListBase.List<JoinRequest>>;
    var registrationAttempts : OldMap<Principal, ListBase.List<Int>>;
    var suspendedUsers : OldMap<Principal, SuspensionInfo>;
    var profileCreationLog : ListBase.List<ProfileCreationEntry>;
    var suspiciousActivityFlags : ListBase.List<SuspiciousActivityFlag>;
    var historicalWhitelist : OldMap<Principal, WhitelistEntry>;
  };

  // ─── NewActor: matches the new stable snapshot ───────────────────────────

  type NewActor = {
    accessControlState : BaseToCore.NewAccessControlState;
    var approvalState : {
      var approvalStatus : Map.Map<Principal, ApprovalStatus>;
    };
    var profiles : Map.Map<Text, Profile>;
    var needs : Map.Map<Text, Need>;
    var resources : Map.Map<Text, ResourceHave>;
    var categoryMatches : Map.Map<Text, CategoryMatch>;
    var events : Map.Map<Text, Event>;
    var userProfiles : Map.Map<Principal, UserProfile>;
    var displayNames : Map.Map<Principal, Text>;
    var profileMembers : Map.Map<Text, Map.Map<Principal, ProfileMember>>;
    var joinRequests : Map.Map<Text, List.List<JoinRequest>>;
    var registrationAttempts : Map.Map<Principal, List.List<Int>>;
    var suspendedUsers : Map.Map<Principal, SuspensionInfo>;
    var profileCreationLog : List.List<ProfileCreationEntry>;
    var suspiciousActivityFlags : List.List<SuspiciousActivityFlag>;
    var historicalWhitelist : Map.Map<Principal, WhitelistEntry>;
  };

  // ─── Rebuild helpers (OldMap → mo:core Map/List) ─────────────────────────

  func rebuildMap<K, V>(old : OldMap<K, V>, compare : (implicit : (K, K) -> Order.Order)) : Map.Map<K, V> {
    let new = Map.empty<K, V>();
    for ((k, v) in entries<K, V>(old).values()) {
      new.add(k, v);
    };
    new;
  };

  func rebuildMapOfMaps<K1, K2, V>(old : OldMap<K1, OldMap<K2, V>>, compare1 : (implicit : (K1, K1) -> Order.Order), compare2 : (implicit : (K2, K2) -> Order.Order)) : Map.Map<K1, Map.Map<K2, V>> {
    let outer = Map.empty<K1, Map.Map<K2, V>>();
    for ((k1, innerOld) in entries<K1, OldMap<K2, V>>(old).values()) {
      outer.add(compare1, k1, rebuildMap<K2, V>(innerOld, compare2));
    };
    outer;
  };

  func rebuildMapOfLists<K, V>(old : OldMap<K, ListBase.List<V>>, compare : (implicit : (K, K) -> Order.Order)) : Map.Map<K, List.List<V>> {
    let outer = Map.empty<K, List.List<V>>();
    for ((k, listOld) in entries<K, ListBase.List<V>>(old).values()) {
      outer.add(k, BaseToCore.migrateList<V>(listOld));
    };
    outer;
  };

  // ─── Migration function ───────────────────────────────────────────────────

  public func run(old : OldActor) : NewActor {
    let newProfileMembers = rebuildMapOfMaps<Text, Principal, ProfileMember>(old.profileMembers, Text.compare, Principal.compare);
    let newJoinRequests = rebuildMapOfLists<Text, JoinRequest>(old.joinRequests, );
    let newRegistrationAttempts = rebuildMapOfLists(old.registrationAttempts, );

    // Rebuild accessControlState from old OldMap format
    let newUserRoles = rebuildMap<Principal, UserRole>(old.accessControlState.userRoles, );
    let newAccessControlState = {
      var adminAssigned = old.accessControlState.adminAssigned;
      userRoles = newUserRoles;
    };

    // Rebuild approvalStatus from old OldMap format
    let newApprovalStatus = rebuildMap<Principal, ApprovalStatus>(old.approvalState.approvalStatus, );

    {
      accessControlState = newAccessControlState;
      var approvalState = {
        var approvalStatus = newApprovalStatus;
      };
      var profiles = rebuildMap<Text, Profile>(old.profiles, );
      var needs = rebuildMap<Text, Need>(old.needs, );
      var resources = rebuildMap<Text, ResourceHave>(old.resources, );
      var categoryMatches = rebuildMap<Text, CategoryMatch>(old.categoryMatches, );
      var events = rebuildMap<Text, Event>(old.events, );
      var userProfiles = rebuildMap<Principal, UserProfile>(old.userProfiles, );
      var displayNames = rebuildMap<Principal, Text>(old.displayNames, );
      var profileMembers = newProfileMembers;
      var joinRequests = newJoinRequests;
      var registrationAttempts = newRegistrationAttempts;
      var suspendedUsers = rebuildMap<Principal, SuspensionInfo>(old.suspendedUsers, );
      var profileCreationLog = BaseToCore.migrateList(old.profileCreationLog);
      var suspiciousActivityFlags = BaseToCore.migrateList(old.suspiciousActivityFlags);
      var historicalWhitelist = rebuildMap<Principal, WhitelistEntry>(old.historicalWhitelist, );
    };
  };
};
