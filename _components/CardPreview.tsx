import React from "react";
import type { RouterOutputs } from "~/trpc/react";
import Dropdown from "./Dropdown";

type Status = "CREATED" | "IN_PROGRESS" | "FINISHED";
const STATUSES: Status[] = ["CREATED", "IN_PROGRESS", "FINISHED"];

interface IProps {
  task: RouterOutputs["task"]["list"][number];
  users: RouterOutputs["task"]["getAssignableUsers"];
}

const CardPreview = ({ task, users }: IProps) => {
  return (
    <article className="w-[280px] rounded-lg border border-slate-700 bg-slate-800/90 p-3 shadow-lg">
      <div className="select-none">
        <p className="font-semibold text-slate-100">{task.title}</p>
      </div>

      {task.description ? (
        <p className="mt-1 text-sm text-slate-300">{task.description}</p>
      ) : null}

      <p className="mt-2 text-xs text-slate-400">
        Assigned to:{" "}
        {task.assignedTo?.name ?? task.assignedTo?.email ?? "Nobody"}
      </p>

      <div className="mt-3 flex flex-col gap-2">
        <Dropdown
          value={task.assignedToId ?? ""}
          className="pointer-events-none rounded-md px-2 py-1 text-sm"
          disabled
          options={[
            { value: "", label: "Unassigned" },
            ...users.map((user) => ({
              value: user.id,
              label: user.name ?? user.email ?? "Unknown user",
            })),
          ]}
        />

        <Dropdown
          value={task.status}
          className="pointer-events-none rounded-md px-2 py-1 text-sm"
          disabled
          options={STATUSES.map((statusValue) => ({
            value: statusValue,
            label: statusValue,
          }))}
        />
      </div>
    </article>
  );
};

export default CardPreview;
