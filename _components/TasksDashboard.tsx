"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { api, type RouterOutputs } from "~/trpc/react";
import Column from "./Column";
import CreateTask from "./CreateTask";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import CardPreview from "./CardPreview";
import Filter from "./Filter";
import Dropdown from "./Dropdown";
import Button from "./Button";

type TaskStatus = RouterOutputs["task"]["list"][number]["status"];
const EMPTY_TASKS: RouterOutputs["task"]["list"] = [];
const EMPTY_USERS: RouterOutputs["task"]["getAssignableUsers"] = [];

interface TasksDashboardProps {
  initialProjectId: number | null;
}

const TasksDashboard = ({ initialProjectId }: TasksDashboardProps) => {
  const utils = api.useUtils();
  const { data: projects = [] } = api.project.listMine.useQuery();
  const { data: pendingInvitations = [] } =
    api.project.listPendingInvitations.useQuery();

  const [selectedProjectId, setSelectedProjectId] = React.useState<
    number | null
  >(initialProjectId);
  const [optimisticTasks, setOptimisticTasks] = React.useState<
    RouterOutputs["task"]["list"]
  >([]);
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
  const respondInvitation = api.project.respondToInvitation.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.project.listMine.invalidate(),
        utils.project.listPendingInvitations.invalidate(),
      ]);
    },
  });

  useEffect(() => {
    if (projects.length === 0) {
      if (selectedProjectId !== null) {
        setSelectedProjectId(null);
      }
      return;
    }

    const projectExists = projects.some(
      (project) => project.id === selectedProjectId,
    );
    if (selectedProjectId && projectExists) {
      return;
    }

    const preferredProject = initialProjectId
      ? projects.find((project) => project.id === initialProjectId)
      : undefined;
    const nextProjectId = preferredProject?.id ?? projects[0]?.id ?? null;

    if (nextProjectId !== selectedProjectId) {
      setSelectedProjectId(nextProjectId);
    }
  }, [initialProjectId, projects, selectedProjectId]);

  const { data: tasksData } = api.task.list.useQuery(
    { projectId: selectedProjectId ?? -1 },
    {
      enabled: !!selectedProjectId,
      staleTime: 5_000,
    },
  );
  const { data: usersData } = api.task.getAssignableUsers.useQuery(
    { projectId: selectedProjectId ?? -1 },
    {
      enabled: !!selectedProjectId,
      staleTime: 5_000,
    },
  );
  const tasks = tasksData ?? EMPTY_TASKS;
  const users = usersData ?? EMPTY_USERS;

  useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    let activeSocket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let isUnmounted = false;

    const connect = () => {
      const fallbackSocketUrl = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:3001/ws`;
      const realtimeUrl =
        process.env.NEXT_PUBLIC_REALTIME_URL ?? fallbackSocketUrl;

      activeSocket = new WebSocket(realtimeUrl);
      const currentProjectId = selectedProjectId;
      const roomName = currentProjectId ? `project:${currentProjectId}` : null;

      activeSocket.onopen = () => {
        if (roomName) {
          activeSocket?.send(
            JSON.stringify({ type: "subscribe", room: roomName }),
          );
        }
      };

      activeSocket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data as string) as {
            type?: string;
            projectId?: number;
          };

          if (payload.type === "task.changed") {
            if (payload.projectId === currentProjectId) {
              void utils.task.invalidate();
            }
          }

          if (payload.type === "project.invitation.created") {
            void utils.project.listPendingInvitations.invalidate();
            void utils.project.listMine.invalidate();
          }
        } catch {
          // Ignore malformed websocket messages.
        }
      };

      activeSocket.onerror = () => {
        activeSocket?.close();
      };

      activeSocket.onclose = () => {
        if (!isUnmounted) {
          reconnectTimer = setTimeout(connect, 1500);
        }
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      const roomName = selectedProjectId
        ? `project:${selectedProjectId}`
        : null;
      if (roomName && activeSocket?.readyState === WebSocket.OPEN) {
        activeSocket.send(
          JSON.stringify({ type: "unsubscribe", room: roomName }),
        );
      }
      activeSocket?.close();
    };
  }, [selectedProjectId, utils]);

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
        projectId: selectedProjectId ?? -1,
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
    if (!selectedProjectId) {
      return;
    }
    setPendingAssignTaskId(taskId);
    assignTask.mutate(
      {
        projectId: selectedProjectId,
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

  const handleFilterTasks = (userId: string) => {
    if (userId === "all") {
      setOptimisticTasks(tasks);
      return;
    }
    setOptimisticTasks(tasks.filter((task) => task.assignedToId === userId));
  };

  return (
    <div className="flex w-full flex-col gap-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Tasks Board
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Each project has its own room. Switch projects to collaborate in
          isolated realtime channels.
        </p>
      </div>
      {pendingInvitations.length > 0 ? (
        <div className="rounded-xl border border-blue-400/40 bg-blue-500/10 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold">
                You have {pendingInvitations.length} pending invitation
                {pendingInvitations.length > 1 ? "s" : ""}
              </h2>
              <p className="text-sm text-slate-200">
                Invitation alerts always arrive directly to your user room.
              </p>
            </div>
            <Link
              href="/projects"
              className="inline-flex rounded-md border border-blue-500/40 bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Manage invitations
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {pendingInvitations.slice(0, 3).map((invitation) => (
              <div
                key={invitation.id}
                className="rounded-md border border-slate-200 bg-white/80 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/70"
              >
                <p className="font-medium">{invitation.project.title}</p>
                <div className="mt-2 flex gap-2">
                  <Button
                    className="px-2 py-1 text-xs"
                    onClick={() =>
                      respondInvitation.mutate({
                        invitationId: invitation.id,
                        decision: "ACCEPTED",
                      })
                    }
                    disabled={respondInvitation.isPending}
                  >
                    Accept
                  </Button>
                  <Button
                    className="border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80"
                    onClick={() =>
                      respondInvitation.mutate({
                        invitationId: invitation.id,
                        decision: "DECLINED",
                      })
                    }
                    disabled={respondInvitation.isPending}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900/70">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-md">
            <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Active project room
            </p>
            <Dropdown
              value={selectedProjectId ? String(selectedProjectId) : ""}
              onChange={(value) =>
                setSelectedProjectId(value ? Number(value) : null)
              }
              options={[
                {
                  value: "",
                  label: projects.length ? "Select project" : "No projects yet",
                },
                ...projects.map((project) => ({
                  value: String(project.id),
                  label: project.title,
                })),
              ]}
            />
          </div>
          <Link
            href="/projects"
            className="inline-flex rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80"
          >
            Open projects
          </Link>
        </div>
      </div>
      {selectedProjectId ? (
        <CreateTask users={users} projectId={selectedProjectId} />
      ) : null}
      {selectedProjectId ? (
        <Filter handleFilterTasks={handleFilterTasks} users={users} />
      ) : null}
      {!selectedProjectId ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Select a project to load its dedicated task room.
        </div>
      ) : null}
      <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
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
              projectId={selectedProjectId}
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
