export const idlFactory = ({ IDL }) => {
  const ResourceCategory = IDL.Variant({
    'storageSpace' : IDL.Null,
    'other' : IDL.Null,
    'equipment' : IDL.Null,
    'publicity' : IDL.Null,
    'foodDrink' : IDL.Null,
    'distributionSpace' : IDL.Null,
    'kitchenSpace' : IDL.Null,
  });
  const Need = IDL.Record({
    'id' : IDL.Text,
    'endDate' : IDL.Int,
    'profileId' : IDL.Text,
    'description' : IDL.Text,
    'category' : ResourceCategory,
    'startDate' : IDL.Int,
  });
  const FunctionType = IDL.Variant({
    'production' : IDL.Null,
    'education' : IDL.Null,
    'equipmentSpace' : IDL.Null,
    'wasteManagement' : IDL.Null,
    'processing' : IDL.Null,
    'distribution' : IDL.Null,
  });
  const Profile = IDL.Record({
    'id' : IDL.Text,
    'bio' : IDL.Opt(IDL.Text),
    'organizationName' : IDL.Text,
    'resources' : IDL.Vec(IDL.Text),
    'email' : IDL.Text,
    'needs' : IDL.Vec(IDL.Text),
    'address' : IDL.Text,
    'functions' : IDL.Vec(FunctionType),
    'phone' : IDL.Text,
    'profilePicture' : IDL.Opt(IDL.Text),
  });
  const ResourceHave = IDL.Record({
    'id' : IDL.Text,
    'profileId' : IDL.Text,
    'description' : IDL.Text,
    'category' : ResourceCategory,
  });
  const CategoryMatch = IDL.Record({
    'resourceIds' : IDL.Vec(IDL.Text),
    'needIds' : IDL.Vec(IDL.Text),
    'category' : ResourceCategory,
  });
  const FileReference = IDL.Record({ 'hash' : IDL.Text, 'path' : IDL.Text });
  return IDL.Service({
    'createNeed' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, ResourceCategory, IDL.Int, IDL.Int],
        [],
        [],
      ),
    'createResourceHave' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, ResourceCategory],
        [],
        [],
      ),
    'deleteNeed' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'deleteResourceHave' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'dropFileReference' : IDL.Func([IDL.Text], [], []),
    'getAllNeeds' : IDL.Func([], [IDL.Vec(Need)], ['query']),
    'getAllProfiles' : IDL.Func([], [IDL.Vec(Profile)], ['query']),
    'getAllResources' : IDL.Func([], [IDL.Vec(ResourceHave)], ['query']),
    'getCategoryMatches' : IDL.Func(
        [ResourceCategory],
        [IDL.Opt(CategoryMatch)],
        ['query'],
      ),
    'getFileReference' : IDL.Func([IDL.Text], [FileReference], ['query']),
    'getNeed' : IDL.Func([IDL.Text], [IDL.Opt(Need)], ['query']),
    'getProfile' : IDL.Func([IDL.Text], [IDL.Opt(Profile)], ['query']),
    'getResourceHave' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(ResourceHave)],
        ['query'],
      ),
    'listFileReferences' : IDL.Func([], [IDL.Vec(FileReference)], ['query']),
    'registerFileReference' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'registerProfile' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Vec(FunctionType),
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
        ],
        [],
        [],
      ),
    'searchNeeds' : IDL.Func([IDL.Text], [IDL.Vec(Need)], ['query']),
    'searchProfiles' : IDL.Func([IDL.Text], [IDL.Vec(Profile)], ['query']),
    'searchResources' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(ResourceHave)],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
