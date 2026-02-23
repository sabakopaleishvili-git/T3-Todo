import { api, HydrateClient } from "~/trpc/server";
import TasksDashboard from "_components/TasksDashboard";

interface TasksPageProps {
  searchParams: Promise<{
    projectId?: string;
  }>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const projectId = Number(params.projectId);
  const hasProjectId = Number.isInteger(projectId) && projectId > 0;

  void api.project.listMine.prefetch();
  void api.project.listPendingInvitations.prefetch();

  if (hasProjectId) {
    void api.task.list.prefetch({ projectId });
    void api.task.getAssignableUsers.prefetch({ projectId });
  }

  return (
    <HydrateClient>
      <div>
        <TasksDashboard initialProjectId={hasProjectId ? projectId : null} />
      </div>
    </HydrateClient>
  );
}
