import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  // Student profile
  public type GradeLevel = {
    #elementary;
    #middleSchool;
    #highSchool;
    #college;
    #other;
  };

  public type StudentProfile = {
    userId : UserId;
    name : Text;
    gradeLevel : GradeLevel;
    preferredSubjects : [Text];
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  // Shared (immutable) version for API responses
  public type StudentProfilePublic = {
    userId : UserId;
    name : Text;
    gradeLevel : GradeLevel;
    preferredSubjects : [Text];
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  // Profile input for create/update
  public type StudentProfileInput = {
    name : Text;
    gradeLevel : GradeLevel;
    preferredSubjects : [Text];
  };
};
