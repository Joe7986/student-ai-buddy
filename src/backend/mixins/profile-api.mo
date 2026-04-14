import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/profile";
import Common "../types/common";
import ProfileLib "../lib/profile";

mixin (
  profileStore : Map.Map<Common.UserId, Types.StudentProfile>,
) {
  public query ({ caller }) func getCallerUserProfile() : async ?Types.StudentProfilePublic {
    ProfileLib.getProfile(profileStore, caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(input : Types.StudentProfileInput) : async () {
    ignore ProfileLib.saveProfile(profileStore, caller, input);
  };

  public query ({ caller }) func getUserProfile(userId : Common.UserId) : async ?Types.StudentProfilePublic {
    ProfileLib.getProfile(profileStore, userId);
  };
};
