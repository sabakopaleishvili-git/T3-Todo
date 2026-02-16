import React from "react";
import type { RouterOutputs } from "~/trpc/react";
import { useDraggable } from "@dnd-kit/react";
import Dropdown from "./Dropdown";

type Status = (typeof STATUSES)[number];
const STATUSES = ["CREATED", "IN_PROGRESS", "FINISHED"] as const;

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
  const { ref } = useDraggable({
    id: task.id.toString(),
  });

  return (
    <article ref={ref} className="w-full rounded-lg bg-white/10 p-3">
      <div className="cursor-grab select-none active:cursor-grabbing">
        <p className="font-semibold">{task.title}</p>
      </div>
      {task.description ? (
        <p className="mt-1 text-sm text-white/80">{task.description}</p>
      ) : null}
      <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
        Assigned to:{" "}
        <div className="flex items-center gap-2">
          {task.assignedTo?.image ? (
            <img
              src={task.assignedTo.image}
              alt={
                task.assignedTo.name ?? task.assignedTo.email ?? "Unknown user"
              }
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <img
              className="h-6 w-6 rounded-full bg-white/20 p-1"
              src={"/people.png"}
              alt={
                task.assignedTo?.name ??
                task.assignedTo?.email ??
                "Unknown user"
              }
            />
          )}
          <span className="text-sm">
            {task.assignedTo?.name ?? task.assignedTo?.email ?? "Nobody"}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <Dropdown
          value={task.assignedToId ?? ""}
          onChange={(value) => {
            onAssignTask(task.id, value || null);
          }}
          className="rounded-md bg-white/20 px-2 py-1 text-sm"
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
          className="rounded-md bg-white/20 px-2 py-1 text-sm"
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
