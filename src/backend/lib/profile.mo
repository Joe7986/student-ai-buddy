import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/profile";
import Common "../types/common";

module {
  public type State = Map.Map<Common.UserId, Types.StudentProfile>;

  public func getProfile(state : State, userId : Common.UserId) : ?Types.StudentProfilePublic {
    switch (state.get(userId)) {
      case (null) null;
      case (?p) ?{
        userId = p.userId;
        name = p.name;
        gradeLevel = p.gradeLevel;
        preferredSubjects = p.preferredSubjects;
        createdAt = p.createdAt;
        updatedAt = p.updatedAt;
      };
    };
  };

  public func saveProfile(state : State, userId : Common.UserId, input : Types.StudentProfileInput) : Types.StudentProfilePublic {
    let now = Time.now();
    let existing = state.get(userId);
    let createdAt = switch (existing) {
      case (?p) p.createdAt;
      case (null) now;
    };
    let profile : Types.StudentProfile = {
      userId = userId;
      name = input.name;
      gradeLevel = input.gradeLevel;
      preferredSubjects = input.preferredSubjects;
      createdAt = createdAt;
      updatedAt = now;
    };
    state.add(userId, profile);
    {
      userId = profile.userId;
      name = profile.name;
      gradeLevel = profile.gradeLevel;
      preferredSubjects = profile.preferredSubjects;
      createdAt = profile.createdAt;
      updatedAt = profile.updatedAt;
    };
  };

  public func profileExists(state : State, userId : Common.UserId) : Bool {
    switch (state.get(userId)) {
      case (null) false;
      case (?_) true;
    };
  };
};
