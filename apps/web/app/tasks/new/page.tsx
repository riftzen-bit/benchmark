import { redirect } from "next/navigation";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { getUser } from "@/lib/auth/session";
import { listCategories } from "@/lib/db/queries/models";
import { NewTaskForm } from "./new-task-form";

export const metadata = { title: "New task" };

export default async function NewTaskPage() {
  const user = await getUser();
  if (!user) redirect("/sign-in?next=/tasks/new");
  const categories = await listCategories();
  return (
    <Container width="narrow" className="py-12">
      <Eyebrow className="mb-6">New benchmark task</Eyebrow>
      <NewTaskForm categories={categories} />
    </Container>
  );
}
