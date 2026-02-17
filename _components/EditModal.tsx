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
}

const EditModal = ({
  isOpen,
  handleOpen,
  handleClose,
  task,
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

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    updateDetails.mutate({
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
          <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
            <div className="pointer-events-auto w-full max-w-md rounded-xl border border-white/20 bg-[#1e1f34] p-5 text-white shadow-xl">
              <h2 className="text-lg font-semibold">Edit Task</h2>
              {error ? (
                <p className="mt-3 rounded-md border border-red-300/30 bg-red-500/20 px-3 py-2 text-sm text-red-100">
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
                  className="min-h-24 w-full rounded-md border border-white/20 bg-white/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/60 focus:border-white/50 focus:ring-2 focus:ring-white/20"
                  placeholder="Description"
                  maxLength={500}
                />
                <div className="mt-5 flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={handleClose}
                    className="bg-white/10"
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
