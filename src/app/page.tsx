import { redirect } from "next/navigation";

const page = () => {
  redirect("/auth");
  return <div>page</div>;
};

export default page;
