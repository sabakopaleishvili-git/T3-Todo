import { api } from "~/trpc/react";
import React from "react";
import type { RouterOutputs } from "~/trpc/react";

type Status = (typeof STATUSES)[number];
const STATUSES = ["CREATED", "IN_PROGRESS", "FINISHED"] as const;

interface IProps {
  task: RouterOutputs["task"]["list"][number];
  users: RouterOutputs["task"]["getAssignableUsers"];
}
const Card = ({ task, users }: IProps) => {
  const utils = api.useUtils();
  const assignTask = api.task.assign.useMutation({
    onSuccess: async () => {
      await utils.task.invalidate();
    },
  });

  const updateStatus = api.task.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.task.invalidate();
    },
  });

  return (
    <article className="rounded-lg bg-white/10 p-3">
      <p className="font-semibold">{task.title}</p>
      {task.description ? (
        <p className="mt-1 text-sm text-white/80">{task.description}</p>
      ) : null}
      <p className="mt-2 text-xs text-white/70">
        Assigned to:{" "}
        {task.assignedTo?.name ?? task.assignedTo?.email ?? "Nobody"}
      </p>

      <div className="mt-3 flex flex-col gap-2">
        <select
          value={task.assignedToId ?? ""}
          onChange={(event) => {
            assignTask.mutate({
              taskId: task.id,
              assignedToId: event.target.value || null,
            });
          }}
          className="rounded-md bg-white/20 px-2 py-1 text-sm"
          disabled={assignTask.isPending}
        >
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name ?? user.email ?? "Unknown user"}
            </option>
          ))}
        </select>

        <select
          value={task.status}
          onChange={(event) => {
            updateStatus.mutate({
              taskId: task.id,
              status: event.target.value as Status,
            });
          }}
          className="rounded-md bg-white/20 px-2 py-1 text-sm"
          disabled={updateStatus.isPending}
        >
          {STATUSES.map((statusValue) => (
            <option key={statusValue} value={statusValue}>
              {statusValue}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
};

export default Card;
