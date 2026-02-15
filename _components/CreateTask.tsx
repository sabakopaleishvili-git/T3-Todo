import type { User } from "@auth/core/types";
import React, { useState } from "react";
import { api } from "~/trpc/react";
interface IProps {
  users: Array<User>;
}
const CreateTask = ({ users }: IProps) => {
  const utils = api.useUtils();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToId, setAssignedToId] = useState<string>("");
  const createTask = api.task.create.useMutation({
    onSuccess: async () => {
      setTitle("");
      setDescription("");
      setAssignedToId("");
      await utils.task.invalidate();
    },
  });
  return (
    <form
      className="grid gap-3 rounded-xl bg-white/10 p-4 md:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault();
        createTask.mutate({
          title,
          description: description || undefined,
          assignedToId: assignedToId || undefined,
        });
      }}
    >
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Task title"
        className="rounded-md bg-white/20 px-3 py-2 md:col-span-2"
        required
      />
      <input
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description (optional)"
        className="rounded-md bg-white/20 px-3 py-2"
      />
      <select
        value={assignedToId}
        onChange={(event) => setAssignedToId(event.target.value)}
        className="rounded-md bg-white/20 px-3 py-2"
      >
        <option value="">Unassigned</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name ?? user.email ?? "Unknown user"}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-white/20 px-4 py-2 font-semibold hover:bg-white/30 md:col-span-4"
        disabled={createTask.isPending}
      >
        {createTask.isPending ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
};

export default CreateTask;
