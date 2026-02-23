"use client";

import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";
import Button from "./Button";

interface IProps {
  isOpen: boolean;
  handleOpen: () => void;
  handleClose: () => void;
  task: RouterOutputs["task"]["list"][number];
  projectId: number | null;
}

const ConfirmationsModal = ({
  isOpen,
  handleOpen,
  handleClose,
  task,
  projectId,
}: IProps) => {
  const utils = api.useUtils();
  const deleteTask = api.task.delete.useMutation({
    onSuccess: async () => {
      await utils.task.invalidate();
      handleClose();
    },
  });

  const handleDelete = () => {
    if (!projectId) {
      return;
    }

    deleteTask.mutate({ projectId, taskId: task.id });
  };

  return (
    <>
      <Button
        className="border-red-400/45! bg-red-600/80! px-2! py-1! text-sm text-white! transition hover:bg-red-500!"
        onClick={handleOpen}
      >
        Delete
      </Button>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 cursor-default"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmations modal"
        >
          <div className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80" onClick={handleClose} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
            <div className="pointer-events-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <h2 className="text-lg font-semibold">Delete task</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Are you sure you want to delete this task?
              </p>

              <div className="mt-5 flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={handleClose}
                  className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80"
                  disabled={deleteTask.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="border-red-400/45! bg-red-600/80! text-white! transition hover:bg-red-500!"
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteTask.isPending}
                >
                  {deleteTask.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfirmationsModal;
