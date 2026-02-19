import React, { useState } from "react";
import { api, type RouterOutputs } from "~/trpc/react";
import Dropdown from "./Dropdown";
import Input from "./Input";
import Button from "./Button";
import Loader from "./Loader";
interface IProps {
  users: RouterOutputs["task"]["getAssignableUsers"];
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
      className="grid gap-3 rounded-xl border border-slate-700 bg-slate-900/70 p-3 shadow-xl sm:grid-cols-2 sm:p-4 lg:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault();
        createTask.mutate({
          title,
          description: description || undefined,
          assignedToId: assignedToId || undefined,
        });
      }}
    >
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Task title"
        className="sm:col-span-2 lg:col-span-2"
        required
      />
      <Input
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description (optional)"
      />
      <Dropdown
        value={assignedToId}
        onChange={setAssignedToId}
        className="rounded-md px-3 py-2"
        options={[
          { value: "", label: "Unassigned" },
          ...users.map((user) => ({
            value: user.id,
            label: user.name ?? user.email ?? "Unknown user",
            image: user.image ?? "/people.png",
          })),
        ]}
      />
      <Button
        type="submit"
        className="sm:col-span-2 lg:col-span-4"
        disabled={createTask.isPending}
      >
        {createTask.isPending ? <Loader /> : "Create Task"}
      </Button>
    </form>
  );
};

export default CreateTask;
