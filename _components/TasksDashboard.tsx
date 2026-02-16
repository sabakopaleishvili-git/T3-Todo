"use client";

import React, { useEffect } from "react";
import { api, type RouterOutputs } from "~/trpc/react";
import Column from "./Column";
import CreateTask from "./CreateTask";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import CardPreview from "./CardPreview";

type TaskStatus = RouterOutputs["task"]["list"][number]["status"];

const TasksDashboard = () => {
  const [tasks] = api.task.list.useSuspenseQuery();
  const [users] = api.task.getAssignableUsers.useSuspenseQuery();
  const utils = api.useUtils();
  const [optimisticTasks, setOptimisticTasks] = React.useState(tasks);
  const [activeTaskId, setActiveTaskId] = React.useState<string | null>(null);
  const [pendingAssignTaskId, setPendingAssignTaskId] = React.useState<
    number | null
  >(null);
  const [pendingStatusTaskId, setPendingStatusTaskId] = React.useState<
    number | null
  >(null);

  const statuses: TaskStatus[] = ["CREATED", "IN_PROGRESS", "FINISHED"];
  const assignTask = api.task.assign.useMutation();
  const updateStatus = api.task.updateStatus.useMutation();

  useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);

  const handleDragStart = (
    event: Parameters<
      NonNullable<React.ComponentProps<typeof DragDropProvider>["onDragStart"]>
    >[0],
  ) => {
    const sourceId = event.operation.source?.id;
    setActiveTaskId(sourceId ? String(sourceId) : null);
  };

  const updateTaskStatus = (taskId: number, nextStatus: TaskStatus) => {
    const currentTask = optimisticTasks.find((task) => task.id === taskId);

    if (!currentTask || currentTask.status === nextStatus) {
      return;
    }

    const previousStatus = currentTask.status;
    setPendingStatusTaskId(taskId);

    setOptimisticTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus } : task,
      ),
    );

    updateStatus.mutate(
      {
        taskId,
        status: nextStatus,
      },
      {
        onError: () => {
          setOptimisticTasks((previousTasks) =>
            previousTasks.map((task) =>
              task.id === taskId ? { ...task, status: previousStatus } : task,
            ),
          );
        },
        onSettled: async () => {
          setPendingStatusTaskId((currentId) =>
            currentId === taskId ? null : currentId,
          );
          await utils.task.invalidate();
        },
      },
    );
  };

  const handleAssignTask = (taskId: number, assignedToId: string | null) => {
    setPendingAssignTaskId(taskId);
    assignTask.mutate(
      {
        taskId,
        assignedToId,
      },
      {
        onSettled: async () => {
          setPendingAssignTaskId((currentId) =>
            currentId === taskId ? null : currentId,
          );
          await utils.task.invalidate();
        },
      },
    );
  };

  const handleDragEnd = (
    event: Parameters<
      NonNullable<React.ComponentProps<typeof DragDropProvider>["onDragEnd"]>
    >[0],
  ) => {
    setActiveTaskId(null);

    if (event.canceled) {
      return;
    }

    const sourceId = event.operation.source?.id;
    const nextStatus = event.operation.target?.id as TaskStatus | undefined;

    if (!sourceId || !nextStatus || !statuses.includes(nextStatus)) {
      return;
    }

    const currentTask = optimisticTasks.find(
      (task) => String(task.id) === String(sourceId),
    );

    if (!currentTask || currentTask.status === nextStatus) {
      return;
    }

    updateTaskStatus(currentTask.id, nextStatus);
  };

  const activeTask = optimisticTasks.find(
    (task) => String(task.id) === activeTaskId,
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 text-white">
      <h1 className="text-3xl font-bold">Tasks</h1>
      <CreateTask users={users} />
      <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex w-full gap-4">
          {statuses.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={optimisticTasks}
              users={users}
              onAssignTask={handleAssignTask}
              onUpdateStatus={updateTaskStatus}
              pendingAssignTaskId={pendingAssignTaskId}
              pendingStatusTaskId={pendingStatusTaskId}
            />
          ))}
        </div>
        <DragOverlay className="pointer-events-none">
          {activeTask ? <CardPreview task={activeTask} users={users} /> : null}
        </DragOverlay>
      </DragDropProvider>
    </div>
  );
};

export default TasksDashboard;
