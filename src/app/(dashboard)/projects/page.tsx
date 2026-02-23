"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import CreateProjectModal from "_components/CreateProjectModal";
import Dropdown from "_components/Dropdown";
import Button from "_components/Button";
import { api } from "~/trpc/react";

const ProjectsPage = () => {
  const utils = api.useUtils();
  const { data: projects = [] } = api.project.listMine.useQuery();
  const { data: invitations = [] } = api.project.listPendingInvitations.useQuery();
  const { data: invitableUsers = [] } = api.project.listInvitableUsers.useQuery();
  const createProject = api.project.create.useMutation({
    onSuccess: async () => {
      await utils.project.listMine.invalidate();
    },
  });
  const createInvitation = api.project.createInvitation.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.project.listMine.invalidate(),
        utils.project.listPendingInvitations.invalidate(),
      ]);
    },
  });
  const respondInvitation = api.project.respondToInvitation.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.project.listMine.invalidate(),
        utils.project.listPendingInvitations.invalidate(),
      ]);
    },
  });

  const [inviteUserIdsByProject, setInviteUserIdsByProject] = useState<
    Record<number, string>
  >({});
  const [sendingInviteProjectId, setSendingInviteProjectId] = useState<
    number | null
  >(null);

  useEffect(() => {
    let activeSocket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let isUnmounted = false;

    const connect = () => {
      const fallbackSocketUrl = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:3001/ws`;
      const realtimeUrl =
        process.env.NEXT_PUBLIC_REALTIME_URL ?? fallbackSocketUrl;

      activeSocket = new WebSocket(realtimeUrl);
      activeSocket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data as string) as { type?: string };
          if (payload.type === "project.invitation.created") {
            void utils.project.listPendingInvitations.invalidate();
            void utils.project.listMine.invalidate();
          }
        } catch {
          // Ignore malformed websocket messages.
        }
      };
      activeSocket.onerror = () => activeSocket?.close();
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
      activeSocket?.close();
    };
  }, [utils]);

  const pendingInvitationByProject = useMemo(() => {
    return new Set(invitations.map((invite) => invite.project.id));
  }, [invitations]);

  const handleCreateProject = async (
    title: string,
    description: string,
    inviteEmails: string[],
  ) => {
    const project = await createProject.mutateAsync({
      title,
      description: description || undefined,
    });

    for (const invitedEmail of inviteEmails) {
      try {
        await createInvitation.mutateAsync({
          projectId: project.id,
          invitedEmail,
        });
      } catch {
        // Keep project creation successful even if one invitation fails.
      }
    }
  };

  const handleInvite = async (projectId: number) => {
    const userId = inviteUserIdsByProject[projectId] ?? "";
    if (!userId) {
      return;
    }

    const selectedUser = invitableUsers.find((user) => user.id === userId);
    const email = selectedUser?.email?.trim().toLowerCase();
    if (!email) {
      return;
    }

    setSendingInviteProjectId(projectId);
    try {
      await createInvitation.mutateAsync({
        projectId,
        invitedEmail: email,
      });
      setInviteUserIdsByProject((current) => ({ ...current, [projectId]: "" }));
    } finally {
      setSendingInviteProjectId((current) =>
        current === projectId ? null : current,
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Create private projects, invite teammates, and switch task rooms per project.
        </p>
      </div>

      {invitations.length > 0 ? (
        <section className="rounded-xl border border-blue-400/40 bg-blue-500/10 p-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Pending invitations ({invitations.length})
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/70 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {invitation.project.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Invited by{" "}
                    {invitation.invitedBy.name ??
                      invitation.invitedBy.email ??
                      "A teammate"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() =>
                      respondInvitation.mutate({
                        invitationId: invitation.id,
                        decision: "DECLINED",
                      })
                    }
                    disabled={respondInvitation.isPending}
                    className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80"
                  >
                    Decline
                  </Button>
                  <Button
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
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          (() => {
            const availableUsers = invitableUsers.filter(
              (user) =>
                !!user.email &&
                !project.members.some((member) => member.userId === user.id),
            );

            return (
              <div
                key={project.id}
                className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900/70"
              >
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  {project.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {project.description ?? "No description provided."}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {project._count.members} members · {project._count.tasks} tasks
                </p>
                <Link
                  href={`/tasks?projectId=${project.id}`}
                  className="mt-4 inline-flex rounded-md border border-blue-500/40 bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Open tasks
                </Link>
                <form
                  className="mt-4 space-y-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleInvite(project.id);
                  }}
                >
                  <Dropdown
                    value={inviteUserIdsByProject[project.id] ?? ""}
                    disabled={sendingInviteProjectId === project.id}
                    onChange={(value) =>
                      setInviteUserIdsByProject((current) => ({
                        ...current,
                        [project.id]: value,
                      }))
                    }
                    options={[
                      {
                        value: "",
                        label: availableUsers.length
                          ? "Select user to invite"
                          : "No available users to invite",
                      },
                      ...availableUsers.map((user) => ({
                        value: user.id,
                        label: user.name ?? user.email ?? "Unknown user",
                        image: user.image ?? "/people.png",
                      })),
                    ]}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      sendingInviteProjectId === project.id ||
                      !inviteUserIdsByProject[project.id] ||
                      availableUsers.length === 0
                    }
                  >
                    {sendingInviteProjectId === project.id
                      ? "Sending..."
                      : "Send invitation"}
                  </Button>
                </form>
                {pendingInvitationByProject.has(project.id) ? (
                  <p className="mt-2 text-xs text-blue-300">
                    You have a pending invitation in this project.
                  </p>
                ) : null}
              </div>
            );
          })()
        ))}
        <CreateProjectModal
          onCreate={handleCreateProject}
          invitableUsers={invitableUsers}
        />
      </div>
    </div>
  );
};

export default ProjectsPage;
