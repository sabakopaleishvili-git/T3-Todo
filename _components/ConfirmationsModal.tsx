"use client";

import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";
import Button from "./Button";

interface IProps {
  isOpen: boolean;
  handleOpen: () => void;
  handleClose: () => void;
  task: RouterOutputs["task"]["list"][number];
}

const ConfirmationsModal = ({
  isOpen,
  handleOpen,
  handleClose,
  task,
}: IProps) => {
  const utils = api.useUtils();
  const deleteTask = api.task.delete.useMutation({
    onSuccess: async () => {
      await utils.task.invalidate();
      handleClose();
    },
  });

  const handleDelete = () => {
    deleteTask.mutate({ taskId: task.id });
  };

  return (
    <>
      <Button
        className="border-red-400/40! bg-red-500/25! px-2! py-1! text-sm text-red-100! transition hover:border-red-300/60! hover:bg-red-500/40! hover:text-white!"
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
          <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
            <div className="pointer-events-auto w-full max-w-md rounded-xl border border-white/20 bg-[#1e1f34] p-5 text-white shadow-xl">
              <h2 className="text-lg font-semibold">Confirmations</h2>
              <p className="text-sm text-white/60">
                Are you sure you want to delete this task?
              </p>

              <div className="mt-5 flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={handleClose}
                  className="bg-white/10"
                  disabled={deleteTask.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="border-red-400/40! bg-red-500/25! text-red-100! transition hover:border-red-300/60! hover:bg-red-500/40! hover:text-white!"
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
