import React from "react";
import type { RouterOutputs } from "~/trpc/react";
import Card from "./Card";

type TaskStatus = RouterOutputs["task"]["list"][number]["status"];

interface IProps {
  status: TaskStatus;
  tasks: RouterOutputs["task"]["list"];
  users: RouterOutputs["task"]["getAssignableUsers"];
}
const Column = ({ status, tasks, users }: IProps) => {
  const generateTasks = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div
      key={status}
      className="h-max min-h-[200px] flex-1 rounded-xl bg-white/10 p-4"
    >
      <h2 className="mb-3 text-xl font-semibold">{status}</h2>

      <div className="flex flex-col gap-3">
        {generateTasks(status as TaskStatus).length === 0 ? (
          <p className="text-sm text-white/70">No tasks yet</p>
        ) : (
          generateTasks(status as TaskStatus).map((item) => (
            <Card key={item.id} task={item} users={users} />
          ))
        )}
      </div>
    </div>
  );
};

export default Column;
