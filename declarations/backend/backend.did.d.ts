import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CategoryMatch {
  'resourceIds' : Array<string>,
  'needIds' : Array<string>,
  'category' : ResourceCategory,
}
export interface FileReference { 'hash' : string, 'path' : string }
export type FunctionType = { 'production' : null } |
  { 'education' : null } |
  { 'equipmentSpace' : null } |
  { 'wasteManagement' : null } |
  { 'processing' : null } |
  { 'distribution' : null };
export interface Need {
  'id' : string,
  'endDate' : bigint,
  'profileId' : string,
  'description' : string,
  'category' : ResourceCategory,
  'startDate' : bigint,
}
export interface Profile {
  'id' : string,
  'bio' : [] | [string],
  'organizationName' : string,
  'resources' : Array<string>,
  'email' : string,
  'needs' : Array<string>,
  'address' : string,
  'functions' : Array<FunctionType>,
  'phone' : string,
  'profilePicture' : [] | [string],
}
export type ResourceCategory = { 'storageSpace' : null } |
  { 'other' : null } |
  { 'equipment' : null } |
  { 'publicity' : null } |
  { 'foodDrink' : null } |
  { 'distributionSpace' : null } |
  { 'kitchenSpace' : null };
export interface ResourceHave {
  'id' : string,
  'profileId' : string,
  'description' : string,
  'category' : ResourceCategory,
}
export interface _SERVICE {
  'createNeed' : ActorMethod<
    [string, string, string, ResourceCategory, bigint, bigint],
    undefined
  >,
  'createResourceHave' : ActorMethod<
    [string, string, string, ResourceCategory],
    undefined
  >,
  'deleteNeed' : ActorMethod<[string, string], undefined>,
  'deleteResourceHave' : ActorMethod<[string, string], undefined>,
  'dropFileReference' : ActorMethod<[string], undefined>,
  'getAllNeeds' : ActorMethod<[], Array<Need>>,
  'getAllProfiles' : ActorMethod<[], Array<Profile>>,
  'getAllResources' : ActorMethod<[], Array<ResourceHave>>,
  'getCategoryMatches' : ActorMethod<[ResourceCategory], [] | [CategoryMatch]>,
  'getFileReference' : ActorMethod<[string], FileReference>,
  'getNeed' : ActorMethod<[string], [] | [Need]>,
  'getProfile' : ActorMethod<[string], [] | [Profile]>,
  'getResourceHave' : ActorMethod<[string], [] | [ResourceHave]>,
  'listFileReferences' : ActorMethod<[], Array<FileReference>>,
  'registerFileReference' : ActorMethod<[string, string], undefined>,
  'registerProfile' : ActorMethod<
    [
      string,
      string,
      Array<FunctionType>,
      string,
      string,
      string,
      [] | [string],
      [] | [string],
    ],
    undefined
  >,
  'searchNeeds' : ActorMethod<[string], Array<Need>>,
  'searchProfiles' : ActorMethod<[string], Array<Profile>>,
  'searchResources' : ActorMethod<[string], Array<ResourceHave>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
