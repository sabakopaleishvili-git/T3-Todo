"use client";

import React from "react";
import { api, type RouterOutputs } from "~/trpc/react";
import Column from "./Column";
import CreateTask from "./CreateTask";

type TaskStatus = RouterOutputs["task"]["list"][number]["status"];

export const TaskBoard = () => {
  const [tasks] = api.task.list.useSuspenseQuery();
  const [users] = api.task.getAssignableUsers.useSuspenseQuery();

  const statuses: TaskStatus[] = ["CREATED", "IN_PROGRESS", "FINISHED"];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 text-white">
      <h1 className="text-3xl font-bold">Tasks</h1>
      <CreateTask users={users} />
      <div className="flex w-full gap-4">
        {statuses.map((status) => (
          <Column key={status} status={status} tasks={tasks} users={users} />
        ))}
      </div>
    </div>
  );
};
