"use client";

import { useState } from "react";
import Image from "next/image";

import ProfileEditModal from "_components/ProfileEditModal";

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
  const [isEditOpen, setIsEditOpen] = useState(false);

  const openEditModal = () => {
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const handleSave = (updatedProfile: ProfileData) => {
    setProfile(updatedProfile);
  };

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-xl sm:p-6 dark:border-slate-700 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/people.png"
              alt="Profile avatar"
              width={56}
              height={56}
              className="rounded-full border border-slate-300 bg-slate-100 p-1 dark:border-slate-600 dark:bg-slate-800"
            />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Profile
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Mock data for now
              </p>
            </div>
          </div>
          <ProfileEditModal
            isOpen={isEditOpen}
            handleOpen={openEditModal}
            handleClose={closeEditModal}
            profile={profile}
            onSave={handleSave}
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <InfoItem label="Name" value={profile.name} />
          <InfoItem label="Email" value={profile.email} />
          <InfoItem label="Role" value={profile.role} />
          <InfoItem label="Location" value={profile.location} />
          <InfoItem label="Phone" value={profile.phone} />
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-700 dark:bg-slate-800/70">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Bio
          </p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
            {profile.bio}
          </p>
        </div>
      </div>
    </section>
  );
}

const InfoItem = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-700 dark:bg-slate-800/70">
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  );
};
