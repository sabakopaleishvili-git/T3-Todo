import React, { useEffect, useMemo, useState } from "react";
import type { RouterOutputs } from "~/trpc/react";
import { useDraggable } from "@dnd-kit/react";
import Dropdown from "./Dropdown";
import Image from "next/image";
import EditModal from "./EditModal";
import ConfirmationsModal from "./ConfirmationsModal";

const STATUSES = ["CREATED", "IN_PROGRESS", "FINISHED"] as const;
type Status = (typeof STATUSES)[number];

const TEN_MINUTES_IN_MS = 10 * 60 * 1000;

interface IProps {
  task: RouterOutputs["task"]["list"][number];
  users: RouterOutputs["task"]["getAssignableUsers"];
  onAssignTask: (taskId: number, assignedToId: string | null) => void;
  onUpdateStatus: (taskId: number, status: Status) => void;
  isAssignPending: boolean;
  isStatusPending: boolean;
}
const Card = ({
  task,
  users,
  onAssignTask,
  onUpdateStatus,
  isAssignPending,
  isStatusPending,
}: IProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!task.finishedAt) {
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [task.finishedAt]);

  const countdownTime = useMemo(() => {
    if (!task.finishedAt) {
      return null;
    }

    const endTime = new Date(task.finishedAt).getTime() + TEN_MINUTES_IN_MS;

    const diff = endTime - now;

    if (diff <= 0) {
      return "0:00";
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${seconds}`;
  }, [task.finishedAt, now]);

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };
  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  const { ref } = useDraggable({
    id: task.id.toString(),
    disabled: isEditModalOpen || isDeleteModalOpen,
  });

  return (
    <article
      ref={ref}
      className="w-full rounded-lg border border-slate-700 bg-slate-800/80 p-3 shadow-md sm:p-4"
    >
      <div className="flex cursor-grab flex-wrap items-start justify-between gap-2 select-none active:cursor-grabbing">
        <p className="max-w-full font-semibold text-slate-100 wrap-break-word sm:max-w-[70%]">
          {task.title}
        </p>
        <div className="flex items-center gap-2 self-start">
          <ConfirmationsModal
            isOpen={isDeleteModalOpen}
            handleOpen={handleOpenDeleteModal}
            handleClose={handleCloseDeleteModal}
            task={task}
          />
          <EditModal
            isOpen={isEditModalOpen}
            handleOpen={handleOpenEditModal}
            handleClose={handleCloseEditModal}
            task={task}
          />
        </div>
      </div>
      {task.description ? (
        <p className="mt-1 text-sm text-slate-300">{task.description}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        Assigned to:{" "}
        <div className="flex items-center gap-2">
          {task.assignedTo?.image ? (
            <Image
              src={task.assignedTo.image}
              width={24}
              height={24}
              alt={
                task.assignedTo.name ?? task.assignedTo.email ?? "Unknown user"
              }
              className="rounded-full"
            />
          ) : (
            <Image
              className="rounded-full bg-slate-700 p-1"
              src={"/people.png"}
              width={24}
              height={24}
              alt={
                task.assignedTo?.name ??
                task.assignedTo?.email ??
                "Unknown user"
              }
            />
          )}
          <span className="text-sm text-slate-300">
            {task.assignedTo?.name ?? task.assignedTo?.email ?? "Nobody"}
          </span>
        </div>
      </div>
      {countdownTime && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-amber-400/35 bg-amber-500/10 px-2 py-1">
          <span className="text-xs font-medium tracking-wide text-amber-100 uppercase">
            Auto delete in
          </span>
          <span className="rounded bg-amber-500/20 px-2 py-1 font-mono text-sm font-semibold text-amber-100">
            {countdownTime}
          </span>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2">
        <Dropdown
          value={task.assignedToId ?? ""}
          onChange={(value) => {
            onAssignTask(task.id, value || null);
          }}
          className="rounded-md px-2 py-1 text-sm"
          disabled={isAssignPending}
          options={[
            { value: "", label: "Unassigned" },
            ...users.map((user) => ({
              value: user.id,
              label: user.name ?? user.email ?? "Unknown user",
              image: user.image ?? "/people.png",
            })),
          ]}
        />

        <Dropdown
          value={task.status}
          onChange={(value) => {
            onUpdateStatus(task.id, value as Status);
          }}
          className="rounded-md px-2 py-1 text-sm"
          disabled={isStatusPending}
          options={STATUSES.map((statusValue) => ({
            value: statusValue,
            label: statusValue,
          }))}
        />
      </div>
    </article>
  );
};

export default Card;
