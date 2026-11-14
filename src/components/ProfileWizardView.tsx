import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { StudyStats, StudyStyle, StudyTimePref, UserProfile } from '../types/study';
import { createId } from '../utils/textAnalysis';
import { AvatarMonogram } from './AvatarMonogram';

interface ProfileWizardViewProps {
  profile: UserProfile | null;
  stats: StudyStats;
  onSaveProfile: (profile: UserProfile) => void;
  onNavigateBuddies: () => void;
  onToast: (msg: string, tone?: 'success' | 'info' | 'warn' | 'error') => void;
}

const AVATAR_COLORS = [
  '#6A55DC',
  '#D6336C',
  '#0B7285',
  '#E67700',
  '#0CA678',
  '#3B5BDB',
];

const SUBJECT_OPTIONS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Computer Science',
  'Literature',
  'Economics',
  'Geography',
  'Psychology',
];

export const ProfileWizardView: React.FC<ProfileWizardViewProps> = ({
  profile,
  stats,
  onSaveProfile,
  onNavigateBuddies,
  onToast,
}) => {
  const [editing, setEditing] = useState(!profile);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [name, setName] = useState(profile?.name || '');
  const [avatarColor, setAvatarColor] = useState(profile?.avatarColor || AVATAR_COLORS[0]);
  const [bio, setBio] = useState(profile?.bio || '');
  const [subjects, setSubjects] = useState<string[]>(profile?.subjects || []);
  const [examTarget, setExamTarget] = useState(profile?.examTarget || '');
  const [studyStyle, setStudyStyle] = useState<StudyStyle>(
    profile?.studyStyle || 'deep-focus'
  );
  const [timezone, setTimezone] = useState(profile?.timezone || '');
  const [studyTime, setStudyTime] = useState<StudyTimePref>(
    profile?.studyTime || 'evening'
  );
  const [weeklyHours, setWeeklyHours] = useState(profile?.weeklyHours || 20);
  const [shortGoal, setShortGoal] = useState(profile?.shortGoal || '');

  const totalMinutes = Object.values(stats.days).reduce((acc, v) => acc + v, 0);

  const toggleSubject = (sub: string) => {
    setSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleNextStep1 = () => {
    if (!name.trim()) {
      onToast('Please enter your full name.', 'warn');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (subjects.length === 0) {
      onToast('Please select at least one subject.', 'warn');
      return;
    }
    if (!examTarget) {
      onToast('Please select your exam target.', 'warn');
      return;
    }
    setStep(3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timezone) {
      onToast('Please choose your timezone.', 'warn');
      return;
    }
    const nextProfile: UserProfile = {
      id: profile?.id || createId('user'),
      name: name.trim(),
      avatarColor,
      bio: bio.trim(),
      subjects,
      examTarget,
      studyStyle,
      timezone,
      studyTime,
      weeklyHours,
      shortGoal: shortGoal.trim(),
      createdAt: profile?.createdAt || new Date().toISOString(),
    };
    onSaveProfile(nextProfile);
    setEditing(false);
    setStep(1);
    onToast('Profile saved.', 'success');
  };

  if (!editing && profile) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#6A55DC] mb-1">
              Student Profile
            </p>
            <h1 className="text-3xl font-extrabold text-[#211E36]">My Profile</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setStep(1);
              }}
              className="px-4 py-2 rounded-xl border border-[#E6E4F0] bg-white text-sm font-semibold text-[#3D3956] hover:bg-[#F8F6FF]"
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={onNavigateBuddies}
              className="px-4 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold hover:bg-[#5B47C7]"
            >
              Browse Matches
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#EAE8F2] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <AvatarMonogram
            name={profile.name}
            color={profile.avatarColor}
            size="lg"
          />
          <div className="space-y-1.5 flex-1">
            <h2 className="text-2xl font-bold text-[#211E36]">{profile.name}</h2>
            <p className="text-xs text-[#6E6B80]">
              {profile.examTarget} · {profile.timezone} ·{' '}
              {profile.studyStyle.replace('-', ' ')} · {profile.weeklyHours} hrs/week
            </p>
            {profile.bio && (
              <p className="text-sm text-[#46425E] pt-1">{profile.bio}</p>
            )}
            <p className="text-xs font-semibold text-[#6A55DC] pt-1">
              Subjects: {profile.subjects.join(' · ')}
            </p>
            {profile.shortGoal && (
              <p className="text-xs text-[#5E5A75]">
                Current goal: {profile.shortGoal}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-[#EAE8F2] rounded-2xl p-4">
            <p className="text-xs text-[#77758A]">Focus Sessions</p>
            <p className="text-2xl font-bold font-mono tabular-nums text-[#211E36] mt-1">
              {stats.sessions}
            </p>
          </div>
          <div className="bg-white border border-[#EAE8F2] rounded-2xl p-4">
            <p className="text-xs text-[#77758A]">Minutes Focused</p>
            <p className="text-2xl font-bold font-mono tabular-nums text-[#211E36] mt-1">
              {totalMinutes}
            </p>
          </div>
          <div className="bg-white border border-[#EAE8F2] rounded-2xl p-4">
            <p className="text-xs text-[#77758A]">Cards Reviewed</p>
            <p className="text-2xl font-bold font-mono tabular-nums text-[#211E36] mt-1">
              {stats.cardsReviewed}
            </p>
          </div>
          <div className="bg-white border border-[#EAE8F2] rounded-2xl p-4">
            <p className="text-xs text-[#77758A]">Quizzes Completed</p>
            <p className="text-2xl font-bold font-mono tabular-nums text-[#211E36] mt-1">
              {stats.quizCount}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#6A55DC] mb-1">Profile Setup</p>
        <h1 className="text-3xl font-extrabold text-[#211E36]">
          {profile ? 'Update Your Profile' : 'Set Up Your Study Profile'}
        </h1>
        <p className="text-sm text-[#6E6B80] mt-1">
          Personalize your workspace and unlock study partner match scores.
        </p>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { num: 1, label: '01. About You' },
          { num: 2, label: '02. Preferences' },
          { num: 3, label: '03. Schedule' },
        ].map((item) => (
          <div
            key={item.num}
            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-center ${
              step === item.num
                ? 'border-[#6A55DC] bg-[#F4F1FF] text-[#43388C]'
                : step > item.num
                  ? 'border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]'
                  : 'border-[#E6E4F0] bg-white text-[#77758A]'
            }`}
          >
            {item.label}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#EAE8F2] rounded-2xl p-6 space-y-5"
      >
        {step === 1 && (
          <>
            <div>
              <label
                htmlFor="profile-name"
                className="block text-xs font-semibold text-[#5E5A75] mb-1.5"
              >
                Full Name *
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm focus:outline-none focus:border-[#6A55DC]"
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-[#5E5A75] mb-2">
                Avatar Color
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {AVATAR_COLORS.map((clr) => (
                  <button
                    key={clr}
                    type="button"
                    onClick={() => setAvatarColor(clr)}
                    className={`p-1 rounded-full border-2 transition-transform ${
                      avatarColor === clr
                        ? 'border-[#211E36] scale-105'
                        : 'border-transparent'
                    }`}
                    aria-label={`Select color ${clr}`}
                  >
                    <AvatarMonogram name={name || 'S'} color={clr} size="md" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="profile-bio"
                  className="block text-xs font-semibold text-[#5E5A75]"
                >
                  Short Bio (optional)
                </label>
                <span className="text-[11px] font-mono text-[#8B889E] tabular-nums">
                  {bio.length}/200
                </span>
              </div>
              <textarea
                id="profile-bio"
                rows={3}
                maxLength={200}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your study habits or upcoming exam goals..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm focus:outline-none focus:border-[#6A55DC]"
              />
            </div>

            <div className="flex justify-between pt-2">
              {profile ? (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl border border-[#E6E4F0] text-sm font-semibold text-[#5E5A75]"
                >
                  Cancel
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={handleNextStep1}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold hover:bg-[#5B47C7]"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <p className="text-xs font-semibold text-[#5E5A75] mb-2">
                Subjects * (select all that apply)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECT_OPTIONS.map((sub) => {
                  const selected = subjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleSubject(sub)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold text-left transition-colors ${
                        selected
                          ? 'border-[#6A55DC] bg-[#F4F1FF] text-[#43388C]'
                          : 'border-[#E6E4F0] bg-[#FAF9FD] text-[#3D3956]'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                          selected
                            ? 'bg-[#6A55DC] border-[#6A55DC] text-white'
                            : 'border-[#C9C6D9] bg-white'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3" />}
                      </span>
                      <span className="truncate">{sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-exam"
                className="block text-xs font-semibold text-[#5E5A75] mb-1.5"
              >
                Exam Target *
              </label>
              <select
                id="profile-exam"
                value={examTarget}
                onChange={(e) => setExamTarget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm"
              >
                <option value="" disabled>
                  Select your exam target
                </option>
                <option value="SAT">SAT</option>
                <option value="JEE">JEE</option>
                <option value="UPSC">UPSC</option>
                <option value="GMAT">GMAT</option>
                <option value="GRE">GRE</option>
                <option value="IELTS">IELTS</option>
                <option value="Board Exams">Board Exams</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#5E5A75] mb-2">
                Study Style *
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'deep-focus' as StudyStyle,
                    title: 'Deep Focus',
                    desc: 'Long quiet blocks',
                  },
                  {
                    id: 'collaborative' as StudyStyle,
                    title: 'Collaborative',
                    desc: 'Peer discussion',
                  },
                  {
                    id: 'mixed' as StudyStyle,
                    title: 'Mixed',
                    desc: 'Flexible rhythm',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStudyStyle(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      studyStyle === opt.id
                        ? 'border-[#6A55DC] bg-[#F4F1FF]'
                        : 'border-[#E6E4F0] bg-[#FAF9FD]'
                    }`}
                  >
                    <p className="text-sm font-bold text-[#211E36]">{opt.title}</p>
                    <p className="text-xs text-[#77758A] mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E6E4F0] text-sm font-semibold text-[#5E5A75]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleNextStep2}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold hover:bg-[#5B47C7]"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label
                htmlFor="profile-tz"
                className="block text-xs font-semibold text-[#5E5A75] mb-1.5"
              >
                Timezone *
              </label>
              <select
                id="profile-tz"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm"
              >
                <option value="" disabled>
                  Select timezone
                </option>
                <option value="IST">IST — India Standard Time</option>
                <option value="EST">EST — Eastern Standard Time</option>
                <option value="PST">PST — Pacific Standard Time</option>
                <option value="CST">CST — Central Standard Time</option>
                <option value="GMT">GMT — Greenwich Mean Time</option>
                <option value="CET">CET — Central European Time</option>
                <option value="JST">JST — Japan Standard Time</option>
                <option value="AEST">AEST — Australian Eastern Time</option>
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#5E5A75] mb-2">
                Preferred Study Time
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'morning' as StudyTimePref, label: 'Morning (6am–12pm)' },
                  { id: 'afternoon' as StudyTimePref, label: 'Afternoon (12pm–6pm)' },
                  { id: 'evening' as StudyTimePref, label: 'Evening (6pm–12am)' },
                  { id: 'night' as StudyTimePref, label: 'Night (12am–6am)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStudyTime(opt.id)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left ${
                      studyTime === opt.id
                        ? 'border-[#6A55DC] bg-[#F4F1FF] text-[#43388C]'
                        : 'border-[#E6E4F0] bg-[#FAF9FD] text-[#3D3956]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="profile-weekly-hours"
                  className="text-xs font-semibold text-[#5E5A75]"
                >
                  Weekly Study Goal
                </label>
                <span className="text-sm font-mono font-bold tabular-nums text-[#6A55DC]">
                  {weeklyHours} hrs
                </span>
              </div>
              <input
                id="profile-weekly-hours"
                type="range"
                min={5}
                max={60}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full accent-[#6A55DC]"
              />
            </div>

            <div>
              <label
                htmlFor="profile-goal"
                className="block text-xs font-semibold text-[#5E5A75] mb-1.5"
              >
                Short-Term Goal (optional)
              </label>
              <input
                id="profile-goal"
                type="text"
                value={shortGoal}
                onChange={(e) => setShortGoal(e.target.value)}
                placeholder="e.g. Finish Calculus review by Friday"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm"
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E6E4F0] text-sm font-semibold text-[#5E5A75]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#6A55DC] text-white text-sm font-semibold hover:bg-[#5B47C7]"
              >
                Save Profile
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};
