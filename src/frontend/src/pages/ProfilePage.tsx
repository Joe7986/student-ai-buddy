import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Check,
  Edit3,
  GraduationCap,
  Plus,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GradeLevel } from "../backend";
import { Layout } from "../components/Layout";
import { useProfile, useSaveProfile } from "../hooks/use-profile";
import type { StudentProfileInput } from "../types";

// ─── helpers ────────────────────────────────────────────────────────────────

const GRADE_OPTIONS: { value: GradeLevel; label: string; emoji: string }[] = [
  { value: GradeLevel.elementary, label: "Elementary School", emoji: "🏫" },
  { value: GradeLevel.middleSchool, label: "Middle School", emoji: "📚" },
  { value: GradeLevel.highSchool, label: "High School", emoji: "🎒" },
  { value: GradeLevel.college, label: "College / University", emoji: "🎓" },
  { value: GradeLevel.other, label: "Other", emoji: "✨" },
];

const SUGGESTED_SUBJECTS = [
  "Mathematics",
  "Science",
  "History",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Art",
  "Music",
];

function gradeLabelEmoji(grade: GradeLevel): string {
  return GRADE_OPTIONS.find((g) => g.value === grade)?.emoji ?? "✨";
}

function gradeLabel(grade: GradeLevel): string {
  return GRADE_OPTIONS.find((g) => g.value === grade)?.label ?? grade;
}

function formatDate(ts: bigint): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(Number(ts / 1_000_000n)));
}

// ─── ProfileSkeleton ─────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="card-base p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// ─── SubjectTagInput ─────────────────────────────────────────────────────────

function SubjectTagInput({
  subjects,
  onChange,
}: {
  subjects: string[];
  onChange: (s: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addSubject(val: string) {
    const trimmed = val.trim();
    if (!trimmed || subjects.includes(trimmed)) return;
    onChange([...subjects, trimmed]);
    setInput("");
  }

  function removeSubject(s: string) {
    onChange(subjects.filter((x) => x !== s));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {subjects.map((s) => (
          <Badge
            key={s}
            variant="secondary"
            className="flex items-center gap-1.5 pr-1 text-sm"
            data-ocid="profile.subject_tag"
          >
            {s}
            <button
              type="button"
              onClick={() => removeSubject(s)}
              className="hover:text-destructive transition-colors duration-200 rounded-full"
              aria-label={`Remove ${s}`}
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        {subjects.length === 0 && (
          <span className="text-sm text-muted-foreground italic">
            No subjects selected yet
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add a subject…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSubject(input);
            }
          }}
          data-ocid="profile.subject_input"
          className="flex-1"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addSubject(input)}
          disabled={!input.trim()}
          data-ocid="profile.add_subject_button"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick-add chips */}
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_SUBJECTS.filter((s) => !subjects.includes(s))
          .slice(0, 6)
          .map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addSubject(s)}
              className="text-xs px-2.5 py-1 rounded-full border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-smooth"
            >
              + {s}
            </button>
          ))}
      </div>
    </div>
  );
}

// ─── ProfilePage ─────────────────────────────────────────────────────────────

export function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading } = useProfile();
  const saveProfile = useSaveProfile();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(
    GradeLevel.highSchool,
  );
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>([]);

  // Sync form state from profile
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setGradeLevel(profile.gradeLevel);
      setPreferredSubjects(profile.preferredSubjects);
    }
  }, [profile]);

  // Auto-open edit if no profile
  useEffect(() => {
    if (!isLoading && !profile && isAuthenticated) {
      setEditing(true);
    }
  }, [isLoading, profile, isAuthenticated]);

  function handleCancel() {
    if (profile) {
      setName(profile.name);
      setGradeLevel(profile.gradeLevel);
      setPreferredSubjects(profile.preferredSubjects);
    }
    setEditing(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    const input: StudentProfileInput = {
      name: name.trim(),
      gradeLevel,
      preferredSubjects,
    };

    try {
      await saveProfile.mutateAsync(input);
      toast.success("Profile saved! Keep up the great work 🎉");
      setEditing(false);
    } catch {
      toast.error("Couldn't save your profile. Please try again.");
    }
  }

  if (isInitializing || isLoading) {
    return (
      <Layout>
        <ProfileSkeleton />
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div
          className="flex flex-col items-center justify-center py-16 gap-4 text-center"
          data-ocid="profile.not_authenticated"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <User className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">
              Log in to set up your profile
            </h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-xs">
              Your AI buddy needs to know a bit about you to personalize your
              learning journey.
            </p>
          </div>
          <Button
            onClick={() => navigate({ to: "/" })}
            data-ocid="profile.login_button"
          >
            Go to login
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-5 max-w-lg mx-auto">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          data-ocid="profile.card"
        >
          <Card className="card-base overflow-hidden">
            {/* Gradient band */}
            <div className="h-24 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />

            <CardContent className="-mt-8 pb-5 px-5">
              {/* Avatar */}
              <div className="flex items-end justify-between mb-3">
                <div className="w-16 h-16 rounded-2xl bg-primary shadow-elevated flex items-center justify-center border-4 border-card">
                  <span className="text-2xl font-display font-bold text-primary-foreground">
                    {(profile?.name ?? name).charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
                {!editing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="text-xs"
                    data-ocid="profile.edit_button"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </Button>
                )}
              </div>

              {/* Display mode */}
              {!editing && profile ? (
                <div className="space-y-3">
                  <div>
                    <h2 className="font-display font-bold text-xl text-foreground">
                      {profile.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base">
                        {gradeLabelEmoji(profile.gradeLevel)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {gradeLabel(profile.gradeLevel)}
                      </span>
                    </div>
                  </div>

                  {profile.preferredSubjects.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Favourite Subjects
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.preferredSubjects.map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-xs"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Member since {formatDate(profile.createdAt)}
                  </p>
                </div>
              ) : !editing ? (
                /* No profile yet, not editing */
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">
                    Complete your profile so your AI buddy can personalize your
                    learning!
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit form */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            data-ocid="profile.edit_form"
          >
            <Card className="card-base">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {profile ? "Update Your Profile" : "Set Up Your Profile"}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSave} className="space-y-5">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="profile-name"
                      className="flex items-center gap-1.5 text-sm font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      Your Name
                    </Label>
                    <Input
                      id="profile-name"
                      placeholder="What should we call you?"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      data-ocid="profile.name_input"
                      required
                    />
                  </div>

                  {/* Grade level */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-sm font-medium">
                      <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                      Grade Level
                    </Label>
                    <Select
                      value={gradeLevel}
                      onValueChange={(v) => setGradeLevel(v as GradeLevel)}
                    >
                      <SelectTrigger data-ocid="profile.grade_select">
                        <SelectValue placeholder="Pick your grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map((g) => (
                          <SelectItem key={g.value} value={g.value}>
                            {g.emoji} {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preferred subjects */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-sm font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                      Favourite Subjects
                    </Label>
                    <SubjectTagInput
                      subjects={preferredSubjects}
                      onChange={setPreferredSubjects}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={saveProfile.isPending}
                      data-ocid="profile.save_button"
                    >
                      {saveProfile.isPending ? (
                        <>Saving…</>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1.5" />
                          Save Profile
                        </>
                      )}
                    </Button>
                    {profile && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        data-ocid="profile.cancel_button"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Encouragement section */}
        {!editing && profile && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            data-ocid="profile.encouragement_card"
          >
            <Card className="card-base bg-primary/5 border-primary/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🌟</span>
                  <div>
                    <p className="font-display font-semibold text-foreground text-sm">
                      {`Keep it up, ${profile.name.split(" ")[0]}!`}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                      Every question you ask and every quiz you take brings you
                      one step closer to mastery. Your AI buddy is here every
                      step of the way!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
