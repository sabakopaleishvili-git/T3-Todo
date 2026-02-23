"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";

import Button from "./Button";
import Input from "./Input";

type InvitableUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

interface CreateProjectModalProps {
  onCreate: (
    title: string,
    description: string,
    inviteEmails: string[],
  ) => Promise<void>;
  invitableUsers: InvitableUser[];
}

const CreateProjectModal = ({
  onCreate,
  invitableUsers,
}: CreateProjectModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedInviteEmails, setSelectedInviteEmails] = useState<string[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setError(null);
    setSelectedInviteEmails([]);
    setIsOpen(false);
  };

  const toggleInviteEmail = (email: string) => {
    setSelectedInviteEmails((current) =>
      current.includes(email)
        ? current.filter((item) => item !== email)
        : [...current, email],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onCreate(trimmedTitle, trimmedDescription, selectedInviteEmails);
      setTitle("");
      setDescription("");
      setSelectedInviteEmails([]);
      setIsOpen(false);
    } catch {
      setError("Could not create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="group rounded-2xl border border-slate-200 bg-white/90 p-6 text-left shadow-xl transition hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-slate-500 dark:hover:bg-slate-900"
      >
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-slate-700 transition group-hover:text-blue-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:group-hover:text-blue-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 3.75h5.379a2.25 2.25 0 0 1 1.59.659l2.372 2.372a2.25 2.25 0 0 1 .659 1.59v9.879A2.25 2.25 0 0 1 16 20.5H8a2.25 2.25 0 0 1-2.25-2.25V6A2.25 2.25 0 0 1 8 3.75h.25Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.25 3.75v3a1.5 1.5 0 0 0 1.5 1.5h3"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Create new project
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Start a new workspace with title and description.
        </p>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 cursor-default"
          role="dialog"
          aria-modal="true"
          aria-label="Create project modal"
        >
          <div
            className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80"
            onClick={handleClose}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
            <div className="pointer-events-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <h2 className="text-lg font-semibold">Create project</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Add basic details for your new project.
              </p>
              {error ? (
                <p className="mt-3 rounded-md border border-red-400/35 bg-red-500/15 px-3 py-2 text-sm text-red-100">
                  {error}
                </p>
              ) : null}

              <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
                <div>
                  <p className="mb-1 text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    Title
                  </p>
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Project title"
                    required
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    Description
                  </p>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-blue-400/70"
                    placeholder="Describe this project"
                    maxLength={500}
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    Invite teammates
                  </p>
                  {invitableUsers.length === 0 ? (
                    <p className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 dark:border-slate-600 dark:text-slate-400">
                      No users available to invite yet.
                    </p>
                  ) : (
                    <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border border-slate-300 p-2 dark:border-slate-600">
                      {invitableUsers.map((user) => {
                        const userEmail = user.email;
                        if (!userEmail) {
                          return null;
                        }
                        const isSelected =
                          selectedInviteEmails.includes(userEmail);
                        const displayName = user.name ?? userEmail;

                        return (
                          <label
                            key={user.id}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleInviteEmail(userEmail)}
                              className="h-4 w-4 accent-blue-600"
                            />
                            <Image
                              src={user.image ?? "/people.png"}
                              alt={displayName}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <span className="truncate text-sm text-slate-700 dark:text-slate-200">
                              {displayName}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={handleClose}
                    className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default CreateProjectModal;
