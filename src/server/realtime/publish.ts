type TaskChangedAction = "create" | "assign" | "status" | "details" | "delete";

interface PublishTaskChangedInput {
  action: TaskChangedAction;
  taskId: number;
  projectId: number;
  updatedAt: Date;
}

const REALTIME_URL = process.env.REALTIME_URL ?? "http://127.0.0.1:3001";
const REALTIME_INTERNAL_SECRET = process.env.REALTIME_INTERNAL_SECRET;

const publishEvent = (payload: Record<string, unknown>) => {
  if (!REALTIME_INTERNAL_SECRET) {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);

  void fetch(`${REALTIME_URL}/emit`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-realtime-secret": REALTIME_INTERNAL_SECRET,
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
    .catch(() => {
      // Keep writes independent from realtime transport failures.
    })
    .finally(() => {
      clearTimeout(timeout);
    });
};

export const publishTaskChanged = ({
  action,
  taskId,
  projectId,
  updatedAt,
}: PublishTaskChangedInput) => {
  publishEvent({
    type: "task.changed",
    action,
    taskId,
    projectId,
    updatedAt: updatedAt.toISOString(),
    room: `project:${projectId}`,
  });
};

interface PublishProjectInvitationCreatedInput {
  invitationId: number;
  projectId: number;
  projectTitle: string;
  invitedByName: string;
  invitedByEmail: string | null;
  invitedUserId: string;
  invitedUserEmail: string | null;
}

export const publishProjectInvitationCreated = ({
  invitationId,
  projectId,
  projectTitle,
  invitedByName,
  invitedByEmail,
  invitedUserId,
  invitedUserEmail,
}: PublishProjectInvitationCreatedInput) => {
  publishEvent({
    type: "project.invitation.created",
    invitationId,
    projectId,
    projectTitle,
    invitedByName,
    invitedByEmail,
    invitedUserId,
    invitedUserEmail,
    room: `user:${invitedUserId}`,
  });
};
