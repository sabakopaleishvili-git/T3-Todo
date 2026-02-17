type TaskChangedAction = "create" | "assign" | "status" | "details" | "delete";

interface PublishTaskChangedInput {
  action: TaskChangedAction;
  taskId: number;
  updatedAt: Date;
}

const REALTIME_URL = process.env.REALTIME_URL ?? "http://127.0.0.1:3001";
const REALTIME_INTERNAL_SECRET = process.env.REALTIME_INTERNAL_SECRET;
const DEFAULT_ROOM = "tasks:global";

export const publishTaskChanged = ({
  action,
  taskId,
  updatedAt,
}: PublishTaskChangedInput) => {
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
    body: JSON.stringify({
      type: "task.changed",
      action,
      taskId,
      updatedAt: updatedAt.toISOString(),
      room: DEFAULT_ROOM,
    }),
    signal: controller.signal,
  })
    .catch(() => {
      // Keep task writes independent from realtime transport failures.
    })
    .finally(() => {
      clearTimeout(timeout);
    });
};
