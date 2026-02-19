import { api, HydrateClient } from "~/trpc/server";
import TasksDashboard from "_components/TasksDashboard";

export default async function TasksPage() {
  void api.task.list.prefetch();
  void api.task.getAssignableUsers.prefetch();

  return (
    <HydrateClient>
      <div>
        <TasksDashboard />
      </div>
    </HydrateClient>
  );
}
