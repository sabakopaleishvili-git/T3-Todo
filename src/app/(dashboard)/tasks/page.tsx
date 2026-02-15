import { TaskBoard } from "_components/Tasks";
import { api, HydrateClient } from "~/trpc/server";

export default async function TasksPage() {
  void api.task.list.prefetch();
  void api.task.getAssignableUsers.prefetch();

  return (
    <HydrateClient>
      <main>
        <TaskBoard />
      </main>
    </HydrateClient>
  );
}
