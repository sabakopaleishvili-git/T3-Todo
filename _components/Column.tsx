import React from "react";
import type { RouterOutputs } from "~/trpc/react";
import Card from "./Card";
import { useDroppable } from "@dnd-kit/react";

type TaskStatus = RouterOutputs["task"]["list"][number]["status"];
type Status = "CREATED" | "IN_PROGRESS" | "FINISHED";

interface IProps {
  status: TaskStatus;
  tasks: RouterOutputs["task"]["list"];
  users: RouterOutputs["task"]["getAssignableUsers"];
  onAssignTask: (taskId: number, assignedToId: string | null) => void;
  onUpdateStatus: (taskId: number, status: Status) => void;
  pendingAssignTaskId: number | null;
  pendingStatusTaskId: number | null;
}
const Column = ({
  status,
  tasks,
  users,
  onAssignTask,
  onUpdateStatus,
  pendingAssignTaskId,
  pendingStatusTaskId,
}: IProps) => {
  const { ref } = useDroppable({
    id: status,
  });
  const generateTasks = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div
      ref={ref}
      className="h-max min-h-[180px] w-full rounded-xl bg-white/10 p-3 sm:min-h-[200px] sm:p-4"
    >
      <h2 className="mb-3 text-lg font-semibold sm:text-xl">{status}</h2>

      <div className="flex w-full flex-col gap-3">
        {generateTasks(status as TaskStatus).length === 0 ? (
          <p className="text-sm text-white/70">No tasks yet</p>
        ) : (
          generateTasks(status as TaskStatus).map((item) => (
            <Card
              key={item.id}
              task={item}
              users={users}
              onAssignTask={onAssignTask}
              onUpdateStatus={onUpdateStatus}
              isAssignPending={pendingAssignTaskId === item.id}
              isStatusPending={pendingStatusTaskId === item.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Column;
