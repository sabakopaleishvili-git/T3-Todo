import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

const page = async () => {
  const session = await auth();
  if (session?.user) {
    redirect("/tasks");
  }
  redirect("/auth");
};

export default page;
