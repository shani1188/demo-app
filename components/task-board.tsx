"use client";

import { useMemo, useState } from "react";

export type Task = {
  id: string; title: string; description: string; status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high"; created_at: string;
};

type TaskForm = Pick<Task, "title" | "description" | "status" | "priority">;
const emptyForm: TaskForm = { title: "", description: "", status: "todo", priority: "medium" };

export function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [form, setForm] = useState({ ...emptyForm });
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const shown = useMemo(() => filter === "all" ? tasks : tasks.filter((task) => task.status === filter), [tasks, filter]);

  async function createTask(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const response = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) setError(payload.error?.message ?? "Task could not be created.");
    else { setTasks((current) => [payload.data, ...current]); setForm({ ...emptyForm }); }
    setBusy(false);
  }

  async function updateStatus(task: Task, status: Task["status"]) {
    setError("");
    const response = await fetch(`/api/tasks/${task.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return setError(payload.error?.message ?? "Task could not be updated.");
    setTasks((current) => current.map((item) => item.id === task.id ? payload.data : item));
  }

  async function deleteTask(task: Task) {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    setError("");
    const response = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    if (!response.ok) return setError("Task could not be deleted.");
    setTasks((current) => current.filter((item) => item.id !== task.id));
  }

  return (
    <div className="task-layout">
      <form className="panel form-stack" onSubmit={createTask} data-testid="task-form">
        <h2>Add a task</h2>
        {error && <div className="alert error" role="alert">{error}</div>}
        <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} required data-testid="task-title" /></label>
        <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={1000} data-testid="task-description" /></label>
        <label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Task["priority"] })} data-testid="task-priority"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
        <button className="button primary" disabled={busy} data-testid="task-create">{busy ? "Adding…" : "Add task"}</button>
      </form>
      <section aria-labelledby="task-list-title">
        <div className="dashboard-header" style={{ marginTop: 0 }}>
          <h2 id="task-list-title">Your tasks</h2>
          <label>Filter by status<select value={filter} onChange={(e) => setFilter(e.target.value)} data-testid="task-filter"><option value="all">All tasks</option><option value="todo">To do</option><option value="in_progress">In progress</option><option value="done">Done</option></select></label>
        </div>
        <div className="task-list" data-testid="task-list">
          {shown.map((task) => <article className="task-card" key={task.id} data-testid={`task-${task.id}`}>
            <div><h2>{task.title}</h2>{task.description && <p>{task.description}</p>}<div className="task-meta"><span>{task.priority} priority</span><span>•</span><span>{task.status.replace("_", " ")}</span></div></div>
            <div className="task-actions">
              <label><span className="sr-only">Status for {task.title}</span><select aria-label={`Status for ${task.title}`} value={task.status} onChange={(e) => updateStatus(task, e.target.value as Task["status"])}><option value="todo">To do</option><option value="in_progress">In progress</option><option value="done">Done</option></select></label>
              <button className="icon-button" onClick={() => deleteTask(task)} aria-label={`Delete ${task.title}`}>Delete</button>
            </div>
          </article>)}
          {!shown.length && <div className="empty" data-testid="empty-state">No tasks match this view.</div>}
        </div>
      </section>
    </div>
  );
}
