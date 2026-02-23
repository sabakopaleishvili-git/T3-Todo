"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";
import Button from "./Button";
import Input from "./Input";

interface EditModalProps {
  isOpen: boolean;
  handleOpen: () => void;
  handleClose: () => void;
  task: RouterOutputs["task"]["list"][number];
  projectId: number | null;
}

const EditModal = ({
  isOpen,
  handleOpen,
  handleClose,
  task,
  projectId,
}: EditModalProps) => {
  const utils = api.useUtils();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setError(null);
    }
  }, [isOpen, task.description, task.title]);

  const updateDetails = api.task.updateDetails.useMutation({
    onSuccess: async () => {
      await utils.task.invalidate();
      handleClose();
    },
    onError: () => {
      setError("Unable to update task right now.");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!projectId) {
      setError("Select a project before editing tasks.");
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    updateDetails.mutate({
      projectId,
      taskId: task.id,
      title: trimmedTitle,
      description: description.trim() ? description : undefined,
    });
  };

  return (
    <>
      <Button className="px-2! py-1! text-sm" onClick={handleOpen}>
        Edit
      </Button>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 cursor-default"
          role="dialog"
          aria-modal="true"
          aria-label="Edit task modal"
        >
          <div className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80" onClick={handleClose} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
            <div className="pointer-events-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <h2 className="text-lg font-semibold">Edit Task</h2>
              {error ? (
                <p className="mt-3 rounded-md border border-red-400/35 bg-red-500/15 px-3 py-2 text-sm text-red-100">
                  {error}
                </p>
              ) : null}

              <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  type="text"
                  placeholder="Task title"
                  required
                />
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                    className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-blue-400/70"
                  placeholder="Description"
                  maxLength={500}
                />
                <div className="mt-5 flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={handleClose}
                    className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80"
                    disabled={updateDetails.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateDetails.isPending}>
                    {updateDetails.isPending ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditModal;
