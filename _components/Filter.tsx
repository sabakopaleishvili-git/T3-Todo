import React, { useState } from "react";
import Dropdown from "./Dropdown";
import type { RouterOutputs } from "~/trpc/react";

interface IProps {
  users: RouterOutputs["task"]["getAssignableUsers"];
  handleFilterTasks: (userId: string) => void;
}

const Filter = ({ users, handleFilterTasks }: IProps) => {
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const options = [
    { value: "all", label: "All users" },
    ...users.map((user) => ({
      value: user.id,
      label: user.name ?? user.email ?? "Unknown user",
      image: user.image ?? "/people.png",
    })),
  ];

  const handleChange = (value: string) => {
    setSelectedUser(value);
    handleFilterTasks(value);
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white/90 px-2.5 py-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900/75">
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium tracking-wide text-slate-500 uppercase dark:bg-slate-800 dark:text-slate-400">
        Filter
      </span>

      <div id="filter-user" className="w-[180px]">
        <Dropdown
          value={selectedUser}
          onChange={handleChange}
          options={options}
        />
      </div>
    </div>
  );
};

export default Filter;
