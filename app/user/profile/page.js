"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  getUserProfile,
  updateUserProfile,
} from "@/app/actions/profile/profile";

const SEMESTERS = Array.from({ length: 12 }, (_, i) => i + 1);

// No enum in model — free-text list used as suggestions via datalist
const PROGRAMS = [
  "B.E. Computer Engineering",
  "B.E. Information Technology",
  "B.E. Electronics & Telecommunication",
  "B.Tech Computer Science",
  "B.Sc. Computer Science",
  "MCA",
  "M.Tech",
  "Other",
];

// planTier enum from model: free | premium | premium_plus
const PLAN_LABELS = {
  free: "Free",
  premium: "Premium",
  premium_plus: "Premium+",
};

function Toast({ items, dismiss }) {
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[320px] flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border px-4 py-3 text-sm shadow"
          style={{
            background: item.type === "error" ? "#fef2f2" : "#f0fdf4",
            borderColor: item.type === "error" ? "#fecaca" : "#bbf7d0",
            color: item.type === "error" ? "#991b1b" : "#166534",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <p>{item.message}</p>
            <button type="button" onClick={() => dismiss(item.id)} className="text-xs opacity-70">
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, accent = "#14532d" }) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        borderColor: "#d7e7d9",
        background: "#ffffff",
        boxShadow: "0 10px 24px rgba(20,83,45,0.06)",
      }}
    >
      <p className="text-[11px] uppercase tracking-[0.13em]" style={{ color: "#6b7a6b" }}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}

function InputLabel({ children }) {
  return (
    <span
      className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.13em]"
      style={{ color: "#657865" }}
    >
      {children}
    </span>
  );
}

function FieldInput(props) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(22,101,52,0.12)]"
      style={{ borderColor: "#d6e6d7", background: "#fff" }}
    />
  );
}

function FieldSelect({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(22,101,52,0.12)]"
      style={{ borderColor: "#d6e6d7", background: "#fff" }}
    >
      {children}
    </select>
  );
}

/** Avatar: shows image preview if avatarUrl is a valid-looking URL, otherwise initials */
function Avatar({ url, initials }) {
  const [imgOk, setImgOk] = useState(false);

  useEffect(() => {
    if (!url) { setImgOk(false); return; }
    try {
      new URL(url); // throws if invalid
      setImgOk(true);
    } catch {
      setImgOk(false);
    }
  }, [url]);

  return (
    <div className="h-16 w-16 overflow-hidden rounded-2xl border-2 border-[#86efac] bg-[#1b6537] text-xl font-black text-white grid place-items-center shrink-0">
      {imgOk ? (
        <img
          src={url}
          alt="avatar"
          className="h-full w-full object-cover"
          onError={() => setImgOk(false)}
        />
      ) : (
        initials || "U"
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    avatarUrl: "",      // stored as plain string in model (no special type)
    university: "",     // maxlength: 120
    program: "",        // maxlength: 120, no enum — free text
    specialization: "", // maxlength: 120
    semester: 1,        // Number, min:1 max:12
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getUserProfile();
      if (!res.success) {
        addToast(res.error || "Failed to load profile", "error");
        setLoading(false);
        return;
      }
      setProfile(res.data);
      setForm({
        name: res.data.name || "",
        avatarUrl: res.data.avatarUrl || "",
        university: res.data.university || "",
        program: res.data.program || "",
        specialization: res.data.specialization || "",
        semester: res.data.semester || 1,
      });
      setLoading(false);
    })();
  }, []);

  const isDirty = useMemo(() => {
    if (!profile) return false;
    return (
      form.name !== (profile.name || "") ||
      form.avatarUrl !== (profile.avatarUrl || "") ||
      form.university !== (profile.university || "") ||
      form.program !== (profile.program || "") ||
      form.specialization !== (profile.specialization || "") ||
      Number(form.semester) !== Number(profile.semester || 1)
    );
  }, [form, profile]);

  const initials = useMemo(() => {
    const source = form.name || profile?.name || "U";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");
  }, [form.name, profile?.name]);

  const onChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const onSave = async () => {
    // Client-side guard matching server validation
    if (!form.name.trim()) {
      addToast("Name is required", "error");
      return;
    }
    const sem = Number(form.semester);
    if (!Number.isInteger(sem) || sem < 1 || sem > 12) {
      addToast("Semester must be between 1 and 12", "error");
      return;
    }

    setSaving(true);
    const res = await updateUserProfile({ ...form, semester: sem });
    setSaving(false);

    if (!res.success) {
      addToast(res.error || "Failed to update profile", "error");
      return;
    }
    setProfile((prev) => ({ ...prev, ...res.data }));
    addToast("Profile updated successfully");
  };

  const onDiscard = () => {
    if (!profile) return;
    setForm({
      name: profile.name || "",
      avatarUrl: profile.avatarUrl || "",
      university: profile.university || "",
      program: profile.program || "",
      specialization: profile.specialization || "",
      semester: profile.semester || 1,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: "#f3f7f3" }}>
        <p className="text-sm font-semibold" style={{ color: "#4b5f4b" }}>
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 pb-12 pt-8 sm:px-6 lg:px-8"
      style={{
        background:
          "radial-gradient(circle at right top, rgba(163,230,53,0.18), transparent 35%), radial-gradient(circle at left bottom, rgba(37,103,30,0.08), transparent 40%), #f3f7f3",
      }}
    >
      <Toast items={toasts} dismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <div className="mx-auto max-w-6xl">
        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#143d21" }}>
            Profile
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#5d7160" }}>
            Manage your account details and academic information.
          </p>
        </motion.div>

        {/* Hero banner */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-3xl border px-5 py-5 sm:px-6"
          style={{
            borderColor: "#cfe1d0",
            background: "linear-gradient(130deg, #0f2f19 0%, #14532d 55%, #166534 100%)",
            boxShadow: "0 18px 36px rgba(20,83,45,0.24)",
          }}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar url={form.avatarUrl} initials={initials} />
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#cde8d0]">Welcome Back</p>
                <h2 className="text-2xl font-bold text-white">{form.name || "Student"}</h2>
                <p className="text-sm text-[#dcfce7]">{profile?.email}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#86efac]/40 bg-[#0f2f19]/35 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.13em] text-[#cde8d0]">Referral Code</p>
              {/* referralCode is stored uppercase in model */}
              <p className="mt-1 text-lg font-extrabold text-[#fef3c7]">
                {profile?.referralCode || "—"}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Stat cards */}
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Coins" value={profile?.coins ?? 0} accent="#a16207" />
          {/* Use friendly label from planTier enum */}
          <StatCard
            label="Plan"
            value={PLAN_LABELS[profile?.planTier] ?? (profile?.planTier || "Free")}
          />
          {/* role enum: student | admin */}
          <StatCard label="Role" value={(profile?.role || "student").toUpperCase()} />
          <StatCard label="Semester" value={form.semester || 1} accent="#166534" />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.45fr,1fr]">
          {/* Edit form */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border bg-white p-5 shadow-sm"
            style={{ borderColor: "#d6e6d7", boxShadow: "0 14px 28px rgba(20,83,45,0.08)" }}
          >
            <h2 className="mb-4 text-lg font-bold" style={{ color: "#1b3f24" }}>
              Profile Details
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* name — required per model */}
              <label className="sm:col-span-2">
                <InputLabel>Name *</InputLabel>
                <FieldInput
                  value={form.name}
                  onChange={onChange("name")}
                  placeholder="Your full name"
                  required
                />
              </label>

              {/* avatarUrl — plain string in model, show live preview hint */}
              <label className="sm:col-span-2">
                <InputLabel>Avatar URL</InputLabel>
                <FieldInput
                  value={form.avatarUrl}
                  onChange={onChange("avatarUrl")}
                  placeholder="https://example.com/photo.jpg"
                  type="url"
                />
                {form.avatarUrl && (
                  <p className="mt-1 text-[11px]" style={{ color: "#6b7a6b" }}>
                    Preview updates in the banner above.
                  </p>
                )}
              </label>

              {/* university — maxlength: 120 */}
              <label className="sm:col-span-2">
                <InputLabel>University</InputLabel>
                <FieldInput
                  value={form.university}
                  onChange={onChange("university")}
                  placeholder="Your university"
                  maxLength={120}
                />
              </label>

              {/* program — no enum in model (free text, maxlength: 120); datalist for suggestions */}
              <label>
                <InputLabel>Program</InputLabel>
                <input
                  list="program-suggestions"
                  value={form.program}
                  onChange={onChange("program")}
                  placeholder="Type or select…"
                  maxLength={120}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(22,101,52,0.12)]"
                  style={{ borderColor: "#d6e6d7", background: "#fff" }}
                />
                <datalist id="program-suggestions">
                  {PROGRAMS.map((p) => <option key={p} value={p} />)}
                </datalist>
              </label>

              {/* semester — Number, min:1 max:12 */}
              <label>
                <InputLabel>Semester</InputLabel>
                <FieldSelect value={form.semester} onChange={onChange("semester")}>
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </FieldSelect>
              </label>

              {/* specialization — maxlength: 120 */}
              <label className="sm:col-span-2">
                <InputLabel>Specialization</InputLabel>
                <FieldInput
                  value={form.specialization}
                  onChange={onChange("specialization")}
                  placeholder="Optional (e.g. AI & ML)"
                  maxLength={120}
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {isDirty && (
                <button
                  type="button"
                  onClick={onDiscard}
                  className="rounded-xl border px-4 py-2 text-sm font-semibold"
                  style={{ borderColor: "#c6d8c8", color: "#35503a", background: "#fff" }}
                >
                  Discard
                </button>
              )}
              <button
                type="button"
                onClick={onSave}
                disabled={!isDirty || saving}
                className="rounded-xl px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #14532d, #166534)" }}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </motion.section>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-5"
          >
            {/* Account snapshot */}
            <div
              className="rounded-3xl border bg-white p-5"
              style={{ borderColor: "#d6e6d7", boxShadow: "0 14px 28px rgba(20,83,45,0.08)" }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.13em]"
                style={{ color: "#6b7a6b" }}
              >
                Account Snapshot
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <SnapshotRow label="Email" value={profile?.email} />
                {/* referralCode stored uppercase, sparse unique */}
                <SnapshotRow label="Referral Code" value={profile?.referralCode || "—"} />
                <SnapshotRow
                  label="Last Login"
                  value={
                    profile?.lastLoginAt
                      ? new Date(profile.lastLoginAt).toLocaleString()
                      : "—"
                  }
                />
                {/* referredBy is ObjectId ref; server returns null or string id */}
                <SnapshotRow
                  label="Referred By"
                  value={profile?.referredBy ? "Linked" : "Direct signup"}
                />
              </div>
            </div>

            {/* Account status */}
            <div
              className="rounded-3xl border p-5"
              style={{
                borderColor: "#fde68a",
                background: "#fffbeb",
                boxShadow: "0 12px 24px rgba(161,98,7,0.1)",
              }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.13em]"
                style={{ color: "#92400e" }}
              >
                Account Status
              </p>
               {/* planTier enum from model: free | premium | premium_plus */}
              <StatusRow
                label="Plan"
                value={PLAN_LABELS[profile?.planTier] ?? (profile?.planTier || "Free")}
              />
              {/* isPremium Boolean */}
              <StatusRow
                label="Premium"
                value={profile?.isPremium ? "Active" : "Not active"}
              />
              {/* role enum: student | admin */}
              <StatusRow
                label="Role"
                value={profile?.role
                  ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
                  : "Student"}
              />
              {/* createdAt from timestamps:true */}
              <StatusRow
                label="Member since"
                value={
                  profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : "—"
                }
              />
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

function SnapshotRow({ label, value }) {
  return (
    <div
      className="rounded-xl border px-3 py-2"
      style={{ borderColor: "#e1ece2", background: "#fbfdfb" }}
    >
      <p style={{ color: "#6b7a6b" }}>{label}</p>
      <p className="font-semibold break-all" style={{ color: "#173e25" }}>
        {value}
      </p>
    </div>
  );
}

function StatusRow({ label, value }) {
  return (
    <p className="mt-2 text-sm" style={{ color: "#78350f" }}>
      <span className="font-semibold">{label}:</span> {value}
    </p>
  );
}
