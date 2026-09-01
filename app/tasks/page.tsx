import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import { TaskBoard, type Task } from "@/components/task-board";

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
  return <section className="dashboard">
    <div className="dashboard-header"><div><p className="eyebrow">Private workspace</p><h1>Task board</h1><p data-testid="signed-in-user">Signed in as {user.email}</p></div><form action={logout}><button className="button secondary" data-testid="logout">Sign out</button></form></div>
    <TaskBoard initialTasks={(data ?? []) as Task[]} />
  </section>;
}

