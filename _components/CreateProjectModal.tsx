"use client";

import { useState, type FormEvent } from "react";

import Button from "./Button";
import Input from "./Input";

interface CreateProjectModalProps {
  onCreate: (title: string, description: string) => void;
}

const CreateProjectModal = ({ onCreate }: CreateProjectModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      return;
    }

    onCreate(trimmedTitle, trimmedDescription);
    setTitle("");
    setDescription("");
    setIsOpen(false);
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
          <div className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80" onClick={handleClose} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
            <div className="pointer-events-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <h2 className="text-lg font-semibold">Create project</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Add basic details for your new project.
              </p>

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

                <div className="mt-5 flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={handleClose}
                    className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80"
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
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
