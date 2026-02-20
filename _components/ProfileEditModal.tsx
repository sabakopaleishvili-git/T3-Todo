"use client";

import { useEffect, useState, type FormEvent } from "react";

import Button from "./Button";
import Input from "./Input";

type ProfileValues = {
  name: string;
  email: string;
  role: string;
  location: string;
  phone: string;
  bio: string;
};

interface ProfileEditModalProps {
  isOpen: boolean;
  handleOpen: () => void;
  handleClose: () => void;
  profile: ProfileValues;
  onSave: (updatedProfile: ProfileValues) => void;
}

const ProfileEditModal = ({
  isOpen,
  handleOpen,
  handleClose,
  profile,
  onSave,
}: ProfileEditModalProps) => {
  const [draft, setDraft] = useState<ProfileValues>(profile);

  useEffect(() => {
    if (isOpen) {
      setDraft(profile);
    }
  }, [isOpen, profile]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(draft);
    handleClose();
  };

  return (
    <>
      <Button type="button" onClick={handleOpen}>
        Edit profile
      </Button>
      {isOpen ? (
        <div
          className="fixed inset-0 z-50 cursor-default"
          role="dialog"
          aria-modal="true"
          aria-label="Edit profile modal"
        >
          <div
            className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80"
            onClick={handleClose}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
            <div className="pointer-events-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <h2 className="text-lg font-semibold">Edit profile</h2>

              <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
                <Input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Name"
                  required
                />
                <Input
                  type="email"
                  value={draft.email}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="Email"
                  required
                />
                <Input
                  value={draft.role}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      role: event.target.value,
                    }))
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
                    setDraft((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="Phone"
                />
                <textarea
                  value={draft.bio}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      bio: event.target.value,
                    }))
                  }
                  className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-blue-400/70"
                  placeholder="Bio"
                  maxLength={500}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={handleClose}
                    className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80"
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
    </>
  );
};

export default ProfileEditModal;
