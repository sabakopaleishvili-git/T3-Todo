"use client";

import { useState } from "react";

import CreateProjectModal from "_components/CreateProjectModal";

type Project = {
  id: number;
  title: string;
  description: string;
};

const initialProjects: Project[] = [
  {
    id: 1,
    title: "Project 1",
    description: "This is a project description.",
  },
];

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const handleCreateProject = (title: string, description: string) => {
    setProjects((current) => [
      {
        id: Date.now(),
        title,
        description: description || "No description provided.",
      },
      ...current,
    ]);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Projects</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900/70"
          >
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {project.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {project.description}
            </p>
          </div>
        ))}
        <CreateProjectModal onCreate={handleCreateProject} />
      </div>
    </div>
  );
};

export default ProjectsPage;
