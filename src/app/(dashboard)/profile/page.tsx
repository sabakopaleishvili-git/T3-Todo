"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";

import Button from "_components/Button";
import Input from "_components/Input";

type ProfileData = {
  name: string;
  email: string;
  role: string;
  location: string;
  phone: string;
  bio: string;
};

const initialProfile: ProfileData = {
  name: "Alex Morgan",
  email: "alex.morgan@taskflow.dev",
  role: "Product Manager",
  location: "Lagos, Nigeria",
  phone: "+234 800 000 0000",
  bio: "Loves building clear workflows, reducing noise, and shipping reliable products.",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [draft, setDraft] = useState<ProfileData>(initialProfile);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const openEditModal = () => {
    setDraft(profile);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfile(draft);
    setIsEditOpen(false);
  };

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-xl sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/people.png"
              alt="Profile avatar"
              width={56}
              height={56}
              className="rounded-full border border-slate-600 bg-slate-800 p-1"
            />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
                Profile
              </h1>
              <p className="text-sm text-slate-400">Mock data for now</p>
            </div>
          </div>
          <Button type="button" onClick={openEditModal}>
            Edit profile
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <InfoItem label="Name" value={profile.name} />
          <InfoItem label="Email" value={profile.email} />
          <InfoItem label="Role" value={profile.role} />
          <InfoItem label="Location" value={profile.location} />
          <InfoItem label="Phone" value={profile.phone} />
        </div>

        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/70 p-4">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
            Bio
          </p>
          <p className="mt-1 text-sm text-slate-200">{profile.bio}</p>
        </div>
      </div>

      {isEditOpen ? (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Edit profile modal"
        >
          <div className="absolute inset-0 bg-slate-950/80" onClick={closeEditModal} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
            <div className="pointer-events-auto w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
              <h2 className="text-lg font-semibold text-slate-100">Edit profile</h2>

              <form className="mt-4 space-y-3" onSubmit={handleSave}>
                <Input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Name"
                  required
                />
                <Input
                  type="email"
                  value={draft.email}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="Email"
                  required
                />
                <Input
                  value={draft.role}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, role: event.target.value }))
                  }
                  placeholder="Role"
                />
                <Input
                  value={draft.location}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                  placeholder="Location"
                />
                <Input
                  value={draft.phone}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder="Phone"
                />
                <textarea
                  value={draft.bio}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, bio: event.target.value }))
                  }
                  className="min-h-24 w-full rounded-md border border-slate-600 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-blue-400/70 focus:ring-2 focus:ring-blue-500/30"
                  placeholder="Bio"
                  maxLength={500}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={closeEditModal}
                    className="border-slate-600 bg-slate-800/70 text-slate-200 hover:bg-slate-700/80"
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

const InfoItem = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</p>
      <p className="mt-1 text-sm text-slate-200">{value}</p>
    </div>
  );
};
